import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminAccount = {
  id: string;
  email: string;
  createdAt: string;
  username: string;
  displayName: string;
  isAdmin: boolean;
};

/** Throws unless the caller holds the admin role (checked as the caller, under RLS). */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminAccount[]> => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);

    const ids = users.users.map((u) => u.id);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, username, display_name").in("id", ids),
      supabaseAdmin.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);

    const adminIds = new Set((roles ?? []).map((r) => r.user_id));
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

    return users.users.map((u) => ({
      id: u.id,
      email: u.email ?? "—",
      createdAt: u.created_at,
      username: byId.get(u.id)?.username ?? "",
      displayName: byId.get(u.id)?.display_name ?? "",
      isAdmin: adminIds.has(u.id),
    }));
  });

export const setAdminRole = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; makeAdmin: boolean }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context as any);
    if (data.userId === context.userId && !data.makeAdmin) {
      throw new Error("You cannot remove your own admin role.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.makeAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
