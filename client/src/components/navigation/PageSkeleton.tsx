export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-3 w-24 rounded-full pl-shimmer" />

      <div className="mt-4 h-10 w-72 rounded-xl pl-shimmer" />

      <div className="mt-3 h-4 w-full max-w-2xl rounded-full pl-shimmer" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-white/[0.06] pl-shimmer"
          />
        ))}
      </div>

      <div className="mt-6 h-80 rounded-3xl border border-white/[0.06] pl-shimmer" />
    </div>
  );
}
