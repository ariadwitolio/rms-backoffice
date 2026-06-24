import { ALL_SELLING_TIME_DAY_LABELS, SELLING_TIME_DAY_OPTIONS } from "../constants/catalog.js";
import { createInitialCatalogDraft, createSellingTimeSlot, cloneSellingTimeSlots, normalizeUnitPrecisionOption, createSellingTimeDaySchedule, getSellingTimeSlotErrorKey } from "./catalogDraftUtils.js";
import { createInitialModifierDraft, hasModifierOptionIngredient, isModifierOptionIngredientQtyValid, getModifierOptionIngredientQtyErrorIds } from "./modifierUtils.js";

export function createInitialDeviceManagementDraft() {
  return {
    deviceName: "",
    deviceType: "",
    connectedDevices: "",
  };
}


export function createInitialUnitDraft() {
  return {
    name: "",
    precision: "1",
  };
}

export function createCategoryDetailDraftFromRecord(record) {
  return {
    id: record?.id ?? "",
    name: record?.name ?? "",
    parentCategory: record?.parentCategory || "None (Main Category)",
    sellingTime: record?.sellingTime ?? "",
    color: record?.color ?? "#F9EB9E",
  };
}


export function createUnitDetailDraftFromRecord(record) {
  return {
    id: record?.id ?? "",
    name: record?.name ?? "",
    precision: normalizeUnitPrecisionOption(record?.precision),
  };
}

export function cloneCategoryDetailDraftState(value) {
  return JSON.parse(JSON.stringify(value));
}

export function cloneUnitDetailDraftState(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getCategoryDetailValidationMessage(detailDraft, detailEditing) {
  if (!detailDraft || !detailEditing) return null;

  if (detailEditing.kind === "all" && !detailDraft.name.trim()) {
    return "Field cannot be empty";
  }

  if (detailEditing.field === "name" && !detailDraft.name.trim()) {
    return "Field cannot be empty";
  }

  return null;
}

export function getUnitDetailValidationMessage(detailDraft, detailEditing) {
  if (!detailDraft || !detailEditing) return null;

  if (detailEditing.kind === "all" && !detailDraft.name.trim()) {
    return "Field cannot be empty";
  }

  if (detailEditing.field === "name" && !detailDraft.name.trim()) {
    return "Field cannot be empty";
  }

  return null;
}

export function isSameCategoryDetailEditing(currentEditing, nextEditing) {
  return (
    currentEditing?.kind === nextEditing?.kind &&
    currentEditing?.field === nextEditing?.field
  );
}

export function isSameUnitDetailEditing(currentEditing, nextEditing) {
  return (
    currentEditing?.kind === nextEditing?.kind &&
    currentEditing?.field === nextEditing?.field
  );
}

export function getConnectedCatalogNamesForUnit(unitName, catalogRows = []) {
  return catalogRows
    .filter((catalog) => (catalog.unit || "Pcs") === unitName)
    .map((catalog) => catalog.name);
}

export function getModifierDetailValidationMessage(detailDraft, detailEditing) {
  if (!detailDraft || !detailEditing) return null;

  if (detailEditing.kind === "all" && !detailDraft.name.trim()) {
    return "Field cannot be empty";
  }

  if (detailEditing.kind === "field" && detailEditing.field === "name") {
    if (!detailDraft.name.trim()) {
      return "Field cannot be empty";
    }
  }

  if (detailEditing.kind === "option-row") {
    const option = (detailDraft.options ?? []).find(
      (item) => item.id === detailEditing.optionId
    );
    if (!option?.name?.trim()) {
      return "Field cannot be empty";
    }
    if (
      hasModifierOptionIngredient(option) &&
      !isModifierOptionIngredientQtyValid(option)
    ) {
      return "Qty must be greater than 0 when ingredient is selected";
    }
  }

  if (
    (detailEditing.kind === "all" || detailEditing.kind === "option-row") &&
    getModifierOptionIngredientQtyErrorIds(detailDraft.options ?? []).length
  ) {
    return "Qty must be greater than 0 when ingredient is selected";
  }

  return null;
}

export function isSameModifierDetailEditing(currentEditing, nextEditing) {
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
    currentEditing.kind === "option-row" &&
    nextEditing.kind === "option-row"
  ) {
    return currentEditing.optionId === nextEditing.optionId;
  }

  return false;
}

export function getSellingTimeDaysFromRecord(record) {
  if (Array.isArray(record?.days) && record.days.length) {
    return record.days.filter(Boolean);
  }

  if (Array.isArray(record?.schedule)) {
    return record.schedule
      .filter((day) => day?.enabled)
      .map((day) => day?.label)
      .filter(Boolean);
  }

  return record?.day ? [record.day] : [];
}

export function getSellingTimeDayDisplay(record) {
  const dayLabels = getSellingTimeDaysFromRecord(record);
  return dayLabels.length ? dayLabels.join(", ") : "-";
}

export function getDefaultSellingTimeSlotsForRecord(recordName, dayLabel) {
  const normalizedName = String(recordName ?? "")
    .trim()
    .toLowerCase();
  const normalizedDayLabel = String(dayLabel ?? "")
    .trim()
    .toLowerCase();

  if (normalizedName === "all day") {
    return [
      { id: `${normalizedDayLabel}-slot-1`, start: "00:00", end: "23:59" },
    ];
  }

  if (normalizedName === "breakfast") {
    return [
      { id: `${normalizedDayLabel}-slot-1`, start: "06:00", end: "11:00" },
    ];
  }

  if (normalizedName === "lunch rush") {
    return [
      { id: `${normalizedDayLabel}-slot-1`, start: "11:00", end: "15:00" },
    ];
  }

  if (normalizedName === "late night") {
    return [
      { id: `${normalizedDayLabel}-slot-1`, start: "21:00", end: "23:59" },
    ];
  }

  return [{ id: `${normalizedDayLabel}-slot-1`, start: "09:00", end: "20:00" }];
}

export function getSellingTimeDetailSchedule(record) {
  const scheduleMap = new Map(
    Array.isArray(record?.schedule)
      ? record.schedule.map((day) => [day?.label, day])
      : []
  );
  const enabledDaySet = new Set(getSellingTimeDaysFromRecord(record));

  return SELLING_TIME_DAY_OPTIONS.map((day) => {
    const matchedDay = scheduleMap.get(day.label);
    const defaultEnabled = enabledDaySet.has(day.label);
    const enabled = Boolean(matchedDay?.enabled ?? defaultEnabled);
    const is24Hours = Boolean(
      matchedDay?.is24Hours ??
      (enabled && String(record?.name).trim() === "All Day")
    );
    const slotsSource =
      Array.isArray(matchedDay?.slots) && matchedDay.slots.length
        ? matchedDay.slots
        : enabled
          ? getDefaultSellingTimeSlotsForRecord(record?.name, day.label)
          : [];

    return {
      id: day.id,
      label: day.label,
      enabled,
      is24Hours,
      manualSlots:
        enabled && !is24Hours
          ? slotsSource.map((slot, index) => ({
            id: slot?.id ?? `${day.id}-slot-${index + 1}`,
            start: slot?.start ?? "",
            end: slot?.end ?? "",
          }))
          : [createSellingTimeSlot("", "")],
      slots: enabled
        ? slotsSource.map((slot, index) => ({
          id: slot?.id ?? `${day.id}-slot-${index + 1}`,
          start: slot?.start ?? "",
          end: slot?.end ?? "",
        }))
        : [],
    };
  });
}

export function createSellingTimeDetailDraftFromRecord(record) {
  return {
    id: record?.id ?? "",
    name: record?.name ?? "",
    days: getSellingTimeDetailSchedule(record).map((day) =>
      createSellingTimeDaySchedule(day)
    ),
  };
}

export function cloneSellingTimeDetailDraftState(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getSellingTimeDetailValidationMessage(detailDraft, detailEditing) {
  if (!detailDraft || !detailEditing) return null;

  if (detailEditing.kind === "field" && detailEditing.field === "name") {
    if (!detailDraft.name.trim()) {
      return "Field cannot be empty";
    }
  }

  if (detailEditing.kind === "schedule-day") {
    const day = (detailDraft.days ?? []).find(
      (entry) => entry.id === detailEditing.dayId
    );
    if (!day || !day.enabled || day.is24Hours) return null;

    const hasInvalidSlot = (day.slots ?? []).some(
      (slot) => !slot?.start || !slot?.end
    );

    if (hasInvalidSlot) {
      return "Field cannot be empty";
    }
  }

  return null;
}

export function getSellingTimeDetailValidationErrors(detailDraft, detailEditing) {
  if (!detailDraft || !detailEditing) return {};

  if (detailEditing.kind !== "schedule-day") {
    return {};
  }

  const day = (detailDraft.days ?? []).find(
    (entry) => entry.id === detailEditing.dayId
  );
  if (!day || !day.enabled || day.is24Hours) {
    return {};
  }

  return (day.slots ?? []).reduce((errors, slot) => {
    if (!slot?.start) {
      errors[getSellingTimeSlotErrorKey(day.id, slot.id, "start")] = true;
    }
    if (!slot?.end) {
      errors[getSellingTimeSlotErrorKey(day.id, slot.id, "end")] = true;
    }
    return errors;
  }, {});
}

export function isSameSellingTimeDetailEditing(currentEditing, nextEditing) {
  if (
    !currentEditing ||
    !nextEditing ||
    currentEditing.kind !== nextEditing.kind
  ) {
    return false;
  }

  if (currentEditing.kind === "field" && nextEditing.kind === "field") {
    return currentEditing.field === nextEditing.field;
  }

  if (
    currentEditing.kind === "schedule-day" &&
    nextEditing.kind === "schedule-day"
  ) {
    return currentEditing.dayId === nextEditing.dayId;
  }

  return false;
}

export const CATEGORY_HIERARCHY_SEPARATOR = " / ";
export const MAX_CATEGORY_NESTING_LEVEL = 3;
export const DUPLICATE_CATALOG_SNACKBAR_MESSAGE =
  "Catalog name, unit, and category combination already exists";
export const DUPLICATE_CATALOG_NAME_ERROR_MESSAGE = "Catalog name already exists";
export const DUPLICATE_CATEGORY_ERROR_MESSAGE = "Category name already exists";
export const DUPLICATE_UNIT_ERROR_MESSAGE = "Unit name already exists";
export const DUPLICATE_MODIFIER_ERROR_MESSAGE = "Modifier name already exists";
export const DUPLICATE_PRICING_RULE_ERROR_MESSAGE =
  "Special pricing rule name already exists";
export const DUPLICATE_DEVICE_ERROR_MESSAGE = "Device name already exists";
export const DUPLICATE_KDS_GROUP_ERROR_MESSAGE = "KDS group name already exists";
export const DUPLICATE_ROLE_ACCESS_ERROR_MESSAGE = "Role access name already exists";

