import { createClient } from "@/lib/supabase/client";
import type { SpeedDatingProfile } from "@/lib/types/database";

export async function uploadAvatar(
  file: File,
  profile: SpeedDatingProfile
): Promise<SpeedDatingProfile> {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const filePath = `${profile.user_id}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { data: updatedData, error: updateError } = await supabase
    .from("speed_dating_profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", profile.id)
    .select()
    .single();

  if (updateError) throw updateError;

  return updatedData as SpeedDatingProfile;
}
