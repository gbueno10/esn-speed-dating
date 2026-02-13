"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";
import confetti from "canvas-confetti";

export default function ScanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");

  // The ID of the person being scanned comes from ?id=UUID
  const scannedId = searchParams.get("id");

  useEffect(() => {
    async function processScan() {
      if (!scannedId || processing || success) return;

      setProcessing(true);

      try {
        const res = await fetch("/api/connections/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scanned_id: scannedId }),
        });

        const data = await res.json();

        if (res.status === 409 && data.alreadyConnected) {
          toast.info(`You already connected with ${data.name || "this person"}!`);
          router.push("/my-connections");
        } else if (!res.ok) {
          toast.error(data.error || "Failed to connect. Try again.");
          router.push("/my-connections");
        } else {
          setName(data.name || "someone new");
          setSuccess(true);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#FF007F", "#FFCC00", "#00dbde"]
          });
          
          setTimeout(() => {
            router.push("/my-connections");
          }, 3000);
        }
      } catch (error) {
        toast.error("Failed to connect. Try again.");
        setProcessing(false);
      }
    }

    processScan();
  }, [scannedId, processing, success, router]);

  if (!scannedId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-[2rem] border-2 border-destructive/50 text-center max-w-md w-full">
            <h2 className="text-2xl font-black text-white uppercase italic mb-2">Scan Error</h2>
            <p className="text-muted-foreground mb-6">No User ID provided in the URL.</p>
            <button
              onClick={() => router.push("/my-connections")}
              className="px-6 py-2 bg-white/10 rounded-full text-white font-bold uppercase tracking-widest text-xs border border-white/20 hover:bg-white/20 transition-all"
            >
              Back to Connections
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      {!success ? (
        <div className="glass-panel p-10 rounded-[3rem] border-2 border-primary/30 text-center flex flex-col items-center gap-6 animate-pulse">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping" />
            <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Linking Identities</h2>
            <p className="text-muted-foreground text-sm font-mono mt-1">ESTABLISHING ENCRYPTED CONNECTION...</p>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-10 rounded-[3rem] border-2 border-secondary/50 text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,204,0,0.5)] mb-4">
            <Zap className="h-10 w-10 text-background fill-current" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">New Connection!</h2>
            <p className="text-secondary font-black text-2xl uppercase tracking-widest">{name}</p>
          </div>
          <div className="mt-6 px-4 py-1 bg-white/5 rounded-full border border-white/10">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Redirecting Proxy...</p>
          </div>
        </div>
      )}
    </div>
  );
}
