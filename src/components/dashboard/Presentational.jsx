import { Fragment, useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronIcon, Icon } from "../icons/Icon.jsx";
import { LabButton } from "../ui/Primitives.jsx";

export function MetricCard({ label, count, tone = "neutral", iconName = null }) {
  if (iconName) {
    return (
      <div className="metric-card">
        <span className="metric-card__icon-wrap" aria-hidden="true">
          <Icon name={iconName} className="metric-card__icon" />
        </span>
        <div className="metric-card__content">
          <p className="type-subtitle-1 metric-card__label">{label}</p>
          <span className={`metric-card__count metric-card__count--${tone}`}>
            <span className="type-title-3">{count}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card">
      <p className="type-subtitle-1 metric-card__label">{label}</p>
      <span className={`metric-card__count metric-card__count--${tone}`}>
        <span className="type-title-3">{count}</span>
      </span>
    </div>
  );
}

export function DashboardStackedMetricCard({
  label,
  value,
  tone = "neutral",
  iconName = null,
}) {
  return (
    <article className="dashboard-stacked-metric-card">
      {iconName ? (
        <span className="dashboard-stacked-metric-card__icon-wrap" aria-hidden="true">
          <Icon name={iconName} className="dashboard-stacked-metric-card__icon" />
        </span>
      ) : null}
      <div className="dashboard-stacked-metric-card__content">
        <p className="dashboard-stacked-metric-card__label type-subtitle-2 text-secondary">
          {label}
        </p>
        <p
          className={`dashboard-stacked-metric-card__value dashboard-stacked-metric-card__value--${tone} type-title-2`}
        >
          {value}
        </p>
      </div>
    </article>
  );
}

export function DashboardFinancialSummaryCard({
  title,
  value,
  badgeText = "",
  badgeTone = "neutral",
  detailRows = [],
  valueTone = "default",
}) {
  return (
    <article className="dashboard-financial-card">
      <div className="dashboard-financial-card__summary">
        <p className="dashboard-financial-card__title type-subtitle-2 text-secondary">
          {title}
        </p>
        <div className="dashboard-financial-card__value-row">
          <p
            className={`dashboard-financial-card__value dashboard-financial-card__value--${valueTone} type-title-1`}
          >
            {value}
          </p>
          {badgeText ? (
            <span
              className={`dashboard-financial-card__badge dashboard-financial-card__badge--${badgeTone} type-body-bold`}
            >
              {badgeText}
            </span>
          ) : null}
        </div>
      </div>
      {detailRows.length ? (
        <div className="dashboard-financial-card__details">
          {detailRows.map((row) => (
            <div key={row.label} className="dashboard-financial-card__row">
              <p className="dashboard-financial-card__row-label type-subtitle-2">
                {row.label}
              </p>
              <p
                className={`dashboard-financial-card__row-value dashboard-financial-card__row-value--${row.tone ?? "default"
                  } type-subtitle-2`}
              >
                {row.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function DashboardDetailTabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`dashboard-detail-tab type-subtitle-2${active ? " is-active" : ""
        }`}
      role="tab"
      aria-selected={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function MetricFilterCard({
  label,
  count,
  tone,
  active,
  onClick,
  showChevron,
}) {
  return (
    <button
      type="button"
      className={`metric-card${active ? " is-filtered" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <p className="type-subtitle-1 metric-card__label">{label}</p>
      <span className="metric-card__meta">
        <span className={`metric-card__count metric-card__count--${tone}`}>
          <span className="type-title-3">{count}</span>
        </span>
        {showChevron ? (
          active ? (
            <span className="metric-card__dismiss" aria-hidden="true" />
          ) : (
            <ChevronIcon name="sidebarChevron" size={16} direction="right" />
          )
        ) : null}
      </span>
    </button>
  );
}

export function DashboardReportTabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`dashboard-report-tab type-subtitle-2${active ? " is-active" : ""
        }`}
      role="tab"
      aria-selected={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function DashboardSubTabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`dashboard-subtab type-body-bold${active ? " is-active" : ""}`}
      role="tab"
      aria-selected={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function DashboardKpiCard({
  label,
  value,
  valuePrimary,
  valueSecondary,
  trendLabel,
  trendCopy,
  trendSecondaryCopy,
  trendTone,
  onViewReport,
}) {
  const showTrend = Boolean(trendLabel || trendCopy || trendSecondaryCopy);

  return (
    <article className="dashboard-kpi-card">
      <div className="dashboard-kpi-card__header">
        <p className="type-subtitle-2 text-secondary">{label}</p>
        <button
          type="button"
          className="dashboard-kpi-card__link type-body-bold"
          onClick={onViewReport}
        >
          View Report
        </button>
      </div>
      <div className="dashboard-kpi-card__summary">
        {valuePrimary || valueSecondary ? (
          <div className="dashboard-kpi-card__value dashboard-kpi-card__value-row type-title-1">
            {valuePrimary ? <span>{valuePrimary}</span> : null}
            {valuePrimary && valueSecondary ? (
              <span
                className="dashboard-kpi-card__value-separator"
                aria-hidden="true"
              />
            ) : null}
            {valueSecondary ? <span>{valueSecondary}</span> : null}
          </div>
        ) : (
          <p className="dashboard-kpi-card__value type-title-1">{value}</p>
        )}
        {showTrend ? (
          <div className="dashboard-kpi-card__trend">
            {trendLabel ? (
              <span
                className={`dashboard-kpi-card__trend-badge dashboard-kpi-card__trend-badge--${trendTone}`}
              >
                <span className="type-body-bold">{trendLabel}</span>
              </span>
            ) : null}
            {trendCopy ? <p className="type-body text-secondary">{trendCopy}</p> : null}
            {trendSecondaryCopy ? (
              <p className="dashboard-kpi-card__trend-secondary type-body text-secondary">
                {trendSecondaryCopy}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DashboardKpiSummaryPrimaryCard({ metrics, onViewReport }) {
  const reportMetric = metrics.find(
    (metric) => metric.enableViewReport !== false
  );

  return (
    <article className="dashboard-kpi-summary__primary">
      {metrics.map((metric, index) => (
        <Fragment key={metric.id}>
          {index > 0 ? (
            <span
              className="dashboard-kpi-summary__primary-divider"
              aria-hidden="true"
            />
          ) : null}
          <div
            className={`dashboard-kpi-summary__primary-row${metric.id === "profit"
              ? " dashboard-kpi-summary__primary-row--compact"
              : ""
              }`}
          >
            <div className="dashboard-kpi-summary__primary-header">
              <p className="dashboard-kpi-summary__primary-label type-subtitle-2 text-secondary">
                {metric.label}
              </p>
              {index === 0 && reportMetric ? (
                <button
                  type="button"
                  className="dashboard-kpi-card__link type-body-bold"
                  onClick={() => onViewReport(reportMetric.id)}
                >
                  View Report
                </button>
              ) : null}
            </div>
            <div className="dashboard-kpi-summary__primary-summary">
              <p className="dashboard-kpi-summary__primary-value type-title-1">
                {metric.value}
              </p>
              {metric.trendLabel || metric.trendCopy ? (
                <div className="dashboard-kpi-summary__primary-trend">
                  {metric.trendLabel ? (
                    <span
                      className={`dashboard-kpi-card__trend-badge dashboard-kpi-card__trend-badge--${metric.trendTone}`}
                    >
                      <span className="type-body-bold">{metric.trendLabel}</span>
                    </span>
                  ) : null}
                  {metric.trendCopy ? (
                    <p className="type-body text-secondary">{metric.trendCopy}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Fragment>
      ))}
    </article>
  );
}

export function DashboardDoughnutSummaryCard({
  title,
  copy,
  totalLabel,
  totalValue,
  segments,
  onViewReport,
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(
    1,
    segments.reduce((sum, segment) => sum + segment.value, 0)
  );
  let consumed = 0;

  return (
    <section className="surface-panel dashboard-doughnut-card">
      <div className="surface-panel__header dashboard-doughnut-card__header">
        <div className="surface-panel__title-group">
          <p className="surface-panel__title type-headline">{title}</p>
          <p className="surface-panel__copy type-subtitle-2 text-secondary">
            {copy}
          </p>
        </div>
        {onViewReport ? (
          <button
            type="button"
            className="dashboard-kpi-card__link type-body-bold"
            onClick={onViewReport}
          >
            View Report
          </button>
        ) : null}
      </div>
      <div className="dashboard-doughnut-card__body">
        <div className="dashboard-doughnut-card__chart">
          <svg viewBox="0 0 132 132" aria-hidden="true">
            <circle
              className="dashboard-doughnut-card__track"
              cx="66"
              cy="66"
              r={radius}
            />
            {segments.map((segment) => {
              const segmentLength = (segment.value / total) * circumference;
              const dashArray = `${segmentLength} ${circumference - segmentLength
                }`;
              const dashOffset = -consumed;
              consumed += segmentLength;

              return (
                <circle
                  key={segment.label}
                  className="dashboard-doughnut-card__segment"
                  cx="66"
                  cy="66"
                  r={radius}
                  stroke={segment.color}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
            <circle
              className="dashboard-doughnut-card__center"
              cx="66"
              cy="66"
              r="28"
            />
            <text
              x="66"
              y="58"
              textAnchor="middle"
              className="dashboard-doughnut-card__center-label type-description"
              fill="var(--neutral-on-surface-secondary)"
            >
              {totalLabel}
            </text>
            <text
              x="66"
              y="78"
              textAnchor="middle"
              className="dashboard-doughnut-card__center-value type-title-3"
              fill="var(--neutral-on-surface-primary)"
            >
              {totalValue}
            </text>
          </svg>
        </div>
        <div className="dashboard-doughnut-card__legend">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="dashboard-doughnut-card__legend-row"
            >
              <div className="dashboard-doughnut-card__legend-copy">
                <span
                  className="dashboard-doughnut-card__legend-dot"
                  style={{ background: segment.color }}
                />
                <p className="dashboard-doughnut-card__legend-label type-body text-secondary">
                  {segment.label}
                </p>
              </div>
              <p className="dashboard-doughnut-card__legend-value type-subtitle-2">
                {segment.displayValue ?? segment.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DashboardInventoryProgressCard({
  title,
  copy,
  ingredients = [],
}) {
  return (
    <section className="surface-panel dashboard-inventory-progress-card">
      <div className="surface-panel__header dashboard-inventory-progress-card__header">
        <div className="surface-panel__title-group">
          <p className="surface-panel__title type-headline">{title}</p>
          <p className="surface-panel__copy type-subtitle-2 text-secondary">
            {copy}
          </p>
        </div>
      </div>
      <div className="dashboard-inventory-progress-card__body">
        {ingredients.map((row) => (
          <article
            key={row.id}
            className="dashboard-inventory-progress-card__item"
          >
            <div className="dashboard-inventory-progress-card__item-name">
              <p className="dashboard-inventory-progress-card__item-title type-body-bold">
                {row.ingredient}
              </p>
            </div>
            <div className="dashboard-inventory-progress-card__item-progress">
              <div className="dashboard-inventory-progress-card__bar">
                <span
                  className={`dashboard-inventory-progress-card__bar-fill dashboard-inventory-progress-card__bar-fill--${row.statusTone}`}
                  style={{ width: `${row.stockLevelPercent}%` }}
                />
              </div>
            </div>
            <div className="dashboard-inventory-progress-card__item-stock">
              <p
                className={`dashboard-inventory-progress-card__item-stock-value type-subtitle-2${row.statusTone === "danger"
                  ? " dashboard-inventory-progress-card__item-stock-value--danger"
                  : row.statusTone === "warning"
                    ? " dashboard-inventory-progress-card__item-stock-value--warning"
                    : ""
                  }`}
              >
                {row.currentStock}
              </p>
            </div>
            <div className="dashboard-inventory-progress-card__item-status">
              <LabButton
                label="Manage Stock"
                variant="secondary"
                size="small"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DashboardViewModeTabs({ value, onChange }) {
  const options = [
    { id: "trend", label: "Trend" },
    { id: "comparison", label: "Comparison" },
  ];

  return (
    <div className="dashboard-view-mode-tabs" role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`dashboard-view-mode-tab type-body-bold${value === option.id ? " is-active" : ""
            }`}
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardInlineSelect({ value, options, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const selectedLabel =
    options.find((o) => (o.id ?? o.value) === value)?.label ?? value;

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    function updatePosition() {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gutter = 12;
      const spacing = 8;
      const width = Math.min(
        Math.max(rect.width, 200),
        viewportWidth - gutter * 2
      );
      const naturalHeight = Math.min(popover?.scrollHeight ?? 240, 360);
      const availableBelow = viewportHeight - rect.bottom - gutter;
      const availableAbove = rect.top - gutter;
      const openUpward =
        availableBelow < Math.min(naturalHeight, 180) &&
        availableAbove > availableBelow;
      const maxHeight = Math.max(
        120,
        Math.min(
          360,
          openUpward ? availableAbove - spacing : availableBelow - spacing
        )
      );
      const left = Math.min(
        Math.max(gutter, rect.left),
        viewportWidth - width - gutter
      );
      const top = openUpward
        ? Math.max(
          gutter,
          rect.top - Math.min(naturalHeight, maxHeight) - spacing
        )
        : Math.min(
          rect.bottom + spacing,
          viewportHeight - Math.min(naturalHeight, maxHeight) - gutter
        );

      setPopoverStyle({ left, maxHeight, openUpward, top, width });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={`lab-filter-chip${isOpen || value ? " is-active" : ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="lab-filter-chip__button"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="lab-filter-chip__content">
          <p className="lab-filter-chip__label type-body">{selectedLabel}</p>
        </span>
        <span className="lab-filter-chip__chevron">
          <ChevronIcon
            name="filterChevron"
            size={16}
            direction={isOpen ? "up" : "down"}
          />
        </span>
      </button>
      {isOpen && popoverStyle
        ? createPortal(
          <div
            ref={popoverRef}
            className={`lab-filter-popover lab-filter-popover--floating${popoverStyle.openUpward ? " is-open-upward" : ""}`}
            style={{
              left: popoverStyle.left,
              maxHeight: popoverStyle.maxHeight,
              overflowY: "auto",
              top: popoverStyle.top,
              width: popoverStyle.width,
            }}
          >
            <div className="lab-filter-popover__options">
              {options.map((option) => {
                const optionValue = option.id ?? option.value;
                const isSelected = optionValue === value;
                return (
                  <button
                    key={optionValue}
                    type="button"
                    className="lab-filter-option"
                    onClick={() => {
                      onChange(optionValue);
                      setIsOpen(false);
                    }}
                  >
                    <span
                      className="lab-filter-option__control"
                      aria-hidden="true"
                    >
                      <span
                        className={`lab-radio-indicator${isSelected ? " is-selected" : ""}`}
                      />
                    </span>
                    <p className="lab-filter-option__label type-body text-primary">
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )
        : null}
    </div>
  );
}

export function DashboardPerformanceCard({
  title,
  copy,
  tabs,
  activeTab,
  onTabSelect,
  headerActions,
}) {
  const activePanel = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section className="surface-panel dashboard-performance-card">
      <div className="surface-panel__header">
        <div className="surface-panel__title-group">
          <p className="surface-panel__title type-headline">{title}</p>
          <p className="surface-panel__copy type-subtitle-2 text-secondary">
            {copy}
          </p>
        </div>
        {headerActions ? (
          <div className="dashboard-performance-card__header-actions">
            {headerActions}
          </div>
        ) : null}
      </div>
      <div className="dashboard-performance-card__controls">
        <div
          className="dashboard-subtabs dashboard-performance-card__tabs"
          role="tablist"
        >
          {tabs.map((tab) => (
            <DashboardSubTabButton
              key={tab.id}
              label={tab.label}
              active={activePanel.id === tab.id}
              onClick={() => onTabSelect(tab.id)}
            />
          ))}
        </div>
      </div>
      {activePanel.copy ? (
        <p className="dashboard-performance-card__copy type-subtitle-2 text-secondary">
          {activePanel.copy}
        </p>
      ) : null}
      <div className="table-scroll">
        <table className="dashboard-ranked-table">
          <thead>
            <tr>
              <th className="dashboard-ranked-table__rank-col">
                <p className="type-title-3">#</p>
              </th>
              <th>
                <p className="type-title-3">{activePanel.labelColumn}</p>
              </th>
              <th className="dashboard-ranked-table__qty-col">
                <p className="type-title-3">Qty</p>
              </th>
              <th className="dashboard-ranked-table__revenue-col">
                <p className="type-title-3">Revenue</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {activePanel.rows.map((row, index) => (
              <tr key={row.label}>
                <td className="dashboard-ranked-table__rank-col">
                  <span className="dashboard-ranked-table__rank type-subtitle-2">
                    {index + 1}
                  </span>
                </td>
                <td>
                  <p className="type-subtitle-2">{row.label}</p>
                </td>
                <td className="dashboard-ranked-table__qty-col">
                  <p className="type-subtitle-2">{row.qty}</p>
                </td>
                <td className="dashboard-ranked-table__revenue-col">
                  <p className="type-subtitle-2">{row.revenue}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardIngredientStockAlertCard({
  title,
  copy,
  items,
  onViewDetail,
}) {
  return (
    <section className="surface-panel dashboard-stock-alert-card">
      <div className="surface-panel__header">
        <div className="surface-panel__title-group">
          <p className="surface-panel__title type-headline">{title}</p>
          <p className="surface-panel__copy type-subtitle-2 text-secondary">
            {copy}
          </p>
        </div>
        <div className="dashboard-performance-card__header-actions">
          <button
            type="button"
            className="dashboard-kpi-card__link type-body-bold"
            onClick={onViewDetail}
          >
            View Detail
          </button>
        </div>
      </div>
      <div className="dashboard-stock-alert-card__list">
        {items.map((item) => (
          <div key={item.label} className="dashboard-stock-alert-card__row">
            <div className="dashboard-stock-alert-card__row-copy">
              <p className="dashboard-stock-alert-card__row-title type-subtitle-2">
                {item.label}
              </p>
              <p className="dashboard-stock-alert-card__row-description type-body text-secondary">
                {item.copy}
              </p>
            </div>
            <div className="dashboard-stock-alert-card__row-meta">
              <LabButton
                label={item.actionLabel ?? "Restock"}
                variant="secondary"
                size="small"
                onClick={() => { }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardRankedTable({
  title,
  copy,
  labelColumn,
  valueColumn,
  rows,
  wide = false,
}) {
  return (
    <section
      className={`surface-panel${wide ? " dashboard-ranked-card--wide" : ""}`}
    >
      <div className="surface-panel__header">
        <div className="surface-panel__title-group">
          <p className="surface-panel__title type-headline">{title}</p>
          <p className="surface-panel__copy type-subtitle-2 text-secondary">
            {copy}
          </p>
        </div>
      </div>
      <div className="table-scroll">
        <table className="dashboard-ranked-table">
          <thead>
            <tr>
              <th className="dashboard-ranked-table__rank-col">
                <p className="type-title-3">#</p>
              </th>
              <th>
                <p className="type-title-3">{labelColumn}</p>
              </th>
              <th className="dashboard-ranked-table__value-col">
                <p className="type-title-3">{valueColumn}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label}>
                <td className="dashboard-ranked-table__rank-col">
                  <span className="dashboard-ranked-table__rank type-subtitle-2">
                    {index + 1}
                  </span>
                </td>
                <td>
                  <p className="type-subtitle-2">{row.label}</p>
                </td>
                <td className="dashboard-ranked-table__value-col">
                  <p className="type-subtitle-2">{row.value}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
