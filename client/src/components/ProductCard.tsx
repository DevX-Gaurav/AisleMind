import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { useApp } from "@/context/AppContext";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useApp();
  const outOfStock = product.stock <= 0;
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover:shadow-elegant hover:border-primary/30 transition-smooth h-full">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden aspect-square bg-secondary/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            outOfStock && "grayscale opacity-70"
          )}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        {product.discount && !outOfStock && (
          <span className="absolute top-3 left-3 rounded-full bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-1 shadow-soft">
            −{product.discount}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 backdrop-blur-[2px]">
            <span className="rounded-full bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider px-4 py-1.5 shadow-elegant">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-1.5 sm:gap-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-sm sm:text-base leading-tight text-foreground hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <StarRating value={product.rating} count={product.reviewCount} />

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1 hidden sm:block">
          {product.description}
        </p>

        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div className="flex flex-col min-w-0">
            {outOfStock ? (
              <span className="text-xs sm:text-sm font-bold text-destructive uppercase tracking-wide">
                Out of stock
              </span>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-primary">₹{finalPrice.toFixed(2)}</span>
                  {product.discount && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-through">₹{product.price.toFixed(2)}</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground truncate">by {product.vendorName}</span>
              </>
            )}
          </div>
          <Button
            size="sm"
            disabled={outOfStock}
            onClick={() => addToCart({ productId: product.id, qty: 1 })}
            className="rounded-lg shrink-0 h-8 px-2 sm:h-9 sm:px-3"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
