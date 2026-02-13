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
    <Card className="w-full max-w-md shadow-xl overflow-hidden animate-fade-in border-4 border-pink-500">
      <div className="love-bg p-8 text-white text-center relative overflow-hidden">
        {/* Floating hearts decoration */}
        <div className="absolute top-4 right-8 text-3xl heart-float opacity-60">❤️</div>
        <div className="absolute top-12 left-6 text-2xl heart-float opacity-40" style={{ animationDelay: '0.5s' }}>💕</div>
        <div className="absolute bottom-6 right-12 text-2xl heart-float opacity-50" style={{ animationDelay: '1s' }}>💖</div>
        <div className="absolute bottom-8 left-10 text-xl heart-float opacity-30" style={{ animationDelay: '1.5s' }}>💗</div>

        <div className="relative z-10">
          <div className="text-6xl mb-3 heart-pulse">❤️</div>
          <CardTitle className="text-3xl font-bold mb-2 drop-shadow-lg">Welcome Back!</CardTitle>
          <CardDescription className="text-white/95 font-medium text-base">
            ESN Porto Speed Dating
          </CardDescription>
        </div>
      </div>

      <CardContent className="pt-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4 animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="transition-all focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              className="transition-all focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full love-bg-dark hover:bg-red-600 text-white font-bold text-base h-12 shadow-md transition-all hover:shadow-lg hover:scale-105 border-2 border-red-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "❤️ Log In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New here?{" "}
          <Link href="/signup" className="text-pink-600 font-bold hover:text-rose-600 transition-colors underline">
            💕 Join the party
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
