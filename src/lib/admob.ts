import { Capacitor } from "@capacitor/core";

// ============================================================================
// BLOCOS DE ANÚNCIO ADMOB (IDs OFICIAIS DE TESTE DO GOOGLE)
// ============================================================================
export const ADMOB_IDS = {
  BANNER_BOTTOM: "ca-app-pub-5706280293116953/7828904921",      // Banner Rodapé (320x50)
  MREC_INLINE: "ca-app-pub-5706280293116953/5373171514",        // Bloco Inline 300x250
  INTERSTITIAL_FICHA: "ca-app-pub-5706280293116953/4854810117", // Intersticial Pós-Ficha (1x/sessão)
  REWARDED_VIDEO: "ca-app-pub-5706280293116953/6835387451",     // Vídeo Premiado (+Mensagens)
};

interface LilithNativeBridge {
  showBanner: (adUnitId: string) => void;
  hideBanner: () => void;
  showInlineAd?: (adUnitId: string, topCssPx: number) => void;
  hideInlineAd?: () => void;
  showInterstitial: (adUnitId: string) => void;
  showRewarded: (adUnitId: string) => void;
}

function getNativeBridge(): LilithNativeBridge | null {
  if (typeof window === "undefined") return null;
  return (window as any).LilithAds || null;
}

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  if (getNativeBridge()) return true;
  const platform = Capacitor.getPlatform();
  return Capacitor.isNativePlatform() || platform === "android" || platform === "ios";
}

export async function initAdMob(): Promise<void> {}

export async function removeAnyBanner(): Promise<void> {
  const bridge = getNativeBridge();
  if (bridge) {
    try {
      bridge.hideBanner();
    } catch (_) {}
  }
}

export async function showGlobalBottomBanner(): Promise<{ ok: boolean; error?: string }> {
  if (!isNativeApp()) return { ok: false, error: "Not native" };

  const bridge = getNativeBridge();
  if (!bridge) {
    return { ok: false, error: "Instale o novo APK com ponte nativa LilithAds" };
  }

  try {
    bridge.showBanner(ADMOB_IDS.BANNER_BOTTOM);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

// ============================================================================
// GERENCIADOR DE BLOCO INLINE NATIVO (300x250) PARA HOME E CHAT
// ============================================================================
const inlineSlots = new Set<HTMLElement>();
let inlineListenersAttached = false;
let rafId: number | null = null;

function syncVisibleInlineSlot() {
  rafId = null;
  const bridge = getNativeBridge();
  if (!bridge?.showInlineAd || !bridge?.hideInlineAd) return;

  const topSafeLimit = 68; // Abaixo da Navbar
  const bottomSafeLimit = window.innerHeight - 76; // Acima da caixa de digitação do chat

  let bestEl: HTMLElement | null = null;
  let bestTop = 0;

  const slots = Array.from(inlineSlots);
  for (let i = 0; i < slots.length; i++) {
    const el = slots[i];
    if (!document.body.contains(el)) {
      inlineSlots.delete(el);
      continue;
    }
    const rect = el.getBoundingClientRect();
    // Só exibe se o bloco 300x250 couber inteiro na área segura visível
    if (rect.height >= 200 && rect.top >= topSafeLimit && rect.bottom <= bottomSafeLimit) {
      bestEl = el;
      bestTop = rect.top;
      break;
    }
  }

  if (bestEl) {
    bridge.showInlineAd(ADMOB_IDS.MREC_INLINE, bestTop);
  } else {
    bridge.hideInlineAd();
  }
}

function scheduleInlineSync() {
  if (typeof window === "undefined") return;
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(syncVisibleInlineSlot);
}

export function registerInlineAdSlot(el: HTMLElement): () => void {
  if (typeof window === "undefined") return () => {};
  const bridge = getNativeBridge();
  if (!bridge?.showInlineAd) return () => {};

  inlineSlots.add(el);

  if (!inlineListenersAttached) {
    inlineListenersAttached = true;
    // capture: true captura rolagem tanto da Home quanto do container interno do Chat
    window.addEventListener("scroll", scheduleInlineSync, true);
    window.addEventListener("resize", scheduleInlineSync);
  }

  scheduleInlineSync();
  const settleTimer = setTimeout(scheduleInlineSync, 350);

  return () => {
    clearTimeout(settleTimer);
    inlineSlots.delete(el);
    if (inlineSlots.size === 0) {
      bridge.hideInlineAd?.();
    } else {
      scheduleInlineSync();
    }
  };
}

export function hideInlineMrec(): void {
  const bridge = getNativeBridge();
  bridge?.hideInlineAd?.();
}

export async function showPostFormInterstitialOnce(): Promise<void> {
  const bridge = getNativeBridge();
  if (!bridge) return;

  if (typeof window !== "undefined" && sessionStorage.getItem("lilith_interstitial_shown") === "true") {
    return;
  }

  try {
    sessionStorage.setItem("lilith_interstitial_shown", "true");
    bridge.showInterstitial(ADMOB_IDS.INTERSTITIAL_FICHA);
  } catch (_) {}
}

export async function showNativeRewardedAd(): Promise<{
  status: "rewarded" | "closed" | "unavailable";
  error?: string;
}> {
  const bridge = getNativeBridge();
  if (!bridge) {
    return { status: "unavailable", error: "Instale o novo APK com ponte nativa LilithAds" };
  }

  // Oculta o bloco inline enquanto o vídeo tela cheia estiver aberto
  bridge.hideInlineAd?.();

  return new Promise((resolve) => {
    let settled = false;

    const finish = (status: "rewarded" | "closed" | "unavailable", error?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      if (typeof window !== "undefined") {
        delete (window as any).__onLilithRewarded;
      }
      scheduleInlineSync();
      resolve({ status, error });
    };

    const safetyTimer = setTimeout(() => {
      finish("unavailable", "Tempo esgotado carregando o vídeo do Google");
    }, 15000);

    (window as any).__onLilithRewarded = (
      status: "rewarded" | "closed" | "unavailable",
      error?: string
    ) => {
      finish(status, error);
    };

    try {
      bridge.showRewarded(ADMOB_IDS.REWARDED_VIDEO);
    } catch (err: any) {
      finish("unavailable", err?.message || String(err));
    }
  });
}