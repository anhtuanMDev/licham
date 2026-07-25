import { initConnection, endConnection, getAvailablePurchases, purchaseUpdatedListener, purchaseErrorListener } from 'react-native-iap';
import { settings$ } from '../../state/settings';
import { overlay } from '../../overlay/overlay';

export const PREMIUM_PRODUCT_ID = 'licham_premium';

let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;

export const iapManager = {
  async init() {
    try {
      await initConnection();
      
      // Auto restore/verify existing active purchases on app launch
      await this.verifyPurchases();

      // Listen for incoming real-time purchases
      purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
        if (purchase.productId === PREMIUM_PRODUCT_ID || purchase.productId) {
          settings$.isPremium.set(true);
          overlay.showToast('Cảm ơn bạn đã nâng cấp Premium!');
        }
      });

      purchaseErrorSubscription = purchaseErrorListener((error) => {
        console.warn('IAP purchaseErrorListener:', error);
      });
    } catch (err) {
      console.warn('Failed to initialize IAP connection:', err);
    }
  },

  async verifyPurchases() {
    try {
      const purchases = await getAvailablePurchases();
      const hasPremium = purchases.some(p => p.productId === PREMIUM_PRODUCT_ID);
      if (hasPremium) {
        settings$.isPremium.set(true);
      }
      return hasPremium;
    } catch (err) {
      console.warn('Failed to verify purchases:', err);
      return false;
    }
  },

  async restorePurchases() {
    try {
      const hasPremium = await this.verifyPurchases();
      if (hasPremium) {
        overlay.showToast('Khôi phục mua hàng thành công!', { type: 'success' });
      } else {
        overlay.showToast('Không tìm thấy giao dịch mua Premium trước đó.', { type: 'info' });
      }
    } catch (err) {
      overlay.showToast('Không thể khôi phục mua hàng. Vui lòng thử lại sau.', { type: 'error' });
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
    endConnection().catch(() => {});
  }
};
