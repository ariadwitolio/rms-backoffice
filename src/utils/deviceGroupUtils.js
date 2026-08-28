import { MENU } from "../constants/menu.js";

export function createInitialGroupedDeviceDraft() {
  return {
    name: "",
    deviceList: [],
    catalogList: [],
  };
}

export function getGroupedDeviceListSummary({
  selectedValues = [],
  selectedLabels = [],
  placeholder = "Select Devices",
  totalOptions = 0,
} = {}) {
  if (selectedValues.length === 1) {
    return selectedLabels[0] ?? placeholder;
  }

  if (totalOptions > 1 && selectedValues.length === totalOptions) {
    return "All Devices Selected";
  }

  if (selectedValues.length > 1) {
    return `${selectedValues.length} Devices Selected`;
  }

  return placeholder;
}

export function findDeviceManagementRecordByValue(deviceRows = [], value) {
  return (
    deviceRows.find((row) => row.id === value) ??
    deviceRows.find((row) => row.deviceName === value) ??
    null
  );
}

export function getGroupedDeviceDeviceRows(deviceRows = [], values = []) {
  return (values ?? [])
    .map((value) => findDeviceManagementRecordByValue(deviceRows, value))
    .filter(Boolean);
}

export function getNormalizedGroupedDeviceTabletRows(deviceRows = [], values = []) {
  const seen = new Set();

  return getGroupedDeviceDeviceRows(deviceRows, values)
    .filter((row) => row.deviceType === "Kitchen Display System (KDS)")
    .filter((row) => {
      const key = row.id ?? row.deviceName;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getGroupedDeviceCatalogNames(catalogRows = [], values = []) {
  return (values ?? [])
    .map((value) => {
      const catalog = catalogRows.find(
        (row) => row.id === value || row.name === value
      );
      return catalog?.name ?? (typeof value === "string" ? value : null);
    })
    .filter(Boolean);
}

export function getNormalizedGroupedDeviceCatalogIds(catalogRows = [], values = []) {
  const seen = new Set();

  return (values ?? [])
    .map(
      (value) =>
        catalogRows.find((row) => row.id === value || row.name === value)?.id ??
        null
    )
    .filter((catalogId) => {
      if (!catalogId || seen.has(catalogId)) return false;
      seen.add(catalogId);
      return true;
    });
}

export function buildGroupedDeviceSelectionOptions(
  deviceRows = [],
  groupedDeviceGroups = [],
  { currentGroupId = null, currentValues = [] } = {}
) {
  const currentIds = new Set(
    getNormalizedGroupedDeviceTabletRows(deviceRows, currentValues).map(
      (row) => row.id
    )
  );
  const routedGroupNameByDeviceId = new Map();

  groupedDeviceGroups.forEach((group) => {
    if (group.id === currentGroupId) return;

    getNormalizedGroupedDeviceTabletRows(
      deviceRows,
      group.deviceList || []
    ).forEach((row) => {
      if (!routedGroupNameByDeviceId.has(row.id)) {
        routedGroupNameByDeviceId.set(row.id, group.name);
      }
    });
  });

  return deviceRows
    .filter((row) => row.deviceType === "Kitchen Display System (KDS)")
    .map((row) => {
      const routedGroupName = currentIds.has(row.id)
        ? null
        : routedGroupNameByDeviceId.get(row.id) ?? null;

      return {
        value: row.id,
        label: row.deviceName,
        disabled: Boolean(routedGroupName),
        subtitle: routedGroupName ? `Routed to ${routedGroupName}` : "",
      };
    });
}

export function buildGroupedDeviceCatalogSelectionGroups(
  baseGroups = [],
  catalogRows = [],
  groupedDeviceGroups = [],
  { currentGroupId = null, currentValues = [] } = {}
) {
  const currentIds = new Set(
    getNormalizedGroupedDeviceCatalogIds(catalogRows, currentValues)
  );
  const routedGroupNameByCatalogId = new Map();

  groupedDeviceGroups.forEach((group) => {
    if (group.id === currentGroupId) return;

    getNormalizedGroupedDeviceCatalogIds(
      catalogRows,
      group.catalogList || []
    ).forEach((catalogId) => {
      if (!routedGroupNameByCatalogId.has(catalogId)) {
        routedGroupNameByCatalogId.set(catalogId, group.name);
      }
    });
  });

  return baseGroups
    .map((group) => {
      const items = (group.items || []).map((item) => {
        const routedGroupName = currentIds.has(item.id)
          ? null
          : routedGroupNameByCatalogId.get(item.id) ?? null;

        return {
          ...item,
          value: item.id,
          routedGroupName,
        };
      });

      return items.length ? { ...group, items } : null;
    })
    .filter(Boolean);
}

export function buildGroupedDeviceDetailRows(deviceRows = [], values = []) {
  const tabletRows = getNormalizedGroupedDeviceTabletRows(deviceRows, values);
  const selectedPrinterRows = getGroupedDeviceDeviceRows(deviceRows, values).filter(
    (row) => row.deviceType === "Printer"
  );

  return tabletRows.map((tablet) => {
    const printerNames = new Set(
      Array.isArray(tablet.connectedDevices)
        ? tablet.connectedDevices.filter(Boolean)
        : []
    );

    selectedPrinterRows.forEach((printer) => {
      if (
        Array.isArray(printer.connectedDevices) &&
        printer.connectedDevices.includes(tablet.deviceName)
      ) {
        printerNames.add(printer.deviceName);
      }
    });

    return {
      tabletName: tablet.deviceName,
      tabletStatus: tablet.status,
      printers: Array.from(printerNames),
    };
  });
}

const ACCOUNT_ROLE_PERMISSION_MODULES = [
  {
    id: "user-management",
    label: "User Management",
    additionalAccess: [
      { id: "suspendUser", label: "Lock user" },
      { id: "regeneratePin", label: "Regenerate PIN" },
      { id: "assignOtherEntities", label: "Assign to other entities" },
    ],
  },
  { id: "role-management", label: "Role Management" },
  {
    id: "entity-management",
    label: "Entity Management",
    additionalAccess: [{ id: "suspendEntity", label: "Suspend entity" }],
  },
];

const ENTITY_BACK_OFFICE_ROLE_PERMISSION_MODULES = [
  { id: "catalog", label: "Catalog" },
  { id: "category", label: "Category" },
  { id: "unit", label: "Unit" },
  { id: "modifier", label: "Modifier" },
  { id: "device", label: "Device" },
  { id: "grouped-device", label: "KDS Group" },
  { id: "table-management", label: "Table Management" },
  { id: "menu-settings", label: "Settings" },
];

const ENTITY_BACK_OFFICE_MENU_HIERARCHY = [
  {
    id: "catalog-management",
    label: "Catalog Management",
    isParent: true,
    children: ["catalog", "category", "unit", "modifier"],
  },
  {
    id: "device-management",
    label: "Device Management",
    isParent: true,
    children: ["device", "grouped-device"],
  },
  {
    id: "table-management",
    label: "Table Management",
    isParent: false,
  },
  {
    id: "menu-settings",
    label: "Settings",
    isParent: false,
  },
];

const ENTITY_APP_ROLE_PERMISSION_MODULES = [
  {
    id: "cashier",
    label: "Point of Sales",
    permittedLevels: ["none", "full"],
    levelLabels: { full: "Full Access" },
    additionalAccess: [
      { id: "approveVoid", label: "Approve VOID Request" },
      { id: "approveDiscount", label: "Approve Discount Request" },
    ],
  },
  {
    id: "printer-settings",
    label: "Printer Settings",
    permittedLevels: ["none", "view", "full"],
    levelLabels: { full: "Full Access" },
    dependsOnModuleId: "cashier",
  },
];

const PAYMENT_APP_ROLE_PERMISSION_MODULES = [
  {
    id: "payment",
    label: "Payment",
    permittedLevels: ["none", "full"],
    levelLabels: { full: "Full Access" },
  },
  {
    id: "printer-settings-payment",
    label: "Printer Settings",
    permittedLevels: ["none", "view", "full"],
    levelLabels: { full: "Full Access" },
    dependsOnModuleId: "payment",
  },
];

export const ROLE_PERMISSION_GROUPS = [
  {
    id: "account-module",
    group: "Account Module",
    modules: ACCOUNT_ROLE_PERMISSION_MODULES,
  },
  {
    id: "rms-back-office",
    group: "RMS Back Office",
    modules: ENTITY_BACK_OFFICE_ROLE_PERMISSION_MODULES,
    menuHierarchy: ENTITY_BACK_OFFICE_MENU_HIERARCHY,
  },
  {
    id: "rms-apps",
    group: "POS Apps Permissions",
    modules: ENTITY_APP_ROLE_PERMISSION_MODULES,
  },
  {
    id: "payment-app",
    group: "Payment App Permissions",
    modules: PAYMENT_APP_ROLE_PERMISSION_MODULES,
  },
];

export const ALL_ROLE_PERMISSION_MODULES = ROLE_PERMISSION_GROUPS.flatMap(
  (group) => group.modules
);
export const MAIN_ACCOUNT_ROLE_PERMISSION_GROUP_IDS = ["account-module"];
export const ENTITY_ROLE_PERMISSION_GROUP_IDS = [
  "account-module",
  "rms-back-office",
  "rms-apps",
  "payment-app",
];

