## 📋 Pull Request

### Description

<!-- Briefly describe what this PR does -->

### Related Issue/Ticket

<!-- Link to issue or ticket if applicable -->

---

## 🏷️ PR Type

> **Check ONE that applies:**

- [ ] 🚀 **Feature** - New test cases, helpers, utilities (target: `develop`)
- [ ] 🔧 **Automation TC Fix** - Fix flaky tests, update locators, stabilize tests
- [ ] 🚨 **Hotfix** - Urgent fix (target: `main` or `release`)
- [ ] 📦 **Release** - Release preparation (`develop` → `release`)

---

## 🎯 Target Branch

> **Where is this PR going?**

- [ ] `develop` - Regular development
- [ ] `release` - Fix needed during QA/UAT cycle
- [ ] `main` - Production hotfix

---

## 🔄 Backport Options

> **After merge, sync this change to:**

- [x] **Develop** - Sync to `develop` (recommended for all fixes)
- [ ] **Release** - Sync to `release` (only if QA/UAT needs this fix)

> ℹ️ **When does backporting apply?**
>
> - PR to `main` → Reads checkboxes above, creates sync PRs accordingly
> - PR to `release` → Automatically syncs to `develop` (no checkbox needed)
> - PR to `develop` → No backporting needed

---

## ✅ Checklist

- [ ] I have tested this change locally
- [ ] All existing tests pass
- [ ] Code follows project conventions
