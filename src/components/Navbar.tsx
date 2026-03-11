"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-alabaster-grey-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel-blue-600 group-hover:bg-steel-blue-700 transition-colors">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-alabaster-grey-900 tracking-tight">
              Presence<span className="text-steel-blue-600">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-alabaster-grey-600 hover:text-alabaster-grey-900 transition-colors"
            >
              Analyzer
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-alabaster-grey-600 hover:text-alabaster-grey-900 transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/my-reports"
              className="text-sm font-medium text-alabaster-grey-600 hover:text-alabaster-grey-900 transition-colors"
            >
              My Reports
            </Link>
            <Link href="/" className="btn-primary text-sm py-2 px-4">
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-alabaster-grey-200 py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-sm text-alabaster-grey-700 hover:text-alabaster-grey-900 rounded-lg hover:bg-alabaster-grey-100"
              onClick={() => setOpen(false)}
            >
              Analyzer
            </Link>
            <Link
              href="/how-it-works"
              className="block px-4 py-2 text-sm text-alabaster-grey-700 hover:text-alabaster-grey-900 rounded-lg hover:bg-alabaster-grey-100"
              onClick={() => setOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/my-reports"
              className="block px-4 py-2 text-sm text-alabaster-grey-700 hover:text-alabaster-grey-900 rounded-lg hover:bg-alabaster-grey-100"
              onClick={() => setOpen(false)}
            >
              My Reports
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-sm font-semibold text-white bg-steel-blue-600 rounded-lg"
              onClick={() => setOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
