/**
 * ============================================================
 * Complete PostgreSQL Playwright Reporter
 * Phase 1: Production Ready Implementation
 * ============================================================
 */

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'pg.env' });

/**
 * Execution ID Generator for GitHub Actions
 */
class ExecutionIdGenerator {
  static generateExecutionId() {
    // Priority 1: Command line override (for backfill)
    const cliOverride = this.getCliOverride();
    if (cliOverride) {
      console.log(`📋 Using CLI override execution ID: ${cliOverride}`);
      return cliOverride;
    }

    // Priority 2: GitHub Actions (normal flow)
    if (process.env.GITHUB_ACTIONS === 'true') {
      const githubId = this.generateGitHubActionsId();
      console.log(`🚀 Generated GitHub Actions execution ID: ${githubId}`);
      return githubId;
    }

    // Priority 3: Local development fallback
    const localId = this.generateLocalId();
    console.log(`💻 Generated local execution ID: ${localId}`);
    return localId;
  }

  static getCliOverride() {
    // Check for command line argument: --execution-id=xyz
    const execIdArg = process.argv.find(arg => arg.startsWith('--execution-id='));
    if (execIdArg) {
      return execIdArg.split('=')[1];
    }

    // Check for environment variable: EXECUTION_ID=xyz
    if (process.env.EXECUTION_ID) {
      return process.env.EXECUTION_ID;
    }

    return null;
  }

  static generateGitHubActionsId() {
    const runId = process.env.GITHUB_RUN_ID;
    const runNumber = process.env.GITHUB_RUN_NUMBER;
    const runAttempt = process.env.GITHUB_RUN_ATTEMPT || '1';
    const timestamp = this.getTimestampString();

    return `gh-${runId}-${runNumber}-${runAttempt}-${timestamp}`;
  }

  static generateLocalId() {
    const timestamp = this.getTimestampString();
    const random = Math.random().toString(36).substring(2, 8);

    return `local-${timestamp}-${random}`;
  }

  static getTimestampString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }
}

/**
 * Main PostgreSQL Reporter Class
 */
class PostgresPlaywrightReporter {
  constructor() {
    this.client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'qa_automation',
      user: process.env.DB_USER || 'qa_user',
      password: process.env.DB_PASSWORD || 'qa_password',
    });

    this.executionRunId = ExecutionIdGenerator.generateExecutionId();
    this.isConnected = false;

    // Validate required environment variables
    this.validateConfig();
  }

  validateConfig() {
    const required = ['MODULE_NAME', 'TEAM_NAME'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
      console.error('   Please set these in your environment or pg.env file');
      process.exit(1);
    }
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log('📊 Connected to PostgreSQL database');
      } catch (error) {
        console.error('❌ Failed to connect to PostgreSQL:', error.message);
        throw error;
      }
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.end();
      this.isConnected = false;
      console.log('📊 Disconnected from PostgreSQL database');
    }
  }

  async processReport(reportPath) {
    console.log(`\n📄 Processing Playwright report: ${reportPath}`);
    console.log(`🏷️  Configuration:`);
    console.log(`   Module: ${process.env.MODULE_NAME}`);
    console.log(`   Team: ${process.env.TEAM_NAME}`);
    console.log(`   Environment: ${process.env.TEST_ENV || 'local'}`);
    console.log(`   Execution ID: ${this.executionRunId}`);

    if (!fs.existsSync(reportPath)) {
      console.error(`❌ Report file not found: ${reportPath}`);
      process.exit(1);
    }

    let reportData;
    try {
      reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to parse JSON report:', error.message);
      process.exit(1);
    }

    try {
      await this.connect();
      await this.writeTestExecutions(reportData);
      console.log('✅ Test execution data successfully written to PostgreSQL');
    } catch (error) {
      console.error('❌ Failed to process report:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async writeTestExecutions(results) {
    console.log('\n📝 Processing test execution data...');

    const testExecutions = [];
    const suiteStartTime = new Date(results.stats.startTime);

    this.collectTestExecutions(results.suites, testExecutions, suiteStartTime);

    if (testExecutions.length === 0) {
      console.log('⚠️ No test executions found');
      return;
    }

    console.log(`📊 Found ${testExecutions.length} test executions to process`);

    const insertSQL = `
      INSERT INTO test_executions (
        execution_run_id, playwright_test_id, project_name, test_title, suite_name, 
        spec_file_name, tags, zephyr_id, zephyr_url, story_id, story_url, test_description,
        module_name, team_name, priority, test_type, status, retry_count, is_flaky, 
        duration_ms, error_type, error_message, error_stack, environment, branch_name, 
        git_commit_sha, git_commit_message, is_regression_run, github_action_id, 
        github_run_number, github_run_attempt, triggered_by, pr_number, test_start_time, 
        test_end_time, suite_start_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
    `;

    // Process in batches for better performance
    const batchSize = 50;
    let processedCount = 0;

    for (let i = 0; i < testExecutions.length; i += batchSize) {
      const batch = testExecutions.slice(i, i + batchSize);

      await this.client.query('BEGIN');
      try {
        for (const execution of batch) {
          await this.client.query(insertSQL, execution);
        }
        await this.client.query('COMMIT');
        processedCount += batch.length;
        console.log(
          `✅ Processed batch ${Math.floor(i / batchSize) + 1}: ${processedCount}/${testExecutions.length} records`
        );
      } catch (error) {
        await this.client.query('ROLLBACK');
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
        throw error;
      }
    }

    console.log(`🎉 Successfully inserted ${processedCount} test execution records`);
  }

  collectTestExecutions(suites, testExecutions, suiteStartTime) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          for (const result of test.results || []) {
            const executionData = this.createTestExecutionRecord(spec, test, result, suite, suiteStartTime);
            testExecutions.push(executionData);
          }
        }
      }

      // Process nested suites recursively
      this.collectTestExecutions(suite.suites, testExecutions, suiteStartTime);
    }
  }

  createTestExecutionRecord(spec, test, result, suite, suiteStartTime) {
    // Extract and process data
    const tags = this.processTags(spec.tags);
    const priority = this.extractPriority(tags);
    const testType = this.extractTestType(tags);
    const zephyrData = this.extractZephyrData(result.annotations || []);
    const errorData = this.extractErrorData(result.errors || []);
    const specFileName = this.extractFileName(spec.file);
    const normalizedSuiteName = this.normalizeSuiteName(suite.title);

    const testStartTime = new Date(result.startTime);
    const testEndTime = new Date(testStartTime.getTime() + (result.duration || 0));

    return [
      this.executionRunId, // execution_run_id
      spec.id || this.generateFallbackId(spec), // playwright_test_id
      test.projectName || test.projectId, // project_name
      spec.title, // test_title
      normalizedSuiteName, // suite_name
      specFileName, // spec_file_name
      tags, // tags (PostgreSQL array)
      zephyrData.zephyrId, // zephyr_id
      zephyrData.zephyrUrl, // zephyr_url
      zephyrData.storyId, // story_id
      zephyrData.storyUrl, // story_url
      zephyrData.description, // test_description
      process.env.MODULE_NAME, // module_name
      process.env.TEAM_NAME, // team_name
      priority, // priority
      testType, // test_type
      result.status, // status
      result.retry || 0, // retry_count
      (result.retry || 0) > 0, // is_flaky
      Math.round(result.duration || 0), // duration_ms
      errorData.errorType, // error_type
      errorData.errorMessage, // error_message
      errorData.errorStack, // error_stack
      process.env.TEST_ENV || 'local', // environment
      process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'unknown', // branch_name
      process.env.GITHUB_SHA, // git_commit_sha
      process.env.COMMIT_MESSAGE, // git_commit_message
      process.env.IS_REGRESSION === 'true', // is_regression_run
      process.env.GITHUB_RUN_ID, // github_action_id
      parseInt(process.env.GITHUB_RUN_NUMBER) || null, // github_run_number
      parseInt(process.env.GITHUB_RUN_ATTEMPT) || 1, // github_run_attempt
      process.env.GITHUB_ACTOR, // triggered_by
      process.env.PR_NUMBER ? parseInt(process.env.PR_NUMBER) : null, // pr_number
      testStartTime, // test_start_time
      testEndTime, // test_end_time
      suiteStartTime, // suite_start_time
    ];
  }

  // ========================================
  // DATA PROCESSING HELPERS
  // ========================================

  processTags(tags) {
    if (!tags || !Array.isArray(tags)) {
      return null;
    }

    // Remove duplicates, clean up, and filter empty values
    const cleanTags = [...new Set(tags)]
      .filter(tag => tag && typeof tag === 'string' && tag.trim())
      .map(tag => tag.trim());

    return cleanTags.length > 0 ? cleanTags : null;
  }

  extractPriority(tags) {
    if (!tags) return null;

    const priority = tags.find(tag => /^P[0-4]$/.test(tag));
    return priority || null; // Return null if no priority found
  }

  extractTestType(tags) {
    if (!tags) return null;

    const testTypes = ['smoke', 'sanity', 'regression', 'integration'];
    const testType = tags.find(tag => testTypes.includes(tag.toLowerCase()));

    return testType ? testType.toLowerCase() : null;
  }

  normalizeSuiteName(suiteName) {
    if (!suiteName) return null;

    return suiteName
      .replace(/^@/, '') // Remove @ prefix
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase(); // Convert to lowercase
  }

  extractFileName(filePath) {
    if (!filePath) return 'unknown';
    return path.basename(filePath);
  }

  extractZephyrData(annotations) {
    const result = {
      zephyrId: null,
      zephyrUrl: null,
      storyId: null,
      storyUrl: null,
      description: null,
    };

    for (const annotation of annotations) {
      switch (annotation.type) {
        case 'zephyrId':
          result.zephyrUrl = annotation.description;
          // Extract ID from URL: https://simpplr.atlassian.net/browse/CONT-19533 -> CONT-19533
          const zephyrMatch = annotation.description?.match(/browse\/([A-Z]+-\d+)/);
          result.zephyrId = zephyrMatch ? zephyrMatch[1] : null;
          break;

        case 'storyId':
          result.storyUrl = annotation.description;
          const storyMatch = annotation.description?.match(/browse\/([A-Z]+-\d+)/);
          result.storyId = storyMatch ? storyMatch[1] : null;
          break;

        case 'description':
          result.description = annotation.description?.substring(0, 1000); // Limit length
          break;
      }
    }

    return result;
  }

  extractErrorData(errors) {
    if (!errors || errors.length === 0) {
      return {
        errorType: null,
        errorMessage: null,
        errorStack: null,
      };
    }

    const firstError = errors[0];
    const errorMessage = firstError.message || '';

    return {
      errorType: this.categorizeError(errorMessage),
      errorMessage: errorMessage.substring(0, 1000), // Limit to 1000 chars
      errorStack: firstError.stack?.substring(0, 2000), // Limit to 2000 chars
    };
  }

  categorizeError(errorMessage) {
    if (!errorMessage) return null;

    const message = errorMessage.toLowerCase();

    // Network and timeout errors
    if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
    if (message.includes('network') || message.includes('net::err_')) return 'network_error';
    if (message.includes('connection') || message.includes('fetch')) return 'connection_error';

    // Element interaction errors
    if (message.includes('element') && message.includes('not found')) return 'element_not_found';
    if (message.includes('element') && message.includes('not visible')) return 'element_not_visible';
    if (message.includes('element') && message.includes('not enabled')) return 'element_not_enabled';
    if (message.includes('element') && message.includes('not attached')) return 'element_detached';

    // Assertion errors
    if (message.includes('assertion') || message.includes('expect')) return 'assertion_failed';
    if (message.includes('toequal') || message.includes('tobe')) return 'assertion_failed';

    // Authentication errors
    if (message.includes('authentication') || message.includes('login')) return 'auth_error';
    if (message.includes('permission') || message.includes('access denied')) return 'permission_error';
    if (message.includes('unauthorized') || message.includes('403')) return 'auth_error';

    // JavaScript errors
    if (message.includes('javascript') || message.includes('script error')) return 'javascript_error';
    if (message.includes('evaluation failed')) return 'javascript_error';

    // Navigation errors
    if (message.includes('navigation') || message.includes('page crash')) return 'navigation_error';
    if (message.includes('protocol error')) return 'browser_protocol_error';

    return 'other_error';
  }

  generateFallbackId(spec) {
    // Generate a fallback ID if spec.id is missing
    const hash = require('crypto')
      .createHash('md5')
      .update(`${spec.file || 'unknown'}-${spec.title || 'unknown'}`)
      .digest('hex')
      .substring(0, 8);

    return `fallback-${hash}`;
  }
}

// ============================================================
// MAIN EXECUTION
// ============================================================
(async function () {
  const reportDir = process.env.REPORT_DIR || './test-results';

  console.log('\n🚀 Starting PostgreSQL Playwright Reporter');
  console.log('='.repeat(50));

  // Find the JSON report file
  let reportFile;
  try {
    const files = fs.readdirSync(reportDir);
    reportFile = files.find(file => file.endsWith('.json') && (file.includes('results') || file.includes('report')));
  } catch (error) {
    console.error(`❌ Cannot access report directory: ${reportDir}`);
    console.error('   Please ensure the directory exists and contains test results');
    process.exit(1);
  }

  if (!reportFile) {
    console.error(`❌ No JSON report file found in: ${reportDir}`);
    console.error('   Looking for files like: test-results.json, playwright-report.json');
    process.exit(1);
  }

  const reportPath = path.join(reportDir, reportFile);
  console.log(`📄 Found report file: ${reportFile}`);

  // Create and run the reporter
  const reporter = new PostgresPlaywrightReporter();

  try {
    const startTime = Date.now();
    await reporter.processReport(reportPath);
    const endTime = Date.now();

    console.log('\n🎉 PostgreSQL reporting completed successfully!');
    console.log(`⏱️  Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ PostgreSQL reporting failed!');
    console.error('Error details:', error.message);
    console.error('='.repeat(50));
    process.exit(1);
  }
})();
