"use client";

import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrScannerDialog } from "@/components/qr-scanner-dialog";

export function ScanFab() {
  const [open, setOpen] = useState(false);
  const [profileId, setProfileId] = useState<string>("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (res.ok) {
          setProfileId(data.profile?.id || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }

    fetchProfile();
  }, []);

  if (!profileId) return null;

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-24 right-6 z-50 h-16 w-16 rounded-full shadow-[0_0_20px_rgba(255,0,127,0.4)] bg-primary text-white hover:bg-secondary hover:text-background border-2 border-white/10 transition-all hover:scale-110 glitch-hover"
        onClick={() => setOpen(true)}
      >
        <ScanLine className="h-8 w-8" />
        <span className="sr-only">Scan New Friend</span>
      </Button>
      <QrScannerDialog
        open={open}
        onOpenChange={setOpen}
        currentProfileId={profileId}
      />
    </>
  );
}
