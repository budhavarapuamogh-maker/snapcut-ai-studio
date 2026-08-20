import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { createCheckoutOrder, listPayments } from "@/lib/billing.functions";
import { getAccount } from "@/lib/cutout.functions";
import { CREDIT_PACKS, formatInr } from "@/lib/packs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Billing & credits — SnapCut AI" },
      { name: "description", content: "Buy SnapCut AI credit packs, review invoices and track your remaining cutout credits." },
      { property: "og:title", content: "Billing & credits — SnapCut AI" },
      { property: "og:description", content: "Top up credits for AI background removal and view your payment history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BillingPage,
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Billing unavailable</h1>
      <p className="mt-2 text-muted-foreground">Please refresh and try again.</p>
    </div>
  ),
});

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function BillingPage() {
  const checkout = useServerFn(createCheckoutOrder);
  const fetchPayments = useServerFn(listPayments);
  const fetchAccount = useServerFn(getAccount);
  const [busy, setBusy] = useState<string | null>(null);

  const account = useQuery({ queryKey: ["account"], queryFn: () => fetchAccount({}) });
  const payments = useQuery({ queryKey: ["payments"], queryFn: () => fetchPayments({}) });

  async function buy(packId: string) {
    setBusy(packId);
    try {
      const res = await checkout({ data: { packId } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        toast.error("Could not load the payment window.");
        return;
      }
      const rzp = new window.Razorpay({
        key: res.keyId,
        amount: res.amount,
        currency: "INR",
        name: "SnapCut AI",
        description: `${res.credits} cutout credits`,
        order_id: res.orderId,
        theme: { color: "#0EA5FF" },
        handler: () => toast.success("Payment received. Credits appear within a few seconds."),
      });
      rzp.open();
    } catch {
      toast.error("Checkout failed. Please retry.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & credits</h1>
          <p className="mt-2 text-muted-foreground">One credit removes one background. Credits never expire.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{account.data?.credits ?? 0} credits</Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">Workspace</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <div key={pack.id} className="rounded-xl border border-border/60 bg-card/40 p-6">
            <p className="text-sm uppercase tracking-widest text-secondary">{pack.name}</p>
            <p className="mt-3 text-3xl font-bold">{formatInr(pack.amountCents)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pack.credits} credits · {pack.blurb}</p>
            <Button
              variant="hero"
              className="mt-5 w-full"
              disabled={busy === pack.id}
              onClick={() => buy(pack.id)}
            >
              {busy === pack.id ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Buy credits
            </Button>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Payment history</h2>
      <div className="mt-4 space-y-3">
        {(payments.data ?? []).map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
          >
            <div>
              <p className="font-medium">{formatInr(p.amount_cents)} · {p.credits} credits</p>
              <p className="text-sm text-muted-foreground">
                {new Date(p.created_at).toLocaleString()} · {p.order_id}
              </p>
            </div>
            <Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.status}</Badge>
          </div>
        ))}
        {payments.data && payments.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : null}
      </div>
    </div>
  );
}
