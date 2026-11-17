import { headers } from "next/headers";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { QuickViewModal } from "@/components/store/QuickViewModal";
import { StoreProvider } from "@/components/store/StoreProvider";
import { ToastViewport } from "@/components/store/ToastViewport";
import { getSession } from "@/lib/auth/session";
import { recordVisitor } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  const requestHeaders = await headers();
  const pageUrl =
    requestHeaders.get("x-invoke-path") ??
    requestHeaders.get("x-matched-path") ??
    "/";
  await recordVisitor(pageUrl);

  return (
    <StoreProvider>
      <Header user={user} />
      {children}
      <Footer />
      <QuickViewModal />
      <CartDrawer />
      <ToastViewport />
    </StoreProvider>
  );
}
