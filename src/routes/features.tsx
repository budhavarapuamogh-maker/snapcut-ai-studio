import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — SnapCut AI Background Removal" },
      {
        name: "description",
        content:
          "Hair-level matting, batch uploads, transparent PNG export, credit tracking and a REST API for developers.",
      },
      { property: "og:title", content: "Features — SnapCut AI Background Removal" },
      {
        property: "og:description",
        content: "Everything SnapCut AI does: fast matting, batch workflows and a developer API.",
      },
    ],
  }),
  component: Features,
});

const sections = [
  {
    title: "Cutout quality",
    items: [
      "Alpha matting tuned for hair, fur and fabric edges",
      "Preserves original resolution up to 5000×5000",
      "Transparent PNG output, plus flat-colour backdrops",
      "Automatic subject detection for people, products and vehicles",
    ],
  },
  {
    title: "Workspace",
    items: [
      "Drag-and-drop or browse uploads with instant validation",
      "Per-file progress bars and skeleton previews",
      "7-day upload history with one-click re-download",
      "Toast notifications and graceful retry on failed jobs",
    ],
  },
  {
    title: "Accounts & billing",
    items: [
      "Email/password and Google sign-in",
      "Free tier with 5 images per day",
      "Pro monthly for unlimited processing",
      "Top-up credit packs that never expire",
    ],
  },
  {
    title: "For developers",
    items: [
      "REST endpoint with API-key auth",
      "Per-key rate limiting and usage metering",
      "Webhook callbacks for async jobs",
      "Copy-paste examples in cURL, JS and Python",
    ],
  },
];

function Features() {
  return (
    <PageShell
      eyebrow="Features"
      title="Everything you need to cut backgrounds at scale"
      description="SnapCut AI is deliberately narrow: it removes backgrounds extremely well and gets out of your way."
    >
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="surface-glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
