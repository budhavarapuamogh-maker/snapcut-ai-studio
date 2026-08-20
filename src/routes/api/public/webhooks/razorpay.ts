import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const body = await request.text();
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: {
          event?: string;
          payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
        };
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        if (payload.event !== "payment.captured") return new Response("ignored");

        const entity = payload.payload?.payment?.entity;
        const orderId = entity?.order_id;
        if (!orderId) return new Response("Bad payload", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id, user_id, credits, status")
          .eq("order_id", orderId)
          .maybeSingle();

        if (!payment) return new Response("Unknown order", { status: 404 });
        if (payment.status === "paid") return new Response("ok");

        await supabaseAdmin
          .from("payments")
          .update({ status: "paid", payment_id: entity?.id ?? null })
          .eq("id", payment.id);

        await supabaseAdmin.rpc("add_credits", {
          _user_id: payment.user_id,
          _amount: payment.credits,
        });

        return new Response("ok");
      },
    },
  },
});
