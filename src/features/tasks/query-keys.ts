export const tasksKeys = {
  all: ["tasks"] as const,
  list: (page: number, limit: number) => [...tasksKeys.all, "list", { page, limit }] as const,
};
