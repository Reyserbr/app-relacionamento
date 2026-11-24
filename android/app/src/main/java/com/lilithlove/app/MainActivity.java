package com.lilithlove.app;

import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class MainActivity extends BridgeActivity {
    private AdView bannerView;
    private AdView inlineAdView;
    private boolean rewardEarned = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        MobileAds.initialize(this, initializationStatus -> {});

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new LilithAdsBridge(), "LilithAds");
        }
    }

    @Override
    public void onDestroy() {
        if (bannerView != null) {
            bannerView.destroy();
            bannerView = null;
        }
        if (inlineAdView != null) {
            inlineAdView.destroy();
            inlineAdView = null;
        }
        super.onDestroy();
    }

    private void setWebViewBottomMargin(int marginPx) {
        WebView webView = getBridge().getWebView();
        if (webView != null && webView.getLayoutParams() instanceof ViewGroup.MarginLayoutParams) {
            ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) webView.getLayoutParams();
            if (lp.bottomMargin != marginPx) {
                lp.bottomMargin = marginPx;
                webView.setLayoutParams(lp);
                webView.requestLayout();
            }
        }
    }

    private void notifyReward(String status, String errorMsg) {
        runOnUiThread(() -> {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                String safeErr = errorMsg == null ? "" : errorMsg.replace("'", "").replace("\n", " ");
                webView.evaluateJavascript(
                    "window.__onLilithRewarded && window.__onLilithRewarded('" + status + "', '" + safeErr + "');",
                    null
                );
            }
        });
    }

    public class LilithAdsBridge {

        @JavascriptInterface
        public void showBanner(String adUnitId) {
            runOnUiThread(() -> {
                int bannerHeightPx = AdSize.BANNER.getHeightInPixels(MainActivity.this);
                setWebViewBottomMargin(bannerHeightPx);

                if (bannerView != null) {
                    bannerView.setVisibility(View.VISIBLE);
                    return;
                }
                ViewGroup rootView = findViewById(android.R.id.content);
                if (rootView == null) return;

                bannerView = new AdView(MainActivity.this);
                bannerView.setAdSize(AdSize.BANNER);
                bannerView.setAdUnitId(adUnitId);

                FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL
                );
                rootView.addView(bannerView, params);
                bannerView.loadAd(new AdRequest.Builder().build());
            });
        }

        @JavascriptInterface
        public void hideBanner() {
            runOnUiThread(() -> {
                setWebViewBottomMargin(0);
                if (bannerView != null) {
                    bannerView.setVisibility(View.GONE);
                }
            });
        }

        @JavascriptInterface
        public void showInlineAd(String adUnitId, float topCssPx) {
            runOnUiThread(() -> {
                ViewGroup rootView = findViewById(android.R.id.content);
                WebView webView = getBridge().getWebView();
                if (rootView == null || webView == null) return;

                int[] webLoc = new int[2];
                webView.getLocationInWindow(webLoc);
                int[] rootLoc = new int[2];
                rootView.getLocationInWindow(rootLoc);
                int webOffsetY = webLoc[1] - rootLoc[1];

                float density = getResources().getDisplayMetrics().density;
                int topPx = webOffsetY + Math.round(topCssPx * density);

                if (inlineAdView == null) {
                    inlineAdView = new AdView(MainActivity.this);
                    inlineAdView.setAdSize(AdSize.MEDIUM_RECTANGLE);
                    inlineAdView.setAdUnitId(adUnitId);

                    FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        Gravity.TOP | Gravity.CENTER_HORIZONTAL
                    );
                    params.topMargin = Math.max(0, topPx);
                    rootView.addView(inlineAdView, params);
                    inlineAdView.loadAd(new AdRequest.Builder().build());
                } else {
                    FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) inlineAdView.getLayoutParams();
                    int clampedTop = Math.max(0, topPx);
                    if (params.topMargin != clampedTop) {
                        params.topMargin = clampedTop;
                        inlineAdView.setLayoutParams(params);
                    }
                    if (inlineAdView.getVisibility() != View.VISIBLE) {
                        inlineAdView.setVisibility(View.VISIBLE);
                    }
                }
            });
        }

        @JavascriptInterface
        public void hideInlineAd() {
            runOnUiThread(() -> {
                if (inlineAdView != null && inlineAdView.getVisibility() != View.GONE) {
                    inlineAdView.setVisibility(View.GONE);
                }
            });
        }

        @JavascriptInterface
        public void showInterstitial(String adUnitId) {
            runOnUiThread(() -> {
                InterstitialAd.load(
                    MainActivity.this,
                    adUnitId,
                    new AdRequest.Builder().build(),
                    new InterstitialAdLoadCallback() {
                        @Override
                        public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                            interstitialAd.show(MainActivity.this);
                        }

                        @Override
                        public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        }
                    }
                );
            });
        }

        @JavascriptInterface
        public void showRewarded(String adUnitId) {
            runOnUiThread(() -> {
                RewardedAd.load(
                    MainActivity.this,
                    adUnitId,
                    new AdRequest.Builder().build(),
                    new RewardedAdLoadCallback() {
                        @Override
                        public void onAdLoaded(@NonNull RewardedAd rewardedAd) {
                            rewardEarned = false;
                            rewardedAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                                @Override
                                public void onAdDismissedFullScreenContent() {
                                    notifyReward(rewardEarned ? "rewarded" : "closed", "");
                                }

                                @Override
                                public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                                    notifyReward("unavailable", adError.getMessage());
                                }
                            });
                            rewardedAd.show(MainActivity.this, rewardItem -> {
                                rewardEarned = true;
                            });
                        }

                        @Override
                        public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                            notifyReward("unavailable", loadAdError.getMessage());
                        }
                    }
                );
            });
        }
    }
}