import { defineConfig } from '@capacitor/cli';

export default defineConfig({
  appId: 'com.propertymanager.app',
  appName: 'Property Manager',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#ffffffff',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Splash'
    }
  },
  ios: {
    scheme: 'PropertyManager'
  },
  android: {
    flavor: 'dev'
  }
});
