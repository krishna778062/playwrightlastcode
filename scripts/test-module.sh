#!/bin/bash

# Usage: ./scripts/test-module.sh <module-name> [test-type] [env] [playwright-flags...]
# Examples:
#   ./scripts/test-module.sh chat P0 qa
#   ./scripts/test-module.sh integrations smoke uat
#   ./scripts/test-module.sh chat '[P0,smoke]' qa
#   ./scripts/test-module.sh chat '[P0,smoke,attachment]' qa --workers=4 --headed
#   ./scripts/test-module.sh chat '[@chat,@attachment]' qa --debug --reporter=html
#   ./scripts/test-module.sh integrations P0 uat --max-failures=3 --timeout=60000

MODULE_NAME="$1"
TEST_TYPE="$2"
ENV_NAME="$3"

# All remaining arguments after the first 3 are passed to Playwright
shift 3
EXTRA_ARGS="$@"

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: $0 <module-name> [test-type] [env] [playwright-flags...]"
    echo "Examples:"
    echo "  $0 chat"
    echo "  $0 chat P0"
    echo "  $0 chat P0 qa"
    echo "  $0 integrations smoke uat"
    echo "  $0 chat '[P0,smoke]' qa"
    echo "  $0 chat '[P0,smoke,attachment]' qa --workers=4 --headed"
    echo "  $0 chat '[@chat,@attachment]' qa --debug --reporter=html"
    echo "  $0 integrations P0 uat --workers=2 --max-failures=3 --timeout=60000"
    exit 1
fi

# Check if module directory exists
if [ ! -d "src/modules/$MODULE_NAME" ]; then
    echo "Module '$MODULE_NAME' not found in src/modules/"
    exit 1
fi

# Build the command
CONFIG_PATH="src/modules/$MODULE_NAME/playwright.$MODULE_NAME.config.ts"
CMD="cross-env MODULE_NAME=$MODULE_NAME"

# Add environment if provided
if [ -n "$ENV_NAME" ]; then
    ENV_FILE="src/modules/$MODULE_NAME/env/$ENV_NAME.env"
    if [ -f "$ENV_FILE" ]; then
        CMD="$CMD TEST_ENV=$ENV_NAME"
        echo "Using environment: $ENV_NAME ($ENV_FILE)"
    else
        echo "Warning: Environment file not found: $ENV_FILE"
        echo "Available environments in src/modules/$MODULE_NAME/env/:"
        ls src/modules/$MODULE_NAME/env/ 2>/dev/null || echo "  No env directory found"
    fi
fi

CMD="$CMD npx playwright test --config=$CONFIG_PATH"

# Add grep pattern if test type provided
if [ -n "$TEST_TYPE" ]; then
    # Handle array-like syntax: "[P0,smoke,attachment]" or single values
    if [[ "$TEST_TYPE" == \[*\] ]]; then
        # Remove brackets and split by comma
        CLEAN_LIST="${TEST_TYPE#\[}"  # Remove opening bracket
        CLEAN_LIST="${CLEAN_LIST%\]}"  # Remove closing bracket
        IFS=',' read -ra TYPES <<< "$CLEAN_LIST"
        
        GREP_PATTERN=""
        for i in "${!TYPES[@]}"; do
            TYPE="${TYPES[$i]// /}" # Remove spaces
            # Add @ prefix if not present
            if [[ "$TYPE" != @* ]]; then
                TYPE="@$TYPE"
            fi
            if [ $i -eq 0 ]; then
                GREP_PATTERN="$TYPE"
            else
                GREP_PATTERN="$GREP_PATTERN|$TYPE"
            fi
        done
        CMD="$CMD --grep=\"$GREP_PATTERN\""
        echo "Using grep pattern: $GREP_PATTERN"
    elif [[ "$TEST_TYPE" == *","* ]]; then
        # Handle comma-separated without brackets for backward compatibility
        IFS=',' read -ra TYPES <<< "$TEST_TYPE"
        GREP_PATTERN=""
        for i in "${!TYPES[@]}"; do
            TYPE="${TYPES[$i]// /}" # Remove spaces
            # Add @ prefix if not present
            if [[ "$TYPE" != @* ]]; then
                TYPE="@$TYPE"
            fi
            if [ $i -eq 0 ]; then
                GREP_PATTERN="$TYPE"
            else
                GREP_PATTERN="$GREP_PATTERN|$TYPE"
            fi
        done
        CMD="$CMD --grep=\"$GREP_PATTERN\""
        echo "Using grep pattern: $GREP_PATTERN"
    else
        # Single test type
        if [[ "$TEST_TYPE" != @* ]]; then
            TEST_TYPE="@$TEST_TYPE"
        fi
        CMD="$CMD --grep=\"$TEST_TYPE\""
        echo "Using grep pattern: $TEST_TYPE"
    fi
fi

# Add any extra Playwright arguments
if [ -n "$EXTRA_ARGS" ]; then
    CMD="$CMD $EXTRA_ARGS"
    echo "Extra Playwright args: $EXTRA_ARGS"
fi

# Special handling for frontline module with login-with-otp test
if [ "$MODULE_NAME" == "frontline" ] && [ -n "$ENV_NAME" ] && [ "$ENV_NAME" != "qa" ]; then
    echo ""
    echo "================================================"
    echo "Special handling: login-with-otp.spec.ts will use qa2.env"
    echo "================================================"
    echo ""
    
    # Run all tests except login-with-otp on the specified environment
    echo "Step 1: Running all tests except login-with-otp on $ENV_NAME environment..."
    EXCLUDE_OTP_CMD="$CMD --grep-invert=\"login with otp\""
    echo "Running: $EXCLUDE_OTP_CMD"
    eval $EXCLUDE_OTP_CMD
    EXIT_CODE_1=$?
    
    # Check if login-with-otp.spec.ts exists and would be included
    OTP_TEST_FILE="src/modules/frontline/tests/ui-tests/login-with-otp.spec.ts"
    if [ -f "$OTP_TEST_FILE" ]; then
        echo ""
        echo "Step 2: Running login-with-otp test on qa2 environment..."
        OTP_CMD="cross-env MODULE_NAME=$MODULE_NAME TEST_ENV=qa2 npx playwright test --config=$CONFIG_PATH"
        
        # Add grep pattern if test type matches P1 or includes login-with-otp
        if [ -n "$TEST_TYPE" ]; then
            OTP_CMD="$OTP_CMD --grep=\"login with otp\""
        else
            OTP_CMD="$OTP_CMD --grep=\"login with otp\""
        fi
        
        if [ -n "$EXTRA_ARGS" ]; then
            OTP_CMD="$OTP_CMD $EXTRA_ARGS"
        fi
        
        echo "Running: $OTP_CMD"
        eval $OTP_CMD
        EXIT_CODE_2=$?
        
        # Exit with error if either test run failed
        if [ $EXIT_CODE_1 -ne 0 ] || [ $EXIT_CODE_2 -ne 0 ]; then
            echo ""
            echo "================================================"
            echo "Test execution completed with errors"
            echo "Main tests exit code: $EXIT_CODE_1"
            echo "OTP test exit code: $EXIT_CODE_2"
            echo "================================================"
            exit 1
        fi
        
        echo ""
        echo "================================================"
        echo "All tests passed successfully!"
        echo "================================================"
    else
        # If OTP test doesn't exist, just use the exit code from main tests
        exit $EXIT_CODE_1
    fi
else
    # Normal execution for other modules or when explicitly using qa2
    echo "Running: $CMD"
    eval $CMD
fi