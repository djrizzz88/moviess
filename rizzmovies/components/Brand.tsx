import { Play } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark"><Play size={compact ? 13 : 16} fill="currentColor" /></span>
      <span><strong>Rizz</strong>Movies</span>
    </span>
  );
}
