import React, { useEffect, useRef, useState } from "react";
import { ChevronIcon, Icon } from "../../../components/icons/Icon.jsx";
import { Toggle } from "../../../components/ui/Primitives.jsx";

const ROLE_ACCESS_LEVELS = [
  { id: "none", label: "No Access" },
  { id: "view", label: "View Only" },
  { id: "edit", label: "Edit Access (Create + Edit)" },
  { id: "full", label: "Full Access (Create + Edit + Delete)" },
];

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
      style={{ width: "100%", maxWidth: "320px" }}
    >
      <span className="catalog-detail-field__shell">
        <button
          type="button"
          className="catalog-detail-field__trigger"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <p className="catalog-detail-field__value type-subtitle-1">
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

export function RolePermissionRow({
  module,
  value,
  onChange,
  isEditing,
  isLast = false,
}) {
  const label =
    ROLE_ACCESS_LEVELS.find((level) => level.id === value)?.label ?? "No Access";

  return (
    <div
      className="role-permission-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "16px 0",
        borderBottom: isLast ? "none" : "1px solid var(--neutral-line-outline)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "var(--neutral-background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >
          <Icon name="businessUnit" className="lab-icon lab-icon--20" alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p className="type-subtitle-1" style={{ fontWeight: 600 }}>
            {module.label}
          </p>
          {module.children && (
            <p className="type-body text-tertiary" style={{ fontSize: "12px" }}>
              {module.children.join(", ")}
            </p>
          )}
        </div>
      </div>
      <div
        style={{
          minWidth: "240px",
          display: "flex",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        {isEditing ? (
          <RolePermissionSelect value={value} onChange={onChange} />
        ) : (
          <span
            className={`status-pill status-pill--small status-pill--${value === "none" ? "muted" : "primary"}`}
          >
            <span className="type-body">{label}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function RolePermissionsGroup({ group, permissions, onChange, isEditing, gIdx }) {
  const [isOpen, setIsOpen] = useState(Boolean(isEditing));

  useEffect(() => {
    if (isEditing) {
      setIsOpen(true);
    }
  }, [isEditing]);

  return (
    <section
      key={group.group}
      style={{
        marginTop: gIdx === 0 ? "0" : "16px",
        border: "1px solid var(--neutral-line-outline)",
        borderRadius: "16px",
        background: "var(--neutral-surface-primary)",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          borderBottom: isOpen ? "1px solid var(--neutral-line-outline)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <p
            className="type-subtitle-2 text-tertiary"
            style={{
              textTransform: "uppercase",
              fontSize: "11px",
              letterSpacing: "1px",
              fontWeight: 700,
            }}
          >
            {group.group}
          </p>
        </div>
        <Toggle
          checked={isOpen}
          onChange={() => setIsOpen((previous) => !previous)}
          ariaLabel={`${isOpen ? "Hide" : "Show"} ${group.group} access details`}
        />
      </div>
      {isOpen && (
        <div style={{ padding: "0 20px", animation: "fadeIn 0.2s ease-out" }}>
          {group.modules.map((module, moduleIdx) => (
            <RolePermissionRow
              key={module.id}
              module={module}
              value={permissions[module.id] || "none"}
              onChange={(val) => onChange(module.id, val)}
              isEditing={isEditing}
              isLast={moduleIdx === group.modules.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function RolePermissionsList({ permissions, onChange, isEditing, structure }) {
  return (
    <div className="role-permissions-list">
      {structure.map((group, gIdx) => (
        <RolePermissionsGroup
          key={group.group}
          group={group}
          permissions={permissions}
          onChange={onChange}
          isEditing={isEditing}
          gIdx={gIdx}
        />
      ))}
    </div>
  );
}
