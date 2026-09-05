import { PackageOpen } from "lucide-react";

export function EmptyState() {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><PackageOpen className="mx-auto mb-3 text-slate-400" /><p className="text-slate-600">ยังไม่มีข้อมูล</p></div>;
}
