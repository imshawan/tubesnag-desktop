
export async function checkSetupRequired(): Promise<boolean> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await globalThis.electron?.checkDependencies?.();
    if (!result) return true;
    
    return !(result.db && result.ytdlp && result.ffmpeg);
  } catch (error) {
    console.error("Setup check failed:", error);
    return true;
  }
}

export async function installDependencies(): Promise<DependencyStatus | undefined | null> {
  try {
    return await globalThis.electron?.installDependencies();
  } catch (error) {
    console.error("Install dependencies failed:", error);
    return null;
  }
}

export async function getDiskUsageStats(path: string) {
  try {
    return await globalThis.electron?.getDiskUsage(path);
  } catch (error) {
    console.error("Disk usage check failed:", error);
  }
}