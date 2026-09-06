import Link from "next/link";
import Image from "next/image";
import { LinkButton } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 py-20 text-white lg:py-28">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-20"
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md lg:p-12">
          <h1 className="text-balance text-4xl font-bold leading-tight lg:text-5xl">
            Discover and explore <br />
            donation drives <br />
            near you.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Browse donation drives and support what you want to see in your
            local community.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/category/all" size="lg">
              Browse Drives
            </LinkButton>
            <LinkButton
              href="/submit"
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              Submit a Drive
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
