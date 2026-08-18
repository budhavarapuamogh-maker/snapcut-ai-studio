import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SnapCut AI Plans and Credit Packs" },
      {
        name: "description",
        content:
          "Start free with 5 images a day, go unlimited on Pro Monthly, or buy credit packs that never expire.",
      },
      { property: "og:title", content: "Pricing — SnapCut AI Plans and Credit Packs" },
      {
        property: "og:description",
        content: "Free, Pro Monthly and credit packs for AI background removal.",
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Free",
    price: "₹0",
    cadence: "forever",
    highlight: false,
    features: ["5 images per day", "Transparent PNG export", "7-day history", "Community support"],
  },
  {
    name: "Pro Monthly",
    price: "₹799",
    cadence: "per month",
    highlight: true,
    features: [
      "Unlimited image processing",
      "Priority processing queue",
      "Batch uploads",
      "API access with 10k calls/month",
      "Email support",
    ],
  },
  {
    name: "Credit Pack",
    price: "₹499",
    cadence: "500 credits",
    highlight: false,
    features: [
      "Credits never expire",
      "Stackable with any plan",
      "1 credit = 1 processed image",
      "Usable through API or workspace",
    ],
  },
];

function Pricing() {
  return (
    <PageShell
      eyebrow="Pricing"
      title="Simple plans, no surprise overages"
      description="Every plan includes the same cutout quality. You only pay for volume."
    >
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-2xl p-7 ${
              plan.highlight
                ? "surface-glass shadow-[var(--shadow-glow)]"
                : "border border-border bg-card/40"
            }`}
          >
            {plan.highlight ? (
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                Most popular
              </span>
            ) : null}
            <h2 className="mt-2 text-lg font-semibold">{plan.name}</h2>
            <p className="mt-4 text-4xl font-bold tracking-tight">{plan.price}</p>
            <p className="text-sm text-muted-foreground">{plan.cadence}</p>
            <ul className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlight ? "hero" : "neon"}
              className="mt-7 w-full"
              size="lg"
              asChild
            >
              <Link to="/contact">
                {plan.name === "Free" ? "Get started" : `Choose ${plan.name}`}
              </Link>
            </Button>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Prices exclude applicable taxes. Payments are processed securely; uploaded and processed
        images are deleted automatically after 24 hours.
      </p>
    </PageShell>
  );
}
