import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-3xl" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[340px] rounded-3xl lg:col-span-2" />
        <Skeleton className="h-[340px] rounded-3xl" />
      </div>
      <Skeleton className="mt-6 h-[320px] rounded-3xl" />
    </div>
  )
}

