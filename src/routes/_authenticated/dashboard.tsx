import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/upload", replace: true });
  }, [navigate]);
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-muted-foreground">Redirecting to workspace…</p>
    </div>
  );
}
