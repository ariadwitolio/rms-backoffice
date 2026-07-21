import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Field, LabButton, LabCheckbox } from "../ui/Primitives.jsx";
import { normalizeModifierIngredientQtyInput, isModifierOptionIngredientQtyValid } from "../../utils/modifierUtils.js";
import { createPortal } from "react-dom";
import { Icon, ChevronIcon } from "../icons/Icon.jsx";
import { formatNominalInput, getNormalizedNominalDigits } from "./ModifierOptionsTable.jsx";

export function ModifierCreateNameField({
  value,
  onChange,
  error = false,
  maxLength = 40,
  ellipsis = false,
}) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error
        ? "Field cannot be empty"
        : "";
  const hasError = Boolean(errorMessage);
  return (
    <label className="modifier-create-field">
      <span className="modifier-create-field__label-row modifier-create-field__label-row--has-counter">
        <span className="modifier-create-field__label">
          <span className="catalog-detail-field__required">*</span>
          <p className="type-body">Modifier Name</p>
        </span>
        <p className="modifier-create-field__counter type-body">
          {value.length}/{maxLength}
        </p>
      </span>
      <span
        className={`catalog-detail-field__shell${hasError ? " is-error" : ""}`}
      >
        <input
          className={`type-subtitle-1${value ? "" : " text-tertiary"}${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}

          type="text"
          value={value}
          placeholder="Enter Modifier Name"
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
        />
      </span>
      {hasError ? (
        <p className="catalog-detail-field__error type-body">
          {errorMessage}
        </p>
      ) : null}
    </label>
  );
}

export function ModifierCreateNumberField({ label, value, onChange, helper }) {
  return (
    <label className="modifier-create-field">
      <span className="modifier-create-field__label-row">
        <span className="modifier-create-field__label">
          <p className="type-body">{label}</p>
        </span>
      </span>
      <span className="catalog-detail-field__shell">
        <input
          className={`type-subtitle-1${value ? "" : " text-tertiary"}`}
          type="text"
          inputMode="numeric"
          value={value}
          placeholder="0"
          onChange={(event) =>
            onChange(event.target.value.replace(/[^\d]/g, ""))
          }
        />
      </span>
      <p className="modifier-create-field__helper type-body">{helper}</p>
    </label>
  );
}

export function ModifierReorderHandle({
  onDragStart,
  onDragEnd,
  ariaLabel,
  disabled = false,
}) {
  if (disabled) {
    return (
      <span
        className="modifier-option-table__handle modifier-option-table__handle--static"
        aria-hidden="true"
      >
        <Icon
          name="modifierReorder"
          className="lab-icon lab-icon--20"
          color="var(--neutral-on-surface-tertiary)"
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      className="modifier-option-table__handle"
      draggable
      onDragStart={(e) => {
        const tr = e.currentTarget.closest("tr");
        if (tr) {
          e.dataTransfer.setDragImage(tr, 0, 0);
        }
        if (onDragStart) onDragStart(e);
      }}
      onDragEnd={onDragEnd}
      aria-label={ariaLabel}
    >
      <Icon
        name="modifierReorder"
        className="lab-icon lab-icon--20"
        color="var(--neutral-on-surface-tertiary)"
      />
    </button>
  );
}

export function ModifierOptionPriceField({ value, onChange }) {
  const displayValue = formatNominalInput(value);

  return (
    <label className="modifier-option-table__field-shell">
      <span className="modifier-option-table__price-prefix type-subtitle-2">
        IDR
      </span>
      <input
        className={`modifier-option-table__price-input type-subtitle-2${displayValue ? "" : " text-tertiary"
          }`}
        type="text"
        inputMode="numeric"
        value={displayValue}
        placeholder="0"
        onChange={(event) =>
          onChange(getNormalizedNominalDigits(event.target.value))
        }
      />
    </label>
  );
}

export function PackageItemSelectField({
  value,
  options,
  onChange,
  placeholder = "Select Catalog",
  disabled = false,
  allowClear = false,
  clearLabel = "Clear selection",
  emptyCopy = "No catalog item available",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const displayValue = value || placeholder;
  const showSearch = options.length > 5;
  const filteredOptions = showSearch
    ? options.filter((option) =>
      option.toLowerCase().includes(search.trim().toLowerCase())
    )
    : options;

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
      setSearch("");
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
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
      const naturalHeight = Math.min(menu?.scrollHeight ?? 252, 252);
      const availableBelow = viewportHeight - rect.bottom - gutter;
      const availableAbove = rect.top - gutter;
      const shouldOpenUpward =
        availableBelow < Math.min(naturalHeight, 180) &&
        availableAbove > availableBelow;
      const maxHeight = Math.max(
        120,
        Math.min(
          252,
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
  }, [isOpen, options, filteredOptions.length]);

  return (
    <div
      ref={rootRef}
      className={`catalog-package-field__select${isOpen ? " is-open" : ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="catalog-package-field__trigger"
        disabled={disabled}
        aria-expanded={isOpen}
        onClick={() => {
          if (disabled) return;
          setIsOpen((previous) => !previous);
          setSearch("");
        }}
      >
        <p
          className={`catalog-package-field__trigger-label type-subtitle-2${value ? "" : " text-tertiary"
            }`}
        >
          {displayValue}
        </p>
        <ChevronIcon
          name="selectChevron"
          size={24}
          direction={isOpen ? "up" : "down"}
        />
      </button>
      {isOpen && menuStyle
        ? createPortal(
          <div
            ref={menuRef}
            className="catalog-package-field__menu"
            data-catalog-detail-editor="true"
            style={menuStyle}
          >
            {showSearch ? (
              <div className="catalog-package-field__search-wrap">
                <label className="catalog-package-field__search">
                  <Icon
                    name="search"
                    className="lab-icon lab-icon--18"
                    alt="Search"
                  />
                  <input
                    type="search"
                    className="type-body"
                    placeholder="Search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>
            ) : null}
            {!options.length ? (
              <p className="catalog-package-field__empty type-subtitle-2">
                {emptyCopy}
              </p>
            ) : showSearch && !filteredOptions.length ? (
              <p className="catalog-package-field__empty type-subtitle-2">
                No options found
              </p>
            ) : (
              [
                ...(allowClear
                  ? [
                    {
                      value: "",
                      label: clearLabel,
                    },
                  ]
                  : []),
                ...filteredOptions.map((option) => ({
                  value: option,
                  label: option,
                })),
              ].map(({ value: optionValue, label: optionLabel }, index, items) => {
                const isSelected = optionValue === value;
                const isLast = index === items.length - 1;

                return (
                  <button
                    key={`${optionLabel}-${index}`}
                    type="button"
                    className="catalog-package-field__option"
                    onClick={() => {
                      onChange(optionValue);
                      setIsOpen(false);
                    }}
                  >
                    <span className="catalog-package-field__option-inner">
                      <p
                        className={`catalog-package-field__option-label ${isSelected ? "type-title-3" : "type-subtitle-2"
                          }`}
                      >
                        {optionLabel}
                      </p>
                      {isSelected ? (
                        <span
                          className="catalog-detail-field__option-check"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    {!isLast ? (
                      <span
                        className="catalog-package-field__option-separator"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )
        : null}
    </div>
  );
}

export function ModifierOptionQtyField({
  value,
  unitLabel = "",
  disabled = false,
  error = false,
  onChange,
}) {
  return (
    <div className="modifier-option-table__field-stack">
      <label
        className={`modifier-option-table__field-shell modifier-option-table__field-shell--qty${error ? " is-error" : ""}${disabled ? " is-disabled" : ""}`}
      >
        <input
          className={`modifier-option-table__qty-input type-subtitle-2${value ? "" : " text-tertiary"}`}
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={disabled ? "" : value}
          placeholder="0"
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
        />
        {unitLabel ? (
          <span className="modifier-option-table__qty-unit type-subtitle-2">
            {unitLabel}
          </span>
        ) : null}
      </label>
      {error ? (
        <p className="modifier-option-table__field-error type-body">
          Qty must be greater than 0
        </p>
      ) : null}
    </div>
  );
}

