import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronIcon } from "../icons/Icon.jsx";

export function SidebarUnitSwitcher({
  selectedBusinessUnit,
  businessUnits,
  onSelectUnit,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const options = [
    { id: "__main__", label: "Main Account", platform: "" },
    ...businessUnits.map((unit) => ({
      id: unit.id,
      label: unit.name,
      platform: "RMS",
    })),
  ];
  const selectedOptionId = selectedBusinessUnit?.id ?? "__main__";
  const triggerLabel = selectedBusinessUnit?.name ?? "Main Account";

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
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

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const menu = menuRef.current;
      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const gutter = 8;
      const spacing = 8;
      const naturalHeight = Math.min(menu?.scrollHeight ?? 364, 364);
      const availableBelow = viewportHeight - rect.bottom - gutter;
      const availableAbove = rect.top - gutter;
      const shouldOpenUpward =
        availableBelow < Math.min(naturalHeight, 180) &&
        availableAbove > availableBelow;
      const maxHeight = Math.max(
        120,
        Math.min(
          364,
          shouldOpenUpward ? availableAbove - spacing : availableBelow - spacing
        )
      );
      const resolvedHeight = Math.min(naturalHeight, maxHeight);
      const top = shouldOpenUpward
        ? Math.max(gutter, rect.top - resolvedHeight - spacing)
        : Math.min(
          rect.bottom + spacing,
          viewportHeight - resolvedHeight - gutter
        );

      setMenuStyle({
        left: rect.left,
        maxHeight,
        top,
        width: rect.width,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, businessUnits]);

  return (
    <div ref={rootRef} className="sidebar-unit-switcher">
      <button
        ref={triggerRef}
        type="button"
        className={`sidebar-unit-switcher__trigger${isOpen ? " is-active" : ""
          }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span className="sidebar-unit-switcher__trigger-copy">
          <p className="sidebar-unit-switcher__trigger-title type-subtitle-1">
            {triggerLabel}
          </p>
        </span>
        <span className="lab-select-shell__chevron">
          <ChevronIcon
            name="selectChevron"
            size={24}
            direction={isOpen ? "up" : "down"}
          />
        </span>
      </button>
      {isOpen && menuStyle
        ? createPortal(
          <div
            ref={menuRef}
            className="sidebar-unit-switcher__menu"
            role="listbox"
            aria-label="Business unit switcher"
            style={menuStyle}
          >
            {options.map((option) => {
              const isActive = option.id === selectedOptionId;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`sidebar-unit-switcher__option${isActive ? " is-active" : ""
                    }`}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSelectUnit(option.id === "__main__" ? null : option.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="sidebar-unit-switcher__option-copy">
                    <p
                      className={`sidebar-unit-switcher__option-title ${isActive ? "type-title-3" : "type-subtitle-2"
                        }`}
                    >
                      {option.label}
                    </p>
                    {option.platform ? (
                      <p className="sidebar-unit-switcher__option-platform type-body">
                        {option.platform}
                      </p>
                    ) : null}
                  </span>
                  {isActive ? (
                    <span
                      className="sidebar-unit-switcher__check"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>,
          document.body
        )
        : null}
    </div>
  );
}

