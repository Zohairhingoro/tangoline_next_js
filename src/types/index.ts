export type SessionRole = "customer" | "admin";

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  role: SessionRole;
};

/** Serialized product passed to client components / stored in the cart. */
export type StoreProduct = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  brand: string;
  platform: string;
  price: number;
  originalPrice: number | null;
  shortDescription: string;
  description: string;
  specifications: string | null;
  systemRequirements: string | null;
  image: string;
  docxUrl: string;
  stockStatus: "in_stock" | "out_of_stock";
  categoryName: string;
  categorySlug: string;
};

export type CartItem = {
  id: number;
  title: string;
  price: string;
  rawPrice: number;
  image: string;
  brand: string;
  desc: string;
  docx: string;
  qty: number;
};

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  notes: string;
  items: Array<{ id: number; qty: number }>;
};

export type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

export type CustomerOrderSummary = {
  id: number;
  orderNumber: string;
  createdAt: string;
  itemCount: number;
  total: number;
  paymentMethod: string;
  status: string;
};

export type ProfilePageData = {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  memberSince: string;
  orders: CustomerOrderSummary[];
};
