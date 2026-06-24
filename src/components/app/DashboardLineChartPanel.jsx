import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { DashboardKpiCard, DashboardKpiSummaryPrimaryCard, DashboardPerformanceCard, DashboardFinancialSummaryCard, DashboardSubTabButton} from "../dashboard/Presentational.jsx";
import { LabButton } from "../ui/Primitives.jsx";
import { createPortal } from "react-dom";
import { ChevronIcon } from "../icons/Icon.jsx";

export function DashboardLineChartPanel({
  title,
  copy,
  stats = [],
  yAxisFormatter = null,
  headerActions = null,
  comparisonFields = null,
  legendItems = null,
  selectedLegendId = null,
  onLegendSelect = null,
  tabs = null,
  activeTab = null,
  onTabSelect = null,
  navigationLabel = "",
  onNavigatePrev = null,
  onNavigateNext = null,
  canNavigatePrev = true,
  canNavigateNext = false,
  reverseTimeline = false,
  chartHeight = 196,
  minCanvasWidth = 504,
  labels,
  datasets,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const scrollRef = useRef(null);
  const tabsRef = useRef(null);
  const canvasRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltipPortalStyle, setTooltipPortalStyle] = useState(null);
  const [tabScrollState, setTabScrollState] = useState({
    left: false,
    right: false,
  });
  const pointSpacing = 72;
  const height = chartHeight;
  const topPadding = 16;
  const bottomPadding = 24;
  const dataPointCount = Math.max(labels.length, 1);
  const width = Math.max(
    minCanvasWidth,
    pointSpacing * dataPointCount,
    containerWidth
  );
  const plotHeight = height - topPadding - bottomPadding;
  const axisLineHeight = height - bottomPadding;
  const axisHeight = 22;
  const canvasHeight = height + 8 + axisHeight;
  const axisTop = height + 8;
  const trackWidth = pointSpacing * Math.max(labels.length, 1);
  const shouldCenterPoints = labels.length <= 7;
  const trackOffset = shouldCenterPoints
    ? Math.max(0, (width - trackWidth) / 2)
    : 0;
  const plotEndX = width;
  const allValues = datasets.flatMap((dataset) => dataset.values);
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;
  const yAxisTicks = Array.from({ length: 4 }, (_, index) => ({
    y: topPadding + (plotHeight / 3) * index,
    value: maxValue - (valueRange / 3) * index,
  }));
  const pointLayouts = labels.map((label, index) => {
    const bandIndex = reverseTimeline ? labels.length - 1 - index : index;
    const start = trackOffset + bandIndex * pointSpacing;

    return {
      key: `${label}-${index}`,
      label,
      start,
      center: start + pointSpacing / 2,
      width: pointSpacing,
    };
  });
  const fallbackPointX = width / 2;
  const getPointX = (index) => pointLayouts[index]?.center ?? fallbackPointX;

  const getPointString = (data) => {
    return data
      .map((value, index) => {
        const x = getPointX(index);
        const y = topPadding + ((maxValue - value) / valueRange) * plotHeight;
        return `${x},${y}`;
      })
      .join(" ");
  };
  const getPointY = (value) =>
    topPadding + ((maxValue - value) / valueRange) * plotHeight;
  const tooltipIndex =
    hoveredIndex === null || hoveredIndex < 0 || hoveredIndex >= labels.length
      ? null
      : hoveredIndex;
  const tooltipX = tooltipIndex === null ? 0 : getPointX(tooltipIndex);
  const tooltipLeft = Math.min(Math.max(tooltipX, 92), width - 92);
  const axisPoints = pointLayouts.map((point) => ({
    label: point.label,
    x: point.center,
    key: point.key,
  }));

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const y = topPadding + (plotHeight / 3) * index;
    return y;
  });

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

  function syncTooltipPortalPosition() {
    if (tooltipIndex === null) {
      setTooltipPortalStyle(null);
      return;
    }

    const canvasNode = canvasRef.current;
    if (!(canvasNode instanceof HTMLElement)) return;

    const rect = canvasNode.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const gutter = 12;
    const nextLeft = Math.min(
      Math.max(gutter + 92, rect.left + tooltipLeft),
      viewportWidth - gutter - 92
    );

    setTooltipPortalStyle((previous) => {
      const nextStyle = {
        left: nextLeft,
        top: rect.top + 8,
      };

      return previous &&
        previous.left === nextStyle.left &&
        previous.top === nextStyle.top
        ? previous
        : nextStyle;
    });
  }

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      scrollElement.scrollLeft = Math.max(
        0,
        scrollElement.scrollWidth - scrollElement.clientWidth
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [labels, datasets, reverseTimeline]);

  useLayoutEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      syncTabsScrollState();
    });

    function handleResize() {
      syncTabsScrollState();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [tabs?.length, activeTab, comparisonFields]);

  useLayoutEffect(() => {
    if (tooltipIndex === null) {
      setTooltipPortalStyle(null);
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      syncTooltipPortalPosition();
    });

    function handleReposition() {
      syncTooltipPortalPosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [tooltipIndex, tooltipLeft, width, canvasHeight]);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!(node instanceof HTMLElement)) return undefined;

    function syncContainerWidth() {
      setContainerWidth((previous) => {
        const nextValue = node.clientWidth;
        return previous === nextValue ? previous : nextValue;
      });
    }

    syncContainerWidth();

    const resizeObserver = new ResizeObserver(syncContainerWidth);
    resizeObserver.observe(node);
    window.addEventListener("resize", syncContainerWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncContainerWidth);
    };
  }, []);

  return (
    <section className="dashboard-line-chart-panel">
      <div className="dashboard-line-chart-panel__top">
        <div className="surface-panel__header dashboard-line-chart-panel__header">
          <div className="surface-panel__title-group">
            <p className="surface-panel__title type-headline">{title}</p>
            <p className="surface-panel__copy type-subtitle-2 text-secondary">
              {copy}
            </p>
          </div>
          {headerActions ? (
            <div className="dashboard-line-chart-panel__header-actions">
              {headerActions}
            </div>
          ) : null}
        </div>
        {tabs?.length || navigationLabel || comparisonFields ? (
          <div className="dashboard-line-chart-panel__controls">
            {tabs?.length ? (
              <div
                className="dashboard-line-chart-panel__tabs-shell"
                data-scroll-left={tabScrollState.left ? "true" : "false"}
                data-scroll-right={tabScrollState.right ? "true" : "false"}
              >
                <div
                  ref={tabsRef}
                  className="dashboard-subtabs"
                  onScroll={syncTabsScrollState}
                  role="tablist"
                >
                  {tabs.map((tab) => (
                    <DashboardSubTabButton
                      key={tab.id}
                      label={tab.label}
                      active={activeTab === tab.id}
                      onClick={() => onTabSelect?.(tab.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div />
            )}
            {comparisonFields ? (
              <div className="dashboard-comparison-fields">
                {comparisonFields}
              </div>
            ) : navigationLabel ? (
              <div className="dashboard-time-navigation">
                <button
                  type="button"
                  className="dashboard-time-navigation__button"
                  onClick={onNavigatePrev}
                  disabled={!canNavigatePrev}
                  aria-label="Show previous period"
                >
                  <ChevronIcon name="chevronLeft" size={20} direction="left" />
                </button>
                <p className="dashboard-time-navigation__label type-body-bold">
                  {navigationLabel}
                </p>
                <button
                  type="button"
                  className="dashboard-time-navigation__button"
                  onClick={onNavigateNext}
                  disabled={!canNavigateNext}
                  aria-label="Show newer period"
                >
                  <ChevronIcon name="chevronLeft" size={20} direction="right" />
                </button>
              </div>
            ) : (
              <div />
            )}
          </div>
        ) : null}
      </div>
      {stats.length ? (
        <div className="dashboard-chart-stat-grid">
          {stats.map(([label, value]) => (
            <div key={label} className="dashboard-chart-stat">
              <p className="dashboard-chart-stat__label type-body text-secondary">
                {label}
              </p>
              {Array.isArray(value) ? (
                <div className="dashboard-chart-stat__value-stack">
                  {value.map((line, index) => (
                    <p
                      key={`${label}-${index}`}
                      className="dashboard-chart-stat__value type-title-3"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="dashboard-chart-stat__value type-title-3">
                  {value}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
      <div className="dashboard-line-chart-wrap">
        <div className="dashboard-line-chart-panel__legend">
          {(legendItems ?? datasets).map((dataset) =>
            onLegendSelect ? (
              <button
                key={dataset.id ?? dataset.label}
                type="button"
                className={`dashboard-line-chart-panel__legend-item dashboard-line-chart-panel__legend-item--radio${selectedLegendId === dataset.id ? " is-active" : ""
                  }`}
                role="radio"
                aria-checked={selectedLegendId === dataset.id}
                onClick={() => onLegendSelect(dataset.id)}
              >
                <span
                  className="dashboard-line-chart-panel__legend-radio"
                  aria-hidden="true"
                />
                <span
                  className="dashboard-line-chart-panel__legend-swatch"
                  style={{ background: dataset.color }}
                />
                <span className="type-body text-secondary">
                  {dataset.label}
                </span>
              </button>
            ) : (
              <span
                key={dataset.id ?? dataset.label}
                className="dashboard-line-chart-panel__legend-item"
              >
                <span
                  className="dashboard-line-chart-panel__legend-swatch"
                  style={{ background: dataset.color }}
                />
                <span className="type-body text-secondary">
                  {dataset.label}
                </span>
              </span>
            )
          )}
        </div>
        <div className="dashboard-line-chart-layout">
          <div className="dashboard-line-chart__y-axis">
            <div
              className="dashboard-line-chart__y-axis-inner"
              style={{ height: `${axisLineHeight}px` }}
            >
              {yAxisTicks.map((tick) => (
                <p
                  key={`y-axis-${tick.y}`}
                  className="dashboard-line-chart__y-axis-label type-description"
                  style={{ top: `${tick.y}px` }}
                >
                  {(yAxisFormatter ?? String)(tick.value)}
                </p>
              ))}
            </div>
          </div>
          <div className="dashboard-line-chart-scroll" ref={scrollRef}>
            <div
              ref={canvasRef}
              className="dashboard-line-chart__canvas"
              style={{ width, height: `${canvasHeight}px` }}
            >
              <svg
                className="dashboard-line-chart"
                viewBox={`0 0 ${width} ${canvasHeight}`}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-hidden="true"
                style={{ width: `${width}px`, height: `${canvasHeight}px` }}
              >
                {pointLayouts.map((point, index) => (
                  <rect
                    key={`hover-column-${point.key}`}
                    x={point.start}
                    y={0}
                    width={point.width}
                    height={canvasHeight}
                    fill={
                      tooltipIndex === index
                        ? "rgba(46, 91, 255, 0.06)"
                        : "transparent"
                    }
                    onMouseEnter={() => setHoveredIndex(index)}
                  />
                ))}
                {gridLines.map((y) => (
                  <line
                    key={y}
                    className="dashboard-line-chart__grid"
                    x1={0}
                    x2={plotEndX}
                    y1={y}
                    y2={y}
                  />
                ))}
                <line
                  className="dashboard-line-chart__baseline"
                  x1={0}
                  x2={plotEndX}
                  y1={height - bottomPadding}
                  y2={height - bottomPadding}
                />
                {datasets.map((dataset) => (
                  <g key={dataset.label}>
                    <polyline
                      className="dashboard-line-chart__series"
                      points={getPointString(dataset.values)}
                      style={{
                        stroke: dataset.color,
                        strokeDasharray: dataset.dashArray ?? undefined,
                        strokeWidth: dataset.strokeWidth ?? 3,
                      }}
                    />
                    {dataset.values.map((value, index) => {
                      const x = getPointX(index);
                      const y = getPointY(value);

                      return (
                        <circle
                          key={`${dataset.label}-${labels[index]}-${value}`}
                          className="dashboard-line-chart__dot"
                          cx={x}
                          cy={y}
                          r={dataset.dotRadius ?? 4}
                          style={{ fill: dataset.color }}
                        />
                      );
                    })}
                  </g>
                ))}
                {axisPoints.map((point) => (
                  <text
                    key={point.key}
                    className="dashboard-line-chart-panel__axis-label type-description"
                    x={point.x}
                    y={axisTop + 2}
                    dominantBaseline="hanging"
                    textAnchor="middle"
                  >
                    {point.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
      {tooltipIndex !== null && tooltipPortalStyle
        ? createPortal(
          <div
            className="dashboard-line-chart__tooltip dashboard-line-chart__tooltip--portal"
            style={{
              left: `${tooltipPortalStyle.left}px`,
              top: `${tooltipPortalStyle.top}px`,
            }}
          >
            <div className="dashboard-line-chart__tooltip-copy">
              <p className="dashboard-line-chart__tooltip-title type-body-bold">
                {labels[tooltipIndex]}
              </p>
              {datasets.map((dataset) => {
                const rawValue =
                  dataset.rawValues?.[tooltipIndex] ?? dataset.values[tooltipIndex];
                const formattedValue = dataset.formatValue
                  ? dataset.formatValue(rawValue)
                  : String(rawValue);

                return (
                  <div
                    key={`${dataset.label}-${tooltipIndex}`}
                    className="dashboard-line-chart__tooltip-row"
                  >
                    <span
                      className="dashboard-line-chart-panel__legend-swatch"
                      style={{ background: dataset.color }}
                    />
                    <p className="type-description">{dataset.label}</p>
                    <p className="type-body-bold">{formattedValue}</p>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )
        : null}
    </section>
  );
}

