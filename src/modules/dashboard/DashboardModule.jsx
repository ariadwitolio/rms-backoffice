export default function DashboardModule({
  className = "page-canvas",
  bodyClassName = "page-body",
  stickyContent = null,
  lockedInfoBox = null,
  pageHeader = null,
  children,
}) {
  return (
    <section className={className}>
      {pageHeader}
      {stickyContent ? (
        <div className="dashboard-page-sticky">
          {lockedInfoBox ? (
            <div className="dashboard-page-sticky__banner">
              {lockedInfoBox}
            </div>
          ) : null}
          {stickyContent}
        </div>
      ) : null}
      <div className={bodyClassName}>
        {stickyContent ? null : lockedInfoBox}
        {children}
      </div>
    </section>
  );
}
