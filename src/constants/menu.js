export const MENU = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  {
    id: "catalog-group",
    label: "Catalog",
    icon: "catalog",
    children: [
      { id: "catalog", label: "Catalog" },
      { id: "category", label: "Category" },
      { id: "unit", label: "Unit" },
      { id: "modifier", label: "Modifier" },
      { id: "pricing-rule", label: "Pricing Rule" },
    ],
  },
  { id: "business-unit", label: "Entity", icon: "businessUnit" },
  { id: "device-management", label: "Device Management", icon: "deviceManagement" },
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
};
