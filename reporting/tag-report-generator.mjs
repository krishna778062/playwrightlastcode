/**
 * Tag Report HTML Generator - Creates HTML Report for Tag-wise Test Results
 *
 * This generates comprehensive HTML reports with:
 * - Tag statistics table for better analysis
 * - Known failures tracking so we can track issues
 * - Functionality for better user experience
 */

import { formatDate, formatDuration, isPriorityTag } from './tag-report.mjs';

/**
 * Create HTML table rows for known failures
 * @param {KnownFailure[]} knownFailures - Array of known failure objects
 * @returns {string} - HTML table rows for known failures
 */
function generateKnownFailuresTableRows(knownFailures) {
  if (!knownFailures || knownFailures.length === 0) {
    return `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-gray-500">
          <div class="text-4xl mb-2">✅</div>
          <div class="font-medium">No Known Failures</div>
          <div class="text-sm">All tests are passing or have been fixed!</div>
        </td>
      </tr>`;
  }

  return knownFailures
    .sort((a, b) => {
      // First sort by priority: High > Medium > Low
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const priorityA = priorityOrder[a.priority] || 0;
      const priorityB = priorityOrder[b.priority] || 0;

      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }

      // If same priority, sort by bug reported date (oldest first to show longest outstanding issues)
      const dateA = a.bugReportedDate === 'Unknown' ? new Date(0) : new Date(a.bugReportedDate);
      const dateB = b.bugReportedDate === 'Unknown' ? new Date(0) : new Date(b.bugReportedDate);
      return dateA - dateB;
    })
    .map((failure, index) => {
      const rowClass = index % 2 === 0 ? '' : 'bg-gray-50';
      const formattedDate =
        failure.bugReportedDate === 'Unknown'
          ? 'Unknown'
          : new Date(failure.bugReportedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

      // Handle long test names with truncation
      const maxTestNameLength = 60;
      const maxSuiteNameLength = 35;

      // truncation that tries to break at word boundaries
      function smartTruncate(text, maxLength) {
        if (text.length <= maxLength) return text;

        // Try to find a good break point (space, dash, underscore)
        const truncated = text.substring(0, maxLength - 3);
        const lastSpace = truncated.lastIndexOf(' ');
        const lastDash = truncated.lastIndexOf('-');
        const lastUnderscore = truncated.lastIndexOf('_');

        // Use the best break point found
        const breakPoint = Math.max(lastSpace, lastDash, lastUnderscore);

        if (breakPoint > maxLength * 0.7) {
          // Only use break point if it's not too early
          return truncated.substring(0, breakPoint) + '...';
        } else {
          return truncated + '...';
        }
      }

      const truncatedTestName = smartTruncate(failure.testName, maxTestNameLength);
      const truncatedSuiteName = smartTruncate(failure.suiteName, maxSuiteNameLength);

      const testNameTooltip = failure.testName.length > maxTestNameLength ? `title="${failure.testName}"` : '';
      const suiteNameTooltip = failure.suiteName.length > maxSuiteNameLength ? `title="${failure.suiteName}"` : '';

      // Priority color coding
      const priorityColors = {
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Low: 'bg-green-100 text-green-800',
      };
      const priorityColor = priorityColors[failure.priority] || 'bg-gray-100 text-gray-800';

      return `
        <tr class="${rowClass} hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 cursor-pointer">
          <td class="px-4 py-2 text-sm text-center">
            ${
              failure.testCaseNo && failure.testCaseNo.startsWith('INT-')
                ? `<a href="index.html#?testId=${failure.testId || ''}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium font-mono">${failure.testCaseNo}</a>`
                : `<span class="text-gray-600 font-mono">${failure.testCaseNo || 'N/A'}</span>`
            }
          </td>
          <td class="px-4 py-2 text-center text-base font-bold text-gray-900 test-name-cell">
            <div ${testNameTooltip} class="break-words">${truncatedTestName}</div>
            <div class="text-xs text-gray-500 break-words" ${suiteNameTooltip}>${truncatedSuiteName}</div>
          </td>
          <td class="px-4 py-2 text-sm text-center text-gray-600">${formattedDate}</td>
          <td class="px-4 py-2 text-sm text-center">
            ${
              failure.ticketUrl
                ? `<a href="${failure.ticketUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium">${failure.ticketId}</a>`
                : `<span class="text-gray-500">${failure.ticketId || 'N/A'}</span>`
            }
          </td>
          <td class="px-4 py-2 text-sm text-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColor}">
              ${failure.priority || 'Medium'}
            </span>
          </td>
        </tr>`;
    })
    .join('');
}

/**
 * Create HTML table rows for each tag with its statistics
 * @param {Record<string, TagStats>} tagStats - Object containing tag statistics
 * @returns {string} - HTML table rows
 */
function generateTableRows(tagStats) {
  return Object.entries(tagStats)
    .sort(([a], [b]) => {
      // Simple sorting: priority tags first, then alphabetical
      if (isPriorityTag(a) && !isPriorityTag(b)) return -1;
      if (!isPriorityTag(a) && isPriorityTag(b)) return 1;
      return a.localeCompare(b);
    })
    .map(([tag, stats], index) => {
      // Calculate pass rate excluding known failures (they shouldn't count as failures)
      const actualFailures = stats.failed - (stats.knownFailures || 0);
      const actualTotal = stats.passed + actualFailures;
      const passRate = actualTotal > 0 ? ((stats.passed / actualTotal) * 100).toFixed(2) : '0.00';
      const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      const rowClass = index % 2 === 0 ? '' : 'bg-gray-50';
      const passRateColor =
        parseFloat(passRate) === 100
          ? 'text-pass-green'
          : parseFloat(passRate) === 0
            ? 'text-fail-red'
            : 'text-gray-700';

      return `
        <tr class="${rowClass} hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 cursor-pointer" data-tag="${tag.toLowerCase()}" data-has-failures="${stats.failed > 0 || stats.flaky > 0}" data-has-actual-failures="${actualFailures > 0 || stats.flaky > 0}">
          <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${capitalizedTag}</td>
          <td class="px-4 py-2 whitespace-nowrap text-center text-sm text-pass-green font-medium">${stats.passed}</td>
          <td class="px-4 py-2 whitespace-nowrap text-center text-sm text-fail-red font-medium" title="${stats.knownFailures > 0 ? `${stats.knownFailures} known failures excluded from fail count` : 'No known failures'}">${stats.failed}</td>
          <td class="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-500">${stats.skipped}</td>
          <td class="px-4 py-2 whitespace-nowrap text-center text-sm text-flaky-amber">${stats.flaky}</td>
          <td class="px-4 py-2 whitespace-nowrap text-center text-sm font-medium ${passRateColor}">${passRate}%</td>
        </tr>`;
    })
    .join('');
}

/**
 * Generate CSS styles for the report
 * @returns {string} - Complete CSS styles
 */
function generateStyles() {
  return `
    /* Load Inter Font from Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    /* Light Glossy Page Background - Pale Warm Tint (FORCED LIGHT) */
    :root {
      --bg1: #ffffff;    /* top highlight (Pure White) */
      --bg2: #fcfdf9;    /* mid (Extremely light creamy white) */
      --bg3: #f7f9f2;    /* bottom (Very light pale yellow/green tint) */
    }

    html, body {
      height: 100%;
    }
    
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      /* soft vertical gradient base */
      background: radial-gradient(1200px 800px at 10% 0%, var(--bg1) 0%, var(--bg2) 55%, var(--bg3) 100%);
      /* Allow proper scrolling by removing flex centering */
      min-height: 100vh;
      padding: 1rem; /* Equivalent to p-4 */
    }

    /* glossy sheen + subtle color glow + fine pattern - IMPROVED */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background:
        /* top sheen (More focused and subtle) */
        linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0) 50%) top/100% 180px no-repeat,
        /* left/right glow (further reduced opacity for ultra-subtlety) */
        linear-gradient(120deg, rgba(59,130,246,.01), rgba(255,255,246,0) 60%) top left/70% 100% no-repeat, 
        linear-gradient(300deg, rgba(37,99,235,.005), rgba(255,255,255,0) 60%) top right/70% 100% no-repeat, 
        /* ultra-light diagonal pattern (SVG, repeats) */
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"><g fill="none" stroke="%23e7e9f3" stroke-opacity=".18"><path d="M0 140 140 0"/><path d="M-35 140 140 -35"/><path d="M-70 140 140 -70"/></g></svg>') center/480px repeat;
      filter: blur(.5px) saturate(110%);
    }

    /* browsers that support it get extra "glass" vibe */
    @supports (backdrop-filter: blur(6px)) {
      body::before { 
        backdrop-filter: blur(6px) saturate(160%); 
      }
    }

    /* Custom CSS for the central glossy card (Crisper UI look - IMPROVED) */
    .glass-card {
      /* Slightly increased blur for better frosted effect */
      backdrop-filter: blur(9px);
      -webkit-backdrop-filter: blur(9px); /* Safari support */
      /* Border updated to reflect the light, subtle theme */
      border: 1px solid rgba(255, 255, 255, 0.6); /* Slightly brighter border */
      /* Added inner shadow for "pressed" glass look */
      box-shadow: 
        0 6px 20px 0 rgba(0, 0, 0, 0.03), /* Outer shadow (Soft) */
        inset 0 1px 1px rgba(255, 255, 255, 0.7); /* Inner highlight (Crisp) */
      /* Increased opacity for better UI definition */
      background-color: rgba(255, 255, 255, 0.25); /* Slightly higher opacity */
    }
    
    /* Chrome-style Scrollbar */
    .scroll-container {
      will-change: scroll-position;
      -webkit-overflow-scrolling: touch;
    }
    
    .scroll-container::-webkit-scrollbar {
      width: 17px;
    }
    
    .scroll-container::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.4);
      border: 2px solid transparent;
      background-clip: padding-box;
      border-radius: 9px;
    }
    
    .scroll-container::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .scroll-container::-webkit-scrollbar-thumb:active {
      background-color: rgba(0, 0, 0, 0.6);
    }
    
    .scroll-container::-webkit-scrollbar-track {
      background-color: transparent;
    }
    
    .scroll-container::-webkit-scrollbar-button:single-button {
      background-color: #f1f3f4;
      height: 17px;
      width: 17px;
    }
    
    .scroll-container::-webkit-scrollbar-button:single-button:vertical:decrement {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%235f6368' d='M4 2L1 5h6z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .scroll-container::-webkit-scrollbar-button:single-button:vertical:increment {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%235f6368' d='M4 6L7 3H1z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .scroll-container::-webkit-scrollbar-button:single-button:hover {
      background-color: #e8eaed;
    }
    
    .scroll-container::-webkit-scrollbar-button:single-button:active {
      background-color: #d2d4d7;
    }
    
    /* Sticky Header Performance */
    thead {
      will-change: transform;
    }
    
    /* Modern Toggle Switch */
    .toggle-container {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    
    .toggle-checkbox {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 24px;
    }
    
    .toggle-label:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .toggle-checkbox:checked + .toggle-label {
      background-color: #10b981;
    }
    
    .toggle-checkbox:checked + .toggle-label:before {
      transform: translateX(20px);
    }
    
    .toggle-checkbox:focus + .toggle-label {
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    
    /* Enhanced Search Box */
    .search-box input {
      width: 100%;
      height: 40px;
      padding: 10px 104px 10px 46px;
      border: 1px solid #d5dbe3;
      border-radius: 9999px;
      background: #fff;
      font-size: 14px;
      transition: box-shadow .15s ease, border-color .15s ease;
    }
    
    /* Hide browser's native clear button */
    .search-box input::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }
    
    .search-box input::-ms-clear {
      display: none;
    }
    
    .search-box input::placeholder {
      color: #9aa3ad;
      letter-spacing: .2px;
    }
    
    .search-box input:focus {
      outline: none;
      border-color: #1e55ff;
      box-shadow: 0 0 0 2px rgba(30, 85, 255, .18);
    }
    
    .search-icon {
      position: absolute;
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: #8a94a3;
      pointer-events: none;
      transition: all .15s ease;
    }
    
    .search-box input:not(:placeholder-shown) ~ .search-icon {
      left: auto;
      right: 14px;
      width: 28px;
      height: 28px;
      padding: 3px;
      color: #fff;
      background: #1e55ff;
      border-radius: 8px;
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
    }
    
    .clear-search {
      position: absolute;
      right: 50px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      border: 0;
      background: transparent;
      color: #7b8494;
      cursor: pointer;
      font-size: 14px;
      border-radius: 50%;
      display: none;
      padding: 0;
      line-height: 1;
    }
    
    .clear-search:hover {
      background: #f2f4f7;
      color: #374151;
    }
    
    .search-box input:not(:placeholder-shown) {
      border-width: 2px;
      border-color: #1e55ff;
    }
    
    .search-box input:not(:placeholder-shown) ~ .clear-search {
      display: block;
    }
    
    .search-box input:placeholder-shown {
      border-color: #9aa0a6;
    }
    
    .search-box input:placeholder-shown:hover {
      border-color: #6b7280;
    }
    
    /* Better text handling for known failures table */
    .known-failures-table {
      table-layout: fixed;
    }
    
    .known-failures-table td {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .known-failures-table .test-name-cell {
      min-width: 200px;
      max-width: 300px;
    }
    
  `;
}

/**
 * Generate interactive code for table functionality
 * @returns {string} - Complete interactive code
 */
function generateInteractiveCode() {
  return `
    function filterTable() {
      const inputEl = document.getElementById('searchInput');
      const failureToggle = document.getElementById('failure-toggle');

      const raw = (inputEl?.value || '').toLowerCase().trim();
      const failOnly = !!(failureToggle && failureToggle.checked);

      console.log('=== FILTER DEBUG ===');
      console.log('Toggle element:', failureToggle);
      console.log('Toggle checked:', failOnly);
      console.log('Search term:', raw);

      const tbody = document.querySelector('#resultsTable tbody');
      if (!tbody) return;

      const terms = raw ? raw.split(/[,\s]+/).filter(Boolean) : [];

      const rows = Array.from(tbody.querySelectorAll('tr'));
      let visible = 0;
      let tagExists = false; // Track if any tag matches the search term

      for (const row of rows) {
        const tagName = (row.getAttribute('data-tag') || '').toLowerCase();
        const hasFailures = row.getAttribute('data-has-failures') === 'true';
        const hasActualFailures = row.getAttribute('data-has-actual-failures') === 'true';

        // Improved matching: case-insensitive and handles special characters better
        const nameMatch = terms.length === 0 || terms.some(term => {
          const normalizedTerm = term.toLowerCase().trim();
          return tagName.includes(normalizedTerm) || 
                 tagName.replace(/[^a-z0-9]/g, '').includes(normalizedTerm.replace(/[^a-z0-9]/g, ''));
        });
        
        // When "Show failures only" is ON, only show tags with ACTUAL failures (excluding known failures)
        const failMatch = !failOnly || hasActualFailures;

        // Check if tag exists (regardless of failure status)
        if (nameMatch) {
          tagExists = true;
        }

        const shouldShow = nameMatch && failMatch;
        row.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visible++;

        console.log('Row ' + tagName + ': hasFailures=' + hasFailures + ', hasActualFailures=' + hasActualFailures + ', failMatch=' + failMatch + ', nameMatch=' + nameMatch + ', shouldShow=' + shouldShow);
      }

      console.log('Total visible rows:', visible);
      console.log('==================');

      const noResults = document.getElementById('noResults');
      const noResultsIcon = document.getElementById('noResultsIcon');
      const noResultsTitle = document.getElementById('noResultsTitle');
      const noResultsSubtitle = document.getElementById('noResultsSubtitle');
      const tableWrap = document.getElementById('tableWrapper');

      if (noResults && tableWrap) {
        if (visible === 0) {
          // Update message and icon based on context
          if (failOnly && !raw) {
            // Only failure filter is active - show success icon
            noResultsIcon.textContent = '🎉';
            noResultsIcon.className = 'text-green-500 text-5xl mb-4';
            noResultsTitle.textContent = 'No fails';
            noResultsSubtitle.textContent = 'All tests passed successfully!';
          } else if (failOnly && raw) {
            // Both failure filter and search are active
            if (tagExists) {
              // Tag exists but has no failures - show success message
              noResultsIcon.textContent = '✅';
              noResultsIcon.className = 'text-green-500 text-5xl mb-4';
              noResultsTitle.textContent = 'Great! No failures found';
              noResultsSubtitle.textContent = 'All "' + raw + '" tags are passing successfully!';
            } else {
              // Tag doesn't exist - show not found message
              noResultsIcon.textContent = '🔍';
              noResultsIcon.className = 'text-gray-400 text-5xl mb-4';
              noResultsTitle.textContent = 'No tags found';
              noResultsSubtitle.textContent = 'Try another search term';
            }
          } else if (!failOnly && raw) {
            // Only search is active
            noResultsIcon.textContent = '🔍';
            noResultsIcon.className = 'text-gray-400 text-5xl mb-4';
            noResultsTitle.textContent = 'No tags found';
            noResultsSubtitle.textContent = 'Try another search term';
          } else {
            // No filters active (shouldn't happen, but fallback)
            noResultsIcon.textContent = '🔍';
            noResultsIcon.className = 'text-gray-400 text-5xl mb-4';
            noResultsTitle.textContent = 'No tags found';
            noResultsSubtitle.textContent = 'No test results available';
          }
          noResults.classList.remove('hidden');
          tableWrap.classList.add('hidden');
        } else {
          noResults.classList.add('hidden');
          tableWrap.classList.remove('hidden');
        }
      }
    }

    function clearSearch() {
      const inputEl = document.getElementById('searchInput');
      if (!inputEl) return;
      
      inputEl.value = '';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      filterTable();
      inputEl.focus();
    }

    // Global sort state to persist across function calls
    let sortState = {
      column: -1,
      direction: 'asc'
    };

    function sortTable(columnIndex) {
      const table = document.getElementById('resultsTable');
      if (!table) return;
      
      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      // Determine sort direction
      if (sortState.column === columnIndex) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortState.column = columnIndex;
        sortState.direction = 'asc';
      }

      // Get all visible rows (excluding header)
      const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => 
        row.style.display !== 'none'
      );

      // Sort the rows
      rows.sort((a, b) => {
        const aText = a.cells[columnIndex]?.textContent?.trim().replace('%', '') || '';
        const bText = b.cells[columnIndex]?.textContent?.trim().replace('%', '') || '';
        
        // Try to parse as numbers first
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);
        
        let comparison = 0;
        if (!isNaN(aNum) && !isNaN(bNum)) {
          // Both are numbers
          comparison = aNum - bNum;
        } else {
          // String comparison
          comparison = aText.localeCompare(bText);
        }
        
        // Apply sort direction
        return sortState.direction === 'asc' ? comparison : -comparison;
      });

      // Re-append sorted rows to tbody
      rows.forEach(row => tbody.appendChild(row));

      // Update header indicators
      updateSortIndicators(columnIndex, sortState.direction);
    }

    function updateSortIndicators(activeColumn, direction) {
      const headers = document.querySelectorAll('#resultsTable thead th');
      headers.forEach((header, index) => {
        if (index === activeColumn) {
          header.innerHTML = header.textContent.replace(/[↕↑↓]/g, '') + 
            (direction === 'asc' ? ' ↑' : ' ↓');
        } else {
          header.innerHTML = header.textContent.replace(/[↕↑↓]/g, '') + ' ↕';
        }
      });
    }

    function initializeTable() {
      // Force show all rows immediately
      const tbody = document.querySelector('#resultsTable tbody');
      if (tbody) {
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach((row) => {
          row.style.display = '';
        });
      }
      
      // Hide no results message
      const noResults = document.getElementById('noResults');
      const tableWrap = document.getElementById('tableWrapper');
      if (noResults && tableWrap) {
        noResults.classList.add('hidden');
        tableWrap.classList.remove('hidden');
      }
      
      // Restore toggle state from session storage
      const failureToggle = document.getElementById('failure-toggle');
      if (failureToggle) {
        // Restore state from session storage
        const savedState = sessionStorage.getItem('failure-toggle-state');
        if (savedState !== null) {
          failureToggle.checked = savedState === 'true';
          console.log('Toggle state restored from storage:', failureToggle.checked);
        } else {
          failureToggle.checked = false;
          console.log('Toggle initialized to default OFF');
        }
        
        // Add event listener to save state when changed
        failureToggle.addEventListener('change', function() {
          sessionStorage.setItem('failure-toggle-state', this.checked.toString());
          console.log('Toggle state saved:', this.checked);
          filterTable();
        });
      }
      
      // Bind event listeners
      const inputEl = document.getElementById('searchInput');
      const clearBtn = document.querySelector('.clear-search');
      
      if (inputEl) {
        inputEl.addEventListener('input', filterTable);
        inputEl.addEventListener('keyup', filterTable);
      }
      if (clearBtn) clearBtn.addEventListener('click', clearSearch);
      
      // Force initial filter to ensure clean state
      filterTable();
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initializeTable);
  `;
}

/**
 * Create the complete HTML report with all the styling and content
 * @param {Record<string, TagStats>} tagStats - Tag statistics object
 * @param {Totals} totals - Total counts and pass rate
 * @param {string} timestamp - Test run timestamp
 * @param {number} duration - Test duration in milliseconds
 * @param {string} moduleName - Module name
 * @param {string} testEnv - Test environment
 * @param {KnownFailure[]} [knownFailures=[]] - Array of known failures
 * @returns {string} - Complete HTML report
 */
export function generateHTML(tagStats, totals, timestamp, duration, moduleName, testEnv, knownFailures = []) {
  const { totalTests, totalPassed, totalFailed, totalFlaky, totalKnownFailures, overallPassRate } = totals;
  const formattedDate = formatDate(timestamp);
  const formattedDuration = formatDuration(duration);
  const tableRows = generateTableRows(tagStats);
  const knownFailuresRows = generateKnownFailuresTableRows(knownFailures);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tag-wise Test Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${generateStyles()}
  </style>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'pass-green': '#10b981',
            'fail-red': '#ef4444',
            'flaky-amber': '#f59e0b',
            'primary-blue': '#2563eb',
          }
        }
      }
    }
  </script>
</head>
<body>

  <!-- Main Container Card -->
  <div class="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden mt-8 mb-8">

    <!-- Header Section -->
    <header class="bg-primary-blue text-white p-4 sm:p-6 rounded-t-xl text-center">
      <h1 class="text-2xl sm:text-3xl font-extrabold mb-1">Tag-wise Test Report</h1>
      <div class="text-xs space-y-0.5 mt-2">
        <p class="font-bold text-white"><strong>Module:</strong> ${moduleName.toUpperCase()} | <strong>Environment:</strong> ${testEnv.toUpperCase()}</p>
        <p class="opacity-90"><strong>Test Run Date:</strong> ${formattedDate}</p>
        <p class="opacity-90"><strong>Execution Duration:</strong> ${formattedDuration}</p>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-gray-200 px-6 pt-4">
      <a href="index.html" class="py-2 px-4 text-gray-600 font-medium hover:text-primary-blue transition">Detailed Report</a>
      <button class="py-2 px-4 border-b-2 border-primary-blue text-primary-blue font-semibold">Tag Report</button>
    </div>

    <!-- Report Content -->
    <main class="p-4 sm:p-6">

      <h2 class="text-xl font-bold mb-4 text-gray-800">Summary & Key Metrics</h2>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">

        <!-- TOTAL TESTS -->
        <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg shadow-md text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <p class="text-xs font-semibold text-indigo-600 uppercase mb-1">Total Tests</p>
          <p class="text-2xl font-extrabold text-indigo-700">${totalTests}</p>
        </div>

        <!-- PASSED -->
        <a href="index.html#?q=s:passed" target="_blank" class="p-3 bg-pass-green/10 border border-pass-green/30 rounded-lg shadow-md text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer block no-underline">
          <p class="text-xs font-semibold text-pass-green uppercase mb-1">Passed</p>
          <p class="text-2xl font-extrabold text-pass-green">${totalPassed}</p>
        </a>

        <!-- FAILED -->
        <a href="index.html#?q=s:failed" target="_blank" class="p-3 bg-fail-red/10 border border-fail-red/30 rounded-lg shadow-md text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer block no-underline" title="${totalKnownFailures > 0 ? `${totalKnownFailures} known failures excluded from fail count` : 'No known failures'}">
          <p class="text-xs font-semibold text-fail-red uppercase mb-1">Failed</p>
          <p class="text-2xl font-extrabold text-fail-red">${totalFailed + totalKnownFailures}</p>
        </a>

        <!-- KNOWN FAILURES -->
        <div class="p-3 bg-orange-100 border border-orange-300 rounded-lg shadow-md text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <p class="text-xs font-semibold text-orange-600 uppercase mb-1">Known Failures</p>
          <p class="text-2xl font-extrabold text-orange-600">${totalKnownFailures}</p>
        </div>
    
        <!-- FLAKY -->
        <a href="index.html#?q=s:flaky" target="_blank" class="p-3 bg-flaky-amber/10 border border-flaky-amber/30 rounded-lg shadow-md text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer block no-underline">
          <p class="text-xs font-semibold text-flaky-amber uppercase mb-1">Flaky</p>
          <p class="text-2xl font-extrabold text-flaky-amber">${totalFlaky}</p>
        </a>

        <!-- PASS RATE (KPI) -->
        <div class="p-3 bg-primary-blue text-white rounded-lg shadow-lg text-center flex flex-col justify-center transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
          <p class="text-xs font-semibold uppercase mb-1">Overall Pass Rate</p>
          <p class="text-2xl font-black">${overallPassRate.toFixed(2)}%</p>
        </div>
      </div>
    
      <!-- Filter and Search Section -->
      <div class="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <!-- Search Input -->
        <div class="w-full sm:w-[450px]">
          <div class="search-box relative">
            <input
              id="searchInput"
              type="text"
              placeholder="Search tags… e.g., P1, P2, Absolute"
              aria-label="Search tags"
              aria-controls="resultsTable"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              oninput="filterTable()"
            />
            <button class="clear-search" onclick="clearSearch()" aria-label="Clear search">×</button>
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>

        <!-- Toggle Switch for Failures Only -->
        <div class="flex items-center space-x-3">
          <span class="text-sm font-medium text-gray-700 select-none">Show failures only</span>
          <div class="toggle-container">
            <input type="checkbox" id="failure-toggle" class="toggle-checkbox" onchange="filterTable()"/>
            <label for="failure-toggle" class="toggle-label"></label>
          </div>
        </div>
      </div>

      <!-- Tag Report Table -->
      <div class="overflow-x-auto scroll-container border border-gray-200 rounded-lg shadow-inner max-h-[400px] overflow-y-auto" id="tableWrapper">
        <table class="min-w-full divide-y divide-gray-200" id="resultsTable">
          <thead class="bg-gradient-to-r from-blue-600 to-blue-500 sticky top-0 z-10 shadow-md">
            <tr>
              <th scope="col" class="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700" onclick="sortTable(0)">TAG NAME ↕</th>
              <th scope="col" class="px-4 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700" onclick="sortTable(1)">PASSED ↕</th>
              <th scope="col" class="px-4 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700" onclick="sortTable(2)">FAILED ↕</th>
              <th scope="col" class="px-4 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700" onclick="sortTable(3)">SKIPPED ↕</th>
              <th scope="col" class="px-4 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700" onclick="sortTable(4)">FLAKY ↕</th>
              <th scope="col" class="px-4 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700" onclick="sortTable(5)">PASSED % ↕</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            ${tableRows}
          </tbody>
        </table>
      </div>
      
      <!-- No Results Message -->
      <div id="noResults" class="hidden text-center py-10">
        <div id="noResultsIcon" class="text-gray-400 text-5xl mb-4">🔍</div>
        <div id="noResultsTitle" class="text-gray-600 font-semibold">No tags found</div>
        <div id="noResultsSubtitle" class="text-gray-500 text-sm mt-2">Try another search term</div>
      </div>

      <!-- Known Failures Section -->
      <div class="mt-12">
        <h2 class="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <span class="text-2xl mr-2">⚠️</span>
          Known Failures
          <span class="ml-2 text-sm font-normal text-gray-500">(${knownFailures.length})</span>
        </h2>
        
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto scroll-container border border-gray-200 rounded-lg shadow-inner max-h-[400px] overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200 known-failures-table">
              <thead class="bg-gradient-to-r from-orange-500 to-orange-400 sticky top-0 z-10 shadow-md">
                <tr>
                  <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Test Case No
                  </th>
                  <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]">
                    Test Name
                  </th>
                  <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Bug Reported Date
                  </th>
                  <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${knownFailuresRows}
              </tbody>
            </table>
          </div>
        </div>
        
        ${
          knownFailures.length > 0
            ? `
          <div class="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div class="flex items-start">
              <div class="text-orange-600 text-lg mr-3">ℹ️</div>
              <div class="text-sm text-orange-800">
                <p class="font-medium mb-1">About Known Failures</p>
                <p>These are tests that are currently failing but have been identified as known issues with tracking tickets. They are excluded from failure counts in the main report.</p>
              </div>
            </div>
          </div>
        `
            : `
          <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <div class="text-blue-600 text-lg mr-3">ℹ️</div>
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">What are Known Failures?</p>
                <p class="mb-2">Known failures are tests that are currently failing but have been identified as known issues with tracking tickets. They help distinguish between:</p>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Actual failures:</strong> New issues that need immediate attention</li>
                  <li><strong>Known failures:</strong> Existing issues with tickets that are being tracked</li>
                </ul>
                <p class="mt-2 text-xs text-blue-700">When tests have known failure annotations, they are excluded from failure counts to give you a clearer picture of your test suite's health.</p>
              </div>
            </div>
          </div>
        `
        }
      </div>
    
      <!-- Footer Timestamp -->
      <p class="mt-8 text-xs text-gray-400 text-center">Report created: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: process.env.CI ? 'Asia/Kolkata' : undefined })}</p>
    </main>
  </div>
  
  <script>
    ${generateInteractiveCode()}
  </script>
</body>
</html>`;
}
