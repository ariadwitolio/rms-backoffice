import React from "react";
import { Icon } from "../../../components/icons/Icon.jsx";
import { RolePermissionsList } from "../components/RolePermissionsList.jsx";
import { applyRoleModuleDependencyCascade } from "../../../utils/roleUtils.js";

export function RoleManagementDetailPanel({
  row,
  draft,
  errors,
  editing,
  activeTab = "general",
  isMainAccountSide = false,
  onTabChange,
  members = [],
  onClose,
  onEdit,
  onNext,
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
  const isEntitySide = !isMainAccountSide;
  const effectiveName = draft.name.trim() || row.name || "-";
  const roleType = row.type ?? "Custom";
  const roleTypeClass =
    roleType === "System" ? "status-pill--primary" : "status-pill--success";
  const memberCountLabel = `${members.length} Member${members.length === 1 ? "" : "s"}`;
  const baseResolvedActiveTab =
    isEditing && activeTab === "member" ? "general" : activeTab;
  const accountPermissionGroups = permissionsStructure.filter(
    (group) => group.id === "account-module"
  );
  const rmsBackOfficeGroups = permissionsStructure.filter(
    (group) => group.id === "rms-back-office"
  );
  const rmsAppsGroups = permissionsStructure.filter(
    (group) => group.id === "rms-apps" || group.id === "payment-app"
  );
  const getScopedSectionErrors = (groupIds) =>
    Object.fromEntries(
      Object.entries(errors?.permissionSections ?? {}).filter(([groupId]) =>
        groupIds.includes(groupId)
      )
    );
  const generalPermissionGroup = {
    id: "general-permissions",
    group: isMainAccountSide ? "Account Module" : "Back Office Permissions",
    modules: [
      ...(accountPermissionGroups[0]?.modules ?? []),
      ...(rmsBackOfficeGroups[0]?.modules ?? []),
    ],
    menuHierarchy: [
      ...(accountPermissionGroups[0]?.modules ?? []).map((module) => ({
        id: module.id,
        label: module.label,
        isParent: false,
      })),
      ...(rmsBackOfficeGroups[0]?.menuHierarchy ?? []),
    ],
  };
  const generalPermissionGroups = [generalPermissionGroup];
  const generalSourceGroupIds = [
    ...accountPermissionGroups.map((group) => group.id),
    ...rmsBackOfficeGroups.map((group) => group.id),
  ];
  const showAppsPermissionTab = isEntitySide && rmsAppsGroups.length > 0;
  const generalSectionBehavior = isMainAccountSide
    ? {
        forcedOpenSectionIds: ["general-permissions"],
        nonToggleSectionIds: ["general-permissions"],
      }
    : {};
  const generalSectionEnabled = isMainAccountSide
    ? true
    : generalSourceGroupIds.some(
        (groupId) => draft.permissionSections?.[groupId] !== false
      );
  const generalSectionErrors = isMainAccountSide
    ? {}
    : getScopedSectionErrors(generalSourceGroupIds);
  const resolvedActiveTab =
    !showAppsPermissionTab && baseResolvedActiveTab === "rms-module"
      ? "general"
      : baseResolvedActiveTab;
  const roleTypePill = (
    <span className={`status-pill ${roleTypeClass}`}>
      <span className="type-body">{roleType}</span>
    </span>
  );
  const showMemberTab = !isEditing;
  const showTabBar = showAppsPermissionTab || showMemberTab;

  const updatePermissionsForGroupToggle = (modules, enabled) => {
    if (enabled) return draft.permissions;

    return modules.reduce(
      (nextPermissions, module) => ({
        ...nextPermissions,
        [module.id]: "none",
      }),
      { ...draft.permissions }
    );
  };

  const handleGeneralSectionToggle = (sectionId, enabled) => {
    void sectionId;

    onChange(
      "permissions",
      updatePermissionsForGroupToggle(generalPermissionGroup.modules, enabled)
    );
    onChange(
      "permissionSections",
      generalSourceGroupIds.reduce(
        (nextSections, groupId) => ({
          ...nextSections,
          [groupId]: enabled,
        }),
        { ...draft.permissionSections }
      )
    );
  };

  const handleRmsAppsSectionToggle = (sectionId, enabled) => {
    const targetGroup = rmsAppsGroups.find((group) => group.id === sectionId);

    onChange(
      "permissions",
      updatePermissionsForGroupToggle(targetGroup?.modules ?? [], enabled)
    );
    onChange("permissionSections", {
      ...draft.permissionSections,
      [sectionId]: enabled,
    });
  };

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
        {showTabBar ? (
          <div className="catalog-detail-panel__tabbar">
            <div className="catalog-detail-panel__tabs" role="tablist">
              <button
                type="button"
                className={`catalog-detail-panel__tab${resolvedActiveTab === "general" ? " is-active" : ""}`}
                onClick={() => onTabChange?.("general")}
                role="tab"
                aria-selected={resolvedActiveTab === "general"}
              >
                General
              </button>
              {showAppsPermissionTab ? (
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${resolvedActiveTab === "rms-module" ? " is-active" : ""}`}
                  onClick={() => onTabChange?.("rms-module")}
                  role="tab"
                  aria-selected={resolvedActiveTab === "rms-module"}
                >
                  Apps Permission
                </button>
              ) : null}
              {showMemberTab ? (
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${resolvedActiveTab === "member" ? " is-active" : ""}`}
                  onClick={() => onTabChange?.("member")}
                  role="tab"
                  aria-selected={resolvedActiveTab === "member"}
                >
                  Member
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className="catalog-detail-panel__body">
        {resolvedActiveTab === "general" ? (
          <>
            <DetailSection title="General Information">
              <div
                className={`catalog-panel-info-list${isEditing ? " catalog-panel-info-list--single-column" : ""}`}
              >
                {isEditing ? (
                  <>
                    <DetailField
                      label="Role Name"
                      required
                      value={draft.name}
                      error={errors?.name}
                      placeholder="Enter Role Name"
                      onChange={(val) => onChange("name", val)}
                      maxLength={40}
                      autoFocus
                    />
                    <div className="catalog-panel-info-list--single-column">
                      <DetailField
                        label="Role Description"
                        value={draft.description}
                        placeholder="Enter Role Description"
                        onChange={(val) => onChange("description", val)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <CatalogPanelInfoRow label="Role Name" value={effectiveName} />
                    <CatalogPanelInfoRow label="Role Type" value={roleTypePill} />
                    <div className="catalog-panel-info-list--single-column">
                      <CatalogPanelInfoRow
                        label="Role Description"
                        value={row.description || "-"}
                      />
                    </div>
                  </>
                )}
              </div>
            </DetailSection>

            <DetailSection
              title={
                isMainAccountSide
                  ? "Permissions"
                  : "Back Office Permissions"
              }
            >
              <RolePermissionsList
                permissions={draft.permissions}
                sectionStates={{ "general-permissions": generalSectionEnabled }}
                sectionErrors={{
                  "general-permissions": generalSourceGroupIds
                    .map((groupId) => generalSectionErrors[groupId])
                    .find(Boolean),
                }}
                isEditing={isEditing}
                onChange={(modId, val) =>
                  onChange("permissions", { ...draft.permissions, [modId]: val })
                }
                onSectionToggle={handleGeneralSectionToggle}
                structure={generalPermissionGroups}
                {...generalSectionBehavior}
              />
            </DetailSection>
          </>
        ) : resolvedActiveTab === "rms-module" ? (
          <>
            <DetailSection title="POS Apps Permission">
              <RolePermissionsList
                permissions={draft.permissions}
                sectionStates={draft.permissionSections}
                sectionErrors={getScopedSectionErrors(["rms-apps"])}
                isEditing={isEditing}
                onChange={(modId, val) =>
                  onChange(
                    "permissions",
                    applyRoleModuleDependencyCascade({ ...draft.permissions, [modId]: val })
                  )
                }
                onSectionToggle={handleRmsAppsSectionToggle}
                structure={rmsAppsGroups.filter((g) => g.id === "rms-apps")}
              />
            </DetailSection>
            <DetailSection title="Payment App Permissions">
              <RolePermissionsList
                permissions={draft.permissions}
                sectionStates={draft.permissionSections}
                sectionErrors={getScopedSectionErrors(["payment-app"])}
                isEditing={isEditing}
                onChange={(modId, val) =>
                  onChange(
                    "permissions",
                    applyRoleModuleDependencyCascade({ ...draft.permissions, [modId]: val })
                  )
                }
                onSectionToggle={handleRmsAppsSectionToggle}
                structure={rmsAppsGroups.filter((g) => g.id === "payment-app")}
              />
            </DetailSection>
          </>
        ) : (
          <DetailSection title="Assigned Member" meta={memberCountLabel}>
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
        <div
          className="catalog-detail-panel__footer"
          style={{ display: "flex", gap: "12px", width: "100%" }}
        >
          {!showAppsPermissionTab ? (
            <>
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
            </>
          ) : resolvedActiveTab === "general" ? (
            <>
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
                <span className="type-subtitle-2">Save Changes</span>
              </button>
            </>
          )}
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
