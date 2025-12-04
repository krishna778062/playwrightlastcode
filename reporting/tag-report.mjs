/**
 * Tag Report Generator
 * This generates tag-based test reports from existing test results.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateHTML } from './tag-report-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base paths for common operations
const BASE_PATHS = {
  ROOT: path.join(__dirname, '..'),
  TEST_RESULTS: path.join(__dirname, '..', 'test-results'),
  PLAYWRIGHT_REPORT: path.join(__dirname, '..', 'playwright-report'),
  PG_ENV: path.join(__dirname, '..', 'pg.env'),
};

/**
 * Check if a tag is priority tag like P0, P1, P2, P3
 */
export function isPriorityTag(tag) {
  return /^@?p[0-7]$/i.test(tag);
}

/**
 * Convert timestamp to readable date format with timezone
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  const timeZone = process.env.CI ? 'Asia/Kolkata' : undefined;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
    timeZone: timeZone,
  });
}

/**
 * Convert milliseconds to readable time format like "2m 30s"
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
}

/**
 * Process test suites recursively - shared function for both tag stats and known failures
 */
function processSuites(suites, callback) {
  suites.forEach(suite => {
    if (suite.specs) {
      suite.specs.forEach(spec => {
        callback(suite, spec);
      });
    }

    // Process nested suites recursively
    if (suite.suites) {
      processSuites(suite.suites, callback);
    }
  });
}

/**
 * Check if test has known failure annotation
 */
function hasKnownFailureAnnotation(annotations) {
  return annotations?.some(annotation => annotation.type === 'known_failure') || false;
}

/**
 * Extract tag statistics from test results
 */
function extractTagStatistics(testResults) {
  const tagStats = {};
  const FAILURE_STATUSES = ['failed', 'timedOut', 'interrupted'];

  processSuites(testResults.suites, (suite, spec) => {
    // Collect all tags (from spec.tags and @tags in title)
    const rawTags = [...(spec.tags || []), ...((spec.title || '').match(/@\w+/g) || [])];
    const normalizedTags = rawTags.map(tag => (tag.startsWith('@') ? tag : `@${tag}`));
    const tags = new Set(normalizedTags);

    tags.forEach(tag => {
      // Initialize tag stats if not exists
      tagStats[tag] ??= { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0, knownFailures: 0 };

      spec.tests?.forEach(test => {
        const results = test.results || [];
        if (results.length === 0) return; // Skip if no results

        const lastResult = results[results.length - 1]; // Get final result
        const hadFailure = results.some(r => FAILURE_STATUSES.includes(r.status));
        const isKnownFailure = hasKnownFailureAnnotation(lastResult.annotations);

        tagStats[tag].total++;

        // Count by status
        if (lastResult.status === 'passed' && hadFailure) {
          tagStats[tag].flaky++; // Passed but had failures = flaky
        } else if (lastResult.status === 'passed') {
          tagStats[tag].passed++;
        } else if (FAILURE_STATUSES.includes(lastResult.status)) {
          tagStats[tag].failed++;
          if (isKnownFailure) tagStats[tag].knownFailures++; // Track known failures separately
        } else if (lastResult.status === 'skipped') {
          tagStats[tag].skipped++;
        }
      });
    });
  });

  return tagStats;
}

/**
 * Extract known failure data from test results
 * Detects known failures from:
 * 1. @known-failure tag in test title/tags
 * 2. known_failure annotation type
 */
function extractKnownFailures(testResults) {
  const knownFailures = [];
  const resolvedKnownFailures = [];

  processSuites(testResults.suites, (suite, spec) => {
    // Check if this spec has @known-failure tag
    const hasKnownFailureTag =
      spec.tags?.includes('known-failure') || spec.title?.toLowerCase().includes('@known-failure');

    if (!hasKnownFailureTag) return;

    spec.tests?.forEach(test => {
      // Get the last result (most recent run)
      const lastResult = test.results?.[test.results.length - 1];
      const testStatus = lastResult?.status || test.status || 'unknown';

      // Collect all annotations from test and last result
      const allAnnotations = [...(test.annotations || []), ...(lastResult?.annotations || [])];

      // Check if we have detailed annotations to parse
      const hasDetailedAnnotations = allAnnotations.some(
        a => a.type === 'bug_ticket' || a.type === 'known_failure_priority' || a.type === 'zephyrId'
      );

      // Build known failure data using parseKnownFailureAnnotation if we have detailed annotations
      let knownFailureData;
      if (hasDetailedAnnotations) {
        knownFailureData = parseKnownFailureAnnotation(allAnnotations, spec, suite, test);
      } else {
        // Fallback to basic extraction from title
        knownFailureData = {
        testName: spec.title || 'Unknown Test',
        testCaseNo: `TC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        testId: spec.id || '',
        suiteName: suite?.title || 'Unknown Suite',
        specFile: spec.file || '',
        ticketId: extractTicketFromTitle(spec.title),
        ticketUrl: '',
        priority: 'Medium',
        bugReportedDate: 'Unknown',
      };
      }

      // Check if this known failure test is now passing (resolved)
      if (testStatus === 'passed') {
        resolvedKnownFailures.push({
          ...knownFailureData,
          status: 'resolved',
          resolvedDate: new Date().toISOString(),
        });
      } else if (testStatus === 'failed' || testStatus === 'timedOut') {
        knownFailures.push(knownFailureData);
      }
      // Skip tests with status 'skipped' - they didn't run
    });
  });

  return {
    activeKnownFailures: removeDuplicateFailures(knownFailures),
    resolvedKnownFailures: removeDuplicateFailures(resolvedKnownFailures),
  };
}

/**
 * Extract ticket ID from test title (e.g., "JIRA-1234" from description)
 */
function extractTicketFromTitle(title) {
  if (!title) return '';
  const match = title.match(/([A-Z]+-\d+)/);
  return match ? match[1] : '';
}

/**
 * Parse known failure annotations to extract details
 */
function parseKnownFailureAnnotation(annotations, spec, suite, test) {
  // Extract data from separate annotation types
  let bugTicket = '';
  let zephyrTestId = '';
  let note = '';
  let bugReportedDate = '';
  let priority = '';

  annotations.forEach(annotation => {
    switch (annotation.type) {
      case 'bug_ticket':
        bugTicket = annotation.description || '';
        break;
      case 'bug_reported_date':
        bugReportedDate = annotation.description || '';
        break;
      case 'known_failure_priority':
        priority = annotation.description || '';
        break;
      case 'known_failure_note':
        note = annotation.description || '';
        break;
      case 'zephyrId':
        const fullUrl = annotation.description || '';
        zephyrTestId = fullUrl.split('/').pop() || fullUrl;
        break;
    }
  });

  // Extract ticket ID from URL if it's a Jira link
  let ticketId = bugTicket;
  if (bugTicket.includes('browse/')) {
    const match = bugTicket.match(/browse\/([A-Z]+-\d+)/);
    if (match) ticketId = match[1];
  }

  // Extract the full spec file name from the path
  const specFileName = spec.file ? spec.file.split('/').pop() : 'Unknown Spec';

  return {
    testName: spec.title || 'Unknown Test',
    testCaseNo: zephyrTestId || `TC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    testId: test?.id || spec?.id || '', // Include test ID for Playwright report linking
    ticketId: ticketId,
    ticketUrl: bugTicket,
    note: note,
    bugReportedDate: bugReportedDate || 'Unknown',
    priority: priority || 'Unknown',
    suiteName: specFileName,
  };
}

/**
 * Remove duplicate known failures based on test name and ticket ID
 */
function removeDuplicateFailures(failures) {
  const uniqueFailures = [];
  const seen = new Set();

  failures.forEach(failure => {
    const key = `${failure.testName}-${failure.ticketId}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueFailures.push(failure);
    }
  });

  return uniqueFailures;
}

/**
 * Calculate total statistics from tag data
 */
function calculateTotals(tagStats) {
  // Prefer priority tags (P0, P1, P2, P3) for overall metrics
  const priorityTags = Object.keys(tagStats).filter(isPriorityTag);

  // If no priority tags, fall back to using ALL unique tests from all tags
  // This handles test modules that don't use P0-P3 tagging
  const usePriorityTags = priorityTags.length > 0;

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalFlaky = 0;
  let totalSkipped = 0;
  let totalKnownFailures = 0;

  if (usePriorityTags) {
    // Sum up statistics from all priority tags
    priorityTags.forEach(tag => {
      totalTests += tagStats[tag].total;
      totalPassed += tagStats[tag].passed;
      // Exclude known failures from failure count
      totalFailed += tagStats[tag].failed - (tagStats[tag].knownFailures || 0);
      totalFlaky += tagStats[tag].flaky;
      totalSkipped += tagStats[tag].skipped;
      totalKnownFailures += tagStats[tag].knownFailures || 0;
    });
  } else {
    // No priority tags - calculate from unique test counts across all tags
    // Use the tag with highest total as reference to avoid double-counting
    const allTags = Object.keys(tagStats);

    // Find the tag with the highest total (likely the main category tag)
    let maxTotal = 0;
    let mainTag = null;
    allTags.forEach(tag => {
      if (tagStats[tag].total > maxTotal) {
        maxTotal = tagStats[tag].total;
        mainTag = tag;
      }
    });

    if (mainTag) {
      totalTests = tagStats[mainTag].total;
      totalPassed = tagStats[mainTag].passed;
      totalFailed = tagStats[mainTag].failed - (tagStats[mainTag].knownFailures || 0);
      totalFlaky = tagStats[mainTag].flaky;
      totalSkipped = tagStats[mainTag].skipped;
      totalKnownFailures = tagStats[mainTag].knownFailures || 0;
    }
  }

  // Calculate pass rate excluding known failures and skipped tests
  // Only count tests that were actually executed (passed + failed + flaky)
  const effectiveTotalTests = totalPassed + totalFailed + totalFlaky;
  const overallPassRate = effectiveTotalTests > 0 ? (totalPassed / effectiveTotalTests) * 100 : 0;

  return {
    totalTests,
    totalPassed,
    totalFailed,
    totalFlaky,
    totalSkipped,
    totalKnownFailures,
    overallPassRate,
  };
}

/**
 * Read the test results from the JSON file
 */
function readTestResults() {
  const testResultsPath = path.join(BASE_PATHS.TEST_RESULTS, 'test-results.json');

  if (!fs.existsSync(testResultsPath)) {
    throw new Error(`Test results file not found: ${testResultsPath}`);
  }

  try {
    const fileContent = fs.readFileSync(testResultsPath, 'utf8');
    const testResults = JSON.parse(fileContent);

    if (!testResults.suites || !Array.isArray(testResults.suites)) {
      throw new Error('Invalid test results format: missing or invalid suites array');
    }

    return testResults;
  } catch (error) {
    throw new Error(`Failed to parse test results: ${error.message}`);
  }
}

/**
 * Save the HTML report to file
 */
function saveReport(htmlContent) {
  try {
    if (!fs.existsSync(BASE_PATHS.PLAYWRIGHT_REPORT)) {
      fs.mkdirSync(BASE_PATHS.PLAYWRIGHT_REPORT, { recursive: true });
    }

    const reportPath = path.join(BASE_PATHS.PLAYWRIGHT_REPORT, 'tag-report.html');

    if (!htmlContent || htmlContent.trim().length === 0) {
      throw new Error('HTML content is empty or invalid');
    }

    fs.writeFileSync(reportPath, htmlContent, 'utf8');
    return reportPath;
  } catch (error) {
    throw new Error(`Failed to save HTML report: ${error.message}`);
  }
}

/**
 * Open the generated report in the default browser
 */
function openReportInBrowser() {
  try {
    const tagReportPath = path.resolve('playwright-report/tag-report.html');
    if (!fs.existsSync(tagReportPath)) {
      console.error(`Report file not found: ${tagReportPath}`);
      return;
    }
    const openCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(openCommand, [tagReportPath], { shell: true, stdio: 'ignore' });
  } catch (error) {
    console.error(`Error opening report in browser: ${error.message}`);
  }
}

/**
 * Generate tag report from test results
 */
function generateTagReport() {
  try {
    // Read test results from JSON file
    const testResults = readTestResults();

    // Process test data to get statistics
    const tagStats = extractTagStatistics(testResults);
    const totals = calculateTotals(tagStats);
    const knownFailureData = extractKnownFailures(testResults);

    // Get metadata for the report
    const timestamp =
      testResults.stats?.startTime || testResults.config?.metadata?.actualStartTime || new Date().toISOString();
    const duration = testResults.stats?.duration || 0;
    // Extract module name from config file path or environment variable
    const moduleName =
      testResults.config?.configFile?.match(/modules[/\\]([^/\\]+)[/\\]/)?.[1] || process.env.MODULE_NAME || 'Unknown';

    // Extract environment from environment variable or config metadata
    const testEnv =
      process.env.TEST_ENV?.toUpperCase() || testResults.config?.metadata?.environment?.toUpperCase() || 'QA';

    // Generate HTML report
    const htmlContent = generateHTML(tagStats, totals, timestamp, duration, moduleName, testEnv, knownFailureData);

    if (!htmlContent || htmlContent.trim().length === 0) {
      throw new Error('Generated HTML content is empty');
    }

    // Save report to file
    saveReport(htmlContent);
    console.log('Tag report generated successfully!');

    // Open browser if not in CI environment
    if (!process.env.CI) {
      openReportInBrowser();
    }
  } catch (error) {
    console.error('Failed to generate tag report:', error.message);
    process.exit(1);
  }
}

// Always execute the report generation when this file is run
generateTagReport();
