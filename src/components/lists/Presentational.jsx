import { ChevronIcon, Icon } from "../icons/Icon.jsx";
import { LabButton, TablePagination } from "../ui/Primitives.jsx";

export function InlineSelect({ value, options, onChange, disabled = false }) {
  return (
    <label className={`lab-inline-select${disabled ? " is-disabled" : ""}`}>
      <select
        className="type-subtitle-2"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="lab-inline-select__chevron">
        <ChevronIcon
          name={disabled ? "footerRowsChevronDisabled" : "footerRowsChevron"}
          size={16}
          direction="down"
        />
      </span>
    </label>
  );
}

export function TableToolbar({ filters, searchPlaceholder, searchValue, onSearch }) {
  return (
    <div className="table-toolbar">
      <div className="table-toolbar__start">{filters}</div>
      <div className="table-toolbar__end">
        <label className="lab-searchbar">
          <Icon name="search" className="lab-icon lab-icon--20" alt="Search" />
          <input
            type="search"
            className="type-subtitle-2"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export function ListPageToolbar({
  totalRows,
  totalLabel,
  filters = [],
  searchPlaceholder,
  searchValue,
  onSearch,
  actionLabel,
  onAction,
  actionIcon = "add",
}) {
  const filterNodes = Array.isArray(filters)
    ? filters.filter(Boolean)
    : filters
      ? [filters]
      : [];

  return (
    <div className="table-toolbar">
      <div className="catalog-table-toolbar__start">
        <p className="catalog-table-toolbar__summary type-subtitle-2">
          <span className="catalog-table-toolbar__summary-label">Total:</span>{" "}
          <span className="catalog-table-toolbar__summary-count type-title-3">
            {totalRows}
          </span>{" "}
          <span className="catalog-table-toolbar__summary-label">
            {totalLabel}
          </span>
        </p>
        {filterNodes.length ? (
          <span
            className="catalog-table-toolbar__separator"
            aria-hidden="true"
          />
        ) : null}
        {filterNodes}
      </div>
      <div className="catalog-table-toolbar__end">
        <label className="lab-searchbar">
          <Icon name="search" className="lab-icon lab-icon--20" alt="Search" />
          <input
            type="search"
            className="type-body"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
        {actionLabel ? (
          <LabButton
            label={actionLabel}
            variant="primary"
            size="small"
            icon={actionIcon}
            onClick={onAction}
          />
        ) : null}
      </div>
    </div>
  );
}

export function TableFooterBar({
  page,
  totalPages,
  rowsPerPage,
  totalRows,
  onRowsChange,
  onPrev,
  onNext,
  onSelectPage,
  onDownload,
  showDownload = true,
}) {
  const rowsSelectorDisabled = totalRows <= 25;

  return (
    <div className="table-footer">
      <div className="table-footer__start">
        {showDownload ? (
          <>
            <LabButton
              label="Download"
              variant="secondary"
              size="small"
              icon="download"
              onClick={onDownload}
            />
            <Icon
              name="tableSeparator"
              className="table-footer__separator"
              alt=""
            />
          </>
        ) : null}
        <InlineSelect
          value={rowsSelectorDisabled ? 25 : rowsPerPage}
          options={[25, 50, 100]}
          onChange={onRowsChange}
          disabled={rowsSelectorDisabled}
        />
        <p className="table-footer__caption type-subtitle-2">
          from {totalRows} rows
        </p>
      </div>
      <div className="table-footer__end">
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
          onSelectPage={onSelectPage}
        />
      </div>
    </div>
  );
}

export function DetailPageHeader({
  title,
  breadcrumb,
  onBack,
  backAriaLabel = "Back",
}) {
  return (
    <div className="detail-page-header">
      <button
        type="button"
        className="detail-page-header__back"
        onClick={onBack}
        aria-label={backAriaLabel}
      >
        <ChevronIcon name="chevronLeft" size={24} direction="left" />
      </button>
      <div className="detail-page-header__copy">
        <h1 className="detail-page-header__title type-title-large">{title}</h1>
        <p className="detail-page-header__breadcrumb type-body text-tertiary">
          {breadcrumb}
        </p>
      </div>
    </div>
  );
}

export function InlineEditActions({ onCancel, onSave, className = "" }) {
  return (
    <div
      className={`catalog-inline-editor__actions${className ? ` ${className}` : ""
        }`}
    >
      <TableActionButton
        tooltip="Cancel"
        className="catalog-inline-editor__action catalog-inline-editor__action--cancel"
        onClick={onCancel}
      >
        <Icon name="inlineCancel" className="lab-icon" alt="Cancel" />
      </TableActionButton>
      <TableActionButton
        tooltip="Save"
        className="catalog-inline-editor__action catalog-inline-editor__action--save"
        onClick={onSave}
      >
        <Icon name="inlineConfirm" className="lab-icon" alt="Save" />
      </TableActionButton>
    </div>
  );
}

export function TableActionButton({
  tooltip,
  ariaLabel,
  className = "table-row-action",
  type = "button",
  children,
  disabled = false,
  ...props
}) {
  return (
    <span
      className={`table-row-action-tooltip${disabled ? " is-disabled" : ""}`}
    >
      <button
        type={type}
        className={className}
        aria-label={ariaLabel ?? tooltip}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
      {tooltip ? (
        <span className="table-row-action-tooltip__bubble type-body" aria-hidden="true">
          {tooltip}
        </span>
      ) : null}
    </span>
  );
}

export function DetailPanelDeleteAction({
  label = "Delete",
  ariaLabel = "Delete",
  onDelete,
}) {
  return (
    <div className="catalog-detail-panel__footer">
      <button
        type="button"
        className="lab-button lab-button--medium lab-button--danger-outline"
        style={{ width: "100%" }}
        onClick={onDelete}
        aria-label={ariaLabel}
      >
        <Icon
          name="panelDelete"
          className="lab-icon lab-icon--16"
          alt=""
          color="var(--status-red-primary)"
        />
        <span className="type-subtitle-2">{label}</span>
      </button>
    </div>
  );
}
