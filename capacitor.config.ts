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
      '*.clerk.accounts.dev',
      '*.clerk.com',
      'accounts.google.com',
      '*.cakto.com.br',
      'pay.cakto.com.br',
    ],
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#140a0f',
  },
};

export default config;