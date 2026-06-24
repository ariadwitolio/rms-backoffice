import { useState, useRef } from "react";
import { DEFAULT_PRICING_OVERRIDE_MAXIMUMS, PRICING_OVERRIDE_GROUPS, PRICING_RULE_MONTH_LABELS } from "../../constants/pricing.js";
import { LabButton, LabCheckbox, Field, Toggle } from "../ui/Primitives.jsx";
import { normalizePricingOverrideMaximumValue, formatPricingOverrideMaximumValue, formatPricingRuleDateDisplay, formatPricingRuleDatePickerValue } from "../../utils/pricingUtils.js";
import { Icon } from "../icons/Icon.jsx";

export function PricingOverrideCard({
  title,
  groups,
  selectedIds,
  onToggleAll,
  onToggleGroup,
  onToggleItem,
  editing = null,
  onStartEdit,
  onChangeEdit,
  onSaveEdit,
  onCancelEdit,
  editInputRef,
}) {
  const childIds = groups.flatMap((group) =>
    group.items.map((item) => item.id)
  );
  const overrideRows = groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      subtitle: group.label !== item.label ? group.label : "",
    }))
  );
  const allSelected =
    childIds.length > 0 && childIds.every((id) => selectedIds.includes(id));

  return (
    <section className="pricing-override-card">
      <div className="pricing-override-card__header">
        <p className="pricing-override-card__title type-title-2">{title}</p>
      </div>
      <div className="pricing-override-table">
        <div className="pricing-override-row pricing-override-row--header">
          <div className="pricing-override-cell">
            <LabCheckbox
              checked={allSelected}
              onChange={onToggleAll}
              ariaLabel={`Select all ${title}`}
            />
          </div>
          <div className="pricing-override-cell pricing-override-cell--header-business">
            <p className="type-title-3">Entity</p>
          </div>
          <div className="pricing-override-cell pricing-override-cell--header-maximum">
            <p className="type-title-3">Maximum</p>
          </div>
        </div>
        {overrideRows.map((item) => (
          <div key={item.id} className="pricing-override-row">
            <div className="pricing-override-cell">
              <LabCheckbox
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggleItem(item.id)}
                ariaLabel={`Select ${item.label}`}
              />
            </div>
            <div className="pricing-override-cell pricing-override-cell--item-label">
              <div className="lab-table__cell-stack">
                <p className="pricing-override-label pricing-override-label--item type-subtitle-2">
                  {item.label}
                </p>
                {item.subtitle ? (
                  <p className="lab-table__cell-subtitle type-body text-secondary">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="pricing-override-cell pricing-override-cell--maximum">
              {editing?.itemId === item.id ? (
                <div className="pricing-override-maximum-shell is-editing">
                  <label className="pricing-override-edit-shell">
                    <span className="pricing-override-edit-prefix type-subtitle-2">
                      %
                    </span>
                    <input
                      ref={editInputRef}
                      type="text"
                      inputMode="numeric"
                      className="pricing-override-edit-input type-subtitle-2"
                      value={editing.value}
                      placeholder="0"
                      onChange={(event) => onChangeEdit(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          onSaveEdit();
                        }

                        if (event.key === "Escape") {
                          event.preventDefault();
                          onCancelEdit();
                        }
                      }}
                      aria-label={`Set maximum percentage for ${item.label}`}
                    />
                  </label>
                  <div className="pricing-override-inline-actions">
                    <button
                      type="button"
                      className="catalog-inline-editor__action catalog-inline-editor__action--cancel"
                      onClick={onCancelEdit}
                    >
                      <Icon
                        name="inlineCancel"
                        className="lab-icon"
                        alt="Cancel"
                      />
                    </button>
                    <button
                      type="button"
                      className="catalog-inline-editor__action catalog-inline-editor__action--save"
                      onClick={onSaveEdit}
                    >
                      <Icon
                        name="inlineConfirm"
                        className="lab-icon"
                        alt="Save"
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pricing-override-maximum-shell">
                  <p className="pricing-override-maximum-value type-subtitle-2">
                    {formatPricingOverrideMaximumValue(item.maximum)}
                  </p>
                  <span className="pricing-override-edit-slot">
                    <button
                      type="button"
                      className="pricing-override-edit"
                      onClick={() => onStartEdit(item.id)}
                      aria-label={`Edit maximum for ${item.label}`}
                    >
                      <Icon
                        name="edit"
                        className="lab-icon lab-icon--16"
                        alt="Edit"
                      />
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PricingRuleDateField({
  label,
  value,
  onChange,
  placeholder,
  error = false,
}) {
  const inputRef = useRef(null);
  const pickerValue = formatPricingRuleDatePickerValue(value);

  const openPicker = () => {
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
    <label className="catalog-detail-field">
      <span className="catalog-detail-field__label type-body">
        <span className="catalog-detail-field__required">*</span>
        {label}
      </span>
      <span
        className={`catalog-detail-field__shell pricing-rule-date-field__shell${error ? " is-error" : ""
          }`}
        onClick={openPicker}
      >
        <button
          type="button"
          className={`catalog-detail-field__trigger pricing-rule-date-field__trigger type-subtitle-1${value ? "" : " text-tertiary"
            }`}
          aria-label={`${label}${value ? `, ${value}` : ""}`}
        >
          {value || placeholder}
        </button>
        <input
          ref={inputRef}
          className="pricing-rule-date-field__native-input"
          type="datetime-local"
          value={pickerValue}
          onChange={(event) =>
            onChange(formatPricingRuleDateDisplay(event.target.value))
          }
          tabIndex={-1}
          aria-hidden="true"
        />
        <Icon
          name="pricingRuleCalendar"
          className="pricing-rule-date-field__icon"
          alt=""
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

export function SpecialPricingRuleOverrideCard({
  title,
  groups,
  selectedIds,
  onToggleAll,
  onToggleGroup,
  onToggleItem,
  onChangeMaximum,
}) {
  const childIds = groups.flatMap((group) =>
    group.items.map((item) => item.id)
  );
  const overrideRows = groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      subtitle: group.label !== item.label ? group.label : "",
    }))
  );
  const allSelected =
    childIds.length > 0 && childIds.every((id) => selectedIds.includes(id));

  return (
    <section className="pricing-override-card pricing-override-card--create">
      <div className="pricing-override-card__header">
        <p className="pricing-override-card__title type-title-2">{title}</p>
      </div>
      <div className="pricing-override-table">
        <div className="pricing-override-row pricing-override-row--header">
          <div className="pricing-override-cell">
            <LabCheckbox
              checked={allSelected}
              onChange={onToggleAll}
              ariaLabel={`Select all ${title}`}
            />
          </div>
          <div className="pricing-override-cell pricing-override-cell--header-business">
            <p className="type-title-3">Entity</p>
          </div>
          <div className="pricing-override-cell pricing-override-cell--header-maximum">
            <p className="type-title-3">Maximum</p>
          </div>
        </div>
        {overrideRows.map((item) => (
          <div key={item.id} className="pricing-override-row">
            <div className="pricing-override-cell">
              <LabCheckbox
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggleItem(item.id)}
                ariaLabel={`Select ${item.label}`}
              />
            </div>
            <div className="pricing-override-cell pricing-override-cell--item-label">
              <div className="lab-table__cell-stack">
                <p className="pricing-override-label pricing-override-label--item type-subtitle-2">
                  {item.label}
                </p>
                {item.subtitle ? (
                  <p className="lab-table__cell-subtitle type-body text-secondary">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="pricing-override-cell pricing-override-cell--maximum">
              <label className="pricing-override-create-field">
                <span className="pricing-override-create-prefix type-subtitle-2">
                  %
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="pricing-override-create-input type-subtitle-2"
                  value={item.maximum === "0" ? "" : item.maximum || ""}
                  placeholder="0"
                  onChange={(event) =>
                    onChangeMaximum(item.id, event.target.value)
                  }
                  aria-label={`Set maximum percentage for ${item.label}`}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PricingRuleDetailOverrideTable({
  sectionKey,
  groups,
  isEditing = false,
  onChangeMaximum,
}) {
  const overrideRows = groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      subtitle: group.label !== item.label ? group.label : "",
    }))
  );

  return (
    <div className="pricing-override-table pricing-override-table--detail">
      <div className="pricing-override-row pricing-override-row--header pricing-override-row--detail">
        <div className="pricing-override-cell">
          <LabCheckbox
            checked={false}
            onChange={() => { }}
            ariaLabel="Select all entities"
          />
        </div>
        <div className="pricing-override-cell pricing-override-cell--header-business">
          <p className="type-title-3">Entity</p>
        </div>
        <div className="pricing-override-cell pricing-override-cell--header-maximum">
          <p className="type-title-3">Maximum</p>
        </div>
      </div>
      {overrideRows.map((item) => (
        <div
          key={item.id}
          className="pricing-override-row pricing-override-row--detail"
          data-pricing-rule-detail-editor={isEditing ? "true" : undefined}
        >
          <div className="pricing-override-cell">
            <LabCheckbox
              checked={false}
              onChange={() => { }}
              ariaLabel={item.label}
            />
          </div>
          <div className="pricing-override-cell pricing-override-cell--item-label">
            <div className="lab-table__cell-stack">
              <p className="pricing-override-label pricing-override-label--item type-subtitle-2">
                {item.label}
              </p>
              {item.subtitle ? (
                <p className="lab-table__cell-subtitle type-body text-secondary">
                  {item.subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <div className="pricing-override-cell pricing-override-cell--maximum">
            {isEditing ? (
              <div className="pricing-override-maximum-shell is-editing">
                <label className="pricing-override-edit-shell">
                  <span className="pricing-override-edit-prefix type-subtitle-2">
                    %
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="pricing-override-edit-input type-subtitle-2"
                    value={item.maximum === "0" ? "" : item.maximum || ""}
                    placeholder="0"
                    onChange={(event) =>
                      onChangeMaximum(sectionKey, item.id, event.target.value)
                    }
                    aria-label={`Set maximum percentage for ${item.label}`}
                  />
                </label>
              </div>
            ) : (
              <div className="pricing-override-maximum-shell">
                <p className="pricing-override-maximum-value type-subtitle-2">
                  {formatPricingOverrideMaximumValue(item.maximum)}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

