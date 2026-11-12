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
      <header className="w-full bg-stone-50/90 dark:bg-[#140a0f]/80 backdrop-blur-md border-b border-stone-200 dark:border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo Oficial */}
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="LilithLove Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
              LilithLove
            </span>
          </Link>

          {/* Menu e Autenticação */}
          <div className="flex items-center gap-2 sm:gap-4">
            {userId && (
              <Link
                href="/chat/lilith"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full bg-stone-200/60 dark:bg-white/5 text-stone-700 dark:text-stone-300 hover:bg-rose-100 dark:hover:bg-white/10 hover:text-rose-700 dark:hover:text-rose-300 border border-stone-300/50 dark:border-white/10 transition-colors"
                title="Acessar meus chats abertos"
              >
                <span className="text-xs opacity-80">💬</span>
                <span>Meus Casos</span>
              </Link>
            )}

            {showTracksMenu && (
              <Link
                href="/trilhas"
                className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-300 transition-colors hidden md:block"
              >
                Aulas & Guias
              </Link>
            )}

            {showCommunityMenu && (
              <Link
                href="/comunidade"
                className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-300 transition-colors hidden sm:block"
              >
                Comunidade
              </Link>
            )}

            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/40 shadow-sm">
                <span>👑</span> Premium
              </span>
            ) : (
              <Link
                href="/planos"
                className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
              >
                Planos
              </Link>
            )}

            {userId && showAffiliateMenu && (
              <Link
                href="/dashboard/afiliado"
                className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-300 transition-colors hidden sm:block"
              >
                Afiliados
              </Link>
            )}

            <InstallPwaButton />
            <ThemeToggle />

            {/* Divisor e Botão de Login/Perfil do Clerk */}
            <div className="pl-2 sm:pl-3 border-l border-stone-200 dark:border-white/10 flex items-center">
              {userId ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-full bg-rose-100 dark:bg-rose-500/20 px-3 sm:px-4 py-2 text-sm font-medium text-rose-900 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors shadow-sm"
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