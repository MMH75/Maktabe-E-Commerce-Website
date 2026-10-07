"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setWishlisted, syncWishlist } from "@/app/wishlist/actions";

export type ProductInfo = {
  id: number;
  titleUr: string;
  titleEn: string;
  price: number; // what the customer pays (sale price when on sale)
  image: string;
  originalPrice?: number; // regular price, set only when on sale
  inStock?: boolean;
};

export type CartItem = ProductInfo & { qty: number };

/** Who is logged in, as far as the browser needs to know. */
export type StoreCustomer = { id: number; name: string } | null;

type StoreContextValue = {
  cart: CartItem[];
  wishlist: ProductInfo[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: ProductInfo, qty?: number) => void;
  removeFromCart: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clearCart: () => void;
  cartReady: boolean; // false until the saved cart is loaded from the browser
  toggleWishlist: (product: ProductInfo) => void;
  isWishlisted: (id: number) => boolean;
  wishlistReady: boolean;
  customer: StoreCustomer;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "mkq_cart_v1";
const WISH_KEY = "mkq_wishlist_v1";
// Which account the browser's wishlist belongs to ("" = guest)
const WISH_OWNER_KEY = "mkq_wishlist_owner_v1";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback; // corrupted or blocked storage
  }
}

/** Same cap the server uses at checkout (src/lib/checkout.ts). */
const MAX_QTY = 50;

/**
 * The saved cart can be old or edited by hand: keep only real-looking lines,
 * with whole quantities from 1 to MAX_QTY, one line per book.
 */
function cleanStoredCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map<number, CartItem>();
  for (const item of raw as Partial<CartItem>[]) {
    const id = Number(item?.id);
    const qty = Math.floor(Number(item?.qty));
    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(qty) || qty < 1) continue;
    if (typeof item.titleEn !== "string" || typeof item.image !== "string" || typeof item.price !== "number") continue;
    const prev = byId.get(id);
    byId.set(id, { ...(item as CartItem), id, qty: Math.min(MAX_QTY, (prev?.qty ?? 0) + qty) });
  }
  return [...byId.values()];
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage full or blocked — the site still works for this visit
  }
}

export function StoreProvider({
  children,
  customer,
}: {
  children: ReactNode;
  customer: StoreCustomer;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<ProductInfo[]>([]);
  const [wishlistReady, setWishlistReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const customerId = customer?.id ?? null;
  // Books the visitor un-hearted while the wishlist was being synced with the server
  const removedDuringSync = useRef<Set<number>>(new Set());

  // localStorage only exists in the browser, so saved data is loaded after the
  // first render; reading it during render would not match the server's HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setCart(cleanStoredCart(readJson<unknown>(CART_KEY, [])));
    setHydrated(true);
  }, []);

  // Load the wishlist, then bring it in line with the account (or fresh prices for guests)
  useEffect(() => {
    let cancelled = false;
    const owner = (() => {
      try {
        return localStorage.getItem(WISH_OWNER_KEY) ?? "";
      } catch {
        return "";
      }
    })();
    const me = customerId === null ? "" : String(customerId);
    // After logging out, or switching accounts, the old account's wishlist is not shown
    const local = owner && owner !== me ? [] : readJson<ProductInfo[]>(WISH_KEY, []);
    write(WISH_OWNER_KEY, me);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loaded from localStorage, as above
    setWishlist(local);

    const sent = new Set(local.map((p) => p.id));
    removedDuringSync.current = new Set();
    syncWishlist([...sent])
      .then(({ items }) => {
        if (cancelled) return;
        // Merge rather than replace: hearts clicked while this request was
        // running must not be lost.
        setWishlist((prev) => {
          const fresh = new Map(items.map((i) => [i.id, i]));
          const prevIds = new Set(prev.map((p) => p.id));
          // Keep what is on screen now; refresh it from the server. Drop books we
          // asked about that the server no longer knows (deleted books).
          const kept = prev
            .filter((p) => fresh.has(p.id) || !sent.has(p.id))
            .map((p) => fresh.get(p.id) ?? p);
          // Books saved on the account from another device — unless just removed here
          const added = items.filter((i) => !prevIds.has(i.id) && !removedDuringSync.current.has(i.id));
          return [...kept, ...added];
        });
      })
      .catch(() => {
        // offline or server error: keep what the browser had
      })
      .finally(() => {
        if (!cancelled) setWishlistReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  useEffect(() => {
    if (hydrated) write(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) write(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((product: ProductInfo, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i
        );
      }
      return [...prev, { ...product, qty: Math.min(MAX_QTY, qty) }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isWishlisted = useCallback(
    (id: number) => wishlist.some((i) => i.id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product: ProductInfo) => {
      const wished = !wishlist.some((i) => i.id === product.id);
      if (wished) removedDuringSync.current.delete(product.id);
      else removedDuringSync.current.add(product.id);
      setWishlist((prev) =>
        wished ? [...prev.filter((i) => i.id !== product.id), product] : prev.filter((i) => i.id !== product.id)
      );
      // Logged-in customers: also save to the account
      if (customerId !== null) setWishlisted(product.id, wished).catch(() => {});
    },
    [wishlist, customerId]
  );

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.qty * i.price, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      cartReady: hydrated,
      toggleWishlist,
      isWishlisted,
      wishlistReady,
      customer,
      cartOpen,
      setCartOpen,
    }),
    [
      cart,
      wishlist,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      hydrated,
      toggleWishlist,
      isWishlisted,
      wishlistReady,
      customer,
      cartOpen,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
