import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronIcon, Icon } from "../icons/Icon.jsx";

const MAX_MODIFIER = 15;

export function CatalogModifierField({
  label,
  value = [],
  onClick,
  placeholder = "Select Modifier",
  required = false,
  error = false,
  ellipsis = false,
}) {
  const errorMessage =
    typeof error === "string" ? error : error ? "Field cannot be empty" : "";
  const hasError = Boolean(errorMessage);
  const normalized = Array.isArray(value) ? value.filter(Boolean) : [];
  const displayValue =
    normalized.length === 0
      ? placeholder
      : normalized.length === 1
        ? normalized[0]
        : `${normalized.length} Modifiers Selected`;

  return (
    <div className="catalog-detail-field">
      <span className="catalog-detail-field__label type-body">
        {required ? (
          <span className="catalog-detail-field__required">*</span>
        ) : null}
        {label}
      </span>
      <span className={`catalog-detail-field__shell${hasError ? " is-error" : ""}`}>
        <button
          type="button"
          className="catalog-detail-field__trigger"
          onClick={onClick}
        >
          <p
            className={`catalog-detail-field__value type-subtitle-1${normalized.length ? "" : " text-tertiary"}${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}
          >
            {displayValue}
          </p>
          <span className="catalog-detail-field__chevron">
            <ChevronIcon name="selectChevron" size={24} direction="right" />
          </span>
        </button>
      </span>
      {hasError ? (
        <p className="catalog-detail-field__error type-body">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function CatalogModifierModalInner({ open, value, options, onChange, onClose }) {
  const [draft, setDraft] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(Array.isArray(value) ? value.filter(Boolean) : []);
      setSearch("");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = normalizedSearch
    ? options.filter((opt) => {
        const label = typeof opt === "string" ? opt : (opt.label ?? opt.value ?? "");
        return label.toLowerCase().includes(normalizedSearch);
      })
    : options;

  const isAtLimit = draft.length >= MAX_MODIFIER;

  function toggle(optValue) {
    setDraft((prev) =>
      prev.includes(optValue)
        ? prev.filter((v) => v !== optValue)
        : isAtLimit
          ? prev
          : [...prev, optValue]
    );
  }

  function handleApply() {
    onChange(draft);
    onClose();
  }

  const content = (
    <div className="unit-assignment-modal-overlay" onMouseDown={onClose}>
      <div
        className="unit-assignment-modal catalog-modifier-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-modifier-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="unit-assignment-modal__close-row">
          <button
            type="button"
            className="unit-assignment-modal__close"
            onClick={onClose}
            aria-label="Close modifier selection"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="unit-assignment-modal__header">
          <p
            id="catalog-modifier-modal-title"
            className="unit-assignment-modal__title type-title-1"
          >
            Connect Modifier
          </p>
          <p className="unit-assignment-modal__copy type-body-bold">
            Select modifier(s) to connect to this catalog.
          </p>
        </div>
        <div className="unit-assignment-modal__search modifier-catalog-modal__search">
          <Icon name="search" className="lab-icon lab-icon--20" alt="Search" />
          <input
            type="search"
            value={search}
            placeholder="Search modifier"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="catalog-modifier-modal__infobox">
          <Icon name="infoBlue" className="lab-icon lab-icon--16" alt="" />
          <p className="type-body">
            You can connect up to {MAX_MODIFIER} modifiers to a catalog.
          </p>
        </div>
        <div className="unit-assignment-modal__body catalog-modifier-modal__body">
          {filteredOptions.length ? (
            <div className="catalog-modifier-modal__grid">
              {filteredOptions.map((opt) => {
                const optLabel =
                  typeof opt === "string" ? opt : (opt.label ?? opt.value ?? "");
                const optValue =
                  typeof opt === "string" ? opt : (opt.value ?? opt.label ?? "");
                const optSubtitle =
                  typeof opt === "object" && opt.subtitle ? opt.subtitle : null;
                const isSelected = draft.includes(optValue);
                const isDisabled = isAtLimit && !isSelected;

                return (
                  <button
                    key={optValue}
                    type="button"
                    className={`catalog-modifier-modal__option${isSelected ? " is-selected" : ""}${isDisabled ? " is-disabled" : ""}`}
                    disabled={isDisabled}
                    onClick={() => toggle(optValue)}
                  >
                    <span
                      className={`catalog-detail-field__option-indicator${isSelected ? " is-selected" : ""}`}
                      aria-hidden="true"
                    />
                    <div className="catalog-modifier-modal__option-text">
                      <p className="type-subtitle-2 catalog-modifier-modal__option-title">{optLabel}</p>
                      {optSubtitle ? (
                        <p className="type-body text-secondary catalog-modifier-modal__option-subtitle">{optSubtitle}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="modifier-catalog-select__empty type-subtitle-2">
              No modifier available
            </p>
          )}
        </div>
        <div className="unit-assignment-modal__footer">
          <div className="catalog-modifier-modal__footer">
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--secondary"
              onClick={onClose}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              onClick={handleApply}
            >
              <span className="type-subtitle-2">
                Apply{draft.length > 0 ? ` · ${draft.length} Selected` : ""}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}

export function CatalogModifierFieldWithModal({
  label,
  value = [],
  options = [],
  onChange,
  placeholder = "Select Modifier",
  required = false,
  error = false,
  ellipsis = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <CatalogModifierField
        label={label}
        value={value}
        onClick={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        error={error}
        ellipsis={ellipsis}
      />
      <CatalogModifierModalInner
        open={isOpen}
        value={value}
        options={options}
        onChange={onChange}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
