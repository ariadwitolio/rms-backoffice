import React from "react";
import { Icon } from "../../../components/icons/Icon.jsx";
import { RolePermissionsList } from "../components/RolePermissionsList.jsx";

export function RoleManagementCreatePanel({
  draft,
  errors,
  onClose,
  onChange,
  onSave,
  permissionsStructure,
  // Shared UI components passed as props
  DetailSection,
  DetailField,
}) {
  return (
    <aside className="catalog-detail-side-panel catalog-detail-panel">
      <div className="catalog-detail-panel__header">
        <div className="catalog-detail-panel__titlebar">
          <p className="catalog-detail-panel__title type-title-2">
            Add New Role Access
          </p>
          <div className="catalog-detail-panel__actions">
            <button
              type="button"
              className="catalog-detail-panel__close"
              onClick={onClose}
              aria-label="Close create role"
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
          </div>
        </DetailSection>

        <DetailSection title="Access Permissions">
          <RolePermissionsList
            permissions={draft.permissions}
            isEditing={true}
            onChange={(modId, val) => onChange("permissions", { ...draft.permissions, [modId]: val })}
            structure={permissionsStructure}
          />
        </DetailSection>
      </div>
      <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
        <button
          type="button"
          className="lab-button lab-button--medium lab-button--secondary"
          style={{ flex: 1 }}
          onClick={onClose}
        >
          <span className="type-subtitle-2">Cancel</span>
        </button>
        <button
          type="button"
          className="lab-button lab-button--primary lab-button--medium"
          style={{ flex: 1 }}
          onClick={onSave}
        >
          <span className="type-subtitle-2">Create Role</span>
        </button>
      </div>
    </aside>
  );
}
