export function CardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border/60 bg-card overflow-hidden flex flex-col">
      <div className="aspect-square shimmer" />
      <div className="flex-1 p-3 sm:p-4 space-y-2.5">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
        <div className="h-3 w-full rounded shimmer hidden sm:block" />
        <div className="mt-auto flex justify-between pt-2">
          <div className="h-6 w-16 rounded shimmer" />
          <div className="h-8 w-12 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
