# Category Module

## Domain

- Catalog Management

## Intended Structure

- `CategoryModule.jsx`
- `pages/CategoryListPage.jsx`
- `panels/CategoryAddPanel.jsx`
- `panels/CategoryDetailPanel.jsx`
- `panels/CategoryEditPanel.jsx`
- `components/`

## Current Ownership

- `CategoryModule.jsx` is not created yet.
- `pages/CategoryListPage.jsx` remains App.jsx-owned inside `renderGenericListPage("category")`.
- `panels/CategoryAddPanel.jsx` remains App.jsx-owned via `renderCategoryCreateSidePanel()`.
- `panels/CategoryDetailPanel.jsx` remains App.jsx-owned via `renderCategoryDetailSidePanel()`.
- `panels/CategoryEditPanel.jsx` remains App.jsx-owned as the edit-state branch inside the current category detail-panel workflow.

## Why Implementation Still Lives In App.jsx

- Category still uses shared generic-list orchestration for filters, pagination, selection, and table rendering.
- Its panel workflow depends on App-level draft state, validation, discard-change handling, and side-panel coordination.
