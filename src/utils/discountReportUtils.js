import { DASHBOARD_REPORT_TIME_RANGE_OPTIONS, shiftDateByDays, formatDayMonth } from "../constants/dashboard.js";
import { formatDashboardReportDate, formatDashboardReportDateValue, parseDashboardReportDateValue, formatIdr, normalizeDashboardReportDateRange, createDashboardReportAnchorDate } from "./dashboardDateUtils.js";
import { buildMetricSeries } from "./salesSummaryUtils.js";

export function createDashboardDiscountReport(unitName) {
  const rows = [
    {
      id: "discount-happy-hour",
      chartLabel: "Happy Hour",
      discountName: "Happy Hour Beverage",
      appliedQtyValue: 14,
      amountDiscountedValue: 420000,
    },
    {
      id: "discount-lunch-combo",
      chartLabel: "Lunch Combo",
      discountName: "Lunch Combo",
      appliedQtyValue: 11,
      amountDiscountedValue: 315000,
    },
    {
      id: "discount-member-refill",
      chartLabel: "Member Refill",
      discountName: "Member Refill",
      appliedQtyValue: 9,
      amountDiscountedValue: 210000,
    },
    {
      id: "discount-weekend-bundle",
      chartLabel: "Weekend Bundle",
      discountName: "Weekend Bundle",
      appliedQtyValue: 5,
      amountDiscountedValue: 190000,
    },
    {
      id: "discount-dessert-pairing",
      chartLabel: "Dessert Pairing",
      discountName: "Dessert Pairing",
      appliedQtyValue: 3,
      amountDiscountedValue: 150000,
    },
  ];
  const totalApplied = rows.reduce((sum, row) => sum + row.appliedQtyValue, 0);
  const totalAmountDiscounted = rows.reduce(
    (sum, row) => sum + row.amountDiscountedValue,
    0
  );
  const averageDiscountValue = totalApplied
    ? Math.round(totalAmountDiscounted / totalApplied)
    : 0;
  const topDiscountValue = rows[0]?.amountDiscountedValue ?? 0;

  return {
    title: "Discount Report",
    copy: `Track discount usage and nominal impact for ${unitName}.`,
    metrics: [
      {
        label: "Total Applied",
        count: new Intl.NumberFormat("en-US").format(totalApplied),
        tone: "brand",
      },
      {
        label: "Amount Discounted",
        count: formatIdr(totalAmountDiscounted),
        tone: "warning",
      },
      {
        label: "Avg. Discount / Apply",
        count: formatIdr(averageDiscountValue),
        tone: "neutral",
      },
      {
        label: "Top Discount",
        count: formatIdr(topDiscountValue),
        tone: "success",
      },
    ],
    chart: {
      title: "Discounts Usage",
      copy: `Review the five highest discount programs by amount discounted.`,
      stats: [
        [
          "Total Applied",
          `${new Intl.NumberFormat("en-US").format(totalApplied)} Applied`,
        ],
        ["Amount Discounted", formatIdr(totalAmountDiscounted)],
      ],
      labels: rows.map((row) => row.chartLabel),
      datasets: [
        {
          id: "discount-amount",
          label: "Amount Discounted",
          color: "var(--feature-brand-primary)",
          values: rows.map((row) => row.amountDiscountedValue),
          rawValues: rows.map((row) => row.amountDiscountedValue),
          formatValue: (value) => formatIdr(value),
        },
      ],
    },
    rows: rows.map((row) => ({
      ...row,
      appliedQty: new Intl.NumberFormat("en-US").format(row.appliedQtyValue),
      amountDiscounted: formatIdr(row.amountDiscountedValue),
    })),
  };
}

export function getDiscountReportTimeConfig(rangeId, anchorDate = new Date()) {
  const today = createDashboardReportAnchorDate(anchorDate);

  switch (rangeId) {
    case "hourly":
      return {
        labels: Array.from({ length: 24 }, (_, index) =>
          `${String(index).padStart(2, "0")}:00`
        ),
        multiplier: 1,
      };
    case "shift":
      return {
        labels: ["Breakfast", "Lunch", "Tea", "Dinner"],
        multiplier: 1,
      };
    case "daily":
      return {
        labels: Array.from({ length: 7 }, (_, index) =>
          String(shiftDateByDays(today, -6 + index).getDate())
        ),
        multiplier: 4,
        copy: "Review daily discount application for the latest seven days.",
      };
    case "weekly":
      return {
        labels: ["1-7", "8-14", "15-21", "22-28", "29-31"],
        multiplier: 11,
      };
    case "monthly":
    default:
      return {
        labels: Array.from({ length: today.getMonth() + 1 }, (_, index) =>
          new Date(today.getFullYear(), index, 1).toLocaleDateString("en-US", {
            month: "short",
          })
        ),
        multiplier: 18,
      };
  }
}

export function createDiscountReportDetail(unitName, rangeId, anchorDate = new Date()) {
  const { labels, multiplier, copy } = getDiscountReportTimeConfig(
    rangeId,
    anchorDate
  );
  const discountTemplates = [
    {
      id: "happy-hour",
      discountName: "Happy Hour Beverage",
      baseApplied: 14,
      baseAmount: 420000,
      color: "var(--feature-brand-primary)",
      orderType: "Dine In",
      payment: "Cash",
      shift: "Dinner",
      staff: "Natasha Smith",
    },
    {
      id: "lunch-combo",
      discountName: "Lunch Combo",
      baseApplied: 11,
      baseAmount: 315000,
      color: "var(--feature-customer-primary)",
      orderType: "Take Away",
      payment: "Debit Card",
      shift: "Lunch",
      staff: "Rendy Saputra",
    },
    {
      id: "member-refill",
      discountName: "Member Refill",
      baseApplied: 9,
      baseAmount: 210000,
      color: "var(--status-orange-primary)",
      orderType: "Delivery",
      payment: "QRIS",
      shift: "Tea",
      staff: "Salsa Mahendra",
    },
    {
      id: "weekend-bundle",
      discountName: "Weekend Bundle",
      baseApplied: 5,
      baseAmount: 190000,
      color: "var(--feature-cashier-primary)",
      orderType: "Online",
      payment: "Credit Card",
      shift: "Dinner",
      staff: "Kevin Pratama",
    },
    {
      id: "dessert-pairing",
      discountName: "Dessert Pairing",
      baseApplied: 3,
      baseAmount: 150000,
      color: "var(--feature-product-primary)",
      orderType: "Dine In",
      payment: "Cash",
      shift: "Breakfast",
      staff: "Dio Ramadhan",
    },
  ];

  const rows = discountTemplates
    .map((template, index) => {
      const bucketCount = Math.max(labels.length, 1);
      const qtyBase = Math.max(
        1,
        Math.round((template.baseApplied * multiplier) / bucketCount)
      );
      const qtyValues = buildMetricSeries(bucketCount, {
        base: qtyBase,
        variance: Math.max(1, Math.round(qtyBase * 0.35)),
        seed: index * 7 + bucketCount,
        min: Math.max(1, Math.round(qtyBase * 0.4)),
      }).map((value) => Math.max(1, Math.round(value)));
      const averageAmount = template.baseAmount / template.baseApplied;
      const amountValues = qtyValues.map((qty, seriesIndex) =>
        Math.round(
          qty * averageAmount * (1 + ((seriesIndex + index) % 3) * 0.04)
        )
      );
      const appliedQtyValue = qtyValues.reduce((sum, value) => sum + value, 0);
      const amountDiscountedValue = amountValues.reduce(
        (sum, value) => sum + value,
        0
      );

      return {
        id: `discount-${template.id}`,
        discountName: template.discountName,
        color: template.color,
        orderType: template.orderType,
        payment: template.payment,
        shift: template.shift,
        staff: template.staff,
        appliedQtyValue,
        amountDiscountedValue,
        appliedQty: new Intl.NumberFormat("en-US").format(appliedQtyValue),
        amountDiscounted: formatIdr(amountDiscountedValue),
        amountValues,
      };
    })
    .sort(
      (left, right) => right.amountDiscountedValue - left.amountDiscountedValue
    );

  const totalApplied = rows.reduce((sum, row) => sum + row.appliedQtyValue, 0);
  const totalAmountDiscounted = rows.reduce(
    (sum, row) => sum + row.amountDiscountedValue,
    0
  );
  const averageDiscount = totalApplied
    ? Math.round(totalAmountDiscounted / totalApplied)
    : 0;

  return {
    title: "Discount Report",
    copy: `Track discount usage and nominal discount impact for ${unitName}.`,
    metrics: [
      {
        label: "Total Applied",
        value: `${new Intl.NumberFormat("en-US").format(totalApplied)} Applied`,
        tone: "brand",
        iconName: "metricOrders",
      },
      {
        label: "Amount Discounted",
        value: formatIdr(totalAmountDiscounted),
        tone: "warning",
        iconName: "metricDiscount",
      },
      {
        label: "Average Discount",
        value: formatIdr(averageDiscount),
        tone: "neutral",
        iconName: "metricAov",
      },
    ],
    chart: {
      title: "Discounts Usage",
      copy,
      labels,
      datasets: rows.map((row) => ({
        id: `${row.id}-amount`,
        label: row.discountName,
        color: row.color,
        values: row.amountValues,
        rawValues: row.amountValues,
        formatValue: (value) => formatIdr(value),
      })),
    },
    columns: [
      { key: "discountName", label: "Discount Name" },
      { key: "appliedQty", label: "Discount Applied (qty)", align: "right", sortable: true, sortKey: "appliedQtyValue" },
      { key: "amountDiscounted", label: "Amount Discount", align: "right", sortable: true, sortKey: "amountDiscountedValue" },
    ],
    rows,
  };
}

