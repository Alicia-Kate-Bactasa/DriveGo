import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent to-brand-700 py-20 text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600')] bg-cover bg-center opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md lg:p-12">
          <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
            Discover and explore <br />
            donation drives <br />
            near you.
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Browse the donation drives and support what you want to see in your local community.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/category/all" size="lg">Browse Drives</LinkButton>
            <LinkButton href="/submit" size="lg" variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">Submit a Drive</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}