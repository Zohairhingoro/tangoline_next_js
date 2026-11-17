"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { formatPrice } from "@/lib/utils";
import type { CartItem, StoreProduct } from "@/types";

type ToastType = "success" | "danger" | "info" | "warning";
type Toast = { id: number; message: string; type: ToastType };

type StoreContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: StoreProduct, qty?: number) => void;
  updateQty: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  quickView: StoreProduct | null;
  openQuickView: (product: StoreProduct) => void;
  closeQuickView: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const STORAGE_KEY = "tangoline_cart";
const EMPTY_ITEMS: CartItem[] = [];

let cartItems: CartItem[] = EMPTY_ITEMS;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) cartItems = JSON.parse(saved) as CartItem[];
  } catch {
    // Ignore malformed local data.
  }
}

function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getCartSnapshot(): CartItem[] {
  return cartItems;
}

function getServerCartSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

function setCart(next: CartItem[]): void {
  cartItems = next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Storage may be disabled; in-memory cart still works.
  }
  listeners.forEach((listener) => listener());
}

function toCartItem(product: StoreProduct, qty: number): CartItem {
  return {
    id: product.id,
    title: product.name,
    price: formatPrice(product.price),
    rawPrice: product.price,
    image: product.image,
    brand: product.brand,
    desc: product.shortDescription || product.description,
    docx: product.docxUrl,
    qty,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<StoreProduct | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "danger") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addItem = useCallback(
    (product: StoreProduct, qty = 1) => {
      const existing = cartItems.find((item) => item.id === product.id);
      const next = existing
        ? cartItems.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + qty } : item,
          )
        : [...cartItems, toCartItem(product, qty)];
      setCart(next);
      showToast(`Added ${qty}x "${product.name}" to your cart!`, "success");
    },
    [showToast],
  );

  const removeItem = useCallback(
    (id: number) => {
      const removed = cartItems.find((item) => item.id === id);
      setCart(cartItems.filter((item) => item.id !== id));
      if (removed) showToast(`Removed "${removed.title}" from cart.`, "info");
    },
    [showToast],
  );

  const updateQty = useCallback(
    (id: number, qty: number) => {
      if (qty <= 0) {
        removeItem(id);
        return;
      }
      setCart(cartItems.map((item) => (item.id === id ? { ...item, qty } : item)));
    },
    [removeItem],
  );

  const clear = useCallback(() => setCart([]), []);

  const count = useMemo(
    () => items.reduce((total, item) => total + Number(item.qty || 1), 0),
    [items],
  );
  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + Number(item.rawPrice || 0) * Number(item.qty || 1),
        0,
      ),
    [items],
  );

  const value: StoreContextValue = {
    items,
    count,
    subtotal,
    addItem,
    updateQty,
    removeItem,
    clear,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    quickView,
    openQuickView: (product) => setQuickView(product),
    closeQuickView: () => setQuickView(null),
    toasts,
    showToast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
