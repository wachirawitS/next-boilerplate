"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api";
import { productsKeys } from "../query-keys";

export function useProducts() {
  return useQuery({ queryKey: productsKeys.list(), queryFn: getProducts });
}
