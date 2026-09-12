"use client";

import Image from "next/image";
import { Button, LinkButton } from "@/components/ui/button";
import { useSubmitModal } from "@/components/drive/submit-modal-context";

export function Hero() {
  const { openSubmitModal } = useSubmitModal();

  const handleBrowseDrives = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("categories");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative flex min-h-[82vh] lg:min-h-[85vh] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 text-white scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-8">
        {/* Centered square component with 45px border radius and picture */}
        <div className="relative mx-auto w-full max-w-2xl lg:max-w-3xl aspect-[1/1] sm:aspect-[1.08/1] min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] overflow-hidden rounded-[45px] border border-white/25 shadow-2xl shadow-blue-950/30">
          {/* Picture inside the square component */}
          <Image
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80"
            alt="Community donation drive"
            fill
            priority
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
          />

          {/* Dark frosted gradient overlay to ensure text is clear and readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/20 backdrop-blur-[1px] p-7 sm:p-10 lg:p-12 flex flex-col justify-end">
            <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl drop-shadow-sm">
              Discover and explore <br />
              donation drives <br />
              near you.
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base lg:text-lg text-white/90 drop-shadow-xs">
              Browse donation drives and support what you want to see in your
              local community, or sign in to organize your own.
            </p>
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="#categories" onClick={handleBrowseDrives} size="lg">
                Browse Drives
              </LinkButton>
              <Button
                onClick={openSubmitModal}
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
              >
                Submit a Drive
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
