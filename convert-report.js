const fs = require('fs');
const path = require('path');
const net = require('net');

// Function to find an available port
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(startPort, '127.0.0.1', () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try the next one
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
}

// Get command line arguments
const args = process.argv.slice(2);
const inputFile = args[0] || 'test-results/test-results.json';

const PROJECT_ROOT = path.resolve(__dirname);
const TEST_RESULTS_DIR = path.join(PROJECT_ROOT, 'test-results');
const PLAYWRIGHT_REPORT_DIR = path.join(PROJECT_ROOT, 'playwright-report');
const DEFAULT_PORT = 9323;

// Get base URL from environment variable
const BASE_URL = process.env.TRACE_VIEWER_BASE_URL || '';

// Ensure playwright-report directory exists
if (!fs.existsSync(PLAYWRIGHT_REPORT_DIR)) {
    fs.mkdirSync(PLAYWRIGHT_REPORT_DIR, { recursive: true });
}

// Validate input file exists
if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found`);
    console.log('Usage: node convert-report.js [input-file.json]');
    console.log('Example: node convert-report.js custom-report.json');
    process.exit(1);
}

// Read the JSON report
const reportData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// Generate output filename based on input filename but place it in playwright-report
const outputFile = path.join(PLAYWRIGHT_REPORT_DIR, 'summary.html');

// Function to generate trace viewer URL
function getTraceViewerUrl(tracePath) {
    // Get the path relative to the test-results directory
    const testResultsRelativePath = path.relative(TEST_RESULTS_DIR, tracePath);
    
    // If we have a base URL, use it, otherwise just use the relative path
    const tracePath = BASE_URL ? 
        `${BASE_URL}/test-results/${testResultsRelativePath}` :
        `test-results/${testResultsRelativePath}`;
    
    return `https://trace.playwright.dev/?trace=${encodeURIComponent(tracePath)}`;
}

// Function to get the Playwright report path
function getPlaywrightReportPath() {
    return './index.html'; // Keep Playwright's original index.html
}

// Function to inject base URL into HTML
function injectBaseUrl(html) {
    const script = `
    <script>
        window.process = { env: { TRACE_VIEWER_BASE_URL: '${BASE_URL}' } };
    </script>`;
    return html.replace('</head>', `${script}</head>`);
}

// Create HTML content
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Execution Report</title>
    <script>
        // Set the base URL from environment variable
        window.TRACE_VIEWER_BASE_URL = '${BASE_URL}';
    </script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .filters {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        .filters select {
            padding: 8px;
            margin-right: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            cursor: pointer;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .passed {
            color: #4CAF50;
            font-weight: bold;
        }
        .failed {
            color: #f44336;
            font-weight: bold;
        }
        .summary {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #e9ecef;
            border-radius: 4px;
        }
        .summary span {
            margin-right: 20px;
        }
        .view-trace {
            padding: 6px 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-bottom: 5px;
        }
        .view-trace:hover {
            background-color: #0056b3;
        }
        .view-trace:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .note {
            margin-top: 20px;
            padding: 10px;
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 4px;
            color: #856404;
        }
        .command {
            font-family: monospace;
            background-color: #f8f9fa;
            padding: 5px;
            border-radius: 4px;
            font-size: 0.8em;
            color: #666;
            display: block;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test Execution Report</h1>
        <div class="summary">
            <span>Total Tests: <strong id="totalTests">0</strong></span>
            <span>Passed: <strong id="passedTests" style="color: #4CAF50">0</strong></span>
            <span>Failed: <strong id="failedTests" style="color: #f44336">0</strong></span>
            <span>Duration: <strong id="totalDuration">0s</strong></span>
            <div style="margin-top: 10px;">
                <a href="${getPlaywrightReportPath()}" class="view-trace" style="text-decoration: none;" target="_blank">
                    View Detailed Playwright Report
                </a>
            </div>
        </div>
        <div class="filters">
            <select id="suiteFilter">
                <option value="">All Suites</option>
            </select>
            <select id="statusFilter">
                <option value="">All Statuses</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
            </select>
        </div>
        <div class="note">
            Note: You can view traces either in the web viewer or locally using the provided command.
        </div>
        <table id="resultsTable">
            <thead>
                <tr>
                    <th onclick="sortTable(0)">Suite Name ↕</th>
                    <th onclick="sortTable(1)">Test Case ID ↕</th>
                    <th onclick="sortTable(2)">Title ↕</th>
                    <th onclick="sortTable(3)">Status ↕</th>
                    <th onclick="sortTable(4)">Duration ↕</th>
                    <th>Trace</th>
                </tr>
            </thead>
            <tbody>
`;

// Process test results
let tableRows = '';
let suites = new Set();
let totalDuration = 0;
let passedTests = 0;
let failedTests = 0;

reportData.suites.forEach(suite => {
    suite.suites.forEach(subSuite => {
        const suiteName = subSuite.title;
        suites.add(suiteName);
        
        subSuite.specs.forEach(spec => {
            spec.tests.forEach(test => {
                const testId = test.annotations.find(a => a.type === 'zephyrId')?.description || 'N/A';
                const status = test.results[0].status;
                const duration = (test.results[0].duration / 1000).toFixed(2);
                
                // Find trace attachment if it exists
                const traceAttachment = test.results[0].attachments?.find(a => a.name === 'trace');
                const tracePath = traceAttachment ? traceAttachment.path : null;
                
                status === 'passed' ? passedTests++ : failedTests++;
                totalDuration += parseFloat(duration);
                
                tableRows += `
                    <tr data-suite="${suiteName}" data-status="${status}">
                        <td>${suiteName}</td>
                        <td>${testId}</td>
                        <td>${spec.title}</td>
                        <td class="${status}">${status.toUpperCase()}</td>
                        <td>${duration}s</td>
                        <td>
                            ${tracePath ? 
                                `<a href="${getTraceViewerUrl(tracePath)}" 
                                    target="_blank" 
                                    class="view-trace"
                                    data-trace-path="${tracePath}">
                                    View Trace
                                </a>` : 
                                '<button class="view-trace" disabled>No Trace</button>'}
                        </td>
                    </tr>
                `;
            });
        });
    });
});

const finalHtml = htmlContent + tableRows + `
            </tbody>
        </table>
    </div>
    <script>
        // Update summary
        document.getElementById('totalTests').textContent = '${passedTests + failedTests}';
        document.getElementById('passedTests').textContent = '${passedTests}';
        document.getElementById('failedTests').textContent = '${failedTests}';
        document.getElementById('totalDuration').textContent = '${totalDuration.toFixed(2)}s';

        // Populate suite filter
        const suiteFilter = document.getElementById('suiteFilter');
        ${JSON.stringify([...suites])}.forEach(suite => {
            const option = document.createElement('option');
            option.value = suite;
            option.textContent = suite;
            suiteFilter.appendChild(option);
        });

        // Filter function
        function filterTable() {
            const selectedSuite = suiteFilter.value;
            const selectedStatus = document.getElementById('statusFilter').value;
            const rows = document.querySelectorAll('#resultsTable tbody tr');

            rows.forEach(row => {
                const suiteName = row.getAttribute('data-suite');
                const status = row.getAttribute('data-status');
                const showSuite = !selectedSuite || suiteName === selectedSuite;
                const showStatus = !selectedStatus || status === selectedStatus;
                row.style.display = showSuite && showStatus ? '' : 'none';
            });
        }

        // Sort function
        function sortTable(n) {
            const table = document.getElementById('resultsTable');
            let rows, switching, i, x, y, shouldSwitch, dir = 'asc';
            switching = true;
            while (switching) {
                switching = false;
                rows = table.rows;
                for (i = 1; i < (rows.length - 1); i++) {
                    shouldSwitch = false;
                    x = rows[i].getElementsByTagName('td')[n];
                    y = rows[i + 1].getElementsByTagName('td')[n];
                    if (dir === 'asc') {
                        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                            shouldSwitch = true;
                            break;
                        }
                    } else if (dir === 'desc') {
                        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                }
                if (shouldSwitch) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                }
            }
        }

        // Add copy command function
        function copyCommand(button) {
            const command = button.getAttribute('data-command');
            navigator.clipboard.writeText(command).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Command Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            });
        }

        // Add event listeners
        suiteFilter.addEventListener('change', filterTable);
        document.getElementById('statusFilter').addEventListener('change', filterTable);
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(outputFile, injectBaseUrl(finalHtml));
console.log(`Interactive HTML report generated successfully: ${outputFile}`);

// Create an index.html that serves as the landing page
const landingHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Test Results</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
        }
        .nav-links {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
        }
        .nav-links a {
            display: inline-block;
            padding: 10px 20px;
            margin-right: 10px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .nav-links a:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="nav-links">
        <a href="./summary.html">View Summary Report</a>
        <a href="./index.html">View Detailed Report</a>
    </div>
    <script>
        // Redirect to summary by default
        if (window.location.pathname.endsWith('home.html')) {
            window.location.href = './summary.html';
        }
    </script>
</body>
</html>`;

// Save the landing page
fs.writeFileSync(path.join(PLAYWRIGHT_REPORT_DIR, 'home.html'), landingHtml);

// If we're in development mode and OPEN_REPORT is set
if (process.env.OPEN_REPORT) {
    (async () => {
        try {
            const availablePort = await findAvailablePort(DEFAULT_PORT);
            const openCommand = process.platform === 'win32' ? 'start' : 'open';
            require('child_process').exec(`${openCommand} http://localhost:${availablePort}/playwright-report/summary.html`);
            console.log(`Report will be available at: http://localhost:${availablePort}/playwright-report/summary.html`);
        } catch (err) {
            console.error('Error finding available port:', err);
        }
    })();
} 