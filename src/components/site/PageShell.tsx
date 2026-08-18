import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      <header className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-lg text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </div>
  );
}
