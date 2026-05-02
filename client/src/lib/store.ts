// localStorage-backed data store with cross-tab + same-tab event sync.
import type {
  User, Product, Order, Review, SupportTicket, PlatformLog, CartItem
} from "./types";

const KEYS = {
  users: "aislemind:users",
  session: "aislemind:session",
  products: "aislemind:products",
  orders: "aislemind:orders",
  reviews: "aislemind:reviews",
  tickets: "aislemind:tickets",
  logs: "aislemind:logs",
  cart: "aislemind:cart",
  otp: "aislemind:otp",
  seeded: "aislemind:seeded:v2",
} as const;

type Key = typeof KEYS[keyof typeof KEYS];

const CHANNEL = "aislemind:changed";

function read<T>(key: Key, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: Key, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { key } }));
}

export const store = {
  // generic
  read, write, KEYS,

  // users
  getUsers: (): User[] => read(KEYS.users, []),
  setUsers: (u: User[]) => write(KEYS.users, u),
  upsertUser(u: User) {
    const list = store.getUsers();
    const i = list.findIndex(x => x.id === u.id);
    if (i >= 0) list[i] = u; else list.push(u);
    store.setUsers(list);
  },

  // session
  getSession: (): { userId: string } | null => read(KEYS.session, null),
  setSession: (s: { userId: string } | null) => write(KEYS.session, s),

  // products
  getProducts: (): Product[] => read(KEYS.products, []),
  setProducts: (p: Product[]) => write(KEYS.products, p),

  // orders
  getOrders: (): Order[] => read(KEYS.orders, []),
  setOrders: (o: Order[]) => write(KEYS.orders, o),

  // reviews
  getReviews: (): Review[] => read(KEYS.reviews, []),
  setReviews: (r: Review[]) => write(KEYS.reviews, r),

  // tickets
  getTickets: (): SupportTicket[] => read(KEYS.tickets, []),
  setTickets: (t: SupportTicket[]) => write(KEYS.tickets, t),

  // logs
  getLogs: (): PlatformLog[] => read(KEYS.logs, []),
  setLogs: (l: PlatformLog[]) => write(KEYS.logs, l),
  addLog(l: Omit<PlatformLog, "id" | "createdAt">) {
    const logs = store.getLogs();
    logs.unshift({ ...l, id: uid("log"), createdAt: Date.now() });
    store.setLogs(logs);
  },

  // cart (per user)
  getCart: (userId: string): CartItem[] => {
    const all = read<Record<string, CartItem[]>>(KEYS.cart, {});
    return all[userId] || [];
  },
  setCart: (userId: string, items: CartItem[]) => {
    const all = read<Record<string, CartItem[]>>(KEYS.cart, {});
    all[userId] = items;
    write(KEYS.cart, all);
  },
};

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(CHANNEL, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANNEL, handler);
    window.removeEventListener("storage", handler);
  };
}
