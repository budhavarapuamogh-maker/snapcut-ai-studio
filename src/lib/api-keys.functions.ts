import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("api_keys")
      .select("id, name, prefix, revoked, last_used_at, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your API keys.");
    return data ?? [];
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: z.string().trim().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const { sha256Hex } = await import("@/lib/cutout.server");
    const raw = `sk_live_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
    const keyHash = await sha256Hex(raw);
    const { error } = await context.supabase.from("api_keys").insert({
      user_id: context.userId,
      name: data.name,
      prefix: raw.slice(0, 14),
      key_hash: keyHash,
    });
    if (error) throw new Error("Could not create the API key.");
    return { key: raw };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("api_keys")
      .update({ revoked: true })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not revoke the key.");
    return { ok: true };
  });
