import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Field, LabButton, SelectShell } from "../ui/Primitives.jsx";
import { getModifierIngredientSelection, normalizeModifierIngredientQtyInput, formatModifierIngredientUnitLabel } from "../../utils/modifierUtils.js";
import { createPortal } from "react-dom";
import { ChevronIcon } from "../icons/Icon.jsx";
import { getModifierCatalogSelectSummary } from "../../utils/catalogBuildUtils.js";

export function ModifierCatalogSelectField({
  label,
  value,
  groups,
  onChange,
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
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const normalizedValue = Array.isArray(value) ? value : [];
  const allItems = groups.flatMap((group) => group.items);
  const totalItems = allItems.length;
  const allItemValues = allItems.map((item) => item.value);
  const isAllSelected = totalItems > 0 && normalizedValue.length === totalItems;
  const displayValue = getModifierCatalogSelectSummary(
    normalizedValue,
    groups,
    placeholder
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const menu = menuRef.current;
      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gutter = 8;
      const spacing = 8;
      const width = Math.min(rect.width, viewportWidth - gutter * 2);
      const naturalHeight = Math.min(menu?.scrollHeight ?? 320, 320);
      const availableBelow = viewportHeight - rect.bottom - gutter;
      const availableAbove = rect.top - gutter;
      const shouldOpenUpward =
        availableBelow < Math.min(naturalHeight, 180) &&
        availableAbove > availableBelow;
      const maxHeight = Math.max(
        140,
        Math.min(
          320,
          shouldOpenUpward ? availableAbove - spacing : availableBelow - spacing
        )
      );
      const resolvedHeight = Math.min(naturalHeight, maxHeight);
      const left = Math.min(
        Math.max(gutter, rect.left),
        viewportWidth - width - gutter
      );
      const top = shouldOpenUpward
        ? Math.max(gutter, rect.top - resolvedHeight - spacing)
        : Math.min(
          rect.bottom + spacing,
          viewportHeight - resolvedHeight - gutter
        );

      setMenuStyle({
        left,
        maxHeight,
        top,
        width,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [groups, isOpen, normalizedValue]);

  function toggleItem(option) {
    const isSelected = normalizedValue.includes(option);
    onChange(
      isSelected
        ? normalizedValue.filter((item) => item !== option)
        : [...normalizedValue, option]
    );
  }

  function toggleAllItems() {
    onChange(isAllSelected ? [] : allItemValues);
  }

  function toggleGroup(group) {
    const groupValues = group.items.map((item) => item.value);
    const allSelected = groupValues.every((item) =>
      normalizedValue.includes(item)
    );

    if (allSelected) {
      onChange(normalizedValue.filter((item) => !groupValues.includes(item)));
      return;
    }

    onChange(Array.from(new Set([...normalizedValue, ...groupValues])));
  }

  return (
    <div ref={rootRef} className="catalog-detail-field">
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
          ref={triggerRef}
          type="button"
          className="catalog-detail-field__trigger"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <p
            className={`catalog-detail-field__value type-subtitle-1${normalizedValue.length ? "" : " text-tertiary"}${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}
          >
            {displayValue}
          </p>

          <span className="catalog-detail-field__chevron">
            <ChevronIcon
              name="selectChevron"
              size={24}
              direction={isOpen ? "up" : "down"}
            />
          </span>
        </button>
      </span>
      {isOpen && menuStyle
        ? createPortal(
          <div
            ref={menuRef}
            className="modifier-catalog-select__menu"
            style={menuStyle}
          >
            {groups.length ? (
              <>
                <button
                  type="button"
                  className={`modifier-catalog-select__all${isAllSelected ? " is-selected" : ""
                    }`}
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
                {groups.map((group) => {
                  const groupValues = group.items.map((item) => item.value);
                  const selectedCount = groupValues.filter((item) =>
                    normalizedValue.includes(item)
                  ).length;
                  const indicatorClassName =
                    selectedCount === groupValues.length
                      ? " is-selected"
                      : selectedCount > 0
                        ? " is-partial"
                        : "";

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
                        const isSelected = normalizedValue.includes(
                          item.value
                        );

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`modifier-catalog-select__item${isSelected ? " is-selected" : ""
                              }`}
                            style={{
                              paddingLeft: `${16 + (item.indentLevel ?? group.indentLevel + 1) * 20}px`,
                            }}
                            onClick={() => toggleItem(item.value)}
                          >
                            <span
                              className={`catalog-detail-field__option-indicator${isSelected ? " is-selected" : ""
                                }`}
                              aria-hidden="true"
                            />
                            <p className="modifier-catalog-select__item-label type-subtitle-2">
                              {item.label}
                            </p>
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
          </div>,
          document.body
        )
        : null}
      {hasError ? (
        <p className="catalog-detail-field__error type-body">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

