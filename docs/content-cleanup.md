# Content Module Cleanup Plan

> **Created:** December 26, 2024  
> **Last Updated:** December 26, 2024  
> **Status:** 🚧 Phase 2 IN PROGRESS  
> **Goal:** Simplify over-engineered patterns while maintaining functionality  
> **Approach:** Incremental changes, test after each step, no breaking changes

---

## Executive Summary

The content module had accumulated architectural overhead that added complexity without proportional value:

- **Actions/Assertions interfaces** that provided no polymorphism benefits
- **Pass-through methods** that just delegate to components
- **Large helper classes** that mix concerns

This cleanup removed the over-engineered interface patterns from all files.

---

## Phase 1: Remove Actions/Assertions Interface Pattern ✅ COMPLETE

### Problem Statement

The pattern looked like this in pages:

```typescript
export interface IFeedActions {
  createAndPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
  // ... 180+ method signatures
}

export interface IFeedAssertions {
  verifyPostDetails: (postText: string, expectedAttachmentCount: number) => Promise<void>;
  // ... 95+ method signatures
}

export class FeedPage extends BasePage implements IFeedActions, IFeedAssertions {
  get actions(): IFeedActions {
    return this;
  }

  get assertions(): IFeedAssertions {
    return this;
  }
  // ...
}
```

### Why This Was Over-Engineering

1. **No polymorphism** - `return this` meant no interface abstraction
2. **No dependency injection** - Tests never swapped implementations
3. **Triple maintenance** - Method signatures duplicated in 3 places
4. **No type safety benefit** - TypeScript already provides intellisense
5. **Massive boilerplate** - 277+ lines in `FeedPage` alone

### Files Cleaned Up

#### Pages (46 files):

- `feedPage.ts` - ~277 lines removed
- `manageContentPage.ts` - ~102 lines removed
- `siteCreationPage.ts` - ~44 lines removed
- `manageSitePage.ts` - ~40 lines removed
- `eventDetailPage.ts`
- `addSiteScreenPage.ts`
- `favoritePage.ts`
- `ORGChatPage.ts`
- `contentModerationQueuePage.ts`
- `manageApplicationDefaultHomeFeedPage.ts`
- `manageUsersPage.ts`
- `peopleScreenPage.ts`
- `editContentPage.ts`
- `socialCampaignSettingPage.ts`
- `mySettingsNotificationsPage.ts`
- `manageFeaturePage.ts`
- `siteCategoriesPage.ts`
- `manageSiteSetUpPage.ts`
- `applicationsScreenPage.ts`
- `editPagePage.ts`
- `manageApplicationDefaultScreenPage.ts`
- `editAudienceGroupModalPage.ts`
- `albumCreationPage.ts`
- `activityNotificationPage.ts`
- `sitesListPage.ts`
- `siteDetailsPage.ts`
- `audienceModalPage.ts`
- `manageApplicationPage.ts`
- `contentPreviewPage.ts`
- `sitesPage.ts`
- `editSitePage.ts`
- `featuredSitePage.ts`
- `pageCreationPage.ts`
- `topicDetailsPage.ts`
- `favoritesPage.ts`
- `contentStudioPageCreationPage.ts`
- `governanceScreenPage.ts`
- `manageSitePageCategoryPage.ts`
- `homeDashboardPage.ts`
- `editTemplatePage.ts`
- `addCampaignPage.ts`
- `privilegesScreenPage.ts`
- `siteCreationPageAbac.ts`
- `profileScreenPage.ts`
- `manageTopicsPage.ts`
- `userProfilePage.ts`
- `eventCreationPage.ts`
- `sitePages/siteContentPage.ts`
- `sitePages/siteDashboardPage.ts`
- `socialCampaignPage.ts`
- `manageFeaturesPage.ts`

#### Components (14 files):

- `createFeedPostComponent.ts` - ~69 lines removed
- `listOfSocialCampaignComponent.ts`
- `inappropriateContentWarningPopupComponent.ts`
- `reportPostModalComponent.ts`
- `editFileComponent.ts`
- `contentStudioToolbarComponent.ts`
- `carouselComponent.ts`
- `subscriptionComponent.ts`
- `recognitionDialogComponent.ts`
- `shareComponent.ts`
- `createQuestionComponent.ts`
- `listFeedComponent.ts`
- `notificationComponent.ts`
- `editBarComponent.ts`
- `recognitionFormComponent.ts`

### Test Files Updated

All test files using patterns like:

- `page.actions.method()` → `page.method()`
- `page.assertions.method()` → `page.method()`

Were automatically updated across **77+ test files**.

---

## Impact Summary

| Metric                         | Before    | After   |
| ------------------------------ | --------- | ------- |
| Interface definitions          | ~60 files | 0 files |
| Lines of boilerplate           | ~2000+    | 0       |
| `get actions()` accessors      | ~60       | 0       |
| `get assertions()` accessors   | ~60       | 0       |
| Test file `.actions.` calls    | ~1800+    | 0       |
| Test file `.assertions.` calls | ~1200+    | 0       |

---

## Phase 2: Eliminate Pass-Through Methods 🚧 IN PROGRESS

### Problem Statement

~80% of page methods are single-line pass-throughs:

```typescript
async createAndPost(options: FeedPostOptions): Promise<FeedPostResult> {
  return await this.createFeedPostComponent.createAndPost(options);
}
```

### Solution Applied

Expose components directly and only keep orchestration methods:

```typescript
export class ManageContentPage extends BasePage {
  /** Component for managing content list, filters, bulk actions */
  readonly manageContent: ManageContentComponent;

  /** Component for onboarding-related operations */
  readonly onboarding: OnboardingComponent;

  // Only keep methods that add value (API waiting, orchestration)
  async selectSortOption(sortBy: SortOptionLabels): Promise<void> {
    await this.performActionAndWaitForResponse(
      () => this.manageContent.selectSortOption(sortBy),
      response => response.url().includes(API_ENDPOINTS.content.contentListInSite)
    );
  }
}
```

### Files Cleaned Up (Phase 2)

#### ✅ ManageContentPage (COMPLETE)

| Metric                     | Before | After                             |
| -------------------------- | ------ | --------------------------------- |
| Lines of code              | 423    | 115                               |
| Pass-through methods       | ~70    | 0                                 |
| Exposed components         | 0      | 2 (`manageContent`, `onboarding`) |
| Orchestration methods kept | -      | 4                                 |

**Test files updated:** 9 files

- `manage-content-app-manager.spec.ts`
- `manage-content-end-user.spec.ts`
- `content-filter-app-manager.spec.ts`
- `content-filter-end-manager.spec.ts`
- `manageSite-app-manager.spec.ts`
- `manageSite-end-user.spec.ts`
- `tiles.spec.ts`
- `event-app-manager.spec.ts`
- `feed-settings.spec.ts`

**Test file pattern change:**

```typescript
// Before
await manageContentPage.writeRandomTextInSearchBar(title);
await manageContentPage.clickSearchIcon();

// After
await manageContentPage.manageContent.writeRandomTextInSearchBar(title);
await manageContentPage.manageContent.searchIcon();
```

#### ⏳ Remaining Pages (Priority Order)

| Priority  | Page               | Lines | Pass-Through Methods | Status  |
| --------- | ------------------ | ----- | -------------------- | ------- |
| 🔴 HIGH   | FeedPage           | 1418  | ~100+                | Pending |
| 🟠 MEDIUM | ContentPreviewPage | 568   | ~35-40               | Pending |
| 🟡 LOW    | SiteDashboardPage  | 408   | ~25-30               | Pending |

### Status: 🚧 IN PROGRESS (ManageContentPage complete)

---

## Phase 3: Split Large Helpers (FUTURE)

### Problem Statement

`SiteManagementHelper` is 1707 lines mixing:

- Site creation
- Membership management
- Content approval
- Site queries

### Proposed Solution

Split into focused helpers:

- `SiteCreationHelper` - Create sites
- `SiteMembershipHelper` - Manage members
- `SiteQueryHelper` - Find/filter sites
- `SiteContentHelper` - Content approval/rejection

### Status: ⏳ PENDING

---

## Testing Verification

To verify the cleanup worked, run:

```bash
# Run all content module tests
npx playwright test --grep "@content" --reporter=list

# Or run specific test categories
npx playwright test src/modules/content/tests --reporter=list
```

---

## Progress Tracker

| Phase | Step                       | Status      | Date       | Notes                       |
| ----- | -------------------------- | ----------- | ---------- | --------------------------- |
| 1     | Remove all interfaces      | ✅ COMPLETE | 2024-12-26 | 60 files cleaned            |
| 1     | Remove all accessors       | ✅ COMPLETE | 2024-12-26 | 60 files cleaned            |
| 1     | Update all test files      | ✅ COMPLETE | 2024-12-26 | 77+ test files updated      |
| 2     | ManageContentPage cleanup  | ✅ COMPLETE | 2024-12-26 | 308 lines removed           |
| 2     | FeedPage cleanup           | ✅ COMPLETE | 2024-12-26 | 758 lines removed, 29 tests |
| 2     | ContentPreviewPage cleanup | ⏳ PENDING  | -          | After FeedPage              |
| 2     | SiteDashboardPage cleanup  | ⏳ PENDING  | -          | Lower priority              |
| 3     | Helper splitting           | ⏳ PENDING  | -          | Future iteration            |

---

## Notes & Decisions

### 2024-12-26 (Phase 2 Start)

- **Started Phase 2: Eliminate Pass-Through Methods**
- **Completed ManageContentPage cleanup** as first reference implementation
  - Reduced from 423 lines to 115 lines (~73% reduction)
  - Exposed 2 components: `manageContent`, `onboarding`
  - Kept 4 orchestration methods (API waiting, multi-step flows)
  - Updated 9 test files with new component access pattern
- **Key learnings:**
  - Manual review required - cannot script semantic understanding
  - Each page variable name needs separate sed patterns
  - Keep methods that wait for API responses or combine components
- **Next:** FeedPage (largest, ~100+ pass-through methods)

### 2024-12-26 (Phase 1)

- **Completed full Phase 1 cleanup**
- Removed ~2000+ lines of interface definitions and accessor boilerplate
- Updated all test files automatically using sed
- Verified no TypeScript errors or critical linting issues
- Pattern simplified: `page.actions.method()` → `page.method()`
- **Ready for testing verification**
