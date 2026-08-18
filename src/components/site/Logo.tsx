import { Link } from "@tanstack/react-router";
import logo from "@/assets/snapcut-logo.png.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logo.url}
        alt="SnapCut AI logo"
        className="h-9 w-9 rounded-lg object-cover"
        width={36}
        height={36}
      />
      <span className="text-lg font-semibold tracking-tight">
        Snap<span className="text-gradient-brand">Cut AI</span>
      </span>
    </Link>
  );
}
