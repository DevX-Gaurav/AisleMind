import { store, uid } from "./store";
import type { User, Product } from "./types";

const IMG = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=800&q=80&sig=${seed}`;

// Curated Unsplash photos chosen for each category — stable IDs.
const PRODUCT_SEED: Omit<
  Product,
  "id" | "vendorId" | "vendorName" | "createdAt"
>[] = [
  // Electronics
  {
    name: "Aurora Wireless Headphones",
    description:
      "Over-ear ANC headphones with 40h battery and warm tonal balance for long sessions.",
    category: "Electronics",
    price: 189,
    discount: 15,
    stock: 24,
    rating: 4.7,
    reviewCount: 128,
    image: IMG("1505740420928-5e560c06d30e", 1),
    specs: {
      colors: ["Forest", "Cream", "Black"],
      subcategory: "Audio",
      specifications: "Bluetooth 5.3 · ANC · 40mm drivers · USB-C",
    },
  },
  {
    name: "Verdant Smartwatch S2",
    description:
      "Linen-strap smartwatch with health tracking, GPS and a calm low-glare display.",
    category: "Electronics",
    price: 249,
    discount: 10,
    stock: 12,
    rating: 4.5,
    reviewCount: 86,
    image: IMG("1523275335684-37898b6baf30", 2),
    specs: {
      colors: ["Olive", "Sand"],
      subcategory: "Wearables",
      specifications: "AMOLED · GPS · 7d battery · 5ATM",
    },
  },
  {
    name: "Glade Pro Earbuds",
    description:
      "Open-fit earbuds with crystal call quality and a tactile rotating case.",
    category: "Electronics",
    price: 129,
    stock: 0,
    rating: 4.3,
    reviewCount: 54,
    image: IMG("1572569511254-d8f925fe2cbb", 3),
    specs: {
      colors: ["Cream", "Forest"],
      subcategory: "Audio",
      specifications: "Open-fit · IPX4 · 30h case battery",
    },
  },
  {
    name: "Meadow Phone 12",
    description:
      'Flagship smartphone with a soft-matte recycled aluminium body and 6.3" OLED.',
    category: "Electronics",
    price: 899,
    discount: 5,
    stock: 8,
    rating: 4.6,
    reviewCount: 212,
    image: IMG("1511707171634-5f897ff02aa9", 4),
    specs: {
      colors: ["Forest", "Graphite"],
      subcategory: "Mobile",
      specifications: '6.3" OLED · 256GB · 5G · Triple camera',
    },
  },

  // Fashion
  {
    name: "Linen Field Shirt",
    description:
      "Hand-loomed European linen shirt in a relaxed cut, made for slow weekends.",
    category: "Fashion",
    price: 78,
    stock: 32,
    rating: 4.8,
    reviewCount: 94,
    image: IMG("1521572163474-6864f9cf17ab", 5),
    specs: {
      colors: ["Cream", "Sage"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      specifications: "100% European linen · Coconut buttons",
    },
  },
  {
    name: "Heritage Wool Cardigan",
    description:
      "Chunky knit cardigan in undyed merino. Soft, warm and built to last decades.",
    category: "Fashion",
    price: 156,
    discount: 20,
    stock: 18,
    rating: 4.9,
    reviewCount: 71,
    image: IMG("1434389677669-e08b4cac3105", 6),
    specs: {
      colors: ["Oat", "Forest"],
      sizes: ["S", "M", "L", "XL"],
      specifications: "100% merino · Hand-finished · Bone buttons",
    },
  },
  {
    name: "Workshop Denim Jacket",
    description:
      "Selvedge denim trucker, washed once for an honest, lived-in handfeel.",
    category: "Fashion",
    price: 142,
    stock: 0,
    rating: 4.4,
    reviewCount: 38,
    image: IMG("1551028719-00167b16eac5", 7),
    specs: {
      colors: ["Indigo"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      specifications: "13.5oz selvedge · Triple-stitched seams",
    },
  },
  {
    name: "Roaming Cotton Tee",
    description:
      "Heavyweight organic cotton tee with a structured collar that holds its shape.",
    category: "Fashion",
    price: 38,
    discount: 10,
    stock: 60,
    rating: 4.5,
    reviewCount: 142,
    image: IMG("1521572163474-6864f9cf17ab", 8),
    specs: {
      colors: ["Cream", "Forest", "Black"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      specifications: "240gsm organic cotton · GOTS certified",
    },
  },

  // Footwear
  {
    name: "Pathfinder Trail Boot",
    description:
      "Vibram-soled trail boot with full-grain leather and a felted wool lining.",
    category: "Footwear",
    price: 215,
    discount: 15,
    stock: 14,
    rating: 4.7,
    reviewCount: 64,
    image: IMG("1542291026-7eec264c27ff", 9),
    specs: {
      colors: ["Tan", "Forest"],
      sizes: ["8", "9", "10", "11", "12"],
      specifications: "Vibram outsole · Goodyear welt · Waterproof",
    },
  },
  {
    name: "Glade Runner",
    description:
      "Lightweight everyday trainer with a knit upper and a recycled foam midsole.",
    category: "Footwear",
    price: 128,
    stock: 22,
    rating: 4.4,
    reviewCount: 88,
    image: IMG("1595950653106-6c9ebd614d3a", 10),
    specs: {
      colors: ["Cream", "Sage", "Black"],
      sizes: ["7", "8", "9", "10", "11"],
      specifications: "Recycled knit upper · Cushion foam · Vegan",
    },
  },
  {
    name: "Atelier Loafer",
    description:
      "Hand-stitched suede loafer for warm afternoons and quiet city evenings.",
    category: "Footwear",
    price: 168,
    stock: 0,
    rating: 4.6,
    reviewCount: 47,
    image: IMG("1449505278894-297fdb3edbc1", 11),
    specs: {
      colors: ["Camel", "Forest"],
      sizes: ["8", "9", "10", "11"],
      specifications: "Italian suede · Leather sole · Hand-stitched",
    },
  },
  {
    name: "Cloudwalk Sandal",
    description:
      "Contoured cork footbed sandal with a buttery vegetable-tanned leather strap.",
    category: "Footwear",
    price: 92,
    discount: 10,
    stock: 28,
    rating: 4.3,
    reviewCount: 51,
    image: IMG("1603487742131-4160ec999306", 12),
    specs: {
      colors: ["Tan", "Black"],
      sizes: ["7", "8", "9", "10", "11"],
      specifications: "Cork footbed · Veg-tan leather · Replaceable sole",
    },
  },

  // Home
  {
    name: "Hand-thrown Stoneware Bowl",
    description:
      "Wheel-thrown stoneware bowl glazed in soft sage. Each piece is one of a kind.",
    category: "Home",
    price: 42,
    stock: 36,
    rating: 4.8,
    reviewCount: 119,
    image: IMG("1556909114-f6e7ad7d3136", 13),
    specs: {
      colors: ["Sage", "Cream"],
      specifications: "Stoneware · Dishwasher safe · Lead-free glaze",
    },
  },
  {
    name: "Cedar Cutting Board",
    description:
      "End-grain cedar board with a milled juice groove and oiled handle inset.",
    category: "Home",
    price: 68,
    stock: 19,
    rating: 4.6,
    reviewCount: 73,
    image: IMG("1556910103-1c02745aae4d", 14),
    specs: { specifications: "End-grain cedar · 18×12in · Hand-oiled finish" },
  },
  {
    name: "Linen Throw Blanket",
    description:
      "Stonewashed linen throw with hand-knotted fringe — drapes beautifully on chairs.",
    category: "Home",
    price: 118,
    discount: 20,
    stock: 24,
    rating: 4.7,
    reviewCount: 92,
    image: IMG("1493663284031-b7e3aefcae8e", 15),
    specs: {
      colors: ["Oat", "Forest", "Clay"],
      specifications: "100% French linen · 130×180cm · Cold wash",
    },
  },
  {
    name: "Forest Soy Candle",
    description:
      "Hand-poured soy candle with notes of cedar, moss and dry pine resin.",
    category: "Home",
    price: 32,
    stock: 0,
    rating: 4.5,
    reviewCount: 156,
    image: IMG("1602874801007-aa5d4f5f9d3e", 16),
    specs: { specifications: "Soy wax · Cotton wick · 60h burn time" },
  },

  // Beauty
  {
    name: "Botanic Face Serum",
    description:
      "Cold-pressed sea buckthorn serum that brightens and softens overnight.",
    category: "Beauty",
    price: 58,
    discount: 10,
    stock: 40,
    rating: 4.6,
    reviewCount: 204,
    image: IMG("1556228720-195a672e8a03", 17),
    specs: { specifications: "30ml · Vegan · Cruelty-free · Glass bottle" },
  },
  {
    name: "Cedar Beard Oil",
    description:
      "Lightweight beard oil with cedar, juniper and a whisper of bergamot.",
    category: "Beauty",
    price: 28,
    stock: 52,
    rating: 4.5,
    reviewCount: 88,
    image: IMG("1583241800698-9c2e94b9c0c1", 18),
    specs: { specifications: "50ml · Argan + jojoba base" },
  },
  {
    name: "Wildflower Bath Salts",
    description:
      "Mineral bath salts blended with foraged chamomile and lavender buds.",
    category: "Beauty",
    price: 24,
    stock: 0,
    rating: 4.4,
    reviewCount: 67,
    image: IMG("1571781926291-c477ebfd024b", 19),
    specs: { specifications: "500g · Epsom + Himalayan blend" },
  },
  {
    name: "Honeycomb Hand Cream",
    description:
      "Rich honey and shea hand cream that absorbs without leaving residue.",
    category: "Beauty",
    price: 22,
    discount: 15,
    stock: 64,
    rating: 4.7,
    reviewCount: 178,
    image: IMG("1570194065650-d99fb4b8ccb9", 20),
    specs: { specifications: "75ml · Beeswax + shea butter" },
  },
  {
    name: "Rosehip Lip Balm Trio",
    description:
      "Three nourishing balms — rosehip, beeswax, and tinted forest berry.",
    category: "Beauty",
    price: 18,
    stock: 88,
    rating: 4.6,
    reviewCount: 233,
    image: IMG("1599733589046-833caccbbd03", 21),
    specs: { specifications: "3×10ml · Natural ingredients" },
  },
];

export function seedIfEmpty() {
  if (localStorage.getItem(store.KEYS.seeded)) return;

  const users: User[] = [
    {
      id: "user_admin",
      name: "Admin",
      email: "chakravartysawvik208@gmail.com",
      password: "123456789",
      role: "admin",
      status: "active",
      createdAt: Date.now(),
    },
    {
      id: "user_v1",
      name: "Souvik vendor",
      email: "souvikc919@gmail.com",
      password: "123456789",
      role: "vendor",
      storeName: "Greenfield Co.",
      status: "active",
      createdAt: Date.now(),
    },
    {
      id: "user_v2",
      name: "Theo Pradeep",
      email: "theo@atelierwest.co",
      password: "Vendor@123",
      role: "vendor",
      storeName: "Atelier West",
      status: "active",
      createdAt: Date.now(),
    },
    {
      id: "user_v3",
      name: "Ines Okafor",
      email: "ines@meadowmade.co",
      password: "Vendor@123",
      role: "vendor",
      storeName: "Meadowmade",
      status: "pending",
      createdAt: Date.now(),
    },
    {
      id: "user_c1",
      name: "Anika Reyes",
      email: "anika@example.com",
      password: "Customer@123",
      role: "customer",
      status: "active",
      createdAt: Date.now(),
    },
    {
      id: "user_c2",
      name: "Jonas Albrecht",
      email: "jonas@example.com",
      password: "Customer@123",
      role: "customer",
      status: "active",
      createdAt: Date.now(),
    },
  ];

  const vendorIds = ["user_v1", "user_v2"];
  const products: Product[] = PRODUCT_SEED.map((p, idx) => {
    const vendor = users.find(
      (u) => u.id === vendorIds[idx % vendorIds.length],
    )!;
    return {
      ...p,
      id: uid("prod"),
      vendorId: vendor.id,
      vendorName: vendor.storeName || vendor.name,
      createdAt: Date.now() - idx * 86400000,
    };
  });

  store.setUsers(users);
  store.setProducts(products);
  localStorage.setItem(store.KEYS.seeded, "1");
}
