import { ChevronIcon, Icon } from "../../../../components/icons/Icon.jsx";
import {
  ListPageToolbar,
  TableActionButton,
  TableFooterBar,
} from "../../../../components/lists/Presentational.jsx";
import {
  EmptyState,
  LabCheckbox,
  Toggle,
} from "../../../../components/ui/Primitives.jsx";

export default function CatalogListPage({
  totalRows,
  filters,
  searchValue,
  onSearch,
  onAction,
  onTableScroll,
  allVisibleSelected,
  onToggleAll,
  sortKey,
  sortDirection,
  onSort,
  rows,
  selectedCatalogId,
  selectedRowIds,
  onToggleSelectedRow,
  onOpenDetail,
  onToggleAvailability,
  onRequestDelete,
  page,
  totalPages,
  rowsPerPage,
  onRowsChange,
  onPrev,
  onNext,
  onSelectPage,
  onDownload,
  formatIdr,
}) {
  return (
    <div className="catalog-page-table-wrap">
      <section className="table-card catalog-table-card list-page-table-card">
        <ListPageToolbar
          totalRows={totalRows}
          totalLabel={totalRows === 1 ? "Catalog" : "Catalogs"}
          filters={filters}
          searchPlaceholder="Search catalog"
          searchValue={searchValue}
          onSearch={onSearch}
          actionLabel="New Catalog"
          onAction={onAction}
        />
        <div
          className="table-scroll"
          data-scroll-top="false"
          onScroll={onTableScroll}
        >
          <table className="lab-table catalog-table">
            <thead>
              <tr>
                <th className="lab-table__checkbox">
                  <LabCheckbox
                    checked={allVisibleSelected}
                    onChange={onToggleAll}
                    ariaLabel="Select all catalog rows"
                  />
                </th>
                <th>
                  <button
                    type="button"
                    className="lab-table__header-button"
                    onClick={() => onSort("name")}
                  >
                    <span className="lab-table__header-stack">
                      <p className="type-title-3">Catalog Name</p>
                      <ChevronIcon
                        name="filterChevron"
                        size={16}
                        color="#C2C2C2"
                        direction={
                          sortKey === "name"
                            ? sortDirection === "asc"
                              ? "up"
                              : "down"
                            : "down"
                        }
                      />
                    </span>
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="lab-table__header-button"
                    onClick={() => onSort("category")}
                  >
                    <span className="lab-table__header-stack">
                      <p className="type-title-3">Category</p>
                      <ChevronIcon
                        name="filterChevron"
                        size={16}
                        color="#C2C2C2"
                        direction={
                          sortKey === "category"
                            ? sortDirection === "asc"
                              ? "up"
                              : "down"
                            : "down"
                        }
                      />
                    </span>
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="lab-table__header-button"
                    onClick={() => onSort("price")}
                  >
                    <span className="lab-table__header-stack">
                      <p className="type-title-3">Price</p>
                      <ChevronIcon
                        name="filterChevron"
                        size={16}
                        color="#C2C2C2"
                        direction={
                          sortKey === "price"
                            ? sortDirection === "asc"
                              ? "up"
                              : "down"
                            : "down"
                        }
                      />
                    </span>
                  </button>
                </th>
                <th className="lab-table__toggle lab-table__cell--center">
                  <p className="type-title-3">Availability</p>
                </th>
                <th className="lab-table__action" />
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`lab-table__row--clickable${selectedCatalogId === row.id
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
                      <p className="type-subtitle-2">{row.category || "Uncategorized"}</p>
                    </td>
                    <td>
                      <p className="type-subtitle-2">
                        {formatIdr(row.basePrice)}
                      </p>
                    </td>
                    <td
                      className="lab-table__toggle lab-table__cell--center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Toggle
                        checked={row.availability !== false}
                        onChange={() => onToggleAvailability(row.id)}
                        ariaLabel={`Toggle availability for ${row.name}`}
                      />
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
                  <td colSpan="6">
                    <EmptyState
                      title="No catalog matches the current filters"
                      copy="Adjust the search or chip filters to restore the full table."
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
          onDownload={onDownload}
        />
      </section>
    </div>
  );
}
