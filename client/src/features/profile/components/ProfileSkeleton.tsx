export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6 px-4 py-8">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-48 bg-slate-200" />
        <div className="space-y-4 p-8"><div className="h-28 w-28 -mt-20 rounded-full bg-slate-300" /><div className="h-7 w-56 rounded bg-slate-200" /><div className="h-4 w-full max-w-xl rounded bg-slate-200" /></div>
      </div>
      <div className="h-72 rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
