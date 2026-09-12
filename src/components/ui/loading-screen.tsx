"use client";

import { useEffect, useState } from "react";
import { Sparkles, Heart } from "lucide-react";

const CUTE_MESSAGES = [
  "Gathering kind hearts...",
  "Loading donation drives...",
  "Connecting communities...",
  "Spreading good vibes...",
  "Almost there...",
];

export function CuteLoadingScreen({
  message,
  fullPage = true,
}: {
  message?: string;
  fullPage?: boolean;
}) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % CUTE_MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [message]);

  const displayMessage = message || CUTE_MESSAGES[msgIndex];

  const content = (
    <div className="relative flex flex-col items-center">
      {/* Decorative floating sparkles & hearts */}
      <div className="pointer-events-none absolute -top-8 -left-6 text-amber-400 animate-cute-sparkle">
        <Sparkles size={20} />
      </div>
      <div
        className="pointer-events-none absolute -top-10 right-0 text-pink-400 animate-float-heart"
        style={{ animationDelay: "0.6s" }}
      >
        <Heart size={18} fill="currentColor" />
      </div>
      <div
        className="pointer-events-none absolute top-2 -right-8 text-blue-400 animate-cute-sparkle"
        style={{ animationDelay: "1s" }}
      >
        <Sparkles size={16} />
      </div>

      {/* Cute Character / Gift Box Container */}
      <div className="relative flex flex-col items-center mb-5">
        {/* Animated Bouncing Character */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-500 via-primary to-blue-700 shadow-lg shadow-blue-500/25 animate-cute-bounce">
          {/* Top gift ribbon knot / ears */}
          <div className="absolute -top-2 flex gap-1 items-center">
            <div className="h-2.5 w-3 rounded-full bg-white/90 rotate-[-25deg] shadow-xs" />
            <div className="h-2.5 w-3 rounded-full bg-white/90 rotate-[25deg] shadow-xs" />
          </div>

          {/* Cute Face */}
          <div className="flex flex-col items-center justify-center select-none">
            {/* Eyes */}
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2 rounded-full bg-white animate-pulse" />
              <div className="h-2.5 w-2 rounded-full bg-white animate-pulse" />
            </div>
            {/* Rosy Cheeks & Smile */}
            <div className="mt-1 flex items-center justify-center gap-4">
              <span className="h-1.5 w-2 rounded-full bg-pink-300/80" />
              <div className="h-1.5 w-2.5 rounded-b-full border-b-2 border-white" />
              <span className="h-1.5 w-2 rounded-full bg-pink-300/80" />
            </div>
          </div>

          {/* Floating tiny heart emblem */}
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-500 shadow-md">
            <Heart size={12} fill="currentColor" />
          </div>
        </div>

        {/* Dynamic squashing shadow beneath character */}
        <div className="mt-2 h-2.5 w-14 rounded-full bg-blue-900/20 blur-[2px] animate-cute-shadow" />
      </div>

      {/* Message and bouncing dots */}
      <div className="flex flex-col items-center text-center">
        <p className="text-base font-bold text-gray-800 transition-all duration-300">
          {displayMessage}
        </p>

        {/* 3 Bouncing Dots */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-primary inline-block"
            style={{ animation: "dot-bounce 1.2s infinite ease-in-out", animationDelay: "0s" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary inline-block"
            style={{ animation: "dot-bounce 1.2s infinite ease-in-out", animationDelay: "0.2s" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary inline-block"
            style={{ animation: "dot-bounce 1.2s infinite ease-in-out", animationDelay: "0.4s" }}
          />
        </div>

        {/* Gentle shimmer bar */}
        <div className="mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-full bg-gradient-to-r from-blue-400 via-primary to-blue-400 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );

  if (!fullPage) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center p-8">
        <div className="rounded-[40px] border border-white/80 bg-white/85 p-8 shadow-xl backdrop-blur-md">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading..."
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-xl transition-all duration-300 px-4"
    >
      <div className="relative rounded-[45px] border border-white/90 bg-white/90 px-10 py-8 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl">
        {content}
      </div>
    </div>
  );
}
