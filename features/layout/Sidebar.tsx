"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Settings, Shield, Users as UsersIcon } from "lucide-react";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { hasPermission } from "@/lib/permissions";
import type { Permission, UserRecord } from "@/lib/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Undefined means always visible to any signed-in user. */
  permission?: Permission;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, permission: "components.view" },
  { href: "/components/new", label: "New Component", icon: <Plus className="h-4 w-4" />, permission: "components.manage" },
  { href: "/users", label: "Users", icon: <UsersIcon className="h-4 w-4" />, permission: "users.manage" },
  { href: "/roles", label: "Roles", icon: <Shield className="h-4 w-4" />, permission: "roles.manage" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname();
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user, item.permission)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header with Real Website Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-text">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-surface shadow-2xs">
              <Image
                src="/logo.png"
                alt="UndieGravity Logo"
                width={32}
                height={32}
                className="h-full w-full object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm leading-none font-bold tracking-tight text-text">UndieGravity</span>
              <span className="text-[0.6875rem] leading-none text-text-muted mt-0.5">Admin Dashboard</span>
            </div>
          </Link>

          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[0.625rem] font-semibold text-accent border border-accent/20">
            {user.role.name}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            {/* Main Section */}
            <div>
              <p className="px-2 mb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">
                Management
              </p>
              <nav className="flex flex-col gap-1">
                {visibleNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose()}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-accent/10 text-accent font-semibold"
                          : "text-text-muted hover:bg-surface-muted hover:text-text"
                      }`}
                    >
                      <span className={isActive ? "text-accent" : "text-text-muted"}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between gap-2 px-1">
              <Link
                href="/settings"
                onClick={() => onClose()}
                className="flex items-center gap-2.5 min-w-0 rounded-lg px-1 py-1 -mx-1 hover:bg-surface-muted transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-xs">
                  {initials(user.name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-text truncate">{user.name}</span>
                  <span className="text-[0.6875rem] text-text-muted truncate">{user.role.name}</span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/settings"
                  onClick={() => onClose()}
                  aria-label="Settings"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
