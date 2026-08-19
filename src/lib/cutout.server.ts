import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type CutoutResult =
  | { ok: true; jobId: string; resultUrl: string | null; creditsLeft: number }
  | { ok: false; error: string; status: number };

/**
 * Runs AI background removal for a user, stores the PNG and deducts one credit.
 * Server-only: uses the service-role client, so callers MUST authenticate first.
 */
export async function runBackgroundRemoval(params: {
  userId: string;
  fileName: string;
  mimeType: string;
  dataBase64: string;
}): Promise<CutoutResult> {
  const { userId, fileName, mimeType, dataBase64 } = params;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return { ok: false, error: "Account not found.", status: 404 };
  if (profile.credits < 1) return { ok: false, error: "Out of credits.", status: 402 };

  const { data: job, error: jobError } = await supabaseAdmin
    .from("jobs")
    .insert({ user_id: userId, file_name: fileName, status: "processing" })
    .select("id")
    .single();
  if (jobError || !job) return { ok: false, error: "Could not start the job.", status: 500 };

  const fail = async (message: string, status: number): Promise<CutoutResult> => {
    await supabaseAdmin.from("jobs").update({ status: "failed", error_message: message }).eq("id", job.id);
    return { ok: false, error: message, status };
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
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${dataBase64}` } },
            ],
          },
        ],
      }),
    });

    if (response.status === 429) return await fail("Rate limit reached. Please retry shortly.", 429);
    if (!response.ok) return await fail("The AI service could not process this image.", 502);

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
    };
    const imageUrl = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) return await fail("No cutout was returned for this image.", 502);

    const base64 = imageUrl.split(",")[1] ?? "";
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const path = `${userId}/${job.id}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("cutouts")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (uploadError) return await fail("Could not store the result.", 500);

    const { data: signed } = await supabaseAdmin.storage
      .from("cutouts")
      .createSignedUrl(path, 60 * 60 * 24);
    const resultUrl = signed?.signedUrl ?? null;

    await supabaseAdmin.from("jobs").update({ status: "succeeded", result_url: resultUrl }).eq("id", job.id);
    await supabaseAdmin.from("profiles").update({ credits: profile.credits - 1 }).eq("id", userId);

    return { ok: true, jobId: job.id, resultUrl, creditsLeft: profile.credits - 1 };
  } catch {
    return await fail("Unexpected error while processing the image.", 500);
  }
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
