import { z } from "zod";

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  isCompleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const taskListResponseSchema = z.object({
  data: z.array(taskSchema),
  meta: z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() }),
});

export type Task = z.infer<typeof taskSchema>;
