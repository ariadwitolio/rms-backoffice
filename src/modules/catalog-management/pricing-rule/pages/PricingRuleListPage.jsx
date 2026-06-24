import { ChevronIcon, Icon } from "../../../../components/icons/Icon.jsx";
import {
  ListPageToolbar,
  TableActionButton,
  TableFooterBar,
} from "../../../../components/lists/Presentational.jsx";
import {
  EmptyState,
  LabCheckbox,
} from "../../../../components/ui/Primitives.jsx";

export default function PricingRuleListPage({
  PricingRuleTabButtonComponent,
  PricingOverrideCardComponent,
  pricingRuleTab,
  onSetPricingRuleTab,
  catalogOverrideGroups,
  modifierOverrideGroups,
  selectedPricingOverrides,
  onToggleAllCatalogOverrides,
  onToggleCatalogOverrideGroup,
  onToggleCatalogOverrideItem,
  catalogPricingOverrideEditing,
  onStartCatalogPricingOverrideEdit,
  onChangePricingOverrideEdit,
  onSavePricingOverrideEdit,
  onCancelPricingOverrideEdit,
  onToggleAllModifierOverrides,
  onToggleModifierOverrideGroup,
  onToggleModifierOverrideItem,
  modifierPricingOverrideEditing,
  onStartModifierPricingOverrideEdit,
  pricingOverrideInputRef,
  totalRows,
  searchValue,
  onSearch,
  onAction,
  onTableScroll,
  allVisibleSelected,
  onToggleAllRows,
  rows,
  selectedPricingRuleId,
  selectedRowIds,
  onToggleSelectedRow,
  onOpenDetail,
  onRequestDelete,
  page,
  totalPages,
  rowsPerPage,
  onRowsChange,
  onPrev,
  onNext,
  onSelectPage,
}) {
  return (
    <>
      <div className="pricing-rule-tabs">
        <PricingRuleTabButtonComponent
          label="Default Rule"
          active={pricingRuleTab === "default"}
          onClick={() => onSetPricingRuleTab("default")}
        />
        <PricingRuleTabButtonComponent
          label="Special Rule"
          active={pricingRuleTab === "special"}
          onClick={() => onSetPricingRuleTab("special")}
        />
      </div>
      {pricingRuleTab === "default" ? (
        <div className="pricing-rule-grid">
          <PricingOverrideCardComponent
            title="Catalog Override Rules"
            groups={catalogOverrideGroups}
            selectedIds={selectedPricingOverrides.catalog}
            onToggleAll={onToggleAllCatalogOverrides}
            onToggleGroup={onToggleCatalogOverrideGroup}
            onToggleItem={onToggleCatalogOverrideItem}
            editing={catalogPricingOverrideEditing}
            onStartEdit={onStartCatalogPricingOverrideEdit}
            onChangeEdit={onChangePricingOverrideEdit}
            onSaveEdit={onSavePricingOverrideEdit}
            onCancelEdit={onCancelPricingOverrideEdit}
            editInputRef={pricingOverrideInputRef}
          />
          <PricingOverrideCardComponent
            title="Modifier Override Rules"
            groups={modifierOverrideGroups}
            selectedIds={selectedPricingOverrides.modifier}
            onToggleAll={onToggleAllModifierOverrides}
            onToggleGroup={onToggleModifierOverrideGroup}
            onToggleItem={onToggleModifierOverrideItem}
            editing={modifierPricingOverrideEditing}
            onStartEdit={onStartModifierPricingOverrideEdit}
            onChangeEdit={onChangePricingOverrideEdit}
            onSaveEdit={onSavePricingOverrideEdit}
            onCancelEdit={onCancelPricingOverrideEdit}
            editInputRef={pricingOverrideInputRef}
          />
        </div>
      ) : (
        <div className="catalog-page-table-wrap">
          <section className="table-card pricing-rule-table-card list-page-table-card">
            <ListPageToolbar
              totalRows={totalRows}
              totalLabel={totalRows === 1 ? "Rule" : "Rules"}
              filters={[]}
              searchPlaceholder="Search"
              searchValue={searchValue}
              onSearch={onSearch}
              actionLabel="New Special Pricing Rule"
              onAction={onAction}
            />
            <div
              className="table-scroll"
              data-scroll-top="false"
              onScroll={onTableScroll}
            >
              <table className="lab-table">
                <thead>
                  <tr>
                    <th className="lab-table__checkbox">
                      <LabCheckbox
                        checked={allVisibleSelected}
                        onChange={onToggleAllRows}
                        ariaLabel="Select all pricing rules"
                      />
                    </th>
                    <th>
                      <span className="lab-table__header-stack">
                        <p className="type-title-3">Rule Name</p>
                        <ChevronIcon
                          name="filterChevron"
                          size={16}
                          direction="down"
                        />
                      </span>
                    </th>
                    <th>
                      <p className="type-title-3">Time Window</p>
                    </th>
                    <th className="lab-table__action" />
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`lab-table__row--clickable${selectedPricingRuleId === row.id
                          ? " lab-table__row--selected"
                          : ""
                          }`}
                        tabIndex={0}
                        onClick={() => onOpenDetail(row.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onOpenDetail(row.id);
                          }
                        }}
                      >
                        <td
                          className="lab-table__checkbox"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <LabCheckbox
                            checked={selectedRowIds.includes(row.id)}
                            onChange={() => onToggleSelectedRow(row.id)}
                            ariaLabel={`Select ${row.name}`}
                          />
                        </td>
                        <td>
                          <p className="type-subtitle-2 lab-table__link">
                            {row.name}
                          </p>
                        </td>
                        <td>
                          <p className="type-subtitle-2">
                            {(row.timeWindowParts ?? []).map((part, index) => (
                              <span
                                key={`${row.id}-${index}`}
                                className={
                                  part.muted ? "text-secondary" : undefined
                                }
                              >
                                {part.text}
                              </span>
                            ))}
                          </p>
                        </td>
                        <td
                          className="lab-table__action"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <TableActionButton
                            tooltip="Delete"
                            onClick={() => onRequestDelete(row)}
                          >
                            <Icon
                              name="delete"
                              className="lab-icon lab-icon--16"
                              alt="Delete"
                            />
                          </TableActionButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <EmptyState
                          title="No pricing rule matches your search"
                          copy="Try using different keywords or adjusting your filters"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <TableFooterBar
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalRows={totalRows}
              onRowsChange={onRowsChange}
              onPrev={onPrev}
              onNext={onNext}
              onSelectPage={onSelectPage}
              showDownload={false}
            />
          </section>
        </div>
      )}
    </>
  );
}
