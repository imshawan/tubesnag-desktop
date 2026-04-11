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
  const {isAppStateSaving, setSetupComplete, setupComplete} = useApp();

  useEffect(() => {
    syncWithLocalTheme();
    updateAppLanguage(i18n);
  }, [i18n]);

  useEffect(() => {
    if (isAppStateSaving) {
      router.navigate({ to: "/closing" });
    }

  }, [isAppStateSaving]);

  useEffect(() => {
    checkSetupRequired().then(setupRequired => {
      setSetupComplete(!setupRequired);
      if (setupRequired) {
        router.navigate({ to: "/setup" });
      }
    });
  }, []);

  if (setupComplete === null) {
    return null;
  }

  if (!setupComplete) {
    console.log("setupComplete", setupComplete);
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
