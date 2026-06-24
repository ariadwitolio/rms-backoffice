import { shiftDateByDays, formatDayMonth, formatMonthYear, getDaysInMonth, DASHBOARD_REPORT_TIME_RANGE_OPTIONS } from "../constants/dashboard.js";
import { formatDashboardReportDate, formatDashboardReportDateValue, parseDashboardReportDateValue, filterDashboardReportRowsByDate, formatIdr, normalizeDashboardReportDateRange, getDashboardTrendCopyForTimeRange } from "./dashboardDateUtils.js";
import { createDashboardDiscountReport } from "./discountReportUtils.js";

export function createSalesReportDashboard(
  unitName,
  timeRange = "Today",
  customRange = { start: "", end: "" },
  anchorDate = new Date(),
  businessUnitNames = [unitName]
) {
  const hideTrend = timeRange === "All Time";
  const trendCopy = hideTrend
    ? ""
    : getDashboardTrendCopyForTimeRange(timeRange, customRange, anchorDate);
  const scopedBusinessUnitNames = businessUnitNames.length
    ? businessUnitNames
    : [unitName];
  const businessUnitColorPalette = [
    "var(--feature-brand-primary)",
    "var(--feature-customer-primary)",
    "var(--status-orange-primary)",
    "var(--feature-cashier-primary)",
    "var(--feature-product-primary)",
    "var(--status-green-primary)",
  ];
  const businessUnitWeightTotal = scopedBusinessUnitNames.reduce(
    (sum, _unitName, index) => {
      const fallbackWeight = Math.max(0.08, 0.22 - index * 0.025);
      return sum + fallbackWeight;
    },
    0
  );
  const businessUnitRows = scopedBusinessUnitNames.map(
    (businessUnitName, index) => {
      const baseWeight = Math.max(0.08, 0.22 - index * 0.025);
      const normalizedWeight =
        businessUnitWeightTotal > 0 ? baseWeight / businessUnitWeightTotal : 1;
      const salesValue = Math.max(
        0,
        Math.round(19058000 * normalizedWeight)
      );
      const ordersValue = Math.max(1, Math.round(313 * normalizedWeight));

      return {
        label: businessUnitName,
        copy: `${new Intl.NumberFormat("en-US").format(ordersValue)} Orders`,
        valueValue: salesValue,
        value: formatIdr(salesValue),
        color:
          businessUnitColorPalette[index % businessUnitColorPalette.length],
      };
    }
  );

  return {
    kpis: [
      {
        id: "total-sales",
        label: "Total Sales",
        value: formatIdr(18450000),
        trendLabel: hideTrend ? "" : "+8.4%",
        trendCopy,
        trendTone: "positive",
      },
      {
        id: "total-orders",
        label: "Total Orders",
        value: "286",
        trendLabel: hideTrend ? "" : "+12",
        trendCopy,
        trendTone: "positive",
      },
      {
        id: "profit",
        label: "Profit",
        value: formatIdr(10845000),
        trendLabel: hideTrend ? "" : "+5.2%",
        trendCopy,
        trendTone: "positive",
        enableViewReport: false,
      },
      {
        id: "average-order-value",
        label: "Average Order Value",
        value: formatIdr(64500),
        trendLabel: hideTrend ? "" : "+3.1%",
        trendCopy,
        trendTone: "positive",
      },
      {
        id: "tax-collected",
        label: "Tax Collected",
        value: formatIdr(1677000),
        trendLabel: hideTrend ? "" : "-1.2%",
        trendCopy,
        trendTone: "negative",
      },
      {
        id: "refund-transaction",
        label: "Refund Transactions",
        valuePrimary: "7",
        valueSecondary: formatIdr(285000),
        trendLabel: hideTrend ? "" : "+7",
        trendCopy,
        trendTone: "negative",
      },
      {
        id: "void-transaction",
        label: "VOID Transactions",
        valuePrimary: "5",
        valueSecondary: formatIdr(124000),
        trendLabel: hideTrend ? "" : "+5",
        trendCopy,
        trendTone: "negative",
      },
      {
        id: "cancelled-orders",
        label: "Cancelled Orders",
        valuePrimary: "9",
        valueSecondary: formatIdr(312000),
        trendLabel: hideTrend ? "" : "+9",
        trendCopy,
        trendTone: "negative",
      },
      {
        id: "discount-summary",
        label: "Discount Applied",
        valuePrimary: "42",
        valueSecondary: formatIdr(1285000),
        trendLabel: hideTrend ? "" : "+42",
        trendCopy,
        trendTone: "neutral",
      },
    ],
    salesBreakdownSummary: {
      title: "Sales Breakdown",
      copy: `Track sales contribution across each dimension`,
      totalSalesValue: 19058000,
      totalOrdersValue: 313,
      tabs: [
        ...(scopedBusinessUnitNames.length > 1
          ? [
            {
              id: "business-unit",
              label: "By Entity",
              totalLabel: "Total Sales",
              valueFormat: "currency",
              rows: businessUnitRows,
            },
          ]
          : []),
        {
          id: "item-qty",
          label: "By Item (Qty)",
          totalLabel: "Total Orders",
          valueFormat: "qty",
          rows: [
            {
              label: "Burger Supreme",
              copy: formatIdr(2240000),
              valueValue: 64,
              value: "64",
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Special Package",
              copy: formatIdr(1985000),
              valueValue: 52,
              value: "52",
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Iced Coffee",
              copy: formatIdr(1720000),
              valueValue: 47,
              value: "47",
              color: "var(--status-orange-primary)",
            },
            {
              label: "Linguine Pesto",
              copy: formatIdr(1468000),
              valueValue: 39,
              value: "39",
              color: "var(--feature-cashier-primary)",
            },
            {
              label: "Chicken Wrap",
              copy: formatIdr(1216000),
              valueValue: 33,
              value: "33",
              color: "var(--feature-product-primary)",
            },
            {
              label: "Other",
              copy: formatIdr(2842000),
              valueValue: 78,
              value: "78",
              color: "var(--neutral-on-surface-disabled)",
            },
          ],
        },
        {
          id: "item-revenue",
          label: "By Item (Revenue)",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "Special Package",
              copy: "52 Orders",
              valueValue: 4520000,
              value: formatIdr(4520000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Burger Supreme",
              copy: "64 Orders",
              valueValue: 3985000,
              value: formatIdr(3985000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Linguine Pesto",
              copy: "39 Orders",
              valueValue: 2815000,
              value: formatIdr(2815000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "Iced Coffee",
              copy: "47 Orders",
              valueValue: 2140000,
              value: formatIdr(2140000),
              color: "var(--feature-cashier-primary)",
            },
            {
              label: "Chicken Wrap",
              copy: "33 Orders",
              valueValue: 1686000,
              value: formatIdr(1686000),
              color: "var(--feature-product-primary)",
            },
            {
              label: "Other",
              copy: "78 Orders",
              valueValue: 3912000,
              value: formatIdr(3912000),
              color: "var(--neutral-on-surface-disabled)",
            },
          ],
        },
        {
          id: "category",
          label: "By Category",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "Main Course",
              copy: "142 Orders",
              valueValue: 7825000,
              value: formatIdr(7825000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Beverages",
              copy: "118 Orders",
              valueValue: 3940000,
              value: formatIdr(3940000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Appetizers",
              copy: "76 Orders",
              valueValue: 3210000,
              value: formatIdr(3210000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "Desserts",
              copy: "49 Orders",
              valueValue: 1875000,
              value: formatIdr(1875000),
              color: "var(--feature-cashier-primary)",
            },
            {
              label: "Packages",
              copy: "23 Orders",
              valueValue: 1680000,
              value: formatIdr(1680000),
              color: "var(--feature-product-primary)",
            },
            {
              label: "Sides",
              copy: "37 Orders",
              valueValue: 1540000,
              value: formatIdr(1540000),
              color: "var(--status-green-primary)",
            },
            {
              label: "Bakery",
              copy: "18 Orders",
              valueValue: 980000,
              value: formatIdr(980000),
              color: "var(--status-grey-primary)",
            },
          ],
        },
        {
          id: "modifier",
          label: "By Modifier",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "Extra Cheese",
              copy: "64 Applied",
              valueValue: 2280000,
              value: formatIdr(2280000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Large Size",
              copy: "51 Applied",
              valueValue: 1865000,
              value: formatIdr(1865000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Extra Shot",
              copy: "46 Applied",
              valueValue: 1520000,
              value: formatIdr(1520000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "Spicy Mayo",
              copy: "38 Applied",
              valueValue: 1215000,
              value: formatIdr(1215000),
              color: "var(--feature-cashier-primary)",
            },
            {
              label: "Oat Milk",
              copy: "27 Applied",
              valueValue: 980000,
              value: formatIdr(980000),
              color: "var(--feature-product-primary)",
            },
            {
              label: "No Onion",
              copy: "19 Applied",
              valueValue: 640000,
              value: formatIdr(640000),
              color: "var(--status-green-primary)",
            },
            {
              label: "Extra Sambal",
              copy: "15 Applied",
              valueValue: 410000,
              value: formatIdr(410000),
              color: "var(--status-grey-primary)",
            },
          ],
        },
        {
          id: "order-type",
          label: "By Order Type",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "Dine-in",
              copy: "126 Orders",
              valueValue: 10450000,
              value: formatIdr(10450000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Delivery",
              copy: "74 Orders",
              valueValue: 4380000,
              value: formatIdr(4380000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Takeaway",
              copy: "43 Orders",
              valueValue: 2210000,
              value: formatIdr(2210000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "Online",
              copy: "27 Orders",
              valueValue: 1410000,
              value: formatIdr(1410000),
              color: "var(--feature-cashier-primary)",
            },
          ],
        },
        {
          id: "table",
          label: "By Table",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "Table 12",
              copy: "14 Orders",
              valueValue: 965000,
              value: formatIdr(965000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Table 08",
              copy: "12 Orders",
              valueValue: 842000,
              value: formatIdr(842000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Table 15",
              copy: "10 Orders",
              valueValue: 786000,
              value: formatIdr(786000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "Table 21",
              copy: "9 Orders",
              valueValue: 744000,
              value: formatIdr(744000),
              color: "var(--feature-cashier-primary)",
            },
            {
              label: "Table 09",
              copy: "8 Orders",
              valueValue: 688000,
              value: formatIdr(688000),
              color: "var(--feature-product-primary)",
            },
            {
              label: "Other",
              copy: "31 Orders",
              valueValue: 2410000,
              value: formatIdr(2410000),
              color: "var(--neutral-on-surface-disabled)",
            },
          ],
        },
        {
          id: "staff",
          label: "By Staff",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "Natasha Smith",
              copy: "58 Orders",
              valueValue: 3620000,
              value: formatIdr(3620000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Rendy Saputra",
              copy: "53 Orders",
              valueValue: 3285000,
              value: formatIdr(3285000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Salsa Mahendra",
              copy: "47 Orders",
              valueValue: 2890000,
              value: formatIdr(2890000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "Dio Ramadhan",
              copy: "39 Orders",
              valueValue: 2465000,
              value: formatIdr(2465000),
              color: "var(--feature-cashier-primary)",
            },
            {
              label: "Kevin Pratama",
              copy: "34 Orders",
              valueValue: 2140000,
              value: formatIdr(2140000),
              color: "var(--feature-product-primary)",
            },
            {
              label: "Alya Putri",
              copy: "29 Orders",
              valueValue: 1965000,
              value: formatIdr(1965000),
              color: "var(--status-green-primary)",
            },
            {
              label: "Bima Fadli",
              copy: "25 Orders",
              valueValue: 1680000,
              value: formatIdr(1680000),
              color: "var(--status-grey-primary)",
            },
          ],
        },
        {
          id: "payment-method",
          label: "By Payment Method",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "QRIS",
              copy: "112 Txns",
              valueValue: 7240000,
              value: formatIdr(7240000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Card",
              copy: "86 Txns",
              valueValue: 5860000,
              value: formatIdr(5860000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Cash",
              copy: "54 Txns",
              valueValue: 3520000,
              value: formatIdr(3520000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "E-Wallet",
              copy: "34 Txns",
              valueValue: 1830000,
              value: formatIdr(1830000),
              color: "var(--feature-cashier-primary)",
            },
            {
              label: "Bank Transfer",
              copy: "18 Txns",
              valueValue: 1240000,
              value: formatIdr(1240000),
              color: "var(--feature-product-primary)",
            },
          ],
        },
        {
          id: "payment-type",
          label: "By Payment Type",
          totalLabel: "Total Sales",
          valueFormat: "currency",
          rows: [
            {
              label: "Full Pay",
              copy: "214 Txns",
              valueValue: 14240000,
              value: formatIdr(14240000),
              color: "var(--feature-brand-primary)",
            },
            {
              label: "Combined",
              copy: "46 Txns",
              valueValue: 2710000,
              value: formatIdr(2710000),
              color: "var(--feature-customer-primary)",
            },
            {
              label: "Split Bill",
              copy: "26 Txns",
              valueValue: 1500000,
              value: formatIdr(1500000),
              color: "var(--status-orange-primary)",
            },
            {
              label: "Open Bill",
              copy: "12 Txns",
              valueValue: 860000,
              value: formatIdr(860000),
              color: "var(--feature-cashier-primary)",
            },
          ],
        },
      ],
    },
    ingredientStockAlert: {
      title: "Ingredient Stock Alert",
      copy: `Review ingredients approaching minimum stock`,
      items: [
        {
          label: "Mozzarella Cheese",
          copy: "8 packs left",
          actionLabel: "Restock",
        },
        {
          label: "Burger Bun",
          copy: "26 pcs left",
          actionLabel: "Restock",
        },
        {
          label: "Chicken Breast",
          copy: "4.5 kg left",
          actionLabel: "Restock",
        },
        {
          label: "Arabica Beans",
          copy: "2.2 kg left",
          actionLabel: "Restock",
        },
      ],
    },
    discountReport: createDashboardDiscountReport(unitName),
    summaryRanges: {
      daily: {
        title: "Sales Summary Trend",
        stats: [
          ["Total Sales", formatIdr(18450000)],
          ["Total Orders", "286 Orders"],
        ],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Total Sales",
            color: "var(--feature-brand-primary)",
            values: [142, 156, 149, 173, 196, 222, 204],
          },
          {
            label: "Total Orders",
            color: "var(--feature-customer-primary)",
            values: [168, 181, 176, 205, 228, 246, 232],
          },
        ],
      },
      session: {
        title: "Sales Summary Trend",
        stats: [
          ["Total Sales", formatIdr(18450000)],
          ["Total Orders", "286 Orders"],
        ],
        labels: ["Breakfast", "Lunch", "Tea", "Dinner", "Late Night"],
        datasets: [
          {
            label: "Total Sales",
            color: "var(--feature-brand-primary)",
            values: [48, 174, 72, 201, 36],
          },
          {
            label: "Total Orders",
            color: "var(--feature-customer-primary)",
            values: [42, 126, 58, 138, 22],
          },
        ],
      },
      weekly: {
        title: "Sales Summary Trend",
        stats: [
          ["Weekly Sales", formatIdr(121300000)],
          ["Weekly Orders", "1,912 Orders"],
        ],
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
        datasets: [
          {
            label: "Total Sales",
            color: "var(--feature-brand-primary)",
            values: [112, 126, 134, 148, 143],
          },
          {
            label: "Total Orders",
            color: "var(--feature-customer-primary)",
            values: [154, 168, 177, 194, 188],
          },
        ],
      },
      monthly: {
        title: "Sales Summary Trend",
        stats: [
          ["Monthly Sales", formatIdr(512800000)],
          ["Monthly Orders", "8,642 Orders"],
        ],
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Total Sales",
            color: "var(--feature-brand-primary)",
            values: [384, 418, 451, 437, 472, 489],
          },
          {
            label: "Total Orders",
            color: "var(--feature-customer-primary)",
            values: [246, 261, 282, 276, 298, 314],
          },
        ],
      },
      yearly: {
        title: "Sales Summary Trend",
        stats: [
          ["Yearly Sales", formatIdr(6245000000)],
          ["Yearly Orders", "101,284 Orders"],
        ],
        labels: ["2022", "2023", "2024", "2025", "2026"],
        datasets: [
          {
            label: "Total Sales",
            color: "var(--feature-brand-primary)",
            values: [282, 346, 418, 506, 544],
          },
          {
            label: "Total Orders",
            color: "var(--feature-customer-primary)",
            values: [166, 198, 234, 278, 296],
          },
        ],
      },
    },
    comparisonPanel: {
      title: "Sales Comparison Report",
      copy: `Compare current sales performance against prior periods for ${unitName}.`,
      stats: [
        ["vs Previous Day", "+8.4%"],
        ["vs Previous Week", "+4.6%"],
        ["vs Previous Month", "+6.1%"],
        ["vs Previous Year", "+13.7%"],
      ],
      labels: ["Day", "Week", "Month", "Year"],
      datasets: [
        {
          label: "Total Sales",
          color: "var(--feature-brand-primary)",
          values: [8.4, 4.6, 6.1, 13.7],
        },
        {
          label: "Total Orders",
          color: "var(--feature-customer-primary)",
          values: [6.2, 3.8, 5.7, 11.4],
        },
      ],
    },
    performanceTabs: [
      {
        id: "item-qty",
        label: "By Item (Qty)",
        labelColumn: "Item",
        rows: [
          {
            label: "Burger Supreme",
            qty: "84",
            revenue: formatIdr(3985000),
          },
          {
            label: "Iced Coffee",
            qty: "79",
            revenue: formatIdr(2765000),
          },
          {
            label: "Caesar Salad",
            qty: "63",
            revenue: formatIdr(2142000),
          },
          {
            label: "Linguine Pesto",
            qty: "58",
            revenue: formatIdr(3270000),
          },
          {
            label: "Chicken Wrap",
            qty: "38",
            revenue: formatIdr(1976000),
          },
        ],
      },
      {
        id: "item-revenue",
        label: "By Item (Revenue)",
        labelColumn: "Item",
        rows: [
          {
            label: "Special Package",
            qty: "96",
            revenue: formatIdr(6240000),
          },
          {
            label: "Burger Supreme",
            qty: "84",
            revenue: formatIdr(3985000),
          },
          {
            label: "Linguine Pesto",
            qty: "58",
            revenue: formatIdr(3270000),
          },
          {
            label: "Iced Coffee",
            qty: "79",
            revenue: formatIdr(2765000),
          },
          {
            label: "Steak Bowl",
            qty: "41",
            revenue: formatIdr(2410000),
          },
        ],
      },
    ],
  };
}

