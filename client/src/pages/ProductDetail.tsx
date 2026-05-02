import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { ShoppingBag, Truck, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, reviews } = useApp();
  const product = products.find((p) => p.id === id);
  const [color, setColor] = useState<string | undefined>(product?.specs.colors?.[0]);
  const [size, setSize] = useState<string | undefined>(product?.specs.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const gallery = product?.images && product.images.length ? product.images : (product ? [product.image] : []);
  const [activeImg, setActiveImg] = useState(0);
  const productReviews = useMemo(() => reviews.filter(r => r.productId === id), [reviews, id]);

  if (!product) {
    return (
      <Shell>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Product not found.</p>
          <Button asChild className="mt-4"><Link to="/">Back to marketplace</Link></Button>
        </div>
      </Shell>
    );
  }

  const outOfStock = product.stock <= 0;
  const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;

  const handleAdd = () => {
    addToCart({ productId: product.id, qty, color, size });
  };
  const handleBuy = () => {
    addToCart({ productId: product.id, qty, color, size });
    navigate("/cart");
  };

  return (
    <Shell>
      <div className="container py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to marketplace</Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-3">
            <div className="rounded-3xl overflow-hidden bg-secondary/40 border border-border aspect-square shadow-soft">
              <img src={gallery[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-xl overflow-hidden border transition ${i === activeImg ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}>
                    <img src={src} alt={`${product.name} ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{product.category} · by {product.vendorName}</p>
              <h1 className="text-4xl font-bold mt-2 leading-tight">{product.name}</h1>
              <div className="mt-3"><StarRating value={product.rating} count={product.reviewCount} size="md" /></div>
            </div>

            <div className="flex items-baseline gap-3">
              {outOfStock ? (
                <span className="rounded-full bg-destructive text-destructive-foreground text-sm font-bold uppercase px-4 py-1.5">Out of stock</span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-primary">₹{finalPrice.toFixed(2)}</span>
                  {product.discount && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">₹{product.price.toFixed(2)}</span>
                      <span className="rounded-full bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1">−{product.discount}%</span>
                    </>
                  )}
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {product.specs.colors && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Color</h4>
                <div className="flex gap-2 flex-wrap">
                  {product.specs.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-smooth ${
                        color === c ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40"
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.specs.sizes && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Size</h4>
                <div className="flex gap-2 flex-wrap">
                  {product.specs.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[3rem] px-3 py-2 rounded-lg border-2 text-sm font-medium transition-smooth ${
                        size === s ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40"
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-border rounded-lg">
                <button className="px-3 py-2 hover:bg-primary-soft" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="px-4 font-semibold">{qty}</span>
                <button className="px-3 py-2 hover:bg-primary-soft" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" disabled={outOfStock} onClick={handleAdd} className="flex-1">
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </Button>
              <Button variant="hero" size="lg" disabled={outOfStock} onClick={handleBuy} className="flex-1">
                Buy now
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-card/40">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-xs">Free shipping over ₹100</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-card/40">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs">30-day returns</span>
              </div>
            </div>

            {product.specs.specifications && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-2">Specifications</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.specs.specifications}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {productReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet — purchase and complete delivery to leave one.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {productReviews.map((r) => (
                <div key={r.id} className="rounded-xl border-2 border-border bg-card p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{r.customerName}</span>
                    <StarRating value={r.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
