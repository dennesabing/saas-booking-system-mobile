# react-native-iap + Expo dev build

`react-native-iap` is a native module — it cannot run in Expo Go. After this
package is added, anyone testing the upgrade flow on a phone needs an EAS dev
build:

    npx eas build --profile development --platform ios
    npx eas build --profile development --platform android

Web (`expo start --web`) and Maestro/CI runs in `payment_mode=mock` are
unaffected.
