import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { user, cart, products, updateCartQty, removeFromCart } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Shell>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your cart.</p>
          <Button asChild variant="hero"><Link to="/auth">Sign in</Link></Button>
        </div>
      </Shell>
    );
  }

  const items = cart.map((ci) => {
    const p = products.find((x) => x.id === ci.productId);
    return p ? { ci, p } : null;
  }).filter(Boolean) as { ci: typeof cart[0]; p: NonNullable<ReturnType<typeof products.find>> }[];

  const subtotal = items.reduce((s, { ci, p }) => {
    const price = p.discount ? p.price * (1 - p.discount / 100) : p.price;
    return s + price * ci.qty;
  }, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <Shell>
      <div className="container py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-5 md:mb-6">Your cart</h1>
        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 md:p-12 text-center">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button asChild variant="hero"><Link to="/">Start shopping</Link></Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map(({ ci, p }) => {
                const price = p.discount ? p.price * (1 - p.discount / 100) : p.price;
                return (
                  <div key={`${p.id}-${ci.color}-${ci.size}`} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 border-border bg-card">
                    <img src={p.image} alt={p.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${p.id}`} className="font-semibold hover:text-primary text-sm sm:text-base line-clamp-2">{p.name}</Link>
                      <p className="text-xs text-muted-foreground">by {p.vendorName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ci.color && `Color: ${ci.color}`} {ci.size && `· Size: ${ci.size}`}
                      </p>
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <div className="flex items-center border-2 border-border rounded-lg text-sm">
                          <button className="px-2 py-1 hover:bg-primary-soft" onClick={() => updateCartQty(p.id, Math.max(1, ci.qty - 1))}>−</button>
                          <span className="px-3 font-semibold">{ci.qty}</span>
                          <button className="px-2 py-1 hover:bg-primary-soft" onClick={() => updateCartQty(p.id, ci.qty + 1)}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(p.id)} className="text-destructive hover:underline text-xs flex items-center gap-1">
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm sm:text-base">₹{(price * ci.qty).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border-2 border-border bg-card p-5 sm:p-6 h-fit lg:sticky lg:top-24">
              <h2 className="font-bold text-lg mb-4">Order summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-semibold">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span className="font-semibold">₹{tax.toFixed(2)}</span></div>
                <div className="border-t border-border my-3" />
                <div className="flex justify-between text-base"><span className="font-bold">Total</span><span className="font-bold text-primary">₹{total.toFixed(2)}</span></div>
              </div>
              <Button variant="hero" size="lg" className="w-full mt-6" onClick={() => navigate("/checkout")}>
                Proceed to checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
