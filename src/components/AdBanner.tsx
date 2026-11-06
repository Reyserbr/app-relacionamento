"use client";

import { useEffect, useState } from "react";

interface AdBannerProps {
  slotId?: string;
  format?: "horizontal" | "rectangle";
  forceShow?: boolean;
}

export default function AdBanner({
  slotId = "SEU_SLOT_ADSENSE_AQUI",
  format = "horizontal",
  forceShow = false,
}: AdBannerProps) {
  const [isPremium, setIsPremium] = useState(true); // Começa oculto até checar que é Free
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

  useEffect(() => {
    if (forceShow) {
      setIsPremium(false);
      return;
    }
    if (typeof window !== "undefined" && localStorage.getItem("lilith_vip_test") === "true") {
      setIsPremium(true);
      return;
    }
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setIsPremium(Boolean(d?.isPremium)))
      .catch(() => setIsPremium(false));
  }, [forceShow]);

  useEffect(() => {
    if (!isPremium && adsenseClientId) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (_) {}
    }
  }, [isPremium, adsenseClientId]);

  if (isPremium && !forceShow) return null;

  return (
    <div className="w-full my-4 flex flex-col items-center justify-center">
      <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">
        Publicidade • LilithLove Free
      </span>

      <div
        className={`w-full max-w-2xl rounded-2xl bg-stone-100/80 dark:bg-white/[0.03] border border-stone-200/70 dark:border-white/10 flex items-center justify-center overflow-hidden ${
          format === "rectangle" ? "min-h-[250px]" : "min-h-[90px]"
        }`}
      >
        {adsenseClientId ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={adsenseClientId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          /* Espaço demonstrativo elegante enquanto você aguarda o ID do AdSense */
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              👑 Cansado de anúncios e limites de mensagens?
            </p>
            <a
              href="/planos"
              className="inline-block mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 underline"
            >
              Assine o VIP Premium para remover anúncios e liberar tudo →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}