"use client";

import { RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "../hooks/use-tasks";

function TasksSkeleton() {
  return <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-20" />)}</div>;
}

export function TasksScreen() {
  const { data: result, isLoading, isError, refetch } = useTasks();
  const tasks = result?.data ?? [];

  return <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
    <header className="mb-10"><p className="mb-2 text-sm font-medium text-slate-500">NestJS module example</p><h1 className="text-4xl font-semibold tracking-tight">Tasks</h1><p className="mt-3 max-w-xl text-slate-600">ตัวอย่างหน้าจอที่คุยกับ NestJS ผ่าน Next.js BFF และ `/api/v1/tasks`</p></header>
    {isLoading && <TasksSkeleton />}
    {isError && <div className="rounded-xl border border-red-200 bg-red-50 p-6"><p className="text-red-800">โหลดข้อมูลไม่สำเร็จ</p><Button className="mt-4" variant="outline" onClick={() => void refetch()}><RefreshCw className="mr-2 size-4" />ลองอีกครั้ง</Button></div>}
    {!isLoading && !isError && tasks.length === 0 && <EmptyState />}
    {!isLoading && !isError && tasks.length > 0 && <div className="space-y-3">{tasks.map((task) => <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{task.title}</h2><p className="mt-2 text-sm text-slate-600">{task.description ?? "ไม่มีคำอธิบาย"}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{task.isCompleted ? "เสร็จแล้ว" : "กำลังทำ"}</span></div></article>)}</div>}
  </main>;
}
