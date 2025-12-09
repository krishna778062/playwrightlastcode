-- Clean up and prepare for fresh data with improved flaky detection

-- Step 1: Check what we're about to delete
SELECT 
    module_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT execution_run_id) as unique_runs,
    COUNT(DISTINCT playwright_test_id) as unique_tests,
    MIN(test_start_time) as earliest_test,
    MAX(test_start_time) as latest_test
FROM test_executions 
GROUP BY module_name
ORDER BY module_name;

-- Step 2: Show current flaky test distribution (before fix)
SELECT 
    module_name,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE is_flaky = true) as flaky_executions,
    COUNT(DISTINCT playwright_test_id) as unique_tests,
    COUNT(DISTINCT CASE WHEN is_flaky = true THEN playwright_test_id END) as flaky_tests
FROM test_executions 
GROUP BY module_name;

-- Step 3: Delete all records (uncomment when ready)
-- DELETE FROM test_executions;

-- Step 4: Alternative - Delete only specific module
-- DELETE FROM test_executions WHERE module_name = 'content';

-- Step 5: Verify deletion
-- SELECT COUNT(*) as remaining_records FROM test_executions;

-- Step 6: Reset sequence (optional - if you want to start IDs from 1 again)
-- ALTER SEQUENCE test_executions_id_seq RESTART WITH 1;