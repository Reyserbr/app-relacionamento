"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

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
  const isChatRoute = pathname?.startsWith("/chat");

  const [isPremium, setIsPremium] = useState(true);
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

  useEffect(() => {
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
  }, [forceShow]);

  // Carrega o script do AdSense apenas fora das telas de chat (ou quando o modal de recompensa abrir),
  // protegendo o layout mobile do chat contra "Auto Ads" flutuantes invasivos!
  useEffect(() => {
    if (!adConfig || !adConfig.adsEnabled) return;
    if (isPremium && !forceShow) return;

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
  }, [adConfig, isPremium, forceShow, isChatRoute]);

  // Executa scripts de redes alternativas (Monetag / Adsterra / Banners HTML) se configurado no Admin
  useEffect(() => {
    if (!adConfig || !adConfig.adsEnabled || adConfig.adsProvider !== "custom") return;
    if (isPremium && !forceShow) return;

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
  }, [adConfig, isPremium, forceShow, format]);

  if (!adConfig || !adConfig.adsEnabled) return null;
  if (isPremium && !forceShow) return null;

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
      <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">
        Publicidade • LilithLove Free
      </span>

      <div
        className={`w-full max-w-2xl rounded-2xl bg-stone-100/80 dark:bg-white/[0.03] border border-stone-200/70 dark:border-white/10 flex items-center justify-center overflow-hidden ${
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
          /* Banner interno elegante de autopromoção VIP enquanto não preenche os códigos no Admin */
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
              👑 Desbloqueie a LilithLove sem anúncios e sem limites
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Tenha acesso imediato às mensagens cirúrgicas, protocolos de reconquista e leituras completas.
            </p>
            <a
              href="/planos"
              className="inline-block mt-2 px-4 py-1.5 rounded-full bg-rose-900 dark:bg-rose-600 text-white text-[11px] font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Conhecer Acesso VIP Premium →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}