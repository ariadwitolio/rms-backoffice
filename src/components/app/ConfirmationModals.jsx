import { LabButton } from "../ui/Primitives.jsx";
import { Icon } from "../icons/Icon.jsx";

export function DeleteBlockedModal({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay discard-changes-modal-overlay" onMouseDown={onClose}>
      <div
        className="discard-changes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-blocked-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="discard-changes-modal__header">
          <p id="delete-blocked-modal-title" className="type-title-1">
            {title || "Cannot Delete Modifier"}
          </p>
          <button
            type="button"
            className="discard-changes-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="discard-changes-modal__copy type-body text-secondary">
          {message}
        </div>
        <div className="discard-changes-modal__actions discard-changes-modal__actions--single">
          <LabButton
            label="Okay"
            variant="primary"
            size="medium"
            onClick={onClose}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

export function ModifierOptionDeactivateModal({ open, minimumSelection, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-overlay discard-changes-modal-overlay" onMouseDown={onClose}>
      <div
        className="discard-changes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modifier-option-deactivate-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="discard-changes-modal__header">
          <p id="modifier-option-deactivate-modal-title" className="type-title-1">
            Deactivate Last Option?
          </p>
          <button
            type="button"
            className="discard-changes-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="discard-changes-modal__copy type-body text-secondary">
          This modifier requires at least {minimumSelection} active option. Deactivating the last option will automatically turn off the modifier availability.
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
            label="Yes, Deactivate"
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

export function DeviceStatusConfirmationModal({
  open,
  deviceName,
  nextStatus,
  disconnectLabel = "Disconnect",
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  const isConnect = nextStatus === "Connected";
  const isTurnOffConnection = !isConnect && disconnectLabel === "Turn Off Connection";

  return (
    <div className="modal-overlay discard-changes-modal-overlay" onMouseDown={onClose}>
      <div
        className="discard-changes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-status-confirmation-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="discard-changes-modal__header">
          <p
            id="device-status-confirmation-modal-title"
            className="type-title-1"
          >
            {isConnect
              ? "Turn on Device Connection?"
              : isTurnOffConnection
                ? "Turn Off Device Connection?"
                : "Disconnect Device?"}
          </p>
          <button
            type="button"
            className="discard-changes-modal__close"
            onClick={onClose}
            aria-label="Close device status confirmation dialog"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="discard-changes-modal__copy type-body text-secondary">
          {isConnect
            ? deviceName
              ? `Do you want to turn on the connection for "${deviceName}"?`
              : "This device is now ready to connect and is pending pairing code entry from the device that previously connected on the other side."
            : deviceName
              ? isTurnOffConnection
                ? `Do you want to turn off the connection for "${deviceName}"?`
                : `Are you sure you want to disconnect "${deviceName}"?`
              : isTurnOffConnection
                ? "Are you sure you want to turn off this device connection?"
                : "Are you sure you want to disconnect this device?"}
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
            label={
              isConnect
                ? "Yes, Turn On"
                : isTurnOffConnection
                  ? "Yes, Turn Off"
                  : "Yes, Disconnect"
            }
            variant={isConnect ? "primary" : "danger"}
            size="medium"
            onClick={onConfirm}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
