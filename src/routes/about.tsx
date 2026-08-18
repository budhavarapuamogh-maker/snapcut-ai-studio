import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The team behind SnapCut AI" },
      {
        name: "description",
        content:
          "SnapCut AI builds focused image tooling for e-commerce sellers, marketers and developers who need clean cutouts fast.",
      },
      { property: "og:title", content: "About — The team behind SnapCut AI" },
      {
        property: "og:description",
        content: "Why we build one tool, extremely well: fast, private background removal.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell
      eyebrow="About"
      title="One tool, built extremely well"
      description="SnapCut AI exists because cutting backgrounds shouldn't require a photo editor, a subscription to a design suite, or ten minutes per image."
    >
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            h: "Focused",
            p: "We do background removal and nothing else. No editors, no feeds, no filler features.",
          },
          {
            h: "Private",
            p: "Images are stored temporarily and purged after 24 hours. We never train on your uploads.",
          },
          {
            h: "Practical",
            p: "Built for catalogue teams and developers who process hundreds of images per week.",
          },
        ].map((item) => (
          <article key={item.h} className="surface-glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">{item.h}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.p}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
