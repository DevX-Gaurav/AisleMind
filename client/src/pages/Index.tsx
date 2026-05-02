import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import ProductCard from "@/components/ProductCard";
import { CardGridSkeleton } from "@/components/Skeletons";
import { useApp } from "@/context/AppContext";
import { Sprout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Electronics", "Fashion", "Footwear", "Home", "Beauty"] as const;

export default function Index() {
  const { products } = useApp();
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "All";
  const q = params.get("q")?.toLowerCase() || "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = cat === "All" || p.category === cat;
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, cat, q]);

  return (
    <Shell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-cream" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative py-12 sm:py-16 md:py-24 lg:py-28 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="space-y-5 md:space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Independent makers, slow-grown
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-balance">
              Considered objects for a <span className="text-primary italic">slower</span> kind of modern life.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              Curated goods from small workshops and independent vendors —
              from heritage knitwear to hand-thrown stoneware. One marketplace, made with care.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="lg" className="md:h-12 md:px-7" asChild>
                <a href="#shop">Shop the marketplace</a>
              </Button>
              <Button variant="outline" size="lg" className="md:h-12 md:px-7" asChild>
                <a href="/auth?role=vendor">Become a vendor</a>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 bg-gradient-hero opacity-10 blur-2xl rounded-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {products.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  className="aspect-square rounded-2xl overflow-hidden shadow-elegant border-2 border-card animate-scale-in"
                  style={{ animationDelay: `${i * 80}ms`, transform: i % 2 === 0 ? "translateY(20px)" : "translateY(-10px)" }}
                >
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section id="shop" className="container py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sprout className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              The marketplace
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
              {cat !== "All" && ` in ${cat}`}
              {q && ` matching "${q}"`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 -mx-1 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  const np = new URLSearchParams(params);
                  if (c === "All") np.delete("cat"); else np.set("cat", c);
                  setParams(np);
                }}
                className={`shrink-0 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border-2 transition-smooth ${
                  cat === c
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <CardGridSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 md:py-20 rounded-2xl bg-card border-2 border-dashed border-border">
            <p className="text-muted-foreground">No products found. Try another category or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 animate-fade-in">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Shell>
  );
}
