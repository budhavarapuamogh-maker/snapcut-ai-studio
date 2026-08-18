import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.string().trim().regex(/^image\/(png|jpeg|jpg|webp)$/, "Unsupported image type"),
  dataBase64: z.string().min(16).max(14_000_000),
});

export const removeBackground = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error("Could not load your account.");
    if (!profile || profile.credits < 1) {
      return { ok: false as const, error: "You are out of credits. Top up on the pricing page." };
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({ user_id: userId, file_name: data.fileName, status: "processing" })
      .select("id")
      .single();
    if (jobError || !job) throw new Error("Could not start the job.");

    const fail = async (message: string) => {
      await supabase.from("jobs").update({ status: "failed", error_message: message }).eq("id", job.id);
      return { ok: false as const, error: message };
    };

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Remove the background from this image completely. Keep the main subject pixel-perfect with clean, refined edges including fine details like hair. Output the subject on a fully transparent background as a PNG. Do not add shadows, borders, text or any new elements.",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${data.mimeType};base64,${data.dataBase64}` },
                },
              ],
            },
          ],
        }),
      });

      if (response.status === 429) return await fail("Rate limit reached. Please retry in a moment.");
      if (response.status === 402) return await fail("AI credits exhausted. Please top up workspace credits.");
      if (!response.ok) return await fail("The AI service could not process this image.");

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
      };
      const imageUrl = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageUrl) return await fail("No cutout was returned. Try a different image.");

      const base64 = imageUrl.split(",")[1] ?? "";
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const path = `${userId}/${job.id}.png`;

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: uploadError } = await supabaseAdmin.storage
        .from("cutouts")
        .upload(path, bytes, { contentType: "image/png", upsert: true });
      if (uploadError) return await fail("Could not store the result.");

      const { data: signed } = await supabaseAdmin.storage
        .from("cutouts")
        .createSignedUrl(path, 60 * 60 * 24);
      const resultUrl = signed?.signedUrl ?? null;

      await supabase
        .from("jobs")
        .update({ status: "succeeded", result_url: resultUrl })
        .eq("id", job.id);
      await supabase
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", userId);

      return { ok: true as const, jobId: job.id, resultUrl, creditsLeft: profile.credits - 1 };
    } catch {
      return await fail("Unexpected error while processing the image.");
    }
  });

export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("jobs")
      .select("id, file_name, status, result_url, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error("Could not load your history.");
    return data ?? [];
  });

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("display_name, email, credits")
      .eq("id", context.userId)
      .maybeSingle();
    return data ?? { display_name: null, email: null, credits: 0 };
  });
