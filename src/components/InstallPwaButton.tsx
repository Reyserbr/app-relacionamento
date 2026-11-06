"use client";

import { useState, useEffect } from "react";

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

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

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (isInstalled) return null;
  if (!deferredPrompt && !isIos) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-400/30 hover:bg-rose-200 transition-colors shadow-sm"
        title="Instalar App no seu aparelho"
      >
        <span>📲</span>
        <span className="hidden sm:inline">Baixar App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1016] border border-rose-200 dark:border-rose-400/25 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 font-bold"
            >
              ✕
            </button>
            <img src="/logo.png" alt="App" className="w-14 h-14 mx-auto rounded-2xl mb-3 object-contain" />
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white mb-2">
              Instalar App LilithLove no iPhone
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              1. Toque no ícone de <strong>Compartilhar</strong> (o quadradinho com seta para cima ⬆️) na barra do Safari.<br /><br />
              2. Role para baixo e toque em <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-rose-900 text-white text-xs font-bold"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}