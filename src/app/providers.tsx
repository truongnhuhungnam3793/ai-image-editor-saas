"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={async () => {
        // Clear router cache (protected routes)
        router.refresh();

        // Check if the user is logged in and redirect to dashboard
        try {
          const session = await authClient.getSession();
          if (session.data?.user && typeof window !== "undefined") {
            const currentPath = window.location.pathname;

            // Only redirect if we are on an auth page
            if (currentPath.includes("/auth")) {
              router.push("/dashboard");
            }
          }
        } catch (error) {
          // Session check failed, user likely logged out
          console.error("Session check failed:", error);
        }
      }}
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  );
}
