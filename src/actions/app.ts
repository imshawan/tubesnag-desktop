export async function getPlatform() {
  return await globalThis.electron?.getPlatform() || Promise.resolve(process.platform);
}

export async function getAppVersion() {
  return await globalThis.electron?.getAppVersion() || Promise.resolve('0.0.0');
}
