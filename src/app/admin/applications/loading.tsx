import { Skeleton, TableSkeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-2 h-4 w-60" />
      <div className="mt-8">
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
