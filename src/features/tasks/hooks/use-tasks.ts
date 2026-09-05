"use client";

import { useQuery } from "@tanstack/react-query";
import { getTasks } from "../api";
import { tasksKeys } from "../query-keys";

export function useTasks() {
  return useQuery({ queryKey: tasksKeys.list(1, 20), queryFn: () => getTasks(1, 20) });
}
