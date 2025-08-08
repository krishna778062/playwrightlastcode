-- ============================================================
-- DATABASE MIGRATION SCRIPT
-- Clean up old schema and create new structure
-- ============================================================

-- STEP 1: Drop existing tables (if they exist)
-- ============================================================
DO $$ 
BEGIN
    -- Drop views first (they depend on tables)
    DROP VIEW IF EXISTS v_performance_trends CASCADE;
    DROP VIEW IF EXISTS v_flaky_tests CASCADE;
    DROP VIEW IF EXISTS v_tag_analysis CASCADE;
    DROP VIEW IF EXISTS v_tests_without_priority CASCADE;
    DROP VIEW IF EXISTS v_tests_with_zephyr CASCADE;
    DROP VIEW IF EXISTS v_daily_test_summary CASCADE;
    DROP VIEW IF EXISTS v_test_metrics CASCADE;
    DROP VIEW IF EXISTS v_test_execution_complete CASCADE;
    DROP VIEW IF EXISTS v_dashboard_metrics CASCADE;
    DROP VIEW IF EXISTS v_zephyr_coverage CASCADE;
    DROP VIEW IF EXISTS v_zephyr_coverage_report CASCADE;
    
    -- Drop old tables
    DROP TABLE IF EXISTS test_executions CASCADE;
    DROP TABLE IF EXISTS suite_executions CASCADE;
    DROP TABLE IF EXISTS test_case_metrics CASCADE;
    DROP TABLE IF EXISTS performance_metrics CASCADE;
    DROP TABLE IF EXISTS test_tag_metrics CASCADE;
    DROP TABLE IF EXISTS error_analysis CASCADE;
    DROP TABLE IF EXISTS module_health CASCADE;
    DROP TABLE IF EXISTS test_runs CASCADE;
    DROP TABLE IF EXISTS test_definitions CASCADE;
    DROP TABLE IF EXISTS test_zephyr_mappings CASCADE;
    DROP TABLE IF EXISTS daily_test_summary CASCADE;
    
    RAISE NOTICE 'Cleaned up existing schema';
END $$;

-- STEP 2: Create new schema
-- ============================================================

CREATE TABLE test_executions (
    id BIGSERIAL PRIMARY KEY,
    
    -- ========================================
    -- CORE IDENTIFICATION
    -- ========================================
    execution_run_id VARCHAR(100) NOT NULL,
    playwright_test_id VARCHAR(200) NOT NULL,
    project_name VARCHAR(100) NOT NULL, -- 'content-chromium'
    
    -- ========================================
    -- TEST DETAILS
    -- ========================================
    test_title VARCHAR(500) NOT NULL,
    suite_name VARCHAR(200), -- normalized: '@FeedPost' → 'feedpost'
    spec_file_name VARCHAR(200) NOT NULL, -- 'feed-post.spec.ts'
    tags TEXT[], -- PostgreSQL array: ['FeedPost', 'feed', 'attachments', 'P0', 'smoke']
    
    -- ========================================
    -- TRACEABILITY (Optional)
    -- ========================================
    zephyr_id VARCHAR(50), -- 'CONT-19533' or NULL
    zephyr_url VARCHAR(500), -- Full Atlassian URL or NULL
    story_id VARCHAR(50), -- 'CONT-19533' or NULL  
    story_url VARCHAR(500), -- Full story URL or NULL
    test_description TEXT, -- From description annotation or NULL
    
    -- ========================================
    -- CATEGORIZATION
    -- ========================================
    module_name VARCHAR(100) NOT NULL, -- From MODULE_NAME env var (required)
    team_name VARCHAR(100) NOT NULL, -- From TEAM_NAME env var
    priority VARCHAR(10), -- 'P0', 'P1', 'P2', 'P3', 'P4' or NULL
    test_type VARCHAR(50), -- 'smoke', 'regression', 'sanity' or extracted from tags
    
    -- ========================================
    -- EXECUTION RESULTS
    -- ========================================
    status VARCHAR(20) NOT NULL CHECK (status IN ('passed', 'failed', 'skipped', 'interrupted')),
    retry_count INTEGER DEFAULT 0,
    is_flaky BOOLEAN DEFAULT FALSE, -- true if retry_count > 0
    duration_ms INTEGER NOT NULL,
    
    -- ========================================
    -- ERROR ANALYSIS
    -- ========================================
    error_type VARCHAR(100), -- 'timeout', 'element_not_found', 'assertion_failed', etc.
    error_message TEXT, -- First 1000 chars of error message
    error_stack TEXT, -- Error stack trace (first 2000 chars)
    
    -- ========================================
    -- CI/CD CONTEXT
    -- ========================================
    environment VARCHAR(100) NOT NULL, -- 'staging', 'prod', 'dev'
    branch_name VARCHAR(200) NOT NULL,
    git_commit_sha VARCHAR(40),
    git_commit_message TEXT,
    is_regression_run BOOLEAN DEFAULT FALSE,
    
    -- GitHub Actions context
    github_action_id VARCHAR(100),
    github_run_number INTEGER,
    github_run_attempt INTEGER DEFAULT 1,
    triggered_by VARCHAR(100), -- GitHub actor
    pr_number INTEGER, -- If triggered by PR
    
    -- ========================================
    -- TIMING
    -- ========================================
    test_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    test_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    suite_start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    -- One record per test execution per run
    UNIQUE(execution_run_id, playwright_test_id)
);

-- ============================================================
-- STEP 3: Create indexes for performance
-- ============================================================

-- Primary access patterns
CREATE INDEX idx_test_executions_run_id ON test_executions(execution_run_id);
CREATE INDEX idx_test_executions_playwright_id ON test_executions(playwright_test_id);
CREATE INDEX idx_test_executions_project ON test_executions(project_name);

-- Filtering and analytics
CREATE INDEX idx_test_executions_module_env ON test_executions(module_name, environment, test_start_time);
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_test_executions_priority ON test_executions(priority) WHERE priority IS NOT NULL;
CREATE INDEX idx_test_executions_time ON test_executions(test_start_time);

-- Traceability
CREATE INDEX idx_test_executions_zephyr_id ON test_executions(zephyr_id) WHERE zephyr_id IS NOT NULL;
CREATE INDEX idx_test_executions_story_id ON test_executions(story_id) WHERE story_id IS NOT NULL;

-- Tag searching (GIN index for array operations)
CREATE INDEX idx_test_executions_tags ON test_executions USING GIN (tags);

-- Error analysis
CREATE INDEX idx_test_executions_error_type ON test_executions(error_type) WHERE error_type IS NOT NULL;

-- CI context
CREATE INDEX idx_test_executions_branch ON test_executions(branch_name, test_start_time);
CREATE INDEX idx_test_executions_github ON test_executions(github_action_id, github_run_number);

-- Composite index for dashboard queries
CREATE INDEX idx_test_executions_dashboard ON test_executions(
    module_name, environment, test_start_time DESC, status
);

-- ============================================================
-- STEP 4: Create useful views for dashboards
-- ============================================================

-- Daily summary view
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
    
    -- Rates (percentage)
    ROUND(COUNT(*) FILTER (WHERE status = 'passed')::DECIMAL / COUNT(*) * 100, 2) as pass_rate,
    ROUND(COUNT(*) FILTER (WHERE status = 'failed')::DECIMAL / COUNT(*) * 100, 2) as fail_rate,
    ROUND(COUNT(*) FILTER (WHERE is_flaky = true)::DECIMAL / COUNT(*) * 100, 2) as flaky_rate,
    
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
    
    -- Unique counts
    COUNT(DISTINCT playwright_test_id) as unique_tests
    
FROM test_executions 
GROUP BY DATE(test_start_time), module_name, environment, team_name, 
         project_name, branch_name, is_regression_run;

-- Tests with Zephyr mapping
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
    tags
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
    test_start_time
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

-- Flaky test detection
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
    array_agg(DISTINCT status) as statuses
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

-- ============================================================
-- STEP 5: Grant permissions (adjust as needed)
-- ============================================================

-- Grant permissions to your application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON test_executions TO qa_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO qa_user;
-- GRANT USAGE ON SEQUENCE test_executions_id_seq TO qa_user;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'test_executions'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'test_executions';

-- Verify views
SELECT 
    viewname 
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname LIKE 'v_%';

-- Show table size (will be 0 initially)
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    most_common_vals
FROM pg_stats 
WHERE tablename = 'test_executions';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Database migration completed successfully!';
    RAISE NOTICE '📊 New schema is ready for test execution data';
    RAISE NOTICE '🚀 You can now run the PostgreSQL reporter';
END $$;