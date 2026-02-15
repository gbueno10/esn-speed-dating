"use client";

import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md event-card border-none overflow-hidden animate-fade-in relative group my-8">
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-50 transition-opacity duration-500" />
      
      <div className="relative p-12 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-6 flex flex-col items-center">
          <div className="bg-amber-500/20 p-4 rounded-full mb-2">
            <AlertCircle className="h-12 w-12 text-amber-500" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black mb-1">REGISTRATION CLOSED</CardTitle>
            <CardDescription className="text-muted-foreground font-semibold tracking-wide uppercase text-xs">
              This Speed Dating event has already finished.
            </CardDescription>
          </div>

          <div className="w-full h-px bg-white/10 my-4" />

          <p className="text-sm text-zinc-400 leading-relaxed">
            The event has concluded and matches have been revealed. New accounts cannot be created at this time.
          </p>

          <Button asChild className="w-full bg-white text-black font-black uppercase tracking-widest py-6 rounded-2xl hover:bg-zinc-200 transition-all mt-4">
            <Link href="/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
