import { ROLE_PERMISSION_GROUPS, ALL_ROLE_PERMISSION_MODULES, MAIN_ACCOUNT_ROLE_PERMISSION_GROUP_IDS, ENTITY_ROLE_PERMISSION_GROUP_IDS } from "./deviceGroupUtils.js";
import { MENU } from "../constants/menu.js";

export function getRolePermissionLevel(permission) {
  return typeof permission === "string" ? permission : permission?.level ?? "none";
}

export function hasRolePermissionAccess(permission) {
  return getRolePermissionLevel(permission) !== "none";
}

export function createRolePermissions(overrides = {}) {
  return ALL_ROLE_PERMISSION_MODULES.reduce(
    (permissions, module) => ({
      ...permissions,
      [module.id]: overrides[module.id] ?? "none",
    }),
    {}
  );
}

export function createRolePermissionSections(
  overrides = {},
  permissions = createRolePermissions(),
  { defaultEnabled = true } = {}
) {
  return ROLE_PERMISSION_GROUPS.reduce((sections, group) => {
    const hasAssignedPermissions = group.modules.some((module) =>
      hasRolePermissionAccess(permissions[module.id])
    );
    const explicitValue = overrides?.[group.id];

    sections[group.id] =
      typeof explicitValue === "boolean"
        ? explicitValue
        : hasAssignedPermissions || defaultEnabled;

    return sections;
  }, {});
}

export function getRolePermissionGroupIdsForContext(isEntitySide = false) {
  return isEntitySide
    ? ENTITY_ROLE_PERMISSION_GROUP_IDS
    : MAIN_ACCOUNT_ROLE_PERMISSION_GROUP_IDS;
}

export function getRolePermissionsStructure(isEntitySide = false) {
  const visibleGroupIds = getRolePermissionGroupIdsForContext(isEntitySide);

  return ROLE_PERMISSION_GROUPS.filter((group) =>
    visibleGroupIds.includes(group.id)
  );
}

export function normalizeRoleAccessPermissionSections(
  permissionSections,
  isEntitySide = false
) {
  if (!isEntitySide) {
    return permissionSections;
  }

  const nextSections = { ...permissionSections };
  const generalEnabled =
    nextSections["account-module"] !== false ||
    nextSections["rms-back-office"] !== false;

  nextSections["account-module"] = generalEnabled;
  nextSections["rms-back-office"] = generalEnabled;

  return nextSections;
}

export function createInitialRoleAccessDraft(isEntitySide = false) {
  const permissions = createRolePermissions();
  const defaultSectionStates = isEntitySide
    ? {
      "account-module": true,
      "rms-back-office": true,
      "rms-apps": false,
    }
    : {
      "account-module": true,
    };
  const permissionSections = createRolePermissionSections(
    {},
    permissions,
    { defaultEnabled: false }
  );

  ROLE_PERMISSION_GROUPS.forEach((group) => {
    permissionSections[group.id] = defaultSectionStates[group.id] ?? false;
  });

  return {
    name: "",
    description: "",
    type: "Custom",
    permissions,
    permissionSections: normalizeRoleAccessPermissionSections(
      permissionSections,
      isEntitySide
    ),
  };
}

export function createRoleAccessDraftFromRecord(record, isEntitySide = false) {
  const permissions = createRolePermissions(record?.permissions ?? {});
  const permissionSections = createRolePermissionSections(
    record?.permissionSections ?? {},
    permissions,
    { defaultEnabled: false }
  );

  return {
    ...record,
    name: record?.name ?? "",
    description: record?.description ?? "",
    type: record?.type ?? "Custom",
    permissions,
    permissionSections: normalizeRoleAccessPermissionSections(
      permissionSections,
      isEntitySide
    ),
  };
}

export function getRoleAccessValidationGroups(structure = ROLE_PERMISSION_GROUPS) {
  const groupsById = new Map(structure.map((group) => [group.id, group]));
  const validationGroups = [];
  const accountGroup = groupsById.get("account-module");
  const backOfficeGroup = groupsById.get("rms-back-office");
  const rmsAppsGroup = groupsById.get("rms-apps");

  if (accountGroup && backOfficeGroup) {
    validationGroups.push({
      id: "rms-back-office",
      sectionIds: ["account-module", "rms-back-office"],
      modules: [...accountGroup.modules, ...backOfficeGroup.modules],
    });
  } else {
    if (accountGroup) {
      validationGroups.push({
        id: accountGroup.id,
        sectionIds: [accountGroup.id],
        modules: accountGroup.modules,
      });
    }

    if (backOfficeGroup) {
      validationGroups.push({
        id: backOfficeGroup.id,
        sectionIds: [backOfficeGroup.id],
        modules: backOfficeGroup.modules,
      });
    }
  }

  if (rmsAppsGroup) {
    validationGroups.push({
      id: rmsAppsGroup.id,
      sectionIds: [rmsAppsGroup.id],
      modules: rmsAppsGroup.modules,
    });
  }

  return validationGroups;
}

export function sortRoleAccessRows(rows = []) {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const aIsSystem = String(a.row?.type ?? "").toLowerCase() === "system";
      const bIsSystem = String(b.row?.type ?? "").toLowerCase() === "system";

      if (aIsSystem !== bIsSystem) {
        return aIsSystem ? 1 : -1;
      }

      return a.index - b.index;
    })
    .map(({ row }) => row);
}

export function getRoleAccessPermissionSectionErrors(
  draft,
  structure = ROLE_PERMISSION_GROUPS
) {
  const errors = {};
  const permissions = draft?.permissions ?? {};
  const permissionSections = draft?.permissionSections ?? {};

  getRoleAccessValidationGroups(structure).forEach((group) => {
    const sectionEnabled = group.sectionIds.some(
      (sectionId) => permissionSections[sectionId]
    );

    if (!sectionEnabled) return;

    const hasAssignedPermissions = group.modules.some((module) =>
      hasRolePermissionAccess(permissions[module.id])
    );

    if (!hasAssignedPermissions) {
      errors[group.id] = "At least one module in this section must have access";
    }
  });

  return errors;
}

export function hasAnyVisibleRoleAccessPermission(
  draft,
  structure = ROLE_PERMISSION_GROUPS
) {
  const permissions = draft?.permissions ?? {};
  const permissionSections = draft?.permissionSections ?? {};

  return getRoleAccessValidationGroups(structure).some(
    (group) =>
      group.sectionIds.some((sectionId) => permissionSections[sectionId]) &&
      group.modules.some((module) => hasRolePermissionAccess(permissions[module.id]))
  );
}

