import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SnapCut AI Support and Sales" },
      {
        name: "description",
        content:
          "Questions about plans, volume pricing or the API? Send the SnapCut AI team a message.",
      },
      { property: "og:title", content: "Contact — SnapCut AI Support and Sales" },
      {
        property: "og:description",
        content: "Talk to the SnapCut AI team about support, billing or API access.",
      },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      message: form.get("message"),
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    setErrors({});
    event.currentTarget.reset();
    toast.success("Message queued", {
      description: "Connect email delivery to start receiving these messages.",
    });
  }

  return (
    <PageShell
      eyebrow="Contact"
      title="Talk to us"
      description="Support, volume pricing, or API onboarding — we usually reply within one business day."
    >
      <form onSubmit={onSubmit} noValidate className="surface-glass mt-12 max-w-xl rounded-2xl p-7">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" maxLength={100} aria-invalid={!!errors.name} />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              maxLength={255}
              aria-invalid={!!errors.email}
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={5} maxLength={1000} />
            {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : null}
          </div>
          <Button type="submit" variant="hero" size="lg">
            Send message
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
