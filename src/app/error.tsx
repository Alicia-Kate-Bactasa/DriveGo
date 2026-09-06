"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-red-900">Something went wrong!</h2>
        <p className="mt-2 text-sm text-red-600">{error.message || "An unexpected error occurred."}</p>
        <button className="mt-4 rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white" onClick={() => reset()}>
          Try Again
        </button>
      </div>
    </div>
  );
}