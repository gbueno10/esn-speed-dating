import { createClient } from "@/lib/supabase/server";
import { AppSettingsProvider } from "@/components/app-settings-provider";
import { Navbar } from "@/components/navbar";
import { ScanFab } from "@/components/scan-fab";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("speed_dating_settings")
    .select("is_voting_open, are_matches_revealed")
    .eq("id", 1)
    .single();

  return (
    <AppSettingsProvider
      initialSettings={
        settings ?? { is_voting_open: false, are_matches_revealed: false }
      }
    >
      <div className="min-h-svh pb-20 relative overflow-hidden bg-background">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-screen filter blur-[80px] animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-4000" />
        </div>

        {/* Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] bg-noise" />

        <div className="relative z-10">
          <header className="border-b border-border/40 backdrop-blur-md sticky top-0 px-4 py-3 bg-background/60">
            <h1 className="text-xl font-black text-center tracking-tighter uppercase italic">
              Speed Dating <span className="text-primary">ESN</span>
            </h1>
          </header>
          <main className="max-w-md mx-auto px-4 py-6">{children}</main>
        </div>
      </div>
      <ScanFab />
      <Navbar />
    </AppSettingsProvider>
  );
}
