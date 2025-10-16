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
  return /^@?p[0-3]$/i.test(tag);
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
    const tags = new Set([...(spec.tags || []), ...((spec.title || '').match(/@\w+/g) || [])]);

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
 */
function extractKnownFailures(testResults) {
  const knownFailures = [];

  processSuites(testResults.suites, (suite, spec) => {
    spec.tests?.forEach(test => {
      test.results?.forEach(result => {
        const knownFailureAnnotation = result.annotations?.find(annotation => annotation.type === 'known_failure');

        if (knownFailureAnnotation) {
          knownFailures.push(parseKnownFailureAnnotation(knownFailureAnnotation, spec, suite, test));
        }
      });
    });
  });

  return removeDuplicateFailures(knownFailures);
}

/**
 * Parse known failure annotation to extract details
 */
function parseKnownFailureAnnotation(annotation, spec, suite, test) {
  const description = annotation.description || '';
  const lines = description.split('\n');

  // Parse each line to extract failure details
  let bugTicket = '';
  let zephyrTestId = '';
  let note = '';
  let bugReportedDate = '';
  let priority = 'Medium';

  lines.forEach(line => {
    if (line.startsWith('BugTicket:')) {
      bugTicket = line.replace('BugTicket:', '').trim();
    } else if (line.startsWith('ZephyrTestId:')) {
      const fullUrl = line.replace('ZephyrTestId:', '').trim();
      zephyrTestId = fullUrl.split('/').pop() || fullUrl;
    } else if (line.startsWith('Note:')) {
      note = line.replace('Note:', '').trim();
    } else if (line.startsWith('BugReportedDate:')) {
      bugReportedDate = line.replace('BugReportedDate:', '').trim();
    } else if (line.startsWith('Priority:')) {
      priority = line.replace('Priority:', '').trim();
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
    priority: priority,
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
  // Only count priority tags (P0, P1, P2, P3) for overall metrics
  const priorityTags = Object.keys(tagStats).filter(isPriorityTag);

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalFlaky = 0;
  let totalSkipped = 0;
  let totalKnownFailures = 0;

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

  // Calculate pass rate excluding known failures
  const effectiveTotalTests = totalTests - totalKnownFailures;
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
    const knownFailures = extractKnownFailures(testResults);

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
    const htmlContent = generateHTML(tagStats, totals, timestamp, duration, moduleName, testEnv, knownFailures);

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
