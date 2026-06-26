import { UNIT_PRECISION_OPTIONS } from "../constants/catalog.js";
import { createInitialCatalogDraft, nextCatalogBuilderId, MODIFIER_INGREDIENT_OPTIONS_BY_ID, MODIFIER_INGREDIENT_OPTIONS_BY_LABEL } from "./catalogDraftUtils.js";
import { cloneAssignedUnits } from "./catalogBuildUtils.js";
import { getNormalizedNominalDigits } from "../components/app/ModifierOptionsTable.jsx";

export function createEmptyModifierOption() {
  return {
    id: nextCatalogBuilderId("modifier-option"),
    name: "",
    additionalPrice: "",
    overrideAdditionalPrice: "",
    isAvailable: true,
    ingredientId: "",
    selectedIngredient: "",
    ingredientQty: "",
    ingredientUnit: "",
  };
}

export function formatModifierIngredientUnitLabel(unitLabel = "") {
  return String(unitLabel ?? "").trim().toLowerCase();
}

export function getModifierIngredientSelection({
  ingredientId = "",
  selectedIngredient = "",
  ingredientUnit = "",
} = {}) {
  const byId = ingredientId
    ? MODIFIER_INGREDIENT_OPTIONS_BY_ID[ingredientId] ?? null
    : null;

  if (byId) {
    return {
      ingredientId: byId.id,
      selectedIngredient: byId.label,
      ingredientUnit: byId.unitLabel,
    };
  }

  const byLabel = selectedIngredient
    ? MODIFIER_INGREDIENT_OPTIONS_BY_LABEL[selectedIngredient] ?? null
    : null;

  if (byLabel) {
    return {
      ingredientId: byLabel.id,
      selectedIngredient: byLabel.label,
      ingredientUnit: byLabel.unitLabel,
    };
  }

  return {
    ingredientId: ingredientId || "",
    selectedIngredient: selectedIngredient || "",
    ingredientUnit: formatModifierIngredientUnitLabel(ingredientUnit),
  };
}

export function normalizeModifierIngredientQtyInput(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return String(Number(digits));
}

export function hasModifierOptionIngredient(option) {
  return Boolean(option?.ingredientId || option?.selectedIngredient);
}

export function isModifierOptionIngredientQtyValid(option) {
  if (!hasModifierOptionIngredient(option)) return true;
  return Number(option?.ingredientQty ?? 0) > 0;
}

export function getModifierOptionNameErrorIds(options = []) {
  return options
    .filter((option) => !option?.name?.trim?.())
    .map((option) => option.id);
}

export function getModifierOptionDuplicateNameIds(options = []) {
  const nameCounts = {};
  options.forEach((option) => {
    const normalized = option?.name?.trim?.()?.toLowerCase?.() ?? "";
    if (!normalized) return;
    nameCounts[normalized] = (nameCounts[normalized] || 0) + 1;
  });
  return options
    .filter((option) => {
      const normalized = option?.name?.trim?.()?.toLowerCase?.() ?? "";
      return normalized && nameCounts[normalized] > 1;
    })
    .map((option) => option.id);
}

export function getModifierOptionIngredientQtyErrorIds(options = []) {
  return options
    .filter(
      (option) =>
        hasModifierOptionIngredient(option) &&
        !isModifierOptionIngredientQtyValid(option)
    )
    .map((option) => option.id);
}

export function getModifierOptionErrors(options = []) {
  const nextErrors = {};
  const emptyNameIds = getModifierOptionNameErrorIds(options);
  const duplicateNameIds = getModifierOptionDuplicateNameIds(options);
  const optionNames = [...new Set([...emptyNameIds, ...duplicateNameIds])];
  const optionIngredientQtys = getModifierOptionIngredientQtyErrorIds(options);

  if (optionNames.length) {
    nextErrors.optionNames = optionNames;
  }

  if (optionIngredientQtys.length) {
    nextErrors.optionIngredientQtys = optionIngredientQtys;
  }

  return nextErrors;
}

export function getModifierSelectionRangeError(draft) {
  const minSel = Number(draft.minimumSelection) || 0;
  const maxSel = Number(draft.maximumSelection) || 0;
  if (minSel > 0 && maxSel > 0 && maxSel < minSel) {
    return "Maximum selection cannot be less than minimum selection";
  }
  return null;
}

export function getModifierSelectionCountError(draft) {
  const rangeError = getModifierSelectionRangeError(draft);
  if (rangeError) return rangeError;

  const namedOptions = (draft.options || []).filter((opt) =>
    String(opt.name || "").trim()
  );
  const optionCount = namedOptions.length;
  const minSel = Number(draft.minimumSelection) || 0;
  const maxSel = Number(draft.maximumSelection) || 0;

  if (minSel > 0 && optionCount < minSel) {
    return `Add at least ${minSel} option${minSel === 1 ? "" : "s"} to meet the minimum selection of ${minSel}`;
  }
  if (maxSel > 0 && optionCount < maxSel) {
    return `Add at least ${maxSel} option${maxSel === 1 ? "" : "s"} to meet the maximum selection of ${maxSel}`;
  }
  return null;
}

export function clearModifierOptionErrorId(previousErrors, key, optionId) {
  const currentIds = previousErrors?.[key] ?? [];
  if (!currentIds.includes(optionId)) {
    return previousErrors;
  }

  const nextIds = currentIds.filter((currentId) => currentId !== optionId);
  const nextErrors = { ...previousErrors };

  if (nextIds.length) {
    nextErrors[key] = nextIds;
  } else {
    delete nextErrors[key];
  }

  return nextErrors;
}

export function buildModifierOptionDraft(option = {}) {
  const ingredientSelection = getModifierIngredientSelection(option);
  const hasIngredient = Boolean(
    ingredientSelection.ingredientId || ingredientSelection.selectedIngredient
  );
  const normalizedIngredientQty = normalizeModifierIngredientQtyInput(
    option?.ingredientQty
  );

  return {
    ...option,
    name: option?.name ?? "",
    additionalPrice: getNormalizedNominalDigits(option?.additionalPrice),
    isAvailable: option?.isAvailable !== false,
    ingredientId: ingredientSelection.ingredientId,
    selectedIngredient: ingredientSelection.selectedIngredient,
    ingredientUnit: ingredientSelection.ingredientUnit,
    ingredientQty: hasIngredient
      ? normalizedIngredientQty && Number(normalizedIngredientQty) > 0
        ? normalizedIngredientQty
        : "1"
      : "",
  };
}

export function buildModifierOptionRecordForStorage(option = {}) {
  const ingredientSelection = getModifierIngredientSelection(option);
  const hasIngredient = Boolean(
    ingredientSelection.ingredientId || ingredientSelection.selectedIngredient
  );
  const normalizedIngredientQty = normalizeModifierIngredientQtyInput(
    option?.ingredientQty
  );

  return {
    ...option,
    name: option.name.trim(),
    additionalPrice: getNormalizedNominalDigits(option.additionalPrice),
    ingredientId: hasIngredient ? ingredientSelection.ingredientId : "",
    selectedIngredient: hasIngredient
      ? ingredientSelection.selectedIngredient
      : "",
    ingredientQty:
      hasIngredient && Number(normalizedIngredientQty) > 0
        ? normalizedIngredientQty
        : "",
    ingredientUnit: hasIngredient ? ingredientSelection.ingredientUnit : "",
  };
}

export function normalizeModifierOptions(options = []) {
  const nextOptions = options.map((option) => buildModifierOptionDraft(option));

  return nextOptions.length ? nextOptions : [createEmptyModifierOption()];
}

export function createInitialModifierDraft() {
  return {
    name: "",
    minimumSelection: "",
    maximumSelection: "",
    allowOverridePrice: false,
    availability: true,
    connectedCatalog: [],
    assignedUnits: [],
    options: [createEmptyModifierOption()],
  };
}

export function createModifierDetailDraftFromRecord(record) {
  return {
    id: record?.id ?? "",
    name: record?.name ?? "",
    minimumSelection: Number(record?.minimumSelection) > 0 ? String(Number(record.minimumSelection)) : "",
    maximumSelection: Number(record?.maximumSelection) > 0 ? String(Number(record.maximumSelection)) : "",
    allowOverridePrice: Boolean(record?.allowOverridePrice),
    availability: record?.availability !== false,
    connectedCatalog: Array.isArray(record?.connectedCatalogItems)
      ? [...record.connectedCatalogItems]
      : [],
    assignedUnits: cloneAssignedUnits(record?.assignedUnits ?? []),
    options: normalizeModifierOptions(record?.options ?? []),
  };
}

export function cloneModifierDetailDraftState(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createInitialCategoryDraft() {
  return {
    name: "",
    parentCategory: "None (Main Category)",
    sellingTime: "All Day",
    color: "#F9EB9E",
  };
}

