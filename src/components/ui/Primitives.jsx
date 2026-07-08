import { createPortal } from "react-dom";
import { getPaginationItems, getStatusTone } from "../../utils/ui.js";
import { ChevronIcon, Icon } from "../icons/Icon.jsx";

function LabButton({
  label,
  variant = "primary",
  size = "small",
  icon,
  onClick,
  disabled = false,
  fullWidth = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`lab-button lab-button--${variant} lab-button--${size}${fullWidth ? " is-full-width" : ""
        }`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon ? (
        <Icon
          name={icon}
          className={`lab-icon ${size === "small" ? "lab-icon--16" : "lab-icon--20"
            }`}
          alt=""
        />
      ) : null}
      <span
        className={size === "small" ? "type-subtitle-2" : "type-subtitle-1"}
      >
        {label}
      </span>
    </button>
  );
}

function SelectShell({ value, options, onChange, emoji = "", leading = null }) {
  return (
    <label className="lab-select-shell">
      {leading ? (
        <span className="lab-select-shell__leading">{leading}</span>
      ) : null}
      {emoji ? (
        <span className="lab-select-shell__leading lab-select-shell__emoji">
          {emoji}
        </span>
      ) : null}
      <select
        className="type-subtitle-1"
        value={value}
        onChange={onChange ?? (() => { })}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="lab-select-shell__chevron">
        <ChevronIcon name="selectChevron" size={24} direction="down" />
      </span>
    </label>
  );
}

function StatusPill({ status }) {
  const tone = getStatusTone(status);

  return (
    <span className={`status-pill status-pill--${tone}`}>
      <span className="type-body">{status}</span>
    </span>
  );
}

function DeviceStatusDot({ status }) {
  return (
    <span
      className={`device-status-dot${status === "Connected" ? " is-connected" : ""}`}
      aria-hidden="true"
    />
  );
}

function DeviceStatusIndicator({ status }) {
  const isConnected = status === "Connected";

  return (
    <span
      className={`device-status-indicator${isConnected ? " is-connected" : ""}`}
    >
      <DeviceStatusDot status={status} />
      <span className="device-status-indicator__label">
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </span>
  );
}

function Toggle({ checked, onChange, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      className={`lab-toggle${checked ? " is-on" : ""}`}
      aria-pressed={checked}
      aria-label={ariaLabel}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }
        onChange?.(event);
      }}
    >
      <span className="lab-toggle__track" />
      <span className="lab-toggle__knob" />
    </button>
  );
}

function LabCheckbox({ checked, onChange, ariaLabel, disabled = false }) {
  return (
    <input
      type="checkbox"
      className="lab-checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      disabled={disabled}
    />
  );
}

function TablePagination({ page, totalPages, onPrev, onNext, onSelectPage }) {
  const items = getPaginationItems(page, totalPages);

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination__step"
        onClick={onPrev}
        disabled={page <= 1}
      >
        <ChevronIcon
          name="paginationPrev"
          size={24}
          direction="left"
          alt="Previous page"
        />
      </button>
      {items.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={`${item}-${index}`}
            type="button"
            className={`pagination__page type-subtitle-2${item === page ? " is-active" : ""
              }`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onSelectPage(item)}
          >
            {item}
          </button>
        ) : (
          <span
            key={`${item}-${index}`}
            className="pagination__page is-ellipsis type-subtitle-2"
            aria-hidden="true"
          >
            ...
          </span>
        )
      )}
      <button
        type="button"
        className="pagination__step"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        <ChevronIcon
          name="paginationNext"
          size={24}
          direction="right"
          alt="Next page"
        />
      </button>
    </div>
  );
}

function EmptyState({ title, copy }) {
  return (
    <div className="empty-state">
      <img src="/img/not-found.svg" width="180" height="180" alt="" aria-hidden="true" />
      <p className="type-title-2">{title}</p>
      <p className="type-body text-secondary">{copy}</p>
    </div>
  );
}

function EmptyDataState({ menuName }) {
  return (
    <div className="empty-state">
      <img src="/img/empty-state.svg" width="180" height="180" alt="" aria-hidden="true" />
      <p className="type-title-2">No {menuName} yet</p>
      <p className="type-body text-secondary">Add a {menuName} to get started</p>
    </div>
  );
}

function Field({
  label,
  value,
  helper,
  required = false,
  onChange,
  options = null,
}) {
  return (
    <label className="lab-field">
      <span className="lab-field__label-row">
        <p className="type-body">
          {label}
          {required ? <span className="lab-field__required">*</span> : null}
        </p>
      </span>
      <span className="lab-field__shell">
        {options ? (
          <>
            <select
              className="type-subtitle-1"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronIcon name="selectChevron" size={24} direction="down" />
          </>
        ) : (
          <input
            className="type-subtitle-1"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </span>
      <p className="lab-field__helper type-body">{helper}</p>
    </label>
  );
}

function DetailSection({
  title,
  children,
  meta = null,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section
      className={`catalog-detail-section${className ? ` ${className}` : ""}`}
    >
      <div className="catalog-detail-section__header">
        <div className="catalog-detail-section__accent" aria-hidden="true" />
        <p className="catalog-detail-section__title type-title-2">{title}</p>
        {meta ? (
          <div className="catalog-detail-section__meta type-subtitle-2 text-secondary">
            {meta}
          </div>
        ) : null}
        <ChevronIcon name="filterChevron" size={24} direction="up" />
      </div>
      <div
        className={`catalog-detail-section__body${bodyClassName ? ` ${bodyClassName}` : ""
          }`}
      >
        {children}
      </div>
    </section>
  );
}

function Snackbar({ snackbar, onDismiss, topOffset = "60px" }) {
  if (!snackbar) return null;

  const content = (
    <div
      className={`lab-snackbar lab-snackbar--${snackbar.tone}`}
      style={{ "--top-navbar-height": topOffset }}
    >
      <p className="type-body">{snackbar.message}</p>
      <button
        type="button"
        className="lab-snackbar__action type-body-bold"
        onClick={onDismiss}
      >
        Okay
      </button>
    </div>
  );

  if (typeof document === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}
export {
  DetailSection,
  DeviceStatusDot,
  DeviceStatusIndicator,
  EmptyDataState,
  EmptyState,
  Field,
  LabButton,
  LabCheckbox,
  SelectShell,
  Snackbar,
  StatusPill,
  TablePagination,
  Toggle,
};
