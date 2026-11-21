"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  isNativeApp,
  showGlobalBottomBanner,
  hideGlobalBottomBanner,
  showInlineMrecBanner,
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

  const [isPremium, setIsPremium] = useState(true);
  const [nativeMode, setNativeMode] = useState(false);
  const [adConfig, setAdConfig] = useState<{
    adsEnabled: boolean;
    adsProvider: "adsense" | "custom";
    adsenseClientId: string;
    adsenseBannerSlot: string;
    adsenseModalSlot: string;
    customBannerHtml: string;
    customModalHtml: string;
  } | null>(null);

  const customContainerRef = useRef<HTMLDivElement>(null);
  const mrecBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNativeMode(isNativeApp());

    if (!isLoaded) return;

    // Se o usuário NÃO estiver logado, garante que nenhum banner nativo fique ativo e não exibe blocos
    if (!userId && !forceShow) {
      setIsPremium(true);
      hideGlobalBottomBanner();
      return;
    }

    const checkVip = async () => {
      if (typeof window !== "undefined" && localStorage.getItem("lilith_vip_test") === "true") {
        setIsPremium(true);
        return;
      }
      if (forceShow) {
        setIsPremium(false);
        return;
      }
      try {
        const r = await fetch("/api/status");
        const d = await r.json();
        setIsPremium(Boolean(d?.isPremium));
      } catch (_) {
        setIsPremium(false);
      }
    };

    const loadConfig = async () => {
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

    checkVip();
    loadConfig();
  }, [forceShow, pathname, userId, isLoaded]);

  useEffect(() => {
    if (!nativeMode || !adConfig || !adConfig.adsEnabled) return;
    if ((!userId && !forceShow) || (isPremium && !forceShow)) {
      hideGlobalBottomBanner();
      return;
    }

    if (format === "rectangle" && mrecBoxRef.current) {
      const rect = mrecBoxRef.current.getBoundingClientRect();
      const topPos = Math.max(80, Math.round(rect.top));
      showInlineMrecBanner(topPos);
      return () => {
        showGlobalBottomBanner();
      };
    } else {
      showGlobalBottomBanner();
    }
  }, [nativeMode, adConfig, isPremium, forceShow, format, pathname, userId]);

  useEffect(() => {
    if (nativeMode) return;
    if (!adConfig || !adConfig.adsEnabled) return;
    if ((!userId && !forceShow) || (isPremium && !forceShow)) return;

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
    if (!adConfig || !adConfig.adsEnabled || adConfig.adsProvider !== "custom") return;
    if ((!userId && !forceShow) || (isPremium && !forceShow)) return;

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
  if (!adConfig || !adConfig.adsEnabled) return null;
  if (isPremium && !forceShow) return null;

  if (nativeMode) {
    if (format === "rectangle") {
      return (
        <div
          ref={mrecBoxRef}
          className="w-full my-4 flex flex-col items-center justify-center min-h-[260px] rounded-2xl bg-white/[0.02] border border-white/[0.06]"
        >
          <span className="text-[9px] uppercase tracking-widest text-stone-500">
            Patrocinado • LilithLove
          </span>
        </div>
      );
    }
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