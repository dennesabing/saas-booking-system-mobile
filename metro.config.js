const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Stub react-native-nitro-modules and react-native-iap for Expo Go.
// react-native-iap v15 uses Nitro (JSI native module) which requires a
// custom dev build — Expo Go cannot load it. The payment/IapPaymentMode.ts
// is guarded by resolvePaymentMode() so in mock/dev mode it's never called.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native-nitro-modules' ||
    moduleName.startsWith('react-native-iap')
  ) {
    return {
      filePath: require.resolve('./stubs/react-native-iap.stub.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Fix: Metro sends multipart/mixed chunked responses that OkHttp in Expo Go
// cannot parse on Windows (CR+LF encoding mismatch). Strip the Accept header
// so Metro falls back to a plain application/javascript response.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.headers && req.headers.accept) {
        req.headers.accept = req.headers.accept
          .split(',')
          .filter((t) => !t.includes('multipart'))
          .join(',') || 'application/javascript';
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
