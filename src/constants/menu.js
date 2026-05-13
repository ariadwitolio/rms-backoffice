export const MENU = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  {
    id: "catalog-group",
    label: "Catalog Management",
    icon: "catalog",
    children: [
      { id: "catalog", label: "Catalog" },
      { id: "category", label: "Category" },
      { id: "unit", label: "Unit" },
      { id: "modifier", label: "Modifier" },
      { id: "pricing-rule", label: "Pricing Rule" },
    ],
  },
  { id: "business-unit", label: "Entity Management", icon: "businessUnit" },
  {
    id: "device-group",
    label: "Device Management",
    icon: "deviceManagement",
    children: [
      { id: "device-management", label: "Device List" },
      { id: "grouped-device", label: "Device Group" },
    ],
  },
  { id: "role-management", label: "Role Management", icon: "roleManagement" },
];

export const DETAIL_PAGE_PARENT = {
  "catalog-create": "catalog",
  "catalog-detail": "catalog",
  "category-create": "category",
  "unit-create": "unit",
  "dashboard-discount-report-detail": "dashboard",
  "dashboard-report-detail": "dashboard",
  "modifier-create": "modifier",
  "pricing-rule-create": "pricing-rule",
  "selling-time-create": "selling-time",
  "device-management-create": "device-management",
  "grouped-device-create": "grouped-device",
  "role-management-create": "role-management",
};
