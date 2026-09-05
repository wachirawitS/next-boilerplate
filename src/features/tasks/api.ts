import { apiClient } from "../../lib/api-client";
import { taskListResponseSchema, type Task } from "./schemas";

export async function getTasks(page = 1, limit = 20): Promise<{ data: Task[]; total: number }> {
  const response: unknown = await apiClient<unknown>(`/api/bff/tasks?page=${page}&limit=${limit}`);
  const parsed = taskListResponseSchema.parse(response);
  return { data: parsed.data, total: parsed.meta.total };
}
