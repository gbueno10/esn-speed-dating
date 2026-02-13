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

  async function handleScan(result: { rawValue: string }[]) {
    if (!scanning) return;

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

      toast.success(
        `You met ${data.name ?? "someone new"}! Added to your list.`
      );
      onOpenChange(false);
      setScanning(true);
    } catch (error) {
      toast.error("Something went wrong. Try again!");
      setScanning(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-4 border-primary/20 bg-card">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-background to-card">
          <DialogTitle className="text-center text-xl tracking-wider text-white glitch-hover">SCAN QR CODE</DialogTitle>
        </DialogHeader>
        <div className="aspect-square w-full relative">
          <div className="absolute inset-0 border-4 border-secondary/50 z-20 pointer-events-none rounded-b-3xl" />
          {open && (
            <Scanner
              onScan={handleScan}
              onError={() => toast.error("Camera error. Check permissions.")}
              formats={["qr_code"]}
              components={{ finder: true }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { borderRadius: "0 0 1.5rem 1.5rem" }
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
