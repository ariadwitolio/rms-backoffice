import { isValidElement } from "react";
import { Icon } from "../icons/Icon.jsx";

export function DetailReadField({
  label,
  value,
  helper = null,
  onEdit,
  disabled = false,
  ghost = false,
  ellipsis = false,
}) {
  return (
    <button
      type="button"
      className={`catalog-read-field${disabled ? " is-disabled" : ""}${ghost ? " is-ghost" : ""
        }`}
      onClick={disabled || ghost ? undefined : onEdit}
      tabIndex={ghost ? -1 : undefined}
      aria-hidden={ghost ? "true" : undefined}
      data-catalog-detail-trigger={!disabled && !ghost ? "true" : undefined}
    >
      {label ? (
        <p className="catalog-read-field__label type-subtitle-2">{label}</p>
      ) : null}
      <span className="catalog-read-field__value-row">
        <p
          className={`catalog-read-field__value type-subtitle-1${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}
        >
          {value || "-"}
        </p>

        {!disabled && !ghost ? (
          <span className="catalog-read-field__icon" aria-hidden="true">
            <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
          </span>
        ) : null}
      </span>
      {helper ? (
        <p className="catalog-read-field__helper type-body">{helper}</p>
      ) : null}
    </button>
  );
}

export function CatalogPanelInfoRow({
  label,
  value,
  helper = null,
  onEdit,
  disabled = false,
  triggerDataAttr = "data-catalog-detail-trigger",
  ellipsis = false,
}) {
  const isInteractive = Boolean(onEdit && !disabled);
  const resolvedValue =
    value === null || value === undefined || value === "" ? "-" : value;
  const shouldWrapValueInBlock =
    isValidElement(resolvedValue) ||
    (typeof resolvedValue !== "string" && typeof resolvedValue !== "number");
  const triggerProps =
    isInteractive && triggerDataAttr
      ? { [triggerDataAttr]: "true" }
      : undefined;
  const ContainerTag = isInteractive ? "button" : "div";

  return (
    <ContainerTag
      {...(isInteractive ? { type: "button", onClick: onEdit } : {})}
      className={`catalog-panel-info-row${isInteractive ? "" : " is-disabled"}`}
      {...triggerProps}
    >
      <span className="catalog-panel-info-row__main">
        <p className="catalog-panel-info-row__label type-subtitle-2">{label}</p>
        <span className="catalog-panel-info-row__value-wrap">
          <span className="catalog-panel-info-row__value-row">
            {shouldWrapValueInBlock ? (
              <div className="catalog-panel-info-row__value type-subtitle-2">
                {resolvedValue}
              </div>
            ) : (
              <p
                className={`catalog-panel-info-row__value type-subtitle-2${ellipsis ? " catalog-detail-field__input--ellipsis" : ""}`}
              >
                {resolvedValue}
              </p>
            )}
            {isInteractive ? (
              <span className="catalog-panel-info-row__icon" aria-hidden="true">
                <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
              </span>
            ) : null}
          </span>
          {helper ? (
            <p className="catalog-panel-info-row__helper type-body">{helper}</p>
          ) : null}
        </span>
      </span>
    </ContainerTag>
  );
}
