/**
 * Crashlytics stub interface.
 * 
 * To implement the real Firebase Crashlytics:
 * 1. Install @react-native-firebase/app and @react-native-firebase/crashlytics
 * 2. Add google-services.json (Android) and GoogleService-Info.plist (iOS)
 * 3. Replace console.error with crashlytics().recordError(error)
 */

export const crashlytics = {
  log(message: string) {
    if (__DEV__) {
      console.log(`[Crashlytics Log]: ${message}`);
    }
  },
  
  recordError(error: Error, jsErrorName?: string) {
    if (__DEV__) {
      console.error(`[Crashlytics Error] ${jsErrorName || error.name}: ${error.message}`, error);
    }
  },
  
  setUserId(userId: string) {
    if (__DEV__) {
      console.log(`[Crashlytics] Set User ID: ${userId}`);
    }
  },
  
  setAttribute(name: string, value: string) {
    if (__DEV__) {
      console.log(`[Crashlytics] Set Attribute: ${name}=${value}`);
    }
  }
};
