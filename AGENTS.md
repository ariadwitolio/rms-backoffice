# Agent Instructions

Read [PROJECT_MAP.md](/Users/aria/Documents/RMS-Backoffice2/PROJECT_MAP.md) first before changing this project.

## Working Rules

1. Do not scan the entire `src/App.jsx` unless it is necessary for the task.
2. Prefer targeted `rg` searches and focused reads around the specific module, page, or panel being changed.
3. Preserve UI, behavior, JSX structure, class names, and prop behavior unless the task explicitly requires a change.
4. Keep extractions conservative.
5. Do not move state-heavy orchestration, builders, validators, modal workflows, refs/effects code, timer logic, pairing/status logic, or page/panel render logic prematurely.
6. Treat `createInitial*` builders, draft builders, validation helpers, and report-generation helpers as coupled until their dependencies are mapped.
7. Prefer fixing regressions by restoring boundaries rather than expanding refactor scope.
8. After structural changes, run `npm run build`.
9. If you introduce or rename a module/page/panel boundary, update `PROJECT_MAP.md` in the same change.

## Module / Page / Panel Rules

- Do not add generic `src/pages` files.
- Add future feature files under the correct module path:
  - `src/modules/<domain>/<module>/pages/`
  - `src/modules/<domain>/<module>/panels/`
  - `src/modules/<domain>/<module>/components/`
- `pages/` is for main list or full-page surfaces.
- `panels/` is for right-side Add, Detail, and Edit surfaces.
- Do not create placeholder JSX components just to satisfy structure.
- If a surface is still App-owned, keep it in `src/App.jsx` and document that ownership with a README in the module folder instead of forcing extraction.
- The current runtime page id `device-management` maps to the intended module boundary at `src/modules/devices/`.
- Selling Time is intentionally not represented under `src/modules/` right now.

## Current Refactor Intent

- Shared presentational layers live under `src/components/`.
- Active extracted page shells currently exist for Dashboard, Catalog, and Pricing Rule.
- Catalog, Category, Unit, Modifier, Pricing Rule, and Devices now have explicit module page/panel documentation boundaries.
- Most Add, Detail, and Edit panel implementations still live in `src/App.jsx`.
- `src/App.jsx` still owns orchestration, builders, validators, modal flows, settings, and the still-coupled module surfaces.

Do not treat the project as fully modular yet. The current architecture is intentionally transitional.
