import { configureObservablePersistence } from '@legendapp/state/persist';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

configureObservablePersistence({
  pluginLocal: ObservablePersistMMKV,
});


