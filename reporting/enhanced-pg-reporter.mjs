/**
 * ============================================================
 * Using direct Client connection instead of Pool for CI scripts
 * ============================================================
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables
if (!process.env.CI) {
  if (fs.existsSync('pg.env')) {
    dotenv.config({ path: 'pg.env' });
  } else {
    throw new Error('❌ pg.env file not found to run on local');
  }
} else {
  //check if the required env variables are set
  if (
    !process.env.PG_DB_HOST ||
    !process.env.PG_DB_PORT ||
    !process.env.PG_DB_NAME ||
    !process.env.PG_DB_USER ||
    !process.env.PG_DB_PASSWORD
  ) {
    throw new Error('❌ Required environment variables are not set to run on CI');
  }
}

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
 * Enhanced PostgreSQL Reporter Class - Using Direct Client Connection
 */
class PostgresPlaywrightReporter {
  constructor() {
    // Use direct Client connection instead of Pool
    this.client = new Client({
      host: process.env.PG_DB_HOST || 'localhost',
      port: process.env.PG_DB_PORT || 5432,
      database: process.env.PG_DB_NAME || 'qa_automation',
      user: process.env.PG_DB_USER || 'e2e_admin',
      password: process.env.PG_DB_PASSWORD || 'Simpplr@2025',
      // Optimized settings for short-lived scripts
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 50000, // 50s connection timeout
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 100000, // 100s query timeout
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 120000, // 2min statement timeout
    });

    this.executionRunId = ExecutionIdGenerator.generateExecutionId();
    this.isConnected = false;

    // Enhanced configuration validation
    this.validateConfig();

    // Setup proper cleanup handlers
    this.setupCleanupHandlers();
  }

  validateConfig() {
    // Make MODULE_NAME and TEAM_NAME optional with sensible defaults
    if (!process.env.MODULE_NAME) {
      console.warn(`⚠️ MODULE_NAME not set, using 'unknown'`);
      process.env.MODULE_NAME = 'unknown';
    }

    if (!process.env.TEAM_NAME) {
      console.warn(`⚠️ TEAM_NAME not set, using 'unknown'`);
      process.env.TEAM_NAME = 'unknown';
    }
  }

  setupCleanupHandlers() {
    // Handle process termination gracefully
    const cleanup = async signal => {
      console.log(`\n🛑 Received ${signal}, cleaning up database connection...`);
      await this.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGUSR1', cleanup);
    process.on('SIGUSR2', cleanup);

    // Handle uncaught exceptions
    process.on('uncaughtException', async error => {
      console.error('🚨 Uncaught Exception:', error);
      await this.disconnect();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
      await this.disconnect();
      process.exit(1);
    });
  }

  async connect() {
    if (this.isConnected) {
      console.log('📊 Database client already connected');
      return;
    }

    try {
      console.log('📊 Connecting to PostgreSQL database...');
      await this.client.connect();
      this.isConnected = true;

      // Test the connection
      const result = await this.client.query('SELECT NOW() as current_time');
      console.log(`✅ Database connected successfully at ${result.rows[0].current_time}`);

      // Log connection info (without sensitive details)
      console.log(`🔗 Connected to: ${process.env.PG_DB_HOST}:${process.env.PG_DB_PORT}/${process.env.PG_DB_NAME}`);
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      console.error('🔍 Connection details:', {
        host: process.env.PG_DB_HOST,
        port: process.env.PG_DB_PORT,
        database: process.env.PG_DB_NAME,
        user: process.env.PG_DB_USER,
        ssl: process.env.NODE_ENV === 'production',
      });
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected && this.client) {
      try {
        console.log('📊 Closing database connection...');
        await this.client.end();
        this.isConnected = false;
        console.log('✅ Database connection closed');
      } catch (error) {
        console.error('⚠️ Error closing database connection:', error.message);
      }
    }
  }

  async processReport(reportPath) {
    console.log(`\n📄 Processing Playwright report: ${reportPath}`);
    console.log(`🏷️  Configuration:`);
    console.log(`   Module: ${process.env.MODULE_NAME}`);
    console.log(`   Team: ${process.env.TEAM_NAME}`);
    console.log(`   Environment: ${process.env.TEST_ENV || 'local'}`);
    console.log(`   Execution ID: ${this.executionRunId}`);
    console.log(`   Report Domain: ${process.env.REPORT_DOMAIN || 'http://localhost:9323'}`);

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
      console.log('✅ Enhanced test execution data successfully written to PostgreSQL');
    } catch (error) {
      console.error('❌ Failed to process report:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async writeTestExecutions(results) {
    console.log('\n📝 Processing enhanced test execution data...');

    const testExecutions = [];
    const suiteStartTime = new Date(results.stats.startTime);

    this.collectTestExecutions(results.suites, testExecutions, suiteStartTime);

    if (testExecutions.length === 0) {
      console.log('⚠️ No test executions found');
      return;
    }

    console.log(`📊 Found ${testExecutions.length} test executions to process (including retries)`);

    // Check for duplicates within our data set
    const uniqueKeys = new Set();
    const duplicateInfo = [];

    testExecutions.forEach((exec, index) => {
      const key = `${exec[0]}-${exec[1]}-${exec[17]}`; // execution_run_id + playwright_test_id + retry_count
      if (uniqueKeys.has(key)) {
        duplicateInfo.push(`Duplicate ${index + 1}: ${exec[1]} (retry: ${exec[17]})`);
      }
      uniqueKeys.add(key);
    });

    if (duplicateInfo.length > 0) {
      console.warn(`⚠️ Found ${duplicateInfo.length} potential duplicates in data:`);
      duplicateInfo.slice(0, 5).forEach(info => console.warn(`   ${info}`));
      if (duplicateInfo.length > 5) {
        console.warn(`   ... and ${duplicateInfo.length - 5} more`);
      }
    }

    // SQL with all columns including annotations
    const insertSQL = `
      INSERT INTO test_executions (
        execution_run_id, playwright_test_id, project_name, test_title, suite_name,
        spec_file_name, tags, zephyr_id, zephyr_url, story_id, story_url, test_description,
        module_name, team_name, priority, test_type, status, retry_count, is_flaky,
        duration_ms, error_type, error_message, error_stack, environment, branch_name,
        git_commit_sha, git_commit_message, is_regression_run, github_action_id,
        github_run_number, github_run_attempt, triggered_by, pr_number, test_start_time,
        test_end_time, suite_start_time, report_url, error_list, step_titles, annotations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40)
      ON CONFLICT (execution_run_id, playwright_test_id, retry_count)
      DO UPDATE SET
        test_end_time = EXCLUDED.test_end_time,
        duration_ms = EXCLUDED.duration_ms,
        status = EXCLUDED.status,
        error_type = EXCLUDED.error_type,
        error_message = EXCLUDED.error_message,
        error_stack = EXCLUDED.error_stack,
        error_list = EXCLUDED.error_list,
        step_titles = EXCLUDED.step_titles,
        report_url = EXCLUDED.report_url,
        annotations = EXCLUDED.annotations
    `;

    // Process in smaller batches with transaction per batch
    const batchSize = 25; // Reduced batch size for better error handling
    let processedCount = 0;

    for (let i = 0; i < testExecutions.length; i += batchSize) {
      const batch = testExecutions.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(testExecutions.length / batchSize);

      try {
        console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

        // Start transaction
        await this.client.query('BEGIN');

        // Process the batch
        for (const execution of batch) {
          await this.client.query(insertSQL, execution);
        }

        // Commit transaction
        await this.client.query('COMMIT');

        processedCount += batch.length;
        console.log(
          `✅ Batch ${batchNumber}/${totalBatches} completed: ${processedCount}/${testExecutions.length} records`
        );

        // Small delay between batches to reduce database load
        if (batchNumber < totalBatches) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        // Rollback on error
        try {
          await this.client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('❌ Rollback failed:', rollbackError.message);
        }

        console.error(`❌ Batch ${batchNumber}/${totalBatches} failed:`, error.message);
        console.error('❌ Full error:', error);

        // Debug: Show problematic data
        if (batch.length > 0) {
          console.log('🔍 Failed batch sample data:', {
            execution_run_id: batch[0][0],
            test_title: batch[0][3]?.substring(0, 50) + '...',
            branch_name: batch[0][24],
            environment: batch[0][23],
            module_name: batch[0][12],
            team_name: batch[0][13],
          });
        }

        // For CI environments, we might want to continue with other batches
        if (process.env.CI === 'true' && process.env.CONTINUE_ON_DB_ERROR === 'true') {
          console.warn(`⚠️ Continuing with next batch due to CI configuration...`);
          continue;
        } else {
          throw error;
        }
      }
    }

    console.log(`🎉 Successfully inserted ${processedCount} enhanced test execution records`);

    // Log statistics
    const retryCount = testExecutions.filter(exec => exec[17] > 0).length; // retry_count > 0
    const withSteps = testExecutions.filter(exec => exec[38] && exec[38].length > 0).length; // step_titles
    const withErrors = testExecutions.filter(exec => exec[37] !== null).length; // error_list
    const withReports = testExecutions.filter(exec => exec[36] !== null).length; // report_url
    const withAnnotations = testExecutions.filter(exec => exec[39] !== null).length; // annotations

    console.log(`📈 Enhancement stats:`);
    console.log(`   Retry attempts: ${retryCount}`);
    console.log(`   Tests with steps: ${withSteps}`);
    console.log(`   Tests with errors: ${withErrors}`);
    console.log(`   Tests with report URLs: ${withReports}`);
    console.log(`   Tests with annotations: ${withAnnotations}`);
  }

  // [All the other methods remain the same as they're not connection-related]
  collectTestExecutions(suites, testExecutions, suiteStartTime) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const testResults = test.results || [];
          const isTestFlaky = this.isTestFlaky(testResults);

          for (const result of testResults) {
            const executionData = this.createTestExecutionRecord(
              spec,
              test,
              result,
              suite,
              suiteStartTime,
              isTestFlaky
            );
            testExecutions.push(executionData);
          }
        }
      }
      this.collectTestExecutions(suite.suites, testExecutions, suiteStartTime);
    }
  }

  isTestFlaky(results) {
    if (results.length <= 1) {
      return false;
    }
    const statuses = results.map(r => r.status);
    const hasPass = statuses.includes('passed');
    const hasFail = statuses.includes('failed');
    return hasPass && hasFail;
  }

  createTestExecutionRecord(spec, test, result, suite, suiteStartTime, isTestFlaky) {
    const tags = this.processTags(spec.tags);
    const priority = this.extractPriority(tags);
    const testType = this.extractTestType(tags);
    const zephyrData = this.extractZephyrData(result.annotations || []);
    const errorData = this.extractErrorData(result);
    const specFileName = this.extractFileName(spec.file);
    const normalizedSuiteName = this.normalizeSuiteName(suite.title);

    const reportUrl = this.generateReportUrl(spec.id || this.generateFallbackId(spec));
    const errorList = this.extractAllErrors(result);
    const stepTitles = this.extractStepTitles(result.steps || []);
    const annotations = this.extractAnnotations(result.annotations || []);

    const testStartTime = this.safeParseDate(result.startTime);
    const testEndTime = new Date(testStartTime.getTime() + (result.duration || 0));

    return [
      this.executionRunId,
      spec.id || this.generateFallbackId(spec),
      test.projectName || test.projectId || 'unknown',
      spec.title || 'Untitled Test',
      normalizedSuiteName,
      specFileName,
      tags,
      zephyrData.zephyrId,
      zephyrData.zephyrUrl,
      zephyrData.storyId,
      zephyrData.storyUrl,
      zephyrData.description,
      process.env.MODULE_NAME,
      process.env.TEAM_NAME,
      priority,
      testType,
      result.status || 'unknown',
      result.retry || 0,
      isTestFlaky,
      Math.round(result.duration || 0),
      errorData.errorType,
      errorData.errorMessage,
      errorData.errorStack,
      process.env.TEST_ENV || 'local',
      process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || null,
      process.env.GITHUB_SHA || null,
      process.env.COMMIT_MESSAGE || null,
      process.env.IS_REGRESSION === 'true',
      process.env.GITHUB_RUN_ID || null,
      this.safeParseInt(process.env.GITHUB_RUN_NUMBER),
      this.safeParseInt(process.env.GITHUB_RUN_ATTEMPT) || 1,
      process.env.GITHUB_ACTOR || null,
      this.safeParseInt(process.env.PR_NUMBER),
      testStartTime,
      testEndTime,
      suiteStartTime,
      reportUrl,
      errorList,
      stepTitles,
      annotations,
    ];
  }

  // Helper methods (keeping existing implementation)
  safeParseInt(value) {
    if (!value) return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }

  generateReportUrl(testId) {
    const reportPath = process.env.REPORT_PATH || '';
    if (reportPath.startsWith('http://') || reportPath.startsWith('https://')) {
      return reportPath;
    }
    const fullUrl = `${reportPath}/#?testId=${testId}`;
    return fullUrl;
  }

  extractAllErrors(result) {
    const allErrors = [];

    if (result.error) {
      allErrors.push({
        message: result.error.message?.substring(0, 500) || 'Unknown error',
        location: result.error.location
          ? {
              file: result.error.location.file,
              line: result.error.location.line,
              column: result.error.location.column,
            }
          : null,
        type: this.categorizeError(result.error.message || ''),
        stack: result.error.stack?.substring(0, 1000) || null,
      });
    }

    if (result.errors && result.errors.length > 0) {
      for (const error of result.errors) {
        allErrors.push({
          message: error.message?.substring(0, 500) || 'Unknown error',
          location: error.location
            ? {
                file: error.location.file,
                line: error.location.line,
                column: error.location.column,
              }
            : null,
          type: this.categorizeError(error.message || ''),
          stack: error.stack?.substring(0, 1000) || null,
        });
      }
    }

    return allErrors.length > 0 ? JSON.stringify(allErrors) : null;
  }

  extractStepTitles(steps, titles = []) {
    for (const step of steps || []) {
      if (step.title) {
        titles.push(step.title);
      }
      if (step.steps && step.steps.length > 0) {
        this.extractStepTitles(step.steps, titles);
      }
    }
    return titles.length > 0 ? titles : null;
  }

  extractAnnotations(annotations) {
    if (!annotations || annotations.length === 0) {
      return null;
    }

    const processedAnnotations = annotations.map(annotation => {
      const processed = {
        type: annotation.type,
        description: annotation.description,
      };

      switch (annotation.type) {
        case 'zephyrId':
        case 'storyId':
          const idMatch = annotation.description?.match(/browse\/([A-Z]+-\d+)/);
          if (idMatch) {
            processed.id = idMatch[1];
            processed.url = annotation.description;
          }
          break;
        case 'description':
          if (annotation.description && annotation.description.length > 500) {
            processed.truncated = true;
            processed.full_description = annotation.description;
            processed.description = annotation.description.substring(0, 500) + '...';
          }
          break;
        case 'priority':
          if (annotation.description && /^P[0-4]$/i.test(annotation.description)) {
            processed.priority_level = annotation.description.toUpperCase();
          }
          break;
        case 'tag':
        case 'tags':
          if (annotation.description) {
            processed.tag_value = annotation.description;
          }
          break;
        default:
          break;
      }

      return processed;
    });

    return JSON.stringify(processedAnnotations);
  }

  safeParseDate(dateString) {
    try {
      if (!dateString) {
        return new Date();
      }
      const parsed = new Date(dateString);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch (error) {
      return new Date();
    }
  }

  processTags(tags) {
    if (!tags || !Array.isArray(tags)) {
      return null;
    }
    const cleanTags = [...new Set(tags)]
      .filter(tag => tag && typeof tag === 'string' && tag.trim())
      .map(tag => tag.trim());
    return cleanTags.length > 0 ? cleanTags : null;
  }

  extractPriority(tags) {
    if (!tags) return null;
    const priority = tags.find(tag => /^P[0-4]$/.test(tag));
    return priority || null;
  }

  extractTestType(tags) {
    if (!tags) return null;
    const testTypes = ['smoke', 'sanity', 'regression', 'integration'];
    const testType = tags.find(tag => testTypes.includes(tag.toLowerCase()));
    return testType ? testType.toLowerCase() : null;
  }

  normalizeSuiteName(suiteName) {
    if (!suiteName) return null;
    return suiteName.replace(/^@/, '').replace(/\s+/g, '_').toLowerCase();
  }

  extractFileName(filePath) {
    if (!filePath) return 'unknown.spec.js';
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
          const zephyrMatch = annotation.description?.match(/browse\/([A-Z]+-\d+)/);
          result.zephyrId = zephyrMatch ? zephyrMatch[1] : null;
          break;
        case 'storyId':
          result.storyUrl = annotation.description;
          const storyMatch = annotation.description?.match(/browse\/([A-Z]+-\d+)/);
          result.storyId = storyMatch ? storyMatch[1] : null;
          break;
        case 'description':
          result.description = annotation.description?.substring(0, 1000);
          break;
      }
    }

    return result;
  }

  extractErrorData(result) {
    let errorMessage = '';
    let errorStack = null;

    if (result.error) {
      errorMessage = result.error.message || '';
      errorStack = result.error.stack?.substring(0, 2000) || null;
    } else if (result.errors && result.errors.length > 0) {
      errorMessage = result.errors[0].message || '';
      errorStack = result.errors[0].stack?.substring(0, 2000) || null;
    }

    if (!errorMessage) {
      return {
        errorType: null,
        errorMessage: null,
        errorStack: null,
      };
    }

    return {
      errorType: this.categorizeError(errorMessage),
      errorMessage: errorMessage.substring(0, 1000),
      errorStack: errorStack,
    };
  }

  categorizeError(errorMessage) {
    if (!errorMessage) return null;
    const message = errorMessage.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
    if (message.includes('network') || message.includes('net::err_')) return 'network_error';
    if (message.includes('connection') || message.includes('fetch')) return 'connection_error';
    if (message.includes('element') && message.includes('not found')) return 'element_not_found';
    if (message.includes('element') && message.includes('not visible')) return 'element_not_visible';
    if (message.includes('element') && message.includes('not enabled')) return 'element_not_enabled';
    if (message.includes('element') && message.includes('not attached')) return 'element_detached';
    if (message.includes('assertion') || message.includes('expect')) return 'assertion_failed';
    if (message.includes('toequal') || message.includes('tobe')) return 'assertion_failed';
    if (message.includes('authentication') || message.includes('login')) return 'auth_error';
    if (message.includes('permission') || message.includes('access denied')) return 'permission_error';
    if (message.includes('unauthorized') || message.includes('403')) return 'auth_error';
    if (message.includes('javascript') || message.includes('script error')) return 'javascript_error';
    if (message.includes('evaluation failed')) return 'javascript_error';
    if (message.includes('navigation') || message.includes('page crash')) return 'navigation_error';
    if (message.includes('protocol error')) return 'browser_protocol_error';

    return 'other_error';
  }

  generateFallbackId(spec) {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHash('md5')
        .update(`${spec.file || 'unknown'}-${spec.title || 'unknown'}`)
        .digest('hex')
        .substring(0, 8);
      return `fallback-${hash}`;
    } catch (error) {
      return `fallback-${Date.now().toString(36)}`;
    }
  }
}

// ============================================================
// MAIN EXECUTION WITH  ERROR HANDLING
// ============================================================
(async function () {
  const reportDir = process.env.REPORT_DIR || './test-results';

  console.log('\n🚀 Starting PostgreSQL Playwright Reporter (Client Mode)');
  console.log('='.repeat(60));

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

  // Create and run the enhanced reporter with retry logic
  const reporter = new PostgresPlaywrightReporter();
  const maxRetries = parseInt(process.env.DB_MAX_RETRIES) || 3;
  const retryDelayMs = parseInt(process.env.DB_RETRY_DELAY) || 5000;

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🔄 Attempt ${attempt}/${maxRetries} to process report...`);
      const startTime = Date.now();

      await reporter.processReport(reportPath);

      const endTime = Date.now();
      console.log('\n🎉 Enhanced PostgreSQL reporting completed successfully!');
      console.log(`⏱️  Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
      console.log(`🔄 Completed on attempt: ${attempt}/${maxRetries}`);
      console.log('='.repeat(60));

      // Success - exit the retry loop
      process.exit(0);
    } catch (error) {
      lastError = error;
      console.error(`\n❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);

      // If this is the last attempt, don't wait
      if (attempt === maxRetries) {
        console.error('\n💀 All retry attempts exhausted!');
        console.error('Final error details:', error);
        break;
      }

      // Wait before retrying (with exponential backoff)
      const delay = retryDelayMs * Math.pow(1.5, attempt - 1);
      console.log(`⏳ Waiting ${delay}ms before retry attempt ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Create a new reporter instance for the retry
      // This ensures we don't have stale connection state
      reporter = new PostgresPlaywrightReporter();
    }
  }

  // If we reach here, all retries failed
  console.error('\n❌ Enhanced PostgreSQL reporting failed after all retry attempts!');
  console.error('='.repeat(60));

  // Provide troubleshooting information
  console.error('\n🔧 Troubleshooting Information:');
  console.error('   Database Configuration:');
  console.error(`   - Host: ${process.env.PG_DB_HOST}`);
  console.error(`   - Port: ${process.env.PG_DB_PORT}`);
  console.error(`   - Database: ${process.env.PG_DB_NAME}`);
  console.error(`   - User: ${process.env.PG_DB_USER}`);
  console.error(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.error(`   - CI Mode: ${process.env.CI || 'false'}`);
  console.error('\n   Common Solutions:');
  console.error('   1. Check database connectivity and credentials');
  console.error('   2. Verify firewall/security group settings');
  console.error('   3. Ensure database is accepting connections');
  console.error('   4. Check if connection limits are exceeded');
  console.error('   5. Verify SSL settings match database requirements');

  process.exit(1);
})();
