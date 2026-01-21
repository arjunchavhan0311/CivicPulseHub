// Priority chip colors
export const priorityColor = (priority) => {
  if (priority === "HIGH") return "error";    // Red
  if (priority === "MEDIUM") return "warning"; // Yellow
  return "success";                            // Green for LOW
};

// Status chip colors
export const statusColor = (status) => {
  if (status === "PENDING") return "warning";       // Amber
  if (status === "IN_PROGRESS") return "warning";   // Yellow to distinguish from category
  if (status === "RESOLVED") return "success";      // Green
  if (status === "ESCALATED") return "error";       // Red
  return "default";                                 // Default grey
};
