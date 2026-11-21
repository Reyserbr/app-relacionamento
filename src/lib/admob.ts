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

export const ADMOB_IDS = {
  BANNER_BOTTOM: "ca-app-pub-3940256099942544/6300978111",      // Banner Adaptativo Rodapé
  MREC_INLINE: "ca-app-pub-3940256099942544/6300978111",        // Bloco Inline 300x250
  INTERSTITIAL_FICHA: "ca-app-pub-3940256099942544/1033173712", // Intersticial Pós-Ficha (1x/sessão)
  REWARDED_VIDEO: "ca-app-pub-3940256099942544/5224354917",     // Vídeo Premiado (+Mensagens)
};

let initialized = false;
let initPromise: Promise<void> | null = null;
let activeBannerType: "none" | "bottom" | "mrec" = "none";

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.isNativePlatform();
}

export async function initAdMob(): Promise<void> {
  if (!isNativeApp()) return;
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: true,
      });
      initialized = true;
    } catch (err) {
      console.error("[AdMob] Falha no initialize:", err);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function removeAnyBanner(): Promise<void> {
  if (!isNativeApp() || activeBannerType === "none") return;
  try {
    await AdMob.removeBanner();
  } catch (_) {
    try {
      await AdMob.hideBanner();
    } catch (_) {}
  }
  activeBannerType = "none";
  if (typeof document !== "undefined") {
    document.body.style.paddingBottom = "0px";
  }
}

export async function showGlobalBottomBanner(): Promise<void> {
  if (!isNativeApp()) return;
  if (activeBannerType === "bottom") return;

  await initAdMob();
  if (activeBannerType === "mrec") {
    await removeAnyBanner();
  }

  try {
    const options: BannerAdOptions = {
      adId: ADMOB_IDS.BANNER_BOTTOM,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true,
    };
    await AdMob.showBanner(options);
    activeBannerType = "bottom";
    if (typeof document !== "undefined") {
      document.body.style.paddingBottom = "62px";
    }
  } catch (err) {
    console.error("[AdMob] Erro Banner Bottom:", err);
  }
}

export async function showInlineMrecBanner(marginTop = 180): Promise<void> {
  if (!isNativeApp()) return;
  await initAdMob();

  if (activeBannerType !== "none") {
    await removeAnyBanner();
  }

  try {
    const safeTop = Math.max(72, Math.min(marginTop, 360));
    const options: BannerAdOptions = {
      adId: ADMOB_IDS.MREC_INLINE,
      adSize: BannerAdSize.MEDIUM_RECTANGLE,
      position: BannerAdPosition.TOP_CENTER,
      margin: safeTop,
      isTesting: true,
    };
    await AdMob.showBanner(options);
    activeBannerType = "mrec";
  } catch (err) {
    console.error("[AdMob] Erro MREC Inline:", err);
  }
}

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
  } catch (err) {
    console.error("[AdMob] Erro Intersticial:", err);
  }
}

export async function showNativeRewardedAd(): Promise<"rewarded" | "closed" | "unavailable"> {
  if (!isNativeApp()) return "unavailable";
  await initAdMob();

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
    }, 7000);

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
      finish("unavailable");
    }
  });
}