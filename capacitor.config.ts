import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lilithlove.app',
  appName: 'LilithLove',
  webDir: 'public',
  server: {
    url: 'https://lilithlove.site',
    cleartext: false,
    allowNavigation: [
      'lilithlove.site',
      '*.lilithlove.site',
      'clerk.lilithlove.site',
      '*.clerk.accounts.dev',
      '*.clerk.com',
      'accounts.google.com',
      '*.google.com',
      '*.gstatic.com',
      '*.cakto.com.br',
      'pay.cakto.com.br',
    ],
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#140a0f',
    overrideUserAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  },
};

export default config;