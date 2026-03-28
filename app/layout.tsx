import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Race Condition Lab — Flash Sale",
  description: "TOCTOU Security Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
