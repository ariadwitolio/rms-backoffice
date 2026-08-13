import { formatShortMonth, formatDayMonth, shiftDateByDays, shiftDateByMonths, SALES_SUMMARY_RANGE_TABS } from "../constants/dashboard.js";

export function formatIdr(amount) {
  return `IDR ${new Intl.NumberFormat("en-US").format(amount)}`;
}

export function createDashboardReportAnchorDate(anchorDate = new Date()) {
  return new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate()
  );
}

export function formatDashboardReportDate(date) {
  return `${date.getDate()} ${formatShortMonth(date)} ${date.getFullYear()}`;
}

export function formatDashboardReportDateValue(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function createTodayDashboardReportCustomRange(anchorDate = new Date()) {
  const todayValue = formatDashboardReportDateValue(
    createDashboardReportAnchorDate(anchorDate)
  );

  return {
    start: todayValue,
    end: todayValue,
  };
}

export function parseDashboardReportDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function normalizeDashboardReportDateRange(timeRange, customRange, anchorDate) {
  return normalizeDashboardReportDateRangeWithOffset(
    timeRange,
    customRange,
    anchorDate,
    0
  );
}

export function normalizeDashboardReportDateRangeWithOffset(
  timeRange,
  customRange,
  anchorDate,
  offset = 0
) {
  const today = createDashboardReportAnchorDate(anchorDate);

  if (timeRange === "All Time") {
    return { start: null, end: shiftDateByDays(today, -offset) };
  }

  if (timeRange === "Today") {
    const targetDate = shiftDateByDays(today, -offset);
    return { start: targetDate, end: targetDate };
  }

  if (timeRange === "Last 7 Days") {
    const endDate = shiftDateByDays(today, -offset);
    return { start: shiftDateByDays(endDate, -6), end: endDate };
  }

  if (timeRange === "Last 30 Days") {
    const endDate = shiftDateByDays(today, -offset);
    return { start: shiftDateByDays(endDate, -29), end: endDate };
  }

  const start = parseDashboardReportDateValue(customRange.start);
  const end = parseDashboardReportDateValue(customRange.end);

  if (start && end && start.getTime() > end.getTime()) {
    const rangeLength =
      Math.floor((start.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return {
      start: shiftDateByDays(end, -offset),
      end: shiftDateByDays(start, -offset),
    };
  }

  if (start && end) {
    return {
      start: shiftDateByDays(start, -offset),
      end: shiftDateByDays(end, -offset),
    };
  }

  return { start, end };
}

export function filterDashboardReportRowsByDate(
  rows,
  timeRange,
  customRange,
  anchorDate,
  offset = 0
) {
  const { start, end } = normalizeDashboardReportDateRangeWithOffset(
    timeRange,
    customRange,
    anchorDate,
    offset
  );

  if (!start && !end) return rows;

  return (rows || []).filter((row) => {
    const rowDate = parseDashboardReportDateValue(row.dateValue);
    if (!rowDate) return true;
    if (start && rowDate.getTime() < start.getTime()) return false;
    if (end && rowDate.getTime() > end.getTime()) return false;
    return true;
  });
}

export function getDashboardReportDateRangeLengthInDays(
  timeRange,
  customRange,
  anchorDate
) {
  const { start, end } = normalizeDashboardReportDateRange(
    timeRange,
    customRange,
    anchorDate
  );

  if (!start || !end) return Number.POSITIVE_INFINITY;

  return (
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

export function getDashboardTrendCopyForTimeRange(
  timeRange,
  customRange,
  anchorDate = new Date()
) {
  if (timeRange === "Today") return "vs previous day";
  if (timeRange === "Last 7 Days") return "vs previous week";
  if (timeRange === "Last 30 Days") return "vs previous month";
  if (timeRange === "All Time") return "vs previous period";

  if (timeRange === "Custom Date") {
    const rangeLength = getDashboardReportDateRangeLengthInDays(
      timeRange,
      customRange,
      anchorDate
    );

    if (!Number.isFinite(rangeLength)) return "vs previous period";
    if (rangeLength <= 1) return "vs previous day";
    if (rangeLength === 7) return "vs previous week";
    if (rangeLength >= 28 && rangeLength <= 31) return "vs previous month";
  }

  return "vs previous period";
}

export function getDashboardReportTrendNavigationLimit(
  timeRange,
  customRange,
  rows = [],
  anchorDate = new Date()
) {
  if (timeRange === "All Time") return 0;

  const normalizedAnchorDate = createDashboardReportAnchorDate(anchorDate);
  const rowDates = rows
    .map((row) => parseDashboardReportDateValue(row.dateValue))
    .filter(Boolean)
    .sort((left, right) => left.getTime() - right.getTime());

  const earliestDate = rowDates[0] ?? normalizedAnchorDate;
  const daysAvailable = Math.max(
    0,
    Math.floor(
      (normalizedAnchorDate.getTime() - earliestDate.getTime()) /
      (1000 * 60 * 60 * 24)
    )
  );
  const rangeLength = getDashboardReportDateRangeLengthInDays(
    timeRange,
    customRange,
    anchorDate
  );

  if (!Number.isFinite(rangeLength)) return daysAvailable;

  if (timeRange === "Today") return 0;

  return Math.max(0, Math.min(daysAvailable, rangeLength - 1));
}

export function getDashboardReportChartDateBounds(
  timeRange,
  customRange,
  rows = [],
  anchorDate = new Date()
) {
  const normalizedAnchorDate = createDashboardReportAnchorDate(anchorDate);
  const normalizedRange = normalizeDashboardReportDateRange(
    timeRange,
    customRange,
    anchorDate
  );
  const rowDates = rows
    .map((row) => parseDashboardReportDateValue(row.dateValue))
    .filter(Boolean)
    .sort((left, right) => left.getTime() - right.getTime());
  const earliestDate = rowDates[0] ?? normalizedAnchorDate;

  if (timeRange === "All Time") {
    return {
      start: earliestDate,
      end: normalizedRange.end ?? normalizedAnchorDate,
    };
  }

  return {
    start: normalizedRange.start ?? earliestDate,
    end: normalizedRange.end ?? normalizedAnchorDate,
  };
}

export function getMonthDifference(start, end) {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

export function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getStartOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function getEndOfYear(date) {
  return new Date(date.getFullYear(), 11, 31);
}

export function getDashboardReportTrendTabsForTimeRange(
  timeRange,
  customRange,
  anchorDate = new Date()
) {
  const rangeLength = getDashboardReportDateRangeLengthInDays(
    timeRange,
    customRange,
    anchorDate
  );
  if (timeRange === "All Time") {
    return SALES_SUMMARY_RANGE_TABS;
  }

  if (timeRange === "Last 30 Days") {
    return SALES_SUMMARY_RANGE_TABS.filter((tab) => tab.id !== "monthly");
  }

  if (timeRange === "Custom Date") {
    if (rangeLength <= 7) {
      return SALES_SUMMARY_RANGE_TABS.filter(
        (tab) => tab.id === "hourly" || tab.id === "shift" || tab.id === "daily"
      );
    }

    if (rangeLength <= 30) {
      return SALES_SUMMARY_RANGE_TABS.filter((tab) => tab.id !== "monthly");
    }

    return SALES_SUMMARY_RANGE_TABS;
  }

  return SALES_SUMMARY_RANGE_TABS.filter(
    (tab) => tab.id === "hourly" || tab.id === "shift" || tab.id === "daily"
  );
}

