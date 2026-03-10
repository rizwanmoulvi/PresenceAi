"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Zap, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
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
              href="/#how-it-works"
              className="text-sm font-medium text-alabaster-grey-600 hover:text-alabaster-grey-900 transition-colors"
            >
              How it works
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-alabaster-grey-600">
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-steel-blue-100">
                      <User className="h-3.5 w-3.5 text-steel-blue-600" />
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">
                    {session.user?.name ?? session.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-ghost text-sm py-1.5 px-3"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin" className="btn-ghost text-sm py-1.5">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}
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
              href="/#how-it-works"
              className="block px-4 py-2 text-sm text-alabaster-grey-700 hover:text-alabaster-grey-900 rounded-lg hover:bg-alabaster-grey-100"
              onClick={() => setOpen(false)}
            >
              How it works
            </Link>
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-4 py-2 text-sm text-alabaster-grey-700 hover:text-alabaster-grey-900 rounded-lg hover:bg-alabaster-grey-100"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 text-sm text-alabaster-grey-700 hover:text-alabaster-grey-900 rounded-lg hover:bg-alabaster-grey-100"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 text-sm font-semibold text-white bg-steel-blue-600 rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
