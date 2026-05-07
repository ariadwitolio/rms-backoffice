# Pricing Rule Module

## Domain

- Catalog Management

## Intended Structure

- `PricingRuleModule.jsx`
- `pages/PricingRuleListPage.jsx`
- `panels/PricingRuleAddPanel.jsx`
- `panels/PricingRuleDetailPanel.jsx`
- `panels/PricingRuleEditPanel.jsx`
- `components/`

## Current Ownership

- `PricingRuleModule.jsx` is already extracted.
- `pages/PricingRuleListPage.jsx` is already extracted.
- `panels/PricingRuleAddPanel.jsx` remains App.jsx-owned via `renderPricingRuleCreateSidePanel()`.
- `panels/PricingRuleDetailPanel.jsx` remains App.jsx-owned via `renderPricingRuleDetailSidePanel()`.
- `panels/PricingRuleEditPanel.jsx` remains App.jsx-owned as the edit-state branch inside the current pricing-rule detail-panel workflow.

## Why Implementation Still Lives In App.jsx

- The pricing-rule list shell is extracted, but the right-side panel workflow still depends on App-level draft state, validation, snackbar side effects, and panel navigation.
- The default-rule and special-rule behavior also still depends on App-level pricing-rule orchestration.
