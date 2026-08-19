import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CREDIT_PACKS } from "@/lib/packs";

export const createCheckoutOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ packId: z.string().min(1).max(40) }).parse(input))
  .handler(async ({ data, context }) => {
    const pack = CREDIT_PACKS.find((p) => p.id === data.packId);
    if (!pack) throw new Error("Unknown credit pack.");

    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) {
      return { ok: false as const, error: "Payments are not configured yet." };
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: pack.amountCents,
        currency: "INR",
        notes: { user_id: context.userId, pack_id: pack.id, credits: String(pack.credits) },
      }),
    });
    if (!response.ok) return { ok: false as const, error: "Could not start checkout. Please retry." };
    const order = (await response.json()) as { id: string };

    const { error } = await context.supabase.from("payments").insert({
      user_id: context.userId,
      order_id: order.id,
      amount_cents: pack.amountCents,
      credits: pack.credits,
    });
    if (error) return { ok: false as const, error: "Could not record the order." };

    return { ok: true as const, orderId: order.id, keyId, amount: pack.amountCents, credits: pack.credits };
  });

export const listPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("payments")
      .select("id, order_id, amount_cents, credits, status, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return data ?? [];
  });
