"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ScanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  // The ID of the person being scanned comes from ?id=UUID
  const scannedId = searchParams.get("id");

  useEffect(() => {
    async function processScan() {
      if (!scannedId || processing) return;

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
        } else if (!res.ok) {
          toast.error(data.error || "Failed to connect. Try again.");
        } else {
          toast.success(`Connected with ${data.name}!`);
        }

        router.push("/my-connections");
      } catch (error) {
        toast.error("Failed to connect. Try again.");
        setProcessing(false);
      }
    }

    processScan();
  }, [scannedId, processing, router]);

  if (!scannedId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Scan Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No User ID provided in the URL.
            </p>
            <button
              onClick={() => router.push("/my-connections")}
              className="text-primary hover:underline"
            >
              Go back to My Connections
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Processing Scan...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Connecting you with new friends...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
