import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronIcon, Icon } from "../icons/Icon.jsx";
import { LabButton, SelectShell, LabCheckbox } from "../ui/Primitives.jsx";
import { DashboardRangeCalendar, formatDashboardReportCompactDateRange, formatDashboardReportSelectedDateRangeLabel } from "./DashboardDateWidgets.jsx";

export function SingleFilterChip({ value, options, onChange }) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option, count: null }
      : {
        value: option.value ?? option.label ?? "",
        label: option.label ?? String(option.value ?? ""),
        count:
          typeof option.count === "number" && Number.isFinite(option.count)
            ? option.count
            : null,
      }
  );

  return (
    <label className="lab-filter-chip">
      <select
        className="type-body"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.count !== null
              ? `${option.label} (${new Intl.NumberFormat("en-US").format(
                option.count
              )})`
              : option.label}
          </option>
        ))}
      </select>
      <span className="lab-filter-chip__chevron">
        <ChevronIcon name="filterChevron" size={16} direction="down" />
      </span>
    </label>
  );
}

export function FilterChip({ label, values, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverStyle, setPopoverStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const normalizedValues = Array.isArray(values) ? values : [];
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option, count: null, indentLevel: 0 }
      : {
        value: option.value ?? option.label ?? "",
        label: option.label ?? String(option.value ?? ""),
        count:
          typeof option.count === "number" && Number.isFinite(option.count)
            ? option.count
            : null,
        indentLevel:
          typeof option.indentLevel === "number" && option.indentLevel > 0
            ? option.indentLevel
            : 0,
      }
  );
  const filteredOptions = normalizedOptions.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      if (rootRef.current && !rootRef.current.contains(target)) {
        setIsOpen(false);
        setSearch("");
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    function updatePopoverPosition() {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gutter = 12;
      const spacing = 8;
      const width = Math.min(
        Math.max(rect.width, 220),
        viewportWidth - gutter * 2
      );
      const naturalHeight = Math.min(popover?.scrollHeight ?? 320, 360);
      const availableBelow = viewportHeight - rect.bottom - gutter;
      const availableAbove = rect.top - gutter;
      const openUpward =
        availableBelow < Math.min(naturalHeight, 220) &&
        availableAbove > availableBelow;
      const maxHeight = Math.max(
        180,
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

      setPopoverStyle({
        left,
        maxHeight,
        openUpward,
        top,
        width,
      });
    }

    updatePopoverPosition();
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [filteredOptions.length, isOpen, options.length, search]);

  let chipText = label;
  if (normalizedValues.length === 1) {
    chipText =
      normalizedOptions.find((option) => option.value === normalizedValues[0])
        ?.label ?? normalizedValues[0];
  } else if (normalizedValues.length > 1) {
    chipText = label;
  }

  return (
    <div
      ref={rootRef}
      className={`lab-filter-chip${isOpen || normalizedValues.length ? " is-active" : ""
        }`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="lab-filter-chip__button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span className="lab-filter-chip__content">
          {normalizedValues.length > 1 ? (
            <span className="lab-filter-chip__badge type-description">
              {normalizedValues.length}
            </span>
          ) : null}
          <p
            className={`lab-filter-chip__label ${normalizedValues.length > 1 ? "type-body" : "type-body"
              }`}
          >
            {chipText}
          </p>
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
            className={`lab-filter-popover lab-filter-popover--floating${popoverStyle.openUpward ? " is-open-upward" : ""
              }`}
            style={{
              left: popoverStyle.left,
              maxHeight: popoverStyle.maxHeight,
              top: popoverStyle.top,
              width: popoverStyle.width,
            }}
          >
            <p className="lab-filter-popover__title type-title-3">{label}</p>
            <label className="lab-searchbar lab-filter-popover__search">
              <Icon
                name="search"
                className="lab-icon lab-icon--20"
                alt="Search"
              />
              <input
                type="search"
                className="type-body"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="lab-filter-popover__options">
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const isChecked = normalizedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className="lab-filter-option"
                      style={option.indentLevel > 0 ? { paddingLeft: `${option.indentLevel * 28}px` } : undefined}
                      onClick={() =>
                        onChange(
                          isChecked
                            ? normalizedValues.filter(
                              (item) => item !== option.value
                            )
                            : [...normalizedValues, option.value]
                        )
                      }
                    >
                      <LabCheckbox
                        checked={isChecked}
                        onChange={() => { }}
                        ariaLabel={option.label}
                      />
                      <p className="lab-filter-option__label type-body text-primary">
                        {option.label}
                      </p>
                      {option.count !== null ? (
                        <span className="lab-filter-option__count type-body text-secondary">
                          ({new Intl.NumberFormat("en-US").format(option.count)})
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="lab-filter-popover__empty type-body text-secondary">
                  No options found
                </p>
              )}
            </div>
          </div>,
          document.body
        )
        : null}
    </div>
  );
}

export function SingleSelectFilterChip({
  label,
  value,
  options,
  onChange,
  align = "start",
  customDateRange = null,
  onCustomDateChange = null,
  customDateOption = "Custom Date",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState(null);
  const [calendarStyle, setCalendarStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const customDateButtonRef = useRef(null);
  const calendarRef = useRef(null);
  const shouldAutoOpenCustomDateRef = useRef(false);
  const supportsCustomDate =
    customDateRange &&
    typeof onCustomDateChange === "function" &&
    options.includes(customDateOption);
  const displayValue =
    supportsCustomDate && value === customDateOption
      ? formatDashboardReportSelectedDateRangeLabel(customDateRange)
      : value || label;

  function getPopoverPosition() {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger) return null;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gutter = 12;
    const spacing = 8;
    const preferredWidth = Math.min(
      Math.max(rect.width, 248),
      viewportWidth - gutter * 2
    );
    const naturalHeight = Math.min(
      popover?.scrollHeight ??
      (supportsCustomDate && value === customDateOption ? 320 : 240),
      420
    );
    const availableBelow = viewportHeight - rect.bottom - gutter;
    const availableAbove = rect.top - gutter;
    const openUpward =
      availableBelow < Math.min(naturalHeight, 220) &&
      availableAbove > availableBelow;
    const maxHeight = Math.max(
      180,
      Math.min(
        420,
        openUpward ? availableAbove - spacing : availableBelow - spacing
      )
    );
    const width = preferredWidth;
    const desiredLeft = align === "end" ? rect.right - width : rect.left;
    const left = Math.min(
      Math.max(gutter, desiredLeft),
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

    return {
      left,
      maxHeight,
      openUpward,
      top,
      width,
    };
  }

  function getCalendarPosition(triggerElement = customDateButtonRef.current) {
    if (!triggerElement) return null;

    const calendar = calendarRef.current;
    const rect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gutter = 12;
    const spacing = 12;
    const preferredWidth = Math.min(520, viewportWidth - gutter * 2);
    const naturalHeight = Math.min(calendar?.scrollHeight ?? 360, 420);
    const availableBelow = viewportHeight - rect.bottom - gutter;
    const availableAbove = rect.top - gutter;
    const openUpward =
      availableBelow < Math.min(naturalHeight, 280) &&
      availableAbove > availableBelow;
    const maxHeight = Math.max(
      220,
      Math.min(
        420,
        openUpward ? availableAbove - spacing : availableBelow - spacing
      )
    );
    const width = preferredWidth;
    const desiredLeft = align === "end" ? rect.right - width : rect.left;
    const left = Math.min(
      Math.max(gutter, desiredLeft),
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

    return {
      left,
      maxHeight,
      openUpward,
      top,
      width,
    };
  }

  function openCustomDateCalendar(
    triggerElement = customDateButtonRef.current
  ) {
    const nextStyle = getCalendarPosition(triggerElement);
    setCalendarStyle(nextStyle);
    setIsCalendarOpen(true);
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target) ||
        calendarRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
      setIsCalendarOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (value !== customDateOption) {
      setIsCalendarOpen(false);
    }
  }, [customDateOption, value]);

  useEffect(() => {
    if (isOpen) return;
    setPopoverStyle(null);
    setCalendarStyle(null);
    setIsCalendarOpen(false);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    function updatePopoverPosition() {
      const nextStyle = getPopoverPosition();
      if (nextStyle) {
        setPopoverStyle(nextStyle);
      }
    }

    function updateCalendarPosition() {
      if (!isCalendarOpen) return;
      const nextStyle = getCalendarPosition();
      if (nextStyle) {
        setCalendarStyle(nextStyle);
      }
    }

    updatePopoverPosition();
    updateCalendarPosition();
    const frameId = window.requestAnimationFrame(() => {
      updatePopoverPosition();
      updateCalendarPosition();
    });
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("resize", updateCalendarPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    window.addEventListener("scroll", updateCalendarPosition, true);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("resize", updateCalendarPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
      window.removeEventListener("scroll", updateCalendarPosition, true);
    };
  }, [
    align,
    customDateRange,
    isCalendarOpen,
    isOpen,
    supportsCustomDate,
    value,
  ]);

  useEffect(() => {
    if (
      !isOpen ||
      !supportsCustomDate ||
      value !== customDateOption ||
      !shouldAutoOpenCustomDateRef.current
    ) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      openCustomDateCalendar();
      shouldAutoOpenCustomDateRef.current = false;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [customDateOption, isOpen, supportsCustomDate, value]);

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
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span className="lab-filter-chip__content">
          <p className="lab-filter-chip__label type-body">{displayValue}</p>
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
            className={`lab-filter-popover lab-filter-popover--floating${popoverStyle.openUpward ? " is-open-upward" : ""
              }`}
            style={{
              left: popoverStyle.left,
              maxHeight: popoverStyle.maxHeight,
              overflowY: "auto",
              top: popoverStyle.top,
              width: popoverStyle.width,
            }}
          >
            <p className="lab-filter-popover__title type-title-3">{label}</p>
            <div className="lab-filter-popover__options">
              {options.map((option) => {
                const isSelected = option === value;
                return (
                  <button
                    key={option}
                    type="button"
                    className="lab-filter-option"
                    onClick={() => {
                      onChange(option);
                      if (supportsCustomDate && option === customDateOption) {
                        shouldAutoOpenCustomDateRef.current = true;
                        setIsOpen(true);
                        setIsCalendarOpen(false);
                        setCalendarStyle(null);
                        return;
                      }

                      setIsOpen(false);
                      setIsCalendarOpen(false);
                    }}
                  >
                    <span
                      className="lab-filter-option__control"
                      aria-hidden="true"
                    >
                      <span
                        className={`lab-radio-indicator${isSelected ? " is-selected" : ""
                          }`}
                      />
                    </span>
                    <p className="lab-filter-option__label type-body text-primary">
                      {option}
                    </p>
                  </button>
                );
              })}
            </div>
            {supportsCustomDate && value === customDateOption ? (
              <div className="lab-filter-popover__custom-field">
                <button
                  ref={customDateButtonRef}
                  type="button"
                  className="lab-filter-popover__custom-date-button"
                  aria-expanded={isCalendarOpen}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={() => {
                    if (isCalendarOpen) {
                      setIsCalendarOpen(false);
                      return;
                    }

                    openCustomDateCalendar();
                  }}
                >
                  <p className="lab-filter-popover__custom-date-value type-body">
                    {formatDashboardReportCompactDateRange(customDateRange)}
                  </p>
                  <Icon
                    name="pricingRuleCalendar"
                    className="lab-filter-popover__custom-date-icon"
                    alt=""
                  />
                </button>
                {isCalendarOpen
                  ? createPortal(
                    <DashboardRangeCalendar
                      containerRef={calendarRef}
                      range={customDateRange}
                      onChange={onCustomDateChange}
                      align={align}
                      style={calendarStyle}
                    />,
                    document.body
                  )
                  : null}
              </div>
            ) : null}
          </div>,
          document.body
        )
        : null}
    </div>
  );
}

