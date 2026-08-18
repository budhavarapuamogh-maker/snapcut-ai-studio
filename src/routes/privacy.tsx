import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SnapCut AI" },
      {
        name: "description",
        content:
          "How SnapCut AI handles uploaded images, account data and payments, including 24-hour automatic deletion.",
      },
      { property: "og:title", content: "Privacy Policy — SnapCut AI" },
      {
        property: "og:description",
        content: "Data handling, retention and your rights when using SnapCut AI.",
      },
    ],
  }),
  component: Privacy,
});

const sections = [
  {
    h: "Images you upload",
    p: "Uploaded and processed images are held in temporary storage solely to deliver your result. All image files are deleted automatically within 24 hours and are never used to train models.",
  },
  {
    h: "Account data",
    p: "We store your email address, authentication identifiers, plan status and usage counters so we can operate your account and enforce quotas.",
  },
  {
    h: "Payments",
    p: "Payments are handled by our payment processor. We store transaction identifiers and plan state only; we never store card details.",
  },
  {
    h: "Logs and security",
    p: "We keep short-lived request logs for reliability, abuse prevention and audit purposes. Access is restricted and all traffic is encrypted in transit.",
  },
  {
    h: "Your rights",
    p: "You can request access to, correction of, or deletion of your account data at any time by contacting us.",
  },
];

function Privacy() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy policy"
      description="A short policy, because we hold very little data and delete images quickly."
    >
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
