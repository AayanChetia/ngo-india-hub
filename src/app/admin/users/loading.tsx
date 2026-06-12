import { Skeleton, TableSkeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-8">
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
