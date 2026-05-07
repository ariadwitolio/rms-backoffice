# Devices Module

## Domain

- Devices

## Intended Structure

- `DevicesModule.jsx`
- `pages/DevicesListPage.jsx`
- `panels/DeviceAddPanel.jsx`
- `panels/DeviceDetailPanel.jsx`
- `panels/DeviceEditPanel.jsx`
- `components/`

## Current Ownership

- `DevicesModule.jsx` is not created yet.
- `pages/DevicesListPage.jsx` remains App.jsx-owned inside `renderGenericListPage("device-management")`.
- `panels/DeviceAddPanel.jsx` remains App.jsx-owned via `renderDeviceManagementCreateSidePanel()`.
- `panels/DeviceDetailPanel.jsx` remains App.jsx-owned via `renderDeviceManagementDetailSidePanel()`.
- `panels/DeviceEditPanel.jsx` remains App.jsx-owned as the edit-state branch inside the current device detail-panel workflow.

## Why Implementation Still Lives In App.jsx

- Devices still depend on shared generic-list orchestration for the list surface.
- The right-side panel workflow is tightly coupled to App-level pairing, timer, connection-status, regenerate, disconnect, modal, and draft-edit state logic.
