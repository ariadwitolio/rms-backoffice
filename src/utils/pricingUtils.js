import { DEFAULT_PRICING_OVERRIDE_MAXIMUMS, PRICING_OVERRIDE_GROUPS, PRICING_RULE_MONTH_LABELS } from "../constants/pricing.js";

export function normalizePricingOverrideMaximumValue(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits === "" ? "0" : String(Math.min(100, Number(digits)));
}

export function formatPricingOverrideMaximumValue(value) {
  const normalized = normalizePricingOverrideMaximumValue(value);
  return Number(normalized) > 0 ? `${normalized}%` : "Not Allowed";
}

export function createPricingOverrideSections() {
  function buildSection(sectionKey) {
    return PRICING_OVERRIDE_GROUPS.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        id: `${sectionKey}-${item.id}`,
        maximum: normalizePricingOverrideMaximumValue(item.maximum),
      })),
    }));
  }

  return {
    catalog: buildSection("catalog"),
    modifier: buildSection("modifier"),
  };
}

export function createDefaultPricingOverrideSections() {
  return applyPricingRuleMaximums(
    createPricingOverrideSections(),
    DEFAULT_PRICING_OVERRIDE_MAXIMUMS
  );
}

export function resolvePricingOverrideMaximumForUnitFromSections(
  sections,
  sectionKey,
  unitId
) {
  const rawUnitId = String(unitId ?? "");
  const normalizedUnitId = rawUnitId.replace(/^unit-/, "");
  const sectionGroups = sections[sectionKey] ?? [];
  const matchedItem = sectionGroups
    .flatMap((group) => group.items ?? [])
    .find(
      (item) =>
        item.id === `${sectionKey}-${rawUnitId}` ||
        item.id === `${sectionKey}-${normalizedUnitId}` ||
        item.id === rawUnitId ||
        item.id === normalizedUnitId
    );

  return matchedItem
    ? formatPricingOverrideMaximumValue(matchedItem.maximum)
    : "Not Allowed";
}

export function syncAssignedUnitsWithPricingSections(units, sectionKey, sections) {
  return (units ?? []).map((unit) => {
    const maxOverridePrice = resolvePricingOverrideMaximumForUnitFromSections(
      sections,
      sectionKey,
      unit.id
    );

    return {
      ...unit,
      maxOverridePrice,
      overridePrice:
        maxOverridePrice === "Not Allowed" ? "-" : unit.overridePrice ?? "-",
    };
  });
}

export function clonePricingOverrideSections(
  sections = createPricingOverrideSections()
) {
  return Object.fromEntries(
    Object.entries(sections).map(([sectionKey, groups]) => [
      sectionKey,
      groups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item })),
      })),
    ])
  );
}

export function createInitialSpecialPricingRuleDraft() {
  return {
    name: "",
    startDate: "",
    endDate: "",
    overrides: createPricingOverrideSections(),
    selected: {
      catalog: [],
      modifier: [],
    },
  };
}

export function parsePricingRuleDisplayValue(value) {
  const match = String(value ?? "")
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}:\d{2})$/);

  if (!match) return null;

  const [, day, month, year, hours] = match;
  const monthIndex = Number(month) - 1;
  const monthLabel = PRICING_RULE_MONTH_LABELS[monthIndex] ?? month;

  return {
    day: Number(day),
    month: Number(month),
    year,
    dateText: `${Number(day)} ${monthLabel} ${year}`,
    timeText: hours,
  };
}

export function getPricingRuleDateDisplayParts(value) {
  const parsedValue = parsePricingRuleDisplayValue(value);
  if (!parsedValue) {
    return value ? [{ text: value, muted: false }] : [];
  }

  return [
    { text: parsedValue.dateText, muted: false },
    { text: `, ${parsedValue.timeText}`, muted: true },
  ];
}

export function createPricingRuleTimeWindowDisplay(startDate, endDate) {
  const normalizedStartDate = String(startDate ?? "").trim();
  const normalizedEndDate = String(endDate ?? "").trim();

  if (!normalizedStartDate && !normalizedEndDate) {
    return {
      timeWindowSearch: "",
      timeWindowParts: [],
    };
  }

  if (!normalizedStartDate || !normalizedEndDate) {
    const fallbackValue = normalizedStartDate || normalizedEndDate;
    return {
      timeWindowSearch: fallbackValue,
      timeWindowParts: [{ text: fallbackValue, muted: false }],
    };
  }

  const parsedStartDate = parsePricingRuleDisplayValue(normalizedStartDate);
  const parsedEndDate = parsePricingRuleDisplayValue(normalizedEndDate);

  if (
    parsedStartDate &&
    parsedEndDate &&
    parsedStartDate.dateText === parsedEndDate.dateText
  ) {
    return {
      timeWindowSearch: `${parsedStartDate.dateText}, ${parsedStartDate.timeText} – ${parsedEndDate.timeText}`,
      timeWindowParts: [
        { text: parsedStartDate.dateText, muted: false },
        {
          text: `, ${parsedStartDate.timeText} – ${parsedEndDate.timeText}`,
          muted: true,
        },
      ],
    };
  }

  if (parsedStartDate && parsedEndDate) {
    return {
      timeWindowSearch: `${parsedStartDate.dateText}, ${parsedStartDate.timeText} – ${parsedEndDate.dateText}, ${parsedEndDate.timeText}`,
      timeWindowParts: [
        { text: parsedStartDate.dateText, muted: false },
        { text: `, ${parsedStartDate.timeText}`, muted: true },
        { text: " – ", muted: false },
        { text: parsedEndDate.dateText, muted: false },
        { text: `, ${parsedEndDate.timeText}`, muted: true },
      ],
    };
  }

  return {
    timeWindowSearch: `${normalizedStartDate} - ${normalizedEndDate}`,
    timeWindowParts: [
      { text: normalizedStartDate, muted: false },
      { text: " - ", muted: true },
      { text: normalizedEndDate, muted: false },
    ],
  };
}

export function applyPricingRuleMaximums(
  sections = createPricingOverrideSections(),
  maximumByItemId = {}
) {
  return Object.fromEntries(
    Object.entries(sections).map(([sectionKey, groups]) => [
      sectionKey,
      groups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          maximum: Object.prototype.hasOwnProperty.call(
            maximumByItemId,
            item.id
          )
            ? normalizePricingOverrideMaximumValue(maximumByItemId[item.id])
            : normalizePricingOverrideMaximumValue(item.maximum),
        })),
      })),
    ])
  );
}

export function getSelectedPricingOverrideIdsFromSections(sections) {
  return Object.fromEntries(
    Object.entries(sections).map(([sectionKey, groups]) => [
      sectionKey,
      groups.flatMap((group) =>
        group.items
          .filter(
            (item) =>
              Number(normalizePricingOverrideMaximumValue(item.maximum)) > 0
          )
          .map((item) => item.id)
      ),
    ])
  );
}

export function createSpecialPricingRuleRecord({
  id,
  name,
  startDate,
  endDate,
  overrides = createPricingOverrideSections(),
  selectedOverrideIds,
}) {
  const normalizedOverrides =
    normalizeSpecialPricingRuleOverridesForStorage(overrides);
  const resolvedSelectedOverrideIds = selectedOverrideIds
    ? {
      catalog: [...(selectedOverrideIds.catalog ?? [])],
      modifier: [...(selectedOverrideIds.modifier ?? [])],
    }
    : getSelectedPricingOverrideIdsFromSections(normalizedOverrides);
  const { timeWindowSearch, timeWindowParts } =
    createPricingRuleTimeWindowDisplay(startDate, endDate);

  return {
    id,
    name,
    startDate,
    endDate,
    timeWindowSearch,
    timeWindowParts,
    overrides: clonePricingOverrideSections(normalizedOverrides),
    selectedOverrideIds: resolvedSelectedOverrideIds,
  };
}

export function createPricingRuleDetailDraftFromRecord(record) {
  return {
    id: record?.id ?? "",
    name: record?.name ?? "",
    startDate: record?.startDate ?? "",
    endDate: record?.endDate ?? "",
    overrides: clonePricingOverrideSections(record?.overrides),
  };
}

export function clonePricingRuleDetailDraftState(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getPricingRuleDetailValidationMessage(detailDraft, detailEditing) {
  if (!detailDraft || !detailEditing) return null;

  if (detailEditing.kind === "all") {
    if (!detailDraft.name.trim()) {
      return "Field cannot be empty";
    }

    if (!String(detailDraft.startDate ?? "").trim()) {
      return "Field cannot be empty";
    }

    if (!String(detailDraft.endDate ?? "").trim()) {
      return "Field cannot be empty";
    }
  }

  if (detailEditing.kind === "field") {
    if (detailEditing.field === "name" && !detailDraft.name.trim()) {
      return "Field cannot be empty";
    }

    if (
      (detailEditing.field === "startDate" ||
        detailEditing.field === "endDate") &&
      !String(detailDraft[detailEditing.field] ?? "").trim()
    ) {
      return "Field cannot be empty";
    }
  }

  return null;
}

export function isSamePricingRuleDetailEditing(currentEditing, nextEditing) {
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
    currentEditing.kind === "override-row" &&
    nextEditing.kind === "override-row"
  ) {
    return (
      currentEditing.sectionKey === nextEditing.sectionKey &&
      currentEditing.itemId === nextEditing.itemId
    );
  }

  return false;
}

export function normalizeSpecialPricingRuleOverridesForStorage(sections) {
  return Object.fromEntries(
    Object.entries(sections).map(([sectionKey, groups]) => [
      sectionKey,
      groups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          maximum: normalizePricingOverrideMaximumValue(item.maximum),
        })),
      })),
    ])
  );
}

export function normalizePricingOverrideEditInput(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (digits === "") return "";
  return String(Math.min(100, Number(digits)));
}

export function formatPricingRuleDateDisplay(value) {
  if (!value) return "";

  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return "";

  return `${day}/${month}/${year}, ${timePart.slice(0, 5)}`;
}

export function formatPricingRuleDatePickerValue(value) {
  if (!value) return "";

  const match = String(value)
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})$/);
  if (!match) return "";

  const [, day, month, year, hours, minutes] = match;
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function findPricingOverrideItem(groups, itemId) {
  for (const group of groups) {
    const item = group.items.find((entry) => entry.id === itemId);
    if (item) return item;
  }

  return null;
}

