import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search, ShoppingBag, ChevronDown, Sprout, User as UserIcon,
  LogOut, Store, Shield, LayoutGrid, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_TREE: { name: Category; subs: string[] }[] = [
  { name: "Electronics", subs: ["Audio", "Wearables", "Mobile", "Laptops"] },
  { name: "Fashion", subs: ["Shirts", "Knitwear", "Outerwear", "Tees"] },
  { name: "Footwear", subs: ["Boots", "Sneakers", "Loafers", "Sandals"] },
  { name: "Home", subs: ["Kitchen", "Decor", "Textiles", "Candles"] },
  { name: "Beauty", subs: ["Skincare", "Bath", "Hair", "Fragrance"] },
];

export default function Navbar() {
  const { user, cart, logout, switchRole } = useApp();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-16 md:h-20 items-center gap-3 md:gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-elegant transition-transform group-hover:scale-105">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg md:text-2xl font-bold tracking-tight text-primary">
            Aislemind
          </span>
        </Link>

        {/* Desktop center: Categories + Search */}
        <div className="hidden lg:flex flex-1 items-center gap-2 max-w-3xl mx-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 rounded-xl gap-2 px-4 font-medium shrink-0 border-2">
                <LayoutGrid className="h-4 w-4" />
                <span>Categories</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 rounded-xl border-2 shadow-elegant p-2">
              <DropdownMenuLabel className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
                Shop by category
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CATEGORY_TREE.map((cat) => (
                <DropdownMenuGroup key={cat.name}>
                  <DropdownMenuItem asChild className="rounded-lg font-semibold text-sm py-2.5 px-3 cursor-pointer focus:bg-primary-soft focus:text-primary">
                    <Link to={`/?cat=${cat.name}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                  <div className="grid grid-cols-2 gap-1 px-2 pb-1.5">
                    {cat.subs.map((s) => (
                      <Link key={s} to={`/?cat=${cat.name}&sub=${s}`}
                        className="text-xs text-muted-foreground hover:text-primary hover:bg-primary-soft rounded-md px-2 py-1 transition-smooth">
                        {s}
                      </Link>
                    ))}
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <form onSubmit={onSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the marketplace…"
              className="h-12 pl-11 pr-4 rounded-xl border-2 bg-card/60 focus-visible:ring-primary/30 text-sm"
            />
          </form>
        </div>

        {/* Spacer for tablet */}
        <div className="flex-1 lg:hidden" />

        {/* Right: cart + user (desktop) / icons (mobile) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Link
            to="/cart"
            className={cn(
              "relative inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl border-2 border-primary/15",
              "bg-card/60 hover:bg-primary-soft transition-smooth"
            )}
          >
            <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center px-1 shadow-soft">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Desktop user menu */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 h-12 px-2 pr-3 rounded-xl border-2 border-primary/15 bg-card/60 hover:bg-primary-soft transition-smooth">
                    <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:flex flex-col items-start leading-tight">
                      <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                      <span className="text-sm font-semibold text-foreground -mt-0.5">{user.name.split(" ")[0]}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl border-2 shadow-elegant p-2">
                  <DropdownMenuLabel>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "customer" && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link to="/orders"><UserIcon className="h-4 w-4 mr-2" /> My Orders</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "vendor" && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link to="/vendor"><Store className="h-4 w-4 mr-2" /> Vendor Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link to="/admin"><Shield className="h-4 w-4 mr-2" /> Admin Console</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-lg text-sm text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="hero" className="h-12 rounded-xl px-5">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/15 bg-card/60 hover:bg-primary-soft transition-smooth"
              >
                <Menu className="h-5 w-5 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88%] sm:w-96 p-0 flex flex-col">
              <SheetHeader className="p-5 border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" /> Aislemind
                </SheetTitle>
              </SheetHeader>

              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* Search */}
                <form onSubmit={onSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search…"
                    className="h-11 pl-11 pr-4 rounded-xl border-2 bg-card/60 text-sm"
                  />
                </form>

                {/* User block */}
                {user ? (
                  <div className="rounded-xl border-2 border-border bg-card/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="leading-tight">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 mt-4">
                      {user.role === "customer" && (
                        <Button asChild variant="outline" className="justify-start" onClick={() => setMobileOpen(false)}>
                          <Link to="/orders"><UserIcon className="h-4 w-4 mr-2" /> My orders</Link>
                        </Button>
                      )}
                      {user.role === "vendor" && (
                        <Button asChild variant="outline" className="justify-start" onClick={() => setMobileOpen(false)}>
                          <Link to="/vendor"><Store className="h-4 w-4 mr-2" /> Vendor dashboard</Link>
                        </Button>
                      )}
                      {user.role === "admin" && (
                        <Button asChild variant="outline" className="justify-start" onClick={() => setMobileOpen(false)}>
                          <Link to="/admin"><Shield className="h-4 w-4 mr-2" /> Admin console</Link>
                        </Button>
                      )}
                      <Button variant="ghost" className="justify-start text-destructive" onClick={() => { logout(); setMobileOpen(false); }}>
                        <LogOut className="h-4 w-4 mr-2" /> Sign out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button asChild variant="hero" className="w-full" onClick={() => setMobileOpen(false)}>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                )}

                {/* Categories */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">Categories</p>
                  <div className="space-y-1">
                    <Link to="/" onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-primary-soft hover:text-primary">
                      All products
                    </Link>
                    {CATEGORY_TREE.map((cat) => (
                      <Link
                        key={cat.name}
                        to={`/?cat=${cat.name}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-primary-soft hover:text-primary"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">{cat.subs.length} subs</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Tablet/mobile search bar — visible md and below */}
      <div className="lg:hidden border-t border-border/40 bg-background/70">
        <div className="container py-2.5 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl gap-1.5 px-3 font-medium shrink-0 border-2">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Categories</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-xl border-2 shadow-elegant p-2">
              {CATEGORY_TREE.map((cat) => (
                <DropdownMenuItem key={cat.name} asChild className="rounded-lg font-medium cursor-pointer">
                  <Link to={`/?cat=${cat.name}`}>{cat.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <form onSubmit={onSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-10 pl-10 pr-3 rounded-xl border-2 bg-card/60 text-sm"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
