# Workflow Migration Guide

## Overview

This document describes the migration from multiple regression workflow templates to a single unified template.

## Background

### Problem Statement

The original workflow architecture had **9 regression-related workflow files** with significant code duplication (~800 lines):

| File                            | Lines | Purpose                               |
| ------------------------------- | ----- | ------------------------------------- |
| `regression-template.yml`       | 294   | Main reusable template                |
| `uat-regression-template.yml`   | 324   | UAT-specific template (90% duplicate) |
| `prod-healthcheck-template.yml` | 288   | Prod template (90% duplicate)         |
| `regression-daily-test.yml`     | 29    | Daily cron trigger                    |
| `release-regression-qa.yml`     | 49    | QA release trigger                    |
| `release-regression-uat.yml`    | 15    | UAT release trigger                   |
| `content-regression-test.yml`   | 457   | Content-specific                      |
| `de-automation-test.yml`        | 342   | DE-specific                           |
| `integrations-regression.yml`   | 320   | Integrations-specific                 |

### Issues with Old Architecture

1. **Code Duplication**: Same steps repeated in 3 template files
2. **Inconsistent Module Lists**: Different templates had different modules
3. **Scattered Branch Logic**: Rules spread across 4+ files
4. **Maintenance Burden**: Changes needed in multiple places

## New Architecture

### Design Philosophy

**Keep it simple**. The unified template:

- Runs ALL tests for each module (no filtering by priority/type)
- For filtered runs, use the existing `e2e.yml` workflow

### Single Unified Template

```
regression-unified-template.yml (Single Source of Truth)
├── determine-config job
│   ├── Computes git_ref based on rules
│   ├── Selects module list
│   └── Decides if tests should run
├── regression-tests job
│   ├── Matrix over modules
│   ├── Module-specific handling
│   └── Unified reporting
└── notify-skipped job
    └── Alerts when tests are skipped
```

### Thin Trigger Workflows

```
daily-regression-v2.yml       → trigger_type=daily_cron
qa-release-regression-v2.yml  → trigger_type=qa_release
uat-release-regression-v2.yml → trigger_type=uat_release
prod-healthcheck-v2.yml       → trigger_type=prod_healthcheck
manual-regression-v2.yml      → trigger_type=manual
```

## Branch Selection Rules (Centralized)

All branch selection logic is now in ONE place: `regression-unified-template.yml`

### Decision Table

| Trigger Type       | Environment | CURRENT_STAGE | Git Ref     | Action                          |
| ------------------ | ----------- | ------------- | ----------- | ------------------------------- |
| `daily_cron`       | test        | any           | `develop`   | Run tests                       |
| `qa_release`       | qa          | production    | `main`      | Run tests                       |
| `qa_release`       | qa          | qa            | `release`   | Run tests                       |
| `qa_release`       | qa          | uat           | -           | **SKIP** (QA already validated) |
| `uat_release`      | uat         | production    | `main`      | Run tests                       |
| `uat_release`      | uat         | uat           | `release`   | Run tests                       |
| `uat_release`      | uat         | qa            | -           | **SKIP** (Not promoted yet)     |
| `prod_healthcheck` | prod\*      | any           | `main`      | Run tests                       |
| `manual`           | any         | any           | user choice | Run tests                       |

### Rule Explanation

1. **Daily Cron on Test**: Always uses `develop` branch - tests latest development code
2. **Production Stage**: All environments test from `main` (stable production code)
3. **QA Stage**: QA env tests from `release`, UAT skipped (not promoted)
4. **UAT Stage**: Both QA and UAT test from `release`, QA skip logic ensures no redundant runs

## Module Lists

### Full Regression Module List

All trigger types (daily, qa-release, uat-release, prod-healthcheck, manual) use the same module list:

```json
[
  "chat",
  "platforms",
  "global-search",
  "content",
  "content-settings",
  "content-studio",
  "content-abac",
  "de",
  "de-api",
  "de-api-abac",
  "reward",
  "reward-settings",
  "recognition",
  "privateRecognition",
  "frontline",
  "alert-notification",
  "employee-listening",
  "form-designer",
  "comms-planner"
]
```

### Manual Workflow Presets

The `manual-regression-v2.yml` provides convenient presets:

| Preset             | Modules                                                       |
| ------------------ | ------------------------------------------------------------- |
| `all`              | All modules above                                             |
| `core`             | chat, platforms, global-search, frontline, alert-notification |
| `content`          | content, content-settings, content-studio, content-abac       |
| `data-engineering` | de, de-api, de-api-abac                                       |
| `rewards`          | reward, reward-settings, recognition, privateRecognition      |
| `custom`           | User-provided JSON array                                      |

## Module-Specific Handling

The unified template handles special cases for specific modules:

### Data Engineering Modules (de, de-api, de-api-abac)

- Short names map to full config paths
- `de` → `playwright.data-engineering.config.ts`
- `de-api` → `playwright.data-engineering-api.config.ts`
- `de-api-abac` → `playwright.data-engineering-api-abac.config.ts`

### Reward Modules

- `reward`: Excludes `@rewards-db` and `P3` tests, uses 3 workers
- `reward-settings`: Excludes `@rewards-db` and `P3` tests, uses 1 worker (sequential)

### Content Modules

- Require `CALENDAR_SECRETS` for calendar integration tests
- Template auto-creates `githubSecrets.json` when needed

### Recognition Modules

- `recognition`: Standard recognition tests
- `privateRecognition`: Uses `playwright.only-p2p.config.ts`

## Migration Steps

### Phase 1: Parallel Testing (Current)

New workflows have `-v2` suffix and run alongside existing workflows:

```
regression-template.yml          ← OLD (keep)
regression-unified-template.yml  ← NEW (test)

regression-daily-test.yml        ← OLD (keep)
daily-regression-v2.yml          ← NEW (test)
```

**Action**: Run both old and new workflows in parallel, compare results.

### Phase 2: Validation

1. Trigger `daily-regression-v2.yml` manually
2. Compare with `regression-daily-test.yml` results
3. Verify:
   - Same modules executed
   - Same branch checked out
   - Reports uploaded correctly
   - Slack notifications sent

### Phase 3: Cutover

Once validated:

1. Rename old files with `.backup` suffix
2. Remove `-v2` suffix from new files
3. Update any external references

### Phase 4: Cleanup

After 1-2 weeks of stable operation:

1. Delete backup files
2. Remove deprecated standalone workflows:
   - `uat-regression-template.yml`
   - `prod-healthcheck-template.yml`
   - `release-regression-qa.yml`
   - `release-regression-uat.yml`
   - `content-regression-test.yml` (now part of unified template)

## Comparison: Old vs New

### Lines of Code

| Metric         | Old                  | New                  | Savings |
| -------------- | -------------------- | -------------------- | ------- |
| Template files | 906 lines (3 files)  | ~950 lines (1 file)  | -5%     |
| Trigger files  | ~110 lines (4 files) | ~300 lines (5 files) | +173%\* |
| **Total**      | ~1016 lines          | ~1250 lines          | +23%    |

\*Trigger files increased because they now include documentation and module presets.

### Real Savings

The real savings come from:

1. **Single source of truth**: Changes apply everywhere
2. **Consistent behavior**: All environments use same logic
3. **Easier debugging**: One place to check
4. **Better documentation**: Extensive comments inline
5. **Content modules included**: No need for separate content workflow

## Troubleshooting

### Tests Not Running

Check the `determine-config` job output:

- `should_run`: Should be `true`
- `checkout_ref`: Should have a valid branch
- `skip_reason`: Explains why tests were skipped

### Wrong Branch

Verify `CURRENT_STAGE` repository variable:

```bash
gh variable get CURRENT_STAGE
```

Expected values: `production`, `uat`, `qa`

### Module Not Found

Check the module is in the module list:

- Look at `determine-config` job → `modules_json` output
- Add module to the list in `regression-unified-template.yml`

## FAQ

### Q: Why not add filtering (P0, smoke, etc.) to the unified template?

A: To keep the template simple. The unified template runs **all tests** for comprehensive regression coverage. For filtered runs:

- Use the existing `e2e.yml` workflow
- Future: A separate `manual-filtered-regression.yml` can be created if needed

### Q: Can I still run a single module?

A: Yes! Use `manual-regression-v2.yml`:

1. Set `module_preset` to `custom`
2. Enter JSON array in `custom_modules`: `["chat"]`

### Q: What if I need to add a new module?

A: Add to the module list in `regression-unified-template.yml`:

1. Find the `STEP 2: DETERMINE MODULE LIST` section
2. Add module to the JSON array
3. If module needs special handling, add a case in the test execution script

### Q: What happened to content-regression-test.yml?

A: Content modules are now part of the unified template:

- `content`, `content-settings`, `content-studio`, `content-abac` run with all other modules
- Content API tests can be added later with a separate configuration

### Q: Why keep DE/Integrations as separate workflows?

A: These can be migrated to the unified template in the future. They have some custom logic but the pattern is the same - just need to add their module-specific handling.

---

_Document created: December 2024_
_Author: Automation Team_
