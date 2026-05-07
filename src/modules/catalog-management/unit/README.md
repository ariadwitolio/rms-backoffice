# Unit Module

## Domain

- Catalog Management

## Intended Structure

- `UnitModule.jsx`
- `pages/UnitListPage.jsx`
- `panels/UnitAddPanel.jsx`
- `panels/UnitDetailPanel.jsx`
- `panels/UnitEditPanel.jsx`
- `components/`

## Current Ownership

- `UnitModule.jsx` is not created yet.
- `pages/UnitListPage.jsx` remains App.jsx-owned inside `renderGenericListPage("unit")`.
- `panels/UnitAddPanel.jsx` remains App.jsx-owned via `renderUnitCreateSidePanel()`.
- `panels/UnitDetailPanel.jsx` remains App.jsx-owned via `renderUnitDetailSidePanel()`.
- `panels/UnitEditPanel.jsx` remains App.jsx-owned as the edit-state branch inside the current unit detail-panel workflow.

## Why Implementation Still Lives In App.jsx

- Unit still uses shared generic-list orchestration plus PAGE_CONFIGS-driven table composition.
- Its panel workflow depends on App-level draft state, validation, discard-change handling, and side-panel coordination.
