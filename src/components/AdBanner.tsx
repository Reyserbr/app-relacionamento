"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  isNativeApp,
  showGlobalBottomBanner,
  removeAnyBanner,
} from "@/lib/admob";

interface AdBannerProps {
  slotId?: string;
  format?: "horizontal" | "rectangle";
  forceShow?: boolean;
}

export default function AdBanner({
  slotId = "",
  format = "horizontal",
  forceShow = false,
}: AdBannerProps) {
  const pathname = usePathname();
  const { userId, isLoaded } = useAuth();
  const isChatRoute = pathname?.startsWith("/chat");

  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [nativeMode, setNativeMode] = useState(false);
  const [adConfig, setAdConfig] = useState<{
    adsEnabled: boolean;
    adsProvider: "adsense" | "custom";
    adsenseClientId: string;
    adsenseBannerSlot: string;
    adsenseModalSlot: string;
    customBannerHtml: string;
    customModalHtml: string;
  }>({
    adsEnabled: true,
    adsProvider: "adsense",
    adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
    adsenseBannerSlot: "",
    adsenseModalSlot: "",
    customBannerHtml: "",
    customModalHtml: "",
  });

  const customContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isNative = isNativeApp();
    setNativeMode(isNative);

    if (!isLoaded) return;

    if (!userId && !forceShow) {
      setIsPremium(true);
      removeAnyBanner();
      return;
    }

    const checkVipAndConfig = async () => {
      let userIsVip = false;

      if (typeof window !== "undefined" && localStorage.getItem("lilith_vip_test") === "true") {
        userIsVip = true;
      } else if (!forceShow) {
        try {
          const r = await fetch("/api/status");
          const d = await r.json();
          userIsVip = Boolean(d?.isPremium);
        } catch (_) {
          userIsVip = false;
        }
      }

      setIsPremium(userIsVip);

      try {
        const r = await fetch("/api/affiliate/config");
        const cfg = await r.json();
        setAdConfig({
          adsEnabled: typeof cfg.adsEnabled === "boolean" ? cfg.adsEnabled : true,
          adsProvider: cfg.adsProvider === "custom" ? "custom" : "adsense",
          adsenseClientId: cfg.adsenseClientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
          adsenseBannerSlot: cfg.adsenseBannerSlot || "",
          adsenseModalSlot: cfg.adsenseModalSlot || "",
          customBannerHtml: cfg.customBannerHtml || "",
          customModalHtml: cfg.customModalHtml || "",
        });
      } catch (_) {}
    };

    checkVipAndConfig();
  }, [forceShow, pathname, userId, isLoaded]);

  // Gerencia o Banner Nativo único no rodapé do App Android
  useEffect(() => {
    if (!nativeMode || !isLoaded || isPremium === null) return;

    if ((!userId && !forceShow) || (isPremium && !forceShow) || !adConfig.adsEnabled) {
      removeAnyBanner();
      return;
    }

    if (format === "horizontal") {
      showGlobalBottomBanner();
    }
  }, [nativeMode, isLoaded, isPremium, userId, forceShow, adConfig.adsEnabled, format, pathname]);

  // Carregamento Web (AdSense / HTML Customizado)
  useEffect(() => {
    if (nativeMode) return;
    if (!adConfig.adsEnabled) return;
    if ((!userId && !forceShow) || (isPremium !== false && !forceShow)) return;

    if (adConfig.adsProvider === "adsense" && adConfig.adsenseClientId) {
      if (!isChatRoute || forceShow) {
        const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);
        if (!existingScript) {
          const s = document.createElement("script");
          s.async = true;
          s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adsenseClientId}`;
          s.crossOrigin = "anonymous";
          document.head.appendChild(s);
        }
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (_) {}
      }
    }
  }, [nativeMode, adConfig, isPremium, forceShow, isChatRoute, userId]);

  useEffect(() => {
    if (nativeMode) return;
    if (!adConfig.adsEnabled || adConfig.adsProvider !== "custom") return;
    if ((!userId && !forceShow) || (isPremium !== false && !forceShow)) return;

    const rawHtml =
      format === "rectangle"
        ? adConfig.customModalHtml || adConfig.customBannerHtml
        : adConfig.customBannerHtml || adConfig.customModalHtml;

    if (customContainerRef.current && rawHtml) {
      customContainerRef.current.innerHTML = "";
      const range = document.createRange();
      range.selectNode(customContainerRef.current);
      const fragment = range.createContextualFragment(rawHtml);
      customContainerRef.current.appendChild(fragment);
    }
  }, [nativeMode, adConfig, isPremium, forceShow, format, userId]);

  if (!isLoaded || (!userId && !forceShow)) return null;
  if (!adConfig.adsEnabled) return null;
  if (isPremium !== false && !forceShow) return null;

  // No App Android, o banner horizontal é nativo no rodapé (não ocupa caixa vazia no HTML)
  if (nativeMode && format === "horizontal") {
    return null;
  }

  // Na Web, oculta o banner global dentro dos chats
  if (!nativeMode && isChatRoute && !forceShow) {
    return null;
  }

  // No App Android, se não for o modal de recompensa (forceShow), não renderiza caixa vazia no meio da tela
  if (nativeMode && !forceShow) {
    return null;
  }

  const activeSlot =
    format === "rectangle"
      ? adConfig.adsenseModalSlot || slotId
      : adConfig.adsenseBannerSlot || slotId;

  const hasCustomCode = Boolean(
    format === "rectangle"
      ? adConfig.customModalHtml || adConfig.customBannerHtml
      : adConfig.customBannerHtml || adConfig.customModalHtml
  );

  return (
    <div className="w-full my-3 flex flex-col items-center justify-center">
      <span className="text-[9px] uppercase tracking-widest text-stone-500 mb-1">
        Publicidade • LilithLove Free
      </span>

      <div
        className={`w-full max-w-2xl rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden ${
          format === "rectangle" ? "min-h-[250px]" : "min-h-[90px]"
        }`}
      >
        {adConfig.adsProvider === "adsense" && adConfig.adsenseClientId && activeSlot ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={adConfig.adsenseClientId}
            data-ad-slot={activeSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : adConfig.adsProvider === "custom" && hasCustomCode ? (
          <div
            ref={customContainerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden p-2 text-center"
          />
        ) : (
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-stone-200">
              👑 Desbloqueie a LilithLove sem anúncios e sem limites
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Tenha acesso imediato às mensagens cirúrgicas, protocolos de reconquista e leituras completas.
            </p>
            <a
              href="/planos"
              className="inline-block mt-2 px-4 py-1.5 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Conhecer Acesso VIP Premium →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}