import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NASA Data Explorer",
  description: "Explore NASA datasets with interactive visualizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

