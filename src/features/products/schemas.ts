import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
});

export const productsResponseSchema = z.array(productSchema);
export type Product = z.infer<typeof productSchema>;
