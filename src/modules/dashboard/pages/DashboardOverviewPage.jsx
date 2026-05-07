import { MetricCard } from "../../../components/dashboard/Presentational.jsx";
import { StatusPill } from "../../../components/ui/Primitives.jsx";

export default function DashboardOverviewPage({
  FeatureCardComponent,
  dashboardOrders,
  formatIdr,
  onOpenCatalog,
  onOpenDashboard,
  onOpenPricingRule,
  onOpenUserList,
}) {
  return (
    <>
      <div className="metric-strip">
        <MetricCard
          label="Sales Today"
          count={formatIdr(12450000)}
          tone="brand"
        />
        <MetricCard label="Orders" count={184} tone="neutral" />
        <MetricCard
          label="Avg. Ticket"
          count={formatIdr(67600)}
          tone="success"
        />
      </div>
      <section className="surface-panel">
        <div className="surface-panel__header">
          <div className="surface-panel__title-group">
            <p className="surface-panel__title type-headline">
              Modules in Motion
            </p>
            <p className="surface-panel__copy type-subtitle-2 text-secondary">
              Each card uses the Labamu feature palette rather than generic
              dashboard coloring.
            </p>
          </div>
        </div>
        <div className="feature-grid">
          <FeatureCardComponent
            label="Feature/Product"
            title="Catalog"
            copy="6 active products need price validation"
            tone="product"
            onOpen={onOpenCatalog}
          />
          <FeatureCardComponent
            label="Feature/Cashier"
            title="Cashier"
            copy="4 live stations with no current queue"
            tone="cashier"
            onOpen={onOpenDashboard}
          />
          <FeatureCardComponent
            label="Feature/Invoice"
            title="Invoice"
            copy="12 settlement documents waiting review"
            tone="invoice"
            onOpen={onOpenPricingRule}
          />
          <FeatureCardComponent
            label="Feature/Customer"
            title="Customer"
            copy="3 loyalty segments need campaign updates"
            tone="customer"
            onOpen={onOpenUserList}
          />
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="surface-panel">
          <div className="surface-panel__header">
            <div className="surface-panel__title-group">
              <p className="surface-panel__title type-headline">
                Recent Orders
              </p>
              <p className="surface-panel__copy type-subtitle-2 text-secondary">
                The operating view keeps the same compact table rhythm used in
                the catalog screen.
              </p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>
                    <p className="type-title-3">Order ID</p>
                  </th>
                  <th>
                    <p className="type-title-3">Guest</p>
                  </th>
                  <th>
                    <p className="type-title-3">Channel</p>
                  </th>
                  <th>
                    <p className="type-title-3">Total</p>
                  </th>
                  <th>
                    <p className="type-title-3">Status</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardOrders.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <p className="type-subtitle-2">{row.id}</p>
                    </td>
                    <td>
                      <p className="type-subtitle-2">{row.guest}</p>
                    </td>
                    <td>
                      <p className="type-subtitle-2">{row.channel}</p>
                    </td>
                    <td>
                      <p className="type-subtitle-2">{formatIdr(row.total)}</p>
                    </td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="stacked-panels">
          <section className="surface-panel">
            <div className="surface-panel__header">
              <div className="surface-panel__title-group">
                <p className="surface-panel__title type-headline">
                  Operational Notes
                </p>
                <p className="surface-panel__copy type-subtitle-2 text-secondary">
                  Sticky operational cues reuse the Infobox pattern from the
                  design system.
                </p>
              </div>
            </div>
            <div className="quick-list">
              <div className="lab-infobox lab-infobox--blue">
                <div className="lab-infobox__copy">
                  <p className="type-body">
                    Catalog sync runs again at 17:30 and will refresh POS cache
                    automatically.
                  </p>
                </div>
              </div>
              <div className="lab-infobox lab-infobox--orange">
                <div className="lab-infobox__copy">
                  <p className="type-body">
                    Two beverage modifiers are still missing printer routing in
                    Bandung.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="surface-panel">
            <div className="surface-panel__header">
              <div className="surface-panel__title-group">
                <p className="surface-panel__title type-headline">
                  Needs Attention
                </p>
                <p className="surface-panel__copy type-subtitle-2 text-secondary">
                  Focused, action-first list items instead of generic widget
                  chrome.
                </p>
              </div>
            </div>
            <div className="quick-list">
              {[
                [
                  "Lava Cake",
                  "Stock level is below the dessert par threshold.",
                  "Active catalog item",
                ],
                [
                  "Happy Hour Beverage",
                  "Rule expires tomorrow and still lacks weekend coverage.",
                  "Pricing review",
                ],
                [
                  "Bali Unit",
                  "Branch configuration is still inactive after yesterday's launch checklist.",
                  "Business unit",
                ],
              ].map(([title, copy, meta]) => (
                <div key={title} className="quick-list__item">
                  <div className="quick-list__stack">
                    <p className="quick-list__title type-title-3">{title}</p>
                    <p className="quick-list__copy type-body text-secondary">
                      {copy}
                    </p>
                  </div>
                  <span className="status-pill status-pill--muted">
                    <span className="type-body">{meta}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
