#!/bin/bash

echo "🚀 Setting up Central UI Automation Framework..."

# Detect CI environment
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ] || [ "$JENKINS_URL" ] || [ "$BUILDKITE" ]; then
    IS_CI=true
    echo "🤖 CI environment detected"
else
    IS_CI=false
    echo "💻 Local development environment detected"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies - use npm ci in CI, npm install locally
echo "📦 Installing dependencies..."
if [ "$IS_CI" = true ]; then
    npm ci --prefer-offline --no-audit
else
    npm install
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
if [ "$IS_CI" = true ]; then
    npx playwright install --with-deps
else
    npx playwright install
fi

# Initialize Husky (only in local development)
if [ "$IS_CI" = false ]; then
    echo "🐕 Setting up git hooks..."
    # Husky v8+ auto-initializes via 'prepare' script in package.json
    # Just ensure hooks are executable
    chmod +x .husky/pre-commit .husky/commit-msg .husky/_/husky.sh 2>/dev/null || true
else
    echo "⏭️ Skipping git hooks setup in CI environment"
fi

# Run initial checks to verify setup
echo "🔍 Running initial checks..."

echo "  📋 Checking formatting..."
npm run format:check

echo "  🔍 Checking linting..."
npm run lint:check

echo "  🔧 Checking TypeScript..."
npm run type-check

echo ""
echo "✅ Setup complete! 🎉"
echo ""

if [ "$IS_CI" = false ]; then
    echo "📚 Next steps:"
    echo "  1. Open the project in VS Code"
    echo "  2. Install recommended extensions when prompted"
    echo "  3. Read docs/DEVELOPER_GUIDE.md for workflow details"
    echo "  4. Run 'npm test' to use the interactive test runner"
    echo ""
    echo "🛠️  Available commands:"
    echo "  npm test               # Interactive test runner (recommended)"
    echo "  npm run test:chat      # Run chat tests directly"
    echo "  npm run test:chat:P0   # Run priority P0 tests"
    echo "  npm run serve-report   # View test reports"
    echo ""
    echo "Happy testing! 🚀"
else
    echo "🤖 CI setup complete! Ready for automated testing."
    echo "Available test commands:"
    echo "  npm run test:chat      # Run chat tests"
    echo "  npm run test:content   # Run content tests"
    echo "  npm run test:global-search  # Run search tests"
    echo "  npm test               # Interactive test runner (for debugging)"
fi