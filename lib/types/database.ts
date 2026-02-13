export type SpeedDatingProfile = {
  id: string;
  user_id: string | null;
  name: string;
  instagram_handle: string;
  avatar_url: string | null;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say" | null;
  interested_in: "men" | "women" | "everyone" | null;
  is_admin: boolean;
  created_at: string;
};

export type SpeedDatingConnection = {
  id: string;
  scanner_id: string;
  scanned_id: string;
  created_at: string;
};

export type SpeedDatingConnectionWithProfile = SpeedDatingConnection & {
  scanned: SpeedDatingProfile;
};

export type SpeedDatingLike = {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
};

export type SpeedDatingSettings = {
  id: number;
  is_voting_open: boolean;
  are_matches_revealed: boolean;
  updated_at: string;
};
