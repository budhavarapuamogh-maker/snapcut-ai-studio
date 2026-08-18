import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SnapCut AI" },
      {
        name: "description",
        content:
          "The terms covering SnapCut AI accounts, acceptable use, plans, credits and service availability.",
      },
      { property: "og:title", content: "Terms of Service — SnapCut AI" },
      {
        property: "og:description",
        content: "Account, billing and acceptable-use terms for SnapCut AI.",
      },
    ],
  }),
  component: Terms,
});

const sections = [
  {
    h: "Accounts",
    p: "You are responsible for activity under your account and for keeping API keys confidential. One person or organisation per account.",
  },
  {
    h: "Acceptable use",
    p: "Do not upload content you lack rights to, illegal material, or content designed to harass or deceive. Automated abuse and quota circumvention will result in suspension.",
  },
  {
    h: "Plans and credits",
    p: "Free accounts are limited to 5 images per day. Paid plans renew until cancelled. Credit packs do not expire but are non-refundable once consumed.",
  },
  {
    h: "Availability",
    p: "We target 99.5% monthly uptime. Processing is provided on a best-effort basis and may be rate limited during exceptional load.",
  },
  {
    h: "Liability",
    p: "The service is provided as is. Our aggregate liability is limited to the amount you paid in the preceding three months.",
  },
];

function Terms() {
  return (
    <PageShell eyebrow="Legal" title="Terms of service">
      <div className="mt-12 max-w-3xl space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
