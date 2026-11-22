import { Capacitor } from "@capacitor/core";

// ============================================================================
// BLOCOS DE ANÚNCIO ADMOB (IDs OFICIAIS DE TESTE DO GOOGLE)
// ============================================================================
export const ADMOB_IDS = {
  BANNER_BOTTOM: "ca-app-pub-3940256099942544/6300978111",      // Banner Rodapé (320x50)
  INTERSTITIAL_FICHA: "ca-app-pub-3940256099942544/1033173712", // Intersticial Pós-Ficha (1x/sessão)
  REWARDED_VIDEO: "ca-app-pub-3940256099942544/5224354917",     // Vídeo Premiado (+Mensagens)
};

interface LilithNativeBridge {
  showBanner: (adUnitId: string) => void;
  hideBanner: () => void;
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

export async function initAdMob(): Promise<void> {
  // Inicialização nativa já ocorre automaticamente no onCreate do MainActivity.java
}

export async function removeAnyBanner(): Promise<void> {
  const bridge = getNativeBridge();
  if (bridge) {
    try {
      bridge.hideBanner();
    } catch (_) {}
  }
  if (typeof document !== "undefined") {
    document.body.style.paddingBottom = "0px";
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
    if (typeof document !== "undefined") {
      document.body.style.paddingBottom = "56px";
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
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

  return new Promise((resolve) => {
    let settled = false;

    const finish = (status: "rewarded" | "closed" | "unavailable", error?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      if (typeof window !== "undefined") {
        delete (window as any).__onLilithRewarded;
      }
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