import { useState, useMemo } from "react";
import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import {
  Package, Plus, Trash2, ChevronDown, AlertCircle, Undo2,
  DollarSign, ShoppingCart, Boxes, Upload, X, Pencil, Download, MessageSquare, LifeBuoy,
} from "lucide-react";
import type { Category, OrderStatus, Product, Order, ReturnStatus } from "@/lib/types";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import Invoice from "@/components/Invoice";

const VENDOR_STATUSES: OrderStatus[] = ["Dispatched", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const RETURN_STATUSES: ReturnStatus[] = ["pending", "approved", "rejected", "refunded"];

const STATUS_BADGE: Record<OrderStatus, string> = {
  Placed: "bg-primary-soft text-primary",
  Dispatched: "bg-primary-soft text-primary",
  Shipped: "bg-primary-soft text-primary",
  "Out for Delivery": "bg-warning/20 text-warning-foreground",
  Delivered: "bg-success/20 text-success",
  Cancelled: "bg-destructive/15 text-destructive",
};

const RETURN_BADGE: Record<ReturnStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  approved: "bg-primary-soft text-primary",
  rejected: "bg-destructive/15 text-destructive",
  refunded: "bg-success/20 text-success",
};

export default function VendorDashboard() {
  const {
    user, products, orders, addProduct, updateProduct, deleteProduct,
    updateOrderStatus, cancelOrder, updateReturnStatus, submitTicket,
  } = useApp();
  const [editing, setEditing] = useState<Product | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  if (!user || user.role !== "vendor") {
    return <Shell><div className="container py-20 text-center"><p>Vendor access required.</p><Button asChild className="mt-4"><Link to="/auth?role=vendor">Sign in as vendor</Link></Button></div></Shell>;
  }

  if (user.status === "pending") {
    return <Shell><div className="container py-20 text-center max-w-md mx-auto"><AlertCircle className="h-10 w-10 text-warning mx-auto mb-3"/><h1 className="text-2xl font-bold">Account pending approval</h1><p className="text-muted-foreground mt-2">An admin will review your store shortly.</p></div></Shell>;
  }
  if (user.status === "suspended") {
    return <Shell><div className="container py-20 text-center max-w-md mx-auto"><AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3"/><h1 className="text-2xl font-bold text-destructive">Account suspended</h1><p className="text-muted-foreground mt-2">Reason: {user.suspensionReason}</p></div></Shell>;
  }

  const myProducts = products.filter((p) => p.vendorId === user.id);
  const myOrders = orders;
  const returns = myOrders.filter((o) => o.returnRequest);

  const revenue = myOrders
    .filter(o => o.status !== "Cancelled")
    .reduce((s, o) => s + o.items.filter(i => i.vendorId === user.id).reduce((a, i) => a + i.price * i.qty, 0), 0);

  return (
    <Shell>
      <div className="container py-6 md:py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 md:mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-primary">{user.storeName || user.name}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
          <StatCard icon={DollarSign} label="Revenue" value={`$${revenue.toFixed(2)}`} />
          <StatCard icon={ShoppingCart} label="Orders" value={myOrders.length} />
          <StatCard icon={Boxes} label="Products" value={myProducts.length} />
          <StatCard icon={Undo2} label="Returns" value={returns.length} />
        </div>

        {/* Charts */}
        <VendorCharts orders={myOrders} vendorId={user.id} />

        <Tabs defaultValue="orders" className="w-full mt-6 md:mt-8">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex md:grid md:grid-cols-4 w-auto md:w-full md:max-w-2xl">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="returns">Returns ({returns.length})</TabsTrigger>
              <TabsTrigger value="support"><LifeBuoy className="h-3 w-3 mr-1" />Complain</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="mt-6 space-y-3">
            {myOrders.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No orders yet.</p>
            ) : myOrders.map((o) => (
              <div key={o.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <Link to={`/orders/${o.id}`} className="font-mono text-xs text-muted-foreground hover:text-primary">#{o.id.slice(-8).toUpperCase()}</Link>
                    <p className="font-semibold mt-0.5">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.items.length} items · {new Date(o.createdAt).toLocaleDateString()}
                      {o.paymentMethod && <> · <span className="font-semibold text-foreground">{o.paymentMethod}</span></>}
                    </p>
                    {o.paymentDetails && <p className="text-[11px] text-muted-foreground italic">{o.paymentDetails}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[o.status]}`}>{o.status}</span>
                    <Button variant="outline" size="sm" onClick={() => setInvoiceOrder(o)} className="rounded-lg gap-1">
                      <Download className="h-3 w-3" /> Invoice
                    </Button>
                    <OrderStatusMenu
                      currentStatus={o.status}
                      onSelect={(s) => updateOrderStatus(o.id, s)}
                      onCancel={(reason) => cancelOrder(o.id, "vendor", reason)}
                    />
                  </div>
                </div>
                {o.cancellation && (
                  <p className="text-xs text-destructive mt-2 italic">Cancelled by {o.cancellation.by}: {o.cancellation.reason}</p>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductForm
              key="add"
              mode="add"
              onSubmit={(data) => addProduct(data)}
            />
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProducts.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
                  <img src={p.image} alt={p.name} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                    {p.images && p.images.length > 1 && (
                      <p className="text-[10px] text-muted-foreground mt-1">{p.images.length} images</p>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-primary">${p.price.toFixed(2)}</span>
                      <span className={`text-xs ${p.stock === 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                        {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => setEditing(p)} className="rounded-lg">
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive rounded-lg" onClick={() => deleteProduct(p.id)}>
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="returns" className="mt-6">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-warning" /> Return Requests
            </h2>
            {returns.length === 0 ? (
              <p className="text-muted-foreground">No active return requests.</p>
            ) : (
              <div className="space-y-3">
                {returns.map((o) => (
                  <div key={o.id} className="rounded-xl border border-warning/30 bg-warning/5 p-5">
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div className="flex-1">
                        <Link to={`/orders/${o.id}`} className="font-mono text-xs text-muted-foreground hover:text-primary">#{o.id.slice(-8).toUpperCase()}</Link>
                        <p className="font-semibold mt-0.5">{o.customerName}</p>
                        <p className="text-sm mt-2"><span className="font-semibold">Reason:</span> <span className="italic">"{o.returnRequest!.reason}"</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Requested {new Date(o.returnRequest!.requestedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${RETURN_BADGE[o.returnRequest!.status]}`}>
                          {o.returnRequest!.status}
                        </span>
                        <select
                          value={o.returnRequest!.status}
                          onChange={(e) => updateReturnStatus(o.id, e.target.value as ReturnStatus)}
                          className="rounded-lg border border-border bg-background h-9 px-3 text-xs font-medium"
                        >
                          {RETURN_STATUSES.map(s => (
                            <option key={s} value={s}>Set: {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="support" className="mt-6 max-w-xl">
            <ComplainForm onSubmit={submitTicket} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> Update product</DialogTitle>
              <DialogDescription>Modify your existing product details.</DialogDescription>
            </DialogHeader>
            <ProductForm
              mode="edit"
              initial={editing}
              onSubmit={(data) => { updateProduct(editing.id, data); setEditing(null); toast.success("Product updated"); }}
              onCancel={() => setEditing(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Invoice dialog */}
      {invoiceOrder && (
        <InvoiceDialog order={invoiceOrder} vendorId={user.id} onClose={() => setInvoiceOrder(null)} />
      )}
    </Shell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg sm:text-2xl font-bold truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

function VendorCharts({ orders, vendorId }: { orders: Order[]; vendorId: string }) {
  const monthly = useMemo(() => {
    const months: { month: string; sales: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.toLocaleString("en-US", { month: "short" }), sales: 0 });
    }
    orders.filter(o => o.status !== "Cancelled").forEach(o => {
      const d = new Date(o.createdAt);
      const idx = months.findIndex(m => m.month === d.toLocaleString("en-US", { month: "short" })
        && (now.getFullYear() === d.getFullYear() || now.getFullYear() - 1 === d.getFullYear()));
      if (idx >= 0) {
        const vendorTotal = o.items.filter(i => i.vendorId === vendorId).reduce((s, i) => s + i.price * i.qty, 0);
        months[idx].sales += vendorTotal;
      }
    });
    return months.map(m => ({ ...m, sales: Math.round(m.sales * 100) / 100 }));
  }, [orders, vendorId]);

  const topProducts = useMemo(() => {
    const tally: Record<string, { name: string; sold: number }> = {};
    orders.filter(o => o.status !== "Cancelled").forEach(o => {
      o.items.filter(i => i.vendorId === vendorId).forEach(i => {
        if (!tally[i.productId]) tally[i.productId] = { name: i.name, sold: 0 };
        tally[i.productId].sold += i.qty;
      });
    });
    return Object.values(tally).sort((a, b) => b.sold - a.sold).slice(0, 5)
      .map(t => ({ ...t, name: t.name.length > 18 ? t.name.slice(0, 18) + "…" : t.name }));
  }, [orders, vendorId]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-bold mb-4">Monthly sales (last 6 months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
            <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-bold mb-4">Top performing products</h3>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">No sales yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function OrderStatusMenu({ currentStatus, onSelect, onCancel }: {
  currentStatus: OrderStatus;
  onSelect: (s: OrderStatus) => void;
  onCancel: (reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const isFinal = currentStatus === "Delivered" || currentStatus === "Cancelled";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isFinal} className="rounded-lg gap-1">
            Update <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl border border-border shadow-elegant p-2">
          <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Set status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {VENDOR_STATUSES.filter(s => s !== "Cancelled").map((s) => (
            <DropdownMenuItem key={s} onClick={() => onSelect(s)} className="rounded-lg cursor-pointer focus:bg-primary-soft focus:text-primary">
              {s}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)} className="rounded-lg cursor-pointer text-destructive focus:text-destructive">
            Cancelled
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>The customer will see your reason. Be respectful.</DialogDescription>
          </DialogHeader>
          <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Out of stock unexpectedly / quality issue / …" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Keep order</Button>
            <Button variant="destructive" onClick={() => {
              if (!reason.trim()) { toast.error("Please provide a reason"); return; }
              onCancel(reason); setOpen(false); setReason("");
            }}>Confirm cancellation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ProductFormData = Omit<Product, "id" | "vendorId" | "vendorName" | "createdAt" | "rating" | "reviewCount">;

function ProductForm({ mode, initial, onSubmit, onCancel }: {
  mode: "add" | "edit";
  initial?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel?: () => void;
}) {
  const [open, setOpen] = useState(mode === "edit");
  const [category, setCategory] = useState<Category>(initial?.category || "Electronics");
  const [images, setImages] = useState<string[]>(
    initial?.images && initial.images.length ? initial.images : (initial?.image ? [initial.image] : [])
  );
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial ? String(initial.price) : "",
    stock: initial ? String(initial.stock) : "",
    discount: initial?.discount ? String(initial.discount) : "",
    colors: initial?.specs.colors?.join(", ") || "",
    sizes: initial?.specs.sizes?.join(", ") || "",
    subcategory: initial?.specs.subcategory || "",
    specifications: initial?.specs.specifications || "",
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 6 - images.length;
    const list = Array.from(files).slice(0, remaining);
    if (list.length === 0) { toast.error("Maximum 6 images"); return; }
    Promise.all(list.map(file => new Promise<string>((resolve, reject) => {
      if (!file.type.startsWith("image/")) { reject(); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then(urls => setImages(prev => [...prev, ...urls])).catch(() => toast.error("Failed to read image"));
  };

  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { toast.error("Upload at least one image"); return; }
    if ((category === "Fashion" || category === "Footwear") && !form.sizes.trim()) { toast.error("Sizes required"); return; }
    if ((category === "Fashion" || category === "Footwear") && !form.colors.trim()) { toast.error("Colors required"); return; }

    onSubmit({
      name: form.name,
      description: form.description,
      category,
      price: parseFloat(form.price),
      discount: form.discount ? parseFloat(form.discount) : undefined,
      stock: parseInt(form.stock, 10),
      image: images[0],
      images,
      specs: {
        colors: form.colors ? form.colors.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        sizes: form.sizes ? form.sizes.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        subcategory: form.subcategory || undefined,
        specifications: form.specifications || undefined,
      },
    });
    if (mode === "add") {
      setOpen(false);
      setImages([]);
      setForm({ name: "", description: "", price: "", stock: "", discount: "", colors: "", sizes: "", subcategory: "", specifications: "" });
    }
  };

  const formContent = (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <select className="w-full mt-1.5 rounded-lg border border-input bg-background h-10 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Footwear">Footwear</option>
            <option value="Home">Home</option>
            <option value="Beauty">Beauty</option>
          </select>
        </div>
        <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
      </div>
      <div><Label>Description</Label><Textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Price ($)</Label><Input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5" /></div>
        <div><Label>Stock</Label><Input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1.5" /></div>
        <div><Label>Discount %</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="mt-1.5" /></div>
      </div>

      {/* Multi-image upload */}
      <div>
        <Label>Product images (up to 6)</Label>
        <div className="mt-1.5 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              <img src={img} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <X className="h-3 w-3" />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">PRIMARY</span>}
            </div>
          ))}
          {images.length < 6 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary-soft cursor-pointer flex flex-col items-center justify-center text-muted-foreground text-xs gap-1 transition">
              <Upload className="h-5 w-5" />
              <span>Add</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      {category === "Electronics" && (
        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-primary-soft/50 border border-primary/15">
          <div><Label>Colors (comma-sep.)</Label><Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="mt-1.5" placeholder="Forest, Cream, Black" /></div>
          <div>
            <Label>Sub-category</Label>
            <select className="w-full mt-1.5 rounded-lg border border-input bg-background h-10 px-3 text-sm" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}>
              <option value="">Choose…</option>
              <option>Audio</option><option>Wearables</option><option>Mobile</option><option>Laptops</option>
            </select>
          </div>
        </div>
      )}
      {category === "Fashion" && (
        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-primary-soft/50 border border-primary/15">
          <div><Label>Colors *</Label><Input required value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="mt-1.5" placeholder="Cream, Forest" /></div>
          <div><Label>Sizes *</Label><Input required value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="mt-1.5" placeholder="S, M, L, XL, XXL" /></div>
        </div>
      )}
      {category === "Footwear" && (
        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-primary-soft/50 border border-primary/15">
          <div><Label>Colors *</Label><Input required value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="mt-1.5" placeholder="Tan, Forest" /></div>
          <div><Label>Sizes *</Label><Input required value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="mt-1.5" placeholder="8, 9, 10, 11" /></div>
        </div>
      )}
      <div><Label>Specifications</Label><Textarea rows={3} value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} className="mt-1.5" placeholder="Materials, dimensions, certifications…" /></div>
      <DialogFooter>
        {mode === "add"
          ? <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
          : <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="hero">{mode === "add" ? "Add product" : "Save changes"}</Button>
      </DialogFooter>
    </form>
  );

  if (mode === "edit") return formContent;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="hero" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add product</Button>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5"/> Add product</DialogTitle>
          <DialogDescription>Fields adapt based on category. Upload up to 6 product images.</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

function ComplainForm({ onSubmit }: { onSubmit: (subject: string, message: string) => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) { toast.error("Fill in both fields"); return; }
    onSubmit(subject, message);
    setSubject(""); setMessage("");
  };
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-bold text-lg">Complain to Admin</h2>
          <p className="text-xs text-muted-foreground">Report platform issues, payout disputes, or escalations.</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1.5" placeholder="Payout delay / Customer abuse / …" /></div>
        <div><Label>Message</Label><Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1.5" /></div>
        <Button type="submit" variant="hero" className="w-full">Submit complaint</Button>
      </form>
    </div>
  );
}

function InvoiceDialog({ order, vendorId, onClose }: { order: Order; vendorId: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 bg-muted/20">
        <Invoice order={order} vendorId={vendorId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
