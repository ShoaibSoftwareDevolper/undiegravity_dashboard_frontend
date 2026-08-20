import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { getCurrentUser } from "@/lib/backend";
import { DashboardShell } from "@/features/layout/DashboardShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const logoFont = Syne({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UndieGravity Admin Dashboard",
  description: "Management portal for UndieGravity UI component library.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${logoFont.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-full bg-surface-muted text-text font-sans" suppressHydrationWarning>
        <DashboardShell user={user}>{children}</DashboardShell>
      </body>
    </html>
  );
}
