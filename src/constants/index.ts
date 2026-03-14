import i18n from "i18next";

export const LOCAL_STORAGE_KEYS = {
    LANGUAGE: "lang",
    THEME: "theme",
};

export const IPC_CHANNELS = {
    START_ORPC_SERVER: "start-orpc-server",
};

export const faqs = [
    {
        question: () => i18n.t("faqs.0.question"),
        answer: () => i18n.t("faqs.0.answer"),
    },
    {
        question: () => i18n.t("faqs.1.question"),
        answer: () => i18n.t("faqs.1.answer"),
    },
    {
        question: () => i18n.t("faqs.2.question"),
        answer: () => i18n.t("faqs.2.answer"),
    },
] as const;