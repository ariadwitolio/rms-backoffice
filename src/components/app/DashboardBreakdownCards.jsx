import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { DashboardDoughnutSummaryCard, DashboardStackedMetricCard, DashboardReportTabButton, MetricCard, MetricFilterCard, DashboardViewModeTabs, DashboardSubTabButton, DashboardDetailTabButton } from "../dashboard/Presentational.jsx";
import { formatDashboardReportCompactDate, formatDashboardReportCompactDateRange, formatDashboardReportSelectedDateRangeLabel } from "./DashboardDateWidgets.jsx";
import { formatSalesSummaryAxisValue } from "../../utils/salesSummaryUtils.js";

export function PendingCountdown({ expiresAt, showLabel = true }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const computeTimeLeft = () => {
      const now = Date.now();
      return Math.max(0, Math.floor((expiresAt - now) / 1000));
    };

    setTimeLeft(computeTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const expiryLabel = timeLeft > 0 ? timeString : "Expired";

  return (
    <span className="type-subtitle-2" style={{ color: "var(--status-orange-primary)", fontVariantNumeric: "tabular-nums" }}>
      {timeLeft > 0 ? `${showLabel ? "Expires in " : ""}${timeString}` : "Expired"}
    </span>
  );
}

export function PricingRuleTabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`pricing-rule-tab type-subtitle-2${active ? " is-active" : ""
        }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function DashboardBreakdownSummaryCard({
  title,
  copy,
  tabs,
  activeTab,
  onTabSelect,
  headerActions,
  controlActions,
  totalSalesDisplayValue,
  totalOrdersDisplayValue,
}) {
  const tabsRef = useRef(null);
  const legendRef = useRef(null);
  const [tabScrollState, setTabScrollState] = useState({
    left: false,
    right: false,
  });
  const [legendScrollState, setLegendScrollState] = useState({
    bottom: false,
  });
  const activePanel = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const rows = activePanel?.rows ?? [];
  const doughnutTotalValue = rows.reduce(
    (sum, row) => sum + (row.scaledValue ?? row.valueValue ?? 0),
    0
  );
  const safeTotal = Math.max(1, doughnutTotalValue);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let consumed = 0;

  function syncTabsScrollState() {
    const node = tabsRef.current;
    if (!(node instanceof HTMLElement)) return;

    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    const scrollLeft = Math.max(0, node.scrollLeft);
    const nextState = {
      left: scrollLeft > 1,
      right: scrollLeft < maxScrollLeft - 1,
    };

    setTabScrollState((previous) =>
      previous.left === nextState.left && previous.right === nextState.right
        ? previous
        : nextState
    );
  }

  function syncLegendScrollState() {
    const node = legendRef.current;
    if (!(node instanceof HTMLElement)) return;

    const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
    const nextState = {
      bottom: maxScrollTop > 1 && node.scrollTop < maxScrollTop - 1,
    };

    setLegendScrollState((previous) =>
      previous.bottom === nextState.bottom ? previous : nextState
    );
  }

  useLayoutEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      syncTabsScrollState();
      syncLegendScrollState();
    });

    function handleResize() {
      syncTabsScrollState();
      syncLegendScrollState();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab, rows.length]);

  return (
    <section className="surface-panel dashboard-breakdown-card">
      <div className="dashboard-breakdown-card__top">
        <div className="surface-panel__header dashboard-breakdown-card__header">
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
            className="dashboard-breakdown-card__tabs-shell"
            data-scroll-left={tabScrollState.left ? "true" : "false"}
            data-scroll-right={tabScrollState.right ? "true" : "false"}
          >
            <div
              ref={tabsRef}
              className="dashboard-subtabs dashboard-performance-card__tabs dashboard-breakdown-card__tabs"
              onScroll={syncTabsScrollState}
              role="tablist"
            >
              {tabs.map((tab) => (
                <DashboardSubTabButton
                  key={tab.id}
                  label={tab.label}
                  active={activePanel?.id === tab.id}
                  onClick={() => onTabSelect(tab.id)}
                />
              ))}
            </div>
          </div>
          {controlActions ? (
            <div className="dashboard-performance-card__header-actions">
              {controlActions}
            </div>
          ) : null}
        </div>
      </div>
      {rows.length ? (
        <div className="dashboard-breakdown-card__body">
          <div className="dashboard-breakdown-card__chart-wrap">
            <svg
              className="dashboard-breakdown-card__chart"
              viewBox="0 0 176 176"
              aria-hidden="true"
            >
              <circle
                className="dashboard-doughnut-card__track"
                cx="88"
                cy="88"
                r={radius}
              />
              {rows.map((row) => {
                const segmentValue = row.scaledValue ?? row.valueValue ?? 0;
                const segmentLength =
                  (segmentValue / safeTotal) * circumference;
                const dashArray = `${segmentLength} ${circumference - segmentLength
                  }`;
                const dashOffset = -consumed;
                consumed += segmentLength;

                return (
                  <circle
                    key={row.label}
                    className="dashboard-doughnut-card__segment"
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke={row.color ?? "var(--feature-brand-primary)"}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
              <circle
                className="dashboard-doughnut-card__center"
                cx="88"
                cy="88"
                r="34"
              />
            </svg>
            <div className="dashboard-breakdown-card__total">
              <p className="dashboard-breakdown-card__total-label text-secondary">
                Total Sales
              </p>
              <p className="dashboard-breakdown-card__total-value">
                {totalSalesDisplayValue}
              </p>
              <p className="dashboard-breakdown-card__total-orders">
                {totalOrdersDisplayValue}
              </p>
            </div>
          </div>
          <div
            ref={legendRef}
            className="dashboard-breakdown-card__legend"
            data-scroll-bottom={legendScrollState.bottom ? "true" : "false"}
            onScroll={syncLegendScrollState}
          >
            {rows.map((row) => (
              <div
                key={row.label}
                className="dashboard-breakdown-card__legend-row"
              >
                <div className="dashboard-breakdown-card__legend-copy">
                  <span
                    className="dashboard-doughnut-card__legend-dot"
                    style={{
                      background: row.color ?? "var(--feature-brand-primary)",
                    }}
                  />
                  <div className="dashboard-breakdown-card__legend-text">
                    <p className="dashboard-breakdown-card__legend-label type-body-bold">
                      {row.label}
                    </p>
                    <p className="dashboard-breakdown-card__legend-meta type-description text-secondary">
                      {row.copy}
                    </p>
                  </div>
                </div>
                <p className="dashboard-breakdown-card__legend-value type-subtitle-2">
                  {row.displayValue ?? row.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="dashboard-bar-summary-card__empty type-body">
          No summary data available
        </p>
      )}
    </section>
  );
}

export function DashboardBarSummaryCard({
  title,
  copy,
  tabs,
  activeTab,
  onTabSelect,
  headerActions,
}) {
  const [hoveredBarId, setHoveredBarId] = useState(null);
  const activePanel = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const rows = activePanel?.rows ?? [];
  const maxValue = Math.max(1, ...rows.map((row) => row.valueValue ?? 0));
  const ticks = Array.from({ length: 4 }, (_, index) => {
    const value = Math.round((maxValue / 3) * (3 - index));
    return {
      id: `${activePanel?.id ?? "summary"}-tick-${index}`,
      value,
      label: formatSalesSummaryAxisValue("sales", value),
      top: `${(index / 3) * 100}%`,
    };
  });

  return (
    <section className="surface-panel dashboard-bar-summary-card">
      <div className="dashboard-bar-summary-card__top">
        <div className="surface-panel__header dashboard-bar-summary-card__header">
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
        <div className="dashboard-line-chart-panel__controls">
          <div
            className="dashboard-subtabs dashboard-performance-card__tabs dashboard-bar-summary-card__tabs"
            role="tablist"
          >
            {tabs.map((tab) => (
              <DashboardSubTabButton
                key={tab.id}
                label={tab.label}
                active={activePanel?.id === tab.id}
                onClick={() => onTabSelect(tab.id)}
              />
            ))}
          </div>
          <div />
        </div>
      </div>
      {rows.length ? (
        <div className="dashboard-bar-summary-card__chart-layout">
          <div className="dashboard-bar-summary-card__y-axis">
            {ticks.map((tick) => (
              <p
                key={tick.id}
                className="dashboard-bar-summary-card__y-axis-label type-description"
              >
                {tick.label}
              </p>
            ))}
          </div>
          <div className="dashboard-bar-summary-card__canvas">
            <div className="dashboard-bar-summary-card__plot">
              {ticks.map((tick) => (
                <span
                  key={`${tick.id}-line`}
                  className="dashboard-bar-summary-card__grid-line"
                  aria-hidden="true"
                  style={{ top: tick.top }}
                />
              ))}
              <div className="dashboard-bar-summary-card__bars">
                {rows.map((row) => {
                  const numericValue = row.valueValue ?? 0;
                  const heightPercent = Math.max(
                    12,
                    (numericValue / maxValue) * 100
                  );

                  return (
                    <div
                      key={row.label}
                      className="dashboard-bar-summary-card__bar-column"
                      onMouseEnter={() => setHoveredBarId(row.label)}
                      onMouseLeave={() => setHoveredBarId(null)}
                    >
                      {hoveredBarId === row.label ? (
                        <span
                          className="dashboard-bar-summary-card__hover-band"
                          aria-hidden="true"
                        />
                      ) : null}
                      {hoveredBarId === row.label ? (
                        <div
                          className="dashboard-line-chart__tooltip"
                          style={{ left: "50%" }}
                        >
                          <div className="dashboard-line-chart__tooltip-copy">
                            <p className="dashboard-line-chart__tooltip-title type-body-bold">
                              {row.label}
                            </p>
                            <div className="dashboard-line-chart__tooltip-row">
                              <span
                                className="dashboard-line-chart-panel__legend-swatch"
                                style={{
                                  background:
                                    row.color ?? "var(--feature-brand-primary)",
                                }}
                              />
                              <p className="type-description">{row.copy}</p>
                              <p className="type-body-bold">
                                {row.displayValue ?? row.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <div className="dashboard-bar-summary-card__bar-wrap">
                        <span
                          className="dashboard-bar-summary-card__bar"
                          style={{
                            background:
                              row.color ?? "var(--feature-brand-primary)",
                            height: `${Math.min(heightPercent, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="dashboard-bar-summary-card__x-label type-description">
                        {row.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="dashboard-bar-summary-card__empty type-body">
          No summary data available
        </p>
      )}
    </section>
  );
}

