import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ADMIN_COOKIE_NAME } from "@/lib/backend";
import { LogoutButton } from "@/features/auth/LogoutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "UndieGravity admin",
  description: "Manage UndieGravity component metadata.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has(ADMIN_COOKIE_NAME);

  return (
    <html lang="en" className="h-full antialiased" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-surface-muted text-text" suppressHydrationWarning>
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
            <Link href="/" className="text-sm font-semibold text-text">
              UndieGravity admin
            </Link>
            {isAuthenticated ? <LogoutButton /> : null}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
