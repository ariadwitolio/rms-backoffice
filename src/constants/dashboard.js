export const SALES_SUMMARY_RANGE_TABS = [
  { id: "hourly", label: "Hourly" },
  { id: "shift", label: "Shift" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export function createInitialDashboardReportTrendOffsets() {
  return {
    hourly: 0,
    shift: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
  };
}

export function createInitialSalesSummaryNavigationState() {
  return {
    hourly: 0,
    shift: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
  };
}

export function createInitialSalesSummaryComparisonSelectionState() {
  return {
    hourly: { current: 0, compare: 1 },
    shift: { current: 0, compare: 1 },
    daily: { current: 0, compare: 1 },
    weekly: { current: 0, compare: 1 },
    monthly: { current: 0, compare: 1 },
  };
}

export function shiftDateByDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function shiftDateByMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function formatShortMonth(date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export function formatDayMonth(date) {
  return `${date.getDate()} ${formatShortMonth(date)}`;
}

export function formatMonthYear(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export const DASHBOARD_REPORT_TIME_RANGE_OPTIONS = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "All Time",
  "Custom Date",
];
export const ALL_BUSINESS_UNITS_LABEL = "All Entities";
export const LOCKED_BUSINESS_UNIT_NAMES = ["Labamu Central Jakarta"];
