# Data Engineering Module

This module contains all UI automation, test data, helpers, and components related to the Data Engineering features of the application.

## 🏗️ Architecture Overview

The Data Engineering module follows a **composition-based architecture** with clear separation of concerns:

```
src/modules/data-engineering/
├── constants/           # Enums, constants, and configuration
├── helpers/            # Database query helpers and utilities
├── sqlQueries/         # SQL query definitions
├── ui/                 # UI components and pages
│   ├── components/     # Reusable UI components
│   ├── dashboards/     # Dashboard-specific implementations
│   └── pages/          # Base page objects
└── tests/              # Automated test suites
```

## 🎯 Design Patterns

### 1. **Dashboard Pattern**

Each dashboard follows a **composition pattern** with dedicated metric components:

```typescript
export class ExampleDashboard extends BaseAnalyticsDashboardPage {
  // Dedicated metric components using composition
  readonly heroMetric: HeroMetricComponent;
  readonly tabularMetric: TabularMetricComponent;
  readonly benchmarkMetric: BenchmarkMetricComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.EXAMPLE_DASHBOARD);
    this.heroMetric = new HeroMetricComponent(page, this.thoughtSpotIframe);
    this.tabularMetric = new TabularMetricComponent(page, this.thoughtSpotIframe);
    this.benchmarkMetric = new BenchmarkMetricComponent(page, this.thoughtSpotIframe);
  }
}
```

### 2. **Query Helper Pattern**

All query helpers extend `BaseAnalyticsQueryHelper` and use the `FilterOptions` pattern:

```typescript
export class ExampleDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  async getMetricDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: ExampleSql.METRIC_QUERY,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }
}
```

### 3. **Test Pattern**

All tests use **unified filter configuration** and consistent validation:

```typescript
test.describe('Example Dashboard Tests', () => {
  let testEnvironment: {
    page: Page;
    dashboard: ExampleDashboard;
    queryHelper: ExampleDashboardQueryHelper;
    snowflakeHelper: SnowflakeHelper;
  };
  let testFiltersConfig: FilterOptions;

  test.beforeAll('Setup dashboard with filters', async ({ browser }) => {
    testEnvironment = await setupExampleDashboardForTest(browser, UserRole.APP_MANAGER);

    testFiltersConfig = {
      tenantCode: process.env.ORG_ID!,
      timePeriod: PeriodFilterTimeRange.LAST_30_DAYS,
      departments: ['HR', 'Engineering'],
      locations: ['Location1', 'Location2'],
    };

    await testEnvironment.dashboard.analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
  });
});
```

## 📋 Implementation Guide

### Step 1: Create SQL Queries

Create a new file in `sqlQueries/` with consistent placeholders:

```typescript
// sqlQueries/example.ts
export const ExampleSql = {
  METRIC_QUERY: `
select count(*) as metric_count 
from table_name 
where tenant_code = '{tenantCode}' 
and created_date BETWEEN '{startDate}' AND '{endDate}'
{locationFilter}
{departmentFilter}
{userCategoryFilter}
{companyNameFilter};
  `,
};
```

**Key Points:**

- Use `{tenantCode}` instead of `{orgId}`
- Include all filter placeholders: `{locationFilter}`, `{departmentFilter}`, `{userCategoryFilter}`, `{companyNameFilter}`
- Add semicolons for consistency

### Step 2: Create Query Helper

Extend `BaseAnalyticsQueryHelper` and implement methods with `FilterOptions`:

```typescript
// helpers/exampleQueryHelper.ts
import { ExampleSql } from '../sqlQueries/example';
import { BaseAnalyticsQueryHelper, FilterOptions } from './baseAnalyticsQueryHelper';

export class ExampleDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  async getMetricDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: ExampleSql.METRIC_QUERY,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  async getTabularDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: ExampleSql.TABULAR_QUERY,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }
}
```

**Key Points:**

- All methods use `{ filterBy: FilterOptions }` parameter pattern
- Use `transformQueryWithFilters()` for query processing
- Method names follow `get*DataFromDBWithFilters()` pattern

### Step 3: Create Metric Components

#### Hero Metric Component

```typescript
// ui/dashboards/example/metrics/heroMetric.ts
import { HeroMetricsComponent } from '../../../components/heroMetricsComponent';

export class HeroMetric extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, 'Metric Title');
  }

  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
```

#### Tabular Metric Component

```typescript
// ui/dashboards/example/metrics/tabularMetric.ts
import { TabluarMetricsComponent } from '../../../components/tabluarMetricsComponent';

export enum TabularDataColumns {
  COLUMN_1 = 'Column 1',
  COLUMN_2 = 'Column 2',
  PERCENTAGE_COLUMN = 'Percentage (%)',
}

export class TabularMetric extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, 'Tabular Metric Title');
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Column 1': string;
      'Column 2': number;
      'Percentage (%)': string;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [TabularDataColumns.COLUMN_1]: item['Column 1'],
      [TabularDataColumns.COLUMN_2]: item['Column 2'].toString(),
      [TabularDataColumns.PERCENTAGE_COLUMN]: item['Percentage (%)'],
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, TabularDataColumns.COLUMN_1);
  }
}
```

**Key Points:**

- Use enums for column names
- Method name: `verifyUIDataMatchesWithSnowflakeData()`
- Include data mapper function for type safety

### Step 4: Create Dashboard Class

```typescript
// ui/dashboards/example/exampleDashboard.ts
import { Page } from '@playwright/test';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';
import { HeroMetric } from './metrics/heroMetric';
import { TabularMetric } from './metrics/tabularMetric';

export class ExampleDashboard extends BaseAnalyticsDashboardPage {
  // Dedicated metric components using composition
  readonly heroMetric: HeroMetric;
  readonly tabularMetric: TabularMetric;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.EXAMPLE_DASHBOARD);
    this.heroMetric = new HeroMetric(page, this.thoughtSpotIframe);
    this.tabularMetric = new TabularMetric(page, this.thoughtSpotIframe);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Example page is loaded', async () => {
      await this.heroMetric.verifyMetricIsLoaded();
      await this.tabularMetric.verifyTabluarDataIsLoaded();
    });
  }
}
```

### Step 5: Create Test Files

#### Default State Test

```typescript
// tests/ui-tests/example-dashboard/default-state.spec.ts
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';
import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper, ExampleDashboardQueryHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { ExampleDashboard } from '../../../ui/dashboards';

test.describe(
  'Example Dashboard - Default State Validation',
  {
    tag: [DataEngineeringTestSuite.EXAMPLE, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      dashboard: ExampleDashboard;
      queryHelper: ExampleDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setup dashboard with default filters', async ({ browser }) => {
      testEnvironment = await setupExampleDashboardForTest(browser, UserRole.APP_MANAGER);

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.LAST_30_DAYS,
      };

      const { analyticsFiltersComponent } = testEnvironment.dashboard;
      await analyticsFiltersComponent.verifyFilterComponentIsVisible();
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test('verify hero metric data validation', async () => {
      const { queryHelper } = testEnvironment;

      const expectedMetricValue = await queryHelper.getMetricDataFromDBWithFilters({
        filterBy: testFiltersConfig,
      });

      const heroMetric = testEnvironment.dashboard.heroMetric;
      await heroMetric.verifyMetricValue(expectedMetricValue);
    });

    test('verify tabular metric data validation', async () => {
      const { queryHelper } = testEnvironment;

      const tabularData = await queryHelper.getTabularDataFromDBWithFilters({
        filterBy: testFiltersConfig,
      });

      const tabularMetric = testEnvironment.dashboard.tabularMetric;
      await tabularMetric.verifyUIDataMatchesWithSnowflakeData(tabularData);
    });
  }
);
```

#### Filter Impact Test

```typescript
// tests/ui-tests/example-dashboard/filter-impact.spec.ts
test.describe(
  'Example Dashboard - Filter Impact Validation',
  {
    tag: [DataEngineeringTestSuite.EXAMPLE, '@filter-impact'],
  },
  () => {
    let testEnvironment: {
      /* ... */
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setup dashboard with filters', async ({ browser }) => {
      testEnvironment = await setupExampleDashboardForTest(browser, UserRole.APP_MANAGER);

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.LAST_12_MONTHS,
        departments: ['HR', 'Engineering'],
        locations: ['Location1', 'Location2'],
        userCategories: ['Category1'],
        companyName: ['Company1'],
      };

      await testEnvironment.dashboard.analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    // Test methods follow the same pattern as default state tests
  }
);
```

## 🔧 Key Components Reference

### Base Classes

#### `BaseAnalyticsQueryHelper`

- **Purpose**: Provides common database operations and filter handling
- **Key Method**: `transformQueryWithFilters()` - handles all filter replacements
- **Extend**: All dashboard query helpers should extend this class

#### `BaseAnalyticsDashboardPage`

- **Purpose**: Base class for all analytics dashboard pages
- **Features**: Common navigation, iframe handling, filter components
- **Extend**: All dashboard classes should extend this class

### UI Components

#### `HeroMetricsComponent`

- **Purpose**: For single-value metrics (counts, totals)
- **Key Methods**: `verifyMetricValue()`, `verifyMetricIsLoaded()`

#### `TabluarMetricsComponent`

- **Purpose**: For table-based metrics with multiple columns
- **Key Methods**: `verifyUIDataMatchesWithSnowflakeData()`, `compareUIDataWithDBRecords()`
- **Features**: Automatic data normalization, percentage handling, comma removal

#### `BenchmarkMetricComponent`

- **Purpose**: For metrics with benchmark comparisons
- **Key Methods**: `verifyPercentageMetricValueIsAsExpected()`, `getMetricValueInPercentage()`

### Filter System

#### `FilterOptions` Interface

```typescript
export interface FilterOptions {
  tenantCode: string;
  timePeriod: PeriodFilterOption;
  customStartDate?: string;
  customEndDate?: string;
  locations?: string[];
  departments?: string[];
  segments?: string[];
  userCategories?: string[];
  companyName?: string[];
  groupBy?: GroupByOnUserParameter;
}
```

#### `AnalyticsFiltersComponent`

- **Purpose**: Handles all filter operations
- **Key Method**: `applyFiltersFromConfig(filterOptions: FilterOptions)`

## 📊 Data Validation Patterns

### Hero Metrics

```typescript
// Get data from DB
const expectedValue = await queryHelper.getMetricDataFromDBWithFilters({
  filterBy: testFiltersConfig,
});

// Validate on UI
await metric.verifyMetricValue(expectedValue);
```

### Tabular Metrics

```typescript
// Get data from DB
const dbData = await queryHelper.getTabularDataFromDBWithFilters({
  filterBy: testFiltersConfig,
});

// Validate on UI
await tabularMetric.verifyUIDataMatchesWithSnowflakeData(dbData);
```

### Data Normalization

The system automatically handles:

- **Percentage symbols**: `"28.4%"` → `"28.4"`
- **Comma separators**: `"72,075"` → `"72075"`
- **Precision differences**: Uses `toBeCloseTo()` for percentage comparisons
- **Type conversions**: String to number for numeric comparisons

## 🚀 Best Practices

### 1. **Naming Conventions**

- Query helpers: `{DashboardName}DashboardQueryHelper`
- Metric components: `{MetricName}Metric` or `{MetricName}Metrics`
- Test files: `{scenario}.spec.ts`
- SQL files: `{dashboard-name}.ts`

### 2. **Method Naming**

- Query methods: `get{DataType}DataFromDBWithFilters()`
- Validation methods: `verifyUIDataMatchesWithSnowflakeData()`
- Setup methods: `setup{DashboardName}DashboardForTest()`

### 3. **Error Handling**

- Use `test.step()` for all operations
- Include descriptive error messages
- Use `toBeCloseTo()` for percentage comparisons
- Handle edge cases (empty data, zero values)

### 4. **Test Organization**

- Group related tests in `describe` blocks
- Use consistent tag naming: `@default-state`, `@filter-impact`, `@custom-period`
- Apply filters once in `beforeAll` for efficiency
- Clean up resources in `afterAll`

## 🔍 Troubleshooting

### Common Issues

1. **Filter Application Errors**
   - Ensure `customStartDate` and `customEndDate` are provided for `CUSTOM` period
   - Check that filter values exist in the test environment

2. **Data Comparison Failures**
   - Verify data normalization is working (commas, percentages)
   - Check if precision differences require `toBeCloseTo()` instead of `toBe()`
   - Ensure column names match exactly between UI and DB

3. **Query Execution Errors**
   - Verify SQL placeholders are correct (`{tenantCode}`, not `{orgId}`)
   - Check that all required filter placeholders are included
   - Ensure semicolons are added to SQL queries

### Debugging Tips

1. **Add Console Logs**

   ```typescript
   console.log('DB Data:', dbData);
   console.log('UI Data:', uiData);
   ```

2. **Use Test Steps**

   ```typescript
   await test.step('Debug step', async () => {
     // Debug code here
   });
   ```

3. **Check Data Types**
   ```typescript
   console.log('Expected type:', typeof expectedValue);
   console.log('Actual type:', typeof actualValue);
   ```

## 📚 Examples

See the following files for complete implementations:

- **App Adoption Dashboard**: `ui/dashboards/app-adoption/`
- **Social Interaction Dashboard**: `ui/dashboards/social-interaction/`
- **Test Examples**: `tests/ui-tests/app-adoption-dashboard/`

## 🤝 Contributing

When adding new dashboards or metrics:

1. Follow the established patterns exactly
2. Use the provided base classes and components
3. Include comprehensive tests for all scenarios
4. Update this README if new patterns are introduced
5. Ensure all linting rules pass

---

**Happy Testing! 🎉**
