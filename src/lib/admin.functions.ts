import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [users, jobs, succeeded, failed, payments] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }).eq("status", "succeeded"),
      supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabaseAdmin.from("payments").select("amount_cents").eq("status", "paid"),
    ]);

    const revenueCents = (payments.data ?? []).reduce(
      (sum: number, p: { amount_cents: number }) => sum + p.amount_cents,
      0,
    );

    const { data: recentUsers } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, credits, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: recentJobs } = await supabaseAdmin
      .from("jobs")
      .select("id, file_name, status, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      stats: {
        users: users.count ?? 0,
        jobs: jobs.count ?? 0,
        succeeded: succeeded.count ?? 0,
        failed: failed.count ?? 0,
        revenueCents,
      },
      recentUsers: recentUsers ?? [],
      recentJobs: recentJobs ?? [],
    };
  });

export const adminGrantCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), amount: z.number().int().min(-1000).max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: credits, error } = await supabaseAdmin.rpc("add_credits", {
      _user_id: data.userId,
      _amount: data.amount,
    });
    if (error) throw new Error("Could not update credits.");
    return { credits };
  });

export const isAdminUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });
