export function defineIcon(viewBox, markup) {
  return { viewBox, markup };
}

export function getStatusTone(status) {
  if (!status) return "muted";

  if (
    status === "Active" ||
    status === "Completed" ||
    status === "Success" ||
    status === "Available" ||
    status === "Connected" ||
    status === "Track Stock"
  ) {
    return "success";
  }

  if (status === "System") {
    return "primary";
  }

  if (status === "Custom") {
    return "success";
  }

  if (
    status === "Preparing" ||
    status === "Queued" ||
    status === "Low" ||
    status === "Below Threshold" ||
    status === "Refund" ||
    status === "Pending" ||
    status === "Invited"
  ) {
    return "warning";
  }

  if (
    status === "Inactive" ||
    status === "VOID" ||
    status === "Empty" ||
    status === "Out of Stock" ||
    status === "Critical" ||
    status === "Disconnected" ||
    status === "Locked"
  ) {
    return "danger";
  }

  if (status === "Cancelled" || status === "Expired") {
    return "muted";
  }

  return "muted";
}

export function getPaginationItems(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [];

  function pushItem(item) {
    if (items[items.length - 1] !== item) {
      items.push(item);
    }
  }

  pushItem(1);
  pushItem(2);

  if (page > 3) {
    pushItem("start-ellipsis");
  }

  if (page > 2 && page < totalPages - 1) {
    pushItem(page);
  }

  if (page < totalPages - 2) {
    pushItem("end-ellipsis");
  }

  pushItem(totalPages - 1);
  pushItem(totalPages);

  return items;
}
