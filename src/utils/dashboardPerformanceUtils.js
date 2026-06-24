import { DASHBOARD_REPORT_TIME_RANGE_OPTIONS, SALES_SUMMARY_RANGE_TABS, shiftDateByDays, shiftDateByMonths, getDaysInMonth } from "../constants/dashboard.js";
import { formatDashboardReportDateValue, parseDashboardReportDateValue, normalizeDashboardReportDateRange, filterDashboardReportRowsByDate, formatIdr, createDashboardReportAnchorDate } from "./dashboardDateUtils.js";

export function getDashboardPerformanceTimeRangeMultiplier(timeRange, customRange) {
  if (timeRange === "Today") return 1;
  if (timeRange === "Last 7 Days") return 4;
  if (timeRange === "Last 30 Days") return 11;
  if (timeRange === "All Time") return 18;

  const start = parseDashboardReportDateValue(customRange.start);
  const end = parseDashboardReportDateValue(customRange.end);
  if (!start || !end) return 1;

  const normalizedStart = start.getTime() <= end.getTime() ? start : end;
  const normalizedEnd = start.getTime() <= end.getTime() ? end : start;
  const diffDays =
    Math.floor(
      (normalizedEnd.getTime() - normalizedStart.getTime()) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  if (diffDays <= 1) return 1;
  if (diffDays <= 7) return 4;
  if (diffDays <= 30) return 11;
  return 18;
}

export function getDashboardPerformanceTabsForTimeRange(tabs, timeRange, customRange) {
  const multiplier = getDashboardPerformanceTimeRangeMultiplier(
    timeRange,
    customRange
  );

  return tabs.map((tab) => ({
    ...tab,
    rows: tab.rows.map((row) => {
      const baseQty =
        row.qtyValue ??
        (Number(String(row.qty ?? "0").replace(/[^0-9]/g, "")) || 0);
      const baseRevenue =
        row.revenueValue ??
        (Number(String(row.revenue ?? "0").replace(/[^0-9]/g, "")) || 0);
      const qty = Math.max(1, Math.round(baseQty * multiplier));
      const revenue = Math.max(
        0,
        Math.round(
          baseRevenue * multiplier * (timeRange === "All Time" ? 0.92 : 1)
        )
      );

      return {
        ...row,
        qtyValue: baseQty,
        revenueValue: baseRevenue,
        qty: new Intl.NumberFormat("en-US").format(qty),
        revenue: formatIdr(revenue),
      };
    }),
  }));
}

export function getDashboardSalesBreakdownSummaryForTimeRange(
  summary,
  timeRange,
  customRange
) {
  const multiplier = getDashboardPerformanceTimeRangeMultiplier(
    timeRange,
    customRange
  );
  const salesMultiplier = multiplier * (timeRange === "All Time" ? 0.92 : 1);
  const baseTotalSales =
    summary?.totalSalesValue ??
    (summary?.tabs || [])
      .find((tab) => tab.id === "item-revenue")
      ?.rows?.reduce((sum, row) => sum + (row.valueValue ?? 0), 0) ??
    0;
  const baseTotalOrders =
    summary?.totalOrdersValue ??
    (summary?.tabs || [])
      .find((tab) => tab.id === "item-qty")
      ?.rows?.reduce((sum, row) => sum + (row.valueValue ?? 0), 0) ??
    0;
  const totalSalesValue = Math.max(
    0,
    Math.round(baseTotalSales * salesMultiplier)
  );
  const totalOrdersValue = Math.max(
    0,
    Math.round(baseTotalOrders * multiplier)
  );

  return {
    ...summary,
    totalSalesValue,
    totalOrdersValue,
    totalSalesDisplayValue: formatIdr(totalSalesValue),
    totalOrdersDisplayValue: `${new Intl.NumberFormat("en-US").format(
      totalOrdersValue
    )} Orders`,
    tabs: (summary?.tabs || []).map((tab) => ({
      ...tab,
      rows: (tab.rows || []).map((row) => {
        const baseValue = row.valueValue ?? 0;
        const valueFormat = row.valueFormat ?? tab.valueFormat ?? "currency";
        const scaledValue = Math.max(
          0,
          Math.round(
            baseValue * (valueFormat === "qty" ? multiplier : salesMultiplier)
          )
        );

        return {
          ...row,
          valueValue: baseValue,
          scaledValue,
          displayValue:
            valueFormat === "qty"
              ? new Intl.NumberFormat("en-US").format(scaledValue)
              : new Intl.NumberFormat("id-ID").format(scaledValue),
        };
      }),
    })),
  };
}

export function aggregateDashboardReportRowsByCatalog(rows, reportId) {
  const groupedRows = new Map();

  rows.forEach((row) => {
    const current = groupedRows.get(row.catalog) ?? {
      id: row.catalog.toLowerCase().replace(/\s+/g, "-"),
      catalog: row.catalog,
      totalOrdersValue: 0,
      discountAppliedValue: 0,
      taxCollectedValue: 0,
      totalGrossSalesValue: 0,
      totalNetSalesValue: 0,
    };

    current.totalOrdersValue += row.totalOrdersValue;
    current.discountAppliedValue += row.discountAppliedValue ?? 0;
    current.taxCollectedValue += row.taxCollectedValue ?? 0;
    current.totalGrossSalesValue += row.totalGrossSalesValue;
    current.totalNetSalesValue += row.totalNetSalesValue;
    groupedRows.set(row.catalog, current);
  });

  return Array.from(groupedRows.values())
    .map((row) => ({
      ...row,
      totalOrders: new Intl.NumberFormat("en-US").format(row.totalOrdersValue),
      discountApplied: formatIdr(row.discountAppliedValue),
      taxCollected: formatIdr(row.taxCollectedValue),
      totalGrossSales: formatIdr(row.totalGrossSalesValue),
      totalNetSales: formatIdr(row.totalNetSalesValue),
    }))
    .sort((left, right) =>
      reportId === "total-orders"
        ? right.totalOrdersValue - left.totalOrdersValue
        : right.totalNetSalesValue - left.totalNetSalesValue
    );
}

export function getDashboardReportAggregateMeta(detailView) {
  switch (detailView) {
    case "by-business-unit":
      return { key: "businessUnit", label: "Entity" };
    case "by-category":
      return { key: "category", label: "Category" };
    case "by-modifier":
      return { key: "modifier", label: "Modifier" };
    case "by-order-type":
      return { key: "orderType", label: "Order Type" };
    case "by-table":
      return { key: "table", label: "Table" };
    case "by-staff":
      return { key: "staff", label: "Staff" };
    case "by-payment-method":
      return { key: "payment", label: "Payment Method" };
    case "by-item":
    default:
      return { key: "catalog", label: "Catalog" };
  }
}

export function aggregateDashboardReportRows(rows, detailView, reportId) {
  const aggregateMeta = getDashboardReportAggregateMeta(detailView);
  const groupedRows = new Map();

  rows.forEach((row) => {
    const groupValue = row[aggregateMeta.key] ?? "-";
    const current = groupedRows.get(groupValue) ?? {
      id: `${aggregateMeta.key}-${String(groupValue)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`,
      groupLabel: groupValue,
      totalOrdersValue: 0,
      discountAppliedValue: 0,
      taxCollectedValue: 0,
      totalGrossSalesValue: 0,
      totalNetSalesValue: 0,
    };

    current.totalOrdersValue += row.totalOrdersValue ?? 0;
    current.discountAppliedValue += row.discountAppliedValue ?? 0;
    current.taxCollectedValue += row.taxCollectedValue ?? 0;
    current.totalGrossSalesValue += row.totalGrossSalesValue ?? 0;
    current.totalNetSalesValue += row.totalNetSalesValue ?? 0;
    groupedRows.set(groupValue, current);
  });

  return Array.from(groupedRows.values())
    .map((row) => ({
      ...row,
      totalOrders: new Intl.NumberFormat("en-US").format(row.totalOrdersValue),
      discountApplied: formatIdr(row.discountAppliedValue),
      taxCollected: formatIdr(row.taxCollectedValue),
      totalGrossSales: formatIdr(row.totalGrossSalesValue),
      totalNetSales: formatIdr(row.totalNetSalesValue),
    }))
    .sort((left, right) =>
      reportId === "total-orders"
        ? right.totalOrdersValue - left.totalOrdersValue
        : right.totalNetSalesValue - left.totalNetSalesValue
    );
}

export function getDashboardReportTrendMeta(detailView) {
  switch (detailView) {
    case "by-business-unit":
      return {
        key: "businessUnit",
        title: "Entity Trend",
      };
    case "by-category":
      return {
        key: "category",
        title: "Category Trend",
      };
    case "by-modifier":
      return {
        key: "modifier",
        title: "Modifier Trend",
      };
    case "by-order-type":
      return {
        key: "orderType",
        title: "Order Type Trend",
      };
    case "by-table":
      return {
        key: "table",
        title: "Table Trend",
      };
    case "by-staff":
      return {
        key: "staff",
        title: "Staff Trend",
      };
    case "by-payment-method":
      return {
        key: "payment",
        title: "Payment Method Trend",
      };
    case "by-order":
      return {
        key: "status",
        title: "Transaction Trend",
      };
    case "by-item":
    default:
      return {
        key: "catalog",
        title: "Item Trend",
      };
  }
}

export function getDashboardReportTrendAnchorDate(rows, anchorDate = new Date()) {
  const normalizedAnchorDate = createDashboardReportAnchorDate(anchorDate);
  const latestTimestamp = rows.reduce((latest, row) => {
    const rowDate = parseDashboardReportDateValue(row.dateValue);
    if (!rowDate) return latest;
    return Math.max(latest, rowDate.getTime());
  }, 0);

  return latestTimestamp ? new Date(latestTimestamp) : normalizedAnchorDate;
}

export function getDashboardScopedColumns(columns, hideBusinessUnitColumn = false) {
  return hideBusinessUnitColumn
    ? columns.filter((column) => column.key !== "businessUnit")
    : columns;
}

