import { useState } from "react";
import { Field, LabButton, LabCheckbox, SelectShell, Toggle} from "../ui/Primitives.jsx";
import { formatModifierDetailOptionPrice, getModifierUnitAssignmentValue, getModifierUnitAssignmentColumns } from "../../utils/catalogBuildUtils.js";
import { Icon } from "../icons/Icon.jsx";
import { TableActionButton } from "../lists/Presentational.jsx";
import { ModifierReorderHandle, ModifierOptionPriceField, PackageItemSelectField, ModifierOptionQtyField } from "./ModifierOptionInputs.jsx";
import { DetailSelectField } from "./FormFields.jsx";
import { getModifierIngredientSelection, hasModifierOptionIngredient } from "../../utils/modifierUtils.js";

export function ModifierOptionsTable({
  options,
  isEditing,
  minimumSelection = "0",
  dragOverOptionId,
  optionNameErrors = [],
  optionIngredientQtyErrors = [],
  ingredientOptions = [],
  onOptionChange,
  onRemoveOption,
  onAddOption,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  addButtonDisabled = false,
  addButtonDataAttribute,
  rowDataAttribute,
  emptyReadonlyContent = null,
  showAvailabilityInEditing = false,
}) {
  if (!isEditing && !options.length) {
    return emptyReadonlyContent;
  }

  const showAvailabilityColumn = !isEditing || showAvailabilityInEditing;
  // Availability + delete must live in a single sticky cell rather than two
  // separate sticky cells: two independent `position: sticky` siblings pinned
  // to the same edge trigger a Chromium repaint bug that leaves stale toggle
  // pixels ghosted over the scrolled content during fast horizontal scroll.
  const combineAvailabilityWithAction = isEditing && showAvailabilityColumn;

  function handleScroll(event) {
    const node = event.currentTarget;
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    const scrollLeft = Math.max(0, node.scrollLeft);
    node.dataset.scrollLeft = scrollLeft > 0 ? "true" : "false";
    node.dataset.scrollRight = scrollLeft < maxScrollLeft - 1 ? "true" : "false";
  }

  return (
    <div className="modifier-option-table-shell">
      <div
        className="modifier-option-table__scroll"
        onScroll={handleScroll}
      >
        <section
          className={`modifier-option-table ${isEditing
            ? "modifier-option-table--editable"
            : "modifier-option-table--readonly modifier-option-table--with-availability"
            }${showAvailabilityInEditing ? " modifier-option-table--with-availability" : ""
            }`}
        >
          <div className="modifier-option-table__row modifier-option-table__row--header">
            <div className="modifier-option-table__header-cell modifier-option-table__header-cell--handle" />
            <div className="modifier-option-table__header-cell modifier-option-table__header-cell--name">
              <p className="type-title-3">Option Name</p>
            </div>
            <div className="modifier-option-table__header-cell modifier-option-table__header-cell--price">
              <p className="type-title-3">Additional Price</p>
            </div>
            <div className="modifier-option-table__header-cell modifier-option-table__header-cell--ingredient">
              <p className="type-title-3">Ingredient</p>
            </div>
            <div className="modifier-option-table__header-cell modifier-option-table__header-cell--qty">
              <p className="type-title-3">Qty</p>
            </div>
            {combineAvailabilityWithAction ? (
              <div className="modifier-option-table__header-cell modifier-option-table__header-cell--availability-action">
                <p className="type-title-3">Availability</p>
              </div>
            ) : (
              <>
                {showAvailabilityColumn ? (
                  <div className="modifier-option-table__header-cell modifier-option-table__header-cell--availability">
                    <p className="type-title-3">Availability</p>
                  </div>
                ) : null}
                {isEditing ? (
                  <div className="modifier-option-table__header-cell modifier-option-table__header-cell--action" />
                ) : null}
              </>
            )}
          </div>
          {options.map((option, index) => {
            const optionNameError = optionNameErrors.includes(option.id);
            const optionIngredientQtyError =
              optionIngredientQtyErrors.includes(option.id);
            const hasIngredient = hasModifierOptionIngredient(option);
            const ingredientUnit = getModifierIngredientSelection(option)
              .ingredientUnit;

            return (
              <div
                key={option.id}
                {...(rowDataAttribute
                  ? { [rowDataAttribute]: "true" }
                  : {})}
                className={`modifier-option-table__row${dragOverOptionId === option.id ? " is-drag-over" : ""
                  }`}
                onDragOver={
                  isEditing
                    ? (event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      onDragOver?.(option.id);
                    }
                    : undefined
                }
                onDrop={
                  isEditing
                    ? (event) => {
                      event.preventDefault();
                      onDrop?.(option.id);
                    }
                    : undefined
                }
              >
                <div className="modifier-option-table__cell modifier-option-table__cell--handle">
                  {isEditing ? (
                    <ModifierReorderHandle
                      ariaLabel={`Reorder option ${index + 1}`}
                      onDragStart={(event) => onDragStart?.(option.id, event)}
                      onDragEnd={onDragEnd}
                    />
                  ) : null}
                </div>
                <div className="modifier-option-table__cell modifier-option-table__cell--name">
                  {isEditing ? (
                    <div className="modifier-option-table__field-stack">
                      <label
                        className={`modifier-option-table__field-shell${optionNameError ? " is-error" : ""
                          }`}
                      >
                        <input
                          className={`type-subtitle-2${option.name ? "" : " text-tertiary"}`}
                          type="text"
                          value={option.name}
                          placeholder={`Option Name ${index + 1}`}
                          onChange={(event) =>
                            onOptionChange?.(
                              option.id,
                              "name",
                              event.target.value
                            )
                          }
                        />
                      </label>
                      {optionNameError ? (
                        <p className="modifier-option-table__field-error type-body">
                          {option.name?.trim() ? "Option name already exists" : "Field cannot be empty"}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="type-subtitle-2">{option.name || "-"}</p>
                  )}
                </div>
                <div className="modifier-option-table__cell modifier-option-table__cell--price">
                  {isEditing ? (
                    <ModifierOptionPriceField
                      value={option.additionalPrice}
                      onChange={(value) =>
                        onOptionChange?.(option.id, "additionalPrice", value)
                      }
                    />
                  ) : (
                    <p className="type-subtitle-2">
                      {formatModifierDetailOptionPrice(option.additionalPrice)}
                    </p>
                  )}
                </div>
                <div className="modifier-option-table__cell modifier-option-table__cell--ingredient">
                  {isEditing ? (
                    <div className="modifier-option-table__field-stack">
                      <label className="modifier-option-table__field-shell modifier-option-table__field-shell--select">
                        <PackageItemSelectField
                          value={option.selectedIngredient}
                          options={ingredientOptions}
                          placeholder="Select Ingredient"
                          allowClear
                          clearLabel="No Ingredient"
                          emptyCopy="No ingredient available"
                          onChange={(value) =>
                            onOptionChange?.(
                              option.id,
                              "selectedIngredient",
                              value
                            )
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="type-subtitle-2">
                      {option.selectedIngredient || "-"}
                    </p>
                  )}
                </div>
                <div className="modifier-option-table__cell modifier-option-table__cell--qty">
                  {isEditing ? (
                    <ModifierOptionQtyField
                      value={option.ingredientQty}
                      unitLabel={ingredientUnit}
                      disabled={!hasIngredient}
                      error={optionIngredientQtyError}
                      onChange={(value) =>
                        onOptionChange?.(option.id, "ingredientQty", value)
                      }
                    />
                  ) : (
                    <p className="type-subtitle-2">
                      {hasIngredient && option.ingredientQty
                        ? `${option.ingredientQty} ${ingredientUnit}`.trim()
                        : "-"}
                    </p>
                  )}
                </div>
                {combineAvailabilityWithAction ? (
                  <div className="modifier-option-table__cell modifier-option-table__cell--availability-action">
                    <Toggle
                      checked={option.isAvailable !== false}
                      onChange={() =>
                        onOptionChange?.(
                          option.id,
                          "isAvailable",
                          option.isAvailable === false ? true : false
                        )
                      }
                      ariaLabel={`Availability for ${option.name || "Option"}`}
                    />
                    <TableActionButton
                      tooltip="Remove"
                      onClick={() => onRemoveOption?.(option.id)}
                      ariaLabel={`Remove option ${index + 1}`}
                    >
                      <Icon
                        name="delete"
                        className="lab-icon lab-icon--16"
                        alt="Delete"
                      />
                    </TableActionButton>
                  </div>
                ) : (
                  <>
                    {showAvailabilityColumn ? (
                      <div className="modifier-option-table__cell modifier-option-table__cell--availability">
                        <Toggle
                          checked={option.isAvailable !== false}
                          onChange={() =>
                            onOptionChange?.(
                              option.id,
                              "isAvailable",
                              option.isAvailable === false ? true : false
                            )
                          }
                          ariaLabel={`Availability for ${option.name || "Option"}`}
                        />
                      </div>
                    ) : null}
                    {isEditing ? (
                      <div className="modifier-option-table__cell modifier-option-table__cell--action">
                        <TableActionButton
                          tooltip="Remove"
                          onClick={() => onRemoveOption?.(option.id)}
                          ariaLabel={`Remove option ${index + 1}`}
                        >
                          <Icon
                            name="delete"
                            className="lab-icon lab-icon--16"
                            alt="Delete"
                          />
                        </TableActionButton>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </section>
      </div>
      {isEditing && options.length < 15 ? (
        <button
          type="button"
          className="modifier-option-table__add"
          disabled={addButtonDisabled}
          {...(addButtonDataAttribute
            ? { [addButtonDataAttribute]: "true" }
            : {})}
          onClick={onAddOption}
        >
          <Icon name="modifierOptionAdd" className="lab-icon" alt="" />
          <span className="modifier-option-table__add-label type-title-3">
            Add Option
          </span>
        </button>
      ) : null}
    </div>
  );
}

export function CatalogTypeField({ value, onChange }) {
  return (
    <DetailSelectField
      label="Catalog Type"
      required
      value={value}
      options={[
        { value: "single", label: "Single Product" },
        { value: "package", label: "Package" },
      ]}
      onChange={onChange}
      placeholder="Select Catalog Type"
    />
  );
}

export function getNormalizedNominalDigits(value) {
  return String(value ?? "")
    .replace(/[^\d]/g, "")
    .replace(/^0+/, "");
}

export function formatNominalInput(value) {
  const digits = getNormalizedNominalDigits(value);
  return digits ? new Intl.NumberFormat("en-US").format(Number(digits)) : "";
}

export function PriceField({ value, onChange, error = false }) {
  const displayValue = formatNominalInput(value);

  return (
    <label className="catalog-detail-field">
      <span className="catalog-detail-field__label type-body">
        <span className="catalog-detail-field__required">*</span>
        Price
      </span>
      <span
        className={`catalog-detail-field__shell catalog-detail-field__shell--price${error ? " is-error" : ""
          }`}
      >
        <span className="catalog-detail-field__prefix type-subtitle-1">
          IDR
        </span>
        <input
          className={`type-subtitle-1${displayValue ? "" : " text-tertiary"}`}
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder="0"
          onChange={(event) =>
            onChange(getNormalizedNominalDigits(event.target.value))
          }
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

