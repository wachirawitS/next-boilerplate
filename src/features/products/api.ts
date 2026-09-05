import { apiClient } from "../../lib/api-client";
import { productsResponseSchema, type Product } from "./schemas";

export async function getProducts(): Promise<Product[]> {
  const response: unknown = await apiClient<unknown>("/api/bff/example/products");
  return productsResponseSchema.parse(response);
}
