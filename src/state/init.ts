import { configureObservablePersistence } from '@legendapp/state/persist';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { MMKV } from 'react-native-mmkv';

configureObservablePersistence({
  pluginLocal: ObservablePersistMMKV,
});

// One-time cleanup: purge stale lunar cache that was previously persisted
// by a buggy stub algorithm. The key 'app_lunarCache' was written by
// persistObservable(calendar$.lunarCache, { local: 'app_lunarCache' })
// which no longer exists. Any data under that key is wrong and must be deleted.
const storage = new MMKV();
if (storage.contains('app_lunarCache')) {
  storage.delete('app_lunarCache');
  console.log('[init] Purged stale app_lunarCache from MMKV');
}
