# 🔧 Mudanças no Código - Trocar Tabelas

## 📋 Substituições Globais

Em TODOS os arquivos abaixo, fazer estas substituições:

| Buscar | Substituir por |
|--------|----------------|
| `from("profiles")` | `from("speed_dating_profiles")` |
| `from("connections")` | `from("speed_dating_connections")` |
| `from("likes")` | `from("speed_dating_likes")` |
| `from("app_settings")` | `from("speed_dating_settings")` |
| `type Profile` | `type SpeedDatingProfile` |
| `Profile` (import/uso) | `SpeedDatingProfile` |

---

## 📁 Arquivo por Arquivo

### 1. `lib/types/database.ts`

**SUBSTITUIR TODO O CONTEÚDO por:**

```typescript
export type EventProfile = {
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

export type EventConnection = {
  id: string;
  scanner_id: string;
  scanned_id: string;
  created_at: string;
};

export type EventConnectionWithProfile = EventConnection & {
  scanned: EventProfile;
};

export type EventLike = {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
};

export type EventSettings = {
  id: number;
  is_voting_open: boolean;
  are_matches_revealed: boolean;
  updated_at: string;
};
```

---

### 2. `hooks/use-profile.ts`

**Linha ~9-11 - Mudar query:**
```typescript
// ANTES:
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

// DEPOIS:
const { data: profile } = await supabase
  .from("event_profiles")
  .select("*")
  .eq("user_id", userId)
  .single();
```

**Linha ~1-3 - Mudar import:**
```typescript
// ANTES:
import type { Profile } from "@/lib/types/database";

// DEPOIS:
import type { EventProfile } from "@/lib/types/database";
```

**Linha ~5-10 - Mudar tipo do state:**
```typescript
// ANTES:
const [profile, setProfile] = useState<Profile | null>(null);

// DEPOIS:
const [profile, setProfile] = useState<EventProfile | null>(null);
```

---

### 3. `hooks/use-connections.ts`

**Linha ~8 - Mudar tipo:**
```typescript
// ANTES:
export type ConnectionItem = {
  id: string;
  user: Profile;
  ...
};

// DEPOIS:
export type ConnectionItem = {
  id: string;
  user: EventProfile;
  ...
};
```

**Linha ~1 - Mudar import:**
```typescript
// ANTES:
import type { Profile } from "@/lib/types/database";

// DEPOIS:
import type { EventProfile } from "@/lib/types/database";
```

**Linha ~18-24 - Mudar queries:**
```typescript
// ANTES:
const { data: myConnections } = await supabase
  .from("connections")
  .select("id, scanned_id, scanned:profiles!connections_scanned_id_fkey(*)")
  .eq("scanner_id", userId);

const { data: myLikes } = await supabase
  .from("likes")
  .select("liked_id")
  .eq("liker_id", userId);

const { data: incomingLikes } = await supabase
  .from("likes")
  .select("liker_id")
  .eq("liked_id", userId);

// DEPOIS:
const { data: myConnections } = await supabase
  .from("event_connections")
  .select("id, scanned_id, scanned:event_profiles!event_connections_scanned_id_fkey(*)")
  .eq("scanner_id", profileId); // Nota: agora é profileId (id do event_profile)

const { data: myLikes } = await supabase
  .from("event_likes")
  .select("liked_id")
  .eq("liker_id", profileId);

const { data: incomingLikes } = await supabase
  .from("event_likes")
  .select("liker_id")
  .eq("liked_id", profileId);
```

**⚠️ IMPORTANTE:** Agora `useConnections` recebe `profileId` (id do event_profile) ao invés de `userId`

**Linha ~10-15 - Mudar assinatura da função:**
```typescript
// ANTES:
export function useConnections(userId: string | undefined) {

// DEPOIS:
export function useConnections(profileId: string | undefined) {
```

**Linha ~35-40 - Mudar conversão:**
```typescript
// ANTES:
const user = c.scanned as unknown as Profile;

// DEPOIS:
const user = c.scanned as unknown as EventProfile;
```

---

### 4. `components/app-settings-provider.tsx`

**Linha ~12-15 - Mudar channel subscription:**
```typescript
// ANTES:
const channel = supabase
  .channel("app_settings_changes")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "app_settings" },
    (payload) => {
      ...
    }
  )

// DEPOIS:
const channel = supabase
  .channel("event_settings_changes")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "event_settings" },
    (payload) => {
      ...
    }
  )
```

---

### 5. `components/qr-scanner-dialog.tsx`

**Linha ~30-35 - Mudar query de verificação:**
```typescript
// ANTES:
const { data: profile } = await supabase
  .from("profiles")
  .select("name")
  .eq("id", scannedId)
  .single();

// DEPOIS:
const { data: profile } = await supabase
  .from("event_profiles")
  .select("name")
  .eq("id", scannedId)
  .single();
```

**Linha ~40-45 - Mudar insert de connection:**
```typescript
// ANTES:
const { error: connError } = await supabase
  .from("connections")
  .insert({ scanner_id: currentUserId, scanned_id: scannedId });

// DEPOIS:
const { error: connError } = await supabase
  .from("event_connections")
  .insert({ scanner_id: currentProfileId, scanned_id: scannedId });
```

**⚠️ IMPORTANTE:** Componente recebe `currentProfileId` ao invés de `currentUserId`

---

### 6. `components/connection-grid.tsx`

**Linha ~25-30 - Mudar toggle like:**
```typescript
// ANTES:
if (iLikedThem) {
  await supabase.from("likes").delete().match({ liker_id: currentUserId, liked_id: user.id });
} else {
  await supabase.from("likes").insert({ liker_id: currentUserId, liked_id: user.id });
}

// DEPOIS:
if (iLikedThem) {
  await supabase.from("event_likes").delete().match({ liker_id: currentProfileId, liked_id: user.id });
} else {
  await supabase.from("event_likes").insert({ liker_id: currentProfileId, liked_id: user.id });
}
```

**⚠️ IMPORTANTE:** Props mudam de `currentUserId` para `currentProfileId`

---

### 7. `components/connection-card.tsx`

**Linha ~1 - Mudar import:**
```typescript
// ANTES:
import type { Profile } from "@/lib/types/database";

// DEPOIS:
import type { EventProfile } from "@/lib/types/database";
```

**Linha ~10 - Mudar tipo da prop:**
```typescript
// ANTES:
export function ConnectionCard({
  user,
  ...
}: {
  user: Profile;
  ...
}) {

// DEPOIS:
export function ConnectionCard({
  user,
  ...
}: {
  user: EventProfile;
  ...
}) {
```

---

### 8. `components/profile-badge.tsx`

**Linha ~1 - Mudar import:**
```typescript
// ANTES:
import type { Profile } from "@/lib/types/database";

// DEPOIS:
import type { EventProfile } from "@/lib/types/database";
```

**Linha ~8 - Mudar tipo da prop:**
```typescript
// ANTES:
export function ProfileBadge({ profile }: { profile: Profile }) {

// DEPOIS:
export function ProfileBadge({ profile }: { profile: EventProfile }) {
```

---

### 9. `app/(app)/layout.tsx`

**Linha ~12-16 - Mudar query:**
```typescript
// ANTES:
const { data: settings } = await supabase
  .from("app_settings")
  .select("is_voting_open, are_matches_revealed")
  .eq("id", 1)
  .single();

// DEPOIS:
const { data: settings } = await supabase
  .from("event_settings")
  .select("is_voting_open, are_matches_revealed")
  .eq("id", 1)
  .single();
```

---

### 10. `app/(app)/my-badge/page.tsx`

**Nenhuma mudança necessária** (usa hook `useProfile` que já foi atualizado)

---

### 11. `app/(app)/my-connections/page.tsx`

**Linha ~10 - Mudar chamada do hook:**
```typescript
// ANTES:
const { connections, loading, refetch } = useConnections(profile?.id);

// DEPOIS:
const { connections, loading, refetch } = useConnections(profile?.id); // profile.id já é do event_profile
```

**⚠️ Na verdade não muda! Mas agora `profile.id` é o id do event_profile, não do user**

---

### 12. `app/(auth)/signup/page.tsx`

**MUDANÇA GRANDE - Trocar lógica de signup:**

**Linha ~46-58 - Quick Join:**
```typescript
// ANTES:
const { error: signInError } = await supabase.auth.signInAnonymously({
  options: { data: { name, instagram_handle, gender } },
});

// Update profile
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  await supabase
    .from("profiles")
    .update({ name, instagram_handle, gender })
    .eq("id", user.id);
}

// DEPOIS:
const { error: signInError, data: authData } = await supabase.auth.signInAnonymously();

if (signInError) {
  setError(signInError.message);
  setLoading(false);
  return;
}

// Criar event_profile
const { error: profileError } = await supabase
  .from("event_profiles")
  .insert({
    user_id: authData.user?.id,
    name,
    instagram_handle,
    gender,
    interested_in, // novo campo!
  });

if (profileError) {
  setError(profileError.message);
  setLoading(false);
  return;
}
```

**Linha ~90-100 - Email Signup:**
```typescript
// ANTES:
const { error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name, instagram_handle, gender } },
});

// Update profile
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  await supabase
    .from("profiles")
    .update({ name, instagram_handle, gender })
    .eq("id", user.id);
}

// DEPOIS:
const { error: signUpError, data: authData } = await supabase.auth.signUp({
  email,
  password,
});

if (signUpError) {
  setError(signUpError.message);
  setLoading(false);
  return;
}

// Criar event_profile
const { error: profileError } = await supabase
  .from("event_profiles")
  .insert({
    user_id: authData.user?.id,
    name,
    instagram_handle,
    gender,
    interested_in, // novo campo!
  });

if (profileError) {
  setError(profileError.message);
  setLoading(false);
  return;
}
```

**Linha ~145-170 - Adicionar campo interested_in no form:**
```typescript
<div className="space-y-2">
  <Label htmlFor="interested_in">Interested in matching with</Label>
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
```

---

### 13. `app/admin/page.tsx`

**Linha ~20-25 - Fetch settings:**
```typescript
// ANTES:
const { data: settings } = await supabase
  .from("app_settings")
  .select("*")
  .eq("id", 1)
  .single();

// DEPOIS:
const { data: settings } = await supabase
  .from("event_settings")
  .select("*")
  .eq("id", 1)
  .single();
```

**Linha ~35-40 - Update settings:**
```typescript
// ANTES:
await supabase
  .from("app_settings")
  .update({ is_voting_open: value })
  .eq("id", 1);

await supabase
  .from("app_settings")
  .update({ are_matches_revealed: value })
  .eq("id", 1);

// DEPOIS:
await supabase
  .from("event_settings")
  .update({ is_voting_open: value })
  .eq("id", 1);

await supabase
  .from("event_settings")
  .update({ are_matches_revealed: value })
  .eq("id", 1);
```

---

### 14. `components/scan-fab.tsx`

**Linha ~18-20 - Passar profileId ao invés de userId:**
```typescript
// ANTES:
<QrScannerDialog
  open={open}
  onOpenChange={setOpen}
  currentUserId={profile.id} // Este era o user.id
/>

// DEPOIS:
<QrScannerDialog
  open={open}
  onOpenChange={setOpen}
  currentProfileId={profile.id} // Agora é o event_profile.id
/>
```

---

## ⚠️ Pontos de Atenção

### 1. `user_id` vs `profile.id`

Antes tínhamos:
- `auth.users.id` = `profiles.id` (mesmo valor)

Agora temos:
- `auth.users.id` = `event_profiles.user_id` (FK)
- `event_profiles.id` = novo UUID (PK)

**Em TODOS os lugares onde passamos IDs entre componentes:**
- Se antes passávamos `user.id`, agora passamos `profile.id` (do event_profile)
- `useConnections(profile.id)` - recebe event_profile.id
- `QrScannerDialog currentProfileId={profile.id}` - recebe event_profile.id

### 2. Hook `useProfile` busca diferente

```typescript
// ANTES: buscava por profiles.id = user.id
.eq("id", userId)

// DEPOIS: busca por event_profiles.user_id = user.id
.eq("user_id", userId)
```

### 3. Admin

Para tornar alguém admin:
```sql
UPDATE event_profiles SET is_admin = true WHERE user_id = 'auth-user-id';
```

---

## 📝 Resumo de Substituições

| Arquivo | Linhas | O que fazer |
|---------|--------|-------------|
| `lib/types/database.ts` | Tudo | Trocar tipos Profile → EventProfile |
| `hooks/use-profile.ts` | ~9-11 | Query event_profiles por user_id |
| `hooks/use-connections.ts` | ~18-50 | Queries event_* + profileId |
| `components/app-settings-provider.tsx` | ~12-20 | Channel event_settings |
| `components/qr-scanner-dialog.tsx` | ~30-45 | Queries + profileId prop |
| `components/connection-grid.tsx` | ~25-30 | event_likes + profileId prop |
| `components/connection-card.tsx` | ~1, ~10 | Tipo EventProfile |
| `components/profile-badge.tsx` | ~1, ~8 | Tipo EventProfile |
| `app/(app)/layout.tsx` | ~12-16 | Query event_settings |
| `app/(auth)/signup/page.tsx` | ~30-100 | INSERT event_profiles + interested_in |
| `app/admin/page.tsx` | ~20-40 | Queries event_settings |
| `components/scan-fab.tsx` | ~18-20 | Prop profileId |

---

Pronto! Agora tens um guia completo de **onde trocar o quê** 🎯
