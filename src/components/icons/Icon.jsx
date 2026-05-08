import { useState } from "react";
import { ASSETS } from "../../constants/assets.js";
import { defineIcon } from "../../utils/ui.js";

const ICON_STROKE_ATTRS =
  'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

const ICON_DEFINITIONS = {
  logo: defineIcon(
    "0 0 48 48",
    `
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#006BFF" />
      <path d="M17 14h6v14h8v6H17z" fill="#ffffff" />
    `
  ),
  sidebarIndicator: defineIcon(
    "0 0 4 36",
    '<rect x="0" y="0" width="4" height="36" rx="2" fill="currentColor" />'
  ),
  sidebarChevron: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  collapseChevron: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  selectChevron: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  filterChevron: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  footerRowsChevron: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  footerRowsChevronDisabled: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  chevronLeft: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  paginationPrev: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  paginationNext: defineIcon(
    "0 0 6 12",
    '<path d="M5 1 1 6l4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />'
  ),
  dashboard: defineIcon(
    "0 0 24 24",
    `
      <rect x="4" y="4" width="7" height="7" rx="1.5" ${ICON_STROKE_ATTRS} />
      <rect x="13" y="4" width="7" height="7" rx="1.5" ${ICON_STROKE_ATTRS} />
      <rect x="4" y="13" width="7" height="7" rx="1.5" ${ICON_STROKE_ATTRS} />
      <rect x="13" y="13" width="7" height="7" rx="1.5" ${ICON_STROKE_ATTRS} />
    `
  ),
  catalog: defineIcon(
    "0 0 24 24",
    `
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" ${ICON_STROKE_ATTRS} />
      <path d="M4 8.5 12 13l8-4.5" ${ICON_STROKE_ATTRS} />
      <path d="M12 13v7" ${ICON_STROKE_ATTRS} />
    `
  ),
  businessUnit: defineIcon(
    "0 0 24 24",
    `
      <path d="M5 20V7.5L12 4l7 3.5V20" ${ICON_STROKE_ATTRS} />
      <path d="M9 10h.01M15 10h.01M9 13.5h.01M15 13.5h.01" ${ICON_STROKE_ATTRS} />
      <path d="M11 20v-3h2v3" ${ICON_STROKE_ATTRS} />
    `
  ),
  userList: defineIcon(
    "0 0 24 24",
    `
      <circle cx="9" cy="9" r="3" ${ICON_STROKE_ATTRS} />
      <path d="M4.5 18c.9-2.2 2.7-3.5 4.5-3.5s3.6 1.3 4.5 3.5" ${ICON_STROKE_ATTRS} />
      <circle cx="17" cy="10" r="2.2" ${ICON_STROKE_ATTRS} />
      <path d="M14.8 17.8c.5-1.4 1.7-2.4 3.2-2.8" ${ICON_STROKE_ATTRS} />
    `
  ),
  roleAccess: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 4 6.5 6v4.8c0 4.1 2.1 6.8 5.5 8.2 3.4-1.4 5.5-4.1 5.5-8.2V6z" ${ICON_STROKE_ATTRS} />
      <path d="m9.5 11.8 1.8 1.8 3.4-3.8" ${ICON_STROKE_ATTRS} />
    `
  ),
  roleManagement: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 4 6.5 6v4.8c0 4.1 2.1 6.8 5.5 8.2 3.4-1.4 5.5-4.1 5.5-8.2V6z" ${ICON_STROKE_ATTRS} />
      <path d="m9.5 11.8 1.8 1.8 3.4-3.8" ${ICON_STROKE_ATTRS} />
    `
  ),
  settings: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 4.5v2.1M12 17.4v2.1M6.7 6.7l1.5 1.5M15.8 15.8l1.5 1.5M4.5 12h2.1M17.4 12h2.1M6.7 17.3l1.5-1.5M15.8 8.2l1.5-1.5" ${ICON_STROKE_ATTRS} />
      <circle cx="12" cy="12" r="3.4" ${ICON_STROKE_ATTRS} />
    `
  ),
  deviceManagement: defineIcon(
    "0 0 24 24",
    `
      <rect x="6" y="3" width="12" height="18" rx="2" ${ICON_STROKE_ATTRS} />
      <path d="M12 18h.01M9 6h6" ${ICON_STROKE_ATTRS} />
    `
  ),
  notification: defineIcon(
    "0 0 24 24",
    `
      <path d="M7.5 16.5h9l-1.1-1.9V11a3.9 3.9 0 0 0-7.8 0v3.6z" ${ICON_STROKE_ATTRS} />
      <path d="M10 18.2a2.2 2.2 0 0 0 4 0" ${ICON_STROKE_ATTRS} />
    `
  ),
  add: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 5v14M5 12h14" ${ICON_STROKE_ATTRS} />
    `
  ),
  search: defineIcon(
    "0 0 24 24",
    `
      <circle cx="11" cy="11" r="5.5" ${ICON_STROKE_ATTRS} />
      <path d="m15.2 15.2 4.3 4.3" ${ICON_STROKE_ATTRS} />
    `
  ),
  infoBlue: defineIcon(
    "0 0 24 24",
    `
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <rect x="11.15" y="10" width="1.7" height="6.1" rx=".85" fill="#ffffff" />
      <circle cx="12" cy="7.5" r="1.15" fill="#ffffff" />
    `
  ),
  lock: defineIcon(
    "0 0 24 24",
    `
      <path d="M8.2 10V8.5a3.8 3.8 0 1 1 7.6 0V10" ${ICON_STROKE_ATTRS} />
      <rect x="5.6" y="10" width="12.8" height="9.4" rx="2.2" ${ICON_STROKE_ATTRS} />
      <path d="M12 13.5v2.6" ${ICON_STROKE_ATTRS} />
    `
  ),
  sellingTimeTooltip: defineIcon(
    "0 0 24 24",
    `
      <circle cx="12" cy="12" r="8.3" ${ICON_STROKE_ATTRS} />
      <path d="M12 10.4v4.2" ${ICON_STROKE_ATTRS} />
      <circle cx="12" cy="7.7" r=".8" fill="currentColor" />
    `
  ),
  pricingRuleCalendar: defineIcon(
    "0 0 24 24",
    `
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" ${ICON_STROKE_ATTRS} />
      <path d="M4 9.5h16M8 3.8v3.4M16 3.8v3.4" ${ICON_STROKE_ATTRS} />
    `
  ),
  modalClose: defineIcon(
    "0 0 24 24",
    `
      <path d="M6 6 18 18M18 6 6 18" ${ICON_STROKE_ATTRS} />
    `
  ),
  edit: defineIcon(
    "0 0 24 24",
    `
      <path d="m14.8 5.3 3.9 3.9M6 18l3.5-.8 8.7-8.7a1.7 1.7 0 0 0 0-2.4l-.3-.3a1.7 1.7 0 0 0-2.4 0l-8.7 8.7z" ${ICON_STROKE_ATTRS} />
    `
  ),
  delete: defineIcon(
    "0 0 24 24",
    `
      <path d="M8 7h8M9 7V5.8c0-.8.6-1.3 1.4-1.3h3.2c.8 0 1.4.5 1.4 1.3V7M7.2 7l.7 11.1c0 .8.7 1.4 1.5 1.4h5.2c.8 0 1.5-.6 1.5-1.4L16.8 7M10.3 10.2v5.5M13.7 10.2v5.5" ${ICON_STROKE_ATTRS} />
    `
  ),
  panelDelete: defineIcon(
    "0 0 24 24",
    `
      <path d="M8 7h8M9 7V5.8c0-.8.6-1.3 1.4-1.3h3.2c.8 0 1.4.5 1.4 1.3V7M7.2 7l.7 11.1c0 .8.7 1.4 1.5 1.4h5.2c.8 0 1.5-.6 1.5-1.4L16.8 7M10.3 10.2v5.5M13.7 10.2v5.5" ${ICON_STROKE_ATTRS} />
    `
  ),
  inlineCancel: defineIcon(
    "0 0 24 24",
    `
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" ${ICON_STROKE_ATTRS} />
    `
  ),
  inlineConfirm: defineIcon(
    "0 0 24 24",
    `
      <path d="m5.8 12.5 4.1 4.1 8.3-8.3" ${ICON_STROKE_ATTRS} />
    `
  ),
  download: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 5.2v8.6M8.5 10.7 12 14.2l3.5-3.5M6 17.8h12" ${ICON_STROKE_ATTRS} />
    `
  ),
  tableSeparator: defineIcon(
    "0 0 1 32",
    '<rect x="0" y="0" width="1" height="32" fill="#D4D4D4" />'
  ),
  modifierReorder: defineIcon(
    "0 0 24 24",
    `
      <path d="M5 10h14M5 14h14" ${ICON_STROKE_ATTRS} />
    `
  ),
  modifierOptionAdd: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 6v12M6 12h12" ${ICON_STROKE_ATTRS} />
    `
  ),
  panelClose: defineIcon(
    "0 0 24 24",
    `
      <path d="M6 6 18 18M18 6 6 18" ${ICON_STROKE_ATTRS} />
    `
  ),
  metricOrders: defineIcon(
    "0 0 24 24",
    `
      <path d="M7 8.5h10M7 12h10M7 15.5h6M5.5 4.5h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" ${ICON_STROKE_ATTRS} />
    `
  ),
  metricAov: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 4.5v15M8.5 8.5c0-1.66 1.57-3 3.5-3s3.5 1.34 3.5 3-1.57 3-3.5 3-3.5 1.34-3.5 3 1.57 3 3.5 3 3.5-1.34 3.5-3" ${ICON_STROKE_ATTRS} />
    `
  ),
  metricGross: defineIcon(
    "0 0 24 24",
    `
      <path d="M5.5 17.5 10 13l3 3 5.5-7" ${ICON_STROKE_ATTRS} />
      <path d="M5 5.5v13h14" ${ICON_STROKE_ATTRS} />
    `
  ),
  metricNet: defineIcon(
    "0 0 24 24",
    `
      <path d="M5.5 17.5 10 13l3 3 5.5-7" ${ICON_STROKE_ATTRS} />
      <path d="M15.5 9h3V6" ${ICON_STROKE_ATTRS} />
    `
  ),
  metricDiscount: defineIcon(
    "0 0 24 24",
    `
      <path d="M7.5 5.5h6l5 5-7 8-6-6 2-7Z" ${ICON_STROKE_ATTRS} />
      <circle cx="10" cy="9" r="1.1" fill="currentColor" />
    `
  ),
  metricTax: defineIcon(
    "0 0 24 24",
    `
      <path d="M7 5.5h10l1.5 4.5-6.5 8-6.5-8L7 5.5Z" ${ICON_STROKE_ATTRS} />
      <path d="M12 8v6" ${ICON_STROKE_ATTRS} />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    `
  ),
  metricRefund: defineIcon(
    "0 0 24 24",
    `
      <path d="M8 8H5v3M5.5 11A7 7 0 1 0 8 6.2" ${ICON_STROKE_ATTRS} />
      <path d="M12 9v6M9 12h6" ${ICON_STROKE_ATTRS} />
    `
  ),
  metricVoid: defineIcon(
    "0 0 24 24",
    `
      <circle cx="12" cy="12" r="7.5" ${ICON_STROKE_ATTRS} />
      <path d="M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5" ${ICON_STROKE_ATTRS} />
    `
  ),
  disconnect: defineIcon(
    "0 0 24 24",
    `
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" ${ICON_STROKE_ATTRS} />
    `
  ),
  connect: defineIcon(
    "0 0 24 24",
    `
      <circle cx="12" cy="12" r="8" ${ICON_STROKE_ATTRS} />
      <path d="m8.5 12.25 2.25 2.25 4.75-4.75" ${ICON_STROKE_ATTRS} />
    `
  ),
  power: defineIcon(
    "0 0 24 24",
    `
      <path d="M12 3v7" ${ICON_STROKE_ATTRS} />
      <path d="M7.05 6.55a7 7 0 1 0 9.9 0" ${ICON_STROKE_ATTRS} />
    `
  ),
  copy: defineIcon(
    "0 0 24 24",
    `
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" ${ICON_STROKE_ATTRS} />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" ${ICON_STROKE_ATTRS} />
    `
  ),
};

function Icon({ name, className = "lab-icon lab-icon--20", alt = "", color }) {
  const [assetFailed, setAssetFailed] = useState(false);
  const definition = ICON_DEFINITIONS[name];
  const resolvedClassName = ["lab-icon", className, `lab-icon--asset-${name}`]
    .filter(Boolean)
    .join(" ");

  const iconColor = color || (name === "filterChevron" ? "#C2C2C2" : undefined);

  if (ASSETS[name] && !assetFailed && !iconColor) {
    return (
      <img
        src={ASSETS[name]}
        alt={alt}
        className={resolvedClassName}
        loading="lazy"
        decoding="async"
        onError={() => setAssetFailed(true)}
      />
    );
  }

  if (definition) {
    return (
      <svg
        viewBox={definition.viewBox}
        className={resolvedClassName}
        role={alt ? "img" : undefined}
        aria-hidden={alt ? undefined : true}
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        style={iconColor ? { color: iconColor, fill: iconColor } : undefined}
      >
        {alt ? <title>{alt}</title> : null}
        <g dangerouslySetInnerHTML={{ __html: definition.markup }} />
      </svg>
    );
  }

  return null;
}

function ChevronIcon({
  name,
  size = 16,
  direction = "left",
  className = "",
  alt = "",
  color,
}) {
  return (
    <span
      className={`lab-chevron lab-chevron--${size}${className ? ` ${className}` : ""
        }`}
    >
      <Icon
        name={name}
        className={`lab-chevron__glyph lab-chevron__glyph--${direction}`}
        alt={alt}
        color={color}
      />
    </span>
  );
}
export { Icon, ChevronIcon };
