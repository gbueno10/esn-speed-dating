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
    <Card className="w-full max-w-md event-card border-none overflow-hidden animate-fade-in relative group my-8">
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      
      <div className="relative p-6 text-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 space-y-2">
          <div className="text-4xl mb-2 animate-bounce drop-shadow-[0_0_20px_rgba(255,0,127,0.6)]">✨</div>
          <CardTitle className="text-3xl font-black mb-1 glitch-hover" data-text="JOIN THE SYSTEM">
            JOIN THE SYSTEM
          </CardTitle>
          <CardDescription className="text-muted-foreground font-semibold tracking-wide uppercase text-xs">
            ESN Speed Dating
          </CardDescription>
        </div>
      </div>

      <CardContent className="pt-0 pb-8 px-8 relative z-10">
        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-white text-sm p-3 rounded-xl mb-6 animate-slide-up font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2">
                <Label htmlFor="name" className="auth-label">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. DATA USER 01"
                  className="event-input"
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="instagram_handle" className="auth-label">Instagram</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                    <Input
                      id="instagram_handle"
                      name="instagram_handle"
                      placeholder="username"
                      className="event-input pl-8"
                      required
                    />
                </div>
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="auth-label">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  className="flex h-10 w-full rounded-xl border border-input bg-muted/50 px-3 py-1 text-sm shadow-xs transition-colors text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                  required
                >
                  <option value="" className="bg-card">Select...</option>
                  <option value="male" className="bg-card">Male</option>
                  <option value="female" className="bg-card">Female</option>
                  <option value="non-binary" className="bg-card">Non-binary</option>
                  <option value="prefer-not-to-say" className="bg-card">N/A</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interested_in" className="auth-label">Looking For</Label>
                <select
                  id="interested_in"
                  name="interested_in"
                  className="flex h-10 w-full rounded-xl border border-input bg-muted/50 px-3 py-1 text-sm shadow-xs transition-colors text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                  required
                >
                  <option value="" className="bg-card">Select...</option>
                  <option value="men" className="bg-card">Men</option>
                  <option value="women" className="bg-card">Women</option>
                  <option value="everyone" className="bg-card">Everyone</option>
                </select>
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="auth-label">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              className="event-input"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="auth-label">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              className="event-input"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-black tracking-widest text-sm h-12 rounded-full shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)] hover:scale-[1.02] transition-all glitch-hover mt-2"
            disabled={loading}
          >
            {loading ? "INITIALIZING..." : "CREATE ID"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/50 mt-6 font-medium">
          Already registered?{" "}
          <Link href="/login" className="text-primary font-black hover:text-white transition-colors uppercase tracking-widest text-xs underline underline-offset-4">
            Access System
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
