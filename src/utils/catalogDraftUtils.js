import { ALL_SELLING_TIME_DAY_LABELS, SELLING_TIME_DAY_OPTIONS, UNIT_PRECISION_OPTIONS, BUSINESS_UNIT_ASSIGNMENT_GROUPS } from "../constants/catalog.js";
import { syncAssignedUnitsWithPricingSections } from "./pricingUtils.js";
import { formatModifierIngredientUnitLabel } from "./modifierUtils.js";

export function normalizeUnitPrecisionOption(value) {
  if (UNIT_PRECISION_OPTIONS.includes(value)) return value;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "1";
  }

  return `.${"0".repeat(Math.min(5, numericValue))}`;
}

let catalogBuilderSequence = 0;

export function nextCatalogBuilderId(prefix) {
  catalogBuilderSequence += 1;
  return `${prefix}-${catalogBuilderSequence}`;
}

export function createEmptyPackageItem() {
  return { id: nextCatalogBuilderId("package-item"), catalogId: "", qty: "" };
}

export function createEmptyIngredientItem() {
  return {
    id: nextCatalogBuilderId("ingredient-item"),
    name: "",
    qty: "",
    unit: "gr",
  };
}

export function createEmptyAdditionalName() {
  return { id: nextCatalogBuilderId("additional-name"), value: "" };
}


export function normalizePackageItems(items) {
  const filledItems = [];
  let emptyRow = null;

  items.forEach((item) => {
    if (item.catalogId) {
      filledItems.push({ ...item, qty: item.qty || "1" });
      return;
    }

    if (!emptyRow) {
      emptyRow = { ...item, catalogId: "", qty: "" };
    }
  });

  return [...filledItems, emptyRow ?? createEmptyPackageItem()];
}

export function normalizeCatalogIngredients(items) {
  const filledItems = [];
  let emptyRow = null;

  items.forEach((item) => {
    if (item.name) {
      filledItems.push({ ...item, qty: item.qty || "1" });
      return;
    }

    if (!emptyRow) {
      emptyRow = { ...item, name: "", qty: "", unit: "gr" };
    }
  });

  return [...filledItems, emptyRow ?? createEmptyIngredientItem()];
}

export function updatePackageItems(items, itemId, key, value) {
  const nextItems = items.map((item) =>
    item.id === itemId
      ? {
        ...item,
        qty: key === "catalogId" && !item.qty && value ? "1" : item.qty,
        [key]:
          key === "qty"
            ? (() => {
              const normalized = String(value ?? "").replace(/[^\d]/g, "");
              return normalized === ""
                ? ""
                : String(Math.max(1, Number(normalized)));
            })()
            : value,
      }
      : item
  );

  return normalizePackageItems(nextItems);
}

export function buildAssignedUnitRecord(groupLabel, unit) {
  return {
    id: unit.id,
    group: groupLabel,
    name: unit.name,
    subtitle: groupLabel && groupLabel !== unit.name ? groupLabel : "",
    maxOverridePrice: "Not Allowed",
    overridePrice: "-",
  };
}

export function normalizeCatalogAssignedUnits(units = []) {
  const inputUnits = Array.isArray(units) ? units : [];
  const byId = new Map(inputUnits.map((unit) => [unit.id, unit]));
  const knownIds = new Set();

  const normalizedUnits = BUSINESS_UNIT_ASSIGNMENT_GROUPS.flatMap((group) =>
    group.units.flatMap((unit) => {
      const existingUnit = byId.get(unit.id);
      if (!existingUnit) return [];

      knownIds.add(unit.id);

      const {
        id: _id,
        group: _group,
        name: _name,
        subtitle,
        maxOverridePrice,
        overridePrice,
        ...rest
      } = existingUnit;

      return [
        {
          ...rest,
          id: unit.id,
          group: group.label,
          name: unit.name,
          subtitle:
            subtitle ??
            (group.label && group.label !== unit.name ? group.label : ""),
          maxOverridePrice: maxOverridePrice ?? "Not Allowed",
          overridePrice: overridePrice ?? "-",
        },
      ];
    })
  );

  const remainingUnits = inputUnits
    .filter((unit) => unit?.id && !knownIds.has(unit.id))
    .map((unit) => ({
      ...unit,
      subtitle:
        unit.subtitle ??
        (unit.group && unit.group !== unit.name ? unit.group : ""),
      maxOverridePrice: unit.maxOverridePrice ?? "Not Allowed",
      overridePrice: unit.overridePrice ?? "-",
    }));

  return [...normalizedUnits, ...remainingUnits];
}

export function createAssignedUnitsFromIds(selectedIds) {
  const selectedSet = new Set(selectedIds);

  return normalizeCatalogAssignedUnits(
    BUSINESS_UNIT_ASSIGNMENT_GROUPS.flatMap((group) =>
      group.units
        .filter((unit) => selectedSet.has(unit.id))
        .map((unit) => buildAssignedUnitRecord(group.label, unit))
    )
  );
}

export function createSellingTimeSlot(start = "", end = "") {
  return {
    id: nextCatalogBuilderId("selling-time-slot"),
    start,
    end,
  };
}

export function cloneSellingTimeSlots(slots = [], { fallbackEmpty = true } = {}) {
  const normalizedSlots = (slots ?? []).map((slot, index) => ({
    id: slot?.id ?? nextCatalogBuilderId("selling-time-slot"),
    start: slot?.start ?? "",
    end: slot?.end ?? "",
  }));

  if (normalizedSlots.length) {
    return normalizedSlots;
  }

  return fallbackEmpty ? [createSellingTimeSlot()] : [];
}

export function getSellingTimeSlotErrorKey(dayId, slotId, key) {
  return `selling-time-slot:${dayId}:${slotId}:${key}`;
}

export function getSellingTimeDayErrorPrefix(dayId) {
  return `selling-time-slot:${dayId}:`;
}

export function createSellingTimeDaySchedule({
  id,
  label,
  enabled = false,
  is24Hours = false,
  slots,
  manualSlots,
}) {
  const normalizedSlots = cloneSellingTimeSlots(slots);
  const normalizedManualSlots = manualSlots?.length
    ? cloneSellingTimeSlots(manualSlots)
    : is24Hours
      ? [createSellingTimeSlot("", "")]
      : cloneSellingTimeSlots(normalizedSlots);

  return {
    id,
    label,
    enabled,
    is24Hours,
    slots: normalizedSlots,
    manualSlots: normalizedManualSlots,
  };
}

export function createInitialSellingTimeDraft() {
  return {
    name: "",
    days: SELLING_TIME_DAY_OPTIONS.map((day) =>
      createSellingTimeDaySchedule({
        id: day.id,
        label: day.label,
        enabled: false,
        is24Hours: false,
        slots: [createSellingTimeSlot()],
      })
    ),
  };
}

export function createInitialCatalogDraft() {
  return {
    availability: true,
    photos: [],
    type: "single",
    name: "",
    additionalNames: [],
    description: "",
    unit: "Pcs",
    category: "Uncategorized",
    modifier: [],
    sellingTime: "All Day",
    price: "0",
    allowOverridePrice: false,
    packageItems: [createEmptyPackageItem()],
    assignedUnits: [],
    trackStock: false,
    ingredients: [createEmptyIngredientItem()],
    preparationTime: "",
    routing: "KDS Kitchen",
  };
}

export function getCatalogCategoryForType(type = "single", category = "") {
  if (type === "package") {
    return "Package";
  }

  return category || "Uncategorized";
}

export function getCatalogModifierSummaryValue({
  selectedLabels = [],
  placeholder = "Select Modifier",
} = {}) {
  if (selectedLabels.length === 0) {
    return placeholder;
  }

  if (selectedLabels.length === 1) {
    return selectedLabels[0];
  }

  return `${selectedLabels.length} Modifiers Selected`;
}

export function getCatalogModifierDetailValue(modifiers = []) {
  const selectedModifiers = Array.isArray(modifiers)
    ? modifiers.filter(Boolean)
    : [];

  return selectedModifiers.length ? selectedModifiers.join(", ") : "-";
}

const MODIFIER_INGREDIENT_OPTIONS = [
  {
    id: "stock-level-1",
    label: "Arabica Beans",
    unitLabel: formatModifierIngredientUnitLabel("Kg"),
  },
  {
    id: "stock-level-2",
    label: "Mozzarella Cheese",
    unitLabel: formatModifierIngredientUnitLabel("Packs"),
  },
  {
    id: "stock-level-3",
    label: "Romaine Lettuce",
    unitLabel: formatModifierIngredientUnitLabel("Kg"),
  },
  {
    id: "stock-level-4",
    label: "Chicken Breast",
    unitLabel: formatModifierIngredientUnitLabel("Kg"),
  },
  {
    id: "stock-level-5",
    label: "Burger Bun",
    unitLabel: formatModifierIngredientUnitLabel("Pcs"),
  },
  {
    id: "stock-level-6",
    label: "Truffle Mayo",
    unitLabel: formatModifierIngredientUnitLabel("Bottles"),
  },
];

export const MODIFIER_INGREDIENT_OPTIONS_BY_ID = Object.fromEntries(
  MODIFIER_INGREDIENT_OPTIONS.map((option) => [option.id, option])
);

export const MODIFIER_INGREDIENT_OPTIONS_BY_LABEL = Object.fromEntries(
  MODIFIER_INGREDIENT_OPTIONS.map((option) => [option.label, option])
);

export const MODIFIER_INGREDIENT_OPTION_LABELS = MODIFIER_INGREDIENT_OPTIONS.map(
  (option) => option.label
);


