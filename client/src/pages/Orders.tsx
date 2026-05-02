import { Link } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

const STATUS_STYLE: Record<string, string> = {
  Placed: "bg-primary-soft text-primary",
  Dispatched: "bg-primary-soft text-primary",
  Shipped: "bg-primary-soft text-primary",
  "Out for Delivery": "bg-warning/20 text-warning-foreground",
  Delivered: "bg-success/20 text-success",
  Cancelled: "bg-destructive/15 text-destructive",
};

export default function Orders() {
  const { user, orders } = useApp();

  if (!user) return <Shell><div className="container py-20 text-center"><Button asChild><Link to="/auth">Sign in</Link></Button></div></Shell>;

  return (
    <Shell>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-1">My Orders</h1>
        <p className="text-sm text-muted-foreground mb-8">Welcome back, <span className="font-semibold text-foreground">{user.name}</span></p>
        {orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No orders yet.</p>
            <Button asChild variant="hero"><Link to="/">Start shopping</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="block rounded-xl border-2 border-border bg-card p-5 hover:shadow-elegant hover:border-primary/30 transition-smooth">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold mt-0.5">{o.items.length} item{o.items.length > 1 ? "s" : ""} · {new Date(o.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{o.items.map(i => i.name).join(" · ")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[o.status] || "bg-muted"}`}>{o.status}</span>
                    <p className="font-bold text-primary text-lg">${o.total.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
