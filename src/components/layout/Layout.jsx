import logoLabamu from "../../logo-labamu.png";
import { MENU } from "../../constants/menu.js";
import { ChevronIcon, Icon } from "../icons/Icon.jsx";
import { LabButton, SelectShell } from "../ui/Primitives.jsx";

export function Sidebar({
  currentPage,
  expandedGroups,
  sidebarCollapsed,
  mobileMenuOpen,
  isMobile,
  businessUnits,
  selectedBusinessUnit,
  onToggleGroup,
  onSetPage,
  onSelectBusinessUnit,
  onToggleSidebarCollapse,
  SidebarUnitSwitcherComponent,
}) {
  const isEntitySide = Boolean(selectedBusinessUnit);

  const MAIN_ACCOUNT_ORDER = ["dashboard", "user-management", "role-management", "business-unit"];
  const ENTITY_SIDE_ORDER = ["dashboard", "catalog-group", "device-group", "user-management", "role-management", "business-unit"];
  const sideOrder = isEntitySide ? ENTITY_SIDE_ORDER : MAIN_ACCOUNT_ORDER;

  const visibleMenu = MENU
    .map((item) => {
      if (item.children && isEntitySide) {
        return {
          ...item,
          children: item.children.filter((child) => child.id !== "pricing-rule"),
        };
      }
      return item;
    })
    .map((item) => {
      if (item.id === "user-management") return { ...item, isLocked: true };
      if (item.id === "business-unit") return { ...item, isLocked: true };
      return item;
    })
    .filter((item) => sideOrder.includes(item.id) && (!item.children || item.children.length))
    .sort((a, b) => sideOrder.indexOf(a.id) - sideOrder.indexOf(b.id));

  return (
    <aside
      className={`shell-sidebar${sidebarCollapsed ? " is-collapsed" : ""}${isMobile && !mobileMenuOpen ? " is-hidden-mobile" : ""
        }`}
    >
      <div className="sidebar-main">
        <div className="sidebar-brand">
          <div className="sidebar-brand__box">
            <img
              src={logoLabamu}
              alt="Labamu"
              className="sidebar-brand__logo"
            />
          </div>
        </div>
        <div className="sidebar-switcher">
          <SidebarUnitSwitcherComponent
            selectedBusinessUnit={selectedBusinessUnit}
            businessUnits={businessUnits}
            onSelectUnit={onSelectBusinessUnit}
          />
        </div>
        <nav className="sidebar-menu" aria-label="Primary navigation">
          {visibleMenu.map((item) => {
            const isGroup = Boolean(item.children);
            const childIds = item.children?.map((child) => child.id) ?? [];
            const isGroupCurrent = isGroup
              ? childIds.includes(currentPage)
              : false;
            const isStandaloneActive = !isGroup && currentPage === item.id;
            const isCurrent = isGroupCurrent || isStandaloneActive;
            const isExpanded = isGroup ? expandedGroups[item.id] : false;

            return (
              <div key={item.id} className="sidebar-menu-group">
                <button
                  type="button"
                  className={`sidebar-parent${isCurrent ? " is-current" : ""}${isGroupCurrent ? " is-group-current" : ""
                    }${isStandaloneActive ? " is-standalone-active" : ""}${item.isLocked ? " is-locked" : ""}`}
                  onClick={() => {
                    if (item.isLocked) return;
                    if (isGroup) {
                      onToggleGroup(item.id, item.children[0].id);
                    } else {
                      onSetPage(item.id);
                    }
                  }}
                >
                  <Icon
                    name="sidebarIndicator"
                    className="sidebar-parent__active-rail"
                    alt=""
                  />
                  <span className="sidebar-parent__container">
                    <span className="sidebar-parent__content">
                      <Icon
                        name={item.icon}
                        className="sidebar-parent__icon"
                        alt=""
                      />
                      <span className="sidebar-parent__label type-subtitle-2">
                        {item.label}
                      </span>
                    </span>
                    {isGroup ? (
                      <span className="sidebar-parent__expand">
                        <ChevronIcon
                          name="sidebarChevron"
                          size={20}
                          direction={isExpanded ? "up" : "down"}
                          className="sidebar-chevron"
                        />
                      </span>
                    ) : null}
                  </span>
                </button>
                {isGroup && isExpanded ? (
                  <div className="sidebar-child-list">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        className={`sidebar-child type-subtitle-2${currentPage === child.id ? " is-active" : ""
                          }`}
                        onClick={() => onSetPage(child.id)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-footer__collapse"
          onClick={onToggleSidebarCollapse}
        >
          <ChevronIcon
            name="collapseChevron"
            size={20}
            direction={sidebarCollapsed ? "right" : "left"}
            alt="Collapse sidebar"
          />
        </button>
        <div className="sidebar-footer__locale">
          <SelectShell
            value="English"
            options={["English", "Bahasa Indonesia"]}
            emoji="🇺🇸"
          />
        </div>
      </div>
    </aside>
  );
}

export function TopNavbar({
  isMobile,
  mobileMenuOpen,
  onToggleMobileMenu,
  onNotify,
  pageContext = null,
}) {
  return (
    <header className={`top-navbar${pageContext ? " has-page-context" : ""}`}>
      <div className="top-navbar__lead">
        {isMobile ? (
          <LabButton
            label={mobileMenuOpen ? "Close" : "Menu"}
            variant="secondary"
            size="small"
            onClick={onToggleMobileMenu}
          />
        ) : null}
        {pageContext?.onBack ? (
          <button
            type="button"
            className="top-navbar__back"
            onClick={pageContext.onBack}
            aria-label={pageContext.backAriaLabel ?? "Back"}
          >
            <ChevronIcon name="chevronLeft" size={24} direction="left" />
          </button>
        ) : null}
        {pageContext ? (
          <div className="top-navbar__page-copy">
            <h1 className="top-navbar__page-title type-title-large">
              {pageContext.title}
            </h1>
            {pageContext.breadcrumb ? (
              <p className="top-navbar__page-breadcrumb type-body text-tertiary">
                {pageContext.breadcrumb}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="top-navbar__actions">
        <button
          type="button"
          className="top-navbar__icon-button"
          onClick={onNotify}
        >
          <Icon
            name="notification"
            className="lab-icon lab-icon--20"
            alt="Notifications"
          />
        </button>
        <div className="top-navbar__user">
          <div className="top-navbar__user-copy">
            <p className="top-navbar__user-name type-title-3">Natasha Smith</p>
            <p className="top-navbar__user-role type-body">Owner</p>
          </div>
          <ChevronIcon name="selectChevron" size={16} direction="down" />
        </div>
      </div>
    </header>
  );
}

export function PageHeader({ title, actionLabel, actionIcon = "add", onAction }) {
  return (
    <div className="page-header">
      <div className="page-header__title-wrap">
        <h1 className="page-header__title type-title-large">{title}</h1>
      </div>
      {actionLabel ? (
        <LabButton
          label={actionLabel}
          variant="primary"
          size="small"
          icon={actionIcon}
          onClick={onAction}
        />
      ) : null}
    </div>
  );
}
