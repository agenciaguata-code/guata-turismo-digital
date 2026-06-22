import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";

export const Route = createFileRoute("/api/public/setup-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.ADMIN_SETUP_TOKEN;
        if (!expected) return new Response("setup disabled", { status: 503 });

        let body: { email?: string; setup_token?: string; password?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "invalid json" }, { status: 400 });
        }

        const provided = body.setup_token ?? "";
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("forbidden", { status: 403 });
        }

        const email = (body.email ?? "").trim().toLowerCase();
        const password = body.password ?? "";
        if (!email || password.length < 12) {
          return Response.json({ error: "email or password missing/too short" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Look up existing user
        let userId: string | null = null;
        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (listErr) return Response.json({ error: listErr.message }, { status: 500 });
        const existing = list.users.find((u) => (u.email ?? "").toLowerCase() === email);

        if (existing) {
          userId = existing.id;
          const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: { ...(existing.user_metadata ?? {}), must_change_password: true },
          });
          if (updErr) return Response.json({ error: updErr.message }, { status: 500 });
        } else {
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: "Administrador", must_change_password: true },
          });
          if (createErr || !created.user) {
            return Response.json({ error: createErr?.message ?? "create failed" }, { status: 500 });
          }
          userId = created.user.id;
        }

        // Ensure profile exists and flag must_change_password
        await supabaseAdmin
          .from("profiles")
          .upsert({ id: userId, full_name: "Administrador", must_change_password: true });

        // Ensure admin role
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
        if (roleErr) return Response.json({ error: roleErr.message }, { status: 500 });

        return Response.json({ ok: true, user_id: userId, email });
      },
    },
  },
});
