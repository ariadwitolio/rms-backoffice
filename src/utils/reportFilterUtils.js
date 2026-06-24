import { formatIdr } from "./dashboardDateUtils.js";
import { createInitialDataStore } from "./dataStoreUtils.js";

export function getDashboardReportSearchFields(reportId, detailView = "by-item") {
  if (reportId === "sales-orders") {
    if (detailView === "by-order") {
      return [
        "transactionId",
        "catalog",
        "category",
        "table",
        "dateTime",
        "date",
        "time",
        "shift",
        "staff",
        "orderType",
        "payment",
        "discountApplied",
        "taxCollected",
        "status",
      ];
    }

    return ["groupLabel"];
  }

  return [];
}

export function getDashboardReportMetricCards(reportId, rows) {
  if (reportId === "sales-orders") {
    const totalOrders = rows.reduce(
      (sum, row) => sum + row.totalOrdersValue,
      0
    );
    const grossSales = rows.reduce(
      (sum, row) => sum + row.totalGrossSalesValue,
      0
    );
    const netSales = rows.reduce((sum, row) => sum + row.totalNetSalesValue, 0);
    const taxCollected = rows.reduce(
      (sum, row) => sum + (row.taxCollectedValue ?? 0),
      0
    );
    const refundImpact = rows.reduce(
      (sum, row) =>
        sum + (row.status === "Refund" ? row.totalTransactionValue ?? 0 : 0),
      0
    );
    const voidImpact = rows.reduce(
      (sum, row) =>
        sum + (row.status === "VOID" ? row.totalTransactionValue ?? 0 : 0),
      0
    );
    const refundVoidImpact = refundImpact + voidImpact;
    const averageOrderValue =
      totalOrders > 0 ? Math.round(netSales / totalOrders) : 0;

    return [
      {
        label: "Total Orders",
        count: `${new Intl.NumberFormat("en-US").format(totalOrders)}`,
        tone: "brand",
        iconName: "metricOrders",
      },
      {
        label: "Tax Collected",
        count: formatIdr(taxCollected),
        tone: "neutral",
        iconName: "metricTax",
      },
      {
        label: "Average Order Value",
        count: formatIdr(averageOrderValue),
        tone: "warning",
        iconName: "metricAov",
      },
      {
        label: "Refund & VOID Impact",
        count: formatIdr(refundVoidImpact),
        tone: "danger",
        iconName: "metricRefund",
      },
      {
        label: "Total Gross Sales",
        count: formatIdr(grossSales),
        tone: "brand",
        iconName: "metricGross",
      },
      {
        label: "Total Net Sales",
        count: formatIdr(netSales),
        tone: "success",
        iconName: "metricNet",
      },
    ];
  }

  return [];
}

export function getDashboardReportFilterOptions(reportId, rows) {
  if (reportId === "sales-orders") {
    return {
      discount: createCountedFilterOptions(
        ["With Discount", "No Discount"],
        rows,
        (row) =>
          (row.discountAppliedValue ?? 0) > 0 ? "With Discount" : "No Discount"
      ),
      payment: createCountedFilterOptions(
        ["Cash", "Card", "QRIS", "E-Wallet"],
        rows,
        (row) => row.payment
      ),
      shift: createCountedFilterOptions(
        ["Breakfast", "Lunch", "Tea", "Dinner"],
        rows,
        (row) => row.shift
      ),
      orderType: createCountedFilterOptions(
        ["Dine In", "Take Away", "Delivery", "Pickup"],
        rows,
        (row) => row.orderType
      ),
      staff: createUniqueCountedFilterOptions(rows, (row) => row.staff),
      status: createCountedFilterOptions(
        ["Success", "VOID", "Refund", "Cancelled"],
        rows,
        (row) => row.status
      ),
    };
  }

  return {};
}

export function normalizeFilterOption(option) {
  if (typeof option === "string") {
    return { value: option, label: option };
  }

  return {
    value: option?.value ?? option?.label ?? "",
    label: option?.label ?? String(option?.value ?? ""),
  };
}

export function createCountedFilterOptions(allOptions, rows, getRowValue) {
  return allOptions.map((option) => {
    const normalizedOption = normalizeFilterOption(option);
    const count =
      normalizedOption.value === "All"
        ? rows.length
        : rows.filter((row) => {
          const rowValue = getRowValue(row);
          if (Array.isArray(rowValue)) {
            return rowValue.includes(normalizedOption.value);
          }
          return rowValue === normalizedOption.value;
        }).length;

    return {
      value: normalizedOption.value,
      label: normalizedOption.label,
      count,
    };
  });
}

export function createUniqueCountedFilterOptions(rows, getRowValue) {
  const safeRows = rows || [];
  const values = Array.from(
    new Set(
      safeRows.flatMap((row) => {
        const rowValue = getRowValue(row);
        return Array.isArray(rowValue) ? rowValue : [rowValue];
      })
    )
  )
    .filter(Boolean)
    .sort((left, right) => String(left).localeCompare(String(right)));

  return createCountedFilterOptions(values, safeRows, getRowValue);
}

export function getMetricDataForRows(rows, labelKey = "status") {
  return {
    total: rows.length,
    active: rows.filter(
      (row) => row[labelKey] === "Active" || row.availability === true
    ).length,
    inactive: rows.filter(
      (row) => row[labelKey] === "Inactive" || row.availability === false
    ).length,
  };
}

export function cloneDataStore() {
  return JSON.parse(JSON.stringify(createInitialDataStore()));
}

