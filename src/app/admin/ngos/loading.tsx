import { Skeleton, TableSkeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-8">
        <TableSkeleton rows={10} />
      </div>
    </div>
  );
}
