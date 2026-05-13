import React from "react";
import { Icon } from "../../../components/icons/Icon.jsx";
import { RolePermissionsList } from "../components/RolePermissionsList.jsx";

export function RoleManagementDetailPanel({
  row,
  draft,
  errors,
  editing,
  activeTab = "general",
  onTabChange,
  members = [],
  onClose,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onDelete,
  permissionsStructure,
  // Shared UI components passed as props
  DetailSection,
  DetailField,
  CatalogPanelInfoRow,
  DetailPanelDeleteAction,
  StatusPillComponent,
}) {
  if (!row || !draft) return null;

  const isEditing = editing?.kind === "all";
  const effectiveName = draft.name.trim() || row.name || "-";
  const memberCountLabel = `${members.length} Member${members.length === 1 ? "" : "s"}`;

  return (
    <aside className="catalog-detail-side-panel catalog-detail-panel">
      <div className="catalog-detail-panel__header">
        <div className="catalog-detail-panel__titlebar">
          <p className="catalog-detail-panel__title type-title-2">
            {effectiveName}
          </p>
          <div className="catalog-detail-panel__actions">
            {!isEditing && (
              <button
                type="button"
                className="lab-button lab-button--small lab-button--secondary"
                onClick={() => onEdit({ kind: "all" })}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                <span className="type-subtitle-2">Edit</span>
              </button>
            )}
            <button
              type="button"
              className="catalog-detail-panel__close"
              onClick={onClose}
              aria-label="Close role detail"
            >
              <Icon
                name="panelClose"
                className="lab-icon lab-icon--16"
                alt="Close"
              />
            </button>
          </div>
        </div>
        <div className="catalog-detail-panel__tabbar">
          <div className="catalog-detail-panel__tabs" role="tablist">
            <button
              type="button"
              className={`catalog-detail-panel__tab${activeTab === "general" ? " is-active" : ""}`}
              onClick={() => onTabChange?.("general")}
              role="tab"
              aria-selected={activeTab === "general"}
            >
              General
            </button>
            <button
              type="button"
              className={`catalog-detail-panel__tab${activeTab === "member" ? " is-active" : ""}`}
              onClick={() => onTabChange?.("member")}
              role="tab"
              aria-selected={activeTab === "member"}
            >
              Member
            </button>
          </div>
        </div>
      </div>
      <div className="catalog-detail-panel__body">
        {activeTab === "general" ? (
          <>
            <DetailSection title="General Information">
              <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                {isEditing ? (
                  <>
                    <DetailField
                      label="Role Name"
                      required
                      value={draft.name}
                      error={errors?.name}
                      placeholder="Enter Role Name"
                      onChange={(val) => onChange("name", val)}
                      autoFocus
                    />
                    <DetailField
                      label="Role Description"
                      value={draft.description}
                      placeholder="Enter Role Description"
                      onChange={(val) => onChange("description", val)}
                    />
                  </>
                ) : (
                  <>
                    <CatalogPanelInfoRow label="Role Name" value={row.name} />
                    <CatalogPanelInfoRow
                      label="Role Description"
                      value={row.description || "-"}
                    />
                  </>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Access Permissions">
              <RolePermissionsList
                permissions={draft.permissions}
                isEditing={isEditing}
                onChange={(modId, val) =>
                  onChange("permissions", { ...draft.permissions, [modId]: val })
                }
                structure={permissionsStructure}
              />
            </DetailSection>
          </>
        ) : (
          <DetailSection title="Assigned Members" meta={memberCountLabel}>
            {members.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {members.map((member, memberIndex) => (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      paddingBottom:
                        memberIndex === members.length - 1 ? "0" : "12px",
                      borderBottom:
                        memberIndex === members.length - 1
                          ? "none"
                          : "1px solid var(--neutral-line-outline)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "var(--neutral-background)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--neutral-on-surface-secondary)",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          name="userList"
                          className="lab-icon lab-icon--18"
                          alt=""
                        />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className="type-subtitle-2" style={{ margin: 0 }}>
                          {member.name}
                        </p>
                        <p
                          className="type-body text-secondary"
                          style={{ margin: "4px 0 0" }}
                        >
                          {member.email ||
                            [member.branch, member.lastSeen]
                              .filter(Boolean)
                              .join(" • ") ||
                            "-"}
                        </p>
                      </div>
                    </div>
                    {StatusPillComponent ? (
                      <StatusPillComponent status={member.status} />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "8px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <p className="type-subtitle-2" style={{ margin: 0 }}>
                  No members assigned
                </p>
                <p className="type-body text-secondary" style={{ margin: 0 }}>
                  This role has not been assigned to any member yet.
                </p>
              </div>
            )}
          </DetailSection>
        )}
      </div>
      {isEditing ? (
        <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
          <button
            type="button"
            className="lab-button lab-button--medium lab-button--danger-outline"
            style={{ flex: 1 }}
            onClick={onCancel}
          >
            <span className="type-subtitle-2">Cancel</span>
          </button>
          <button
            type="button"
            className="lab-button lab-button--primary lab-button--medium"
            style={{ flex: 1 }}
            onClick={onSave}
          >
            <span className="type-subtitle-2">Save Changes</span>
          </button>
        </div>
      ) : (
        <DetailPanelDeleteAction
          ariaLabel="Delete role"
          onDelete={onDelete}
        />
      )}
    </aside>
  );
}
