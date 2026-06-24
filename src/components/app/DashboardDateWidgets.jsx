import { useState, useRef, useEffect } from "react";
import { ChevronIcon } from "../icons/Icon.jsx";
import { LabButton } from "../ui/Primitives.jsx";
import { ALL_BUSINESS_UNITS_LABEL, formatDayMonth, formatMonthYear, formatShortMonth, getDaysInMonth, shiftDateByDays, shiftDateByMonths, DASHBOARD_REPORT_TIME_RANGE_OPTIONS } from "../../constants/dashboard.js";
import { SIMULATED_PAIRING_REQUEST_DEVICES } from "../../constants/devices.js";

export function formatDashboardReportDateRangeLabel(range) {
  const start = parseDashboardReportDateValue(range.start);
  const end = parseDashboardReportDateValue(range.end);

  if (!start && !end) return "Select Date Range";

  const startDate = start ?? end;
  const endDate = end ?? start;

  return `${formatDashboardReportDate(startDate)} - ${formatDashboardReportDate(
    endDate
  )}`;
}

export function formatDashboardReportCompactDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

export function formatDashboardReportCompactDateRange(range) {
  const start = parseDashboardReportDateValue(range.start);
  const end = parseDashboardReportDateValue(range.end);

  if (!start && !end) return "Select Date";

  const startDate = start ?? end;
  const endDate = end ?? start;

  return `${formatDashboardReportCompactDate(
    startDate
  )} - ${formatDashboardReportCompactDate(endDate)}`;
}

export function formatDashboardReportSelectedDateRangeLabel(range) {
  const start = parseDashboardReportDateValue(range?.start ?? "");
  const end = parseDashboardReportDateValue(range?.end ?? "");

  if (!start && !end) return "Custom Date";

  const startDate = start ?? end;
  const endDate = end ?? start;

  return `${formatDashboardReportCompactDate(
    startDate
  )} - ${formatDashboardReportCompactDate(endDate)}`;
}

export function getNormalizedDashboardReportRange(range) {
  const start = range?.start ?? "";
  const end = range?.end ?? "";

  if (!start && !end) {
    return { start: "", end: "" };
  }

  if (!start) {
    return { start: end, end };
  }

  if (!end) {
    return { start, end: start };
  }

  return start <= end ? { start, end } : { start: end, end: start };
}

export function buildDashboardCalendarMonth(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = shiftDateByDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = shiftDateByDays(gridStart, index);
    return {
      date,
      value: formatDashboardReportDateValue(date),
      dayNumber: date.getDate(),
      isOutside: date.getMonth() !== monthDate.getMonth(),
    };
  });
}

export function isDashboardDateWithinRange(value, start, end) {
  if (!start || !end) return false;
  return value > start && value < end;
}

export function DashboardRangeCalendar({
  containerRef = null,
  range,
  onChange,
  align = "start",
  style = null,
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const normalizedRange = getNormalizedDashboardReportRange(range);
    const anchorValue =
      normalizedRange.start || formatDashboardReportDateValue(new Date());
    const anchorDate = parseDashboardReportDateValue(anchorValue) ?? new Date();
    return new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  });
  const [selectionStep, setSelectionStep] = useState("start");
  const normalizedRange = getNormalizedDashboardReportRange(range);
  const leftMonth = visibleMonth;
  const rightMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    1
  );
  const leftDays = buildDashboardCalendarMonth(leftMonth);
  const rightDays = buildDashboardCalendarMonth(rightMonth);

  useEffect(() => {
    const anchorValue =
      normalizedRange.start || formatDashboardReportDateValue(new Date());
    const anchorDate = parseDashboardReportDateValue(anchorValue) ?? new Date();
    setVisibleMonth((previous) => {
      if (
        previous.getFullYear() === anchorDate.getFullYear() &&
        previous.getMonth() === anchorDate.getMonth()
      ) {
        return previous;
      }

      return new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    });
  }, [normalizedRange.start]);

  const handleSelectDate = (nextValue) => {
    if (selectionStep === "start") {
      onChange("start", nextValue);
      onChange("end", nextValue);
      setSelectionStep("end");
      return;
    }

    const currentStart = normalizedRange.start || nextValue;
    const nextRange =
      nextValue < currentStart
        ? { start: nextValue, end: currentStart }
        : { start: currentStart, end: nextValue };

    onChange("start", nextRange.start);
    onChange("end", nextRange.end);
    setSelectionStep("start");
  };

  const renderMonth = (monthDate, days) => (
    <div className="lab-filter-popover__calendar-month">
      <div className="lab-filter-popover__calendar-month-header">
        <button
          type="button"
          className="lab-filter-popover__calendar-nav"
          onClick={() =>
            setVisibleMonth(
              (previous) =>
                new Date(previous.getFullYear(), previous.getMonth() - 1, 1)
            )
          }
          aria-label="Show previous month"
        >
          <ChevronIcon name="chevronLeft" size={20} direction="left" />
        </button>
        <div className="lab-filter-popover__calendar-month-title">
          <p className="type-subtitle-1">
            {monthDate.toLocaleDateString("en-US", { month: "short" })}
          </p>
          <p className="type-subtitle-1">{monthDate.getFullYear()}</p>
        </div>
        <button
          type="button"
          className="lab-filter-popover__calendar-nav"
          onClick={() =>
            setVisibleMonth(
              (previous) =>
                new Date(previous.getFullYear(), previous.getMonth() + 1, 1)
            )
          }
          aria-label="Show next month"
        >
          <ChevronIcon name="chevronLeft" size={20} direction="right" />
        </button>
      </div>
      <div className="lab-filter-popover__calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <p
            key={`${monthDate.getMonth()}-${day}`}
            className="lab-filter-popover__calendar-weekday type-body text-secondary"
          >
            {day}
          </p>
        ))}
      </div>
      <div className="lab-filter-popover__calendar-grid">
        {days.map((day) => {
          const isStart =
            normalizedRange.start && day.value === normalizedRange.start;
          const isEnd =
            normalizedRange.end && day.value === normalizedRange.end;
          const isSingleDay = isStart && isEnd;
          const isInRange = isDashboardDateWithinRange(
            day.value,
            normalizedRange.start,
            normalizedRange.end
          );

          return (
            <button
              key={day.value}
              type="button"
              className={`lab-filter-popover__calendar-day${day.isOutside ? " is-outside" : ""
                }${isInRange ? " is-in-range" : ""}${isStart ? " is-range-start" : ""
                }${isEnd ? " is-range-end" : ""}${isSingleDay ? " is-single-day" : ""
                }`}
              onClick={() => handleSelectDate(day.value)}
            >
              <span className="type-body">{day.dayNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`lab-filter-popover__calendar lab-filter-popover__calendar--compact${align === "end" ? " is-align-end" : ""
        }${style?.openUpward ? " is-open-upward" : ""}${style?.width && style.width < 560 ? " is-narrow" : ""
        }`}
      style={{
        left: style?.left,
        maxHeight: style?.maxHeight,
        overflowY: style?.maxHeight ? "auto" : undefined,
        top: style?.top,
        width: style?.width,
      }}
    >
      <div className="lab-filter-popover__calendar-months">
        {renderMonth(leftMonth, leftDays)}
        {renderMonth(rightMonth, rightDays)}
      </div>
    </div>
  );
}

export function DashboardDateRangeField({
  value,
  onChange,
  ariaLabel,
  align = "start",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const label = formatDashboardReportDateRangeLabel(value);

  return (
    <div ref={rootRef} className="dashboard-report-date-range-field">
      <button
        type="button"
        className="dashboard-report-date-range-field__button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <p className="dashboard-report-date-range-field__value type-body">
          {label}
        </p>
        <span className="lab-filter-chip__chevron">
          <ChevronIcon
            name="filterChevron"
            size={16}
            direction={isOpen ? "up" : "down"}
          />
        </span>
      </button>
      {isOpen ? (
        <div
          className={`lab-filter-popover dashboard-report-date-range-field__popover${align === "end" ? " is-align-end" : ""
            }`}
        >
          <p className="lab-filter-popover__title type-title-3">Custom Date</p>
          <div className="dashboard-report-date-range-field__inputs">
            <DashboardReportDateField
              value={value.start}
              onChange={(nextValue) => onChange("start", nextValue)}
              ariaLabel={`${ariaLabel} start date`}
            />
            <DashboardReportDateField
              value={value.end}
              onChange={(nextValue) => onChange("end", nextValue)}
              ariaLabel={`${ariaLabel} end date`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardReportDateField({ value, onChange, ariaLabel }) {
  return (
    <label className="dashboard-report-date-field">
      <input
        type="date"
        className="type-body"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
      />
    </label>
  );
}

export function generateRandomPairingCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const prefix = Array.from(
    { length: 3 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(100 + Math.random() * 900);
  return `${prefix} - ${part1} - ${part2}`;
}

export function getSimulatedPairingRequestDevice(deviceType, pairingCode = "") {
  const candidates =
    SIMULATED_PAIRING_REQUEST_DEVICES[deviceType] ??
    SIMULATED_PAIRING_REQUEST_DEVICES["Point of Sales (POS)"];
  const seed = `${deviceType}-${pairingCode}`
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return candidates[seed % candidates.length];
}

export function isDevicePairingExpired(device, now = Date.now()) {
  return Boolean(
    device &&
    device.status === "Pending" &&
    typeof device.pairingExpiresAt === "number" &&
    device.pairingExpiresAt <= now
  );
}

export function expirePendingDevice(device) {
  return {
    ...device,
    status: "Expired",
    pairingCode: "-",
    pairingExpiresAt: undefined,
    deviceConnected: null,
    connectedDevices: [],
    deviceOs: null,
  };
}

