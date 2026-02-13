# 📋 Mudanças Necessárias no Supabase

## 🎯 Objetivo
Criar tabelas **NOVAS** específicas para o evento Speed Dating, **SEM mexer** nas tabelas existentes do projeto.

---

## 1️⃣ Executar Migration no Supabase SQL Editor

Copie e execute o conteúdo de `supabase/migrations/002_event_tables.sql`

### Tabelas que serão criadas:

| Tabela | Descrição |
|--------|-----------|
| `speed_dating_profiles` | Perfis dos participantes do evento (independente de `profiles`) |
| `speed_dating_connections` | Quem escaneou quem durante o evento |
| `speed_dating_likes` | Quem deu like em quem na votação |
| `speed_dating_settings` | Controles do admin (voting aberto/fechado, matches revelados) |

---

## 2️⃣ Mudanças no Código

### Arquivos que precisam ser ALTERADOS:

#### 📁 `lib/types/database.ts`
**Trocar:**
```typescript
export type Profile = {
  // ... campos antigos
}
```

**Por:**
```typescript
export type SpeedDatingProfile = {
  id: string;
  user_id: string | null;  // Link opcional com auth.users
  name: string;
  instagram_handle: string;
  avatar_url: string | null;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say" | null;
  interested_in: "men" | "women" | "everyone" | null;
  created_at: string;
}
```

#### 📁 Queries do Supabase

**Substituir em TODOS os arquivos:**

| Antiga | Nova |
|--------|------|
| `.from("profiles")` | `.from("speed_dating_profiles")` |
| `.from("connections")` | `.from("speed_dating_connections")` |
| `.from("likes")` | `.from("speed_dating_likes")` |
| `.from("app_settings")` | `.from("speed_dating_settings")` |

#### 📁 Arquivos afetados (lista completa):

1. `hooks/use-profile.ts` - Query de profile
2. `hooks/use-connections.ts` - Queries de connections e likes
3. `components/app-settings-provider.tsx` - Realtime subscription
4. `components/qr-scanner-dialog.tsx` - Insert connection
5. `components/connection-grid.tsx` - Toggle like
6. `app/(app)/layout.tsx` - Fetch settings
7. `app/(app)/my-badge/page.tsx` - Fetch profile
8. `app/(auth)/signup/page.tsx` - Insert profile após signup
9. `app/admin/page.tsx` - Update settings

---

## 3️⃣ Lógica de Signup/Auth

### Como vai funcionar:

**Opção 1: Anonymous Auth (Quick Join)**
```typescript
1. Usuário faz signInAnonymously() → cria user no auth.users
2. Pegamos o user.id
3. Criamos registro em event_profiles com user_id = user.id
```

**Opção 2: Email Auth**
```typescript
1. Usuário faz signUp(email, password) → cria user no auth.users
2. Pegamos o user.id
3. Criamos registro em event_profiles com user_id = user.id
```

**Na prática:**
- `event_profiles` tem coluna `user_id` que referencia `auth.users(id)`
- Mas não usamos a tabela `profiles` antiga
- Tudo fica isolado nas tabelas `event_*`

---

## 4️⃣ RLS (Row Level Security)

A migration já cria as políticas:

- ✅ Users podem ver todos os `event_profiles`
- ✅ Users podem criar/ver suas próprias `event_connections`
- ✅ Users podem dar like quando `event_settings.is_voting_open = true`
- ✅ Users veem likes recebidos quando `event_settings.are_matches_revealed = true`
- ✅ Apenas admins atualizam `event_settings`

**Nota:** Como não usamos a tabela `profiles` antiga, precisamos identificar admins de outra forma.

### Opção A: Usar email hardcoded
```sql
-- Na policy de admin:
auth.email() IN ('admin@esn.pt', 'outro@admin.pt')
```

### Opção B: Criar campo `is_admin` em `event_profiles`
```sql
-- Depois da migration, fazer:
UPDATE event_profiles SET is_admin = true WHERE id = 'id-do-admin';
```

---

## 5️⃣ Realtime

A migration já habilita realtime em `event_settings`:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE event_settings;
```

---

## 📝 Checklist de Implementação

- [ ] Executar `supabase/migrations/002_event_tables.sql` no Supabase
- [ ] Atualizar `lib/types/database.ts` com novos tipos
- [ ] Substituir queries `.from("profiles")` → `.from("event_profiles")` em todos os hooks/componentes
- [ ] Substituir queries `.from("connections")` → `.from("event_connections")`
- [ ] Substituir queries `.from("likes")` → `.from("event_likes")`
- [ ] Substituir queries `.from("app_settings")` → `.from("event_settings")`
- [ ] Ajustar signup para criar `event_profiles` ao invés de update `profiles`
- [ ] Testar auth flow completo
- [ ] Definir e criar primeiro admin manualmente

---

## ⚠️ Importante

**NÃO MEXEMOS EM:**
- ❌ Tabela `profiles` existente
- ❌ Qualquer outra tabela do projeto original
- ❌ Triggers ou functions existentes

**CRIAMOS DO ZERO:**
- ✅ `event_profiles`
- ✅ `event_connections`
- ✅ `event_likes`
- ✅ `event_settings`

Tudo isolado, tudo novo! 🎉
