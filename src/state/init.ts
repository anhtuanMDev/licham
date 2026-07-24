import { configureObservablePersistence } from '@legendapp/state/persist';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

// Global configuration for legend-state persistence
configureObservablePersistence({
  pluginLocal: ObservablePersistMMKV,
});
