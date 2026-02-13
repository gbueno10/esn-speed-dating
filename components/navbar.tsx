"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { QrCode, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signup");
  }

  const links = [
    { href: "/my-badge", label: "My Badge", icon: QrCode },
    { href: "/my-connections", label: "Connections", icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-4 pb-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                active
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-white hover:scale-105"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-all",
                active ? "bg-primary/20" : "bg-transparent"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase">{link.label}</span>
            </Link>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-auto py-1"
        >
          <div className="p-2 rounded-full">
            <LogOut className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase">Logout</span>
        </Button>
      </div>
    </nav>
  );
}
