import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAdminOverview, adminGrantCredits, isAdminUser } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/lib/packs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — SnapCut AI" },
      { name: "description", content: "SnapCut AI admin overview: users, jobs, revenue and credit grants." },
      { property: "og:title", content: "Admin panel — SnapCut AI" },
      { property: "og:description", content: "Internal admin console for SnapCut AI operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Admin unavailable</h1>
      <p className="mt-2 text-muted-foreground">You may not have access to this page.</p>
    </div>
  ),
});

function AdminPage() {
  const queryClient = useQueryClient();
  const checkAdmin = useServerFn(isAdminUser);
  const fetchOverview = useServerFn(getAdminOverview);
  const grant = useServerFn(adminGrantCredits);

  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin({}) });
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview({}),
    enabled: admin.data?.isAdmin === true,
  });

  if (admin.isLoading) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">Checking access…</div>;
  }

  if (!admin.data?.isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Restricted</h1>
        <p className="mt-2 text-muted-foreground">This area is for SnapCut AI administrators only.</p>
        <Button variant="hero" className="mt-6" asChild>
          <Link to="/dashboard">Back to workspace</Link>
        </Button>
      </div>
    );
  }

  const stats = overview.data?.stats;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin panel</h1>
          <p className="mt-2 text-muted-foreground">Platform health, users and revenue at a glance.</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">Workspace</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Users", value: stats?.users ?? 0 },
          { label: "Jobs", value: stats?.jobs ?? 0 },
          { label: "Succeeded", value: stats?.succeeded ?? 0 },
          { label: "Failed", value: stats?.failed ?? 0 },
          { label: "Revenue", value: formatInr(stats?.revenueCents ?? 0) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border/60 bg-card/40 p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Recent users</h2>
      <div className="mt-4 space-y-3">
        {(overview.data?.recentUsers ?? []).map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
          >
            <div>
              <p className="font-medium">{u.display_name ?? u.email ?? u.id}</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{u.credits} credits</Badge>
              <Button
                size="sm"
                variant="neon"
                onClick={async () => {
                  await grant({ data: { userId: u.id, amount: 10 } });
                  queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
                  toast.success("Granted 10 credits.");
                }}
              >
                +10
              </Button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Recent jobs</h2>
      <div className="mt-4 space-y-3">
        {(overview.data?.recentJobs ?? []).map((j) => (
          <div
            key={j.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
          >
            <div>
              <p className="font-medium">{j.file_name ?? "Untitled"}</p>
              <p className="text-sm text-muted-foreground">{new Date(j.created_at).toLocaleString()}</p>
            </div>
            <Badge variant={j.status === "succeeded" ? "default" : "secondary"}>{j.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
