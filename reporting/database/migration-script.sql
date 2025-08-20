-- ============================================================
-- FIXED DATABASE MIGRATION SCRIPT
-- Add missing columns to existing table
-- ============================================================

-- STEP 1: Add missing columns to existing table
-- ============================================================
DO $$ 
BEGIN
    RAISE NOTICE '🚀 Starting column addition migration...';
    
    -- Add error_list column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_executions' 
            AND column_name = 'error_list'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE test_executions ADD COLUMN error_list JSONB;
        RAISE NOTICE '✅ Added error_list column';
    ELSE
        RAISE NOTICE '⚠️ error_list column already exists';
    END IF;

    -- Add step_titles column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_executions' 
            AND column_name = 'step_titles'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE test_executions ADD COLUMN step_titles TEXT[];
        RAISE NOTICE '✅ Added step_titles column';
    ELSE
        RAISE NOTICE '⚠️ step_titles column already exists';
    END IF;

    -- Verify report_url exists (should be there already)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_executions' 
            AND column_name = 'report_url'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE test_executions ADD COLUMN report_url TEXT;
        RAISE NOTICE '✅ Added report_url column';
    ELSE
        RAISE NOTICE '✅ report_url column already exists';
    END IF;
    
    RAISE NOTICE '🎉 Column addition completed!';
END $$;

-- STEP 2: Create missing indexes
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '📊 Creating missing indexes...';
    
    -- Create error_list index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_test_executions_error_list'
    ) THEN
        CREATE INDEX idx_test_executions_error_list ON test_executions USING GIN (error_list) WHERE error_list IS NOT NULL;
        RAISE NOTICE '✅ Created error_list index';
    ELSE
        RAISE NOTICE '⚠️ error_list index already exists';
    END IF;
    
    -- Create step_titles index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_test_executions_step_titles'
    ) THEN
        CREATE INDEX idx_test_executions_step_titles ON test_executions USING GIN (step_titles) WHERE step_titles IS NOT NULL;
        RAISE NOTICE '✅ Created step_titles index';
    ELSE
        RAISE NOTICE '⚠️ step_titles index already exists';
    END IF;
    
    RAISE NOTICE '📊 Index creation completed!';
END $$;

-- STEP 3: Drop and recreate views with new columns
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '🗂️ Recreating views with new columns...';
    
    -- Drop existing views
    DROP VIEW IF EXISTS v_daily_test_summary CASCADE;
    DROP VIEW IF EXISTS v_tests_with_zephyr CASCADE;
    DROP VIEW IF EXISTS v_tests_without_priority CASCADE;
    DROP VIEW IF EXISTS v_tag_analysis CASCADE;
    DROP VIEW IF EXISTS v_flaky_tests CASCADE;
    DROP VIEW IF EXISTS v_performance_trends CASCADE;
    
    RAISE NOTICE '✅ Dropped existing views';
END $$;

-- Enhanced daily summary view with error and step analysis
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
    report_url,  -- Include report URL for easy access
    error_list,  -- Include all errors for analysis
    step_titles  -- Include step titles for debugging
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
    report_url,  -- Include for debugging
    error_list,  -- Include for error analysis
    step_titles  -- Include for step analysis
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

-- STEP 4: Final verification
-- ============================================================
DO $$
DECLARE 
    column_count INTEGER;
    error_list_exists BOOLEAN;
    step_titles_exists BOOLEAN;
    report_url_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 Running final verification...';
    
    -- Count total columns
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'test_executions' AND table_schema = 'public';
    
    -- Check specific new columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_executions' 
            AND column_name = 'error_list' 
            AND table_schema = 'public'
    ) INTO error_list_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_executions' 
            AND column_name = 'step_titles' 
            AND table_schema = 'public'
    ) INTO step_titles_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_executions' 
            AND column_name = 'report_url' 
            AND table_schema = 'public'
    ) INTO report_url_exists;
    
    RAISE NOTICE '📊 Final Verification Results:';
    RAISE NOTICE '   Total columns: %', column_count;
    RAISE NOTICE '   error_list exists: %', error_list_exists;
    RAISE NOTICE '   step_titles exists: %', step_titles_exists;
    RAISE NOTICE '   report_url exists: %', report_url_exists;
    
    IF error_list_exists AND step_titles_exists AND report_url_exists THEN
        RAISE NOTICE '🎉 ============================================';
        RAISE NOTICE '✅ Migration completed successfully!';
        RAISE NOTICE '🚀 All required columns are now present!';
        RAISE NOTICE '📊 Enhanced PostgreSQL reporter is ready!';
        RAISE NOTICE '🎉 ============================================';
    ELSE
        RAISE EXCEPTION '❌ Migration failed - missing required columns!';
    END IF;
END $$;