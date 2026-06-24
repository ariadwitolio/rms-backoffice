import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LabButton, Field, SelectShell } from "../ui/Primitives.jsx";
import { buildGroupedDeviceSelectionOptions, buildGroupedDeviceCatalogSelectionGroups } from "../../utils/deviceGroupUtils.js";
import { Icon } from "../icons/Icon.jsx";
import { BUSINESS_UNIT_ASSIGNMENT_GROUPS } from "../../constants/catalog.js";

export function UnitAssignmentModal({
  open,
  searchValue,
  assignedIds,
  selectedIds,
  descriptionCopy = "Assign this catalog to an entity so it can be used",
  onSearchChange,
  onToggleUnit,
  onToggleGroup,
  onAssignAll,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  const assignedSet = new Set(assignedIds);
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredGroups = BUSINESS_UNIT_ASSIGNMENT_GROUPS.map((group) => {
    const availableUnits = group.units.filter(
      (unit) => !assignedSet.has(unit.id)
    );
    if (!availableUnits.length) return null;

    if (!normalizedSearch) return { ...group, units: availableUnits };

    const matchesGroup = group.label.toLowerCase().includes(normalizedSearch);
    const matchedUnits = matchesGroup
      ? availableUnits
      : availableUnits.filter((unit) =>
        unit.name.toLowerCase().includes(normalizedSearch)
      );

    return matchedUnits.length ? { ...group, units: matchedUnits } : null;
  }).filter(Boolean);
  const hasAvailableUnits = BUSINESS_UNIT_ASSIGNMENT_GROUPS.some((group) =>
    group.units.some((unit) => !assignedSet.has(unit.id))
  );

  return (
    <div className="unit-assignment-modal-overlay" onMouseDown={onClose}>
      <div
        className="unit-assignment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-assignment-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="unit-assignment-modal__close-row">
          <button
            type="button"
            className="unit-assignment-modal__close"
            onClick={onClose}
            aria-label="Close entity assignment"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="unit-assignment-modal__header">
          <p
            id="unit-assignment-modal-title"
            className="unit-assignment-modal__title type-title-1"
          >
            Entity Assignment
          </p>
          <p className="unit-assignment-modal__copy type-body-bold">
            {descriptionCopy}
          </p>
        </div>
        <div className="unit-assignment-modal__body">
          <label className="unit-assignment-modal__search">
            <Icon
              name="search"
              className="lab-icon lab-icon--20"
              alt="Search"
            />
            <input
              type="search"
              className="type-subtitle-1"
              placeholder="Search Entity"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <div className="unit-assignment-modal__table">
            <div className="unit-assignment-modal__table-head">
              <div className="unit-assignment-modal__header-row">
                <div className="unit-assignment-modal__header-cell">
                  <p className="type-title-3">Entity</p>
                </div>
                <div className="unit-assignment-modal__action-cell">
                  <button
                    type="button"
                    className="unit-assignment-modal__link is-primary type-title-3"
                    onClick={onAssignAll}
                  >
                    Assign to All Entities
                  </button>
                </div>
              </div>
            </div>
            <div className="unit-assignment-modal__table-body">
              {filteredGroups.length ? (
                filteredGroups.map((group) => {
                  const isGroupSelected = group.units.every((unit) =>
                    selectedIds.includes(unit.id)
                  );

                  return (
                    <div key={group.id}>
                      <div className="unit-assignment-modal__group-row">
                        <div className="unit-assignment-modal__group-cell">
                          <p className="type-subtitle-2">{group.label}</p>
                        </div>
                        <div className="unit-assignment-modal__group-cell unit-assignment-modal__action-cell">
                          <button
                            type="button"
                            className={`unit-assignment-modal__link ${isGroupSelected ? "is-danger" : "is-primary"
                              } type-body`}
                            onClick={() => onToggleGroup(group.id)}
                          >
                            {isGroupSelected
                              ? "Clear selected entities in this subsidiary"
                              : "Assign to all entities in this subsidiary"}
                          </button>
                        </div>
                      </div>
                      {group.units.map((unit) => {
                        const isSelected = selectedIds.includes(unit.id);

                        return (
                          <div
                            key={unit.id}
                            className="unit-assignment-modal__unit-row"
                          >
                            <div className="unit-assignment-modal__unit-cell">
                              <p className="type-subtitle-2">{unit.name}</p>
                            </div>
                            <div className="unit-assignment-modal__action-cell">
                              {isSelected ? (
                                <button
                                  type="button"
                                  className="catalog-remove-button type-subtitle-2"
                                  onClick={() => onToggleUnit(unit.id)}
                                >
                                  Remove
                                </button>
                              ) : (
                                <LabButton
                                  label="Assign"
                                  variant="primary"
                                  size="small"
                                  onClick={() => onToggleUnit(unit.id)}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="unit-assignment-modal__empty">
                  <p className="type-subtitle-2">
                    {hasAvailableUnits
                      ? "No entity matches your search"
                      : "All entities are already assigned"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="unit-assignment-modal__footer">
          <LabButton
            label="Confirm Assignment"
            variant="primary"
            size="large"
            fullWidth
            disabled={!selectedIds.length}
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
}

export function DiscardChangesModal({ open, itemLabel, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-overlay discard-changes-modal-overlay" onMouseDown={onClose}>
      <div
        className="discard-changes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-changes-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="discard-changes-modal__header">
          <p id="discard-changes-modal-title" className="type-title-1">
            Discard Changes?
          </p>
          <button
            type="button"
            className="discard-changes-modal__close"
            onClick={onClose}
            aria-label="Close discard changes dialog"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="discard-changes-modal__actions">
          <LabButton
            label="Keep Editing"
            variant="secondary"
            size="medium"
            onClick={onClose}
            fullWidth
          />
          <LabButton
            label="Yes, Discard"
            variant="primary"
            size="medium"
            onClick={onConfirm}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

export function PairingCodeModal({ open, device, onClose }) {
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!open || !device) return undefined;
    const computeTimeLeft = () => {
      const now = Date.now();
      const expires = device.pairingExpiresAt || (now + 15 * 60 * 1000);
      return Math.max(0, Math.floor((expires - now) / 1000));
    };

    setTimeLeft(computeTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [open, device]);

  if (!open || !device) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const expiryLabel = timeString;

  function handleCopy() {
    navigator.clipboard.writeText(device.pairingCode).then(() => {
      // Could show a snackbar here, but inline feedback is nice too
    });
  }

  const content = (
    <div className="modal-overlay pairing-code-modal-overlay">
      <div
        className="pairing-code-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pairing-code-modal__header">
          <p className="type-title-1">{device.isReconnectFromDisconnect ? "Waiting for Device Connection" : "Waiting for Device Connection"}</p>
          <button
            type="button"
            className="pairing-code-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" />
          </button>
        </div>
        <div className="pairing-code-modal__body">
          <div className="pairing-code-modal__device-block">
            <p className="type-title-2 pairing-code-modal__device-name" style={{ margin: 0 }}>
              {device.deviceName}
            </p>
            <p className="type-body text-secondary pairing-code-modal__device-type" style={{ margin: 0 }}>
              {device.deviceType}
            </p>
          </div>
          <div className="pairing-code-modal__code-panel">
            <div className="pairing-code-modal__code-box">
              <p className="pairing-code-modal__code-kicker type-body-bold">
                Pairing Code
              </p>
              <p className="pairing-code-modal__code type-title-1" style={{ margin: 0 }}>
                {device.pairingCode}
              </p>
              <p className="type-body text-secondary" style={{ margin: 0 }}>
                {device.isReconnectFromDisconnect
                  ? "Enter this code on the device's onboarding screen to connect"
                  : "Enter this code on the device's onboarding screen to connect"}
              </p>
            </div>
            <button
              type="button"
              className="lab-button lab-button--secondary lab-button--small pairing-code-modal__code-copy"
              onClick={handleCopy}
            >
              <Icon
                name="copy"
                className="lab-icon lab-icon--16"
                alt=""
              />
              <span className="type-subtitle-2">Copy Code</span>
            </button>
          </div>
          <div className="lab-infobox lab-infobox--orange pairing-code-modal__info-box">
            <div className="pairing-code-modal__info-row">
              <div className="pairing-code-modal__info-left">
                <span className="pairing-code-modal__info-icon" aria-hidden="true">
                  <Icon
                    name="sellingTimeTooltip"
                    className="lab-icon lab-icon--20"
                    alt=""
                  />
                </span>
                <p className="pairing-code-modal__info-text type-subtitle-2" style={{ margin: 0 }}>
                  Code expires in
                </p>
              </div>
              <span className="pairing-code-modal__timer">{expiryLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}

export function DevicePairingRequestModal({
  open,
  request,
  onClose,
  onConfirm,
  onDecline,
}) {
  if (!open || !request) return null;

  const content = (
    <div className="modal-overlay discard-changes-modal-overlay" onMouseDown={onClose}>
      <div
        className="discard-changes-modal device-pairing-request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-pairing-request-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="discard-changes-modal__header">
          <p
            id="device-pairing-request-modal-title"
            className="type-title-1"
          >
            Confirm Device Connection
          </p>
          <button
            type="button"
            className="discard-changes-modal__close"
            onClick={onClose}
            aria-label="Close device pairing request dialog"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="device-pairing-request-modal__body">
          <div className="device-pairing-request-modal__identity">
            <p className="type-title-3">{request.deviceName}</p>
            <p className="type-body text-secondary">{request.deviceType}</p>
          </div>
          <div className="discard-changes-modal__copy device-pairing-request-modal__copy">
            <p className="type-body text-secondary">
              "{request.actualDeviceName}" is requesting to connect using this pairing code.
            </p>
          </div>
          <div className="device-pairing-request-modal__details">
            <div className="device-pairing-request-modal__detail-row">
              <span className="type-body text-secondary">Requesting Device</span>
              <span className="type-subtitle-2">{request.actualDeviceName}</span>
            </div>
            <div className="device-pairing-request-modal__detail-row">
              <span className="type-body text-secondary">Device OS</span>
              <span className="type-subtitle-2">
                {request.deviceOs ?? request.actualDeviceType ?? request.deviceType}
              </span>
            </div>
            <div className="device-pairing-request-modal__detail-row">
              <span className="type-body text-secondary">Pairing Code</span>
              <span className="type-subtitle-2">{request.pairingCode}</span>
            </div>
          </div>
        </div>
        <div className="discard-changes-modal__actions">
          <LabButton
            label="Decline"
            variant="secondary"
            size="medium"
            onClick={onDecline}
            fullWidth
          />
          <LabButton
            label="Confirm"
            variant="primary"
            size="medium"
            onClick={onConfirm}
            fullWidth
          />
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}

export function DeleteConfirmationModal({ open, itemLabel, message, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-overlay discard-changes-modal-overlay" onMouseDown={onClose}>
      <div
        className="discard-changes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirmation-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="discard-changes-modal__header">
          <p id="delete-confirmation-modal-title" className="type-title-1">
            {itemLabel ? `Delete ${itemLabel}?` : "Delete Data?"}
          </p>
          <button
            type="button"
            className="discard-changes-modal__close"
            onClick={onClose}
            aria-label="Close delete confirmation dialog"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="discard-changes-modal__copy type-body text-secondary">
          {message ?? (itemLabel
            ? `Are you sure you want to delete "${itemLabel}"? This action cannot be undone.`
            : "Are you sure you want to delete this item? This action cannot be undone.")}
        </div>
        <div className="discard-changes-modal__actions">
          <LabButton
            label="Cancel"
            variant="secondary"
            size="medium"
            onClick={onClose}
            fullWidth
          />
          <LabButton
            label="Yes, Delete"
            variant="danger"
            size="medium"
            onClick={onConfirm}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

