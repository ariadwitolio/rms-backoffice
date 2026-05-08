import React from "react";
import { Icon } from "../../../components/icons/Icon.jsx";
import { RolePermissionsList } from "../components/RolePermissionsList.jsx";

export function RoleManagementDetailPanel({
  row,
  draft,
  editing,
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
}) {
  if (!row || !draft) return null;

  const isEditing = editing?.kind === "all";
  const effectiveName = draft.name.trim() || row.name || "-";

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
      </div>
      <div className="catalog-detail-panel__body">
        <DetailSection title="General Information">
          <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
            {isEditing ? (
              <>
                <DetailField
                  label="Role Name"
                  required
                  value={draft.name}
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
                <CatalogPanelInfoRow label="Role Description" value={row.description || '-'} />
              </>
            )}
          </div>
        </DetailSection>

        <DetailSection title="Access Permissions">
          <RolePermissionsList
            permissions={draft.permissions}
            isEditing={isEditing}
            onChange={(modId, val) => onChange("permissions", { ...draft.permissions, [modId]: val })}
            structure={permissionsStructure}
          />
        </DetailSection>
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
