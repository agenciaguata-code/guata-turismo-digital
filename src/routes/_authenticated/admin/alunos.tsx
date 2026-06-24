import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Role = Database["public"]["Enums"]["app_role"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/alunos")({
  head: () => ({ meta: [{ title: "Admin · Alunos" }, { name: "robots", content: "noindex" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [rolesMap, setRolesMap] = useState<Record<string, Role[]>>({});
  const [q, setQ] = useState("");

  async function reload() {
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles(profs ?? []);
    const m: Record<string, Role[]> = {};
    (roles ?? []).forEach((r) => {
      m[r.user_id] = m[r.user_id] ?? [];
      m[r.user_id].push(r.role);
    });
    setRolesMap(m);
  }
  useEffect(() => {
    reload();
  }, []);

  async function toggleRole(userId: string, role: Role) {
    const has = rolesMap[userId]?.includes(role);
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) return toast.error(error.message);
      toast.success(`Papel ${role} removido`);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
      toast.success(`Papel ${role} concedido`);
    }
    reload();
  }

  const filtered = (profiles ?? []).filter((p) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return p.full_name.toLowerCase().includes(t) || p.id.includes(t);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Alunos & papéis</h1>
        <p className="text-sm text-muted-foreground">Promova ou rebaixe usuários a professor ou administrador.</p>
      </div>
      <div className="surface-card mb-4 p-3">
        <Input placeholder="Buscar por nome ou ID..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {profiles === null ? (
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Papéis</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const userRoles = rolesMap[p.id] ?? [];
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.full_name || "(sem nome)"}</div>
                      <div className="text-xs text-muted-foreground">{p.city ?? "—"} · {p.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {userRoles.length === 0 ? (
                          <Badge variant="outline">aluno</Badge>
                        ) : (
                          userRoles.map((r) => (
                            <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="capitalize">
                              {r}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => toggleRole(p.id, "professor")}>
                          <GraduationCap className="mr-1 h-3.5 w-3.5" />
                          {userRoles.includes("professor") ? "Remover professor" : "Tornar professor"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleRole(p.id, "admin")}>
                          <Shield className="mr-1 h-3.5 w-3.5" />
                          {userRoles.includes("admin") ? "Remover admin" : "Tornar admin"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
