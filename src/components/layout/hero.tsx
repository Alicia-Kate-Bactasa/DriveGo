"use client";

import Image from "next/image";
import { Button, LinkButton } from "@/components/ui/button";
import { useSubmitModal } from "@/components/drive/submit-modal-context";

export function Hero() {
  const { openSubmitModal } = useSubmitModal();

  return (
    <section
      id="home"
      className="relative flex min-h-[85vh] lg:min-h-[92vh] flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 pt-32 pb-20 lg:pt-36 lg:pb-24 text-white scroll-mt-16"
    >
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-20"
      />

      <div className="relative mx-auto my-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[45px] border border-white/20 bg-white/10 p-8 backdrop-blur-md lg:p-12">
          <h1 className="text-balance text-4xl font-bold leading-tight lg:text-5xl">
            Discover and explore <br />
            donation drives <br />
            near you.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Browse donation drives and support what you want to see in your
            local community, or sign in to organize your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/category/all" size="lg">
              Browse Drives
            </LinkButton>
            <Button
              onClick={openSubmitModal}
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              Submit a Drive
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
