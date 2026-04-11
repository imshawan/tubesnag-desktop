import { LOCAL_STORAGE_KEYS } from "@/constants";
import { ipc } from "@/ipc/manager";

export interface ThemePreferences {
  system: ThemeMode;
  local: ThemeMode | null;
}

export async function getCurrentTheme(): Promise<ThemePreferences> {
  const currentTheme = await ipc.client.theme.getCurrentThemeMode();
  const localTheme = localStorage.getItem(
    LOCAL_STORAGE_KEYS.THEME
  ) as ThemeMode | null;

  return {
    system: currentTheme,
    local: localTheme,
  };
}

export async function setTheme(newTheme: ThemeMode) {
  const isDarkMode = newTheme === "dark";
  await ipc.client.theme.setThemeMode(newTheme);
  localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme);
  updateDocumentTheme(isDarkMode);
}

export async function toggleTheme() {
  console.log("Toggle theme invoked");
  let [isDarkMode, currentTheme] = await Promise.all([
    resolvePromiseWithTimeout<boolean>(ipc.client.theme.toggleThemeMode()),
    resolvePromiseWithTimeout<ThemeMode>(ipc.client.theme.getCurrentThemeMode())
  ]);

  let newTheme = isDarkMode ? "dark" : "light"; // light

  // Meaning IPC failed on first run, need to manually toggle
  if (!isDarkMode && !currentTheme) {
    newTheme = isDarkModeEnabled() ? "light"
      : "dark";

    isDarkMode = newTheme === "dark";
  }

  updateDocumentTheme(isDarkMode || (newTheme === "dark"));
  localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme);
}

export async function syncWithLocalTheme() {
  const { local, system } = await getCurrentTheme();
  if (!local) {
    if (system === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      updateDocumentTheme(isDark);
    } else {
      updateDocumentTheme(system === "dark");
    }
    return;
  }

  await setTheme(local);
}

function isDarkModeEnabled(): boolean {
  const localTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as
      | ThemeMode
      | null;


  return localTheme === "dark" || document.documentElement.classList.contains("dark");
}

function updateDocumentTheme(isDarkMode: boolean) {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

async function resolvePromiseWithTimeout<T>(
    promise: Promise<any>,
    timeout: number = 100
): Promise<T> {
  const timer = new Promise<void>((resolve) => setTimeout(resolve, timeout));

  // Race them: first one to finish wins
  return Promise.race([promise, timer]);
}
