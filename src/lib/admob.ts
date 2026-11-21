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
let initPromise: Promise<void> | null = null;
let bannerVisible = false;
let bannerBusy = false;

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const platform = Capacitor.getPlatform();
  return Capacitor.isNativePlatform() || platform === "android" || platform === "ios";
}

export async function initAdMob(): Promise<boolean> {
  if (!isNativeApp()) return false;
  if (initialized) return true;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        await AdMob.initialize({
          initializeForTesting: true,
        });
        initialized = true;
      } catch (err) {
        console.error("[AdMob] Erro ao inicializar:", err);
      } finally {
        initPromise = null;
      }
    })();
  }

  await initPromise;
  return initialized;
}

export async function removeAnyBanner(): Promise<void> {
  if (!isNativeApp()) return;
  if (!bannerVisible && !bannerBusy) return;

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

// 1. BANNER ÚNICO FIXO NO RODAPÉ (SEM CONFLITO DE SOBREPOSIÇÃO)
export async function showGlobalBottomBanner(): Promise<void> {
  if (!isNativeApp()) return;
  if (bannerVisible || bannerBusy) return;

  bannerBusy = true;
  try {
    const ok = await initAdMob();
    if (!ok) return;

    const options: BannerAdOptions = {
      adId: ADMOB_IDS.BANNER_BOTTOM,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true,
    };

    await AdMob.showBanner(options);
    bannerVisible = true;

    if (typeof document !== "undefined") {
      document.body.style.paddingBottom = "56px";
    }
  } catch (err) {
    bannerVisible = false;
    console.error("[AdMob] Falha ao exibir banner:", err);
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

  const ok = await initAdMob();
  if (!ok) return;

  try {
    sessionStorage.setItem("lilith_interstitial_shown", "true");
    const options: AdOptions = {
      adId: ADMOB_IDS.INTERSTITIAL_FICHA,
      isTesting: true,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
  } catch (err) {
    console.error("[AdMob] Erro Intersticial:", err);
  }
}

// 3. VÍDEO PREMIADO (+MENSAGENS) COM RETORNO GARANTIDO
export async function showNativeRewardedAd(): Promise<"rewarded" | "closed" | "unavailable"> {
  if (!isNativeApp()) return "unavailable";

  const ok = await initAdMob();
  if (!ok) return "unavailable";

  return new Promise(async (resolve) => {
    let settled = false;
    let rewarded = false;

    const finish = (status: "rewarded" | "closed" | "unavailable") => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      rewardListener?.remove();
      dismissListener?.remove();
      failedLoadListener?.remove();
      failedShowListener?.remove();
      resolve(status);
    };

    const safetyTimer = setTimeout(() => {
      finish("unavailable");
    }, 8000);

    const rewardListener = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      () => {
        rewarded = true;
      }
    );

    const dismissListener = await AdMob.addListener(
      RewardAdPluginEvents.Dismissed,
      () => {
        finish(rewarded ? "rewarded" : "closed");
      }
    );

    const failedLoadListener = await AdMob.addListener(
      RewardAdPluginEvents.FailedToLoad,
      () => {
        finish("unavailable");
      }
    );

    const failedShowListener = await AdMob.addListener(
      RewardAdPluginEvents.FailedToShow,
      () => {
        finish("unavailable");
      }
    );

    try {
      const options: RewardAdOptions = {
        adId: ADMOB_IDS.REWARDED_VIDEO,
        isTesting: true,
      };
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (err) {
      console.error("[AdMob] Erro Vídeo Premiado:", err);
      finish("unavailable");
    }
  });
}