import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Architects_Daughter } from "next/font/google";

export const metadata: Metadata = {
  title: "AI Image Editor SaaS App",
  description: "AI Image Editor SaaS App",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const architectsDaughter = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-architects-daughter-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${architectsDaughter.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
