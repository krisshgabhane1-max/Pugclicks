# Admin panel reference

## Routes

| Path | File | Purpose |
| --- | --- | --- |
| `/admin` | `src/routes/admin.tsx` | Layout: auth + admin gate, tab nav, `<Outlet />` |
| `/admin` (index) | `src/routes/admin.index.tsx` | Article editor + list (posts) |
| `/admin/users` | `src/routes/admin.users.tsx` | Accounts and roles |
| `/admin/comments` | `src/routes/admin.comments.tsx` | Comment moderation |

The gate lives in the layout: `useAuth()` returns `{ session, user, isAdmin,
loading }`. Unauthenticated users get a sign-in prompt; signed-in
non-admins get the "claim admin" screen (only works while no admin exists,
enforced server-side in `src/lib/admin.functions.ts`).

## Tables

- `articles` — `slug, title, seo_title, category, excerpt, body, author,
  cover_image, image_alt, status ('draft' | 'published'), published_at,
  author_id`
- `profiles` — `id (= auth user id), username, display_name, bio, avatar_url`
- `user_roles` — `user_id, role` (`app_role` enum: admin/moderator/user)
- `comments`, `article_likes`, `follows`, `notifications`

Role checks in RLS use `private.has_role(uid, role)`. Do not recreate a
public `has_role` function.

## Patterns

- Reads/writes from admin screens go through the browser Supabase client
  (`@/integrations/supabase/client`) and rely on RLS — no service-role in the
  client bundle.
- Privileged actions that RLS cannot express (granting a role, reading
  auth-only data) go in a `*.functions.ts` server fn with
  `.middleware([requireSupabaseAuth])`, and MUST re-verify the caller is an
  admin via `context.supabase` before importing `client.server`.
- Mutations use TanStack Query `useMutation` + `toast` + invalidate
  `["admin", ...]` and `["articles"]`.
- Publishing sets `published_at = now()`; unpublishing sets it to `null`.
