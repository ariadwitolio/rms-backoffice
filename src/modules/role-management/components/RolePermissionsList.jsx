import React, { useEffect, useRef, useState } from "react";
import { ChevronIcon, Icon } from "../../../components/icons/Icon.jsx";
import { LabCheckbox, Toggle } from "../../../components/ui/Primitives.jsx";
import { isModuleDependencyEnabled } from "../../../utils/roleUtils.js";

function getModuleDependencyDisabledState(module, permissions) {
  return !isModuleDependencyEnabled(module, permissions);
}

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
  "menu-settings": "settings",
  "device-management": "roleManagement",
  cashier: "deviceManagement",
  "kitchen-display-system": "deviceManagement",
  payment: "deviceManagement",
  "printer-settings": "deviceManagement",
  "printer-settings-payment": "deviceManagement",
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

export function RolePermissionSelect({
  value,
  onChange,
  permittedLevels,
  levelLabels,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const levels = permittedLevels
    ? ROLE_ACCESS_LEVELS.filter((l) => permittedLevels.includes(l.id))
    : ROLE_ACCESS_LEVELS;
  const selectedLevel =
    levels.find((level) => level.id === value) ?? levels[0];
  const getLabel = (level) => levelLabels?.[level.id] ?? level.label;

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
      className={`catalog-detail-field${disabled ? " is-disabled" : ""}`}
      style={{ width: "100%", maxWidth: "none" }}
    >
      <span className={`catalog-detail-field__shell${disabled ? " is-disabled" : ""}`}>
        <button
          type="button"
          className="catalog-detail-field__trigger"
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={() => { if (!disabled) setIsOpen((previous) => !previous); }}
        >
          <p
            className={`catalog-detail-field__value type-subtitle-2 catalog-detail-field__input--ellipsis${disabled ? " text-tertiary" : ""}`}
          >
            {getLabel(selectedLevel)}
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
            {levels.map((level) => {
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
                      {getLabel(level)}
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
  isChild = false,
  disabled = false,
}) {
  const normalizedPermission = normalizePermission(
    module,
    disabled ? "none" : permission
  );
  const baseLabel =
    ROLE_ACCESS_LEVELS.find((level) => level.id === normalizedPermission.level)
      ?.label ?? "No Access";
  const label = module.levelLabels?.[normalizedPermission.level] ?? baseLabel;
  const iconName = ROLE_PERMISSION_ICON_BY_MODULE[module.id] ?? "roleManagement";
  const isBinaryFullAccessModule =
    !module.dependsOnModuleId &&
    module.permittedLevels?.length === 2 &&
    module.permittedLevels.includes("none") &&
    module.permittedLevels.includes("full");
  const showSelect = isEditing && !isBinaryFullAccessModule;

  return (
    <div
      className="role-permission-row"
      style={{
        display: "grid",
        alignItems: "center",
        gap: "10px",
        gridTemplateColumns: "minmax(0, 1fr) minmax(200px, 1fr)",
        padding: "10px 0",
        borderBottom: "none",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}
      >
        {isChild ? null : (
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
        )}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}
        >
          <p
            className="type-subtitle-2 catalog-detail-field__input--ellipsis"
            style={{
              fontWeight: isChild ? 500 : 600,
              fontSize: "14px",
              opacity: isChild ? 0.85 : 1,
            }}
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
        {showSelect ? (
          <RolePermissionSelect
            value={normalizedPermission.level}
            permittedLevels={module.permittedLevels}
            levelLabels={module.levelLabels}
            disabled={disabled}
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

function ParentMenuRow({
  menuItem,
  isExpanded,
  onToggle,
}) {
  // Map parent menu IDs directly to icon names
  const parentIconMap = {
    "catalog-management": "catalog",
    "device-management": "deviceManagement",
  };
  const iconName = parentIconMap[menuItem.id] ?? "roleManagement";

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: isExpanded ? "10px 0 4px" : "10px 0",
        border: "none",
        background: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
      aria-expanded={isExpanded}
      aria-label={`${menuItem.label}, ${isExpanded ? "expanded" : "collapsed"}`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flex: 1,
          minWidth: 0,
          minHeight: "46px",
        }}
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
        <p
          className="type-subtitle-2"
          style={{
            fontWeight: 600,
            fontSize: "14px",
            margin: 0,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {menuItem.label}
        </p>
      </div>
      <ChevronIcon
        name="filterChevron"
        size={16}
        direction={isExpanded ? "up" : "down"}
        color="var(--neutral-on-surface-secondary)"
        style={{ flexShrink: 0 }}
      />
    </button>
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
  showSectionToggle = true,
}) {
  const [expandedMenus, setExpandedMenus] = useState(() => {
    // Default: all parent menus are expanded
    if (!group.menuHierarchy) return {};
    return group.menuHierarchy
      .filter((item) => item.isParent)
      .reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
  });

  const showSectionStatus = !isEditing && !sectionEnabled;
  const showSectionError = isEditing && sectionEnabled && Boolean(error);
  const shouldShowBody = sectionEnabled;

  const toggleMenuExpanded = (menuId) => {
    setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const hasMenuHierarchy = Boolean(group.menuHierarchy);

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
        {isEditing && showSectionToggle ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <p className="type-body text-secondary" style={{ margin: 0 }}>
              {sectionEnabled ? "Access Granted" : "No Access"}
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
          {hasMenuHierarchy ? (
            // Render with menu hierarchy (parent and default menu rows)
            group.menuHierarchy.map((menuItem, itemIdx) => {
              if (menuItem.isParent) {
                // Parent Menu Row
                const isExpanded = expandedMenus[menuItem.id] !== false;

                return (
                  <div
                    key={menuItem.id}
                    style={{
                      borderBottom:
                        itemIdx === group.menuHierarchy.length - 1
                          ? "none"
                          : "1px solid var(--neutral-line-outline)",
                    }}
                  >
                    {/* Parent Menu Row - No access dropdown */}
                    <ParentMenuRow
                      menuItem={menuItem}
                      isExpanded={isExpanded}
                      onToggle={() => toggleMenuExpanded(menuItem.id)}
                    />

                    {/* Child Menu Rows (indented) */}
                    {isExpanded && menuItem.children && (
                      <div>
                        {menuItem.children.map((childId, childIdx) => {
                          const childModule = group.modules.find(
                            (m) => m.id === childId
                          );
                          if (!childModule) return null;

                          return (
                            <div
                              key={childModule.id}
                              style={{
                                paddingLeft: "40px",
                                paddingTop: childIdx === 0 ? "2px" : "0",
                                paddingBottom:
                                  childIdx === menuItem.children.length - 1
                                    ? "6px"
                                    : "0",
                                borderBottom:
                                  childIdx === menuItem.children.length - 1
                                    ? "none"
                                    : "1px solid var(--neutral-line-outline)",
                              }}
                            >
                              <RolePermissionRow
                                module={childModule}
                                permission={permissions[childModule.id]}
                                onChange={(nextPermission) =>
                                  onChange(childModule.id, nextPermission)
                                }
                                isEditing={isEditing}
                                isChild={true}
                                disabled={getModuleDependencyDisabledState(
                                  childModule,
                                  permissions
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Default/Standalone Menu Row (no indent)
                const standaloneModule = group.modules.find(
                  (m) => m.id === menuItem.id
                );
                if (!standaloneModule) return null;

                return (
                  <div
                    key={standaloneModule.id}
                    style={{
                      borderBottom:
                        itemIdx === group.menuHierarchy.length - 1
                          ? "none"
                          : "1px solid var(--neutral-line-outline)",
                    }}
                  >
                    <div style={{ padding: "0" }}>
                      <RolePermissionRow
                        module={standaloneModule}
                        permission={permissions[standaloneModule.id]}
                        onChange={(nextPermission) =>
                          onChange(standaloneModule.id, nextPermission)
                        }
                        isEditing={isEditing}
                        isChild={false}
                        disabled={getModuleDependencyDisabledState(
                          standaloneModule,
                          permissions
                        )}
                      />
                    </div>
                  </div>
                );
              }
            })
          ) : (
            // Render flat list (legacy fallback)
            group.modules.map((module, moduleIdx) => (
              <div
                key={module.id}
                style={{
                  borderBottom:
                    moduleIdx === group.modules.length - 1
                      ? "none"
                      : "1px solid var(--neutral-line-outline)",
                }}
              >
                <RolePermissionRow
                  module={module}
                  permission={permissions[module.id]}
                  onChange={(nextPermission) => onChange(module.id, nextPermission)}
                  isEditing={isEditing}
                  isChild={false}
                  disabled={getModuleDependencyDisabledState(module, permissions)}
                />
              </div>
            ))
          )}
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
  nonToggleSectionIds = [],
  forcedOpenSectionIds = [],
}) {
  return (
    <div className="role-permissions-list">
      {structure.map((group, gIdx) => {
        const isForcedOpen = forcedOpenSectionIds.includes(group.id);

        return (
          <RolePermissionsGroup
            key={group.id}
            group={group}
            permissions={permissions}
            onChange={onChange}
            isEditing={isEditing}
            gIdx={gIdx}
            sectionEnabled={isForcedOpen || sectionStates[group.id] !== false}
            onSectionToggle={onSectionToggle}
            error={sectionErrors[group.id]}
            showSectionToggle={!nonToggleSectionIds.includes(group.id)}
          />
        );
      })}
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
