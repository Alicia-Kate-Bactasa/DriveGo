export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] w-full items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[2.5px] border-gray-200 border-t-primary" />
        <p className="text-xs font-medium text-gray-500 select-none">Loading...</p>
      </div>
    </div>
  );
}
