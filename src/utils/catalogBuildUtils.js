import { PRICING_OVERRIDE_GROUPS } from "../constants/pricing.js";
import { normalizeCatalogAssignedUnits, createAssignedUnitsFromIds, createInitialCatalogDraft, cloneSellingTimeSlots, getCatalogCategoryForType, normalizePackageItems, normalizeCatalogIngredients, createEmptyPackageItem, nextCatalogBuilderId } from "./catalogDraftUtils.js";
import { normalizeModifierOptions, createInitialModifierDraft } from "./modifierUtils.js";
import { buildCategoryRows, buildModifierRows, buildUnitRows } from "./catalogHierarchyUtils.jsx";
import { syncAssignedUnitsWithPricingSections, clonePricingOverrideSections, createDefaultPricingOverrideSections } from "./pricingUtils.js";
import { ASSETS } from "../constants/assets.js";
import { formatIdr } from "./dashboardDateUtils.js";
import { getSellingTimeDaysFromRecord } from "./detailDraftUtils.js";
import { getNormalizedNominalDigits, formatNominalInput } from "../components/app/ModifierOptionsTable.jsx";

export function getModifierUnitAssignmentColumns(options = []) {
  const namedOptions = options
    .map((option, index) => ({
      id: option?.id ?? `modifier-assignment-column-${index}`,
      name: option?.name?.trim?.() ?? "",
      additionalPrice: getNormalizedNominalDigits(option?.additionalPrice),
    }))
    .filter((option) => option.name);

  return namedOptions.length
    ? namedOptions
    : [
      {
        id: "modifier-assignment-empty",
        name: "-",
        additionalPrice: "",
        isPlaceholder: true,
      },
    ];
}

export function getModifierUnitAssignmentValue(option, unit) {
  return "-";
}

export function formatModifierDetailOptionPrice(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue || rawValue === "0") return "Free";

  const digits = rawValue.replace(/[^\d]/g, "");
  return digits ? `+ ${formatIdr(Number(digits))}` : rawValue;
}

export function getModifierCatalogSelectSummary(
  selectedCatalogs = [],
  groups = [],
  placeholder = "Select Catalog"
) {
  const normalizedValues = Array.isArray(selectedCatalogs)
    ? selectedCatalogs.filter(Boolean)
    : [];
  const totalCatalogs = groups.flatMap((group) => group.items ?? []).length;

  if (totalCatalogs && normalizedValues.length === totalCatalogs) {
    return "All Catalogs Selected";
  }

  if (normalizedValues.length === 1) {
    const selectedItem = groups
      .flatMap((group) => group.items ?? [])
      .find(
        (item) =>
          item.value === normalizedValues[0] || item.id === normalizedValues[0]
      );
    return selectedItem?.label ?? normalizedValues[0];
  }

  if (normalizedValues.length > 1) {
    return `${normalizedValues.length} Catalogs Selected`;
  }

  return placeholder;
}

export function getModifierConnectedCatalogSummary(
  selectedCatalogs = []
) {
  const normalizedValues = Array.isArray(selectedCatalogs)
    ? selectedCatalogs.filter(Boolean)
    : [];

  return normalizedValues.length ? normalizedValues.join(", ") : "-";
}

export function getModifierDetailUnitAssignmentValue(option, unit) {
  if (!option || option.isPlaceholder) return "-";
  if (!unit || unit.maxOverridePrice === "Not Allowed") return "-";

  const rawValue =
    unit.optionValues?.[option.id] ??
    unit.optionValues?.[option.name] ??
    option.additionalPrice ??
    "";
  const normalizedValue = String(rawValue ?? "").trim();

  if (!normalizedValue || normalizedValue === "0") return "Free";
  if (normalizedValue === "-") return "-";

  const digits = normalizedValue.replace(/[^\d]/g, "");
  return digits ? formatNominalInput(digits) : normalizedValue;
}

export function buildSellingTimeRows(sellingTimes = []) {
  return sellingTimes.map((row) => {
    const dayLabels = getSellingTimeDaysFromRecord(row);

    return {
      ...row,
      dayDisplay: dayLabels.length ? dayLabels.join(", ") : "-",
      daySearch: dayLabels.join(" "),
    };
  });
}

export function cloneCatalogPhotos(photos = []) {
  return photos.map((photo) => ({ ...photo }));
}

export function clonePackageItems(items = []) {
  return (items ?? []).map((item) => ({ ...item }));
}

export function cloneCatalogIngredients(items = []) {
  return (items ?? []).map((item) => ({ ...item }));
}

export function cloneAssignedUnits(units = []) {
  return units.map((unit) => ({ ...unit }));
}

export function createCatalogPhotoSet(prefix, count = 3) {
  const imagePool = [
    ASSETS.detailPhotoA,
    ASSETS.detailPhotoB,
    ASSETS.detailPhotoC,
    ASSETS.detailPhotoA,
    ASSETS.detailPhotoB,
  ];

  return Array.from({ length: count }, (_, index) => imagePool[index % imagePool.length]).map((url, index) => ({
    id: `${prefix}-photo-${index + 1}`,
    name: `Catalog photo ${index + 1}`,
    url,
    isMain: index === 0,
    objectUrl: false,
  }));
}

export function getCatalogPhotoPoolForRecord(record = {}) {
  const normalizedName = String(record?.name ?? "").trim().toLowerCase();
  const normalizedCategory = String(record?.category ?? "").trim().toLowerCase();
  const normalizedType = String(record?.type ?? "").trim().toLowerCase();

  if (
    normalizedType === "package" ||
    normalizedName.includes("package") ||
    normalizedName.includes("combo")
  ) {
    return [
      ASSETS.catalogPhotoCombo,
      ASSETS.catalogPhotoBurger,
      ASSETS.catalogPhotoCoffee,
      ASSETS.catalogPhotoFries,
      ASSETS.catalogPhotoDessert,
    ];
  }

  if (normalizedName.includes("burger")) {
    return [
      ASSETS.catalogPhotoBurger,
      ASSETS.catalogPhotoFries,
      ASSETS.catalogPhotoCombo,
    ];
  }

  if (
    normalizedName.includes("linguine") ||
    normalizedName.includes("pasta") ||
    normalizedName.includes("pesto")
  ) {
    return [
      ASSETS.catalogPhotoPasta,
      ASSETS.catalogPhotoSalad,
      ASSETS.catalogPhotoDessert,
    ];
  }

  if (normalizedName.includes("cake")) {
    return [
      ASSETS.catalogPhotoDessert,
      ASSETS.catalogPhotoCoffee,
      ASSETS.catalogPhotoCombo,
    ];
  }

  if (normalizedName.includes("salad")) {
    return [
      ASSETS.catalogPhotoSalad,
      ASSETS.catalogPhotoPasta,
      ASSETS.catalogPhotoDessert,
    ];
  }

  if (normalizedName.includes("fries")) {
    return [
      ASSETS.catalogPhotoFries,
      ASSETS.catalogPhotoBurger,
      ASSETS.catalogPhotoCombo,
    ];
  }

  if (
    normalizedName.includes("coffee") ||
    normalizedCategory.includes("beverage")
  ) {
    return [
      ASSETS.catalogPhotoCoffee,
      ASSETS.catalogPhotoDessert,
      ASSETS.catalogPhotoCombo,
    ];
  }

  if (normalizedCategory.includes("dessert")) {
    return [
      ASSETS.catalogPhotoDessert,
      ASSETS.catalogPhotoCoffee,
      ASSETS.catalogPhotoSalad,
    ];
  }

  if (normalizedCategory.includes("appetizer")) {
    return [
      ASSETS.catalogPhotoSalad,
      ASSETS.catalogPhotoFries,
      ASSETS.catalogPhotoBurger,
    ];
  }

  return [
    ASSETS.detailPhotoA,
    ASSETS.detailPhotoB,
    ASSETS.detailPhotoC,
  ];
}

export function createCatalogPhotoSetForRecord(record, count = 3) {
  const imagePool = getCatalogPhotoPoolForRecord(record);

  return Array.from(
    { length: count },
    (_, index) => imagePool[index % imagePool.length]
  ).map((url, index) => ({
    id: `${record?.id ?? "catalog"}-photo-${index + 1}`,
    name: `Catalog photo ${index + 1}`,
    url,
    isMain: index === 0,
    objectUrl: false,
  }));
}

export function createCatalogAssignedUnits(selectedIds, overrides = {}) {
  return normalizeCatalogAssignedUnits(createAssignedUnitsFromIds(selectedIds).map((unit) => ({
    ...unit,
    ...(overrides[unit.id] ?? {}),
  })));
}

export function createCatalogSeedRecord(record) {
  const type = record?.type ?? "single";

  return {
    type,
    modifier: [],
    unit: "Pcs",
    price: String(record.basePrice ?? 0),
    allowOverridePrice: false,
    packageItems: [],
    ...record,
    category: getCatalogCategoryForType(type, record?.category),
    photos: cloneCatalogPhotos(
      record?.photos ?? createCatalogPhotoSetForRecord(record, 3)
    ),
    assignedUnits: normalizeCatalogAssignedUnits(record?.assignedUnits ?? []),
  };
}

export function createCatalogDetailDraftFromRecord(record) {
  const type = record?.type ?? "single";

  return {
    id: record?.id ?? "",
    availability: record?.availability ?? true,
    photos: cloneCatalogPhotos(record?.photos ?? []),
    type,
    name: record?.name ?? "",
    additionalNames: Array.isArray(record?.additionalNames)
      ? record.additionalNames.map((entry) =>
          typeof entry === "string"
            ? { id: nextCatalogBuilderId("additional-name"), value: entry }
            : { id: nextCatalogBuilderId("additional-name"), value: entry.value ?? "" }
        )
      : [],
    description: record?.description ?? "",
    unit: record?.unit ?? "Pcs",
    category: getCatalogCategoryForType(type, record?.category),
    modifier: Array.isArray(record?.modifier) ? [...record.modifier] : [],
    sellingTime: record?.sellingTime ?? "",
    price: String(record?.price ?? record?.basePrice ?? 0),
    overridePrice: String(record?.overridePrice ?? record?.price ?? record?.basePrice ?? 0),
    allowOverridePrice: Boolean(record?.allowOverridePrice),
    packageItems:
      type === "package"
        ? normalizePackageItems(clonePackageItems(record?.packageItems ?? []))
        : clonePackageItems(record?.packageItems ?? []),
    assignedUnits: normalizeCatalogAssignedUnits(
      cloneAssignedUnits(record?.assignedUnits ?? [])
    ),
    trackStock: Boolean(record?.trackStock),
    ingredients: normalizeCatalogIngredients(
      cloneCatalogIngredients(record?.ingredients ?? [])
    ),
    preparationTime: String(record?.preparationTime ?? ""),
    routing: record?.routing ?? "KDS Kitchen",
  };
}


export function cloneCatalogDetailDraftState(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getCatalogDetailValidationMessage(detailDraft, detailEditing) {
  if (!detailDraft || !detailEditing) return null;

  if (detailEditing.kind === "all") {
    if (!detailDraft.name.trim()) {
      return "Field cannot be empty";
    }
    if (!detailDraft.category) {
      return "Field cannot be empty";
    }

    if (detailDraft.trackStock && (detailDraft.ingredients ?? []).length === 0) {
      return "At least one ingredient is required when stock tracking is enabled";
    }

    if (
      detailDraft.type === "package" &&
      (detailDraft.packageItems ?? []).some((item) =>
        Boolean(item.catalogId) !== Boolean(item.qty)
      )
    ) {
      return "Field cannot be empty";
    }
  }

  if (detailEditing.kind === "field") {
    if (detailEditing.field === "name" && !detailDraft.name.trim()) {
      return "Field cannot be empty";
    }
    if (detailEditing.field === "category" && !detailDraft.category) {
      return "Field cannot be empty";
    }
  }

  if (detailEditing.kind === "package-row") {
    const currentRow = detailDraft.packageItems.find(
      (item) => item.id === detailEditing.rowId
    );
    if (!currentRow?.catalogId || !currentRow.qty) {
      return "Field cannot be empty";
    }
  }

  if (detailEditing.kind === "assignment-row") {
    const currentUnit = detailDraft.assignedUnits.find(
      (item) => item.id === detailEditing.unitId
    );
    if (!currentUnit?.maxOverridePrice) {
      return "Field cannot be empty";
    }
  }

  return null;
}

export function isSameCatalogDetailEditing(currentEditing, nextEditing) {
  if (
    !currentEditing ||
    !nextEditing ||
    currentEditing.kind !== nextEditing.kind
  ) {
    return false;
  }

  if (currentEditing.kind === "all" && nextEditing.kind === "all") {
    return true;
  }

  if (currentEditing.kind === "field" && nextEditing.kind === "field") {
    return currentEditing.field === nextEditing.field;
  }

  if (
    currentEditing.kind === "package-row" &&
    nextEditing.kind === "package-row"
  ) {
    return currentEditing.rowId === nextEditing.rowId;
  }

  if (
    currentEditing.kind === "assignment-row" &&
    nextEditing.kind === "assignment-row"
  ) {
    return currentEditing.unitId === nextEditing.unitId;
  }

  return false;
}

export function getNextCatalogDetailTypeDraft(detailDraft, nextType) {
  return {
    ...detailDraft,
    type: nextType,
    modifier: nextType === "single" ? detailDraft.modifier : [],
    packageItems:
      nextType === "package"
        ? detailDraft.packageItems.length
          ? normalizePackageItems(detailDraft.packageItems)
          : [createEmptyPackageItem()]
        : [],
  };
}

export function getCatalogDetailAssignmentEditingDraft(detailDraft, unitId) {
  return {
    ...detailDraft,
    assignedUnits: (detailDraft.assignedUnits ?? []).map((unit) =>
      unit.id === unitId
        ? {
          ...unit,
          overridePriceInput:
            unit.overridePrice === "-"
              ? ""
              : String(unit.overridePrice).replace(/[^\d]/g, ""),
        }
        : unit
    ),
  };
}

export function disposeCatalogPhotos(photos) {
  photos.forEach((photo) => {
    if (photo.objectUrl) {
      window.URL.revokeObjectURL(photo.url);
    }
  });
}

