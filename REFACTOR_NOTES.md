# REFACTOR_NOTES

## Phase 0 Scope

This document captures the read-only analysis for Phase 0 of the Backoffice RMS refactor.

- Project analyzed:
  - `src/App.jsx`
  - `src/main.jsx`
  - `package.json`
- Explicitly ignored:
  - `node_modules/`
  - `dist/`
  - `__MACOSX/`
  - `.DS_Store`
- No application code was modified during this analysis.

## 1. App Structure And Entry Flow

- `package.json` defines a minimal React + Vite app with `dev`, `build`, and `preview` scripts.
- `src/main.jsx` is a thin entrypoint:
  - imports React and ReactDOM
  - imports `App` from `./App.jsx`
  - mounts `<App />` into `#app` under `React.StrictMode`
- `src/App.jsx` contains nearly the entire application:
  - embedded global CSS
  - icon definitions and asset mapping
  - static page configuration
  - seed data builders and in-memory records
  - reusable UI components
  - layout components
  - page renderers
  - application state orchestration and routing

## 2. Major Sections Inside `App.jsx`

Observed structure of `src/App.jsx`:

1. Imports
2. `APP_STYLES` embedded CSS string
3. Icon helpers and icon definitions
4. Static assets/constants/configuration
5. Pure utility functions and record/draft builders
6. Initial in-memory data store and state factory helpers
7. Reusable component definitions
8. `export default function App()`
9. Large `App` orchestration block:
   - state setup
   - effects and DOM listeners
   - derived data and filtering logic
   - page navigation handlers
   - CRUD handlers for catalog, category, unit, modifier, pricing, selling time, devices
   - page-level render functions
   - root shell and modal composition

Key scale observations:

- `src/App.jsx` is approximately `42,274` lines.
- `App` begins around line `24,368`.
- `App` contains:
  - `116` `useState` calls
  - `52` `useEffect` calls
  - `32` internal `render*` functions
- There are `79` top-level reusable component functions defined before `App`.

## 3. CSS Location (`APP_STYLES`)

- CSS currently lives in `src/App.jsx` inside:
  - `const APP_STYLES = String.raw\`...\``
- It is injected at the application root using:
  - `<style>{APP_STYLES}</style>`
- The CSS block contains:
  - font import
  - root tokens
  - resets/base rules
  - typography utilities
  - full application styles for layout, tables, forms, pages, cards, panels, modals, and dashboard visuals

Phase 1 should move this block verbatim into `src/styles/app.css` without changing selectors or class names.

## 4. Static Data / Constants Candidates

Strong extraction candidates for `src/constants/`:

- `MENU`
- `PAGE_CONFIGS`
- `DETAIL_PAGE_PARENT`
- `INITIAL_SETTINGS_FORM`
- `PRICING_OVERRIDE_GROUPS`
- `SELLING_TIME_DAY_OPTIONS`
- `DEFAULT_PRICING_OVERRIDE_MAXIMUMS`
- `PRICING_RULE_MONTH_LABELS`
- `BUSINESS_UNIT_ASSIGNMENT_GROUPS`
- `UNIT_PRECISION_OPTIONS`
- `SIMULATED_PAIRING_REQUEST_DEVICES`
- `SALES_SUMMARY_RANGE_TABS`
- `DASHBOARD_REPORT_TIME_RANGE_OPTIONS`
- `ALL_BUSINESS_UNITS_LABEL`
- `LOCKED_BUSINESS_UNIT_NAMES`

Additional constant-style extraction candidates:

- icon asset metadata
- icon SVG definition map
- dashboard tabs/options
- default filters/page-size/page-state maps

## 5. Utility Function Candidates

Strong extraction candidates for `src/utils/`:

### Pricing

- pricing override normalization/formatting
- pricing rule date parsing/formatting
- pricing rule draft cloning/validation
- pricing override selection and synchronization

### Catalog / Modifier / Unit / Category

- package item normalization and updates
- assigned-unit normalization and synchronization
- draft builders for catalog/category/unit/modifier
- detail draft cloning/validation helpers
- catalog photo helpers
- modifier option formatting/helpers

### Selling Time

- selling-time slot builders/cloners
- day schedule builders
- validation key builders
- detail draft validation helpers
- row builders/display helpers

### General Table / Filters / Formatting

- IDR / nominal formatting helpers
- pagination helpers
- filter option builders
- search/filter/sort helpers

### Dashboard

- dashboard date utilities
- dashboard report range normalization
- dashboard aggregation utilities
- trend window utilities
- metric and chart data builders
- report detail generators
- cash/financial/dashboard dataset generators

### Initial State Factories

- `createInitialDataStore`
- `createInitialSearchState`
- `createInitialFiltersState`
- `createInitialRowsPerPageState`
- `createInitialPageState`
- `createInitialSelectedRowsState`

## 6. Reusable UI Component Candidates

Strong extraction candidates for `src/components/ui/`:

- `LabButton`
- `SelectShell`
- `Toggle`
- `LabCheckbox`
- `EmptyState`
- `Snackbar`
- `TablePagination`
- `TableFooterBar`
- `Field`
- `DetailField`
- `DetailSelectField`
- `DetailReadField`
- `DetailSection`
- `InlineEditActions`
- `TableActionButton`
- `CreatePanelStepTabs`
- `CreatePanelFooter`

Form/control components that can be split later:

- `SingleFilterChip`
- `FilterChip`
- `SingleSelectFilterChip`
- `InlineSelect`
- `DashboardInlineSelect`
- `PricingRuleDateField`
- `SellingTimeNameField`
- `SellingTimeTimeField`
- `ModifierCatalogSelectField`
- `ModifierCreateNameField`
- `ModifierCreateNumberField`
- `ModifierOptionPriceField`
- `PackageItemSelectField`
- `CatalogTypeField`
- `PriceField`

Modal/dialog candidates:

- `UnitAssignmentModal`
- `DiscardChangesModal`
- `DeleteConfirmationModal`
- `DeviceStatusConfirmationModal`
- `PairingCodeModal`
- `DevicePairingRequestModal`

## 7. Layout Component Candidates

Strong extraction candidates for `src/components/layout/`:

- `Sidebar`
- `TopNavbar`
- `PageHeader`
- `DetailPageHeader`
- `ListPageToolbar`
- `TableToolbar`

Icon extraction candidate:

- `Icon`
- `ChevronIcon`

## 8. Page-Level Section Candidates

Strong extraction candidates for `src/pages/` and page-specific component folders:

### Dashboard

- `renderDashboardPage`
- `renderDashboardReportDetailPage`
- `renderDashboardDiscountReportDetailPage`

Dashboard-specific components already exist inline and are good extraction targets:

- KPI/metric cards
- doughnut/progress/breakdown cards
- line/bar chart panels
- ranked tables
- dashboard tab controls

### Catalog

- `renderCatalogPage`
- `renderCatalogCreatePage`
- `renderCatalogCreateSidePanel`
- `renderCatalogDetailPage`
- `renderCatalogDetailSidePanel`
- `renderCatalogDetailGeneralPanel`
- `renderCatalogDetailUnitAssignmentPanel`

### Pricing

- `renderPricingRulePage`
- `renderPricingRuleCreatePage`
- `renderPricingRuleCreateSidePanel`
- `renderPricingRuleDetailSidePanel`

### Generic List Modules

- `renderGenericListPage`
- category detail/create surfaces
- unit detail/create surfaces
- modifier detail/create surfaces
- selling-time detail/create surfaces
- device-management detail/create surfaces

### Settings

- `renderSettingsPage`

## 9. Risks Before Refactor

### High-risk coupling

- `App` mixes routing, state, effects, data shaping, CRUD flows, and rendering in one scope.
- Many flows depend on shared local state across pages, modals, detail panels, and create panels.

### CSS sensitivity

- The entire UI styling is embedded in one string and injected once.
- Any Phase 1 CSS move must preserve order and content exactly.
- Class names are widely reused across page variants and side panels.

### Global listeners and DOM coupling

- Multiple controls rely on:
  - `window` event listeners
  - `createPortal`
  - `requestAnimationFrame`
  - `setTimeout` / `setInterval`
  - direct DOM queries for focus management and scroll sync
- These are easy to break when moving code between files.

### Shared seed/data assumptions

- The prototype relies on a generated in-memory store and many derived row builders.
- Refactoring must preserve object shapes expected by tables, detail views, and filters.

### Duplicate or fragile logic

- There is a duplicate function name inside `App`:
  - `handleCatalogDetailAssignedUnitChange`
- Later extraction must be careful to preserve the currently effective behavior.

### Draft/edit snapshot complexity

- Category, unit, modifier, pricing rule, selling time, catalog, and device management each maintain draft/edit/snapshot state patterns.
- Refactoring these flows without changing behavior requires moving code, not redesigning the state model during early phases.

## 10. Recommended Extraction Order

Recommended order for safe incremental refactor:

1. Extract CSS only
   - move `APP_STYLES` to `src/styles/app.css`
   - import it in `App.jsx`

2. Extract static constants/config
   - menu, page configs, settings defaults, pricing constants, assignment constants, dashboard options

3. Extract pure utilities
   - formatting, date helpers, pagination, pricing helpers, catalog helpers, dashboard helpers

4. Extract generic shared UI
   - buttons, selects, toggles, checkbox, snackbar, empty state, table pagination/footer, field shells

5. Extract layout components
   - sidebar, navbar, page headers, shared toolbars

6. Extract page-specific components
   - dashboard
   - catalog
   - pricing
   - device management
   - settings
   - generic list/detail/create panels

7. Reduce `App` to orchestration
   - state
   - derived selectors
   - navigation
   - modal composition
   - page switching

## Summary

The codebase already contains the pieces needed for the target architecture, but they are collapsed into one file. The safest path is to preserve behavior exactly and extract in this order:

- CSS
- constants
- pure helpers
- shared UI
- layout
- pages
- final `App` cleanup

This keeps the refactor incremental, reversible, and aligned with the original Phase 0 requirements.
