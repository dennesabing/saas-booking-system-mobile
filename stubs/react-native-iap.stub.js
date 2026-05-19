// Stub for react-native-iap and react-native-nitro-modules in Expo Go.
// Must use __esModule=true so _interopNamespace doesn't try to assign .default.
'use strict';

const noop = async () => {};

const stub = {
  __esModule: true,

  // react-native-nitro-modules
  NitroModules: {},
  HybridObject: class HybridObject {},

  // react-native-iap
  initConnection: noop,
  endConnection: noop,
  getSubscriptions: async () => [],
  requestSubscription: async () => ({}),
  getAvailablePurchases: async () => [],
  finishTransaction: noop,
  purchaseUpdatedListener: () => ({ remove: noop }),
  purchaseErrorListener: () => ({ remove: noop }),
};

stub.default = stub;

module.exports = stub;
