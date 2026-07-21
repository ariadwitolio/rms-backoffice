import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { LabButton } from "../ui/Primitives.jsx";
import { Icon, ChevronIcon } from "../icons/Icon.jsx";
import { getModifierCatalogSelectSummary } from "../../utils/catalogBuildUtils.js";

export function ModifierCatalogModalField({
  label,
  value,
  groups,
  onClick,
  required = false,
  placeholder = "Select Catalog",
  error = false,
  ellipsis = false,
}) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error
        ? "Field cannot be empty"
        : "";
  const hasError = Boolean(errorMessage);
  const displayValue = getModifierCatalogSelectSummary(value, groups, placeholder);

  return (
    <div className="catalog-detail-field">
      <span className="catalog-detail-field__label type-body">
        {required ? (
          <span className="catalog-detail-field__required">*</span>
        ) : null}
        {label}
      </span>
      <span
        className={`catalog-detail-field__shell${hasError ? " is-error" : ""}`}
      >
        <button
          type="button"
          className="catalog-detail-field__trigger"
          onClick={onClick}
        >
          <p
            className={`catalog-detail-field__value type-subtitle-1${Array.isArray(value) && value.length ? "" : " text-tertiary"}${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}
          >
            {displayValue}
          </p>
          <span className="catalog-detail-field__chevron">
            <ChevronIcon name="selectChevron" size={24} direction="right" />
          </span>
        </button>
      </span>
      {hasError ? (
        <p className="catalog-detail-field__error type-body">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

const MAX_CATALOG_SELECTION = 10;

export function ModifierCatalogSelectionModal({
  open,
  title = "Connect to Catalog",
  descriptionCopy = "Select catalog(s) to connect to this modifier.",
  value,
  groups,
  onChange,
  onClose,
  onConfirm,
}) {
  const [searchValue, setSearchValue] = useState("");
  const normalizedValue = Array.isArray(value) ? value : [];
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredGroups = normalizedSearch
    ? groups
      .map((group) => {
        const matchesGroupLabel = group.label
          .toLowerCase()
          .includes(normalizedSearch);
        const filteredItems = (group.items ?? []).filter((item) =>
          item.label.toLowerCase().includes(normalizedSearch)
        );
        if (matchesGroupLabel) {
          return group;
        }
        if (filteredItems.length) {
          return { ...group, items: filteredItems };
        }
        return null;
      })
      .filter(Boolean)
    : groups;
  const allItems = filteredGroups.flatMap((group) => group.items ?? []);
  const selectableItemValues = allItems
    .filter((item) => !item.routedGroupName)
    .map((item) => item.value);
  const isAllSelected =
    selectableItemValues.length > 0 &&
    selectableItemValues.every((item) => normalizedValue.includes(item));
  const isAtLimit = normalizedValue.length >= MAX_CATALOG_SELECTION;

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  function toggleItem(option) {
    const isSelected = normalizedValue.includes(option);
    onChange(
      isSelected
        ? normalizedValue.filter((item) => item !== option)
        : [...normalizedValue, option]
    );
  }

  function toggleAllItems() {
    onChange(isAllSelected ? [] : selectableItemValues);
  }

  function toggleGroup(group) {
    const selectableGroupValues = group.items
      .filter((item) => !item.routedGroupName)
      .map((item) => item.value);
    const allSelected =
      selectableGroupValues.length > 0 &&
      selectableGroupValues.every((item) => normalizedValue.includes(item));

    if (allSelected) {
      onChange(
        normalizedValue.filter((item) => !selectableGroupValues.includes(item))
      );
      return;
    }

    onChange(Array.from(new Set([...normalizedValue, ...selectableGroupValues])));
  }

  return (
    <div className="unit-assignment-modal-overlay" onMouseDown={onClose}>
      <div
        className="unit-assignment-modal modifier-catalog-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modifier-catalog-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="unit-assignment-modal__close-row">
          <button
            type="button"
            className="unit-assignment-modal__close"
            onClick={onClose}
            aria-label="Close catalog selection"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="unit-assignment-modal__header">
          <p
            id="modifier-catalog-modal-title"
            className="unit-assignment-modal__title type-title-1"
          >
            {title}
          </p>
          <p className="unit-assignment-modal__copy type-body-bold">
            {descriptionCopy}
          </p>
        </div>
        <div className="unit-assignment-modal__search modifier-catalog-modal__search">
          <Icon name="search" className="lab-icon lab-icon--20" alt="Search" />
          <input
            type="search"
            value={searchValue}
            placeholder="Search catalog"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
        <div className="unit-assignment-modal__body">
          <div className="modifier-catalog-modal__list">
            {isAtLimit && (
              <div
                className="modifier-catalog-modal__limit-banner"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  background: "var(--status-blue-surface, #EBF3FF)",
                  borderBottom: "1px solid var(--status-blue-line, #C0D9FA)",
                }}
              >
                <Icon name="infoBlue" className="lab-icon lab-icon--16" alt="" />
                <p className="type-body" style={{ color: "var(--status-blue-primary, #1D6FD8)" }}>
                  Maximum {MAX_CATALOG_SELECTION} catalogs selected. Deselect one to choose another.
                </p>
              </div>
            )}
            {filteredGroups.length ? (
              <>
                <button
                  type="button"
                  className={`modifier-catalog-select__all${isAllSelected ? " is-selected" : ""
                    }`}
                  disabled={isAtLimit && !isAllSelected}
                  onClick={toggleAllItems}
                >
                  <span
                    className={`catalog-detail-field__option-indicator${isAllSelected ? " is-selected" : ""
                      }`}
                    aria-hidden="true"
                  />
                  <p className="modifier-catalog-select__all-label type-title-3">
                    All Catalog
                  </p>
                </button>
                {filteredGroups.map((group) => {
                  const selectableGroupValues = group.items
                    .filter((item) => !item.routedGroupName)
                    .map((item) => item.value);
                  const selectedCount = selectableGroupValues.filter((item) =>
                    normalizedValue.includes(item)
                  ).length;
                  const indicatorClassName =
                    selectableGroupValues.length > 0 &&
                      selectedCount === selectableGroupValues.length
                      ? " is-selected"
                      : selectedCount > 0
                        ? " is-partial"
                        : "";
                  const isGroupDisabled =
                    selectableGroupValues.length === 0 ||
                    (isAtLimit && selectedCount < selectableGroupValues.length);

                  return (
                    <div
                      key={group.id}
                      className="modifier-catalog-select__group"
                    >
                      <button
                        type="button"
                        className="modifier-catalog-select__group-header"
                        style={
                          group.indentLevel
                            ? {
                              paddingLeft: `${16 + group.indentLevel * 20}px`,
                            }
                            : undefined
                        }
                        disabled={isGroupDisabled}
                        onClick={() => toggleGroup(group)}
                      >
                        <span
                          className={`catalog-detail-field__option-indicator${indicatorClassName}`}
                          aria-hidden="true"
                        />
                        <p className="modifier-catalog-select__group-title type-title-3">
                          {group.label}
                        </p>
                      </button>
                      {group.items.map((item) => {
                        const isSelected = normalizedValue.includes(item.value);
                        const isAtCatalogLimit = Boolean(item.atModifierLimit) && !isSelected;
                        const isRouted = Boolean(item.routedGroupName) && !isSelected;
                        const isItemDisabled = (isAtLimit && !isSelected) || isAtCatalogLimit || isRouted;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`modifier-catalog-select__item${isSelected ? " is-selected" : ""}${isAtCatalogLimit ? " is-at-limit" : ""}${isRouted ? " is-routed" : ""}`}
                            style={{
                              paddingLeft: `${16 + (item.indentLevel ?? group.indentLevel + 1) * 20}px`,
                            }}
                            disabled={isItemDisabled}
                            onClick={() => toggleItem(item.value)}
                          >
                            <span
                              className={`catalog-detail-field__option-indicator${isSelected ? " is-selected" : ""
                                }`}
                              aria-hidden="true"
                            />
                            <div className="modifier-catalog-select__item-text">
                              <p className="modifier-catalog-select__item-label type-subtitle-2">
                                {item.label}
                              </p>
                              {isAtCatalogLimit ? (
                                <p className="modifier-catalog-select__item-note type-body">
                                  Already has 15 modifiers
                                </p>
                              ) : isRouted ? (
                                <p className="modifier-catalog-select__item-note type-body">
                                  Routed to {item.routedGroupName}
                                </p>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="modifier-catalog-select__empty type-subtitle-2">
                No catalog available
              </p>
            )}
          </div>
        </div>
        <div className="unit-assignment-modal__footer">
          <div
            className="modifier-catalog-modal__footer-actions"
            style={{ display: "flex", gap: "12px", width: "100%" }}
          >
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={onConfirm}
            >
              <span className="type-subtitle-2">Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

