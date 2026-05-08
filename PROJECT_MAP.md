# Project Map

## Purpose

This project is a React + Vite backoffice app that is mid-refactor. The current goal is to reduce `src/App.jsx` gradually without changing UI or behavior.

The refactor remains conservative:
- shared styles, constants, utilities, and low-level UI are already extracted
- a few safe module/page shells exist
- most panel workflows and workflow orchestration still live in `src/App.jsx`

## Current Folder Structure

```text
/Users/aria/Documents/RMS-Backoffice2
├── AGENTS.md
├── PROJECT_MAP.md
├── REFACTOR_NOTES.md
├── index.html
├── package-lock.json
├── package.json
├── scratch/
├── src/
│   ├── App.jsx
│   ├── logo-labamu.png
│   ├── main.jsx
│   ├── components/
│   │   ├── catalog/
│   │   │   └── Presentational.jsx
│   │   ├── dashboard/
│   │   │   └── Presentational.jsx
│   │   ├── icons/
│   │   │   └── Icon.jsx
│   │   ├── layout/
│   │   │   └── Layout.jsx
│   │   ├── lists/
│   │   │   └── Presentational.jsx
│   │   └── ui/
│   │       └── Primitives.jsx
│   ├── constants/
│   │   ├── assets.js
│   │   ├── catalog.js
│   │   ├── dashboard.js
│   │   ├── devices.js
│   │   ├── menu.js
│   │   ├── pageConfigs.js
│   │   ├── pricing.js
│   │   └── settings.js
│   ├── modules/
│   │   ├── dashboard/
│   │   │   ├── DashboardModule.jsx
│   │   │   ├── pages/
│   │   │   │   └── DashboardOverviewPage.jsx
│   │   │   └── components/
│   │   ├── catalog-management/
│   │   │   ├── catalog/
│   │   │   │   ├── CatalogModule.jsx
│   │   │   │   ├── README.md
│   │   │   │   ├── pages/
│   │   │   │   │   └── CatalogListPage.jsx
│   │   │   │   ├── panels/
│   │   │   │   │   └── README.md
│   │   │   │   └── components/
│   │   │   │       └── README.md
│   │   │   ├── category/
│   │   │   │   ├── README.md
│   │   │   │   ├── pages/
│   │   │   │   │   └── README.md
│   │   │   │   ├── panels/
│   │   │   │   │   └── README.md
│   │   │   │   └── components/
│   │   │   │       └── README.md
│   │   │   ├── unit/
│   │   │   │   ├── README.md
│   │   │   │   ├── pages/
│   │   │   │   │   └── README.md
│   │   │   │   ├── panels/
│   │   │   │   │   └── README.md
│   │   │   │   └── components/
│   │   │   │       └── README.md
│   │   │   ├── modifier/
│   │   │   │   ├── README.md
│   │   │   │   ├── pages/
│   │   │   │   │   └── README.md
│   │   │   │   ├── panels/
│   │   │   │   │   └── README.md
│   │   │   │   └── components/
│   │   │   │       └── README.md
│   │   │   └── pricing-rule/
│   │   │       ├── PricingRuleModule.jsx
│   │   │       ├── README.md
│   │   │       ├── pages/
│   │   │       │   └── PricingRuleListPage.jsx
│   │   │       ├── panels/
│   │   │       │   └── README.md
│   │   │       └── components/
│   │   │           └── README.md
│   │   └── devices/
│   │       ├── README.md
│   │       ├── pages/
│   │       │   └── README.md
│   │       ├── panels/
│   │       │   └── README.md
│   │       └── components/
│   │           └── README.md
│   ├── styles/
│   │   ├── app.css
│   │   └── tokens.css
│   └── utils/
│       └── ui.js
└── vite.config.js
```

## Extracted Shared Layers

### Styles
- `src/styles/tokens.css`
- `src/styles/app.css`

### Constants
- `src/constants/assets.js`
- `src/constants/menu.js`
- `src/constants/pageConfigs.js`
- `src/constants/catalog.js`
- `src/constants/pricing.js`
- `src/constants/settings.js`
- `src/constants/devices.js`
- `src/constants/dashboard.js`

### Shared Utilities
- `src/utils/ui.js`
  - `defineIcon`
  - `getStatusTone`
  - `getPaginationItems`

### Shared UI
- `src/components/icons/Icon.jsx`
- `src/components/ui/Primitives.jsx`
- `src/components/layout/Layout.jsx`
- `src/components/dashboard/Presentational.jsx`
- `src/components/lists/Presentational.jsx`
- `src/components/catalog/Presentational.jsx`

## Page / Panel Terminology

- Module: a feature area such as Catalog, Category, Unit, Modifier, Pricing Rule, or Devices.
- Page: the main list or full-page surface for a module.
- Panel: the right-side workflow surface, such as Add, Detail, or Edit.
- Edit is treated as its own panel state in the UX and should be named `EditPanel` in module structure.
- Do not use generic `src/pages` for this app.

## Module Structure Status

### Dashboard
- Path: `src/modules/dashboard/`
- Extracted now:
  - `DashboardModule.jsx`
  - `pages/DashboardOverviewPage.jsx`
- App.jsx-owned behavior:
  - dashboard report pages and detail surfaces
  - dashboard chart/date/calendar orchestration

### Catalog Management / Catalog
- Path: `src/modules/catalog-management/catalog/`
- Extracted now:
  - `CatalogModule.jsx`
  - `pages/CatalogListPage.jsx`
- Documented but still App.jsx-owned:
  - `panels/CatalogAddPanel.jsx`
  - `panels/CatalogDetailPanel.jsx`
  - `panels/CatalogEditPanel.jsx`
- See [catalog README](/Users/aria/Documents/RMS-Backoffice2/src/modules/catalog-management/catalog/README.md).

### Catalog Management / Category
- Path: `src/modules/catalog-management/category/`
- Documented but still App.jsx-owned:
  - `CategoryModule.jsx`
  - `pages/CategoryListPage.jsx`
  - `panels/CategoryAddPanel.jsx`
  - `panels/CategoryDetailPanel.jsx`
  - `panels/CategoryEditPanel.jsx`
- See [category README](/Users/aria/Documents/RMS-Backoffice2/src/modules/catalog-management/category/README.md).

### Catalog Management / Unit
- Path: `src/modules/catalog-management/unit/`
- Documented but still App.jsx-owned:
  - `UnitModule.jsx`
  - `pages/UnitListPage.jsx`
  - `panels/UnitAddPanel.jsx`
  - `panels/UnitDetailPanel.jsx`
  - `panels/UnitEditPanel.jsx`
- See [unit README](/Users/aria/Documents/RMS-Backoffice2/src/modules/catalog-management/unit/README.md).

### Catalog Management / Modifier
- Path: `src/modules/catalog-management/modifier/`
- Documented but still App.jsx-owned:
  - `ModifierModule.jsx`
  - `pages/ModifierListPage.jsx`
  - `panels/ModifierAddPanel.jsx`
  - `panels/ModifierDetailPanel.jsx`
  - `panels/ModifierEditPanel.jsx`
- See [modifier README](/Users/aria/Documents/RMS-Backoffice2/src/modules/catalog-management/modifier/README.md).

### Catalog Management / Pricing Rule
- Path: `src/modules/catalog-management/pricing-rule/`
- Extracted now:
  - `PricingRuleModule.jsx`
  - `pages/PricingRuleListPage.jsx`
- Documented but still App.jsx-owned:
  - `panels/PricingRuleAddPanel.jsx`
  - `panels/PricingRuleDetailPanel.jsx`
  - `panels/PricingRuleEditPanel.jsx`
- See [pricing-rule README](/Users/aria/Documents/RMS-Backoffice2/src/modules/catalog-management/pricing-rule/README.md).

### Devices
- Path: `src/modules/devices/`
- Documented but still App.jsx-owned:
  - `DevicesModule.jsx`
  - `pages/DevicesListPage.jsx`
  - `panels/DeviceAddPanel.jsx`
  - `panels/DeviceDetailPanel.jsx`
  - `panels/DeviceEditPanel.jsx`
- Notes:
  - the current page id is still `device-management`
- See [devices README](/Users/aria/Documents/RMS-Backoffice2/src/modules/devices/README.md).

## Intentionally Unmodeled For Now

- Selling Time is still implemented in `src/App.jsx`, but it is intentionally not represented under `src/modules/` in this pass.
- Business Unit, User List, Role Management, and Settings also remain App-owned and are not part of the current module-boundary extraction effort.

## What Still Remains Inside `src/App.jsx`

`src/App.jsx` still owns:
- global state
- refs and effects
- builders and `createInitial*` functions
- validators and clone helpers
- modal coordination
- workflow navigation and page switching
- page and panel orchestration
- dashboard report generation and state-heavy chart/date behavior
- Category, Unit, Modifier, Devices, Selling Time, Business Unit, User List, Role Management, and Settings workflow implementation
- the add/detail/edit right-side panel logic for all current modules

## Future Extraction Rules

- Do not create placeholder JSX components just to satisfy structure.
- Use `pages/` for main list or full-page surfaces only.
- Use `panels/` for right-side Add, Detail, and Edit surfaces.
- If a module surface is still too coupled to `App.jsx`, document it with a README instead of forcing extraction.
- Only add a JSX module/page/panel file when it is actually wired or clearly safe to wire.
