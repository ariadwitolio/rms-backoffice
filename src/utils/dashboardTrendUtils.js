import { DASHBOARD_REPORT_TIME_RANGE_OPTIONS, formatDayMonth, formatMonthYear, formatShortMonth, shiftDateByDays, shiftDateByMonths, getDaysInMonth } from "../constants/dashboard.js";
import { formatDashboardReportDate, createDashboardReportAnchorDate, parseDashboardReportDateValue, normalizeDashboardReportDateRange, getDashboardReportDateRangeLengthInDays, getDashboardReportChartDateBounds, getMonthDifference, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, formatIdr, formatDashboardReportDateValue } from "./dashboardDateUtils.js";

export function getDashboardReportTrendWindow(
  rangeId,
  timeRange,
  customRange,
  rows = [],
  anchorDate = new Date(),
  offset = 0
) {
  const { start, end } = getDashboardReportChartDateBounds(
    timeRange,
    customRange,
    rows,
    anchorDate
  );
  const normalizedStart = createDashboardReportAnchorDate(start);
  const normalizedEnd = createDashboardReportAnchorDate(end);
  const normalizedOffset = Math.max(0, offset);
  const rangeLength = getDashboardReportDateRangeLengthInDays(
    timeRange,
    customRange,
    anchorDate
  );
  const today = createDashboardReportAnchorDate(anchorDate);

  if (rangeId === "hourly" || rangeId === "shift") {
    const navigationLimit = Math.max(
      0,
      Math.floor(
        (normalizedEnd.getTime() - normalizedStart.getTime()) /
        (1000 * 60 * 60 * 24)
      )
    );
    const targetDate = shiftDateByDays(
      normalizedEnd,
      -Math.min(normalizedOffset, navigationLimit)
    );

    return {
      anchorDate: targetDate,
      navigationLabel:
        targetDate.getTime() === today.getTime()
          ? "Today"
          : formatDashboardReportDate(targetDate),
      navigationLimit,
      rangeEnd: targetDate,
      rangeStart: targetDate,
    };
  }

  if (rangeId === "daily") {
    const shouldUseExactDateRange =
      timeRange === "Today" ||
      timeRange === "Last 7 Days" ||
      timeRange === "Last 30 Days" ||
      (timeRange === "Custom Date" &&
        Number.isFinite(rangeLength) &&
        rangeLength <= 31);

    if (shouldUseExactDateRange) {
      const navigationLimit = timeRange === "Today" ? 0 : 0;

      return {
        anchorDate: normalizedEnd,
        navigationLabel:
          normalizedEnd.getTime() === today.getTime()
            ? "Today"
            : formatDashboardReportDate(normalizedEnd),
        navigationLimit,
        rangeEnd: normalizedEnd,
        rangeStart: normalizedStart,
      };
    }
  }

  if (rangeId === "weekly") {
    const allowHistoricalMonths =
      timeRange === "All Time" ||
      (timeRange === "Custom Date" && Number.isFinite(rangeLength) && rangeLength > 30);
    const endMonth = getStartOfMonth(normalizedEnd);
    const startMonth = allowHistoricalMonths
      ? getStartOfMonth(normalizedStart)
      : endMonth;
    const navigationLimit = allowHistoricalMonths
      ? Math.max(0, getMonthDifference(startMonth, endMonth))
      : 0;
    const targetMonth = shiftDateByMonths(
      endMonth,
      -Math.min(normalizedOffset, navigationLimit)
    );
    const isCurrentMonth =
      targetMonth.getFullYear() === normalizedEnd.getFullYear() &&
      targetMonth.getMonth() === normalizedEnd.getMonth();

    return {
      anchorDate: isCurrentMonth ? normalizedEnd : getEndOfMonth(targetMonth),
      navigationLabel:
        normalizedOffset === 0 ? "This Month" : formatMonthYear(targetMonth),
      navigationLimit,
      rangeEnd: isCurrentMonth ? normalizedEnd : getEndOfMonth(targetMonth),
      rangeStart: getStartOfMonth(targetMonth),
    };
  }

  const allowHistoricalYears =
    timeRange === "All Time" ||
    (timeRange === "Custom Date" && Number.isFinite(rangeLength) && rangeLength > 365);
  const endYear = getStartOfYear(normalizedEnd);
  const startYear = allowHistoricalYears
    ? getStartOfYear(normalizedStart)
    : endYear;
  const navigationLimit = allowHistoricalYears
    ? Math.max(0, endYear.getFullYear() - startYear.getFullYear())
    : 0;
  const targetYear = new Date(
    endYear.getFullYear() - Math.min(normalizedOffset, navigationLimit),
    0,
    1
  );
  const isCurrentYear = targetYear.getFullYear() === normalizedEnd.getFullYear();

  return {
    anchorDate: isCurrentYear ? normalizedEnd : getEndOfYear(targetYear),
    navigationLabel:
      normalizedOffset === 0 ? "This Year" : String(targetYear.getFullYear()),
    navigationLimit,
    rangeEnd: isCurrentYear ? normalizedEnd : getEndOfYear(targetYear),
    rangeStart: getStartOfYear(targetYear),
  };
}

export function getDashboardReportTrendNavigationLabel(
  rangeId,
  timeRange,
  customRange,
  rows = [],
  anchorDate = new Date(),
  offset = 0
) {
  return getDashboardReportTrendWindow(
    rangeId,
    timeRange,
    customRange,
    rows,
    anchorDate,
    offset
  ).navigationLabel;
}

export function getDashboardReportTrendAnchorDateForOffset(
  rangeId,
  timeRange,
  customRange,
  rows = [],
  anchorDate = new Date(),
  offset = 0
) {
  return getDashboardReportTrendWindow(
    rangeId,
    timeRange,
    customRange,
    rows,
    anchorDate,
    offset
  ).anchorDate;
}

export function createDashboardCatalogPerformanceRows(anchorDate = new Date()) {
  const today = createDashboardReportAnchorDate(anchorDate);
  const catalogs = [
    {
      id: "special-package",
      label: "Special Package",
      baseOrders: 18,
      grossPerOrder: 155000,
      discountRate: 0.042,
    },
    {
      id: "burger-supreme",
      label: "Burger Supreme",
      baseOrders: 14,
      grossPerOrder: 92000,
      discountRate: 0.035,
    },
    {
      id: "iced-coffee",
      label: "Iced Coffee",
      baseOrders: 20,
      grossPerOrder: 38000,
      discountRate: 0.028,
    },
    {
      id: "caesar-salad",
      label: "Caesar Salad",
      baseOrders: 9,
      grossPerOrder: 64000,
      discountRate: 0.031,
    },
    {
      id: "linguine-pesto",
      label: "Linguine Pesto",
      baseOrders: 8,
      grossPerOrder: 86000,
      discountRate: 0.034,
    },
    {
      id: "chicken-wrap",
      label: "Chicken Wrap",
      baseOrders: 11,
      grossPerOrder: 52000,
      discountRate: 0.029,
    },
  ];
  const shifts = ["Breakfast", "Lunch", "Tea", "Dinner"];
  const staffs = [
    "Natasha Smith",
    "Rendy Saputra",
    "Salsa Mahendra",
    "Dio Ramadhan",
    "Kevin Pratama",
  ];
  const orderTypes = ["Dine In", "Take Away", "Delivery", "Pickup"];

  return Array.from({ length: 45 }, (_, dayOffset) => {
    const date = shiftDateByDays(today, -dayOffset);
    const dateValue = formatDashboardReportDateValue(date);

    return catalogs.map((catalog, catalogIndex) => {
      const totalOrders =
        catalog.baseOrders +
        ((dayOffset + catalogIndex * 2) % 6) +
        (catalogIndex % 3);
      const grossSales =
        totalOrders * catalog.grossPerOrder +
        dayOffset * 4200 +
        catalogIndex * 6000;
      const discountValue = Math.round(
        grossSales *
        (catalog.discountRate + ((dayOffset + catalogIndex) % 3) * 0.004)
      );
      const netSales = grossSales - discountValue;

      return {
        id: `catalog-performance-${dateValue}-${catalog.id}`,
        date: formatDashboardReportDate(date),
        dateValue,
        catalog: catalog.label,
        shift: shifts[(dayOffset + catalogIndex) % shifts.length],
        staff: staffs[(dayOffset + catalogIndex * 2) % staffs.length],
        orderType: orderTypes[(dayOffset + catalogIndex) % orderTypes.length],
        totalOrdersValue: totalOrders,
        totalGrossSalesValue: grossSales,
        totalNetSalesValue: netSales,
        totalDiscountValue: discountValue,
        totalTaxValue: Math.round(netSales * 0.11),
        totalOrders: new Intl.NumberFormat("en-US").format(totalOrders),
        totalGrossSales: formatIdr(grossSales),
        totalNetSales: formatIdr(netSales),
        discountApplied: formatIdr(discountValue),
        taxCollected: formatIdr(Math.round(netSales * 0.11)),
      };
    });
  }).flat();
}

