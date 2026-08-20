"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import type { UserRecord } from "@/lib/types";

interface TopHeaderProps {
  onOpenSidebar: () => void;
  user: UserRecord;
}

const BREADCRUMB_LABELS: Record<string, string> = {
  "/components/new": "New Component",
  "/users": "Users",
  "/users/new": "New User",
  "/roles": "Roles",
  "/roles/new": "New Role",
  "/settings": "Settings",
};

export function TopHeader({ onOpenSidebar, user }: TopHeaderProps) {
  const pathname = usePathname();
  const canManageComponents = hasPermission(user, "components.manage");

  function getBreadcrumbs() {
    const label = pathname.includes("/edit")
      ? pathname.startsWith("/users")
        ? "Edit User"
        : pathname.startsWith("/roles")
          ? "Edit Role"
          : "Edit Component"
      : BREADCRUMB_LABELS[pathname];

    if (label) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-text transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-text">{label}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <span className="font-medium text-text">Dashboard</span>
        <span>/</span>
        <span>Components</span>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-xs sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-muted text-text-muted transition-colors hover:text-text lg:hidden cursor-pointer active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="hidden sm:block">
          {getBreadcrumbs()}
        </nav>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2.5">
        {pathname !== "/components/new" && canManageComponents ? (
          <Link
            href="/components/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-all hover:bg-accent-hover active:scale-95 cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Component</span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
