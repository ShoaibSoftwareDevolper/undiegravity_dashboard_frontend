"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/features/auth/LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    href: "/",
    label: "Overview",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/components/new",
    label: "New Component",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

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
            Admin
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
                {NAV_ITEMS.map((item) => {
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
                      <span className={isActive ? "text-accent" : "text-text-muted"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Links */}
            <div>
              <p className="px-2 mb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">
                External
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="https://undiegravity.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-muted hover:text-text transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Live Public Site</span>
                  </div>
                  <span className="text-[0.6875rem] text-text-muted">↗</span>
                </a>

                <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-text-muted bg-surface-muted/50 border border-border/60">
                  <span className="text-xs">API Status</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-xs">
                  AD
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-text truncate">Admin</span>
                  <span className="text-[0.6875rem] text-text-muted truncate">Full Access</span>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
