import React, { useEffect, useRef, useState } from "react";
import { ChevronIcon, Icon } from "../../../components/icons/Icon.jsx";
import { LabCheckbox, Toggle } from "../../../components/ui/Primitives.jsx";

const ROLE_ACCESS_LEVELS = [
  { id: "none", label: "No Access" },
  { id: "view", label: "View Only" },
  { id: "edit", label: "Edit Access (Create + Edit)" },
  { id: "full", label: "Full Access (Create + Edit + Delete)" },
];

const ROLE_PERMISSION_ICON_BY_MODULE = {
  "user-management": "userList",
  "role-management": "roleManagement",
  "entity-management": "businessUnit",
  catalog: "catalog",
  category: "catalog",
  unit: "catalog",
  modifier: "catalog",
  device: "deviceManagement",
  "grouped-device": "deviceManagement",
  "table-management": "businessUnit",
  "device-management": "roleManagement",
  cashier: "deviceManagement",
  "kitchen-display-system": "deviceManagement",
  "printer-settings": "deviceManagement",
};

function hasElevatedPermission(level) {
  return level === "edit" || level === "full";
}

function createAdditionalAccessMap(module, overrides = {}) {
  return (module.additionalAccess ?? []).reduce(
    (additionalAccess, access) => ({
      ...additionalAccess,
      [access.id]: Boolean(overrides?.[access.id]),
    }),
    {}
  );
}

function normalizePermission(module, permission) {
  const level =
    typeof permission === "string" ? permission : permission?.level ?? "none";

  return {
    level,
    additionalAccess: createAdditionalAccessMap(
      module,
      typeof permission === "string" ? {} : permission?.additionalAccess ?? {}
    ),
  };
}

function buildPermissionEntry(module, level, additionalAccess = {}) {
  return {
    level,
    additionalAccess: hasElevatedPermission(level)
      ? createAdditionalAccessMap(module, additionalAccess)
      : createAdditionalAccessMap(module),
  };
}

export function RolePermissionSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedLevel =
    ROLE_ACCESS_LEVELS.find((level) => level.id === value) ??
    ROLE_ACCESS_LEVELS[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="catalog-detail-field"
      style={{ width: "100%", maxWidth: "none" }}
    >
      <span className="catalog-detail-field__shell">
        <button
          type="button"
          className="catalog-detail-field__trigger"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <p className="catalog-detail-field__value type-subtitle-2 catalog-detail-field__input--ellipsis">
            {selectedLevel.label}
          </p>
          <span className="catalog-detail-field__chevron">
            <ChevronIcon
              name="selectChevron"
              size={24}
              direction={isOpen ? "up" : "down"}
            />
          </span>
        </button>
        {isOpen ? (
          <div className="catalog-detail-field__menu">
            {ROLE_ACCESS_LEVELS.map((level) => {
              const isSelected = level.id === value;

              return (
                <button
                  key={level.id}
                  type="button"
                  className={`catalog-detail-field__option${isSelected ? " is-selected" : ""}`}
                  onClick={() => {
                    onChange(level.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="catalog-detail-field__option-copy">
                    <p
                      className={`catalog-detail-field__option-label ${isSelected ? "type-title-3" : "type-subtitle-2"}`}
                    >
                      {level.label}
                    </p>
                  </span>
                  {isSelected ? (
                    <span
                      className="catalog-detail-field__option-check"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </span>
    </div>
  );
}

function RolePermissionAdditionalAccess({
  module,
  permission,
  isEditing,
  onChange,
}) {
  if (!module.additionalAccess?.length || !hasElevatedPermission(permission.level)) {
    return null;
  }

  const enabledAccess = module.additionalAccess.filter(
    (access) => Boolean(permission.additionalAccess?.[access.id])
  );

  if (!isEditing && !enabledAccess.length) {
    return null;
  }

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        padding: "2px 0 6px 42px",
      }}
    >
      <div
        style={{
          borderLeft: "1px solid var(--neutral-line-outline)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          paddingLeft: "16px",
        }}
      >
        {isEditing ? (
          module.additionalAccess.map((access) => {
            const checked = Boolean(permission.additionalAccess?.[access.id]);

            return (
              <label
                key={access.id}
                style={{
                  alignItems: "center",
                  cursor: "pointer",
                  display: "flex",
                  gap: "12px",
                  minWidth: 0,
                }}
              >
                <LabCheckbox
                  checked={checked}
                  disabled={!isEditing}
                  ariaLabel={access.label}
                  onChange={() =>
                    onChange(
                      buildPermissionEntry(module, permission.level, {
                        ...permission.additionalAccess,
                        [access.id]: !checked,
                      })
                    )
                  }
                />
                <span
                  className="type-subtitle-2 catalog-detail-field__input--ellipsis"
                  style={{ fontSize: "14px" }}
                >
                  {access.label}
                </span>
              </label>
            );
          })
        ) : enabledAccess.length ? (
          enabledAccess.map((access) => (
            <div
              key={access.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--neutral-on-surface-secondary)",
                  flexShrink: 0,
                }}
              />
              <span
                className="type-subtitle-2 catalog-detail-field__input--ellipsis"
                style={{ fontSize: "14px" }}
              >
                {access.label}
              </span>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}

export function RolePermissionRow({
  module,
  permission,
  onChange,
  isEditing,
  isLast = false,
}) {
  const normalizedPermission = normalizePermission(module, permission);
  const label =
    ROLE_ACCESS_LEVELS.find((level) => level.id === normalizedPermission.level)
      ?.label ?? "No Access";
  const iconName = ROLE_PERMISSION_ICON_BY_MODULE[module.id] ?? "roleManagement";

  return (
    <div
      className="role-permission-row"
      style={{
        display: "grid",
        alignItems: "center",
        gap: "10px",
        gridTemplateColumns: "minmax(0, 1fr) minmax(200px, 1fr)",
        padding: "10px 0",
        borderBottom: isLast ? "none" : "1px solid var(--neutral-line-outline)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "var(--neutral-background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neutral-on-surface-secondary)",
            flexShrink: 0,
          }}
        >
          <Icon name={iconName} className="lab-icon lab-icon--18" alt="" />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}
        >
          <p
            className="type-subtitle-2 catalog-detail-field__input--ellipsis"
            style={{ fontWeight: 600, fontSize: "14px" }}
          >
            {module.label}
          </p>
          {module.children && (
            <p
              className="type-body text-tertiary catalog-detail-field__input--ellipsis"
              style={{ fontSize: "11px" }}
            >
              {module.children.join(", ")}
            </p>
          )}
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          minWidth: 0,
        }}
      >
        {isEditing ? (
          <RolePermissionSelect
            value={normalizedPermission.level}
            onChange={(nextLevel) =>
              onChange(
                buildPermissionEntry(
                  module,
                  nextLevel,
                  normalizedPermission.additionalAccess
                )
              )
            }
          />
        ) : (
          <span
            className={`status-pill status-pill--small status-pill--${normalizedPermission.level === "none" ? "muted" : "primary"}`}
          >
            <span className="type-body">{label}</span>
          </span>
        )}
      </div>
      <RolePermissionAdditionalAccess
        module={module}
        permission={normalizedPermission}
        isEditing={isEditing}
        onChange={onChange}
      />
    </div>
  );
}

function RolePermissionsGroup({
  group,
  permissions,
  onChange,
  isEditing,
  gIdx,
  sectionEnabled = true,
  onSectionToggle,
  error = "",
}) {
  const showSectionStatus = !isEditing && !sectionEnabled;
  const showSectionError = isEditing && sectionEnabled && Boolean(error);
  const shouldShowBody = sectionEnabled;

  return (
    <section
      key={group.id}
      style={{
        marginTop: gIdx === 0 ? "0" : "12px",
        border: "1px solid var(--neutral-line-outline)",
        borderRadius: "14px",
        background: "var(--neutral-surface-primary)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          borderBottom:
            shouldShowBody || showSectionError
              ? "1px solid var(--neutral-line-outline)"
              : "none",
        }}
      >
        <p
          className="type-subtitle-2 text-tertiary"
          style={{
            textTransform: "uppercase",
            fontSize: "10px",
            letterSpacing: "0.8px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          {group.group}
        </p>
        {isEditing ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <p className="type-body text-secondary" style={{ margin: 0 }}>
              {sectionEnabled ? "On" : "Off"}
            </p>
            <Toggle
              checked={sectionEnabled}
              onChange={() => onSectionToggle?.(group.id, !sectionEnabled)}
              ariaLabel={`${group.group} access`}
            />
          </div>
        ) : showSectionStatus ? (
          <span className="status-pill status-pill--small status-pill--muted">
            <span className="type-body">No Access</span>
          </span>
        ) : null}
      </div>
      {showSectionError ? (
        <div style={{ padding: "12px 16px 0" }}>
          <p className="catalog-detail-field__error type-body" style={{ margin: 0 }}>
            {error}
          </p>
        </div>
      ) : null}
      {shouldShowBody ? (
        <div style={{ padding: "0 16px", animation: "fadeIn 0.2s ease-out" }}>
          {group.modules.map((module, moduleIdx) => (
            <RolePermissionRow
              key={module.id}
              module={module}
              permission={permissions[module.id]}
              onChange={(nextPermission) => onChange(module.id, nextPermission)}
              isEditing={isEditing}
              isLast={moduleIdx === group.modules.length - 1}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RolePermissionsList({
  permissions,
  onChange,
  isEditing,
  structure,
  sectionStates = {},
  onSectionToggle,
  sectionErrors = {},
  accessError = "",
}) {
  return (
    <div className="role-permissions-list">
      {structure.map((group, gIdx) => (
        <RolePermissionsGroup
          key={group.id}
          group={group}
          permissions={permissions}
          onChange={onChange}
          isEditing={isEditing}
          gIdx={gIdx}
          sectionEnabled={sectionStates[group.id] !== false}
          onSectionToggle={onSectionToggle}
          error={sectionErrors[group.id]}
        />
      ))}
      {accessError ? (
        <p
          className="catalog-detail-field__error type-body"
          style={{ margin: "12px 0 0" }}
        >
          {accessError}
        </p>
      ) : null}
    </div>
  );
}
