"use client";

import { useEffect, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import SalesNotification from "@/components/SalesNotification";
import InstallPwaButton from "@/components/InstallPwaButton";
import { isNativeApp } from "@/lib/admob";

export default function Navbar() {
  const { userId } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [nativeMode, setNativeMode] = useState(false);
  const [showAffiliateMenu, setShowAffiliateMenu] = useState(false);
  const [showCommunityMenu, setShowCommunityMenu] = useState(false);
  const [showTracksMenu, setShowTracksMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setNativeMode(isNativeApp());

    if (typeof window !== "undefined" && localStorage.getItem("lilith_vip_test") === "true") {
      setIsPremium(true);
    }

    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg?.communityOpen) setShowCommunityMenu(true);
        if (cfg?.tracksOpen) setShowTracksMenu(true);
        if (userId) {
          fetch("/api/affiliate/status")
            .then((r) => r.json())
            .then((affStatus) => {
              if (cfg?.isOpen || affStatus?.is_affiliate || affStatus?.cakto_affiliate_link) {
                setShowAffiliateMenu(true);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    if (userId) {
      fetch("/api/status")
        .then((r) => r.json())
        .then((d) => {
          if (d.isPremium) setIsPremium(true);
        })
        .catch(() => {});
    }
  }, [userId]);

  return (
    <>
      <header className="w-full bg-[#140a0f]/95 backdrop-blur-xl border-b border-white/[0.07] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="LilithLove Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl group-hover:scale-105 transition-transform shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-lg sm:text-xl font-serif font-bold text-stone-50 tracking-tight whitespace-nowrap">
              LilithLove
            </span>
          </Link>

          {/* NAVEGAÇÃO DESKTOP */}
          <div className="hidden md:flex items-center gap-2.5">
            {userId && (
              <Link
                href="/chat/lilith"
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white/[0.06] text-stone-200 hover:bg-rose-500/15 hover:text-rose-300 transition-all whitespace-nowrap"
                title="Acessar meus chats abertos"
              >
                <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Meus Casos</span>
              </Link>
            )}

            <Link
              href="/sobre"
              className="text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-300 hover:bg-white/[0.05] hover:text-rose-300 transition-all whitespace-nowrap"
            >
              Como Funciona
            </Link>

            {showTracksMenu && (
              <Link
                href="/trilhas"
                className="text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-300 hover:bg-white/[0.05] hover:text-rose-300 transition-all whitespace-nowrap"
              >
                Aulas & Guias
              </Link>
            )}

            {showCommunityMenu && (
              <Link
                href="/comunidade"
                className="text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-300 hover:bg-white/[0.05] hover:text-rose-300 transition-all whitespace-nowrap"
              >
                Comunidade
              </Link>
            )}

            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-rose-500/15 text-amber-300 whitespace-nowrap">
                <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                <span>Premium</span>
              </span>
            ) : (
              <Link
                href="/planos"
                className="text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-300 hover:bg-white/[0.05] hover:text-rose-300 transition-all whitespace-nowrap"
              >
                Planos
              </Link>
            )}

            {userId && showAffiliateMenu && (
              <Link
                href="/dashboard/afiliado"
                className="text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-300 hover:bg-white/[0.05] hover:text-rose-300 transition-all whitespace-nowrap"
              >
                Afiliados
              </Link>
            )}

            {!nativeMode && <InstallPwaButton />}

            <div className="pl-3 border-l border-white/10 flex items-center">
              {userId ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-rose-500 transition-all shadow-sm whitespace-nowrap"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>

          {/* NAVEGAÇÃO MOBILE COMPACTA */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {isPremium ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 to-rose-500/15 text-amber-300 whitespace-nowrap">
                <svg className="w-3 h-3 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                <span>VIP</span>
              </span>
            ) : (
              <Link
                href="/planos"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 whitespace-nowrap"
              >
                Planos
              </Link>
            )}

            {userId ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link
                href="/sign-in"
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap"
              >
                Entrar
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl bg-white/[0.07] text-stone-200 flex items-center justify-center transition-colors"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* GAVETA DO MENU MOBILE */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#180c12]/98 backdrop-blur-xl px-4 py-4 space-y-2 shadow-2xl">
            {userId && (
              <Link
                href="/chat/lilith"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-200 font-semibold text-sm"
              >
                <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Meus Casos & Consultas</span>
              </Link>
            )}

            <Link
              href="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-3.5 py-2.5 rounded-xl text-stone-200 hover:bg-white/5 text-sm font-medium"
            >
              Como Funciona
            </Link>

            {showTracksMenu && (
              <Link
                href="/trilhas"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-3.5 py-2.5 rounded-xl text-stone-200 hover:bg-white/5 text-sm font-medium"
              >
                Aulas & Guias
              </Link>
            )}

            {showCommunityMenu && (
              <Link
                href="/comunidade"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-3.5 py-2.5 rounded-xl text-stone-200 hover:bg-white/5 text-sm font-medium"
              >
                Comunidade
              </Link>
            )}

            {userId && showAffiliateMenu && (
              <Link
                href="/dashboard/afiliado"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-3.5 py-2.5 rounded-xl text-stone-200 hover:bg-white/5 text-sm font-medium"
              >
                Painel de Afiliados
              </Link>
            )}

            {!nativeMode && (
              <div className="pt-2.5 mt-2 border-t border-white/10 flex items-center px-1">
                <InstallPwaButton />
              </div>
            )}
          </div>
        )}
      </header>

      <SalesNotification />
    </>
  );
}