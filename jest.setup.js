// Pre-define all globals that expo/src/winter/runtime.native.ts lazily installs
// via installGlobal(). In the jest sandbox those lazy require() calls throw
// "You are trying to import a file outside of the scope of the test code."
// Providing stub values here prevents the lazy getters from ever firing.
if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
  globalThis.__ExpoImportMetaRegistry = { url: null };
}
if (typeof globalThis.structuredClone === 'undefined') {
  // Node 17+ has structuredClone natively; for older Node provide a simple clone.
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}
