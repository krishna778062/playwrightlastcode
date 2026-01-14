#!/usr/bin/env node

/**
 * Resource Monitor for CI Pipelines
 * ==================================
 * Captures system resource metrics including DISK SPACE at regular intervals.
 *
 * Usage:
 *   node scripts/resource-monitor.js [options]
 *
 * Options:
 *   --output, -o    Output file path (default: test-results/resource-metrics)
 *   --interval, -i  Sampling interval in seconds (default: 5)
 *   --format, -f    Output format: json, csv, or both (default: both)
 *   --quiet, -q     Suppress console output
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  output: 'test-results/resource-metrics',
  interval: 5,
  format: 'both',
  quiet: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--output':
    case '-o':
      options.output = args[++i].replace(/\.(json|csv)$/, '');
      break;
    case '--interval':
    case '-i':
      options.interval = parseInt(args[++i], 10);
      break;
    case '--format':
    case '-f':
      options.format = args[++i];
      break;
    case '--quiet':
    case '-q':
      options.quiet = true;
      break;
  }
}

// Ensure output directory exists
function ensureOutputDir() {
  const outputDir = path.dirname(options.output);
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}
ensureOutputDir();

// Data storage
const metrics = [];
const startTime = Date.now();
let peakMemory = 0;
let peakChromeMemory = 0;
let maxChromeProcesses = 0;
let minDiskAvailable = Infinity;

// Helper to get process info
function getProcessInfo(pattern) {
  try {
    const cmd = `ps aux | grep -E "${pattern}" | grep -v grep | awk '{sum += $6; count++} END {print (count ? count : 0) "," int(sum/1024)}'`;
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    const [count, memMB] = result.split(',').map(Number);
    return { count: count || 0, memoryMB: memMB || 0 };
  } catch {
    return { count: 0, memoryMB: 0 };
  }
}

// Get disk usage - ENHANCED
function getDiskUsage() {
  try {
    const platform = os.platform();
    if (platform === 'win32') {
      return { usedGB: 0, availableGB: 0, totalGB: 0, usedPercent: 0 };
    }

    // Get disk info for root filesystem
    const result = execSync('df -BG / | tail -1', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    // Parse: Filesystem 1G-blocks Used Available Use% Mounted
    const parts = result.split(/\s+/);
    const totalGB = parseInt(parts[1]) || 0;
    const usedGB = parseInt(parts[2]) || 0;
    const availableGB = parseInt(parts[3]) || 0;
    const usedPercent = parseInt(parts[4]) || 0;

    return { usedGB, availableGB, totalGB, usedPercent };
  } catch {
    // Fallback for macOS or other systems
    try {
      const result = execSync('df -h / | tail -1', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      const parts = result.split(/\s+/);
      const parseSize = s => {
        if (!s) return 0;
        const num = parseFloat(s);
        if (s.includes('T')) return num * 1024;
        if (s.includes('G')) return num;
        if (s.includes('M')) return num / 1024;
        return num;
      };

      return {
        totalGB: parseSize(parts[1]),
        usedGB: parseSize(parts[2]),
        availableGB: parseSize(parts[3]),
        usedPercent: parseInt(parts[4]) || 0,
      };
    } catch {
      return { usedGB: 0, availableGB: 0, totalGB: 0, usedPercent: 0 };
    }
  }
}

// Get working directory size
function getWorkDirSize() {
  try {
    const result = execSync('du -sm . 2>/dev/null | cut -f1', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return parseInt(result) || 0;
  } catch {
    return 0;
  }
}

// Capture a single metric snapshot
function captureMetrics() {
  const now = Date.now();
  const elapsedSec = Math.round((now - startTime) / 1000);

  // Memory info
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  // Process info
  const chromeInfo = getProcessInfo('chrome|chromium|Chrome');
  const nodeInfo = getProcessInfo('node');

  // Disk info - ENHANCED
  const disk = getDiskUsage();
  const workDirMB = getWorkDirSize();

  // Load average
  const loadAvg = os.loadavg();

  // Track peaks and minimums
  const usedMemMB = Math.round(usedMem / 1024 / 1024);
  if (usedMemMB > peakMemory) peakMemory = usedMemMB;
  if (chromeInfo.memoryMB > peakChromeMemory) peakChromeMemory = chromeInfo.memoryMB;
  if (chromeInfo.count > maxChromeProcesses) maxChromeProcesses = chromeInfo.count;
  if (disk.availableGB < minDiskAvailable && disk.availableGB > 0) minDiskAvailable = disk.availableGB;

  const metric = {
    timestamp: new Date().toISOString(),
    elapsedSec,
    system: {
      platform: os.platform(),
      memoryTotalMB: Math.round(totalMem / 1024 / 1024),
      memoryUsedMB: usedMemMB,
      memoryFreeMB: Math.round(freeMem / 1024 / 1024),
      memoryPercent: parseFloat(((usedMem / totalMem) * 100).toFixed(1)),
      loadAvg: {
        '1m': loadAvg[0].toFixed(2),
        '5m': loadAvg[1].toFixed(2),
      },
      // DISK INFO - ENHANCED
      diskTotalGB: disk.totalGB,
      diskUsedGB: disk.usedGB,
      diskAvailableGB: disk.availableGB,
      diskUsedPercent: disk.usedPercent,
      workDirMB: workDirMB,
    },
    processes: {
      chrome: chromeInfo,
      node: nodeInfo,
    },
  };

  metrics.push(metric);
  return metric;
}

// Convert metrics to CSV format
function metricsToCSV() {
  if (metrics.length === 0) return '';

  const headers = [
    'timestamp',
    'elapsed_sec',
    'memory_used_mb',
    'memory_total_mb',
    'memory_percent',
    'disk_used_gb',
    'disk_available_gb',
    'disk_total_gb',
    'disk_used_percent',
    'work_dir_mb',
    'load_avg_1m',
    'chrome_processes',
    'chrome_memory_mb',
    'node_processes',
    'node_memory_mb',
  ];

  const rows = metrics.map(m =>
    [
      m.timestamp,
      m.elapsedSec,
      m.system.memoryUsedMB,
      m.system.memoryTotalMB,
      m.system.memoryPercent,
      m.system.diskUsedGB,
      m.system.diskAvailableGB,
      m.system.diskTotalGB,
      m.system.diskUsedPercent,
      m.system.workDirMB,
      m.system.loadAvg['1m'],
      m.processes.chrome.count,
      m.processes.chrome.memoryMB,
      m.processes.node.count,
      m.processes.node.memoryMB,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// Generate summary report
function generateSummary() {
  if (metrics.length === 0) return null;

  const first = metrics[0];
  const last = metrics[metrics.length - 1];

  return {
    duration: {
      startTime: first.timestamp,
      endTime: last.timestamp,
      totalSeconds: last.elapsedSec,
    },
    memory: {
      startMB: first.system.memoryUsedMB,
      endMB: last.system.memoryUsedMB,
      deltaMB: last.system.memoryUsedMB - first.system.memoryUsedMB,
      peakMB: peakMemory,
    },
    // DISK SUMMARY - ENHANCED
    disk: {
      totalGB: first.system.diskTotalGB,
      startUsedGB: first.system.diskUsedGB,
      startAvailableGB: first.system.diskAvailableGB,
      endUsedGB: last.system.diskUsedGB,
      endAvailableGB: last.system.diskAvailableGB,
      deltaGB: last.system.diskUsedGB - first.system.diskUsedGB,
      minAvailableGB: minDiskAvailable === Infinity ? last.system.diskAvailableGB : minDiskAvailable,
      workDirStartMB: first.system.workDirMB,
      workDirEndMB: last.system.workDirMB,
      workDirDeltaMB: last.system.workDirMB - first.system.workDirMB,
    },
    chrome: {
      peakProcesses: maxChromeProcesses,
      peakMemoryMB: peakChromeMemory,
      finalProcesses: last.processes.chrome.count,
      finalMemoryMB: last.processes.chrome.memoryMB,
    },
    node: {
      finalProcesses: last.processes.node.count,
      finalMemoryMB: last.processes.node.memoryMB,
    },
    warnings: generateWarnings(first, last),
    sampleCount: metrics.length,
  };
}

// Generate warnings
function generateWarnings(first, last) {
  const warnings = [];

  // Memory warnings
  const memDelta = last.system.memoryUsedMB - first.system.memoryUsedMB;
  if (memDelta > 500) {
    warnings.push(`⚠️ HIGH MEMORY GROWTH: Memory increased by ${memDelta}MB`);
  }
  if (last.system.memoryPercent > 90) {
    warnings.push(`⚠️ HIGH MEMORY USAGE: ${last.system.memoryPercent}% of RAM used`);
  }

  // DISK WARNINGS - ENHANCED
  const diskDelta = last.system.diskUsedGB - first.system.diskUsedGB;
  if (diskDelta > 5) {
    warnings.push(`⚠️ HIGH DISK GROWTH: Disk usage increased by ${diskDelta}GB`);
  }
  if (last.system.diskAvailableGB < 5) {
    warnings.push(`⚠️ LOW DISK SPACE: Only ${last.system.diskAvailableGB}GB available!`);
  }
  if (last.system.diskUsedPercent > 90) {
    warnings.push(`⚠️ DISK NEARLY FULL: ${last.system.diskUsedPercent}% used`);
  }

  const workDirDelta = last.system.workDirMB - first.system.workDirMB;
  if (workDirDelta > 1000) {
    warnings.push(`⚠️ LARGE WORK DIR GROWTH: Working directory grew by ${workDirDelta}MB`);
  }

  // Chrome warnings
  if (maxChromeProcesses > 20) {
    warnings.push(`⚠️ MANY CHROME PROCESSES: Peak of ${maxChromeProcesses} Chrome processes`);
  }
  if (peakChromeMemory > 2048) {
    warnings.push(`⚠️ HIGH CHROME MEMORY: Chrome used up to ${peakChromeMemory}MB`);
  }

  return warnings;
}

// Save metrics to file
function saveMetrics() {
  ensureOutputDir();
  const summary = generateSummary();

  if (options.format === 'json' || options.format === 'both') {
    const jsonOutput = { summary, timeline: metrics };
    fs.writeFileSync(`${options.output}.json`, JSON.stringify(jsonOutput, null, 2));
  }

  if (options.format === 'csv' || options.format === 'both') {
    fs.writeFileSync(`${options.output}.csv`, metricsToCSV());
  }
}

// Print to console
function log(message) {
  if (!options.quiet) {
    console.log(message);
  }
}

// Print metric
function printMetric(m) {
  if (options.quiet) return;

  const disk = m.system;
  const chrome = m.processes.chrome;

  console.log(
    `📊 [${String(m.elapsedSec).padStart(4)}s] ` +
      `RAM: ${disk.memoryUsedMB}/${disk.memoryTotalMB}MB (${disk.memoryPercent}%) | ` +
      `Disk: ${disk.diskAvailableGB}GB free / ${disk.diskTotalGB}GB (${disk.diskUsedPercent}% used) | ` +
      `Chrome: ${chrome.count} (${chrome.memoryMB}MB)`
  );
}

// Print final summary
function printSummary(summary) {
  if (options.quiet || !summary) return;

  console.log('\n' + '='.repeat(80));
  console.log('📊 RESOURCE MONITOR SUMMARY');
  console.log('='.repeat(80));

  console.log(`\n⏱️  Duration: ${summary.duration.totalSeconds}s`);

  console.log('\n💾 Memory:');
  console.log(
    `   Start: ${summary.memory.startMB} MB → End: ${summary.memory.endMB} MB (Δ ${summary.memory.deltaMB > 0 ? '+' : ''}${summary.memory.deltaMB} MB)`
  );
  console.log(`   Peak: ${summary.memory.peakMB} MB`);

  console.log('\n💿 Disk:');
  console.log(`   Total: ${summary.disk.totalGB} GB`);
  console.log(`   Start: ${summary.disk.startUsedGB} GB used, ${summary.disk.startAvailableGB} GB free`);
  console.log(`   End:   ${summary.disk.endUsedGB} GB used, ${summary.disk.endAvailableGB} GB free`);
  console.log(`   Delta: ${summary.disk.deltaGB > 0 ? '+' : ''}${summary.disk.deltaGB} GB`);
  console.log(`   Min Available: ${summary.disk.minAvailableGB} GB`);
  console.log(
    `   Work Dir: ${summary.disk.workDirStartMB} MB → ${summary.disk.workDirEndMB} MB (Δ ${summary.disk.workDirDeltaMB > 0 ? '+' : ''}${summary.disk.workDirDeltaMB} MB)`
  );

  console.log('\n🌐 Chrome:');
  console.log(`   Peak: ${summary.chrome.peakProcesses} processes, ${summary.chrome.peakMemoryMB} MB`);

  if (summary.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    summary.warnings.forEach(w => console.log(`   ${w}`));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Shutdown handler
function shutdown() {
  log('\n📊 Stopping resource monitor...');
  saveMetrics();
  printSummary(generateSummary());
  process.exit(0);
}

// Register signal handlers
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

// Main
log('📊 Resource Monitor Started');
log(`   Output: ${options.output}.(json|csv)`);
log(`   Interval: ${options.interval}s`);
log(`   Platform: ${os.platform()}`);
log('');

// Initial capture
const initial = captureMetrics();
printMetric(initial);

// Start monitoring loop
setInterval(() => {
  const m = captureMetrics();
  printMetric(m);

  // Save periodically
  if (metrics.length % 10 === 0) {
    saveMetrics();
  }
}, options.interval * 1000);

// Save on exit
process.on('exit', () => saveMetrics());
