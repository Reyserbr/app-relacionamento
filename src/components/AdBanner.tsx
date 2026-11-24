"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  isNativeApp,
  showGlobalBottomBanner,
  removeAnyBanner,
  registerInlineAdSlot,
  hideInlineMrec,
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
  const [nativeBannerError, setNativeBannerError] = useState("");
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
  const nativeSlotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isNative = isNativeApp();
    setNativeMode(isNative);

    if (!isLoaded) return;

    if (!userId && !forceShow) {
      setIsPremium(true);
      removeAnyBanner();
      hideInlineMrec();
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

  // 1. Gerencia o Banner Nativo fixo no rodapé do App Android
  useEffect(() => {
    if (!nativeMode || !isLoaded || isPremium === null) return;

    if ((!userId && !forceShow) || (isPremium && !forceShow) || !adConfig.adsEnabled) {
      removeAnyBanner();
      return;
    }

    if (format === "horizontal") {
      showGlobalBottomBanner().then((res) => {
        if (!res.ok && res.error && res.error !== "Busy") {
          setNativeBannerError(res.error);
        } else if (res.ok) {
          setNativeBannerError("");
        }
      });
    }
  }, [nativeMode, isLoaded, isPremium, userId, forceShow, adConfig.adsEnabled, format, pathname]);

  // 2. Registra o slot 300x250 nativo para encaixar o anúncio do Google na Home e no Chat
  useEffect(() => {
    if (!nativeMode || format !== "rectangle" || forceShow) return;
    if (!isLoaded || !userId || isPremium !== false || !adConfig.adsEnabled) return;
    if (!nativeSlotRef.current) return;

    return registerInlineAdSlot(nativeSlotRef.current);
  }, [nativeMode, format, forceShow, isLoaded, userId, isPremium, adConfig.adsEnabled, pathname]);

  // 3. Carregamento Web (AdSense / HTML Customizado)
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

  if (nativeMode && format === "horizontal") {
    if (nativeBannerError) {
      return (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-amber-950/95 border-t border-amber-500/40 px-3 py-1.5 text-[10px] text-amber-200 text-center">
          AdMob Status: {nativeBannerError}
        </div>
      );
    }
    return null;
  }

  if (!nativeMode && isChatRoute && !forceShow) {
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
        {nativeMode ? "Patrocinado • LilithLove" : "Publicidade • LilithLove Free"}
      </span>

      <div
        ref={nativeSlotRef}
        className={`w-full max-w-2xl rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden ${
          format === "rectangle" ? "min-h-[250px]" : "min-h-[90px]"
        }`}
      >
        {!nativeMode && adConfig.adsProvider === "adsense" && adConfig.adsenseClientId && activeSlot ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={adConfig.adsenseClientId}
            data-ad-slot={activeSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : !nativeMode && adConfig.adsProvider === "custom" && hasCustomCode ? (
          <div
            ref={customContainerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden p-2 text-center"
          />
        ) : (
          <div className="p-5 text-center max-w-md">
            <p className="text-sm font-bold text-stone-100">
              👑 Desbloqueie a LilithLove sem anúncios e sem limites
            </p>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Tenha acesso imediato às mensagens cirúrgicas, protocolos de reconquista e leituras completas.
            </p>
            <a
              href="/planos"
              className="inline-block mt-3 px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-500 transition-colors"
            >
              Conhecer Acesso VIP Premium →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}