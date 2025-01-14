import Constants from 'expo-constants';
import { Platform } from 'react-native';
export const Const = {
  server: 'api.sphere.gistda.or.th/map/',
  bundleId: '' as string | undefined,
  apiKey: '' as string | undefined,

  init: (): void => {
    try {
      if (Platform.OS === 'ios' && Constants.manifest2.ios) {
        Const.bundleId = Constants.manifest2.ios.bundleIdentifier;
      } else if (Platform.OS === 'android' && Constants.manifest2.android) {
        Const.bundleId = Constants.manifest2.android.package;
      } else {
        Const.bundleId = Constants.manifest2.slug;
      }
    } catch (e) {
      Const.log('config not found:', e);
    }

    if (!Const.bundleId) {
      Const.bundleId = 'react-native';
    }
  },

  log: (...messages: any[]): void => {
    console.log('\x1B[35mMAP\x1B[0m', ...messages);
  },

  objectcount: 0,
};