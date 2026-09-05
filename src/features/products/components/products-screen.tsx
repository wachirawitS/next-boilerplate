"use client";

import { RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "../hooks/use-products";

function ProductsSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-40" />)}</div>;
}

export function ProductsScreen() {
  const { data: products, isLoading, isError, refetch } = useProducts();

  return <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
    <header className="mb-10">
      <p className="mb-2 text-sm font-medium text-slate-500">ตัวอย่าง feature</p>
      <h1 className="text-4xl font-semibold tracking-tight">Products</h1>
      <p className="mt-3 max-w-xl text-slate-600">ตัวอย่าง client-first screen ที่อ่านข้อมูลผ่าน BFF ของ Next.js</p>
    </header>
    {isLoading && <ProductsSkeleton />}
    {isError && <div className="rounded-xl border border-red-200 bg-red-50 p-6"><p className="text-red-800">โหลดข้อมูลไม่สำเร็จ</p><Button className="mt-4" variant="outline" onClick={() => void refetch()}><RefreshCw className="mr-2 size-4" />ลองอีกครั้ง</Button></div>}
    {!isLoading && !isError && products?.length === 0 && <EmptyState />}
    {!isLoading && !isError && products && products.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">{product.name}</h2><p className="mt-2 text-sm text-slate-600">{product.description}</p><p className="mt-5 font-medium">฿{product.price.toLocaleString("th-TH")}</p></article>)}</div>}
  </main>;
}
