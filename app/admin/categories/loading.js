import { FormSkeleton, TableSkeleton } from "@/components/ui/Skeleton.jsx";

export default function AdminCategoriesLoading() {
  return (
    <div className="grid gap-6">
      <FormSkeleton sections={1} />
      <TableSkeleton rows={5} />
    </div>
  );
}
