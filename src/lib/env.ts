import { z } from "zod";

const serverSchema = z.object({
  UPSTREAM_API_URL: z.string().url(),
  UPSTREAM_SERVICE_TOKEN: z.string().min(1),
});

export const env = serverSchema.parse({
  UPSTREAM_API_URL: process.env.UPSTREAM_API_URL,
  UPSTREAM_SERVICE_TOKEN: process.env.UPSTREAM_SERVICE_TOKEN,
});
