"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

export function TopHeader({ onOpenSidebar }: TopHeaderProps) {
  const pathname = usePathname();

  function getBreadcrumbs() {
    if (pathname === "/components/new") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-text transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-text">New Component</span>
        </div>
      );
    }
    if (pathname.includes("/edit")) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-text transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-text">Edit Component</span>
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
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="hidden sm:block">
          {getBreadcrumbs()}
        </nav>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2.5">
        <a
          href="https://undiegravity.site"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-muted hover:text-text cursor-pointer shadow-2xs"
        >
          <span>Live Site</span>
          <span className="text-[0.6875rem]">↗</span>
        </a>

        {pathname !== "/components/new" ? (
          <Link
            href="/components/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-all hover:bg-accent-hover active:scale-95 cursor-pointer shadow-2xs"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Component</span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
