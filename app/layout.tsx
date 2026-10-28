import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComplyK | Industrial compliance",
  description: "Track industrial compliance records, deadlines, inspections, and corrective actions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
