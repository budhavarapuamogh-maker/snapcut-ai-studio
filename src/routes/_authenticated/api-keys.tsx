import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, Loader2 } from "lucide-react";
import { listApiKeys, createApiKey, revokeApiKey } from "@/lib/api-keys.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/api-keys")({
  head: () => ({
    meta: [
      { title: "API keys — SnapCut AI" },
      { name: "description", content: "Create, copy and revoke SnapCut AI API keys for the background removal API." },
      { property: "og:title", content: "API keys — SnapCut AI" },
      { property: "og:description", content: "Manage the keys that authenticate your SnapCut AI API requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApiKeysPage,
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">API keys unavailable</h1>
      <p className="mt-2 text-muted-foreground">Please refresh and try again.</p>
    </div>
  ),
});

function ApiKeysPage() {
  const queryClient = useQueryClient();
  const fetchKeys = useServerFn(listApiKeys);
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const keys = useQuery({ queryKey: ["api-keys"], queryFn: () => fetchKeys({}) });

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Give the key a name.");
      return;
    }
    setBusy(true);
    try {
      const res = await create({ data: { name: name.trim() } });
      setFreshKey(res.key);
      setName("");
      toast.success("API key created. Copy it now — it is shown once.");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch {
      toast.error("Could not create the key.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API keys</h1>
          <p className="mt-2 text-muted-foreground">Authenticate requests to the SnapCut AI public API.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">Workspace</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/billing">Billing</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            maxLength={60}
          />
          <Button variant="hero" onClick={handleCreate} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Create key
          </Button>
        </div>

        {freshKey ? (
          <div className="mt-4 rounded-lg border border-secondary/40 bg-secondary/10 p-4">
            <p className="text-xs uppercase tracking-widest text-secondary">Copy your key now</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-background/60 px-3 py-2 text-sm">{freshKey}</code>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Copy key"
                onClick={() => {
                  navigator.clipboard.writeText(freshKey);
                  toast.success("Copied.");
                }}
              >
                <Copy />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8 space-y-3">
        {(keys.data ?? []).map((k) => (
          <div
            key={k.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
          >
            <div>
              <p className="font-medium">{k.name}</p>
              <p className="text-sm text-muted-foreground">
                {k.prefix}••••••  ·  created {new Date(k.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={k.revoked ? "secondary" : "default"}>{k.revoked ? "Revoked" : "Active"}</Badge>
              {!k.revoked ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await revoke({ data: { id: k.id } });
                    queryClient.invalidateQueries({ queryKey: ["api-keys"] });
                    toast.success("Key revoked.");
                  }}
                >
                  Revoke
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {keys.data && keys.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys yet.</p>
        ) : null}
      </div>
    </div>
  );
}
