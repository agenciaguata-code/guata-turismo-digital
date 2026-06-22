import { createFileRoute } from "@tanstack/react-router";

const ADMIN_EMAIL = "guilhermearevalo27@gmail.com";

export const Route = createFileRoute("/api/public/setup-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { password?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "invalid json" }, { status: 400 });
        }
        const password = body.password ?? "";
        if (password.length < 12) {
          return Response.json({ error: "password too short" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Hard guard: this endpoint is inert once ANY admin exists, EXCEPT
        // when the existing admin matches ADMIN_EMAIL (idempotent re-seed).
        const { data: adminRows, error: adminErr } = await supabaseAdmin
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");
        if (adminErr) return Response.json({ error: adminErr.message }, { status: 500 });

        // Find existing user by email
        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (listErr) return Response.json({ error: listErr.message }, { status: 500 });
        const existing = list.users.find(
          (u) => (u.email ?? "").toLowerCase() === ADMIN_EMAIL,
        );

        const existingIsTargetAdmin =
          existing && adminRows?.some((r) => r.user_id === existing.id);

        if (adminRows && adminRows.length > 0 && !existingIsTargetAdmin) {
          return Response.json({ error: "admin already provisioned" }, { status: 409 });
        }

        let userId: string;
        if (existing) {
          userId = existing.id;
          const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: {
              ...(existing.user_metadata ?? {}),
              must_change_password: true,
            },
          });
          if (updErr) return Response.json({ error: updErr.message }, { status: 500 });
        } else {
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password,
            email_confirm: true,
            user_metadata: { full_name: "Administrador", must_change_password: true },
          });
          if (createErr || !created.user) {
            return Response.json({ error: createErr?.message ?? "create failed" }, { status: 500 });
          }
          userId = created.user.id;
        }

        await supabaseAdmin
          .from("profiles")
          .upsert({ id: userId, full_name: "Administrador", must_change_password: true });

        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
        if (roleErr) return Response.json({ error: roleErr.message }, { status: 500 });

        return Response.json({ ok: true, user_id: userId, email: ADMIN_EMAIL });
      },
    },
  },
});
