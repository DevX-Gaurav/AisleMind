import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { store, subscribe, uid } from "@/lib/store";
import type {
  User, Product, Order, Review, SupportTicket, PlatformLog,
  CartItem, Address, OrderItem, OrderStatus, Role, PaymentMethod, ReturnStatus
} from "@/lib/types";
import { seedIfEmpty } from "@/lib/seed";
import { toast } from "sonner";

interface AppContextValue {
  // session
  user: User | null;
  users: User[];
  signup: (input: { name: string; email: string; password: string; role: Role; storeName?: string }) => User | null;
  loginWithCredentials: (email: string, password: string) => User | null;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  resetPassword: (email: string, newPassword: string) => boolean;

  // catalog
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "vendorId" | "vendorName" | "createdAt" | "rating" | "reviewCount">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // orders
  orders: Order[];
  placeOrder: (address: Address, paymentMethod: PaymentMethod, paymentDetails?: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  cancelOrder: (orderId: string, by: "customer" | "vendor", reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  updateReturnStatus: (orderId: string, status: ReturnStatus) => void;

  // reviews
  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "createdAt" | "customerId" | "customerName">) => void;

  // tickets
  tickets: SupportTicket[];
  submitTicket: (subject: string, message: string) => void;
  resolveTicket: (id: string) => void;

  // logs / users (admin)
  logs: PlatformLog[];
  approveVendor: (id: string) => void;
  suspendVendor: (id: string, reason: string) => void;
  deleteVendor: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  // Initial seed
  useEffect(() => { seedIfEmpty(); refresh(); }, [refresh]);

  // Cross-tab + same-tab sync
  useEffect(() => subscribe(refresh), [refresh]);

  const session = store.getSession();
  const users = store.getUsers();
  const user = users.find(u => u.id === session?.userId) ?? null;
  const products = store.getProducts();
  const allOrders = store.getOrders();
  const reviews = store.getReviews();
  const tickets = store.getTickets();
  const logs = store.getLogs();
  const cart = user ? store.getCart(user.id) : [];

  // Visible orders depend on role
  const orders = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return allOrders;
    if (user.role === "vendor") {
      return allOrders.filter(o => o.items.some(i => i.vendorId === user.id));
    }
    return allOrders.filter(o => o.customerId === user.id);
  }, [allOrders, user]);

  // ---- session
  const signup: AppContextValue["signup"] = ({ name, email, password, role, storeName }) => {
    const existing = store.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) { toast.error("Email already registered"); return null; }
    const id = uid("user");
    const newUser: User = {
      id, name, email, password, role, storeName,
      status: role === "vendor" ? "pending" : "active",
      createdAt: Date.now(),
    };
    store.upsertUser(newUser);
    store.setSession({ userId: id });
    toast.success(`Welcome, ₹{name}!`);
    return newUser;
  };
  const loginWithCredentials: AppContextValue["loginWithCredentials"] = (email, password) => {
    const target = store.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!target) { toast.error("No account with this email"); return null; }
    if (target.password && target.password !== password) { toast.error("Incorrect password"); return null; }
    store.setSession({ userId: target.id });
    return target;
  };
  const login = (userId: string) => { store.setSession({ userId }); };
  const logout = () => { store.setSession(null); toast("Signed out"); };
  const switchRole = (role: Role) => {
    // demo helper: jump into a seeded persona by role
    const target = store.getUsers().find(u => u.role === role && u.status !== "suspended");
    if (target) { store.setSession({ userId: target.id }); toast.success(`Now viewing as ${role}`); }
  };
  const resetPassword: AppContextValue["resetPassword"] = (email, newPassword) => {
    const list = store.getUsers();
    const i = list.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (i < 0) return false;
    list[i] = { ...list[i], password: newPassword };
    store.setUsers(list);
    return true;
  };

  // ---- products
  const addProduct: AppContextValue["addProduct"] = (p) => {
    if (!user || user.role !== "vendor") return;
    const list = store.getProducts();
    list.unshift({
      ...p,
      id: uid("prod"),
      vendorId: user.id,
      vendorName: user.storeName || user.name,
      rating: 0, reviewCount: 0,
      createdAt: Date.now(),
    });
    store.setProducts(list);
    toast.success("Product added");
  };
  const updateProduct = (id: string, patch: Partial<Product>) => {
    const list = store.getProducts().map(p => p.id === id ? { ...p, ...patch } : p);
    store.setProducts(list);
  };
  const deleteProduct = (id: string) => {
    store.setProducts(store.getProducts().filter(p => p.id !== id));
    toast("Product removed");
  };

  // ---- cart
  const addToCart: AppContextValue["addToCart"] = (item) => {
    if (!user) { toast.error("Please sign in to add items"); return; }
    const items = store.getCart(user.id);
    const i = items.findIndex(x => x.productId === item.productId && x.color === item.color && x.size === item.size);
    if (i >= 0) items[i].qty += item.qty; else items.push(item);
    store.setCart(user.id, items);
    toast.success("Added to cart");
  };
  const updateCartQty = (productId: string, qty: number) => {
    if (!user) return;
    const items = store.getCart(user.id).map(i => i.productId === productId ? { ...i, qty } : i);
    store.setCart(user.id, items);
  };
  const removeFromCart = (productId: string) => {
    if (!user) return;
    store.setCart(user.id, store.getCart(user.id).filter(i => i.productId !== productId));
  };
  const clearCart = () => { if (user) store.setCart(user.id, []); };

  // ---- orders
  const placeOrder: AppContextValue["placeOrder"] = (address, paymentMethod, paymentDetails) => {
    if (!user || user.role !== "customer") { toast.error("Sign in as a customer"); return null; }
    const items = store.getCart(user.id);
    if (!items.length) { toast.error("Your cart is empty"); return null; }
    const prods = store.getProducts();
    const orderItems: OrderItem[] = items.map(ci => {
      const p = prods.find(x => x.id === ci.productId)!;
      const finalPrice = p.discount ? p.price * (1 - p.discount / 100) : p.price;
      return {
        productId: p.id, name: p.name, image: p.image,
        price: Math.round(finalPrice * 100) / 100,
        qty: ci.qty, vendorId: p.vendorId, vendorName: p.vendorName,
        color: ci.color, size: ci.size,
      };
    });
    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;
    const order: Order = {
      id: uid("ord"),
      customerId: user.id,
      customerName: user.name,
      items: orderItems,
      address: { ...address, fullName: user.name },
      subtotal, tax, shipping, total,
      status: "Placed",
      timeline: [{ status: "Placed", at: Date.now() }],
      paymentMethod,
      paymentDetails,
      createdAt: Date.now(),
    };
    const updatedProds = prods.map(p => {
      const cartItem = items.find(i => i.productId === p.id);
      return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.qty) } : p;
    });
    store.setProducts(updatedProds);
    store.setOrders([order, ...store.getOrders()]);
    store.setCart(user.id, []);
    toast.success("Order placed!");
    return order;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, _reason?: string) => {
    const list = store.getOrders().map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o, status,
        timeline: [...o.timeline, { status, at: Date.now() }],
      };
    });
    store.setOrders(list);
    toast.success(`Order ₹{status}`);
  };

  const cancelOrder: AppContextValue["cancelOrder"] = (orderId, by, reason) => {
    const list = store.getOrders().map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: "Cancelled" as const,
        cancellation: { by, reason, at: Date.now() },
        timeline: [...o.timeline, { status: "Cancelled" as const, at: Date.now(), note: reason }],
      };
    });
    store.setOrders(list);
    store.addLog({ type: "cancellation", actor: by, target: orderId, reason, fromRole:user?.role });
    toast("Order cancelled");
  };

  const requestReturn: AppContextValue["requestReturn"] = (orderId, reason) => {
    const list = store.getOrders().map(o => o.id === orderId
      ? { ...o, returnRequest: { reason, requestedAt: Date.now(), status: "pending" as const } }
      : o);
    store.setOrders(list);
    store.addLog({ type: "return", actor: user?.name || "customer", target: orderId, reason ,fromRole:user?.role});
    toast.success("Return requested");
  };

  const updateReturnStatus: AppContextValue["updateReturnStatus"] = (orderId, status) => {
    const list = store.getOrders().map(o => o.id === orderId && o.returnRequest
      ? { ...o, returnRequest: { ...o.returnRequest, status } }
      : o);
    store.setOrders(list);
    toast.success(`Return marked ₹{status}`);
  };

  // ---- reviews
  const addReview: AppContextValue["addReview"] = (r) => {
    if (!user) return;
    const review: Review = {
      ...r, id: uid("rev"),
      customerId: user.id, customerName: user.name, createdAt: Date.now(),
    };
    store.setReviews([review, ...store.getReviews()]);
    // recompute rating
    const productReviews = [review, ...store.getReviews().filter(x => x.productId === r.productId)];
    const avg = productReviews.reduce((s, x) => s + x.rating, 0) / productReviews.length;
    updateProduct(r.productId, { rating: Math.round(avg * 10) / 10, reviewCount: productReviews.length });
    toast.success("Review posted");
  };

  // ---- tickets
  const submitTicket: AppContextValue["submitTicket"] = (subject, message) => {
    if (!user) return;
    const t: SupportTicket = {
      id: uid("tkt"), fromId: user.id, fromName: user.name, fromRole: user.role,
      subject, message, status: "open", createdAt: Date.now(),
    };
    store.setTickets([t, ...store.getTickets()]);
    toast.success("Support ticket submitted");
  };
  const resolveTicket = (id: string) => {
    const list = store.getTickets().map(t => t.id === id
      ? { ...t, status: "resolved" as const, resolvedAt: Date.now() } : t);
    store.setTickets(list);
  };

  // ---- admin moderation
  const approveVendor = (id: string) => {
    const list = store.getUsers().map(u => u.id === id ? { ...u, status: "active" as const } : u);
    store.setUsers(list);
    toast.success("Vendor approved");
  };
  const suspendVendor = (id: string, reason: string) => {
    const list = store.getUsers().map(u => u.id === id
      ? { ...u, status: "suspended" as const, suspensionReason: reason } : u);
    store.setUsers(list);
    store.addLog({ type: "suspension", actor: "admin", target: id, reason, fromRole:user?.role });
    toast("Vendor suspended");
  };
  const deleteVendor = (id: string) => {
    store.setUsers(store.getUsers().filter(u => u.id !== id));
    store.setProducts(store.getProducts().filter(p => p.vendorId !== id));
    toast("Vendor removed");
  };

  const value: AppContextValue = {
    user, users, signup, loginWithCredentials, login, logout, switchRole, resetPassword,
    products, addProduct, updateProduct, deleteProduct,
    cart, addToCart, updateCartQty, removeFromCart, clearCart,
    orders, placeOrder, updateOrderStatus, cancelOrder, requestReturn, updateReturnStatus,
    reviews, addReview,
    tickets, submitTicket, resolveTicket,
    logs, approveVendor, suspendVendor, deleteVendor,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
