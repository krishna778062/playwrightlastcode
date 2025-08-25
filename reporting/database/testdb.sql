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