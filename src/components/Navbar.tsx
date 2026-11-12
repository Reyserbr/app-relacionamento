"use client";

import { useEffect, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import SalesNotification from "@/components/SalesNotification";
import InstallPwaButton from "@/components/InstallPwaButton";

export default function Navbar() {
  const { userId } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [showAffiliateMenu, setShowAffiliateMenu] = useState(false);
  const [showCommunityMenu, setShowCommunityMenu] = useState(false);
  const [showTracksMenu, setShowTracksMenu] = useState(false);

  useEffect(() => {
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
      <header className="w-full bg-stone-50/85 dark:bg-[#140a0f]/85 backdrop-blur-xl border-b border-stone-200/60 dark:border-white/[0.07] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo Oficial */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="LilithLove Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
              LilithLove
            </span>
          </Link>

          {/* Menu e Autenticação com Estética SaaS IA (Sem bordas grossas) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {userId && (
              <Link
                href="/chat/lilith"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-stone-200/50 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-300 transition-all"
                title="Acessar meus chats abertos"
              >
                <svg className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Meus Casos</span>
              </Link>
            )}

            <Link
              href="/sobre"
              className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-white/[0.05] hover:text-rose-600 dark:hover:text-rose-300 transition-all hidden md:inline-flex"
            >
              Como Funciona
            </Link>

            {showTracksMenu && (
              <Link
                href="/trilhas"
                className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-white/[0.05] hover:text-rose-600 dark:hover:text-rose-300 transition-all hidden md:inline-flex"
              >
                Aulas & Guias
              </Link>
            )}

            {showCommunityMenu && (
              <Link
                href="/comunidade"
                className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-white/[0.05] hover:text-rose-600 dark:hover:text-rose-300 transition-all hidden sm:inline-flex"
              >
                Comunidade
              </Link>
            )}

            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-rose-500/15 text-amber-600 dark:text-amber-300">
                <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                <span>Premium</span>
              </span>
            ) : (
              <Link
                href="/planos"
                className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-white/[0.05] hover:text-rose-600 dark:hover:text-rose-300 transition-all"
              >
                Planos
              </Link>
            )}

            {userId && showAffiliateMenu && (
              <Link
                href="/dashboard/afiliado"
                className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-white/[0.05] hover:text-rose-600 dark:hover:text-rose-300 transition-all hidden sm:inline-flex"
              >
                Afiliados
              </Link>
            )}

            <InstallPwaButton />
            <ThemeToggle />

            {/* Divisor sutil e Botão de Login/Perfil do Clerk */}
            <div className="pl-2 sm:pl-3 border-l border-stone-200/70 dark:border-white/10 flex items-center">
              {userId ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-lg bg-rose-900 dark:bg-rose-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-rose-800 dark:hover:bg-rose-500 transition-all shadow-sm"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <SalesNotification />
    </>
  );
}