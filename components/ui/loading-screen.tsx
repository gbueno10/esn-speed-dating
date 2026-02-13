"use client";

import { Loader2 } from "lucide-react";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="glass-panel p-10 rounded-[3rem] border-2 border-primary/30 text-center flex flex-col items-center gap-6 animate-pulse">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {message.split(" ")[0]} <span className="text-primary">{message.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-muted-foreground text-[10px] font-mono mt-1 tracking-[0.3em] uppercase opacity-60">
            Establishing Connection...
          </p>
        </div>
      </div>
    </div>
  );
}
