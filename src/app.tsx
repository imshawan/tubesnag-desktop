import { RouterProvider } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { updateAppLanguage } from "./actions/language";
import { syncWithLocalTheme } from "./actions/theme";
import { router } from "@/lib/utils/routes";
import { store } from "@/store";
import { Provider } from "react-redux";
import { checkSetupRequired } from "@/lib/utils/setup";
import { useApp } from "@/hooks/useApp";
import { ipc } from "./ipc/manager";
import { Loader } from "./components/loader";
import "./localization/i18n";
import { invalidateFirstSpinUp, isFirstSpinUp } from "./lib/utils/app";

function AppContent() {
  const { i18n } = useTranslation();
  const { isAppStateSaving, setupComplete } = useApp();
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);

  useEffect(() => {
    updateAppLanguage(i18n);
  }, [i18n]);

  useEffect(() => {
    const initTheme = async () => {
      try {
        await syncWithLocalTheme();
      } catch (err: any) {
        console.error(err);
      }
    };

    initTheme();
  }, []);

  useEffect(() => {
    if (isAppStateSaving) {
      router.navigate({ to: "/closing" });
    }
  }, [isAppStateSaving]);

  useEffect(() => {
    checkSetupRequired().then((setupRequired) => {
      setSetupRequired(setupRequired);
      if (setupRequired) {
        router.navigate({ to: "/setup" });
      }
    });
  }, []);

  useEffect(() => {
    if (setupComplete) {
      setSetupRequired(false);
      router.navigate({ to: "/" });
    }
  }, [setupComplete]);

  if (setupRequired === null) {
    return null;
  }

  if (setupRequired && !setupComplete) {
    router.navigate({ to: "/setup" });
  }

  return <RouterProvider router={router} />;
}

function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const delayRequired = isFirstSpinUp() ? 5000 : 0;

    const initIpc = () => {
      ipc.initialize();
      setIsAppReady(true);
    }

    if (!delayRequired) {
      initIpc();
      return;
    }
    
    const timeout = setTimeout(() => {
      initIpc();
      invalidateFirstSpinUp();
    }, delayRequired);

    return () => clearTimeout(timeout);
  }, []);

  if (!isAppReady) {
    return (
      <div className="flex items-center bg-black justify-center h-[100vh]">
        <Loader forceDark={true} />
      </div>
    );
  }

  return <AppContent />;
}

const container = document.getElementById("app");
if (!container) {
  throw new Error('Root element with id "app" not found');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
