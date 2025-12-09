
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

