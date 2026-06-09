import { ChevronIcon, Icon } from "../../../../components/icons/Icon";
import { LabCheckbox } from "../../../../components/ui/Primitives";
import { TableActionButton } from "../../../../components/lists/Presentational";

export default function CategoryListPage({
  renderListPage,
  categoryRows,
  selectedRows,
  onToggleSelectedRow,
  onRowClick,
  categoryDetailId,
  config,
  allVisibleSelected,
  onToggleAllRows,
  sortByPage,
  sortDirectionByPage,
  onSort,
  handleDelete,
}) {
  // Group category rows by parent
  const rowsByParent = {};
  categoryRows.forEach(row => {
    const parent = row.parentCategory || "root";
    if (!rowsByParent[parent]) rowsByParent[parent] = [];
    rowsByParent[parent].push(row);
  });

  const renderTreeRows = (parentId = "root", depth = 0) => {
    const children = rowsByParent[parentId] || [];
    return children.flatMap((row) => {
      const isSelected = selectedRows.includes(row.id);
      const isDetailOpen = categoryDetailId === row.id;
      const hasChildren = !!rowsByParent[row.name];

      const tr = (
        <tr
          key={row.id}
          className={`lab-table__row--clickable ${isDetailOpen ? "lab-table__row--selected" : ""}`}
          onClick={() => onRowClick(row.id)}
        >
          <td className="lab-table__checkbox" onClick={(e) => e.stopPropagation()}>
            <LabCheckbox
              checked={isSelected}
              onChange={() => onToggleSelectedRow(row.id)}
            />
          </td>
          {config.columns.map((col) => {
            if (col.type === "link") {
              return (
                <td key={col.key} className="lab-table__title-cell">
                  <div style={{ display: "flex", alignItems: "center", paddingLeft: `${depth * 24}px` }}>
                    <p className="type-subtitle-2" style={{ color: "var(--feature-brand-primary)" }}>{row[col.key]}</p>
                  </div>
                </td>
              );
            }
            if (col.type === "delete") {
              return (
                <td key={col.key} className="lab-table__action" onClick={(e) => e.stopPropagation()}>
                  <div className="lab-table__action-group">
                    <TableActionButton
                      tooltip={row.isDefault ? "Cannot delete default category" : "Delete"}
                      disabled={row.isDefault}
                      onClick={(e) => { e.stopPropagation(); if (!row.isDefault) handleDelete(row.id); }}
                    >
                      <Icon name="delete" className="lab-icon lab-icon--16" />
                    </TableActionButton>
                  </div>
                </td>
              );
            }
            return (
              <td key={col.key}>
                <div className={col.contentClassName || ""}>
                  <p className="type-subtitle-2">{row[col.key] || "-"}</p>
                </div>
              </td>
            );
          })}
        </tr>
      );

      return hasChildren
        ? [tr, ...renderTreeRows(row.name, depth + 1)]
        : [tr];
    });
  };

  const customTable = (
    <table className="lab-table">
      <thead>
        <tr>
          <th className="lab-table__checkbox">
            <LabCheckbox
              checked={allVisibleSelected}
              onChange={onToggleAllRows}
            />
          </th>
          {config.columns.map(col => (
            <th key={col.key} className={col.type === "delete" ? "lab-table__action" : (col.key === "name" ? "lab-table__title-column" : "")}>
              {col.label ? (
                col.sortable ? (
                  <span className="lab-table__header-stack">
                    <button type="button" className="lab-table__header-button" onClick={() => onSort(col.key)}>
                      <p className="type-title-3">{col.label}</p>
                    </button>
                    <ChevronIcon
                      name="filterChevron"
                      size={16}
                      color="#C2C2C2"
                      direction={sortByPage.category === col.key ? (sortDirectionByPage.category === "asc" ? "up" : "down") : "down"}
                    />
                  </span>
                ) : <p className="type-title-3">{col.label}</p>
              ) : null}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {categoryRows?.length > 0 ? renderTreeRows() : (
          <tr>
            <td colSpan={config.columns.length + 1}>
              <div style={{ padding: "32px", textAlign: "center" }}>
                <p className="type-title-3">No categories found</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return renderListPage(customTable);
}
