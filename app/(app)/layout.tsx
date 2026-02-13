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
      <div className="min-h-svh pb-20">
        <header className="border-b px-4 py-3">
          <h1 className="text-lg font-bold text-center">Scan & Match</h1>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">{children}</main>
      </div>
      <ScanFab />
      <Navbar />
    </AppSettingsProvider>
  );
}
