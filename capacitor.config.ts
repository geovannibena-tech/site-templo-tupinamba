import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.templotupinamba.meutemplo',
  appName: 'Meu Templo',
  webDir: 'dist',
  server: {
    url: 'https://site-templo-tupinamba.vercel.app/app-filho',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#07120e'
  }
};

export default config;
