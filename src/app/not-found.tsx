import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <h2 className="text-4xl font-bold text-gray-900">404</h2>
        <p className="mt-2 text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}