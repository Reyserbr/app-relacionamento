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
// Quando criar os blocos no painel do AdMob, substitua apenas estas 4 strings:
// ============================================================================
export const ADMOB_IDS = {
  BANNER_BOTTOM: "ca-app-pub-3940256099942544/6300978111",      // Banner Adaptativo Rodapé
  MREC_INLINE: "ca-app-pub-3940256099942544/6300978111",        // Bloco Inline 300x250 ("Nativo")
  INTERSTITIAL_FICHA: "ca-app-pub-3940256099942544/1033173712", // Intersticial Pós-Ficha (1x/sessão)
  REWARDED_VIDEO: "ca-app-pub-3940256099942544/5224354917",     // Vídeo Premiado (+Mensagens)
};

let initialized = false;
let bottomBannerActive = false;

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.isNativePlatform();
}

export async function initAdMob(): Promise<void> {
  if (!isNativeApp() || initialized) return;
  try {
    await AdMob.initialize({
      initializeForTesting: true,
    });
    initialized = true;
  } catch (err) {
    console.error("Erro ao iniciar AdMob:", err);
  }
}

// 1. BANNER FIXO NO RODAPÉ DE TODAS AS PÁGINAS
export async function showGlobalBottomBanner(): Promise<void> {
  if (!isNativeApp() || bottomBannerActive) return;
  await initAdMob();
  try {
    const options: BannerAdOptions = {
      adId: ADMOB_IDS.BANNER_BOTTOM,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true,
    };
    await AdMob.showBanner(options);
    bottomBannerActive = true;
    document.body.style.paddingBottom = "62px";
  } catch (err) {
    console.error("Erro ao exibir Banner AdMob:", err);
  }
}

export async function hideGlobalBottomBanner(): Promise<void> {
  if (!isNativeApp() || !bottomBannerActive) return;
  try {
    await AdMob.hideBanner();
    bottomBannerActive = false;
    document.body.style.paddingBottom = "0px";
  } catch (_) {}
}

// 2. BLOCO INLINE MREC 300x250 (PARA O MEIO DO CONTEÚDO)
export async function showInlineMrecBanner(marginTop = 120): Promise<void> {
  if (!isNativeApp()) return;
  await initAdMob();
  try {
    const options: BannerAdOptions = {
      adId: ADMOB_IDS.MREC_INLINE,
      adSize: BannerAdSize.MEDIUM_RECTANGLE,
      position: BannerAdPosition.TOP_CENTER,
      margin: marginTop,
      isTesting: true,
    };
    await AdMob.showBanner(options);
  } catch (err) {
    console.error("Erro ao exibir MREC Inline:", err);
  }
}

// 3. INTERSTICIAL PÓS-ENVIO DA FICHA (DISPARA NO MÁXIMO 1 VEZ POR SESSÃO)
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
    console.error("Erro ao exibir Intersticial:", err);
  }
}

// 4. INTERSTICIAL PREMIADO (REWARDED VIDEO PARA GANHAR MENSAGENS)
export async function showNativeRewardedAd(): Promise<boolean> {
  if (!isNativeApp()) return false;
  await initAdMob();

  return new Promise(async (resolve) => {
    let rewarded = false;

    const rewardListener = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      () => {
        rewarded = true;
      }
    );

    const dismissListener = await AdMob.addListener(
      RewardAdPluginEvents.Dismissed,
      () => {
        rewardListener.remove();
        dismissListener.remove();
        resolve(rewarded);
      }
    );

    const failedListener = await AdMob.addListener(
      RewardAdPluginEvents.FailedToShow,
      () => {
        rewardListener.remove();
        dismissListener.remove();
        failedListener.remove();
        resolve(false);
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
      console.error("Erro no Vídeo Premiado AdMob:", err);
      rewardListener.remove();
      dismissListener.remove();
      failedListener.remove();
      resolve(false);
    }
  });
}