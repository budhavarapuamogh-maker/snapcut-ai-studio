import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, ShieldCheck, Layers, Code2, Clock, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-cutout.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SnapCut AI — AI Background Removal in Seconds" },
      {
        name: "description",
        content:
          "SnapCut AI removes image backgrounds in under 5 seconds with studio-grade edges. Free daily credits, Pro plans and a developer API.",
      },
      { property: "og:title", content: "SnapCut AI — AI Background Removal in Seconds" },
      {
        property: "og:description",
        content:
          "Studio-grade AI background removal. Upload, cut, download transparent PNGs in seconds.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Zap,
    title: "Sub-5s processing",
    body: "Every upload is routed through a tuned inference pipeline that returns transparent PNGs in seconds.",
  },
  {
    icon: Wand2,
    title: "Hair-level edges",
    body: "Fine detail matting keeps hair, fur and semi-transparent fabric intact — no halos, no jagged cutouts.",
  },
  {
    icon: Clock,
    title: "24-hour auto-delete",
    body: "Images live in temporary storage only. Everything is purged automatically after 24 hours.",
  },
  {
    icon: Layers,
    title: "Batch-ready workspace",
    body: "Drag a folder in, track progress per file, and download all results as a single archive.",
  },
  {
    icon: Code2,
    title: "Developer API",
    body: "One REST endpoint, API keys, per-key rate limits and usage tracking for B2B pipelines.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "HTTPS everywhere, encrypted secrets, signed webhooks and full audit logging on every job.",
  },
];

const steps = [
  { n: "01", title: "Upload", body: "Drop a JPG, PNG or WEBP up to 10 MB and 5000×5000." },
  { n: "02", title: "Cut", body: "Our AI isolates the subject and generates a clean alpha channel." },
  { n: "03", title: "Download", body: "Grab the transparent PNG instantly — or pull it via API." },
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="halo pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-secondary" />
              Smart cuts, better content.
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Remove any background <span className="text-gradient-brand">in one snap</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SnapCut AI turns product shots, portraits and marketplace photos into pixel-perfect
              transparent PNGs in under five seconds. Five free cuts a day, no editor required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">Upload an image — free</Link>
              </Button>

              <Button variant="neon" size="xl" asChild>
                <Link to="/api-docs">Read the API docs</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                ["<5s", "avg processing"],
                ["99.5%", "uptime target"],
                ["24h", "auto-delete"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-semibold text-gradient-brand">{value}</dt>
                  <dd className="text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface-glass rounded-3xl p-3">
            <img
              src={heroImage}
              alt="Before and after comparison of an AI background removal in the SnapCut workspace"
              width={1280}
              height={960}
              className="w-full rounded-2xl"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Built for volume, not fiddling</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="surface-glass rounded-2xl p-6">
              <f.icon className="size-5 text-secondary" aria-hidden />
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Three steps, zero learning curve</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="rounded-2xl border border-border p-6">
              <span className="text-sm font-semibold text-accent">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="surface-glass flex flex-col items-start gap-6 rounded-3xl p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ready to cut your first image?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free plan includes 5 images per day. Upgrade any time for unlimited processing.
            </p>
          </div>
          <Button variant="hero" size="xl" asChild>
            <Link to="/pricing">See plans</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
