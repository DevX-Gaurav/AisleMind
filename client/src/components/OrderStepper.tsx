import { CheckCircle2, Package, Truck, MapPin, Home, XCircle, Clock } from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { ORDER_FLOW } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<OrderStatus, typeof Package> = {
  Placed: CheckCircle2,
  Dispatched: Package,
  Shipped: Truck,
  "Out for Delivery": MapPin,
  Delivered: Home,
  Cancelled: XCircle,
};

export default function OrderStepper({ status, timeline }: {
  status: OrderStatus;
  timeline: { status: OrderStatus; at: number }[];
}) {
  if (status === "Cancelled") {
    return (
      <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
        <XCircle className="h-6 w-6 text-destructive" />
        <div>
          <p className="font-bold text-destructive">Order cancelled</p>
          <p className="text-xs text-muted-foreground">This order has been cancelled and will not be fulfilled.</p>
        </div>
      </div>
    );
  }

  const currentIdx = ORDER_FLOW.indexOf(status);

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6">
      <div className="flex items-start justify-between gap-2 relative">
        {ORDER_FLOW.map((s, i) => {
          const Icon = ICONS[s];
          const reached = i <= currentIdx;
          const event = timeline.find((t) => t.status === s);
          return (
            <div key={s} className="flex-1 flex flex-col items-center text-center relative">
              {i > 0 && (
                <div
                  className={cn(
                    "absolute top-5 right-1/2 w-full h-0.5 -z-0",
                    i <= currentIdx ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <div
                className={cn(
                  "relative z-10 h-10 w-10 rounded-full flex items-center justify-center border-2 transition-smooth",
                  reached
                    ? "bg-primary border-primary text-primary-foreground shadow-elegant"
                    : "bg-card border-border text-muted-foreground"
                )}
              >
                {reached ? <Icon className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <p className={cn("mt-2 text-xs font-semibold", reached ? "text-foreground" : "text-muted-foreground")}>{s}</p>
              {event && <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(event.at).toLocaleDateString()}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
