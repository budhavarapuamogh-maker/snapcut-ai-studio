import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  fileName: z.string().trim().min(1).max(200).optional(),
  mimeType: z.string().trim().regex(/^image\/(png|jpeg|jpg|webp)$/),
  dataBase64: z.string().min(16).max(14_000_000),
});

export const Route = createFileRoute("/api/public/v1/remove-background")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        if (!token) return Response.json({ error: "Missing API key." }, { status: 401 });

        const { sha256Hex, runBackgroundRemoval } = await import("@/lib/cutout.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const keyHash = await sha256Hex(token);
        const { data: apiKey } = await supabaseAdmin
          .from("api_keys")
          .select("id, user_id, revoked")
          .eq("key_hash", keyHash)
          .maybeSingle();
        if (!apiKey || apiKey.revoked) {
          return Response.json({ error: "Invalid or revoked API key." }, { status: 401 });
        }

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        await supabaseAdmin
          .from("api_keys")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", apiKey.id);

        const result = await runBackgroundRemoval({
          userId: apiKey.user_id,
          fileName: parsed.fileName ?? "api-upload",
          mimeType: parsed.mimeType,
          dataBase64: parsed.dataBase64,
        });

        if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
        return Response.json({
          jobId: result.jobId,
          resultUrl: result.resultUrl,
          creditsLeft: result.creditsLeft,
        });
      },
    },
  },
});
