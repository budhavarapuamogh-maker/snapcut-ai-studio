import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "API Docs — SnapCut AI Background Removal API" },
      {
        name: "description",
        content:
          "REST API reference for SnapCut AI: authentication, the remove-background endpoint, rate limits and error codes.",
      },
      { property: "og:title", content: "API Docs — SnapCut AI Background Removal API" },
      {
        property: "og:description",
        content: "Authenticate with an API key and remove backgrounds with a single POST request.",
      },
    ],
  }),
  component: ApiDocs,
});

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <figure className="mt-4">
      <figcaption className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </figcaption>
      <pre className="overflow-x-auto rounded-xl border border-border bg-card/60 p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

const curl = `curl -X POST https://api.snapcut.ai/v1/remove-background \\
  -H "Authorization: Bearer $SNAPCUT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "image_url": "https://example.com/photo.jpg", "format": "png" }'`;

const response = `{
  "id": "job_8f21c0",
  "status": "succeeded",
  "output_url": "https://cdn.snapcut.ai/tmp/8f21c0.png",
  "expires_at": "2026-08-19T14:00:00Z",
  "credits_used": 1
}`;

const js = `const res = await fetch("https://api.snapcut.ai/v1/remove-background", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.SNAPCUT_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ image_url: imageUrl, format: "png" }),
});

const { output_url } = await res.json();`;

const limits = [
  ["Max file size", "10 MB"],
  ["Max resolution", "5000 × 5000"],
  ["Accepted formats", "JPG, PNG, WEBP"],
  ["Rate limit (Pro)", "60 requests / minute"],
  ["Output retention", "24 hours"],
];

const errors = [
  ["400", "invalid_image", "Unsupported format, corrupt file, or resolution above the limit."],
  ["401", "invalid_api_key", "Missing or revoked API key."],
  ["402", "insufficient_credits", "Plan quota exhausted; purchase credits or upgrade."],
  ["429", "rate_limited", "Too many requests. Retry after the Retry-After header."],
  ["503", "processing_failed", "Upstream inference failure. Safe to retry with backoff."],
];

function ApiDocs() {
  return (
    <PageShell
      eyebrow="API"
      title="SnapCut AI REST API"
      description="One endpoint, key-based auth and JSON responses. Built for pipelines that need transparent cutouts at volume."
    >
      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-semibold">Authentication</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an API key from your dashboard and send it as a bearer token. Keys are scoped per
          project, individually rate limited and revocable at any time. Never expose a key in
          client-side code.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Remove background</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <code className="rounded bg-card px-1.5 py-0.5 text-xs">
            POST /v1/remove-background
          </code>{" "}
          accepts a publicly reachable image URL and returns a temporary transparent PNG URL.
        </p>
        <CodeBlock label="cURL" code={curl} />
        <CodeBlock label="Response" code={response} />
        <CodeBlock label="JavaScript" code={js} />

        <h2 className="mt-10 text-xl font-semibold">Limits</h2>
        <dl className="mt-4 divide-y divide-border rounded-xl border border-border">
          {limits.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 text-xl font-semibold">Errors</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Code
                </th>
                <th scope="col" className="px-4 py-3">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {errors.map(([status, code, meaning]) => (
                <tr key={code}>
                  <td className="px-4 py-3">{status}</td>
                  <td className="px-4 py-3 text-secondary">{code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
