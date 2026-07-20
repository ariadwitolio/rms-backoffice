import { Sidebar, TopNavbar } from "./components/layout/Layout.jsx";
import { Icon } from "./components/icons/Icon.jsx";
import { Snackbar } from "./components/ui/Primitives.jsx";
import { SidebarUnitSwitcher } from "./components/app/SidebarUnitSwitcher.jsx";
import { UnitAssignmentModal, DiscardChangesModal, PairingCodeModal, DevicePairingRequestModal, DeleteConfirmationModal } from "./components/app/DeviceModals.jsx";
import { DeleteBlockedModal, ModifierOptionDeactivateModal, DeviceStatusConfirmationModal } from "./components/app/ConfirmationModals.jsx";
import { ModifierCatalogSelectionModal } from "./components/app/ModifierCatalogModal.jsx";
import { useAppState } from "./hooks/useAppState.js";
import { useAppHandlers } from "./hooks/useAppHandlers.jsx";

export default function App() {
  const state = useAppState();
  const handlers = useAppHandlers(state);
  const {
    records,
    currentPage,
    sidebarCollapsed,
    setSidebarCollapsed,
    expandedGroups,
    mobileMenuOpen,
    setMobileMenuOpen,
    isMobile,
    snackbar,
    setSnackbar,
    isUnitAssignmentModalOpen,
    unitAssignmentSearch,
    setUnitAssignmentSearch,
    assignedUnitAssignmentIds,
    selectedUnitAssignmentIds,
    unitAssignmentTarget,
    isModifierCatalogModalOpen,
    modifierCatalogModalValue,
    setModifierCatalogModalValue,
    modifierCatalogModalTarget,
    isUnroutedCatalogModalOpen,
    setIsUnroutedCatalogModalOpen,
    discardCreateModalOpen,
    discardEditModalOpen,
    deleteConfirmationOpen,
    deleteConfirmationTarget,
    deleteBlockedModal,
    setDeleteBlockedModal,
    modifierOptionDeactivateConfirm,
    setModifierOptionDeactivateConfirm,
    modifierDetailDraft,
    deviceStatusConfirmation,
    pairingCodePopup,
    setPairingCodePopup,
    devicePairingRequest,
  } = state;
  const {
    selectedSidebarBusinessUnit,
    isLockedSelectedBusinessUnit,
    renderCurrentPage,
    getNavigationPageId,
    handleToggleGroup,
    handleSetPage,
    handleSelectSidebarBusinessUnit,
    closeUnitAssignmentModal,
    handleToggleUnitAssignment,
    handleToggleUnitAssignmentGroup,
    handleAssignAllUnits,
    handleConfirmUnitAssignment,
    closeModifierCatalogModal,
    confirmModifierCatalogModal,
    groupedDeviceCreateCatalogGroups,
    groupedDeviceDetailCatalogGroups,
    modifierCatalogGroups,
    groupedDeviceUnassignedCatalogList,
    cancelDiscardCreateChanges,
    confirmDiscardCreateChanges,
    getActiveCreatePanelConfig,
    cancelDiscardEditChanges,
    confirmDiscardEditChanges,
    cancelDeleteRequest,
    confirmDeleteRow,
    handleModifierDetailOptionChange,
    cancelDeviceStatusChange,
    confirmDeviceStatusChange,
    closeDevicePairingRequest,
    confirmDevicePairingRequest,
    declineDevicePairingRequest,
    showSnackbar,
  } = handlers;

  return (
    <>
      <div
        className={`app-shell${sidebarCollapsed ? " is-sidebar-collapsed" : ""
          }`}
        style={{
          "--top-navbar-height": "60px",
        }}
      >
        <Sidebar
          currentPage={getNavigationPageId(currentPage)}
          expandedGroups={expandedGroups}
          sidebarCollapsed={sidebarCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          isMobile={isMobile}
          businessUnits={records["business-unit"] || []}
          selectedBusinessUnit={selectedSidebarBusinessUnit}
          onToggleGroup={handleToggleGroup}
          onSetPage={handleSetPage}
          onSelectBusinessUnit={handleSelectSidebarBusinessUnit}
          onToggleSidebarCollapse={() =>
            setSidebarCollapsed((previous) => !previous)
          }
          SidebarUnitSwitcherComponent={SidebarUnitSwitcher}
        />
        <div
          className={`shell-main${isLockedSelectedBusinessUnit ? " is-business-unit-locked" : ""
            }`}
        >
          <TopNavbar
            isMobile={isMobile}
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            onNotify={() => showSnackbar("No unread notifications", "grey")}
          />
          <main className="page-area">{renderCurrentPage()}</main>
        </div>
      </div>
      <UnitAssignmentModal
        open={isUnitAssignmentModalOpen}
        searchValue={unitAssignmentSearch}
        assignedIds={assignedUnitAssignmentIds}
        selectedIds={selectedUnitAssignmentIds}
        descriptionCopy={
          unitAssignmentTarget === "modifier-create" ||
            unitAssignmentTarget === "modifier-detail"
            ? "Assign this modifier to an entity so it can be used"
            : "Assign this catalog to an entity so it can be used"
        }
        onSearchChange={setUnitAssignmentSearch}
        onToggleUnit={handleToggleUnitAssignment}
        onToggleGroup={handleToggleUnitAssignmentGroup}
        onAssignAll={handleAssignAllUnits}
        onClose={closeUnitAssignmentModal}
        onConfirm={handleConfirmUnitAssignment}
      />
      <ModifierCatalogSelectionModal
        open={isModifierCatalogModalOpen}
        title={
          modifierCatalogModalTarget?.startsWith("grouped-device")
            ? "Select Catalogs for KDS Group"
            : "Connect to Catalog"
        }
        descriptionCopy={
          modifierCatalogModalTarget?.startsWith("grouped-device")
            ? "Choose catalog items to route through this KDS group"
            : "Select catalog(s) to connect to this modifier"
        }
        value={modifierCatalogModalValue}
        groups={
          modifierCatalogModalTarget === "grouped-device-create"
            ? groupedDeviceCreateCatalogGroups
            : modifierCatalogModalTarget === "grouped-device-detail"
              ? groupedDeviceDetailCatalogGroups
              : modifierCatalogGroups
        }
        onChange={setModifierCatalogModalValue}
        onClose={closeModifierCatalogModal}
        onConfirm={confirmModifierCatalogModal}
      />
      {isUnroutedCatalogModalOpen && (
        <div className="unit-assignment-modal-overlay" onMouseDown={() => setIsUnroutedCatalogModalOpen(false)}>
          <div
            className="unit-assignment-modal modifier-catalog-modal modifier-catalog-modal--unrouted"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unrouted-catalog-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="unit-assignment-modal__close-row">
              <button
                type="button"
                className="unit-assignment-modal__close"
                onClick={() => setIsUnroutedCatalogModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
              </button>
            </div>
            <div className="unit-assignment-modal__header">
              <p
                id="unrouted-catalog-modal-title"
                className="unit-assignment-modal__title type-title-1"
              >
                Unrouted Catalogs
              </p>
              <p className="unit-assignment-modal__copy type-body-bold">
                These catalogs are not assigned to any KDS group
              </p>
            </div>
            <div className="unit-assignment-modal__body">
              <ul className="modifier-catalog-modal__list">
                {groupedDeviceUnassignedCatalogList.map((name) => (
                  <li key={name} className="modifier-catalog-modal__item">
                    <p className="modifier-catalog-modal__item-label type-subtitle-2">
                      {name}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <DiscardChangesModal
        open={discardCreateModalOpen}
        itemLabel={getActiveCreatePanelConfig()?.label ?? ""}
        onClose={cancelDiscardCreateChanges}
        onConfirm={confirmDiscardCreateChanges}
      />
      <DiscardChangesModal
        open={discardEditModalOpen}
        itemLabel="Edit"
        onClose={cancelDiscardEditChanges}
        onConfirm={confirmDiscardEditChanges}
      />
      <DeleteConfirmationModal
        open={deleteConfirmationOpen}
        itemLabel={deleteConfirmationTarget.itemLabel}
        message={deleteConfirmationTarget.message}
        onClose={cancelDeleteRequest}
        onConfirm={confirmDeleteRow}
      />
      <DeleteBlockedModal
        open={deleteBlockedModal.open}
        title={deleteBlockedModal.title}
        message={deleteBlockedModal.message}
        onClose={() => setDeleteBlockedModal({ open: false, title: "", message: "" })}
      />
      <ModifierOptionDeactivateModal
        open={Boolean(modifierOptionDeactivateConfirm)}
        minimumSelection={modifierDetailDraft?.minimumSelection || 1}
        onClose={() => setModifierOptionDeactivateConfirm(null)}
        onConfirm={() => {
          if (modifierOptionDeactivateConfirm) {
            handleModifierDetailOptionChange(modifierOptionDeactivateConfirm.optionId, "isAvailable", false);
          }
          setModifierOptionDeactivateConfirm(null);
        }}
      />
      <DeviceStatusConfirmationModal
        open={Boolean(deviceStatusConfirmation.rowId)}
        deviceName={deviceStatusConfirmation.deviceName}
        nextStatus={deviceStatusConfirmation.nextStatus}
        disconnectLabel={deviceStatusConfirmation.disconnectLabel}
        onClose={cancelDeviceStatusChange}
        onConfirm={confirmDeviceStatusChange}
      />
      <PairingCodeModal
        open={Boolean(pairingCodePopup)}
        device={pairingCodePopup}
        onClose={() => setPairingCodePopup(null)}
      />
      <DevicePairingRequestModal
        open={Boolean(devicePairingRequest)}
        request={devicePairingRequest}
        onClose={closeDevicePairingRequest}
        onConfirm={confirmDevicePairingRequest}
        onDecline={declineDevicePairingRequest}
      />
      <Snackbar
        snackbar={snackbar}
        onDismiss={() => setSnackbar(null)}
        topOffset="60px"
      />
    </>
  );
}
