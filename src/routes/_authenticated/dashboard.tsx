import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, ImageUp, Loader2, LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { removeBackground, listJobs, getAccount } from "@/lib/cutout.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Workspace — SnapCut AI Background Remover" },
      {
        name: "description",
        content:
          "Upload an image and let SnapCut AI cut the background in seconds. Track credits and download transparent PNGs.",
      },
      { property: "og:title", content: "Workspace — SnapCut AI Background Remover" },
      {
        property: "og:description",
        content: "Your SnapCut AI workspace for AI cutouts, credits and job history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Workspace unavailable</h1>
      <p className="mt-2 text-muted-foreground">Please refresh the page and try again.</p>
    </div>
  ),
});

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function downloadImage(url: string, name: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch {
      toast.error("Download failed. Try opening the image instead.");
    }
  }

  const process = useServerFn(removeBackground);
  const fetchJobs = useServerFn(listJobs);
  const fetchAccount = useServerFn(getAccount);

  const account = useQuery({ queryKey: ["account"], queryFn: () => fetchAccount({}) });
  const jobs = useQuery({ queryKey: ["jobs"], queryFn: () => fetchJobs({}) });

  async function handleFile(file: File) {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    setPreview(dataUrl);
    setResult(null);
    setBusy(true);
    try {
      const response = await process({
        data: {
          fileName: file.name,
          mimeType: file.type,
          dataBase64: dataUrl.split(",")[1] ?? "",
        },
      });
      if (!response.ok) {
        toast.error(response.error);
      } else {
        setResult(response.resultUrl);
        toast.success("Background removed.");
      }
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    } catch {
      toast.error("Processing failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth" });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {account.data?.display_name ? `Hey, ${account.data.display_name}` : "Your cutouts"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1.5 text-sm">
            <Sparkles className="mr-1.5 size-3.5" />
            {account.data?.credits ?? 0} credits
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/billing">Billing</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/api-keys">API keys</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">Admin</Link>
          </Button>

          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-1.5 size-4" /> Sign out
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold">Upload an image</h2>
          <p className="mt-1 text-sm text-muted-foreground">PNG, JPG or WebP · up to 10 MB · 1 credit per cutout</p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-5 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center transition-colors hover:border-primary disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <ImageUp className="size-8 text-primary" />
            )}
            <span className="mt-3 text-sm font-medium">
              {busy ? "Cutting background…" : "Click to choose an image"}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleFile(file);
            }}
          />

          {preview ? (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Original</p>
              <img
                src={preview}
                alt="Original upload preview"
                className="mt-2 max-h-64 w-full rounded-lg object-contain"
              />
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold">Result</h2>
          <p className="mt-1 text-sm text-muted-foreground">Transparent PNG, ready to download.</p>
          <div
            className="mt-5 flex min-h-64 items-center justify-center rounded-xl border border-border/60 p-4"
            style={{
              backgroundImage:
                "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
            }}
          >
            {result ? (
              <img src={result} alt="Background removed result" className="max-h-64 object-contain" />
            ) : (
              <p className="text-sm text-muted-foreground">Your cutout appears here.</p>
            )}
          </div>
          {result ? (
            <Button variant="hero" className="mt-5 w-full" asChild>
              <a href={result} download="snapcut-cutout.png" target="_blank" rel="noreferrer">
                <Download className="mr-1.5 size-4" /> Download PNG
              </a>
            </Button>
          ) : null}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recent jobs</h2>
        <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
          {(jobs.data ?? []).length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No jobs yet — upload your first image.</p>
          ) : (
            (jobs.data ?? []).map((job) => (
              <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{job.file_name ?? "Untitled"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(job.created_at).toLocaleString()}
                    {job.error_message ? ` · ${job.error_message}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={job.status === "succeeded" ? "secondary" : "outline"}>{job.status}</Badge>
                  {job.result_url ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={job.result_url} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
