import { z } from "zod";

const serverSchema = z.object({
  UPSTREAM_API_URL: z.string().url(),
});

export const env = serverSchema.parse({
  UPSTREAM_API_URL: process.env.UPSTREAM_API_URL,
});
