import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(value) ? "fill-warning text-warning" : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground font-medium">
        {value > 0 ? value.toFixed(1) : "—"}{count !== undefined ? ` (${count})` : ""}
      </span>
    </div>
  );
}
