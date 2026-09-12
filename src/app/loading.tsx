export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[2.5px] border-gray-200 border-t-primary" />
        <p className="text-xs font-medium text-gray-500 select-none">Loading...</p>
      </div>
    </div>
  );
}
