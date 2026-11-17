import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSession } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up - Tangoline Inc.",
};

type SearchParams = Promise<{ redirect?: string }>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const target = safeRedirectPath(params.redirect);
  const session = await getSession();
  if (session) redirect(target);

  return <RegisterForm redirect={target} />;
}
