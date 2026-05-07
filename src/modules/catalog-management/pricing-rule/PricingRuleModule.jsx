export default function PricingRuleModule({
  isSpecialRuleTab,
  isDetailOpen,
  isCreateOpen,
  lockedInfoBox,
  children,
  sidePanel = null,
}) {
  return (
    <section
      className={`page-canvas${isSpecialRuleTab ? " catalog-page-shell" : ""}${isDetailOpen || isCreateOpen ? " is-detail-open" : ""
        }`}
    >
      <div className={isSpecialRuleTab ? "catalog-page-main" : undefined}>
        <div className="page-body page-body--list">
          {lockedInfoBox}
          {children}
        </div>
      </div>
      {sidePanel}
    </section>
  );
}
