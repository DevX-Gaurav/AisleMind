import { useState, useMemo } from "react";
import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  MessageSquare,
  ScrollText,
  DollarSign,
  Package,
  ShoppingCart,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

const COLORS = [
  "hsl(150 55% 22%)",
  "hsl(28 70% 52%)",
  "hsl(150 45% 38%)",
  "hsl(38 85% 50%)",
  "hsl(150 25% 50%)",
];

export default function AdminDashboard() {
  const {
    user,
    users,
    products,
    orders,
    tickets,
    logs,
    approveVendor,
    suspendVendor,
    deleteVendor,
    resolveTicket,
    deleteProduct,
  } = useApp();
  const [suspendTarget, setSuspendTarget] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");

  if (!user || user.role !== "admin") {
    return (
      <Shell>
        <div className="container py-20 text-center">
          <p>Admin access required.</p>
          <Button asChild className="mt-4">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const vendors = users.filter((u) => u.role === "vendor");
  const customers = users.filter((u) => u.role === "customer");
  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);
  const cancellations = logs.filter((l) => l.type === "cancellation");
  const returns = logs.filter((l) => l.type === "return");
  const openTickets = tickets.filter((t) => t.status === "open");

  const categoryData = [
    "Electronics",
    "Fashion",
    "Footwear",
    "Home",
    "Beauty",
  ].map((c) => ({
    name: c,
    value: products.filter((p) => p.category === c).length,
  }));
  const statusData = [
    "Placed",
    "Dispatched",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ].map((s) => ({
    name: s.length > 9 ? s.split(" ")[0] : s,
    count: orders.filter((o) => o.status === s).length,
  }));

  // Monthly sales last 6 months
  const monthly = useMemo(() => {
    const months: { month: string; sales: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        sales: 0,
      });
    }
    orders
      .filter((o) => o.status !== "Cancelled")
      .forEach((o) => {
        const d = new Date(o.createdAt);
        const idx = months.findIndex(
          (m) => m.month === d.toLocaleString("en-US", { month: "short" }),
        );
        if (idx >= 0) months[idx].sales += o.total;
      });
    return months.map((m) => ({
      ...m,
      sales: Math.round(m.sales * 100) / 100,
    }));
  }, [orders]);

  // Top performing products by qty sold
  const topProducts = useMemo(() => {
    const tally: Record<string, { name: string; sold: number }> = {};
    orders
      .filter((o) => o.status !== "Cancelled")
      .forEach((o) => {
        o.items.forEach((i) => {
          if (!tally[i.productId])
            tally[i.productId] = { name: i.name, sold: 0 };
          tally[i.productId].sold += i.qty;
        });
      });
    return Object.values(tally)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((t) => ({
        ...t,
        name: t.name.length > 18 ? t.name.slice(0, 18) + "…" : t.name,
      }));
  }, [orders]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productFilter !== "all" && p.category !== productFilter) return false;
      if (
        productSearch &&
        !p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
        !p.vendorName.toLowerCase().includes(productSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [products, productSearch, productFilter]);

  const doSuspend = () => {
    if (!suspendTarget || !reason.trim()) {
      toast.error("Reason required");
      return;
    }
    suspendVendor(suspendTarget, reason);
    setSuspendTarget(null);
    setReason("");
  };

  return (
    <Shell>
      <div className="container py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary flex items-center gap-2">
            <Shield className="h-3 w-3" /> Command Center
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Admin Console
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat
            icon={DollarSign}
            label="GMV"
            value={`$${revenue.toFixed(0)}`}
          />
          <Stat icon={ShoppingCart} label="Orders" value={orders.length} />
          <Stat icon={Package} label="Products" value={products.length} />
          <Stat icon={Users} label="Users" value={users.length} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-bold mb-4">Monthly sales trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-bold mb-4">Top performing products</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No sales yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar
                    dataKey="sold"
                    fill="hsl(var(--primary))"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-bold mb-4">Orders by status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-bold mb-4">Products by category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={{ fontSize: 11 }}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Tabs defaultValue="vendors">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex md:grid md:grid-cols-5 w-auto md:w-full md:max-w-3xl">
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="tickets">
                <MessageSquare className="h-3 w-3 mr-1" />
                Inbox ({openTickets.length})
              </TabsTrigger>
              <TabsTrigger value="logs">
                <ScrollText className="h-3 w-3 mr-1" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="vendors" className="mt-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4">Store</th>
                      <th className="text-left p-4">Owner</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v) => (
                      <tr key={v.id} className="border-t border-border">
                        <td className="p-4 font-semibold">
                          {v.storeName || "—"}
                        </td>
                        <td className="p-4">
                          <div>{v.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {v.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              v.status === "active"
                                ? "bg-success/20 text-success"
                                : v.status === "pending"
                                  ? "bg-warning/20 text-warning-foreground"
                                  : "bg-destructive/15 text-destructive"
                            }`}
                          >
                            {v.status}
                          </span>
                          {v.suspensionReason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              "{v.suspensionReason}"
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {v.status !== "active" && (
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => approveVendor(v.id)}
                            >
                              Approve
                            </Button>
                          )}
                          {v.status !== "suspended" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSuspendTarget(v.id)}
                            >
                              Suspend
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteVendor(v.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by product or vendor…"
                  className="pl-10"
                />
              </div>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="rounded-lg border border-input bg-background h-10 px-3 text-sm"
              >
                <option value="all">All categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Footwear</option>
                <option>Home</option>
                <option>Beauty</option>
              </select>
              <span className="self-center text-xs text-muted-foreground">
                {filteredProducts.length} of {products.length}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Vendor</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-right p-4">Price</th>
                      <th className="text-right p-4">Stock</th>
                      <th className="text-right p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-10 w-10 rounded-lg object-cover border border-border"
                            />
                            <div>
                              <Link
                                to={`/product/${p.id}`}
                                className="font-semibold hover:text-primary"
                              >
                                {p.name}
                              </Link>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                #{p.id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {p.vendorName}
                        </td>
                        <td className="p-3">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-primary">
                          ${p.price.toFixed(2)}
                        </td>
                        <td
                          className={`p-3 text-right ${p.stock === 0 ? "text-destructive font-bold" : ""}`}
                        >
                          {p.stock === 0 ? "Out" : p.stock}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm(`Delete "${p.name}"?`))
                                deleteProduct(p.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No products match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6 space-y-3">
            {tickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No support tickets.
              </p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-soft"
                >
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t.subject}</span>
                        <span className="text-xs uppercase font-bold text-primary">
                          {t.fromRole}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        From {t.fromName} ·{" "}
                        {new Date(t.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm mt-3">{t.message}</p>
                    </div>
                    {t.status === "open" ? (
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => resolveTicket(t.id)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Mark resolved
                      </Button>
                    ) : (
                      <span className="rounded-full bg-success/20 text-success px-3 py-1 text-xs font-bold">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <div className="rounded-xl border border-border bg-card divide-y divide-border shadow-soft">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No platform events yet.
                </p>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="p-4 flex items-start gap-3">
                    <AlertOctagon
                      className={`h-4 w-4 mt-0.5 ${l.type === "cancellation" ? "text-destructive" : l.type === "return" ? "text-warning" : "text-primary"}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                          {l.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {new Date(l.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5">
                        By <span className="font-semibold">{l.actor}</span> target{" "}
                        <span className="font-mono text-xs">{l.fromRole}</span>
                      </p>
                      <p className="text-sm italic text-muted-foreground mt-1">
                        "{l.reason}"
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="p-4 bg-secondary/30 text-xs text-muted-foreground flex gap-4">
                <span>
                  Cancellations: <strong>{cancellations.length}</strong>
                </span>
                <span>
                  Returns: <strong>{returns.length}</strong>
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="p-4 font-semibold">{c.name}</td>
                        <td className="p-4">{c.email}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend vendor</DialogTitle>
            <DialogDescription>
              Provide a reason — this is logged and shown to the vendor.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Repeated quality issues / policy violation / …"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doSuspend}>
              Suspend vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
