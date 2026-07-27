import { initConnection, endConnection, getAvailablePurchases, purchaseUpdatedListener, purchaseErrorListener, finishTransaction, requestPurchase } from 'react-native-iap';
import { Platform } from 'react-native';
import { settings$ } from '../../state/settings';
import { overlay } from '../../overlay/overlay';
import { t } from '../i18n/t';

export const PREMIUM_PRODUCT_ID = 'licham_premium';

let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;
let isConnected = false;

export const iapManager = {
  async init() {
    // Skip IAP on emulator/dev builds — billing service is unavailable
    if (__DEV__) {
      console.log('[IAP] Skipping IAP init in dev mode.');
      return;
    }
    try {
      const result = await initConnection();
      isConnected = !!result;

      if (!isConnected) {
        // No billing service available (emulator, no Play Store, etc.)
        if (__DEV__) {
          console.log('[IAP] Billing service not available — skipping IAP setup (dev mode).');
        }
        return;
      }

      // Auto restore/verify existing active purchases on app launch
      await this.verifyPurchases();

      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
        purchaseUpdateSubscription = null;
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
        purchaseErrorSubscription = null;
      }

      // Listen for incoming real-time purchases
      purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
        if (purchase.productId === PREMIUM_PRODUCT_ID) {
          settings$.isPremium.set(true);
          try {
            await finishTransaction({ purchase, isConsumable: false });
          } catch (ackErr) {
            console.log('[IAP] Failed to finish transaction', ackErr);
          }
          overlay.showToast(t('iap.thanks_upgrade'), { type: 'success' });
        }
      });

      purchaseErrorSubscription = purchaseErrorListener((error) => {
        if (__DEV__) {
          console.log('[IAP] Purchase error (non-fatal):', error.message);
        }
      });
    } catch (err: any) {
      // ServiceDisconnected, billing unavailable, emulator — all non-fatal
      if (__DEV__) {
        console.log('[IAP] Init skipped:', err?.message || err);
      }
    }
  },

  async verifyPurchases() {
    if (!isConnected) return false;
    try {
      const purchases = await getAvailablePurchases();
      const hasPremium = purchases.some(p => p.productId === PREMIUM_PRODUCT_ID);
      if (hasPremium) {
        settings$.isPremium.set(true);
      }
      return hasPremium;
    } catch (err: any) {
      if (__DEV__) {
        console.log('[IAP] Could not verify purchases:', err?.message || err);
      }
      return false;
    }
  },

  async restorePurchases() {
    if (!isConnected) {
      overlay.showToast(t('iap.service_unavailable'), { type: 'error' });
      return;
    }
    try {
      const hasPremium = await this.verifyPurchases();
      if (hasPremium) {
        overlay.showToast(t('iap.restore_success'), { type: 'success' });
      } else {
        overlay.showToast(t('iap.restore_not_found'), { type: 'info' });
      }
    } catch (err) {
      overlay.showToast(t('iap.restore_error'), { type: 'error' });
    }
  },

  async buyPremium() {
    if (!isConnected) {
      overlay.showToast(t('iap.service_unavailable'), { type: 'error' });
      return;
    }
    try {
      await requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: PREMIUM_PRODUCT_ID },
          google: { skus: [PREMIUM_PRODUCT_ID] }
        }
      });
    } catch (err: any) {
      if (__DEV__) console.log('[IAP] Purchase error:', err?.message || err);
    }
  },

  destroy() {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
    isConnected = false;
    endConnection().catch(() => {});
  }
};
