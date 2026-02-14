"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SpeedDatingProfile } from "@/lib/types/database";
import { Plus, Loader2, Pencil } from "lucide-react";
import { uploadAvatar } from "@/lib/upload-avatar";
import { toast } from "sonner";

interface ProfileBadgeProps {
  profile: SpeedDatingProfile;
  editable?: boolean;
  onProfileUpdate?: (updatedProfile: SpeedDatingProfile) => void;
  onEditClick?: () => void;
}

export function ProfileBadge({ profile, editable = false, onProfileUpdate, onEditClick }: ProfileBadgeProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (profile.name ?? "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    try {
      setUploading(true);
      const updatedProfile = await uploadAvatar(event.target.files[0], profile);
      toast.success("Foto de perfil atualizada!");
      onProfileUpdate?.(updatedProfile);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erro ao subir imagem: " + (error.message || "Tente novamente"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-4 animate-in fade-in zoom-in-95 duration-500 px-4">
      <Card className="relative glass-panel border-2 border-primary/50 flex flex-col items-center p-8 holographic-effect overflow-hidden rounded-[2.5rem] shadow-2xl">
        {/* Decorative Corner Decor */}
        <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-secondary/40 rounded-br-2xl" />

        {/* Edit Button */}
        {editable && onEditClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-primary/50 p-2.5 rounded-full transition-all hover:scale-110 group"
          >
            <Pencil className="w-4 h-4 text-white/70 group-hover:text-primary transition-colors" />
          </button>
        )}

        <div className="flex flex-col items-center w-full">
          <div 
            className={cn(
              "relative mb-6",
              editable && "cursor-pointer group"
            )}
            onClick={() => editable && !uploading && fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
            
            <Avatar className={cn(
              "h-32 w-32 border-4 border-white relative z-10 shadow-xl transition-all duration-300",
              editable && "group-hover:scale-105 group-hover:border-primary/50"
            )}>
              <AvatarImage src={profile.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white font-black">
                {initials}
              </AvatarFallback>
              
              {uploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </Avatar>

            {editable && (
              <>
                {/* Touch ME Highlight Button */}
                <div className="absolute -bottom-1 -right-1 z-30 transition-transform duration-300 group-hover:scale-110">
                  <div className="relative">
                    {/* Ping/Glow Animation */}
                    <div className="absolute inset-0 bg-primary animate-ping rounded-full opacity-40 whitespace-pre text-center" />
                    <div className="absolute -inset-2 bg-primary/50 blur-xl animate-pulse rounded-full" />
                    
                    <div className="relative bg-primary text-white p-2.5 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,0,127,1)] flex items-center justify-center">
                      <Plus className="w-5 h-5 stroke-[4px]" />
                    </div>
                  </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  accept="image/*"
                  className="hidden"
                />
              </>
            )}
          </div>
          
          <h2 className="text-3xl font-black mb-1 tracking-tighter text-white drop-shadow-lg text-center leading-tight">
            {profile.name}
          </h2>
          
          <div className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">ESN Speed Dating</p>
          </div>

          <div className="relative p-4 bg-white rounded-[2rem] shadow-[0_0_30px_rgba(255,0,127,0.2)] group transition-transform duration-500 hover:scale-105">
            <QRCodeSVG
              value={profile.id}
              size={180}
              level="M"
              includeMargin={false}
              fgColor="#240046" 
              bgColor="#ffffff"
            />
          </div>
          
          <p className="text-white/60 font-bold mt-6 text-center text-[10px] uppercase tracking-widest leading-relaxed max-w-[200px]">
            Show this to <span className="text-primary">connect</span>
          </p>
        </div>
      </Card>
      
      {editable && !profile.avatar_url && (
        <p className="text-center mt-6 text-[10px] font-black text-primary animate-bounce uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,0,127,0.5)]">
          ✨ Toca no + para adicionar foto! ✨
        </p>
      )}
    </div>
  );
}
