import { BUSINESS_UNIT_ASSIGNMENT_GROUPS } from "../constants/catalog.js";
import { normalizeUnitPrecisionOption, normalizeCatalogAssignedUnits } from "./catalogDraftUtils.js";
import { CATEGORY_HIERARCHY_SEPARATOR, MAX_CATEGORY_NESTING_LEVEL } from "./detailDraftUtils.js";
import { Toggle } from "../components/ui/Primitives.jsx";

export function normalizeDuplicateNameValue(value = "") {
  return String(value ?? "").trim().toLowerCase();
}

export function hasDuplicateRecordName(
  rows = [],
  value = "",
  {
    excludeId = null,
    getRowId = (row) => row?.id,
    getRowValue = (row) => row?.name,
  } = {}
) {
  const normalizedValue = normalizeDuplicateNameValue(value);
  if (!normalizedValue) return false;

  return rows.some((row) => {
    if (excludeId !== null && getRowId(row) === excludeId) {
      return false;
    }

    return normalizeDuplicateNameValue(getRowValue(row)) === normalizedValue;
  });
}

export function getCategoryHierarchyDepth(path = "") {
  if (!path) return 0;
  return path.split(CATEGORY_HIERARCHY_SEPARATOR).length;
}

export function getCategorySubtreeDepth(categoryRows = [], rootPath = "") {
  if (!rootPath) return 1;

  const rootDepth = getCategoryHierarchyDepth(rootPath);
  const matchingDepths = categoryRows
    .map((row) => row.hierarchyPath || row.name)
    .filter(
      (path) =>
        path === rootPath ||
        path.startsWith(`${rootPath}${CATEGORY_HIERARCHY_SEPARATOR}`)
    )
    .map((path) => getCategoryHierarchyDepth(path) - rootDepth + 1);

  return matchingDepths.length ? Math.max(...matchingDepths) : 1;
}

export function buildOrderedCategoryRows(categoryRows = []) {
  const rowsByParent = new Map();

  categoryRows.forEach((row) => {
    const parentKey = row.parentCategory || "";
    if (!rowsByParent.has(parentKey)) {
      rowsByParent.set(parentKey, []);
    }
    rowsByParent.get(parentKey).push(row);
  });

  const visitedIds = new Set();

  function visit(parentKey = "", trail = new Set()) {
    const children = rowsByParent.get(parentKey) ?? [];

    return children.flatMap((row) => {
      if (visitedIds.has(row.id) || trail.has(row.name)) {
        return [];
      }

      visitedIds.add(row.id);
      const nextTrail = new Set(trail);
      nextTrail.add(row.name);

      return [row, ...visit(row.name, nextTrail)];
    });
  }

  const orderedRows = visit("");
  return orderedRows.concat(
    categoryRows.filter((row) => !visitedIds.has(row.id))
  );
}

export function createCategoryTreeOption(row) {
  return {
    value: row.name,
    label: row.name,
    indentLevel: Math.max(
      0,
      getCategoryHierarchyDepth(row.hierarchyPath || row.name) - 1
    ),
  };
}

export function buildCategoryParentOptions(
  categoryRows = [],
  {
    excludeId = null,
    blockedPaths = [],
    maxDepth = MAX_CATEGORY_NESTING_LEVEL,
    maxSubtreeDepth = 1,
  } = {}
) {
  const orderedRows = buildOrderedCategoryRows(categoryRows);

  return [
    {
      value: "None (Main Category)",
      label: "None (Main Category)",
    },
    ...orderedRows
      .filter((row) => {
        if (row.id === excludeId) return false;
        if (row.isDefault) return false;

        const path = row.hierarchyPath || row.name;
        const itemDepth = getCategoryHierarchyDepth(path);
        const isBlocked = blockedPaths.some(
          (blockedPath) =>
            path === blockedPath ||
            path.startsWith(`${blockedPath}${CATEGORY_HIERARCHY_SEPARATOR}`)
        );

        return !isBlocked && itemDepth + maxSubtreeDepth <= maxDepth;
      })
      .map(createCategoryTreeOption),
  ];
}

export function normalizeCatalogIdentityValue(value, fallback = "") {
  return String(value ?? fallback).trim().toLowerCase();
}

export function isDuplicateCatalogRecord(candidate, catalogRows = []) {
  const normalizedName = normalizeCatalogIdentityValue(candidate?.name);
  const normalizedUnit = normalizeCatalogIdentityValue(
    candidate?.unit,
    "Pcs"
  );
  const normalizedCategory = normalizeCatalogIdentityValue(
    candidate?.category,
    "Uncategorized"
  );

  if (!normalizedName || !normalizedUnit || !normalizedCategory) {
    return false;
  }

  return catalogRows.some(
    (row) =>
      row.id !== candidate?.id &&
      normalizeCatalogIdentityValue(row.name) === normalizedName &&
      normalizeCatalogIdentityValue(row.unit, "Pcs") === normalizedUnit &&
      normalizeCatalogIdentityValue(row.category, "Uncategorized") ===
      normalizedCategory
  );
}

export function buildCatalogCategoryOptions(categoryRows = [], catalogRows = []) {
  const orderedRows = buildOrderedCategoryRows(categoryRows);
  const nextOptions = [{ value: "Uncategorized", label: "Uncategorized" }];
  const seenValues = new Set(["uncategorized", "package"]);

  orderedRows.forEach((row) => {
    const normalizedName = normalizeDuplicateNameValue(row.name);
    if (seenValues.has(normalizedName)) return;

    nextOptions.push(createCategoryTreeOption(row));
    seenValues.add(normalizedName);
  });

  catalogRows.forEach((row) => {
    const categoryName = row.category || "Uncategorized";
    const normalizedCategoryName = normalizeDuplicateNameValue(categoryName);

    if (!categoryName || seenValues.has(normalizedCategoryName)) {
      return;
    }

    seenValues.add(normalizedCategoryName);
    nextOptions.push({
      value: categoryName,
      label: categoryName,
    });
  });

  return nextOptions;
}

export function buildModifierCatalogGroups(categoryRows = [], catalogRows = []) {
  const orderedCategoryRows = buildOrderedCategoryRows(categoryRows);
  const catalogsByCategory = new Map();

  catalogRows.forEach((row) => {
    const categoryName = row.category || "Uncategorized";
    if (!catalogsByCategory.has(categoryName)) {
      catalogsByCategory.set(categoryName, []);
    }
    catalogsByCategory.get(categoryName).push(row);
  });

  const groups = [];
  const usedCategories = new Set();

  orderedCategoryRows.forEach((row) => {
    const normalizedName = normalizeDuplicateNameValue(row.name);
    if (normalizedName === "uncategorized" || normalizedName === "package" || usedCategories.has(normalizedName)) {
      return;
    }

    const groupItems = catalogsByCategory.get(row.name) ?? [];
    if (!groupItems.length) {
      return;
    }

    const groupIndentLevel = Math.max(
      0,
      getCategoryHierarchyDepth(row.hierarchyPath || row.name) - 1
    );

    groups.push({
      id: row.id,
      label: row.name,
      indentLevel: groupIndentLevel,
      items: groupItems.map((item) => ({
        id: item.id,
        label: item.name,
        value: item.name,
        indentLevel: groupIndentLevel + 1,
      })),
    });
    usedCategories.add(normalizedName);
  });

  const packageItems = catalogsByCategory.get("Package");
  if (packageItems?.length) {
    groups.unshift({
      id: "Package",
      label: "Package",
      indentLevel: 0,
      items: packageItems.map((item) => ({
        id: item.id,
        label: item.name,
        value: item.name,
        indentLevel: 1,
      })),
    });
    usedCategories.add("package");
  }

  if (catalogsByCategory.has("Uncategorized")) {
    const insertIndex = usedCategories.has("package") ? 1 : 0;
    groups.splice(insertIndex, 0, {
      id: "Uncategorized",
      label: "Uncategorized",
      indentLevel: 0,
      items: catalogsByCategory.get("Uncategorized").map((row) => ({
        id: row.id,
        label: row.name,
        value: row.name,
        indentLevel: 1,
      })),
    });
  }

  catalogsByCategory.forEach((groupItems, categoryName) => {
    if (categoryName === "Uncategorized") {
      return;
    }
    const normalizedCategoryName = normalizeDuplicateNameValue(categoryName);
    if (usedCategories.has(normalizedCategoryName)) {
      return;
    }

    groups.push({
      id: categoryName,
      label: categoryName,
      indentLevel: 0,
      items: groupItems.map((item) => ({
        id: item.id,
        label: item.name,
        value: item.name,
        indentLevel: 1,
      })),
    });
  });

  return groups;
}

export function getCategoryHierarchyPath(
  categoryName,
  categoryMap,
  trail = new Set()
) {
  if (!categoryName) return "";
  if (trail.has(categoryName)) return categoryName;

  const category = categoryMap.get(categoryName);
  if (!category) return categoryName;

  const parentCategory = category.parentCategory || "";
  if (!parentCategory) return category.name;

  const nextTrail = new Set(trail);
  nextTrail.add(categoryName);
  const parentPath = getCategoryHierarchyPath(
    parentCategory,
    categoryMap,
    nextTrail
  );

  return parentPath
    ? `${parentPath}${CATEGORY_HIERARCHY_SEPARATOR}${category.name}`
    : category.name;
}

export function buildCategoryRows(categories = [], catalogRows = []) {
  const categoryMap = new Map(
    categories.map((row) => [
      row.name,
      {
        ...row,
        parentCategory: row.parentCategory || "",
      },
    ])
  );

  return categories.map((row) => {
    const hierarchyPath = getCategoryHierarchyPath(row.name, categoryMap);
    const connectedCatalogNames = catalogRows
      .filter((catalog) => (catalog.category || "Uncategorized") === row.name)
      .map((catalog) => catalog.name);

    return {
      ...row,
      parentCategory: row.parentCategory || "",
      hierarchyPath,
      hierarchyDisplay: row.parentCategory ? hierarchyPath : "Main Category",
      connectedCatalogDisplay: connectedCatalogNames.length
        ? connectedCatalogNames.join(", ")
        : "-",
      connectedCatalogSearch: connectedCatalogNames.join(" "),
    };
  });
}

export function buildModifierRows(modifiers = [], modifierDetailDraft = null, handleModifierListAvailabilityToggle) {
  return modifiers.map((row) => {
    const optionNames = Array.isArray(row.options)
      ? row.options
        .map((option) => option?.name?.trim?.() ?? "")
        .filter(Boolean)
      : [];
    const connectedCatalogNames = Array.isArray(row.connectedCatalogItems)
      ? row.connectedCatalogItems.filter(Boolean)
      : [];
    const availabilityValue =
      modifierDetailDraft?.id === row.id
        ? modifierDetailDraft.availability
        : row.availability;

    return {
      ...row,
      modifierOptionsDisplay: optionNames.length
        ? optionNames.join(", ")
        : row.modifierOptions || "-",
      modifierOptionsSearch: optionNames.join(" "),
      connectedCatalogDisplay: connectedCatalogNames.length
        ? connectedCatalogNames.join(", ")
        : row.connectedCatalog || "-",
      connectedCatalogSearch: connectedCatalogNames.join(" "),
      availability: (
        <div
          className="modifier-table-availability-cell"
          onClick={(event) => {
            event.stopPropagation();
            handleModifierListAvailabilityToggle(row.id);
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Toggle
            checked={availabilityValue !== false}
            ariaLabel={`Modifier availability for ${row.name}`}
          />
        </div>
      ),
    };
  });
}

export function buildUnitRows(units = [], catalogRows = []) {
  return units.map((row) => {
    const connectedCatalogNames = catalogRows
      .filter((catalog) => (catalog.unit || "Pcs") === row.name)
      .map((catalog) => catalog.name);
    const connectedCatalogCount = connectedCatalogNames.length;

    return {
      ...row,
      precisionDisplay: normalizeUnitPrecisionOption(row.precision),
      connectedCatalogDisplay: connectedCatalogNames.length
        ? connectedCatalogNames.join(", ")
        : "-",
      connectedCatalogSearch: connectedCatalogNames.join(" "),
    };
  });
}

export function buildAssignedUnitRows(units = []) {
  const rows = [];
  let currentGroup = "";

  units.forEach((unit) => {
    if (unit.group && unit.group !== currentGroup) {
      rows.push({
        type: "group",
        id: `unit-group-${unit.group}`,
        label: unit.group,
      });
      currentGroup = unit.group;
    }

    rows.push({ type: "unit", ...unit });
  });

  return rows;
}

export function buildCatalogAssignedUnitRows(units = []) {
  return normalizeCatalogAssignedUnits(units).map((unit) => ({
    type: "unit",
    ...unit,
    subtitle:
      unit.subtitle ?? (unit.group && unit.group !== unit.name ? unit.group : ""),
  }));
}

