"use client";

export function LoadingScreen({
  message = "Loading...",
  fullPage = true,
}: {
  message?: string;
  fullPage?: boolean;
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3.5 rounded-[32px] border border-white/60 bg-white/85 px-7 py-6 shadow-xl shadow-black/5 backdrop-blur-xl">
      <div className="relative flex h-9 w-9 items-center justify-center">
        {/* Minimalist smooth spinner */}
        <div className="h-9 w-9 rounded-full border-[2.5px] border-blue-100 border-t-primary animate-spin" />
      </div>
      {message && (
        <p className="text-xs font-medium text-gray-600 tracking-wide select-none">
          {message}
        </p>
      )}
    </div>
  );

  if (!fullPage) {
    return (
      <div className="flex min-h-[240px] w-full items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading..."
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-md transition-opacity duration-200 px-4"
    >
      {content}
    </div>
  );
}

// Alias for backwards compatibility
export const CuteLoadingScreen = LoadingScreen;
