import React from "react";
import { Icon } from "../../../components/icons/Icon.jsx";
import { RolePermissionsList } from "../components/RolePermissionsList.jsx";

export function RoleManagementCreatePanel({
  draft,
  errors,
  activeTab = "general",
  onTabChange,
  onNext,
  onClose,
  onChange,
  onSave,
  permissionsStructure,
  // Shared UI components passed as props
  DetailSection,
  DetailField,
}) {
  const accountPermissionGroups = permissionsStructure.filter(
    (group) => group.id === "account-module"
  );
  const rmsBackOfficeGroups = permissionsStructure.filter(
    (group) => group.id === "rms-back-office"
  );
  const rmsAppsGroups = permissionsStructure.filter(
    (group) => group.id === "rms-apps"
  );
  const getScopedSectionErrors = (groupIds) =>
    Object.fromEntries(
      Object.entries(errors?.permissionSections ?? {}).filter(([groupId]) =>
        groupIds.includes(groupId)
      )
    );

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
              className={`catalog-detail-panel__tab${activeTab === "rms-module" ? " is-active" : ""}`}
              onClick={() => onTabChange?.("rms-module")}
              role="tab"
              aria-selected={activeTab === "rms-module"}
            >
              RMS Permission
            </button>
          </div>
        </div>
      </div>
      <div className="catalog-detail-panel__body">
        {activeTab === "general" ? (
          <>
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

            <DetailSection title="Account Module Permission">
              <RolePermissionsList
                permissions={draft.permissions}
                sectionStates={draft.permissionSections}
                sectionErrors={getScopedSectionErrors(["account-module"])}
                isEditing={true}
                onChange={(modId, val) =>
                  onChange("permissions", { ...draft.permissions, [modId]: val })
                }
                onSectionToggle={(sectionId, enabled) =>
                  onChange("permissionSections", {
                    ...draft.permissionSections,
                    [sectionId]: enabled,
                  })
                }
                structure={accountPermissionGroups}
              />
            </DetailSection>
          </>
        ) : (
          <>
            <DetailSection title="RMS Back Office Permission">
              <RolePermissionsList
                permissions={draft.permissions}
                sectionStates={draft.permissionSections}
                sectionErrors={getScopedSectionErrors(["rms-back-office"])}
                isEditing={true}
                onChange={(modId, val) =>
                  onChange("permissions", { ...draft.permissions, [modId]: val })
                }
                onSectionToggle={(sectionId, enabled) =>
                  onChange("permissionSections", {
                    ...draft.permissionSections,
                    [sectionId]: enabled,
                  })
                }
                structure={rmsBackOfficeGroups}
              />
            </DetailSection>

            <DetailSection title="RMS Apps Permission">
              <RolePermissionsList
                permissions={draft.permissions}
                sectionStates={draft.permissionSections}
                sectionErrors={getScopedSectionErrors(["rms-apps"])}
                isEditing={true}
                onChange={(modId, val) =>
                  onChange("permissions", { ...draft.permissions, [modId]: val })
                }
                onSectionToggle={(sectionId, enabled) =>
                  onChange("permissionSections", {
                    ...draft.permissionSections,
                    [sectionId]: enabled,
                  })
                }
                structure={rmsAppsGroups}
              />
            </DetailSection>
          </>
        )}
      </div>
      <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
        {activeTab === "general" ? (
          <>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--danger-outline"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--secondary lab-button--medium"
              style={{ flex: 1 }}
              onClick={onNext ?? (() => onTabChange?.("rms-module"))}
            >
              <span className="type-subtitle-2">Next</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--secondary"
              style={{ flex: 1 }}
              onClick={() => onTabChange?.("general")}
            >
              <span className="type-subtitle-2">Back</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={onSave}
            >
              <span className="type-subtitle-2">Create Role</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
