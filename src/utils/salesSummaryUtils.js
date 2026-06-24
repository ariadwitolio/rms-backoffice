import { SALES_SUMMARY_RANGE_TABS, createInitialSalesSummaryNavigationState, createInitialSalesSummaryComparisonSelectionState, formatDayMonth, formatMonthYear, formatShortMonth, getDaysInMonth, shiftDateByDays, shiftDateByMonths } from "../constants/dashboard.js";
import { formatDashboardReportDate, formatDashboardReportDateValue, parseDashboardReportDateValue, formatIdr } from "./dashboardDateUtils.js";

export function buildMetricSeries(length, { base, variance, seed, min = 1 }) {
  return Array.from({ length }, (_, index) =>
    Math.max(
      min,
      Math.round(
        base +
        Math.sin((index + seed) * 0.85) * variance +
        Math.cos((index + seed) * 0.42) * variance * 0.52 +
        (((index + seed) % 4) - 1.5) * variance * 0.16
      )
    )
  );
}

export function normalizeChartSeries(values, minTarget = 72, maxTarget = 184) {
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue || 1;

  return values.map(
    (value) =>
      minTarget + ((value - minValue) / valueRange) * (maxTarget - minTarget)
  );
}

export function formatSalesSummaryMetricValue(metricId, value) {
  return metricId === "orders"
    ? `${new Intl.NumberFormat("en-US").format(value)} Orders`
    : formatIdr(value);
}

export function formatSalesSummaryAxisValue(metricId, value) {
  if (metricId === "orders") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: value >= 100 ? 0 : 1,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
  }).format(value);
}

export function getSalesSummaryMetricMeta(metricId) {
  return metricId === "orders"
    ? {
      id: "orders",
      label: "Total Orders",
      color: "var(--feature-customer-primary)",
    }
    : {
      id: "sales",
      label: "Total Sales",
      color: "var(--feature-brand-primary)",
    };
}

export function getSalesSummaryMetricLegendItems() {
  return [
    getSalesSummaryMetricMeta("sales"),
    getSalesSummaryMetricMeta("orders"),
  ];
}

export function getSalesSummaryStats(salesValues, orderValues) {
  const totalSales = salesValues.reduce((sum, value) => sum + value, 0);
  const totalOrders = orderValues.reduce((sum, value) => sum + value, 0);

  return [
    ["Total Sales", formatIdr(totalSales)],
    [
      "Total Orders",
      `${new Intl.NumberFormat("en-US").format(totalOrders)} Orders`,
    ],
  ];
}

export function getSalesSummaryComparisonOptions(rangeId, anchorDate = new Date()) {
  const today = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate()
  );

  switch (rangeId) {
    case "hourly":
    case "shift":
      return Array.from({ length: 7 }, (_, index) => {
        const date = shiftDateByDays(today, -index);
        return {
          value: String(index),
          label: index === 0 ? "Today" : formatDayMonth(date),
        };
      });
    case "daily":
    case "weekly":
      return Array.from({ length: 6 }, (_, index) => {
        const date = shiftDateByMonths(today, -index);
        return {
          value: String(index),
          label: index === 0 ? "This Month" : formatMonthYear(date),
        };
      });
    case "monthly":
    default:
      return Array.from({ length: 5 }, (_, index) => ({
        value: String(index),
        label: index === 0 ? "This Year" : String(today.getFullYear() - index),
      }));
  }
}

export function getSalesSummaryVisibleDayCount(targetMonth, today, offset = 0) {
  return offset === 0
    ? Math.max(1, today.getDate() - 1)
    : getDaysInMonth(targetMonth);
}

export function createSalesSummaryTrendMonthSource(
  offset = 0,
  anchorDate = new Date()
) {
  const today = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate()
  );
  const targetMonth = shiftDateByMonths(today, -offset);
  const visibleDayCount = getSalesSummaryVisibleDayCount(
    targetMonth,
    today,
    offset
  );

  return {
    targetMonth,
    visibleDayCount,
    salesValues: buildMetricSeries(visibleDayCount, {
      base: 6150000,
      variance: 1280000,
      seed: offset * 4 + 3,
      min: 2200000,
    }),
    orderValues: buildMetricSeries(visibleDayCount, {
      base: 84,
      variance: 18,
      seed: offset * 3 + 4,
      min: 28,
    }),
  };
}

export function createSalesSummaryComparisonMonthSource(
  offset = 0,
  variant = "current",
  anchorDate = new Date(),
  visibleDayCountOverride
) {
  const today = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate()
  );
  const targetMonth = shiftDateByMonths(today, -offset);
  const visibleDayCount =
    visibleDayCountOverride ??
    getSalesSummaryVisibleDayCount(targetMonth, today, offset);
  const isCurrentVariant = variant === "current";

  return {
    targetMonth,
    visibleDayCount,
    salesValues: buildMetricSeries(visibleDayCount, {
      base: isCurrentVariant ? 6280000 : 5920000,
      variance: isCurrentVariant ? 1220000 : 1040000,
      seed: offset * 5 + (isCurrentVariant ? 12 : 5),
      min: isCurrentVariant ? 2400000 : 2200000,
    }),
    orderValues: buildMetricSeries(visibleDayCount, {
      base: isCurrentVariant ? 88 : 82,
      variance: isCurrentVariant ? 17 : 14,
      seed: offset * 5 + (isCurrentVariant ? 15 : 7),
      min: isCurrentVariant ? 24 : 20,
    }),
  };
}

export function createSalesSummaryShiftSource(
  offset = 0,
  variant = "trend",
  anchorDate = new Date()
) {
  const today = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate()
  );
  const targetDate = shiftDateByDays(today, -offset);
  const isCurrentVariant = variant !== "compare";

  return {
    targetDate,
    labels: ["Dinner", "Tea", "Lunch", "Breakfast"],
    salesValues: buildMetricSeries(4, {
      base: isCurrentVariant ? 4820000 : 4480000,
      variance: isCurrentVariant ? 920000 : 760000,
      seed: offset * 4 + (isCurrentVariant ? 17 : 9),
      min: isCurrentVariant ? 1850000 : 1600000,
    }),
    orderValues: buildMetricSeries(4, {
      base: isCurrentVariant ? 54 : 48,
      variance: isCurrentVariant ? 10 : 8,
      seed: offset * 4 + (isCurrentVariant ? 23 : 14),
      min: isCurrentVariant ? 18 : 14,
    }),
  };
}

export function createSalesSummaryWeeklyAggregation(
  source,
  includeMonthInLabel = true
) {
  const daysInMonth = getDaysInMonth(source.targetMonth);
  const weekBuckets = [];

  for (let startDay = 1; startDay <= source.visibleDayCount; startDay += 7) {
    const displayEndDay = Math.min(startDay + 6, daysInMonth);
    const sliceEndDay = Math.min(startDay + 6, source.visibleDayCount);
    const salesTotal = source.salesValues
      .slice(startDay - 1, sliceEndDay)
      .reduce((sum, value) => sum + value, 0);
    const orderTotal = source.orderValues
      .slice(startDay - 1, sliceEndDay)
      .reduce((sum, value) => sum + value, 0);

    weekBuckets.push({
      startDay,
      displayEndDay,
      salesTotal,
      orderTotal,
    });
  }

  const orderedBuckets = weekBuckets.slice().reverse();

  return {
    labels: orderedBuckets.map(({ startDay, displayEndDay }) =>
      startDay === displayEndDay
        ? includeMonthInLabel
          ? `${startDay} ${formatShortMonth(source.targetMonth)}`
          : `${startDay}`
        : includeMonthInLabel
          ? `${startDay}\u2013${displayEndDay} ${formatShortMonth(
            source.targetMonth
          )}`
          : `${startDay}-${displayEndDay}`
    ),
    salesValues: orderedBuckets.map((bucket) => bucket.salesTotal),
    orderValues: orderedBuckets.map((bucket) => bucket.orderTotal),
  };
}

export function createSalesSummaryPanel(
  rangeId,
  offset = 0,
  metricId = "sales",
  anchorDate = new Date()
) {
  const today = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate()
  );
  let labels = [];
  let salesValues = [];
  let orderValues = [];
  let navigationLabel = "";

  switch (rangeId) {
    case "hourly": {
      const targetDate = shiftDateByDays(today, -offset);
      labels = Array.from(
        { length: 24 },
        (_, index) => `${String(23 - index).padStart(2, "0")}:00`
      );
      salesValues = buildMetricSeries(24, {
        base: 840000,
        variance: 235000,
        seed: offset * 3 + 1,
        min: 180000,
      });
      orderValues = buildMetricSeries(24, {
        base: 12,
        variance: 5,
        seed: offset * 5 + 2,
        min: 3,
      });
      navigationLabel = offset === 0 ? "Today" : formatDayMonth(targetDate);
      break;
    }
    case "shift": {
      const shiftSource = createSalesSummaryShiftSource(
        offset,
        "trend",
        anchorDate
      );
      labels = shiftSource.labels;
      salesValues = shiftSource.salesValues;
      orderValues = shiftSource.orderValues;
      navigationLabel =
        offset === 0 ? "Today" : formatDayMonth(shiftSource.targetDate);
      break;
    }
    case "daily": {
      const monthSource = createSalesSummaryTrendMonthSource(
        offset,
        anchorDate
      );
      const { targetMonth, visibleDayCount } = monthSource;
      labels = Array.from(
        { length: visibleDayCount },
        (_, index) =>
          `${visibleDayCount - index} ${formatShortMonth(targetMonth)}`
      );
      salesValues = monthSource.salesValues;
      orderValues = monthSource.orderValues;
      navigationLabel =
        offset === 0 ? "This Month" : formatMonthYear(targetMonth);
      break;
    }
    case "weekly": {
      const monthSource = createSalesSummaryTrendMonthSource(
        offset,
        anchorDate
      );
      const weeklySource = createSalesSummaryWeeklyAggregation(monthSource);
      const targetMonth = monthSource.targetMonth;
      labels = weeklySource.labels;
      salesValues = weeklySource.salesValues;
      orderValues = weeklySource.orderValues;
      navigationLabel =
        offset === 0 ? "This Month" : formatMonthYear(targetMonth);
      break;
    }
    case "monthly":
    default: {
      const targetYear = today.getFullYear() - offset;
      const endMonthIndex = offset === 0 ? today.getMonth() : 11;
      labels = Array.from({ length: endMonthIndex + 1 }, (_, index) =>
        new Date(targetYear, endMonthIndex - index, 1).toLocaleDateString(
          "en-US",
          { month: "short" }
        )
      );
      salesValues = buildMetricSeries(labels.length, {
        base: 512800000,
        variance: 78000000,
        seed: offset * 5 + 8,
        min: 244000000,
      });
      orderValues = buildMetricSeries(labels.length, {
        base: 8642,
        variance: 1240,
        seed: offset * 4 + 9,
        min: 4280,
      });
      navigationLabel = offset === 0 ? "This Year" : String(targetYear);
      break;
    }
  }

  const metricMeta = getSalesSummaryMetricMeta(metricId);
  const metricValues = metricId === "orders" ? orderValues : salesValues;

  return {
    title: "Sales Trend",
    copy: `Track ${metricMeta.label.toLowerCase()}`,
    stats: getSalesSummaryStats(salesValues, orderValues),
    labels,
    datasets: [
      {
        id: metricMeta.id,
        label: metricMeta.label,
        color: metricMeta.color,
        values: metricValues,
        rawValues: metricValues,
        formatValue: (value) => formatSalesSummaryMetricValue(metricId, value),
      },
    ],
    navigationLabel,
  };
}

