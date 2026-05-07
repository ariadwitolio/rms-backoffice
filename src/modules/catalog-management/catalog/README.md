# Catalog Module

## Domain

- Catalog Management

## Intended Structure

- `CatalogModule.jsx`
- `pages/CatalogListPage.jsx`
- `panels/CatalogAddPanel.jsx`
- `panels/CatalogDetailPanel.jsx`
- `panels/CatalogEditPanel.jsx`
- `components/`

## Current Ownership

- `CatalogModule.jsx` is already extracted.
- `pages/CatalogListPage.jsx` is already extracted.
- `panels/CatalogAddPanel.jsx` remains App.jsx-owned via `renderCatalogCreateSidePanel()`.
- `panels/CatalogDetailPanel.jsx` remains App.jsx-owned via `renderCatalogDetailSidePanel()`.
- `panels/CatalogEditPanel.jsx` remains App.jsx-owned as the edit-state branch inside the current catalog detail-panel workflow.

## Why Implementation Still Lives In App.jsx

- The add/detail/edit panels still depend on App-level draft state, validation, discard-change flows, unit-assignment coordination, and side-panel navigation.
- Moving them now would expand the refactor past a safe module-structure cleanup.
