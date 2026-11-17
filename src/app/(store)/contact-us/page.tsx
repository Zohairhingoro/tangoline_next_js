import type { Metadata } from "next";
import { ContactForm } from "@/components/store/ContactForm";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us - Tangoline Inc.",
};

export default async function ContactUsPage() {
  const user = await getSession();
  return (
    <main className="container mb-5">
      <ContactForm user={user} />
    </main>
  );
}
