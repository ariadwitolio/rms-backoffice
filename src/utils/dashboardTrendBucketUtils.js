import { DASHBOARD_REPORT_TIME_RANGE_OPTIONS, formatDayMonth, formatMonthYear, formatShortMonth, shiftDateByDays, shiftDateByMonths, getDaysInMonth } from "../constants/dashboard.js";
import { formatDashboardReportDate, formatDashboardReportDateValue, parseDashboardReportDateValue, createDashboardReportAnchorDate, formatIdr } from "./dashboardDateUtils.js";
import { getDashboardReportTrendWindow, getDashboardReportTrendAnchorDateForOffset, createDashboardCatalogPerformanceRows } from "./dashboardTrendUtils.js";
import { getDashboardReportTrendAnchorDate, getDashboardReportTrendMeta } from "./dashboardPerformanceUtils.js";

export function createDashboardReportTrendBuckets(
  rangeId,
  rows,
  anchorDate = new Date(),
  window = null
) {
  const normalizedAnchorDate = createDashboardReportAnchorDate(
    window?.anchorDate ?? getDashboardReportTrendAnchorDate(rows, anchorDate)
  );
  const rangeStart = createDashboardReportAnchorDate(
    window?.rangeStart ?? normalizedAnchorDate
  );
  const rangeEnd = createDashboardReportAnchorDate(
    window?.rangeEnd ?? normalizedAnchorDate
  );
  const anchorValue = formatDashboardReportDateValue(normalizedAnchorDate);
  const uniqueDateValues = Array.from(
    new Set(rows.map((row) => row.dateValue).filter(Boolean))
  ).sort();
  const dateMap = new Map(
    uniqueDateValues.map((value) => [value, parseDashboardReportDateValue(value)])
  );

  switch (rangeId) {
    case "hourly":
      return {
        labels: Array.from(
          { length: 24 },
          (_, index) => `${String(index).padStart(2, "0")}:00`
        ),
        getBucketId: (row) => {
          if (row.dateValue !== anchorValue) return null;
          const hourValue = Number(String(row.time ?? "").slice(0, 2));
          return Number.isFinite(hourValue) ? hourValue : null;
        },
      };
    case "shift": {
      const shiftLabels = ["Breakfast", "Lunch", "Tea", "Dinner"];
      return {
        labels: shiftLabels,
        getBucketId: (row) => {
          if (row.dateValue !== anchorValue) return null;
          return shiftLabels.includes(row.shift) ? row.shift : null;
        },
      };
    }
    case "weekly": {
      const firstDate = dateMap.get(uniqueDateValues[0]) ?? normalizedAnchorDate;
      const weekStarts = [];
      let currentStart = new Date(
        rangeStart.getFullYear(),
        rangeStart.getMonth(),
        rangeStart.getDate()
      );

      if (!uniqueDateValues.length) {
        currentStart = firstDate;
      }

      while (currentStart.getTime() <= rangeEnd.getTime()) {
        weekStarts.push(currentStart);
        currentStart = shiftDateByDays(currentStart, 7);
      }

      return {
        labels: weekStarts.map((startDate) => {
          const endDate =
            shiftDateByDays(startDate, 6).getTime() > rangeEnd.getTime()
              ? rangeEnd
              : shiftDateByDays(startDate, 6);
          return `${startDate.getDate()}-${endDate.getDate()}`;
        }),
        getBucketId: (row) => {
          const rowDate = parseDashboardReportDateValue(row.dateValue);
          if (!rowDate) return null;

          for (let index = 0; index < weekStarts.length; index += 1) {
            const startDate = weekStarts[index];
            const endDate = shiftDateByDays(startDate, 6);
            if (rowDate >= startDate && rowDate <= endDate) {
              return index;
            }
          }

          return null;
        },
      };
    }
    case "monthly": {
      const monthDates = [];
      let currentMonth = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);

      while (currentMonth.getTime() <= rangeEnd.getTime()) {
        monthDates.push(currentMonth);
        currentMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          1
        );
      }

      return {
        labels: monthDates.map((monthDate) =>
          monthDate.toLocaleDateString("en-US", { month: "short" })
        ),
        getBucketId: (row) => {
          const rowDate = parseDashboardReportDateValue(row.dateValue);
          if (!rowDate) return null;
          return monthDates.findIndex(
            (monthDate) =>
              rowDate.getFullYear() === monthDate.getFullYear() &&
              rowDate.getMonth() === monthDate.getMonth()
          );
        },
      };
    }
    case "daily":
    default: {
      const dayDates = [];
      let currentDate = new Date(
        rangeStart.getFullYear(),
        rangeStart.getMonth(),
        rangeStart.getDate()
      );

      while (currentDate.getTime() <= rangeEnd.getTime()) {
        dayDates.push(currentDate);
        currentDate = shiftDateByDays(currentDate, 1);
      }

      return {
        labels: dayDates.map((date) => String(date.getDate())),
        getBucketId: (row) =>
          dayDates.findIndex(
            (date) => row.dateValue === formatDashboardReportDateValue(date)
          ),
      };
    }
  }
}

export function createDashboardReportTrendPanel(
  rows,
  detailView,
  rangeId = "hourly",
  anchorDate = new Date(),
  window = null
) {
  const meta = getDashboardReportTrendMeta(detailView);
  const trendBuckets = createDashboardReportTrendBuckets(
    rangeId,
    rows,
    anchorDate,
    window
  );
  const labels = trendBuckets.labels;
  const fallbackColors = [
    "var(--feature-brand-primary)",
    "var(--feature-customer-primary)",
    "var(--status-orange-primary)",
  ];
  const byOrderColors = {
    Success: "var(--status-green-primary)",
    VOID: "var(--status-red-primary)",
    Refund: "var(--status-orange-primary)",
    Cancelled: "var(--neutral-on-surface-tertiary)",
  };
  const totals = new Map();

  rows.forEach((row) => {
    const groupKey = row[meta.key] ?? "-";
    const value =
      detailView === "by-order"
        ? row.totalTransactionValue ?? 0
        : row.totalNetSalesValue ?? 0;
    totals.set(groupKey, (totals.get(groupKey) ?? 0) + value);
  });

  const topGroups = Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([groupKey]) => groupKey);

  const datasets = topGroups.map((groupKey, index) => ({
    id: `${detailView}-${groupKey}-${index}`,
    label: groupKey,
    color:
      detailView === "by-order"
        ? byOrderColors[groupKey] ??
        fallbackColors[index] ??
        fallbackColors[fallbackColors.length - 1]
        : fallbackColors[index] ?? fallbackColors[fallbackColors.length - 1],
    values: labels.map((_, bucketIndex) =>
      rows.reduce((sum, row) => {
        if ((row[meta.key] ?? "-") !== groupKey) return sum;
        if (trendBuckets.getBucketId(row) !== bucketIndex) return sum;
        return (
          sum +
          (detailView === "by-order"
            ? row.totalTransactionValue ?? 0
            : row.totalNetSalesValue ?? 0)
        );
      }, 0)
    ),
    rawValues: labels.map((_, bucketIndex) =>
      rows.reduce((sum, row) => {
        if ((row[meta.key] ?? "-") !== groupKey) return sum;
        if (trendBuckets.getBucketId(row) !== bucketIndex) return sum;
        return (
          sum +
          (detailView === "by-order"
            ? row.totalTransactionValue ?? 0
            : row.totalNetSalesValue ?? 0)
        );
      }, 0)
    ),
    formatValue: (value) => formatIdr(value),
  }));

  return {
    title: meta.title,
    copy: meta.copy,
    labels,
    datasets,
  };
}

export function createDashboardSalesReportRows(anchorDate = new Date()) {
  return createDashboardCatalogPerformanceRows(anchorDate);
}

export function createDashboardOrderReportRows(anchorDate = new Date()) {
  return createDashboardCatalogPerformanceRows(anchorDate);
}

export function createDashboardSalesOrderRows(
  anchorDate = new Date(),
  businessUnitNames = []
) {
  const today = createDashboardReportAnchorDate(anchorDate);
  const resolvedBusinessUnitNames = businessUnitNames.length
    ? businessUnitNames
    : [
      "Labamu Central Jakarta",
      "Labamu Bandung",
      "Labamu Surabaya",
      "Labamu Bali",
    ];
  const catalogs = [
    {
      id: "burger-supreme",
      label: "Burger Supreme",
      category: "Main Course",
      baseTotal: 92000,
    },
    {
      id: "iced-coffee",
      label: "Iced Coffee",
      category: "Beverages",
      baseTotal: 38000,
    },
    {
      id: "special-package",
      label: "Special Package",
      category: "Package",
      baseTotal: 155000,
    },
    {
      id: "linguine-pesto",
      label: "Linguine Pesto",
      category: "Main Course",
      baseTotal: 86000,
    },
    {
      id: "caesar-salad",
      label: "Caesar Salad",
      category: "Appetizers",
      baseTotal: 64000,
    },
    {
      id: "chicken-wrap",
      label: "Chicken Wrap",
      category: "Main Course",
      baseTotal: 52000,
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
  const payments = ["Cash", "Card", "QRIS", "E-Wallet"];
  const modifiers = [
    "Extra Cheese",
    "No Onion",
    "Spicy Mayo",
    "Extra Shot",
    "Large Size",
    "Oat Milk",
    "Extra Sambal",
  ];
  const dineInTables = [
    "Table 01",
    "Table 03",
    "Table 05",
    "Table 08",
    "Table 11",
    "Table 14",
  ];

  return Array.from({ length: 45 }, (_, dayOffset) => {
    const date = shiftDateByDays(today, -dayOffset);
    const dateValue = formatDashboardReportDateValue(date);

    return Array.from({ length: 7 }, (_, orderIndex) => {
      const catalog = catalogs[(dayOffset + orderIndex) % catalogs.length];
      const grossSales =
        catalog.baseTotal +
        dayOffset * 3400 +
        orderIndex * 6200 +
        ((dayOffset + orderIndex) % 3) * 4800;
      const orderType = orderTypes[(dayOffset + orderIndex) % orderTypes.length];
      const statusSeed = (dayOffset * 2 + orderIndex) % 7;
      const status =
        statusSeed === 0
          ? "VOID"
          : statusSeed === 2
            ? "Refund"
            : statusSeed === 4
              ? "Cancelled"
              : "Success";
      const discountValue =
        status === "Cancelled"
          ? 0
          : Math.round(
            grossSales * (0.07 + ((dayOffset + orderIndex) % 3) * 0.01)
          );
      const taxCollectedValue =
        status === "Cancelled"
          ? 0
          : Math.round((grossSales - discountValue) * 0.11);
      const netSalesValue =
        status === "Success"
          ? Math.max(0, grossSales - discountValue)
          : status === "Refund"
            ? 0
            : 0;
      const totalTransactionValue = status === "Cancelled" ? 0 : grossSales;
      const hourValue = 9 + ((dayOffset * 3 + orderIndex * 2) % 12);
      const minuteValue = ((dayOffset + orderIndex * 7) % 4) * 15;
      const time = `${String(hourValue).padStart(2, "0")}:${String(
        minuteValue
      ).padStart(2, "0")}`;
      const dateLabel = formatDashboardReportDate(date);
      const table =
        orderType === "Dine In"
          ? dineInTables[(dayOffset + orderIndex) % dineInTables.length]
          : orderType === "Take Away"
            ? "Take Away Counter"
            : orderType === "Delivery"
              ? "Delivery Hub"
              : "Pickup Shelf";

      return {
        id: `sales-order-${dateValue}-${catalog.id}-${orderIndex + 1}`,
        businessUnit:
          resolvedBusinessUnitNames[
          (dayOffset + orderIndex) % resolvedBusinessUnitNames.length
          ],
        catalog: catalog.label,
        category: catalog.category,
        date: dateLabel,
        dateTime: `${dateLabel}, ${time}`,
        dateValue,
        modifier: modifiers[(dayOffset + orderIndex * 2) % modifiers.length],
        orderType,
        payment: payments[(dayOffset + orderIndex * 2) % payments.length],
        shift: shifts[(dayOffset + orderIndex) % shifts.length],
        staff: staffs[(dayOffset + orderIndex * 2) % staffs.length],
        table,
        status,
        time,
        totalGrossSales: formatIdr(grossSales),
        totalGrossSalesValue: grossSales,
        totalNetSales: formatIdr(netSalesValue),
        totalNetSalesValue: netSalesValue,
        taxCollected: formatIdr(taxCollectedValue),
        taxCollectedValue,
        discountApplied: formatIdr(discountValue),
        discountAppliedValue: discountValue,
        totalOrders: "1",
        totalOrdersValue: 1,
        totalTransaction: formatIdr(totalTransactionValue),
        totalTransactionValue,
        transactionId: `TRX-${dateValue.replace(/-/g, "").slice(2)}-${String(
          orderIndex + 1
        ).padStart(3, "0")}`,
      };
    });
  }).flat();
}

export function createLegacyDashboardOrderRows(anchorDate = new Date()) {
  const today = createDashboardReportAnchorDate(anchorDate);
  const templates = [
    {
      id: "001",
      time: "08:14",
      orderType: "Dine In",
      staff: "Natasha Smith",
      baseTotal: 128000,
    },
    {
      id: "018",
      time: "10:27",
      orderType: "Take Away",
      staff: "Rendy Saputra",
      baseTotal: 87000,
    },
    {
      id: "043",
      time: "12:05",
      orderType: "Dine In",
      staff: "Salsa Mahendra",
      baseTotal: 214000,
    },
    {
      id: "091",
      time: "14:42",
      orderType: "Delivery",
      staff: "Dio Ramadhan",
      baseTotal: 176000,
    },
    {
      id: "127",
      time: "18:19",
      orderType: "Pickup",
      staff: "Kevin Pratama",
      baseTotal: 154000,
    },
  ];

  return Array.from({ length: 45 }, (_, dayOffset) => {
    const date = shiftDateByDays(today, -dayOffset);
    const dateValue = formatDashboardReportDateValue(date);

    return templates.map((template, templateIndex) => {
      const total =
        template.baseTotal +
        dayOffset * 3200 +
        ((dayOffset + templateIndex) % 4) * 6800 +
        templateIndex * 2200;

      return {
        id: `order-${dateValue}-${template.id}`,
        orderId: `ORD-${dateValue.replace(/-/g, "").slice(2)}-${template.id}`,
        date: formatDashboardReportDate(date),
        dateValue,
        time: template.time,
        orderType: template.orderType,
        staff: template.staff,
        totalValue: total,
        total: formatIdr(total),
      };
    });
  }).flat();
}

