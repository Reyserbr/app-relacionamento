import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdOptions,
  RewardAdOptions,
  RewardAdPluginEvents,
} from "@capacitor-community/admob";

// ============================================================================
// BLOCOS DE ANÚNCIO ADMOB (IDs OFICIAIS DE TESTE DO GOOGLE)
// ============================================================================
export const ADMOB_IDS = {
  BANNER_BOTTOM: "ca-app-pub-3940256099942544/6300978111",      // Banner Rodapé (320x50)
  INTERSTITIAL_FICHA: "ca-app-pub-3940256099942544/1033173712", // Intersticial Pós-Ficha (1x/sessão)
  REWARDED_VIDEO: "ca-app-pub-3940256099942544/5224354917",     // Vídeo Premiado (+Mensagens)
};

let initialized = false;
let bannerVisible = false;
let bannerBusy = false;
let lastAdMobError = "";

export function getLastAdMobError(): string {
  return lastAdMobError;
}

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const platform = Capacitor.getPlatform();
  return Capacitor.isNativePlatform() || platform === "android" || platform === "ios";
}

export async function initAdMob(): Promise<void> {
  if (!isNativeApp() || initialized) return;
  try {
    await AdMob.initialize();
    initialized = true;
  } catch (err: any) {
    lastAdMobError = `Init: ${err?.message || String(err)}`;
    console.error("[AdMob] Falha no initialize:", err);
  }
}

export async function removeAnyBanner(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    await AdMob.removeBanner();
  } catch (_) {
    try {
      await AdMob.hideBanner();
    } catch (_) {}
  }
  bannerVisible = false;
  if (typeof document !== "undefined") {
    document.body.style.paddingBottom = "0px";
  }
}

// 1. BANNER FIXO NO RODAPÉ (TENTA EXIBIR DIRETAMENTE SEM ABORTAR)
export async function showGlobalBottomBanner(): Promise<{ ok: boolean; error?: string }> {
  if (!isNativeApp()) return { ok: false, error: "Not native" };
  if (bannerVisible) return { ok: true };
  if (bannerBusy) return { ok: false, error: "Busy" };

  bannerBusy = true;
  try {
    await initAdMob();

    const options: BannerAdOptions = {
      adId: ADMOB_IDS.BANNER_BOTTOM,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true,
    };

    await AdMob.showBanner(options);
    bannerVisible = true;
    lastAdMobError = "";

    if (typeof document !== "undefined") {
      document.body.style.paddingBottom = "56px";
    }
    return { ok: true };
  } catch (err: any) {
    bannerVisible = false;
    const msg = err?.message || String(err);
    lastAdMobError = `Banner: ${msg}`;
    console.error("[AdMob] Falha ao exibir banner:", err);
    return { ok: false, error: msg };
  } finally {
    bannerBusy = false;
  }
}

// 2. INTERSTICIAL PÓS-ENVIO DA FICHA (1x POR SESSÃO)
export async function showPostFormInterstitialOnce(): Promise<void> {
  if (!isNativeApp()) return;
  if (typeof window !== "undefined" && sessionStorage.getItem("lilith_interstitial_shown") === "true") {
    return;
  }

  await initAdMob();
  try {
    sessionStorage.setItem("lilith_interstitial_shown", "true");
    const options: AdOptions = {
      adId: ADMOB_IDS.INTERSTITIAL_FICHA,
      isTesting: true,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
  } catch (err: any) {
    lastAdMobError = `Interstitial: ${err?.message || String(err)}`;
    console.error("[AdMob] Erro Intersticial:", err);
  }
}

// 3. VÍDEO PREMIADO (+MENSAGENS)
export async function showNativeRewardedAd(): Promise<{
  status: "rewarded" | "closed" | "unavailable";
  error?: string;
}> {
  if (!isNativeApp()) return { status: "unavailable", error: "Not native" };

  await initAdMob();

  return new Promise(async (resolve) => {
    let settled = false;
    let rewarded = false;
    let rewardListener: any = null;
    let dismissListener: any = null;
    let failedLoadListener: any = null;
    let failedShowListener: any = null;

    const finish = (status: "rewarded" | "closed" | "unavailable", error?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      try {
        rewardListener?.remove();
        dismissListener?.remove();
        failedLoadListener?.remove();
        failedShowListener?.remove();
      } catch (_) {}
      resolve({ status, error });
    };

    const safetyTimer = setTimeout(() => {
      finish("unavailable", "Timeout de 10s aguardando resposta do Google AdMob");
    }, 10000);

    try {
      rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      });

      dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        finish(rewarded ? "rewarded" : "closed");
      });

      failedLoadListener = await AdMob.addListener(
        RewardAdPluginEvents.FailedToLoad,
        (err: any) => {
          const msg = err?.message || JSON.stringify(err) || "FailedToLoad";
          lastAdMobError = `RewardLoad: ${msg}`;
          finish("unavailable", msg);
        }
      );

      failedShowListener = await AdMob.addListener(
        RewardAdPluginEvents.FailedToShow,
        (err: any) => {
          const msg = err?.message || JSON.stringify(err) || "FailedToShow";
          lastAdMobError = `RewardShow: ${msg}`;
          finish("unavailable", msg);
        }
      );

      const options: RewardAdOptions = {
        adId: ADMOB_IDS.REWARDED_VIDEO,
        isTesting: true,
      };
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (err: any) {
      const msg = err?.message || String(err);
      lastAdMobError = `RewardCatch: ${msg}`;
      finish("unavailable", msg);
    }
  });
}