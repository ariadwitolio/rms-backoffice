export default function CatalogModule({
  isDetailOpen,
  isCreateOpen,
  lockedInfoBox,
  pageHeader = null,
  children,
  sidePanel = null,
}) {
  return (
    <section
      className={`page-canvas catalog-page-shell${isDetailOpen || isCreateOpen ? " is-detail-open" : ""
        }`}
    >
      <div className="catalog-page-main">
        {pageHeader}
        <div className="page-body page-body--list">
          {lockedInfoBox}
          {children}
        </div>
      </div>
      {sidePanel}
    </section>
  );
}
