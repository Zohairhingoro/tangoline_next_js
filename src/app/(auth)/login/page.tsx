import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login - Tangoline Inc.",
};

type SearchParams = Promise<{ redirect?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const target = safeRedirectPath(params.redirect);
  const session = await getSession();
  if (session) redirect(target);

  return <LoginForm redirect={target} />;
}
