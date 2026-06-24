import { shiftDateByDays, formatDayMonth, getDaysInMonth, DASHBOARD_REPORT_TIME_RANGE_OPTIONS } from "../constants/dashboard.js";
import { formatDashboardReportDate, formatDashboardReportDateValue, parseDashboardReportDateValue, formatIdr, filterDashboardReportRowsByDate, createDashboardReportAnchorDate } from "./dashboardDateUtils.js";

export function formatSignedIdr(value) {
  const normalizedValue = Number(value ?? 0);
  if (normalizedValue === 0) return formatIdr(0);
  return `${normalizedValue > 0 ? "+" : "-"} ${formatIdr(
    Math.abs(normalizedValue)
  )}`;
}

export function createCashManagementDashboardData(unitName, anchorDate = new Date()) {
  const today = createDashboardReportAnchorDate(anchorDate);
  const businessUnitNames = ["Labamu Central Jakarta", "Labamu Bandung", "Labamu Surabaya", "Labamu Bali"];
  const staffs = [
    "Natasha Smith",
    "Rendy Saputra",
    "Salsa Mahendra",
    "Dio Ramadhan",
    "Kevin Pratama",
  ];
  const resolveCashShift = (time) => {
    const hour = Number(String(time).split(":")[0] ?? 0);
    if (hour < 11) return "Breakfast";
    if (hour < 17) return "Lunch";
    return "Dinner";
  };
  const cashMovementTemplates = [
    ["08:15", 0, "Cash In", 450000, "Morning petty cash reimbursement"],
    ["10:40", 0, "Cash Out", 125000, "Delivery change float"],
    ["12:25", 0, "Cash In", 1380000, "Lunch sales top up"],
    ["15:10", 1, "Cash Out", 95000, "Packaging replenishment"],
    ["16:35", 1, "Cash In", 920000, "Afternoon cash settlement"],
    ["18:45", 1, "Cash Out", 175000, "Courier cash handover"],
    ["20:05", 2, "Cash In", 760000, "Dinner shift cash pickup"],
    ["21:10", 2, "Cash Out", 84000, "Parking reimbursement"],
  ];
  const cashInOutRows = cashMovementTemplates.map(
    ([time, dayOffset, type, amountValue, reason], index) => {
      const date = shiftDateByDays(today, -dayOffset);
      return {
        id: `cash-flow-${index + 1}`,
        businessUnit: businessUnitNames[index % businessUnitNames.length],
        dateValue: formatDashboardReportDateValue(date),
        dateTime: `${formatDashboardReportDate(date)}, ${time}`,
        shift: resolveCashShift(time),
        type,
        amount: formatIdr(amountValue),
        amountValue,
        reason,
        createdBy: staffs[index % staffs.length],
      };
    }
  );
  const cashDropTemplates = [
    ["13:20", 0, 850000, "Midday safe drop", "Natasha Smith"],
    ["18:10", 0, 1260000, "Shift change drop", "Rendy Saputra"],
    ["21:25", 0, 980000, "Closing safe drop", "Kevin Pratama"],
  ];
  const cashDropRows = cashDropTemplates.map(
    ([time, dayOffset, amountValue, note, processedBy], index) => {
      const date = shiftDateByDays(today, -dayOffset);
      return {
        id: `cash-drop-${index + 1}`,
        businessUnit: businessUnitNames[index % businessUnitNames.length],
        dateValue: formatDashboardReportDateValue(date),
        dateTime: `${formatDashboardReportDate(date)}, ${time}`,
        shift: resolveCashShift(time),
        amount: formatIdr(amountValue),
        amountValue,
        note,
        processedBy,
      };
    }
  );
  const cashAuditTemplates = [
    ["14:00", 0, 3485000, 3478000, "Rendy Saputra"],
    ["18:30", 0, 2950000, 2972000, "Salsa Mahendra"],
    ["21:45", 0, 1821000, 1803000, "Kevin Pratama"],
    ["22:10", 1, 1645000, 1654000, "Natasha Smith"],
  ];
  const cashAuditRows = cashAuditTemplates.map(
    ([time, dayOffset, expectedCashValue, actualCashValue, verifiedBy], index) => {
      const date = shiftDateByDays(today, -dayOffset);
      const differenceValue = actualCashValue - expectedCashValue;
      return {
        id: `cash-audit-${index + 1}`,
        businessUnit: businessUnitNames[index % businessUnitNames.length],
        dateValue: formatDashboardReportDateValue(date),
        dateTime: `${formatDashboardReportDate(date)}, ${time}`,
        shift: resolveCashShift(time),
        expectedCash: formatIdr(expectedCashValue),
        expectedCashValue,
        actualCash: formatIdr(actualCashValue),
        actualCashValue,
        difference: formatSignedIdr(differenceValue),
        differenceValue,
        verifiedBy,
      };
    }
  );

  const openingCashValue = 1500000;
  const totalCashInflowValue = cashInOutRows
    .filter((row) => row.type === "Cash In")
    .reduce((sum, row) => sum + row.amountValue, 0);
  const totalCashOutflowValue = cashInOutRows
    .filter((row) => row.type === "Cash Out")
    .reduce((sum, row) => sum + row.amountValue, 0);
  const totalCashDropValue = cashDropRows.reduce(
    (sum, row) => sum + row.amountValue,
    0
  );
  const expectedCashValue =
    openingCashValue +
    totalCashInflowValue -
    totalCashOutflowValue -
    totalCashDropValue;
  const actualCashValue =
    cashAuditRows[0]?.actualCashValue ?? Math.max(0, expectedCashValue - 18000);
  const closingCashValue = actualCashValue;
  const netCashChangeValue = closingCashValue - openingCashValue;
  const cashAccuracyValue = actualCashValue - expectedCashValue;
  const totalShortageValue = cashAuditRows
    .filter((row) => row.differenceValue < 0)
    .reduce((sum, row) => sum + Math.abs(row.differenceValue), 0);
  const totalOverValue = cashAuditRows
    .filter((row) => row.differenceValue > 0)
    .reduce((sum, row) => sum + row.differenceValue, 0);

  return {
    title: "Cash Management",
    copy: `Monitor drawer movement, drops, and audit variances for ${unitName}.`,
    summaryCards: [
      {
        label: "Opening Cash",
        value: formatIdr(openingCashValue),
        tone: "neutral",
        iconName: "metricOrders",
      },
      {
        label: "Closing Cash",
        value: formatIdr(closingCashValue),
        tone: "brand",
        iconName: "metricNet",
      },
      {
        label: "Net Cash Change",
        value: formatSignedIdr(netCashChangeValue),
        tone: netCashChangeValue >= 0 ? "success" : "danger",
        iconName: "metricGross",
      },
      {
        label: "Total Cash Inflow",
        value: formatIdr(totalCashInflowValue),
        tone: "brand",
        iconName: "metricGross",
      },
      {
        label: "Total Cash Outflow",
        value: formatIdr(totalCashOutflowValue),
        tone: "warning",
        iconName: "metricRefund",
      },
      {
        label: "Cash Accuracy",
        value:
          cashAccuracyValue === 0
            ? formatIdr(0)
            : formatSignedIdr(cashAccuracyValue),
        tone:
          cashAccuracyValue === 0
            ? "success"
            : cashAccuracyValue > 0
              ? "brand"
              : "danger",
        iconName: "metricTax",
      },
    ],
    cashInOutRows,
    cashDropRows,
    cashAuditRows,
    discrepancyRows: cashAuditRows.filter((row) => row.differenceValue !== 0),
    shortageOverCards: [
      {
        label: "Total Shortage",
        count: formatIdr(totalShortageValue),
        tone: "danger",
      },
      { label: "Total Over", count: formatIdr(totalOverValue), tone: "success" },
    ],
  };
}

export function createFinancialReportDashboardData(unitName, anchorDate = new Date()) {
  const today = createDashboardReportAnchorDate(anchorDate);
  const grossSalesValue = 26870000;
  const discountsValue = 1285000;
  const refundsValue = 415000;
  const netRevenueValue = grossSalesValue - discountsValue - refundsValue;
  const totalRevenueValue = netRevenueValue;
  const cogsValue = 8420000;
  const grossProfitValue = netRevenueValue - cogsValue;
  const marginPct = Math.round((grossProfitValue / netRevenueValue) * 1000) / 10;
  const businessUnitNames = [
    "Labamu Central Jakarta",
    "Labamu Bandung",
    "Labamu Surabaya",
    "Labamu Bali",
  ];
  const staffs = [
    "Natasha Smith",
    "Rendy Saputra",
    "Salsa Mahendra",
    "Dio Ramadhan",
    "Kevin Pratama",
  ];
  const taxRows = [
    {
      id: "tax-vat",
      taxType: "VAT",
      taxableSalesValue: 19650000,
      taxableSales: formatIdr(19650000),
      taxCollectedValue: 2161500,
      taxCollected: formatIdr(2161500),
    },
    {
      id: "tax-service",
      taxType: "Service Charge",
      taxableSalesValue: 8240000,
      taxableSales: formatIdr(8240000),
      taxCollectedValue: 412000,
      taxCollected: formatIdr(412000),
    },
  ];
  const totalTaxCollectedValue = taxRows.reduce(
    (sum, row) => sum + row.taxCollectedValue,
    0
  );
  const totalTaxableSalesValue = taxRows.reduce(
    (sum, row) => sum + row.taxableSalesValue,
    0
  );
  const expenseRows = Array.from({ length: 5 }, (_, index) => {
    return {
      id: `expense-${index + 1}`,
      businessUnit: businessUnitNames[index % businessUnitNames.length],
      dateValue: formatDashboardReportDateValue(shiftDateByDays(today, -index)),
      date: formatDashboardReportDate(shiftDateByDays(today, -index)),
      expenseCategory: ["Utilities", "Cleaning Supplies", "Courier", "Office Supplies", "Repairs"][index % 5],
      amountValue: [420000, 185000, 96000, 125000, 310000][index % 5],
      amount: formatIdr([420000, 185000, 96000, 125000, 310000][index % 5]),
      description: [
        "Electricity top-up for kitchen equipment",
        "Dishwashing and sanitation restock",
        "Inter-unit document delivery",
        "Paper and ink replenishment",
        "AC maintenance service",
      ][index % 5],
      createdBy: staffs[index % staffs.length],
    };
  });
  const totalExpensesValue = expenseRows.reduce(
    (sum, row) => sum + row.amountValue,
    0
  );
  const netProfitEstimateValue =
    netRevenueValue - cogsValue - totalExpensesValue - totalTaxCollectedValue;
  const netProfitValueTone =
    netProfitEstimateValue < 0
      ? "negative"
      : netProfitEstimateValue > 0
        ? "positive"
        : "default";

  return {
    title: "Financial Report",
    copy: `Review revenue, cost, tax, and net profit signals for ${unitName}.`,
    revenueTrendCopy: "+6.2% vs previous period",
    cogsValue,
    totalRevenueValue,
    grossProfitValue,
    marginPct,
    taxRows,
    totalTaxCollectedValue,
    totalTaxableSalesValue,
    expenseRows,
    totalExpensesValue,
    netProfitEstimateValue,
    summaryCards: [
      {
        id: "net-revenue",
        title: "Net Revenue",
        value: formatIdr(netRevenueValue),
        badgeText: "+6.2%",
        badgeTone: "success",
        detailRows: [
          { label: "Gross Sales", value: formatIdr(grossSalesValue) },
          {
            label: "Discounts",
            value: `- ${formatIdr(discountsValue)}`,
            tone: "negative",
          },
          {
            label: "Refunds",
            value: `- ${formatIdr(refundsValue)}`,
            tone: "negative",
          },
        ],
      },
      {
        id: "gross-profit",
        title: "Gross Profit",
        value: formatIdr(grossProfitValue),
        badgeText: `${marginPct}% Margin`,
        badgeTone: "brand",
        detailRows: [{ label: "COGS", value: formatIdr(cogsValue) }],
      },
      {
        id: "tax-collected",
        title: "Total Tax Collected",
        value: formatIdr(totalTaxCollectedValue),
        detailRows: [
          {
            label: taxRows[0]?.taxType ?? "VAT",
            value: taxRows[0]?.taxCollected ?? formatIdr(0),
          },
          {
            label: taxRows[1]?.taxType ?? "Service Charge",
            value: taxRows[1]?.taxCollected ?? formatIdr(0),
          },
          {
            label: "Taxable Sales",
            value: formatIdr(totalTaxableSalesValue),
          },
        ],
      },
      {
        id: "net-profit",
        title: "Estimate Net Profit",
        value: formatIdr(netProfitEstimateValue),
        valueTone: netProfitValueTone,
        detailRows: [
          { label: "Gross Profit", value: formatIdr(grossProfitValue) },
          {
            label: "Expenses",
            value: `- ${formatIdr(totalExpensesValue)}`,
            tone: "negative",
          },
          {
            label: "Taxes",
            value: `- ${formatIdr(totalTaxCollectedValue)}`,
            tone: "negative",
          },
        ],
      },
    ],
  };
}

