/**
 * ========================================================
 * PostgreSQL Playwright Reporter - Complete Version
 * ========================================================
 */

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from pg.env
dotenv.config({ path: 'pg.env' });

const config = {
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || 5432,
  dbName: process.env.DB_NAME || 'qa_automation',
  dbUser: process.env.DB_USER || 'qa_user',
  dbPassword: process.env.DB_PASSWORD || 'qa_password',
  teamName: process.env.TEAM_NAME || 'platform',
  environment: process.env.TEST_ENV || 'local',
  moduleName: process.env.MODULE_NAME || 'unknown',
};

class PostgresPlaywrightReporter {
  constructor() {
    this.client = new Client({
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      password: config.dbPassword,
    });

    this.executionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = new Date();
    this.isConnected = false;
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      console.log('📊 Connected to PostgreSQL database');
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.end();
      this.isConnected = false;
      console.log('📊 Disconnected from PostgreSQL database');
    }
  }

  async initializeTables() {
    console.log('🔧 Initializing database tables...');

    const createTablesSQL = `
      -- Test Executions Table
      CREATE TABLE IF NOT EXISTS test_executions (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(100) NOT NULL,
        test_name VARCHAR(500) NOT NULL,
        test_file VARCHAR(500) NOT NULL,
        suite_title VARCHAR(500),
        module VARCHAR(100) NOT NULL,
        team VARCHAR(100) NOT NULL,
        environment VARCHAR(100) NOT NULL,
        project_name VARCHAR(100),
        status VARCHAR(20) NOT NULL,
        priority VARCHAR(10) DEFAULT 'P3',
        test_type VARCHAR(50) DEFAULT 'unknown',
        error_type VARCHAR(100) DEFAULT 'no_error',
        is_flaky BOOLEAN DEFAULT FALSE,
        browser VARCHAR(50) DEFAULT 'unknown',
        zephyr_id VARCHAR(50) DEFAULT 'NA',
        story_id VARCHAR(50) DEFAULT 'NA',
        duration_ms INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0,
        worker_index INTEGER DEFAULT 0,
        error_message TEXT,
        error_stack TEXT,
        test_tags TEXT,
        zephyr_url TEXT,
        story_url TEXT,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Suite Executions Table
      CREATE TABLE IF NOT EXISTS suite_executions (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(100) NOT NULL UNIQUE,
        team VARCHAR(100) NOT NULL,
        environment VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        run_type VARCHAR(50) DEFAULT 'adhoc',
        total_tests INTEGER DEFAULT 0,
        passed_tests INTEGER DEFAULT 0,
        failed_tests INTEGER DEFAULT 0,
        skipped_tests INTEGER DEFAULT 0,
        flaky_tests INTEGER DEFAULT 0,
        pass_rate DECIMAL(5,2) DEFAULT 0,
        failure_rate DECIMAL(5,2) DEFAULT 0,
        skip_rate DECIMAL(5,2) DEFAULT 0,
        total_duration_ms BIGINT DEFAULT 0,
        actual_workers INTEGER DEFAULT 1,
        avg_test_duration_ms DECIMAL(10,2) DEFAULT 0,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Test Case Metrics Table
      CREATE TABLE IF NOT EXISTS test_case_metrics (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(100) NOT NULL,
        test_case_id VARCHAR(200) NOT NULL,
        test_case_title VARCHAR(500) NOT NULL,
        suite_title VARCHAR(500),
        suite_file VARCHAR(500),
        module VARCHAR(100) NOT NULL,
        team VARCHAR(100) NOT NULL,
        environment VARCHAR(100) NOT NULL,
        priority VARCHAR(10) DEFAULT 'P3',
        test_type VARCHAR(50) DEFAULT 'unknown',
        zephyr_id VARCHAR(50) DEFAULT 'NA',
        story_id VARCHAR(50) DEFAULT 'NA',
        total_executions INTEGER DEFAULT 0,
        passed_executions INTEGER DEFAULT 0,
        failed_executions INTEGER DEFAULT 0,
        skipped_executions INTEGER DEFAULT 0,
        flaky_executions INTEGER DEFAULT 0,
        pass_rate DECIMAL(5,2) DEFAULT 0,
        fail_rate DECIMAL(5,2) DEFAULT 0,
        skip_rate DECIMAL(5,2) DEFAULT 0,
        flaky_rate DECIMAL(5,2) DEFAULT 0,
        avg_duration_ms DECIMAL(10,2) DEFAULT 0,
        total_duration_ms BIGINT DEFAULT 0,
        test_tags TEXT,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Performance Metrics Table
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        team VARCHAR(100) NOT NULL,
        environment VARCHAR(100) NOT NULL,
        total_duration_ms BIGINT DEFAULT 0,
        avg_test_duration_ms DECIMAL(10,2) DEFAULT 0,
        slowest_test_duration_ms INTEGER DEFAULT 0,
        fastest_test_duration_ms INTEGER DEFAULT 0,
        p95_duration_ms DECIMAL(10,2) DEFAULT 0,
        p99_duration_ms DECIMAL(10,2) DEFAULT 0,
        tests_over_30s INTEGER DEFAULT 0,
        tests_over_60s INTEGER DEFAULT 0,
        throughput_tests_per_minute DECIMAL(10,2) DEFAULT 0,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Test Tag Metrics Table
      CREATE TABLE IF NOT EXISTS test_tag_metrics (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(100) NOT NULL,
        tag_name VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        team VARCHAR(100) NOT NULL,
        environment VARCHAR(100) NOT NULL,
        priority VARCHAR(10) DEFAULT 'unknown',
        test_type VARCHAR(50) DEFAULT 'unknown',
        test_count INTEGER DEFAULT 0,
        passed_tests INTEGER DEFAULT 0,
        failed_tests INTEGER DEFAULT 0,
        flaky_tests INTEGER DEFAULT 0,
        pass_rate DECIMAL(5,2) DEFAULT 0,
        fail_rate DECIMAL(5,2) DEFAULT 0,
        flaky_rate DECIMAL(5,2) DEFAULT 0,
        avg_duration_ms DECIMAL(10,2) DEFAULT 0,
        total_duration_ms BIGINT DEFAULT 0,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Error Analysis Table
      CREATE TABLE IF NOT EXISTS error_analysis (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(100) NOT NULL,
        error_type VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        team VARCHAR(100) NOT NULL,
        environment VARCHAR(100) NOT NULL,
        occurrence_count INTEGER DEFAULT 0,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Module Health Metrics Table
      CREATE TABLE IF NOT EXISTS module_health (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        team VARCHAR(100) NOT NULL,
        environment VARCHAR(100) NOT NULL,
        run_type VARCHAR(50) DEFAULT 'adhoc',
        health_status VARCHAR(20) NOT NULL,
        health_score DECIMAL(5,2) DEFAULT 0,
        pass_rate DECIMAL(5,2) DEFAULT 0,
        failure_rate DECIMAL(5,2) DEFAULT 0,
        skip_rate DECIMAL(5,2) DEFAULT 0,
        flaky_rate DECIMAL(5,2) DEFAULT 0,
        total_tests INTEGER DEFAULT 0,
        passed_tests INTEGER DEFAULT 0,
        failed_tests INTEGER DEFAULT 0,
        flaky_tests INTEGER DEFAULT 0,
        skipped_tests INTEGER DEFAULT 0,
        total_duration_ms BIGINT DEFAULT 0,
        avg_test_duration_ms DECIMAL(10,2) DEFAULT 0,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_test_executions_execution_id ON test_executions(execution_id);
      CREATE INDEX IF NOT EXISTS idx_test_executions_module_env ON test_executions(module, environment);
      CREATE INDEX IF NOT EXISTS idx_test_executions_executed_at ON test_executions(executed_at);
      CREATE INDEX IF NOT EXISTS idx_test_executions_status ON test_executions(status);
      CREATE INDEX IF NOT EXISTS idx_test_executions_priority ON test_executions(priority);
      CREATE INDEX IF NOT EXISTS idx_test_executions_test_type ON test_executions(test_type);
      
      CREATE INDEX IF NOT EXISTS idx_suite_executions_executed_at ON suite_executions(executed_at);
      CREATE INDEX IF NOT EXISTS idx_suite_executions_module_env ON suite_executions(module, environment);
      
      CREATE INDEX IF NOT EXISTS idx_test_case_metrics_executed_at ON test_case_metrics(executed_at);
      CREATE INDEX IF NOT EXISTS idx_test_case_metrics_module_env ON test_case_metrics(module, environment);
      
      CREATE INDEX IF NOT EXISTS idx_performance_metrics_executed_at ON performance_metrics(executed_at);
      CREATE INDEX IF NOT EXISTS idx_module_health_executed_at ON module_health(executed_at);
      CREATE INDEX IF NOT EXISTS idx_test_tag_metrics_executed_at ON test_tag_metrics(executed_at);
    `;

    await this.client.query(createTablesSQL);
    console.log('✅ Database tables initialized successfully');
  }

  async processReport(reportPath) {
    console.log(`📄 Reading Playwright report: ${reportPath}`);

    if (!fs.existsSync(reportPath)) {
      console.error(`❌ Report file not found: ${reportPath}`);
      process.exit(1);
    }

    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    try {
      await this.connect();
      await this.initializeTables();

      // Process all metrics
      await this.writeTestExecutions(reportData);
      await this.writeSuiteExecutions(reportData);
      await this.writeTestCaseMetrics(reportData);
      await this.writePerformanceMetrics(reportData);
      await this.writeTestTagMetrics(reportData);
      await this.writeErrorAnalysis(reportData);
      await this.writeModuleHealthMetrics(reportData);

      console.log('✅ All metrics successfully written to PostgreSQL');
    } catch (error) {
      console.error('❌ Failed to process report:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async writeTestExecutions(results) {
    console.log('📝 Writing test execution data...');

    const testExecutions = [];
    this.collectTestExecutions(results.suites, testExecutions);

    if (testExecutions.length === 0) {
      console.log('⚠️ No test executions found');
      return;
    }

    // Batch insert test executions
    const insertSQL = `
      INSERT INTO test_executions (
        execution_id, test_name, test_file, suite_title, module, team, environment,
        project_name, status, priority, test_type, error_type, is_flaky, browser,
        zephyr_id, story_id, duration_ms, retry_count, worker_index, error_message,
        error_stack, test_tags, zephyr_url, story_url, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    `;

    for (const execution of testExecutions) {
      await this.client.query(insertSQL, execution);
    }

    console.log(`✅ Inserted ${testExecutions.length} test execution records`);
  }

  collectTestExecutions(suites, testExecutions) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        const testTags = spec.tags || [];
        const priorityTag = testTags.find(tag => tag.startsWith('P')) || 'P3';
        const testTypeTag = testTags.find(tag => ['smoke', 'sanity', 'regression'].includes(tag)) || 'unknown';

        for (const test of spec.tests || []) {
          for (const result of test.results || []) {
            const errorMessage =
              result.errors && result.errors.length > 0 ? (result.errors[0].message || '').substring(0, 500) : '';
            const errorStack =
              result.errors && result.errors.length > 0 ? (result.errors[0].stack || '').substring(0, 1000) : '';

            const errorType = this.categorizeError(errorMessage);
            const isFlaky = result.retry > 0;
            const executionTime = new Date(result.startTime);
            const annotations = this.parseAnnotations(result.annotations || []);

            testExecutions.push([
              this.executionId,
              spec.title,
              spec.file,
              suite.title,
              this.extractModule(spec.file),
              config.teamName,
              config.environment,
              test.projectName,
              result.status,
              priorityTag,
              testTypeTag,
              errorType,
              isFlaky,
              this.extractBrowser(test.projectName),
              annotations.zephyrId,
              annotations.storyId,
              Number(result.duration) || 0,
              Number(result.retry) || 0,
              Number(result.workerIndex) || 0,
              errorMessage,
              errorStack,
              testTags.join(','),
              annotations.zephyrUrl,
              annotations.storyUrl,
              executionTime,
            ]);
          }
        }
      }

      // Process nested suites
      this.collectTestExecutions(suite.suites, testExecutions);
    }
  }

  async writeSuiteExecutions(results) {
    console.log('📝 Writing suite execution data...');

    const totalTests =
      Number(results.stats.expected) + Number(results.stats.unexpected) + Number(results.stats.skipped);
    const passRate = (Number(results.stats.expected) / (totalTests || 1)) * 100;
    const failureRate = (Number(results.stats.unexpected) / (totalTests || 1)) * 100;
    const skipRate = (Number(results.stats.skipped) / (totalTests || 1)) * 100;

    const insertSQL = `
      INSERT INTO suite_executions (
        execution_id, team, environment, module, run_type, total_tests,
        passed_tests, failed_tests, skipped_tests, flaky_tests, pass_rate,
        failure_rate, skip_rate, total_duration_ms, actual_workers,
        avg_test_duration_ms, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `;

    const values = [
      this.executionId,
      config.teamName,
      config.environment,
      this.extractModule(''),
      this.getRunType(),
      totalTests,
      Number(results.stats.expected) || 0,
      Number(results.stats.unexpected) || 0,
      Number(results.stats.skipped) || 0,
      Number(results.stats.flaky) || 0,
      passRate,
      failureRate,
      skipRate,
      Number(results.stats.duration) || 0,
      Number(results.config?.metadata?.actualWorkers) || 1,
      totalTests > 0 ? Number(results.stats.duration) / totalTests : 0,
      this.startTime,
    ];

    await this.client.query(insertSQL, values);
    console.log('✅ Suite execution data written');
  }

  async writeTestCaseMetrics(results) {
    console.log('📝 Writing test case metrics...');

    const testCaseMetrics = new Map();
    this.collectTestCaseMetrics(results.suites, testCaseMetrics);

    if (testCaseMetrics.size === 0) {
      console.log('⚠️ No test case metrics found');
      return;
    }

    const insertSQL = `
      INSERT INTO test_case_metrics (
        execution_id, test_case_id, test_case_title, suite_title, suite_file,
        module, team, environment, priority, test_type, zephyr_id, story_id,
        total_executions, passed_executions, failed_executions, skipped_executions,
        flaky_executions, pass_rate, fail_rate, skip_rate, flaky_rate,
        avg_duration_ms, total_duration_ms, test_tags, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    `;

    for (const [, metrics] of testCaseMetrics) {
      await this.client.query(insertSQL, metrics);
    }

    console.log(`✅ Inserted ${testCaseMetrics.size} test case metric records`);
  }

  collectTestCaseMetrics(suites, testCaseMetrics) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        const testTags = spec.tags || [];
        const priorityTag = testTags.find(tag => tag.startsWith('P')) || 'P3';
        const testTypeTag = testTags.find(tag => ['smoke', 'sanity', 'regression'].includes(tag)) || 'unknown';

        const testCaseId = spec.id || `${spec.file}-${spec.title}`;

        let zephyrId = 'NA';
        let storyId = 'NA';
        let totalExecutions = 0;
        let passedExecutions = 0;
        let failedExecutions = 0;
        let skippedExecutions = 0;
        let flakyExecutions = 0;
        let totalDuration = 0;

        for (const test of spec.tests || []) {
          for (const result of test.results || []) {
            if (zephyrId === 'NA' || storyId === 'NA') {
              const annotations = this.parseAnnotations(result.annotations || []);
              if (annotations.zephyrId !== 'NA') zephyrId = annotations.zephyrId;
              if (annotations.storyId !== 'NA') storyId = annotations.storyId;
            }

            totalExecutions++;
            totalDuration += Number(result.duration) || 0;

            if (result.status === 'passed') passedExecutions++;
            else if (result.status === 'failed') failedExecutions++;
            else if (result.status === 'skipped') skippedExecutions++;

            if (result.retry > 0) flakyExecutions++;
          }
        }

        if (totalExecutions > 0) {
          const passRate = (passedExecutions / totalExecutions) * 100;
          const failRate = (failedExecutions / totalExecutions) * 100;
          const skipRate = (skippedExecutions / totalExecutions) * 100;
          const flakyRate = (flakyExecutions / totalExecutions) * 100;
          const avgDuration = totalDuration / totalExecutions;

          testCaseMetrics.set(testCaseId, [
            this.executionId,
            testCaseId,
            spec.title,
            suite.title,
            spec.file,
            this.extractModule(spec.file || ''),
            config.teamName,
            config.environment,
            priorityTag,
            testTypeTag,
            zephyrId,
            storyId,
            totalExecutions,
            passedExecutions,
            failedExecutions,
            skippedExecutions,
            flakyExecutions,
            passRate,
            failRate,
            skipRate,
            flakyRate,
            avgDuration,
            totalDuration,
            testTags.join(','),
            this.startTime,
          ]);
        }
      }

      this.collectTestCaseMetrics(suite.suites, testCaseMetrics);
    }
  }

  async writePerformanceMetrics(results) {
    console.log('📝 Writing performance metrics...');

    const performanceData = this.analyzePerformance(results);

    const insertSQL = `
      INSERT INTO performance_metrics (
        execution_id, module, team, environment, total_duration_ms,
        avg_test_duration_ms, slowest_test_duration_ms, fastest_test_duration_ms,
        p95_duration_ms, p99_duration_ms, tests_over_30s, tests_over_60s,
        throughput_tests_per_minute, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const values = [
      this.executionId,
      this.extractModule(''),
      config.teamName,
      config.environment,
      performanceData.totalDuration,
      performanceData.avgTestDuration,
      performanceData.slowestTest,
      performanceData.fastestTest,
      performanceData.p95Duration,
      performanceData.p99Duration,
      performanceData.testsOver30s,
      performanceData.testsOver60s,
      performanceData.throughput,
      this.startTime,
    ];

    await this.client.query(insertSQL, values);
    console.log('✅ Performance metrics written');
  }

  async writeTestTagMetrics(results) {
    console.log('📝 Writing test tag metrics...');

    const tagMetrics = new Map();
    this.collectTagMetrics(results.suites, tagMetrics);

    if (tagMetrics.size === 0) {
      console.log('⚠️ No tag metrics found');
      return;
    }

    const insertSQL = `
      INSERT INTO test_tag_metrics (
        execution_id, tag_name, module, team, environment, priority, test_type,
        test_count, passed_tests, failed_tests, flaky_tests, pass_rate,
        fail_rate, flaky_rate, avg_duration_ms, total_duration_ms, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `;

    for (const [tagName, metrics] of tagMetrics) {
      const passRate = metrics.total > 0 ? (metrics.passed / metrics.total) * 100 : 0;
      const failRate = metrics.total > 0 ? (metrics.failed / metrics.total) * 100 : 0;
      const flakyRate = metrics.total > 0 ? (metrics.flaky / metrics.total) * 100 : 0;
      const avgDuration = metrics.total > 0 ? metrics.totalDuration / metrics.total : 0;

      const values = [
        this.executionId,
        tagName,
        this.extractModule(''),
        config.teamName,
        config.environment,
        this.extractPriorityFromTag(tagName),
        this.extractTestTypeFromTag(tagName),
        metrics.total,
        metrics.passed,
        metrics.failed,
        metrics.flaky,
        passRate,
        failRate,
        flakyRate,
        avgDuration,
        metrics.totalDuration,
        this.startTime,
      ];

      await this.client.query(insertSQL, values);
    }

    console.log(`✅ Inserted ${tagMetrics.size} tag metric records`);
  }

  collectTagMetrics(suites, tagMetrics) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        const testTags = spec.tags || [];

        // Process priority tags (P1, P2, P3, etc.)
        const priorityTag = testTags.find(tag => tag.startsWith('P')) || 'P3';
        this.updateTagMetrics(tagMetrics, priorityTag, spec);

        // Process test type tags (smoke, sanity, regression)
        const testTypeTag = testTags.find(tag => ['smoke', 'sanity', 'regression'].includes(tag));
        if (testTypeTag) {
          this.updateTagMetrics(tagMetrics, testTypeTag, spec);
        }

        // Process all other tags
        testTags.forEach(tag => {
          if (!tag.startsWith('P') && !['smoke', 'sanity', 'regression'].includes(tag)) {
            this.updateTagMetrics(tagMetrics, tag, spec);
          }
        });
      }

      // Process nested suites
      this.collectTagMetrics(suite.suites, tagMetrics);
    }
  }

  updateTagMetrics(tagMetrics, tagName, spec) {
    if (!tagMetrics.has(tagName)) {
      tagMetrics.set(tagName, {
        total: 0,
        passed: 0,
        failed: 0,
        flaky: 0,
        totalDuration: 0,
      });
    }

    const metrics = tagMetrics.get(tagName);

    for (const test of spec.tests || []) {
      for (const result of test.results || []) {
        metrics.total++;
        metrics.totalDuration += Number(result.duration) || 0;

        if (result.status === 'passed') {
          metrics.passed++;
        } else if (result.status === 'failed') {
          metrics.failed++;
        }

        if (result.retry > 0) {
          metrics.flaky++;
        }
      }
    }
  }

  async writeErrorAnalysis(results) {
    console.log('📝 Writing error analysis data...');

    const errorCounts = new Map();
    this.collectErrorData(results.suites, errorCounts);

    if (errorCounts.size === 0) {
      console.log('⚠️ No error data found');
      return;
    }

    const insertSQL = `
      INSERT INTO error_analysis (
        execution_id, error_type, module, team, environment, occurrence_count, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const [errorType, count] of errorCounts) {
      const values = [
        this.executionId,
        errorType,
        this.extractModule(''),
        config.teamName,
        config.environment,
        count,
        this.startTime,
      ];

      await this.client.query(insertSQL, values);
    }

    console.log(`✅ Inserted ${errorCounts.size} error analysis records`);
  }

  collectErrorData(suites, errorCounts) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          for (const result of test.results || []) {
            if (result.status === 'failed' && result.errors && result.errors.length > 0) {
              const errorMessage = result.errors[0].message || '';
              const errorType = this.categorizeError(errorMessage);
              errorCounts.set(errorType, (errorCounts.get(errorType) || 0) + 1);
            }
          }
        }
      }

      this.collectErrorData(suite.suites, errorCounts);
    }
  }

  async writeModuleHealthMetrics(results) {
    console.log('📝 Writing module health metrics...');

    const totalTests =
      Number(results.stats.expected) + Number(results.stats.unexpected) + Number(results.stats.skipped);
    const passRate = (Number(results.stats.expected) / (totalTests || 1)) * 100;

    // Calculate health score (0-100)
    let healthScore = passRate;
    if (Number(results.stats.flaky) > 0) {
      healthScore -= (Number(results.stats.flaky) / totalTests) * 20;
    }
    healthScore = Math.max(0, Math.min(100, healthScore));

    const healthStatus =
      healthScore >= 90
        ? 'excellent'
        : healthScore >= 80
          ? 'good'
          : healthScore >= 70
            ? 'fair'
            : healthScore >= 60
              ? 'poor'
              : 'critical';

    const insertSQL = `
      INSERT INTO module_health (
        execution_id, module, team, environment, run_type, health_status,
        health_score, pass_rate, failure_rate, skip_rate, flaky_rate,
        total_tests, passed_tests, failed_tests, flaky_tests, skipped_tests,
        total_duration_ms, avg_test_duration_ms, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `;

    const values = [
      this.executionId,
      this.extractModule(''),
      config.teamName,
      config.environment,
      this.getRunType(),
      healthStatus,
      healthScore,
      passRate,
      (Number(results.stats.unexpected) / (totalTests || 1)) * 100,
      (Number(results.stats.skipped) / (totalTests || 1)) * 100,
      (Number(results.stats.flaky) / (totalTests || 1)) * 100,
      totalTests,
      Number(results.stats.expected),
      Number(results.stats.unexpected),
      Number(results.stats.flaky),
      Number(results.stats.skipped),
      Number(results.stats.duration) || 0,
      totalTests > 0 ? Number(results.stats.duration) / totalTests : 0,
      this.startTime,
    ];

    await this.client.query(insertSQL, values);
    console.log('✅ Module health metrics written');
  }

  // Helper methods
  parseAnnotations(annotations) {
    const result = {
      zephyrId: 'NA',
      storyId: 'NA',
      zephyrUrl: '',
      storyUrl: '',
    };

    for (const annotation of annotations) {
      if (annotation.type === 'zephyrId' && annotation.description) {
        result.zephyrUrl = annotation.description;
        result.zephyrId = this.extractIdFromUrl(annotation.description) || 'NA';
      }

      if (annotation.type === 'storyId' && annotation.description) {
        result.storyUrl = annotation.description;
        result.storyId = this.extractIdFromUrl(annotation.description) || 'NA';
      }
    }

    return result;
  }

  extractIdFromUrl(url) {
    if (!url) return null;
    const match = url.match(/([A-Z]+\-\d+)/);
    return match ? match[1] : null;
  }

  analyzePerformance(results) {
    const durations = [];
    let totalDuration = 0;
    let testsOver30s = 0;
    let testsOver60s = 0;

    for (const suite of results.suites) {
      this.collectTestDurations(suite, durations, duration => {
        totalDuration += duration;
        if (duration > 30000) testsOver30s++;
        if (duration > 60000) testsOver60s++;
      });
    }

    durations.sort((a, b) => a - b);
    const avgTestDuration = durations.length > 0 ? totalDuration / durations.length : 0;
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const throughput = results.stats.duration > 0 ? durations.length / (results.stats.duration / 60000) : 0;

    return {
      totalDuration: results.stats.duration,
      avgTestDuration,
      slowestTest: durations[durations.length - 1] || 0,
      fastestTest: durations[0] || 0,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      testsOver30s,
      testsOver60s,
      throughput,
    };
  }

  collectTestDurations(suite, durations, callback) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          const duration = Number(result.duration) || 0;
          durations.push(duration);
          callback(duration);
        }
      }
    }

    for (const nested of suite.suites || []) {
      this.collectTestDurations(nested, durations, callback);
    }
  }

  categorizeError(errorMessage) {
    if (!errorMessage) return 'no_error';

    const message = errorMessage.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
    if (message.includes('element') && message.includes('not found')) return 'element_not_found';
    if (message.includes('element') && message.includes('not enabled')) return 'element_not_enabled';
    if (message.includes('element') && message.includes('not visible')) return 'element_not_visible';
    if (message.includes('network') || message.includes('fetch')) return 'network_error';
    if (message.includes('assertion') || message.includes('expect')) return 'assertion_failed';
    if (message.includes('javascript') || message.includes('script')) return 'javascript_error';
    if (message.includes('authentication') || message.includes('login')) return 'auth_error';
    if (message.includes('permission') || message.includes('access')) return 'permission_error';

    return 'other_error';
  }

  extractBrowser(projectName) {
    if (!projectName) return 'unknown';
    if (projectName.includes('chromium')) return 'chromium';
    if (projectName.includes('firefox')) return 'firefox';
    if (projectName.includes('webkit')) return 'webkit';
    return 'unknown';
  }

  extractModule(filePath) {
    if (config.moduleName && config.moduleName !== 'unknown') {
      return config.moduleName;
    }

    if (!filePath) return 'unknown';

    const match = filePath.match(/(?:tests|test)\/([^\/]+)\//);
    if (match) return match[1];

    const uiMatch = filePath.match(/ui-tests\/([^\/]+)\//);
    if (uiMatch) return uiMatch[1];

    return 'unknown';
  }

  extractPriorityFromTag(tagName) {
    if (tagName.startsWith('P')) return tagName;
    return 'unknown';
  }

  extractTestTypeFromTag(tagName) {
    if (['smoke', 'sanity', 'regression'].includes(tagName)) return tagName;
    return 'unknown';
  }

  getRunType() {
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') return 'pr';
    if (process.env.GITHUB_EVENT_NAME === 'schedule') return 'scheduled';
    if (process.env.CI) return 'ci';
    return 'adhoc';
  }
}

// Main execution
(async function () {
  const reportDir = process.env.REPORT_DIR || './test-results';
  const reportFile = fs.readdirSync(reportDir).find(file => file.endsWith('.json') && file.includes('results'));

  if (!reportFile) {
    console.error('❌ No JSON report file found in:', reportDir);
    process.exit(1);
  }

  const reportPath = path.join(reportDir, reportFile);

  const reporter = new PostgresPlaywrightReporter();
  try {
    await reporter.processReport(reportPath);
    console.log('🎉 PostgreSQL metrics processing completed successfully');
  } catch (err) {
    console.error('❌ Failed to process PostgreSQL metrics:', err);
    process.exit(1);
  }
})();
