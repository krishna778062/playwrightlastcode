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
 * Create HTML table rows for resolved known failures
 * @param {KnownFailure[]} resolvedKnownFailures - Array of resolved known failure objects
 * @returns {string} - HTML table rows for resolved known failures
 */
function generateResolvedKnownFailuresTableRows(resolvedKnownFailures) {
  if (!resolvedKnownFailures || resolvedKnownFailures.length === 0) {
    return '';
  }

  return resolvedKnownFailures
    .map((failure, index) => {
      const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/50';

      // Truncate test name for display
      const maxLen = 35;
      const truncatedName =
        failure.testName.length > maxLen ? failure.testName.substring(0, maxLen) + '...' : failure.testName;

      return `
        <tr class="${rowClass} hover:bg-emerald-100 transition-colors">
          <td class="px-3 py-1.5 text-xs">
            ${
              failure.testCaseNo && failure.testId
                ? `<a href="index.html#?testId=${failure.testId}" target="_blank" class="text-emerald-600 hover:text-emerald-800 font-mono font-medium">${failure.testCaseNo}</a>`
                : `<span class="text-slate-500 font-mono">${failure.testCaseNo || '-'}</span>`
            }
          </td>
          <td class="px-3 py-1.5 text-xs">
            <div title="${failure.testName}" class="font-medium text-slate-700">${truncatedName}</div>
          </td>
        </tr>`;
    })
    .join('');
}

/**
 * Create HTML table rows for known failures
 * @param {KnownFailure[]} knownFailures - Array of known failure objects
 * @returns {string} - HTML table rows for known failures
 */
function generateKnownFailuresTableRows(knownFailures) {
  if (!knownFailures || knownFailures.length === 0) {
    return `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-gray-500">
          <div class="text-3xl mb-2">✅</div>
          <div class="font-medium text-sm">No Known Failures</div>
        </td>
      </tr>`;
  }

  return knownFailures
    .map((failure, index) => {
      // Truncate test name for display
      const maxLen = 35;
      const truncatedName =
        failure.testName.length > maxLen ? failure.testName.substring(0, maxLen) + '...' : failure.testName;

      // Determine priority badge color
      const priorityStyles = {
        High: 'bg-red-100 text-red-700',
        Medium: 'bg-orange-100 text-orange-700',
        Low: 'bg-green-100 text-green-700',
        Unknown: 'bg-gray-100 text-gray-500',
      };
      const priorityClass = priorityStyles[failure.priority] || priorityStyles['Unknown'];

      return `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td class="px-2 py-2.5 text-sm">
            ${
              failure.testCaseNo && failure.testId
                ? `<a href="index.html#?testId=${failure.testId}" target="_blank" class="text-blue-600 hover:text-blue-800 font-mono text-xs">${failure.testCaseNo}</a>`
                : `<span class="text-gray-500 font-mono text-xs">${failure.testCaseNo || '-'}</span>`
            }
            <div class="text-gray-500 text-xs mt-0.5">${truncatedName}</div>
          </td>
          <td class="px-2 py-2.5 text-sm">
            <div title="${failure.testName}" class="text-gray-700">${failure.suiteName || ''}</div>
          </td>
          <td class="px-2 py-2.5 text-center">
            <span class="px-2 py-0.5 text-xs font-semibold rounded-md ${priorityClass}">${failure.priority || 'Unknown'}</span>
          </td>
          <td class="px-2 py-2.5 text-center">
            ${
              failure.ticketUrl
                ? `<a href="${failure.ticketUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">View</a>`
                : failure.ticketId
                  ? `<span class="text-gray-600 text-sm">${failure.ticketId}</span>`
                  : `<span class="text-gray-400">-</span>`
            }
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
      // Include flaky tests in total count as they indicate instability
      const actualFailures = stats.failed - (stats.knownFailures || 0);
      const actualTotal = stats.passed + actualFailures + stats.flaky;
      const passRate = actualTotal > 0 ? ((stats.passed / actualTotal) * 100).toFixed(2) : '0.00';
      const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';
      const passRateColor =
        parseFloat(passRate) === 100 ? 'text-green-600' : parseFloat(passRate) === 0 ? 'text-red-600' : 'text-gray-700';

      // Simple colored numbers
      const passedText =
        stats.passed > 0
          ? `<span class="text-green-600 font-semibold">${stats.passed}</span>`
          : `<span class="text-gray-400">0</span>`;
      const failedText =
        stats.failed > 0
          ? `<span class="text-red-500 font-semibold">${stats.failed}</span>`
          : `<span class="text-gray-400">0</span>`;
      const skippedText =
        stats.skipped > 0
          ? `<span class="text-gray-600">${stats.skipped}</span>`
          : `<span class="text-gray-400">0</span>`;
      const flakyText =
        stats.flaky > 0
          ? `<span class="text-orange-500 font-semibold">${stats.flaky}</span>`
          : `<span class="text-gray-400">0</span>`;

      return `
        <tr class="${rowClass} hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100" data-tag="${tag.toLowerCase()}" data-has-failures="${stats.failed > 0 || stats.flaky > 0}" data-has-actual-failures="${actualFailures > 0 || stats.flaky > 0}">
          <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${capitalizedTag}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm">${passedText}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm" title="${stats.knownFailures > 0 ? `${stats.knownFailures} known failures excluded from fail count` : 'No known failures'}">${failedText}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm">${skippedText}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm">${flakyText}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold ${passRateColor}">${passRate}%</td>
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

    /* Custom Scrollbar Styling - Minimal & Modern */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    }
    
    /* Table scrollbar */
    #tableWrapper::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    #tableWrapper::-webkit-scrollbar-track {
      background: #e2e8f0;
      border-radius: 5px;
    }
    #tableWrapper::-webkit-scrollbar-thumb {
      background: #3b82f6;
      border-radius: 5px;
    }
    #tableWrapper::-webkit-scrollbar-thumb:hover {
      background: #2563eb;
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
      border: none;
      border-radius: 10px;
      background: #F1F5F9;
      font-size: 14px;
      transition: box-shadow .15s ease, background-color .15s ease;
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
      background: #E2E8F0;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, .2);
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
      table-layout: auto;
    }
    
    .known-failures-table td {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .known-failures-table .test-name-cell {
      min-width: 200px;
      max-width: 300px;
      white-space: normal;
    }
    
    /* Pass Rate Tooltip */
    .pass-rate-card {
      position: relative;
    }
    
    .pass-rate-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      pointer-events: none;
    }
    
    .pass-rate-card:hover .pass-rate-tooltip {
      opacity: 1;
      visibility: visible;
    }
    
    .tooltip-content {
      background-color: #1f2937;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      min-width: 200px;
      max-width: 300px;
      font-size: 12px;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .tooltip-title {
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .tooltip-line {
      margin-bottom: 4px;
    }
    
    .tooltip-formula {
      margin-top: 8px;
      padding-top: 4px;
      border-top: 1px solid #374151;
      font-weight: 600;
    }
    
    .pass-rate-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #1f2937;
    }

    /* Failed Tooltip */
    .failed-card,
    a[href*="s:failed"] {
      position: relative;
    }
    
    .failed-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      pointer-events: none;
    }
    
    .failed-card:hover .failed-tooltip,
    a[href*="s:failed"]:hover .failed-tooltip {
      opacity: 1;
      visibility: visible;
    }
    
    .failed-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #1f2937;
    }

    /* Responsive tooltip adjustments */
    @media (max-width: 768px) {
      .tooltip-content {
        min-width: 180px;
        max-width: 250px;
        font-size: 11px;
        padding: 8px 12px;
      }
      
      .pass-rate-tooltip,
      .failed-tooltip {
        left: 0;
        transform: none;
        margin-left: 8px;
      }
      
      .pass-rate-tooltip::after,
      .failed-tooltip::after {
        left: 20px;
        transform: none;
      }
    }
    
    @media (max-width: 480px) {
      .tooltip-content {
        min-width: 160px;
        max-width: 200px;
        font-size: 10px;
        padding: 6px 10px;
      }
      
      .tooltip-line {
        margin-bottom: 2px;
      }
      
      .tooltip-formula {
        font-size: 10px;
        margin-top: 6px;
        padding-top: 2px;
      }
    }
    
    /* Responsive Tag Results Table - Simplified */
    .tag-results-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    @media (min-width: 1400px) {
      .tag-results-container {
        max-width: 100%;
        margin: 0;
      }
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

      if (!inputEl) return;

      const searchValue = (inputEl.value || '').trim();
      const failOnly = !!(failureToggle && failureToggle.checked);

      const tbody = document.querySelector('#resultsTable tbody');
      if (!tbody) return;

      // Split by comma first, then trim each term
      const terms = searchValue
        .split(',')
        .map(term => term.toLowerCase().trim())
        .filter(term => term.length > 0);

      const rows = Array.from(tbody.querySelectorAll('tr'));
      let visibleCount = 0;
      let tagExists = false;

      rows.forEach((row) => {
        const tagAttr = row.getAttribute('data-tag') || '';
        const tagNormalized = tagAttr.toLowerCase().replace(/^@/, '');
        const hasActualFailures = row.getAttribute('data-has-actual-failures') === 'true';

        // Match if no search OR if tag contains ANY of the search terms (OR logic)
        let isTagMatch = false;
        if (terms.length === 0) {
          isTagMatch = true;
        } else {
          isTagMatch = terms.some(term => tagNormalized.includes(term));
          if (isTagMatch) {
            tagExists = true;
          }
        }

        const isFailureMatch = !failOnly || hasActualFailures;
        const shouldDisplay = isTagMatch && isFailureMatch;

        if (shouldDisplay) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      const noResults = document.getElementById('noResults');
      const noResultsIcon = document.getElementById('noResultsIcon');
      const noResultsTitle = document.getElementById('noResultsTitle');
      const noResultsSubtitle = document.getElementById('noResultsSubtitle');
      const tableWrap = document.getElementById('tableWrapper');

      if (noResults && tableWrap) {
        if (visibleCount === 0) {
          // Update message and icon based on context
          if (failOnly && !searchValue) {
            // Only failure filter is active - show success icon
            noResultsIcon.textContent = '🎉';
            noResultsIcon.className = 'text-green-500 text-5xl mb-4';
            noResultsTitle.textContent = 'No fails';
            noResultsSubtitle.textContent = 'All tests passed successfully!';
          } else if (failOnly && searchValue) {
            // Both failure filter and search are active
            if (tagExists) { // This variable is not defined in the new filterTable, so it will be removed.
              // Tag exists but has no failures - show success message
              noResultsIcon.textContent = '✅';
              noResultsIcon.className = 'text-green-500 text-5xl mb-4';
              noResultsTitle.textContent = 'Great! No failures found';
              noResultsSubtitle.textContent = 'All "' + searchValue + '" tags are passing successfully!';
            } else {
              // Tag doesn't exist - show not found message
              noResultsIcon.textContent = '🔍';
              noResultsIcon.className = 'text-gray-400 text-5xl mb-4';
              noResultsTitle.textContent = 'No tags found';
              noResultsSubtitle.textContent = 'Try another search term';
            }
          } else if (!failOnly && searchValue) {
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
      const track = document.getElementById('toggle-track');
      const dot = document.getElementById('toggle-dot');
      
      if (failureToggle && track && dot) {
        // Restore state from session storage
        const savedState = sessionStorage.getItem('failure-toggle-state');
        if (savedState === 'true') {
          failureToggle.checked = true;
          track.classList.remove('bg-white/30');
          track.classList.add('bg-green-400');
          dot.style.transform = 'translateX(20px)';
        } else {
          failureToggle.checked = false;
        }
        
        // Add event listener to save state when changed
        failureToggle.addEventListener('change', function() {
          sessionStorage.setItem('failure-toggle-state', this.checked.toString());
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

    // Copy code to clipboard
    function copyCode(btn) {
      const pre = btn.parentElement.querySelector('pre');
      const code = pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!';
        btn.classList.add('bg-green-600');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('bg-green-600');
        }, 2000);
      });
    }

    // Filter chips functionality
    let currentFilter = 'all';
    function setFilter(filter) {
      currentFilter = filter;
      const allBtn = document.getElementById('filter-all');
      const failBtn = document.getElementById('filter-failures');
      const flakyBtn = document.getElementById('filter-flaky');
      const failureToggle = document.getElementById('failure-toggle');
      
      // Reset all chips
      [allBtn, failBtn, flakyBtn].forEach(btn => {
        if (btn) {
          btn.classList.remove('bg-white', 'text-blue-700');
          btn.classList.add('bg-white/20', 'text-white');
        }
      });
      
      // Highlight active chip
      const activeBtn = filter === 'all' ? allBtn : filter === 'failures' ? failBtn : flakyBtn;
      if (activeBtn) {
        activeBtn.classList.remove('bg-white/20', 'text-white');
        activeBtn.classList.add('bg-white', 'text-blue-700');
      }
      
      // Apply filter
      const tbody = document.querySelector('#resultsTable tbody');
      if (!tbody) return;
      
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach((row) => {
        const hasFailures = row.getAttribute('data-has-actual-failures') === 'true';
        const flakyCell = row.cells[4];
        const flakyCount = parseInt(flakyCell?.textContent?.trim()) || 0;
        
        if (filter === 'all') {
          row.style.display = '';
        } else if (filter === 'failures') {
          row.style.display = hasFailures ? '' : 'none';
        } else if (filter === 'flaky') {
          row.style.display = flakyCount > 0 ? '' : 'none';
        }
      });
      
      // Update no results state
      const visibleRows = rows.filter(r => r.style.display !== 'none').length;
      const noResults = document.getElementById('noResults');
      const tableWrap = document.getElementById('tableWrapper');
      if (noResults && tableWrap) {
        if (visibleRows === 0) {
          noResults.classList.remove('hidden');
          tableWrap.classList.add('hidden');
        } else {
          noResults.classList.add('hidden');
          tableWrap.classList.remove('hidden');
        }
      }
    }

    // Toggle failures only with visual update
    function toggleFailuresOnly() {
      const checkbox = document.getElementById('failure-toggle');
      const track = document.getElementById('toggle-track');
      const dot = document.getElementById('toggle-dot');
      
      if (!checkbox || !track || !dot) return;
      
      checkbox.checked = !checkbox.checked;
      
      if (checkbox.checked) {
        track.classList.remove('bg-[#D1D5DB]');
        track.classList.add('bg-green-400');
        dot.style.transform = 'translateX(20px)';
      } else {
        track.classList.remove('bg-green-400');
        track.classList.add('bg-[#D1D5DB]');
        dot.style.transform = 'translateX(0)';
      }
      
      // Save state to session storage
      sessionStorage.setItem('failure-toggle-state', checkbox.checked.toString());
      
      filterTable();
    }

    // Make functions globally accessible
    window.filterTable = filterTable;
    window.clearSearch = clearSearch;
    window.sortTable = sortTable;
    window.copyCode = copyCode;
    window.setFilter = setFilter;
    window.toggleFailuresOnly = toggleFailuresOnly;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeTable);
    } else {
      // DOM is already loaded, initialize immediately
      initializeTable();
    }
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
export function generateHTML(
  tagStats,
  totals,
  timestamp,
  duration,
  moduleName,
  testEnv,
  knownFailureData = { activeKnownFailures: [], resolvedKnownFailures: [] }
) {
  const { totalTests, totalPassed, totalFailed, totalSkipped, totalFlaky, totalKnownFailures, overallPassRate } =
    totals;
  const formattedDate = formatDate(timestamp);
  const formattedDuration = formatDuration(duration);
  const tableRows = generateTableRows(tagStats);
  const knownFailuresRows = generateKnownFailuresTableRows(knownFailureData.activeKnownFailures);
  const resolvedKnownFailuresRows = generateResolvedKnownFailuresTableRows(knownFailureData.resolvedKnownFailures);

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
            'pass-green': '#22C55E',
            'fail-red': '#EF4444',
            'flaky-orange': '#F97316',
            'skip-blue': '#3B82F6',
            'known-orange': '#F97316',
            'flaky-purple': '#8B5CF6',
            'primary-blue': '#3B82F6',
            'secondary-blue': '#1E3A8A',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-[#F5F7FB] min-h-screen">

  <!-- Main Container -->
  <div class="w-full">

    <!-- Header Bar -->
    <header class="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white px-6 py-5 shadow-md">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold flex items-center gap-3">
          <span class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">📊</span>
          Tag Report
        </h1>
        <div class="flex items-center gap-4 text-sm">
          <span class="font-medium">${formattedDate}</span>
          <span class="flex items-center gap-1.5 font-medium">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>
            ${formattedDuration}
          </span>
        </div>
      </div>
    </header>

    <!-- Report Content -->
    <main class="p-4">

      <!-- Summary Metrics Row - Pill Badges -->
      <div class="flex items-center gap-4 mb-5 flex-wrap">
        <a href="index.html" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all no-underline shadow-sm">
          <span class="font-bold text-lg">${totalTests}</span>
          <span class="text-sm opacity-90">total</span>
        </a>
        <a href="index.html#?q=s:passed" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all no-underline shadow-sm">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
          <span class="font-bold text-lg">${totalPassed}</span>
          <span class="text-sm opacity-90">passed</span>
        </a>
        <a href="index.html#?q=s:failed" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all no-underline shadow-sm failed-card relative">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          <span class="font-bold text-lg">${totalFailed + totalKnownFailures}</span>
          <span class="text-sm opacity-90">failed</span>
          <div class="failed-tooltip">
            <div class="tooltip-content">
              <div class="tooltip-line">Total: ${totalFailed + totalKnownFailures} | Known: ${totalKnownFailures} | Actual: ${totalFailed}</div>
            </div>
          </div>
        </a>
        <a href="index.html#?q=s:failed" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all no-underline shadow-sm">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          <span class="font-bold text-lg">${totalKnownFailures}</span>
          <span class="text-sm opacity-90">known</span>
        </a>
        <a href="index.html#?q=s:skipped" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all no-underline shadow-sm">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l8 6-8 6V4z"></path><path d="M14 4h2v12h-2V4z"></path></svg>
          <span class="font-bold text-lg">${totalSkipped}</span>
          <span class="text-sm opacity-90">skip</span>
        </a>
        <a href="index.html#?q=s:flaky" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all no-underline shadow-sm">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path></svg>
          <span class="font-bold text-lg">${totalFlaky}</span>
          <span class="text-sm opacity-90">flaky</span>
        </a>
        <div class="pass-rate-card flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-800 rounded-xl shadow-sm cursor-pointer relative border border-slate-200">
          <span class="font-bold text-xl">${overallPassRate.toFixed(1)}%</span>
          <span class="text-sm text-slate-600">pass rate</span>
          <svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
          <div class="pass-rate-tooltip">
            <div class="tooltip-content">
              <div class="tooltip-formula">${totalPassed} ÷ ${totalPassed + totalFailed + totalFlaky} = ${overallPassRate.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2-Column Layout - Equal Width -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- LEFT: Tag Results -->
        <div class="bg-white rounded-2xl overflow-hidden" style="border: 1px solid #F0F0F0; box-shadow: 0px 2px 8px rgba(0,0,0,0.04);">
          <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold flex items-center gap-2">
              🏷️ Tag Results
            </h3>
            <!-- Failures Only Toggle -->
            <label class="flex items-center gap-2 cursor-pointer" onclick="toggleFailuresOnly()">
              <span class="text-xs font-medium text-white/90">Failures only</span>
              <div class="relative w-11 h-6">
                <input type="checkbox" id="failure-toggle" class="sr-only"/>
                <div id="toggle-track" class="absolute inset-0 bg-[#D1D5DB] rounded-full transition-colors duration-200"></div>
                <div id="toggle-dot" class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"></div>
              </div>
            </label>
          </div>
          <div class="p-4">
            <div class="search-box relative mb-4">
              <input
                id="searchInput"
                type="text"
                placeholder="Search tags... e.g., P1, P2, Absolute"
                class="w-full text-sm"
                aria-label="Search tags"
                autocomplete="off"
              />
              <button class="clear-search" onclick="clearSearch()">×</button>
              <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <div class="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar" id="tableWrapper">
        <table class="min-w-full" id="resultsTable">
          <thead class="bg-[#E5E7EB] sticky top-0 z-10" style="border-bottom: 1px solid #E4E7EB;">
            <tr>
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition" onclick="sortTable(0)">TAG NAME <span class="text-gray-400">⇅</span></th>
              <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition" onclick="sortTable(1)">PASSED <span class="text-gray-400">⇅</span></th>
              <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition" onclick="sortTable(2)">FAILED <span class="text-gray-400">⇅</span></th>
              <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition" onclick="sortTable(3)">SKIPPED <span class="text-gray-400">⇅</span></th>
              <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition" onclick="sortTable(4)">FLAKY <span class="text-gray-400">⇅</span></th>
              <th scope="col" class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition" onclick="sortTable(5)">PASSED % <span class="text-gray-400">⇅</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            ${tableRows}
          </tbody>
        </table>
      </div>
      
            <!-- No Results -->
            <div id="noResults" class="hidden text-center py-6">
              <div id="noResultsIcon" class="text-slate-400 text-3xl mb-2">🔍</div>
              <div id="noResultsTitle" class="text-slate-600 text-sm font-medium">No tags found</div>
              <div id="noResultsSubtitle" class="text-slate-400 text-xs">Try different search</div>
            </div>
          </div>
        </div>
        <!-- END LEFT -->

        <!-- RIGHT: Known Failures -->
        <div class="bg-white rounded-2xl overflow-hidden" style="border: 1px solid #F0F0F0; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
          <div class="bg-[#FFD8B0] text-orange-900 px-4 py-3 flex items-center justify-between border-b border-orange-300">
            <h3 class="text-base font-bold flex items-center gap-2">
              ⚠️ Known Failures
            </h3>
            <span class="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">${knownFailureData.activeKnownFailures.length}</span>
          </div>
          <div class="p-3">
            <div class="overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th class="px-2 py-2 text-left font-semibold text-gray-600 uppercase text-xs">Test Case</th>
                    <th class="px-2 py-2 text-left font-semibold text-gray-600 uppercase text-xs">Test Name</th>
                    <th class="px-2 py-2 text-center font-semibold text-gray-600 uppercase text-xs">Priority</th>
                    <th class="px-2 py-2 text-center font-semibold text-gray-600 uppercase text-xs">Ticket</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-orange-50">
                  ${knownFailuresRows}
                </tbody>
              </table>
            </div>
        
          ${
            knownFailureData.activeKnownFailures.length > 0
              ? `
            <div class="mt-3 flex items-start gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2.5 rounded-lg">
              <span class="text-orange-500 mt-0.5">ℹ️</span>
              <span><strong>Note:</strong> Known failures are tests that are currently failing but have been identified as known issues with tracking tickets. These are excluded from failure counts.</span>
            </div>
          `
              : `
            <div class="mt-4 text-center py-6 bg-green-50 rounded-xl">
              <span class="text-4xl">✅</span>
              <p class="text-green-700 text-sm font-semibold mt-2">No Known Failures</p>
              <p class="text-green-600 text-xs mt-1">All tests are in good health!</p>
            </div>
          `
          }
          
          <!-- How to Add Known Failure - Accordion -->
          <details class="mt-4 group">
            <summary class="px-3 py-2.5 text-sm font-medium text-blue-600 cursor-pointer bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-between transition-all">
              <span class="flex items-center gap-2">
                💡 <span class="underline">Click here</span> to learn how to add a Known Failure to your test
              </span>
              <svg class="w-4 h-4 text-blue-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <div class="mt-2 relative">
              <button onclick="copyCode(this)" class="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded flex items-center gap-1 transition-colors z-10">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Copy
              </button>
              <pre class="text-xs bg-[#0F172A] text-gray-300 px-4 py-5 rounded-xl overflow-x-auto font-mono leading-relaxed"><code><span class="text-cyan-400">test</span>(
  <span class="text-green-400">'your test name'</span>,
  { <span class="text-purple-400">tag</span>: [TestPriority.<span class="text-orange-400">P0</span>] },
  <span class="text-cyan-400">async</span> ({ appManagerFixture }) => {
    <span class="text-yellow-400">tagTest</span>(test.<span class="text-cyan-400">info</span>(), {
      <span class="text-purple-400">isKnownFailure</span>: <span class="text-orange-400">true</span>,
      <span class="text-purple-400">bugTicket</span>: <span class="text-green-400">'INT-12345'</span>,
      <span class="text-purple-400">bugReportedDate</span>: <span class="text-green-400">'2025-01-15'</span>,
      <span class="text-purple-400">knownFailurePriority</span>: <span class="text-green-400">'Medium'</span>, <span class="text-gray-500">// High, Medium, Low</span>
      <span class="text-purple-400">knownFailureNote</span>: <span class="text-green-400">'Description of the issue'</span>,
      <span class="text-purple-400">zephyrTestId</span>: <span class="text-green-400">'INT-29249'</span>,
    });

    <span class="text-gray-500">// Your test steps here...</span>
  }
);</code></pre>
            </div>
            <div class="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-orange-50 rounded-lg px-3 py-2">
              <span class="text-orange-400">●</span>
              <span>Place <strong>tagTest()</strong> as the first line inside your test function, before any test logic.</span>
            </div>
          </details>

          ${
            knownFailureData.resolvedKnownFailures && knownFailureData.resolvedKnownFailures.length > 0
              ? `
            <div class="mt-4 p-3 bg-[#ECFDF5] rounded-xl">
              <p class="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <span class="bg-green-100 p-1 rounded">✅</span>
                Recently Resolved (${knownFailureData.resolvedKnownFailures.length})
              </p>
              <p class="text-xs text-green-600 mb-3">Tests that were marked as known failures but are now passing.</p>
              <div class="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                ${knownFailureData.resolvedKnownFailures
                  .map(
                    f => `
                  <div class="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
                    <span class="text-green-500 text-lg">✓</span>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-mono text-gray-700">${f.testCaseNo || '-'}</div>
                      <div class="text-xs text-gray-500 truncate" title="${f.testName}">${f.testName.length > 35 ? f.testName.substring(0, 35) + '...' : f.testName}</div>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
          </div>
        </div>
        <!-- END RIGHT -->
      </div>
    
      <!-- Footer -->
      <footer class="mt-6 pb-4 text-center">
        <p class="text-xs text-gray-500 flex items-center justify-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>
          Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short', timeZone: process.env.CI ? 'Asia/Kolkata' : undefined })}
        </p>
      </footer>
    </main>
  </div>
  
  <script>
    ${generateInteractiveCode()}
  </script>
</body>
</html>`;
}
