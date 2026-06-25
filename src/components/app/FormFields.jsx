import { useState, useRef, useEffect } from "react";
import { Field, LabButton, SelectShell } from "../ui/Primitives.jsx";
import { ALL_SELLING_TIME_DAY_LABELS, SELLING_TIME_DAY_OPTIONS } from "../../constants/catalog.js";
import { getSellingTimeSlotErrorKey, cloneSellingTimeSlots } from "../../utils/catalogDraftUtils.js";
import { Icon, ChevronIcon } from "../icons/Icon.jsx";

export function DetailField({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  type = "text",
  min,
  step,
  inputMode,
  error,
  autoFocus = false,
  disabled = false,
  ellipsis = false,
  valueColor = null,
  maxLength,
}) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error
        ? "Field cannot be empty"
        : "";
  const hasError = Boolean(errorMessage);
  const charCount = maxLength ? String(value ?? "").length : null;

  return (
    <label className={`catalog-detail-field${disabled ? " is-disabled" : ""}`}>
      <span className={`catalog-detail-field__label type-body${maxLength ? " catalog-detail-field__label--has-counter" : ""}`}>
        <span className="catalog-detail-field__label-text">
          {required ? (
            <span className="catalog-detail-field__required">*</span>
          ) : null}
          {label}
        </span>
        {maxLength ? (
          <span className="catalog-detail-field__char-counter type-body">
            {charCount}/{maxLength}
          </span>
        ) : null}
      </span>
      <span
        className={`catalog-detail-field__shell${hasError ? " is-error" : ""}${disabled ? " is-disabled" : ""}`}
      >
        <input
          className={`type-subtitle-1${value ? "" : " text-tertiary"}${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}
          type={type}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(event) => onChange?.(maxLength ? event.target.value.slice(0, maxLength) : event.target.value)}
          maxLength={maxLength}
          min={min}
          step={step}
          inputMode={inputMode}
          disabled={disabled}
          style={valueColor ? { color: valueColor } : undefined}
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


export function DetailTextAreaField({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  error = false,
  rows = 3,
  disabled = false,
  maxLength,
}) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error
        ? "Field cannot be empty"
        : "";
  const hasError = Boolean(errorMessage);
  const charCount = maxLength ? String(value ?? "").length : null;

  return (
    <label className={`catalog-detail-field${disabled ? " is-disabled" : ""}`}>
      <span className={`catalog-detail-field__label type-body${maxLength ? " catalog-detail-field__label--has-counter" : ""}`}>
        <span className="catalog-detail-field__label-text">
          {required ? (
            <span className="catalog-detail-field__required">*</span>
          ) : null}
          {label}
        </span>
        {maxLength ? (
          <span className="catalog-detail-field__char-counter type-body">
            {charCount}/{maxLength}
          </span>
        ) : null}
      </span>
      <span
        className={`catalog-detail-field__shell catalog-detail-field__shell--multiline${hasError ? " is-error" : ""}${disabled ? " is-disabled" : ""}`}
      >
        <textarea
          className={`catalog-detail-field__textarea type-subtitle-1${value ? "" : " text-tertiary"}`}
          value={value}
          rows={rows}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => onChange?.(maxLength ? event.target.value.slice(0, maxLength) : event.target.value)}
          disabled={disabled}
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

export function DetailNumberUnitField({
  label,
  value,
  onChange,
  placeholder = "0",
  suffix = "Minutes",
  required = false,
  error = false,
  disabled = false,
}) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error
        ? "Field cannot be empty"
        : "";
  const hasError = Boolean(errorMessage);

  return (
    <label className={`catalog-detail-field${disabled ? " is-disabled" : ""}`}>
      <span className="catalog-detail-field__label type-body">
        {required ? (
          <span className="catalog-detail-field__required">*</span>
        ) : null}
        {label}
      </span>
      <span
        className={`catalog-detail-field__shell catalog-detail-field__shell--with-suffix${hasError ? " is-error" : ""}${disabled ? " is-disabled" : ""}`}
      >
        <input
          className={`type-subtitle-1${value ? "" : " text-tertiary"}`}
          type="text"
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange?.(String(event.target.value ?? "").replace(/[^\d]/g, ""))
          }
          disabled={disabled}
        />
        <span className="catalog-detail-field__suffix type-subtitle-2">
          {suffix}
        </span>
      </span>
      {hasError ? (
        <p className="catalog-detail-field__error type-body">
          {errorMessage}
        </p>
      ) : null}
    </label>
  );
}

export function CategoryColorPicker({ value, onChange }) {
  const colors = [
    "#F9EB9E", // Default
    "#D1C0F6",
    "#A5EEE6",
    "#F5BCBC",
    "#F6D3B8",
    "#CDE7C9",
    "#BFD4F2",
    "#F9C0DD",
    "#E0C9A6",
    "#B6BEEE",
  ];

  return (
    <div className="category-color-picker">
      <span className="catalog-detail-field__label type-body">Section Color</span>
      <div className="category-color-picker__list">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`category-color-picker__item${value === color ? " is-selected" : ""}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}


export function DetailSelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = "Select",
  error = false,
  multiple = false,
  multipleDisplay = "chips",
  multipleSummaryFormatter = null,
  ellipsis = false,
  disabled = false,
  hideChevron = false,
  valueColor = null,
  emptyCopy = "No options available",
}) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error
        ? "Field cannot be empty"
        : "";
  const hasError = Boolean(errorMessage);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option, subtitle: "", indentLevel: 0 }
      : {
        value: option.value ?? option.label ?? "",
        label: option.label ?? option.value ?? "",
        subtitle: option.subtitle ?? "",
        indentLevel: Math.max(0, Number(option.indentLevel ?? 0) || 0),
      }
  );
  const normalizedValue = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value;
  const isMultipleSummary = multiple && multipleDisplay === "summary";
  const getOptionLabel = (optionValue) =>
    normalizedOptions.find((option) => option.value === optionValue)?.label ??
    optionValue;

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
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

  const defaultDisplayValue = multiple
    ? normalizedValue.length === 1
      ? getOptionLabel(normalizedValue[0])
      : normalizedValue.length > 1
        ? `${normalizedValue.length} Selected`
        : placeholder
    : normalizedValue
      ? getOptionLabel(normalizedValue)
      : placeholder;
  const displayValue =
    multiple && typeof multipleSummaryFormatter === "function"
      ? multipleSummaryFormatter({
        selectedValues: normalizedValue,
        selectedLabels: normalizedValue.map(getOptionLabel),
        placeholder,
        defaultValue: defaultDisplayValue,
      }) ?? defaultDisplayValue
      : defaultDisplayValue;

  return (
    <div ref={rootRef} className={`catalog-detail-field${disabled ? " is-disabled" : ""}`}>
      <span className="catalog-detail-field__label type-body">
        {required ? (
          <span className="catalog-detail-field__required">*</span>
        ) : null}
        {label}
      </span>
      <span
        className={`catalog-detail-field__shell${hasError ? " is-error" : ""}${disabled ? " is-disabled" : ""}${multiple && !isMultipleSummary
          ? " catalog-detail-field__shell--multiline"
          : ""
          }`}
      >
        <button
          type="button"
          className={`catalog-detail-field__trigger${multiple && !isMultipleSummary
            ? " catalog-detail-field__trigger--multiline"
            : ""
            }`}
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={() => { if (!disabled) setIsOpen((previous) => !previous); }}
        >
          {multiple && !isMultipleSummary ? (
            <span className="catalog-detail-field__value-stack">
              {normalizedValue.length ? (
                normalizedValue.map((item) => (
                  <span key={item} className="catalog-detail-field__chip">
                    <p className="type-body">{item}</p>
                  </span>
                ))
              ) : (
                <p className="catalog-detail-field__placeholder type-subtitle-1 text-tertiary">
                  {placeholder}
                </p>
              )}
            </span>
          ) : (
            <p
              className={`catalog-detail-field__value type-subtitle-1${multiple
                ? normalizedValue.length
                  ? ""
                  : " text-tertiary"
                : normalizedValue
                  ? ""
                  : " text-tertiary"
                }${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}
              style={valueColor ? { color: valueColor } : undefined}
            >
              {displayValue}
            </p>

          )}
          {!hideChevron && (
            <span className="catalog-detail-field__chevron">
              <ChevronIcon
                name="selectChevron"
                size={24}
                direction={isOpen ? "up" : "down"}
              />
            </span>
          )}
        </button>
        {isOpen ? (
          <div className="catalog-detail-field__menu">
            {normalizedOptions.length === 0 ? (
              <p className="catalog-detail-field__empty type-subtitle-2">
                {emptyCopy}
              </p>
            ) : normalizedOptions.map((option) => {
              const isSelected = multiple
                ? normalizedValue.includes(option.value)
                : normalizedValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`catalog-detail-field__option${isSelected ? " is-selected" : ""
                    }${option.subtitle ? " has-subtitle" : ""}${multiple ? " is-multi" : ""
                    }`}
                  style={
                    option.indentLevel
                      ? {
                        paddingLeft: `${16 + option.indentLevel * 20}px`,
                      }
                      : undefined
                  }
                  onClick={() => {
                    if (multiple) {
                      onChange(
                        isSelected
                          ? normalizedValue.filter(
                            (item) => item !== option.value
                          )
                          : [...normalizedValue, option.value]
                      );
                      return;
                    }

                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {multiple ? (
                    <span
                      className={`catalog-detail-field__option-indicator${isSelected ? " is-selected" : ""
                        }`}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="catalog-detail-field__option-copy" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                    <p
                      className={`catalog-detail-field__option-label ${isSelected ? "type-title-3" : "type-subtitle-2"
                        }`}
                    >
                      {option.label}
                    </p>
                    {option.subtitle ? (
                      <p className="catalog-detail-field__option-subtitle type-body text-secondary">
                        {option.subtitle}
                      </p>
                    ) : null}
                  </span>
                  {!multiple && isSelected ? (
                    <span
                      className="catalog-detail-field__option-check"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </span>
      {hasError ? (
        <p className="catalog-detail-field__error type-body">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function SellingTimeNameField({ value, onChange, error = false }) {
  return (
    <label className="selling-time-name-field">
      <span className="selling-time-name-field__label-row">
        <span className="selling-time-name-field__label">
          <span className="catalog-detail-field__required">*</span>
          <p className="type-body">Selling Time Name</p>
          <Icon
            name="sellingTimeTooltip"
            className="selling-time-name-field__tooltip"
            alt=""
          />
        </span>
        <p className="selling-time-name-field__counter type-body">
          {value.length}/30
        </p>
      </span>
      <span
        className={`catalog-detail-field__shell${error ? " is-error" : ""}`}
      >
        <input
          className={`type-subtitle-1${value ? "" : " text-tertiary"}`}
          type="text"
          value={value}
          placeholder="Enter Selling Time Name"
          maxLength={30}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      {error ? (
        <p className="catalog-detail-field__error type-body">
          Field cannot be empty
        </p>
      ) : null}
    </label>
  );
}

export function SellingTimeTimeField({
  value,
  onChange,
  disabled = false,
  error = false,
}) {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (disabled) return;

    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div className="selling-time-time-field">
      <span
        className={`selling-time-schedule-table__field-shell selling-time-schedule-table__field-shell--time${disabled ? " is-disabled" : ""
          }${error ? " is-error" : ""}`}
        onClick={openPicker}
      >
        <button
          type="button"
          className={`selling-time-time-field__trigger type-subtitle-2${value ? "" : " text-tertiary"
            }`}
          disabled={disabled}
          aria-label={value || "00:00"}
        >
          {value || "00:00"}
        </button>
        <input
          ref={inputRef}
          className="selling-time-time-field__native-input"
          type="time"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          tabIndex={-1}
          aria-hidden="true"
        />
      </span>
    </div>
  );
}

