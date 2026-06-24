import { shiftDateByDays, formatDayMonth, DASHBOARD_REPORT_TIME_RANGE_OPTIONS } from "../constants/dashboard.js";
import { createDashboardReportAnchorDate, formatDashboardReportDate, formatDashboardReportDateValue, parseDashboardReportDateValue, filterDashboardReportRowsByDate, formatIdr } from "./dashboardDateUtils.js";

export function createInventoryReportDetail(unitName, anchorDate = new Date()) {
  const today = createDashboardReportAnchorDate(anchorDate);
  const formatDateTime = (date, time) =>
    `${formatDashboardReportDate(date)}, ${time}`;
  const todayValue = formatDashboardReportDateValue(today);

  const formatInventoryQuantity = (value, unitLabel) => {
    const numericValue = Number(value ?? 0);
    const formattedValue = Number.isInteger(numericValue)
      ? new Intl.NumberFormat("en-US").format(numericValue)
      : new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(numericValue);

    return `${formattedValue} ${unitLabel}`;
  };

  const getInventoryStatusInfo = (currentStockValue, thresholdValue) => {
    if (currentStockValue <= 0) {
      return {
        label: "Empty",
        sortValue: 0,
        tone: "danger",
        color: "var(--status-red-primary)",
      };
    }

    if (currentStockValue <= thresholdValue) {
      return {
        label: "Low",
        sortValue: 1,
        tone: "warning",
        color: "var(--status-orange-primary)",
      };
    }

    return {
      label: "Available",
      sortValue: 2,
      tone: "success",
      color: "var(--status-green-primary)",
    };
  };

  const businessUnitNames = [
    "Labamu Central Jakarta",
    "Labamu Bandung",
    "Labamu Surabaya",
    "Labamu Bali",
  ];

  const stockLevelRows = [
    {
      id: "stock-level-1",
      ingredient: "Arabica Beans",
      category: "Beverage",
      unitLabel: "Kg",
      initialStockValue: 1.1,
      usageValue: 1.1,
      currentStockValue: 0,
      thresholdValue: 2,
      stockValueAmount: 0,
      dateValue: todayValue,
    },
    {
      id: "stock-level-2",
      ingredient: "Mozzarella Cheese",
      category: "Dairy",
      unitLabel: "Packs",
      initialStockValue: 18,
      usageValue: 10,
      currentStockValue: 8,
      thresholdValue: 12,
      stockValueAmount: 1480000,
      dateValue: todayValue,
    },
    {
      id: "stock-level-3",
      ingredient: "Romaine Lettuce",
      category: "Produce",
      unitLabel: "Kg",
      initialStockValue: 4,
      usageValue: 0.8,
      currentStockValue: 3.2,
      thresholdValue: 4,
      stockValueAmount: 286000,
      dateValue: todayValue,
    },
    {
      id: "stock-level-4",
      ingredient: "Chicken Breast",
      category: "Protein",
      unitLabel: "Kg",
      initialStockValue: 7.3,
      usageValue: 2.8,
      currentStockValue: 4.5,
      thresholdValue: 4,
      stockValueAmount: 612000,
      dateValue: todayValue,
    },
    {
      id: "stock-level-5",
      ingredient: "Burger Bun",
      category: "Bakery",
      unitLabel: "Pcs",
      initialStockValue: 44,
      usageValue: 18,
      currentStockValue: 26,
      thresholdValue: 20,
      stockValueAmount: 364000,
      dateValue: todayValue,
    },
    {
      id: "stock-level-6",
      ingredient: "Truffle Mayo",
      category: "Sauce",
      unitLabel: "Bottles",
      initialStockValue: 14.6,
      usageValue: 0.6,
      currentStockValue: 14,
      thresholdValue: 8,
      stockValueAmount: 518000,
      dateValue: todayValue,
    },
  ].map((row) => {
    const statusInfo = getInventoryStatusInfo(
      row.currentStockValue,
      row.thresholdValue
    );
    const stockLevelRatio = row.initialStockValue
      ? row.currentStockValue / row.initialStockValue
      : 0;

    return {
      ...row,
      businessUnit: businessUnitNames[row.id.charCodeAt(row.id.length - 1) % businessUnitNames.length],
      initialStock: formatInventoryQuantity(
        row.initialStockValue,
        row.unitLabel
      ),
      usage: formatInventoryQuantity(row.usageValue, row.unitLabel),
      currentStock: formatInventoryQuantity(
        row.currentStockValue,
        row.unitLabel
      ),
      threshold: formatInventoryQuantity(row.thresholdValue, row.unitLabel),
      stockValue: formatIdr(row.stockValueAmount),
      status: statusInfo.label,
      statusSortValue: statusInfo.sortValue,
      statusTone: statusInfo.tone,
      statusColor: statusInfo.color,
      stockLevelRatio,
      stockLevelPercent: Math.max(
        0,
        Math.min(100, Math.round(stockLevelRatio * 100))
      ),
    };
  });

  const stockMovementRows = [
    {
      id: "movement-1",
      dateTime: formatDateTime(today, "08:10"),
      dateValue: todayValue,
      ingredient: "Burger Bun",
      category: "Bakery",
      movementType: "Ingredient Usage",
      quantityValue: -18,
      quantityUnit: "Pcs",
      reference: "Breakfast service",
      updatedBy: "Natasha Smith",
    },
    {
      id: "movement-2",
      dateTime: formatDateTime(today, "09:35"),
      dateValue: todayValue,
      ingredient: "Mozzarella Cheese",
      category: "Dairy",
      movementType: "Manual Adjustment",
      quantityValue: 12,
      quantityUnit: "Packs",
      reference: "Supplier receiving posted manually",
      updatedBy: "Rendy Saputra",
    },
    {
      id: "movement-3",
      dateTime: formatDateTime(today, "12:42"),
      dateValue: todayValue,
      ingredient: "Chicken Breast",
      category: "Protein",
      movementType: "Ingredient Usage",
      quantityValue: -2.1,
      quantityUnit: "Kg",
      reference: "Lunch production",
      updatedBy: "Salsa Mahendra",
    },
    {
      id: "movement-4",
      dateTime: formatDateTime(today, "15:05"),
      dateValue: todayValue,
      ingredient: "Arabica Beans",
      category: "Beverage",
      movementType: "Manual Adjustment",
      quantityValue: -0.4,
      quantityUnit: "Kg",
      reference: "Manual recount after spill",
      updatedBy: "Dio Ramadhan",
    },
    {
      id: "movement-5",
      dateTime: formatDateTime(shiftDateByDays(today, -1), "18:05"),
      dateValue: formatDashboardReportDateValue(shiftDateByDays(today, -1)),
      ingredient: "Arabica Beans",
      category: "Beverage",
      movementType: "Ingredient Usage",
      quantityValue: -0.4,
      quantityUnit: "Kg",
      reference: "Coffee batch wastage",
      updatedBy: "Dio Ramadhan",
    },
    {
      id: "movement-6",
      dateTime: formatDateTime(shiftDateByDays(today, -2), "10:22"),
      dateValue: formatDashboardReportDateValue(shiftDateByDays(today, -2)),
      ingredient: "Romaine Lettuce",
      category: "Produce",
      movementType: "Manual Adjustment",
      quantityValue: 2,
      quantityUnit: "Kg",
      reference: "Received unposted transfer",
      updatedBy: "Kevin Pratama",
    },
  ].map((row) => ({
    ...row,
    businessUnit: businessUnitNames[row.id.charCodeAt(row.id.length - 1) % businessUnitNames.length],
    quantity: `${row.quantityValue > 0 ? "+" : "-"}${formatInventoryQuantity(
      Math.abs(row.quantityValue),
      row.quantityUnit
    )}`,
  }));

  const inventoryProgressRows = stockLevelRows
    .slice()
    .sort(
      (left, right) =>
        left.statusSortValue - right.statusSortValue ||
        left.stockLevelRatio - right.stockLevelRatio ||
        left.currentStockValue - right.currentStockValue
    );

  const lowStockCount = stockLevelRows.filter(
    (row) => row.status === "Low" || row.status === "Empty"
  ).length;
  const stockValueAmount = stockLevelRows.reduce(
    (sum, row) => sum + row.stockValueAmount,
    0
  );
  const cogsTodayAmount = stockMovementRows
    .filter((row) => row.quantityValue < 0)
    .reduce((sum, row) => sum + Math.abs(row.quantityValue) * 120000, 0);

  return {
    id: "inventory-report",
    kind: "inventory-report",
    title: "Inventory Report",
    copy: `Inventory visibility, movement, and cost tracking for ${unitName}.`,
    metrics: [
      {
        label: "Tracked Ingredients",
        count: new Intl.NumberFormat("en-US").format(stockLevelRows.length),
        tone: "neutral",
        iconName: "metricOrders",
      },
      {
        label: "Low Stock Items",
        count: new Intl.NumberFormat("en-US").format(lowStockCount),
        tone: "danger",
        iconName: "metricRefund",
      },
      {
        label: "Stock Value",
        count: formatIdr(stockValueAmount),
        tone: "brand",
        iconName: "metricGross",
      },
      {
        label: "COGS Today",
        count: formatIdr(cogsTodayAmount),
        tone: "warning",
        iconName: "metricTax",
      },
    ],
    progress: {
      title: "Stock Level Overview",
      copy: "Track initial stock, usage, and current stock for every ingredient.",
      ingredients: inventoryProgressRows,
    },
    tabs: [
      {
        id: "stock-level",
        label: "Stock Level",
        searchPlaceholder: "Search ingredient",
        columns: [
          { key: "ingredient", label: "Ingredient" },
          { key: "category", label: "Category" },
          { key: "unitLabel", label: "Unit" },
          { key: "businessUnit", label: "Entity", sortable: true },
          { key: "initialStock", label: "Initial Stock", align: "right" },
          {
            key: "currentStock",
            label: "Current Stock",
            align: "right",
            sortable: true,
            sortKey: "currentStockValue",
            render: (row) => (
              <p
                className={`type-subtitle-2${row.status === "Empty"
                  ? " text-danger"
                  : row.status === "Low"
                    ? " text-warning"
                    : ""
                  }`}
              >
                {row.currentStock}
              </p>
            ),
          },
          {
            key: "usage",
            label: "Usage",
            align: "right",
            sortable: true,
            sortKey: "usageValue",
          },
          {
            key: "threshold",
            label: "Threshold",
            align: "right",
          },
          { key: "stockValue", label: "Stock Value", align: "right" },
          {
            key: "status",
            label: "Status",
            type: "status",
            align: "right",
            sortable: true,
            sortKey: "statusSortValue",
          },
        ],
        rows: stockLevelRows,
        searchFields: [
          "ingredient",
          "category",
          "unitLabel",
          "businessUnit",
          "initialStock",
          "currentStock",
          "usage",
          "status",
        ],
      },
      {
        id: "stock-movement",
        label: "Stock Movement",
        searchPlaceholder: "Search stock movement",
        columns: [
          {
            key: "dateTime",
            label: "Date & Time",
            contentClassName: "dashboard-report-detail__date-time",
            sortable: true,
          },
          { key: "businessUnit", label: "Entity", sortable: true },
          { key: "ingredient", label: "Ingredient" },
          { key: "category", label: "Category" },
          { key: "movementType", label: "Type" },
          {
            key: "quantity",
            label: "Quantity",
            align: "right",
            render: (row) => (
              <p
                className={`type-subtitle-2 inventory-movement-quantity${row.quantityValue > 0
                  ? " inventory-movement-quantity--positive"
                  : " inventory-movement-quantity--negative"
                  }`}
              >
                {row.quantity}
              </p>
            ),
          },
          { key: "reference", label: "Reference" },
          { key: "updatedBy", label: "Updated By" },
        ],
        rows: stockMovementRows,
        searchFields: [
          "dateTime",
          "businessUnit",
          "ingredient",
          "category",
          "movementType",
          "reference",
          "updatedBy",
        ],
      },
    ],
  };
}

