"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function QrScannerDialog({
  open,
  onOpenChange,
  currentProfileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfileId: string;
}) {
  const [scanning, setScanning] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scannedName, setScannedName] = useState("");

  async function handleScan(result: { rawValue: string }[]) {
    if (!scanning || showSuccess) return;

    const scannedId = result[0]?.rawValue;
    if (!scannedId || !UUID_REGEX.test(scannedId)) {
      toast.error("Invalid QR code");
      return;
    }

    setScanning(false);

    try {
      const res = await fetch("/api/connections/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanned_id: scannedId }),
      });

      const data = await res.json();

      if (res.status === 409 && data.alreadyConnected) {
        toast.info("Already connected!");
        onOpenChange(false);
        setScanning(true);
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Try again!");
        setScanning(true);
        return;
      }

      // Success!
      setScannedName(data.name || "someone new");
      setShowSuccess(true);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF007F", "#FFCC00", "#00dbde"]
      });

      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
        setScanning(true);
      }, 3000);
      
    } catch (error) {
      toast.error("Something went wrong. Try again!");
      setScanning(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!showSuccess) onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[2.5rem] border-4 border-primary/50 bg-background/95 backdrop-blur-xl transition-all duration-500">
        {!showSuccess ? (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-center text-2xl font-black italic tracking-[0.2em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,0,127,0.5)]">
                Target <span className="text-primary italic">Scanner</span>
              </DialogTitle>
            </DialogHeader>
            <div className="aspect-square w-full relative group">
              {/* Sci-fi HUD Elements */}
              <div className="absolute inset-0 z-20 pointer-events-none p-4">
                {/* Corners */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-secondary rounded-tl-xl shadow-[0_0_15px_rgba(255,204,0,0.5)]" />
                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-secondary rounded-tr-xl shadow-[0_0_15px_rgba(255,204,0,0.5)]" />
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-secondary rounded-bl-xl shadow-[0_0_15px_rgba(255,204,0,0.5)]" />
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-secondary rounded-br-xl shadow-[0_0_15px_rgba(255,204,0,0.5)]" />
                
                {/* Scanning Line */}
                <div className="absolute left-1/4 right-1/4 h-1 bg-primary/60 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
                <div className="absolute left-1/4 right-1/4 h-0.5 bg-white/80 animate-[scan_2s_ease-in-out_infinite]" />
                
                {/* HUD Stats Decoration */}
                <div className="absolute top-1/2 -right-2 text-[8px] font-mono text-secondary vertical-text flex flex-col gap-2 -translate-y-1/2">
                  <span>010101</span>
                  <span>SCANNING_</span>
                  <span>UID_SEARCH</span>
                </div>
              </div>

              {open && (
                <Scanner
                  onScan={handleScan}
                  onError={() => toast.error("Camera error. Check permissions.")}
                  formats={["qr_code"]}
                  components={{ finder: false }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { objectFit: "cover" }
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,0,127,0.7)] mb-6 animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black italic text-center text-white mb-2 uppercase tracking-tighter">New Connection!</h2>
            <p className="text-secondary font-bold text-xl uppercase tracking-widest">{scannedName}</p>
            <div className="mt-8 text-xs font-mono text-white/40 uppercase">Linking Identity... 100%</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
