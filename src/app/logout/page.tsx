"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("tangoline_user");
      } catch {
        // Still return home if the request fails.
      }
      router.replace("/");
    })();
  }, [router]);

  return (
    <main
      style={{
        background: "#060606",
        color: "#fff",
        fontFamily: "sans-serif",
        textAlign: "center",
        paddingTop: 100,
        minHeight: "100vh",
      }}
    >
      <p>Logging out, please wait...</p>
    </main>
  );
}
