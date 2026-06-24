import { SALES_SUMMARY_RANGE_TABS, createInitialSalesSummaryNavigationState, createInitialSalesSummaryComparisonSelectionState, formatDayMonth, formatMonthYear, shiftDateByDays, shiftDateByMonths, getDaysInMonth } from "../constants/dashboard.js";
import { formatDashboardReportDate, formatDashboardReportDateValue, parseDashboardReportDateValue, normalizeDashboardReportDateRange } from "./dashboardDateUtils.js";
import { buildMetricSeries, normalizeChartSeries, getSalesSummaryStats, getSalesSummaryMetricMeta, getSalesSummaryVisibleDayCount, formatSalesSummaryMetricValue, getSalesSummaryComparisonOptions , createSalesSummaryShiftSource, createSalesSummaryComparisonMonthSource, createSalesSummaryWeeklyAggregation} from "./salesSummaryUtils.js";

export function createSalesSummaryComparisonPanel(
  rangeId,
  currentOffset = 0,
  compareOffset = 1,
  metricId = "sales",
  anchorDate = new Date()
) {
  const today = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate()
  );
  const metricMeta = getSalesSummaryMetricMeta(metricId);
  let labels = [];
  let currentValues = [];
  let comparisonValues = [];
  let currentLabel = "";
  let comparisonLabel = "";
  let navigationLabel = "";

  switch (rangeId) {
    case "hourly": {
      const targetDate = shiftDateByDays(today, -currentOffset);
      const comparisonDate = shiftDateByDays(today, -compareOffset);
      labels = Array.from(
        { length: 24 },
        (_, index) => `${String(23 - index).padStart(2, "0")}:00`
      );
      currentValues = buildMetricSeries(24, {
        base: metricId === "orders" ? 12 : 840000,
        variance: metricId === "orders" ? 5 : 235000,
        seed: currentOffset * 3 + (metricId === "orders" ? 22 : 19),
        min: metricId === "orders" ? 3 : 180000,
      });
      comparisonValues = buildMetricSeries(24, {
        base: metricId === "orders" ? 10 : 775000,
        variance: metricId === "orders" ? 4 : 208000,
        seed: compareOffset * 3 + (metricId === "orders" ? 14 : 11),
        min: metricId === "orders" ? 2 : 150000,
      });
      currentLabel = currentOffset === 0 ? "Today" : formatDayMonth(targetDate);
      comparisonLabel =
        compareOffset === 0 ? "Today" : formatDayMonth(comparisonDate);
      navigationLabel = currentLabel;
      break;
    }
    case "shift": {
      const currentShiftSource = createSalesSummaryShiftSource(
        currentOffset,
        "current",
        anchorDate
      );
      const compareShiftSource = createSalesSummaryShiftSource(
        compareOffset,
        "compare",
        anchorDate
      );
      labels = currentShiftSource.labels;
      currentValues =
        metricId === "orders"
          ? currentShiftSource.orderValues
          : currentShiftSource.salesValues;
      comparisonValues =
        metricId === "orders"
          ? compareShiftSource.orderValues
          : compareShiftSource.salesValues;
      currentLabel =
        currentOffset === 0
          ? "Today"
          : formatDayMonth(currentShiftSource.targetDate);
      comparisonLabel =
        compareOffset === 0
          ? "Today"
          : formatDayMonth(compareShiftSource.targetDate);
      navigationLabel = currentLabel;
      break;
    }
    case "daily": {
      const currentMonthSource = createSalesSummaryComparisonMonthSource(
        currentOffset,
        "current",
        anchorDate
      );
      const compareMonthSource = createSalesSummaryComparisonMonthSource(
        compareOffset,
        "compare",
        anchorDate,
        currentMonthSource.visibleDayCount
      );
      const targetMonth = currentMonthSource.targetMonth;
      const comparisonMonth = compareMonthSource.targetMonth;
      const { visibleDayCount } = currentMonthSource;
      labels = Array.from({ length: visibleDayCount }, (_, index) =>
        String(visibleDayCount - index)
      );
      currentValues =
        metricId === "orders"
          ? currentMonthSource.orderValues
          : currentMonthSource.salesValues;
      comparisonValues =
        metricId === "orders"
          ? compareMonthSource.orderValues
          : compareMonthSource.salesValues;
      currentLabel =
        currentOffset === 0 ? "This Month" : formatMonthYear(targetMonth);
      comparisonLabel =
        compareOffset === 0 ? "This Month" : formatMonthYear(comparisonMonth);
      navigationLabel = currentLabel;
      break;
    }
    case "weekly": {
      const currentMonthSource = createSalesSummaryComparisonMonthSource(
        currentOffset,
        "current",
        anchorDate
      );
      const compareMonthSource = createSalesSummaryComparisonMonthSource(
        compareOffset,
        "compare",
        anchorDate,
        currentMonthSource.visibleDayCount
      );
      const currentWeeklySource = createSalesSummaryWeeklyAggregation(
        currentMonthSource,
        false
      );
      const compareWeeklySource = createSalesSummaryWeeklyAggregation(
        compareMonthSource,
        false
      );
      const targetMonth = currentMonthSource.targetMonth;
      const comparisonMonth = compareMonthSource.targetMonth;
      labels = currentWeeklySource.labels;
      currentValues =
        metricId === "orders"
          ? currentWeeklySource.orderValues
          : currentWeeklySource.salesValues;
      comparisonValues =
        metricId === "orders"
          ? compareWeeklySource.orderValues
          : compareWeeklySource.salesValues;
      currentLabel =
        currentOffset === 0 ? "This Month" : formatMonthYear(targetMonth);
      comparisonLabel =
        compareOffset === 0 ? "This Month" : formatMonthYear(comparisonMonth);
      navigationLabel = currentLabel;
      break;
    }
    case "monthly":
    default: {
      const targetYear = today.getFullYear() - currentOffset;
      const comparisonYear = today.getFullYear() - compareOffset;
      const endMonthIndex = currentOffset === 0 ? today.getMonth() : 11;
      labels = Array.from({ length: endMonthIndex + 1 }, (_, index) =>
        new Date(targetYear, endMonthIndex - index, 1).toLocaleDateString(
          "en-US",
          { month: "short" }
        )
      );
      currentValues = buildMetricSeries(labels.length, {
        base: metricId === "orders" ? 782 : 438000000,
        variance: metricId === "orders" ? 128 : 76000000,
        seed: currentOffset * 4 + (metricId === "orders" ? 11 : 8),
        min: metricId === "orders" ? 318 : 188000000,
      });
      comparisonValues = buildMetricSeries(labels.length, {
        base: metricId === "orders" ? 714 : 392000000,
        variance: metricId === "orders" ? 116 : 64800000,
        seed: compareOffset * 4 + (metricId === "orders" ? 4 : 2),
        min: metricId === "orders" ? 274 : 171000000,
      });
      currentLabel = currentOffset === 0 ? "This Year" : String(targetYear);
      comparisonLabel =
        compareOffset === 0 ? "This Year" : String(comparisonYear);
      navigationLabel = currentLabel;
      break;
    }
  }

  const allSalesValues =
    rangeId === "hourly"
      ? {
        current: buildMetricSeries(24, {
          base: 840000,
          variance: 235000,
          seed: currentOffset * 3 + 19,
          min: 180000,
        }),
        compare: buildMetricSeries(24, {
          base: 775000,
          variance: 208000,
          seed: compareOffset * 3 + 11,
          min: 150000,
        }),
      }
      : rangeId === "shift"
        ? {
          current: createSalesSummaryShiftSource(
            currentOffset,
            "current",
            anchorDate
          ).salesValues,
          compare: createSalesSummaryShiftSource(
            compareOffset,
            "compare",
            anchorDate
          ).salesValues,
        }
        : rangeId === "daily"
          ? {
            current: createSalesSummaryComparisonMonthSource(
              currentOffset,
              "current",
              anchorDate
            ).salesValues,
            compare: createSalesSummaryComparisonMonthSource(
              compareOffset,
              "compare",
              anchorDate,
              createSalesSummaryComparisonMonthSource(
                currentOffset,
                "current",
                anchorDate
              ).visibleDayCount
            ).salesValues,
          }
          : rangeId === "weekly"
            ? {
              current: createSalesSummaryComparisonMonthSource(
                currentOffset,
                "current",
                anchorDate
              ).salesValues,
              compare: createSalesSummaryComparisonMonthSource(
                compareOffset,
                "compare",
                anchorDate,
                createSalesSummaryComparisonMonthSource(
                  currentOffset,
                  "current",
                  anchorDate
                ).visibleDayCount
              ).salesValues,
            }
            : {
              current: buildMetricSeries(12, {
                base: 438000000,
                variance: 76000000,
                seed: currentOffset * 4 + 8,
                min: 188000000,
              }),
              compare: buildMetricSeries(12, {
                base: 392000000,
                variance: 64800000,
                seed: compareOffset * 4 + 2,
                min: 171000000,
              }),
            };
  const allOrderValues =
    rangeId === "hourly"
      ? {
        current: buildMetricSeries(24, {
          base: 12,
          variance: 5,
          seed: currentOffset * 3 + 22,
          min: 3,
        }),
        compare: buildMetricSeries(24, {
          base: 10,
          variance: 4,
          seed: compareOffset * 3 + 14,
          min: 2,
        }),
      }
      : rangeId === "shift"
        ? {
          current: createSalesSummaryShiftSource(
            currentOffset,
            "current",
            anchorDate
          ).orderValues,
          compare: createSalesSummaryShiftSource(
            compareOffset,
            "compare",
            anchorDate
          ).orderValues,
        }
        : rangeId === "daily"
          ? {
            current: createSalesSummaryComparisonMonthSource(
              currentOffset,
              "current",
              anchorDate
            ).orderValues,
            compare: createSalesSummaryComparisonMonthSource(
              compareOffset,
              "compare",
              anchorDate,
              createSalesSummaryComparisonMonthSource(
                currentOffset,
                "current",
                anchorDate
              ).visibleDayCount
            ).orderValues,
          }
          : rangeId === "weekly"
            ? {
              current: createSalesSummaryComparisonMonthSource(
                currentOffset,
                "current",
                anchorDate
              ).orderValues,
              compare: createSalesSummaryComparisonMonthSource(
                compareOffset,
                "compare",
                anchorDate,
                createSalesSummaryComparisonMonthSource(
                  currentOffset,
                  "current",
                  anchorDate
                ).visibleDayCount
              ).orderValues,
            }
            : {
              current: buildMetricSeries(12, {
                base: 782,
                variance: 128,
                seed: currentOffset * 4 + 11,
                min: 318,
              }),
              compare: buildMetricSeries(12, {
                base: 714,
                variance: 116,
                seed: compareOffset * 4 + 4,
                min: 274,
              }),
            };
  const currentTotalSales = allSalesValues.current.reduce(
    (sum, value) => sum + value,
    0
  );
  const comparisonTotalSales = allSalesValues.compare.reduce(
    (sum, value) => sum + value,
    0
  );
  const currentTotalOrders = allOrderValues.current.reduce(
    (sum, value) => sum + value,
    0
  );
  const comparisonTotalOrders = allOrderValues.compare.reduce(
    (sum, value) => sum + value,
    0
  );

  return {
    title: "Sales Trend",
    copy: `Compare ${metricMeta.label.toLowerCase()}`,
    stats: [
      [
        "Total Sales",
        [`${formatIdr(currentTotalSales)} vs`, formatIdr(comparisonTotalSales)],
      ],
      [
        "Total Orders",
        [
          `${new Intl.NumberFormat("en-US").format(
            currentTotalOrders
          )} Orders vs`,
          `${new Intl.NumberFormat("en-US").format(
            comparisonTotalOrders
          )} Orders`,
        ],
      ],
    ],
    labels,
    datasets: [
      {
        id: `${metricMeta.id}-current`,
        label: currentLabel,
        color: metricMeta.color,
        values: currentValues,
        rawValues: currentValues,
        formatValue: (value) => formatSalesSummaryMetricValue(metricId, value),
      },
      {
        id: `${metricMeta.id}-compare`,
        label: comparisonLabel,
        color: "var(--neutral-on-surface-tertiary)",
        values: comparisonValues,
        rawValues: comparisonValues,
        formatValue: (value) => formatSalesSummaryMetricValue(metricId, value),
        dashArray: "7 7",
        strokeWidth: 2.5,
        dotRadius: 3.5,
      },
    ],
    navigationLabel,
    currentPeriodLabel: currentLabel,
    comparisonPeriodLabel: comparisonLabel,
  };
}

