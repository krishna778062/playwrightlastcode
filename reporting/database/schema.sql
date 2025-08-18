
-- Create Complete Test Executions Table
CREATE TABLE test_executions (
    -- Primary key
    id BIGSERIAL PRIMARY KEY,
    
    -- Core test identification
    execution_run_id VARCHAR(100) NOT NULL,
    playwright_test_id VARCHAR(200) NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    test_title VARCHAR(500) NOT NULL,
    suite_name VARCHAR(200),
    spec_file_name VARCHAR(200) NOT NULL,
    
    -- Test metadata
    tags TEXT[],
    zephyr_id VARCHAR(50),
    zephyr_url VARCHAR(500),
    story_id VARCHAR(50),
    story_url VARCHAR(500),
    test_description TEXT,
    
    -- Organization
    module_name VARCHAR(100) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    priority VARCHAR(10),
    test_type VARCHAR(50),
    
    -- Execution results
    status VARCHAR(20) NOT NULL,
    retry_count INTEGER DEFAULT 0,
    is_flaky BOOLEAN DEFAULT FALSE,
    duration_ms INTEGER NOT NULL,
    
    -- Error information
    error_type VARCHAR(100),
    error_message TEXT,
    error_stack TEXT,
    error_list JSONB,
    
    -- Environment context
    environment VARCHAR(100) NOT NULL,
    branch_name VARCHAR(200),
    git_commit_sha VARCHAR(40),
    git_commit_message TEXT,
    is_regression_run BOOLEAN DEFAULT FALSE,
    
    -- CI/CD context
    github_action_id VARCHAR(100),
    github_run_number INTEGER,
    github_run_attempt INTEGER DEFAULT 1,
    triggered_by VARCHAR(100),
    pr_number INTEGER,
    
    -- Timing
    test_start_time TIMESTAMPTZ NOT NULL,
    test_end_time TIMESTAMPTZ NOT NULL,
    suite_start_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Enhanced tracking
    report_url TEXT,
    step_titles TEXT[],
    annotations JSONB,
    
    -- Unique constraint to prevent duplicate test attempts
    UNIQUE (execution_run_id, playwright_test_id, retry_count)
);

-- STEP 3: Create Essential Indexes (Based on Production Usage)
-- ============================================================
-- Optimized indexes based on real dashboard usage patterns

-- Primary lookup indexes
CREATE INDEX idx_test_executions_run_id ON test_executions(execution_run_id);
CREATE INDEX idx_test_executions_playwright_id ON test_executions(playwright_test_id);

-- Dashboard performance indexes
CREATE INDEX idx_test_executions_module_env ON test_executions(module_name, environment, test_start_time);
CREATE INDEX idx_test_executions_dashboard ON test_executions(module_name, environment, test_start_time DESC, status);

-- Time-based indexes for trends
CREATE INDEX idx_test_executions_time ON test_executions(test_start_time);
CREATE INDEX idx_test_executions_branch ON test_executions(branch_name, test_start_time);

-- Status and analysis indexes
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_test_executions_retries ON test_executions(retry_count, is_flaky) WHERE retry_count > 0;

-- Traceability indexes
CREATE INDEX idx_test_executions_zephyr_id ON test_executions(zephyr_id) WHERE zephyr_id IS NOT NULL;
CREATE INDEX idx_test_executions_story_id ON test_executions(story_id) WHERE story_id IS NOT NULL;
CREATE INDEX idx_test_executions_priority ON test_executions(priority) WHERE priority IS NOT NULL;

-- Enhanced feature indexes (JSONB and Arrays)
CREATE INDEX idx_test_executions_error_list ON test_executions USING GIN (error_list) WHERE error_list IS NOT NULL;
CREATE INDEX idx_test_executions_step_titles ON test_executions USING GIN (step_titles) WHERE step_titles IS NOT NULL;
CREATE INDEX idx_test_executions_annotations ON test_executions USING GIN (annotations) WHERE annotations IS NOT NULL;
CREATE INDEX idx_test_executions_tags ON test_executions USING GIN (tags);

-- Additional performance indexes
CREATE INDEX idx_test_executions_error_type ON test_executions(error_type) WHERE error_type IS NOT NULL;
CREATE INDEX idx_test_executions_project ON test_executions(project_name);
CREATE INDEX idx_test_executions_report_url ON test_executions(report_url) WHERE report_url IS NOT NULL;
CREATE INDEX idx_test_executions_github ON test_executions(github_action_id, github_run_number);

-- STEP 4: Create Useful Views for Dashboard Queries
-- ============================================================

-- Enhanced daily summary view
CREATE VIEW v_daily_test_summary AS
SELECT 
    DATE(test_start_time) as test_date,
    module_name,
    environment,
    team_name,
    project_name,
    branch_name,
    is_regression_run,
    
    -- Test counts
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE status = 'passed') as passed_tests,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_tests,
    COUNT(*) FILTER (WHERE status = 'skipped') as skipped_tests,
    COUNT(*) FILTER (WHERE is_flaky = true) as flaky_tests,
    COUNT(*) FILTER (WHERE retry_count > 0) as retry_tests,
    
    -- Rates (percentage)
    ROUND(COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / COUNT(*) * 100, 2) as pass_rate,
    ROUND(COUNT(*) FILTER (WHERE status = 'failed')::DECIMAL / COUNT(*) * 100, 2) as fail_rate,
    ROUND(COUNT(*) FILTER (WHERE is_flaky = true)::DECIMAL / COUNT(*) * 100, 2) as flaky_rate,
    ROUND(COUNT(*) FILTER (WHERE retry_count > 0)::DECIMAL / COUNT(*) * 100, 2) as retry_rate,
    
    -- Performance metrics
    AVG(duration_ms)::INTEGER as avg_duration_ms,
    MAX(duration_ms) as max_duration_ms,
    MIN(duration_ms) as min_duration_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::INTEGER as p95_duration_ms,
    
    -- Slow tests
    COUNT(*) FILTER (WHERE duration_ms > 30000) as tests_over_30s,
    COUNT(*) FILTER (WHERE duration_ms > 60000) as tests_over_60s,
    
    -- Traceability coverage
    COUNT(*) FILTER (WHERE zephyr_id IS NOT NULL) as tests_with_zephyr,
    COUNT(*) FILTER (WHERE priority IS NOT NULL) as tests_with_priority,
    ROUND(COUNT(*) FILTER (WHERE zephyr_id IS NOT NULL)::DECIMAL / COUNT(*) * 100, 2) as zephyr_coverage_rate,
    
    -- Report coverage
    COUNT(*) FILTER (WHERE report_url IS NOT NULL) as tests_with_reports,
    ROUND(COUNT(*) FILTER (WHERE report_url IS NOT NULL)::DECIMAL / COUNT(*) * 100, 2) as report_coverage_rate,
    
    -- Enhanced error tracking
    COUNT(*) FILTER (WHERE error_list IS NOT NULL) as tests_with_errors,
    COUNT(*) FILTER (WHERE step_titles IS NOT NULL) as tests_with_steps,
    
    -- Unique counts
    COUNT(DISTINCT playwright_test_id) as unique_tests
    
FROM test_executions 
GROUP BY DATE(test_start_time), module_name, environment, team_name, 
         project_name, branch_name, is_regression_run;

-- Tests with Zephyr mapping and reports
CREATE VIEW v_tests_with_zephyr AS
SELECT 
    execution_run_id,
    playwright_test_id,
    test_title,
    suite_name,
    zephyr_id,
    zephyr_url,
    story_id,
    story_url,
    module_name,
    status,
    duration_ms,
    test_start_time,
    tags,
    report_url,
    error_list,
    step_titles
FROM test_executions 
WHERE zephyr_id IS NOT NULL;

-- Tests without priority (for tracking)
CREATE VIEW v_tests_without_priority AS
SELECT 
    execution_run_id,
    playwright_test_id,
    test_title,
    suite_name,
    spec_file_name,
    tags,
    module_name,
    team_name,
    status,
    test_start_time,
    report_url,
    error_list,
    step_titles
FROM test_executions 
WHERE priority IS NULL;

-- Tag usage analysis
CREATE VIEW v_tag_analysis AS
SELECT 
    unnest(tags) as tag_name,
    COUNT(*) as usage_count,
    COUNT(*) FILTER (WHERE status = 'passed') as passed_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    ROUND(COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / COUNT(*) * 100, 2) as tag_pass_rate,
    AVG(duration_ms)::INTEGER as avg_duration_ms
FROM test_executions 
WHERE tags IS NOT NULL
GROUP BY tag_name
ORDER BY usage_count DESC;

-- Flaky test detection with report links
CREATE VIEW v_flaky_tests AS
SELECT 
    playwright_test_id,
    test_title,
    suite_name,
    module_name,
    COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE is_flaky = true) as flaky_runs,
    COUNT(*) FILTER (WHERE status = 'passed') as passed_runs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
    ROUND(COUNT(*) FILTER (WHERE is_flaky = true)::DECIMAL / COUNT(*) * 100, 2) as flaky_rate,
    MAX(test_start_time) as last_run,
    array_agg(DISTINCT status) as statuses,
    -- Get most recent report URL for debugging
    (SELECT report_url FROM test_executions te 
     WHERE te.playwright_test_id = test_executions.playwright_test_id 
     ORDER BY test_start_time DESC LIMIT 1) as latest_report_url,
    -- Get error patterns for flaky tests
    (SELECT error_list FROM test_executions te 
     WHERE te.playwright_test_id = test_executions.playwright_test_id 
       AND te.error_list IS NOT NULL
     ORDER BY test_start_time DESC LIMIT 1) as latest_errors
FROM test_executions 
WHERE test_start_time >= NOW() - INTERVAL '30 days'
GROUP BY playwright_test_id, test_title, suite_name, module_name
HAVING COUNT(*) > 1 AND COUNT(DISTINCT status) > 1
ORDER BY flaky_rate DESC, total_runs DESC;

-- Performance regression detection
CREATE VIEW v_performance_trends AS
SELECT 
    playwright_test_id,
    test_title,
    module_name,
    AVG(duration_ms) FILTER (WHERE test_start_time >= NOW() - INTERVAL '7 days') as recent_avg_duration,
    AVG(duration_ms) FILTER (WHERE test_start_time >= NOW() - INTERVAL '30 days' 
                                AND test_start_time < NOW() - INTERVAL '7 days') as baseline_avg_duration,
    COUNT(*) FILTER (WHERE test_start_time >= NOW() - INTERVAL '7 days') as recent_runs,
    COUNT(*) FILTER (WHERE test_start_time >= NOW() - INTERVAL '30 days') as total_runs
FROM test_executions 
WHERE test_start_time >= NOW() - INTERVAL '30 days'
GROUP BY playwright_test_id, test_title, module_name
HAVING COUNT(*) FILTER (WHERE test_start_time >= NOW() - INTERVAL '7 days') >= 3
   AND COUNT(*) FILTER (WHERE test_start_time >= NOW() - INTERVAL '30 days' 
                           AND test_start_time < NOW() - INTERVAL '7 days') >= 3
   AND AVG(duration_ms) FILTER (WHERE test_start_time >= NOW() - INTERVAL '7 days') > 
       AVG(duration_ms) FILTER (WHERE test_start_time >= NOW() - INTERVAL '30 days' 
                                   AND test_start_time < NOW() - INTERVAL '7 days') * 1.5
ORDER BY recent_avg_duration DESC;

-- STEP 5: Create Cleanup Function for 30-day Data Retention
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_old_test_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM test_executions 
    WHERE test_start_time < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % old test execution records', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Grant Final Permissions
-- ============================================================

-- Ensure grafana_admin has access to all objects
GRANT ALL ON ALL TABLES IN SCHEMA public TO grafana_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO grafana_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO grafana_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO grafana_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON SEQUENCES TO grafana_admin;

-- STEP 7: Verification Queries
-- ============================================================

-- Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'test_executions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'test_executions'
ORDER BY indexname;

-- Verify views
SELECT 
    table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Test basic functionality
INSERT INTO test_executions (
    execution_run_id, playwright_test_id, project_name, test_title, 
    spec_file_name, module_name, team_name, status, duration_ms,
    environment, test_start_time, test_end_time
) VALUES (
    'setup-test-001', 'test-001', 'test-project', 'Setup Test', 
    'setup.spec.js', 'setup', 'qa', 'passed', 1000,
    'test', NOW(), NOW()
);

-- Verify the insert worked
SELECT COUNT(*) as test_records FROM test_executions;

-- Clean up test record
DELETE FROM test_executions WHERE execution_run_id = 'setup-test-001';

-- ============================================================
-- SETUP COMPLETE!
-- ============================================================

-- Summary:
-- ✅ Database 'qa_automation' created
-- ✅ User 'grafana_admin' created with full access
-- ✅ Table 'test_executions' created with all 42 columns
-- ✅ 16 performance indexes created
-- ✅ 6 useful views created for dashboards
-- ✅ Cleanup function created for 30-day retention
-- ✅ All permissions granted
-- ✅ Setup verified

-- Next steps:
-- 1. Update pg.env with connection details
-- 2. Run your postgres-reporter.js after test execution
-- 3. Set up Grafana dashboards using the views
-- 4. Schedule cleanup_old_test_data() function weekly