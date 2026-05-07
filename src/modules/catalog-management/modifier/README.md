# Modifier Module

## Domain

- Catalog Management

## Intended Structure

- `ModifierModule.jsx`
- `pages/ModifierListPage.jsx`
- `panels/ModifierAddPanel.jsx`
- `panels/ModifierDetailPanel.jsx`
- `panels/ModifierEditPanel.jsx`
- `components/`

## Current Ownership

- `ModifierModule.jsx` is not created yet.
- `pages/ModifierListPage.jsx` remains App.jsx-owned inside `renderGenericListPage("modifier")`.
- `panels/ModifierAddPanel.jsx` remains App.jsx-owned via `renderModifierCreateSidePanel()`.
- `panels/ModifierDetailPanel.jsx` remains App.jsx-owned via `renderModifierDetailSidePanel()`.
- `panels/ModifierEditPanel.jsx` remains App.jsx-owned as the edit-state branch inside the current modifier detail-panel workflow.

## Why Implementation Still Lives In App.jsx

- Modifier still uses shared generic-list orchestration for list behavior.
- Its panel workflow depends on App-level draft state, validation, discard-change handling, and side-panel coordination.
