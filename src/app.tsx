import { RouterProvider } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { updateAppLanguage } from "./actions/language";
import { syncWithLocalTheme } from "./actions/theme";
import { router } from "@/lib/utils/routes";
import "./localization/i18n";
import { store } from "@/store";
import { Provider } from "react-redux";
import { checkSetupRequired } from "@/lib/utils/setup";
import {useApp} from "@/hooks/useApp";

function AppContent() {
  const { i18n } = useTranslation();
  const {isAppStateSaving, setupComplete} = useApp();
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
    checkSetupRequired().then(setupRequired => {
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
  </React.StrictMode>
);
