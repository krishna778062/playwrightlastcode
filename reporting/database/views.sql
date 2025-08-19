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

