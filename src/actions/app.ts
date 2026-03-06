export function getPlatform() {
  return (globalThis.electron as any)?.invoke?.('app:get-platform') || Promise.resolve(process.platform);
}

export function getAppVersion() {
  return (globalThis.electron as any)?.invoke?.('app:get-version') || Promise.resolve('0.0.0');
}
