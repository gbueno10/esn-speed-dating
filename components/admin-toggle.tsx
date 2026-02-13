"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AdminToggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl transition-all ${checked ? 'bg-primary/10 border-primary/30 border' : 'bg-muted/30 border border-transparent'}`}>
      <div className="space-y-1">
        <Label className={`text-base font-black tracking-wide ${checked ? 'text-primary' : 'text-white'}`}>{label}</Label>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
