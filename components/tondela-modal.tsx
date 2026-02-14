"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Scan, Heart, Users, Star, MessageCircle } from "lucide-react";

interface TondelaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIPS = [
  {
    icon: Scan,
    title: "Scan & Connect",
    description: "Scan someone's QR code to add them as a connection.",
  },
  {
    icon: Heart,
    title: "Send Likes",
    description: "When voting opens, like the people you enjoyed meeting!",
  },
  {
    icon: Users,
    title: "It's a Match!",
    description: "If you both like each other, you'll see a match and can find each other on Instagram.",
  },
  {
    icon: MessageCircle,
    title: "Be Yourself",
    description: "Don't be shy! Ask questions, share stories, and have fun.",
  },
  {
    icon: Star,
    title: "Have Fun!",
    description: "This is all about meeting new people. Enjoy the experience!",
  },
];

export function TondelaModal({ open, onOpenChange }: TondelaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="bg-card border-primary/30 rounded-2xl w-[85vw] max-w-[400px] sm:max-w-[400px] mx-auto shadow-[0_0_30px_rgba(255,0,127,0.2)] p-0 gap-0 overflow-hidden max-h-[85vh]"
      >
        <div className="overflow-y-auto max-h-[85vh]">
          {/* Tondela Header - compact */}
          <div className="relative w-full h-40 overflow-hidden shrink-0">
            <img
              src="/tondela.png"
              alt="Tondela"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h2 className="text-lg font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Tondela
              </h2>
              <span className="text-[10px] font-semibold text-white/80 tracking-wide">
                ESN Porto Mascot
              </span>
            </div>
          </div>

          {/* Tips Section */}
          <div className="px-3 pb-4 pt-2 space-y-2.5">
            <h3 className="text-[10px] font-black text-secondary uppercase tracking-widest text-center">
              How it works
            </h3>

            <div className="space-y-2">
              {TIPS.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={tip.title}
                    className="flex items-start gap-2.5 bg-white/5 rounded-lg p-2.5 border border-white/10"
                  >
                    <div className="bg-primary/20 p-1.5 rounded-md shrink-0">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {tip.title}
                      </div>
                      <div className="text-[9px] text-white/60 leading-snug mt-0.5">
                        {tip.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[9px] text-center text-white/40">
              Good luck and have an amazing night!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
