import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/site";
import { listAccounts, setAdminRole } from "@/lib/roles.functions";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — Pugclicks Admin" },
      { name: "description", content: "Manage Pugclicks reader accounts and admin roles." },
      { property: "og:title", content: "Users — Pugclicks Admin" },
      { property: "og:description", content: "Reader accounts and roles." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const fetchAccounts = useServerFn(listAccounts);
  const updateRole = useServerFn(setAdminRole);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["admin", "accounts"],
    enabled: Boolean(user && isAdmin),
    queryFn: () => fetchAccounts(),
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; makeAdmin: boolean }) => updateRole({ data: vars }),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="mt-8">
      <h2 className="text-2xl">Accounts</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Readers can follow, like and comment. Only admins can publish articles.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading accounts…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-4">Account</th>
                <th className="p-4">Username</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t border-border align-top">
                  <td className="p-4 font-semibold">{account.email}</td>
                  <td className="p-4 text-muted-foreground">
                    {account.username ? `@${account.username}` : "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(account.createdAt)}</td>
                  <td className="p-4">
                    <span
                      className={
                        account.isAdmin
                          ? "rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground"
                          : "rounded-full bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground"
                      }
                    >
                      {account.isAdmin ? "admin" : "reader"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant={account.isAdmin ? "secondary" : "default"}
                      disabled={roleMutation.isPending || account.id === user?.id}
                      onClick={() =>
                        roleMutation.mutate({ userId: account.id, makeAdmin: !account.isAdmin })
                      }
                    >
                      {account.isAdmin ? "Remove admin" : "Make admin"}
                    </Button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr className="border-t border-border">
                  <td className="p-4 text-muted-foreground" colSpan={5}>
                    No accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
