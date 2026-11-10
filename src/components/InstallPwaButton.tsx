"use client";

import { useState, useEffect } from "react";

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setIsIos(true);
    }
    // Detecta navegador interno do WhatsApp, Instagram, Facebook ou TikTok
    if (/whatsapp|instagram|fbav|fban|tiktok/.test(ua)) {
      setIsInAppBrowser(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    // Se estiver dentro do navegador do WhatsApp/Instagram, orienta abrir no Chrome/Safari
    if (isInAppBrowser) {
      setShowManualGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
        }
      } catch (_) {
        setShowManualGuide(true);
      }
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-400/30 hover:bg-rose-200 transition-colors shadow-sm"
        title="Adicionar App à Tela Inicial"
      >
        <span>📲</span>
        <span className="hidden sm:inline">Baixar App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showManualGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1016] border border-rose-200 dark:border-rose-400/25 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowManualGuide(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 font-bold"
            >
              ✕
            </button>
            <img src="/logo.png" alt="App" className="w-14 h-14 mx-auto rounded-2xl mb-3 object-contain" />
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white mb-2">
              Adicionar App LilithLove
            </h3>

            {isInAppBrowser ? (
              <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4 space-y-2 text-left bg-amber-50 dark:bg-amber-500/10 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-400/30">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  ⚠️ Você abriu pelo WhatsApp / Instagram:
                </p>
                <p>1. Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito da tela.</p>
                <p>2. Escolha <strong>&ldquo;Abrir no Chrome&rdquo;</strong> (ou Safari) e clique em Baixar App.</p>
              </div>
            ) : isIos ? (
              <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4 space-y-2 text-left bg-stone-50 dark:bg-white/5 p-3.5 rounded-2xl">
                <p>1. Toque no ícone de <strong>Compartilhar (⬆️)</strong> na barra do Safari.</p>
                <p>2. Role para baixo e selecione <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.</p>
              </div>
            ) : (
              <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4 space-y-2 text-left bg-stone-50 dark:bg-white/5 p-3.5 rounded-2xl">
                <p>1. Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito do seu navegador.</p>
                <p>2. Toque em <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong> (ou <em>Instalar aplicativo</em>) para criar o atalho direto sem precisar baixar arquivo.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowManualGuide(false)}
              className="w-full py-2.5 rounded-xl bg-rose-900 dark:bg-rose-600 text-white text-xs font-bold"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}