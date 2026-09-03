import { useState, useEffect } from "react";
import { LabButton } from "../../../components/ui/Primitives.jsx";
import { Icon } from "../../../components/icons/Icon.jsx";

export function RoleUserAssignmentModal({
  open,
  roleName = "",
  availableUsers = [],
  onClose,
  onConfirm,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (open) {
      setSearchValue("");
      setSelectedIds([]);
    }
  }, [open]);

  if (!open) return null;

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredUsers = normalizedSearch
    ? availableUsers.filter((user) =>
      [user.name, user.role, user.branch]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedSearch))
    )
    : availableUsers;

  function toggleUser(userId) {
    setSelectedIds((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId]
    );
  }

  function handleConfirm() {
    if (!selectedIds.length) return;
    onConfirm(selectedIds);
  }

  return (
    <div className="unit-assignment-modal-overlay" onMouseDown={onClose}>
      <div
        className="unit-assignment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-user-assignment-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="unit-assignment-modal__close-row">
          <button
            type="button"
            className="unit-assignment-modal__close"
            onClick={onClose}
            aria-label="Close user assignment"
          >
            <Icon name="modalClose" className="lab-icon lab-icon--20" alt="" />
          </button>
        </div>
        <div className="unit-assignment-modal__header">
          <p
            id="role-user-assignment-modal-title"
            className="unit-assignment-modal__title type-title-1"
          >
            Add User
          </p>
          <p className="unit-assignment-modal__copy type-body-bold">
            {roleName
              ? `Select existing users to assign to the ${roleName} role.`
              : "Select existing users to assign to this role."}
            {" "}Adding a user here will replace their current role.
          </p>
        </div>
        <div className="unit-assignment-modal__body">
          <label className="unit-assignment-modal__search">
            <Icon name="search" className="lab-icon lab-icon--20" alt="Search" />
            <input
              type="search"
              className="type-subtitle-1"
              placeholder="Search User"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>
          <div className="unit-assignment-modal__table">
            <div className="unit-assignment-modal__table-head">
              <div className="unit-assignment-modal__header-row">
                <div className="unit-assignment-modal__header-cell">
                  <p className="type-title-3">User</p>
                </div>
              </div>
            </div>
            <div className="unit-assignment-modal__table-body">
              {filteredUsers.length ? (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);

                  return (
                    <div key={user.id} className="unit-assignment-modal__unit-row">
                      <div className="unit-assignment-modal__unit-cell">
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <p className="type-subtitle-2">{user.name}</p>
                          <p className="type-body text-secondary" style={{ margin: "2px 0 0" }}>
                            {user.role || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="unit-assignment-modal__action-cell">
                        {isSelected ? (
                          <button
                            type="button"
                            className="catalog-remove-button type-subtitle-2"
                            onClick={() => toggleUser(user.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <LabButton
                            label="Add"
                            variant="primary"
                            size="small"
                            onClick={() => toggleUser(user.id)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="unit-assignment-modal__empty">
                  <p className="type-subtitle-2">
                    {availableUsers.length
                      ? "No user matches your search"
                      : "All users are already assigned to this role"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="unit-assignment-modal__footer">
          <LabButton
            label="Add User"
            variant="primary"
            size="large"
            fullWidth
            disabled={!selectedIds.length}
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
