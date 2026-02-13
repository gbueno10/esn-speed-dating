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

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const instagram_handle = formData.get("instagram_handle") as string;
    const gender = formData.get("gender") as string;
    const interested_in = formData.get("interested_in") as string;

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, instagram_handle, gender },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile directly
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("speed_dating_profiles")
        .insert({
          user_id: user.id,
          name,
          instagram_handle,
          gender,
          interested_in,
        });
    }

    router.push("/my-badge");
  }

  return (
    <Card className="w-full max-w-md shadow-xl overflow-hidden animate-fade-in border-4 border-pink-500">
      <div className="love-bg p-8 text-white text-center relative overflow-hidden">
        {/* Floating hearts decoration */}
        <div className="absolute top-4 right-8 text-3xl heart-float opacity-60">💖</div>
        <div className="absolute top-12 left-6 text-2xl heart-float opacity-40" style={{ animationDelay: '0.5s' }}>💕</div>
        <div className="absolute bottom-6 right-12 text-2xl heart-float opacity-50" style={{ animationDelay: '1s' }}>❤️</div>
        <div className="absolute bottom-8 left-10 text-xl heart-float opacity-30" style={{ animationDelay: '1.5s' }}>💗</div>
        <div className="absolute top-1/2 right-4 text-xl heart-float opacity-35" style={{ animationDelay: '2s' }}>💓</div>

        <div className="relative z-10">
          <div className="text-6xl mb-3 heart-pulse">💕</div>
          <CardTitle className="text-3xl font-bold mb-2 drop-shadow-lg">Scan & Match</CardTitle>
          <CardDescription className="text-white/95 font-medium text-base">
            ESN Porto Speed Dating - Find your match!
          </CardDescription>
        </div>
      </div>

      <CardContent className="pt-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4 animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Maria Silva"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_handle">Instagram Handle</Label>
            <Input
              id="instagram_handle"
              name="instagram_handle"
              placeholder="@your_instagram"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interested_in">Interested In</Label>
            <select
              id="interested_in"
              name="interested_in"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select...</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full love-bg-dark hover:bg-red-700 text-white font-bold text-base h-12 shadow-md transition-all hover:shadow-lg hover:scale-105 border-2 border-red-900"
            disabled={loading}
          >
            {loading ? "Creating account..." : "💖 Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-600 font-bold hover:text-rose-600 transition-colors underline">
            ❤️ Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
