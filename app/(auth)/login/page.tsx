"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/my-badge");
  }

  return (
    <Card className="w-full max-w-md cyber-card border-none overflow-hidden animate-fade-in relative group">
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      
      <div className="relative p-8 text-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-2">
          <div className="text-5xl mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]">👾</div>
          <CardTitle className="text-3xl font-black mb-2 glitch-hover" data-text="WELCOME BACK">
            WELCOME BACK
          </CardTitle>
          <CardDescription className="text-muted-foreground font-semibold tracking-wide uppercase text-xs">
            ESN Cyber Speed Dating
          </CardDescription>
        </div>
      </div>

      <CardContent className="pt-0 pb-8 px-8 relative z-10">
        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-white text-sm p-3 rounded-xl mb-6 animate-slide-up font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-secondary">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@esnporto.org"
              className="cyber-input h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold text-xs uppercase tracking-wider text-secondary">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="cyber-input h-12"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-black tracking-widest text-sm h-14 rounded-full shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)] hover:scale-[1.02] transition-all glitch-hover mt-4"
            disabled={loading}
          >
            {loading ? "ACCESSING..." : "ENTER SYSTEM"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          New here?{" "}
          <Link href="/signup" className="text-secondary font-bold hover:text-white transition-colors uppercase tracking-wide">
            Create Account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
