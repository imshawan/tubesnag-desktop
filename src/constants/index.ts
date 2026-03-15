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
    {
        question: () => i18n.t("faqs.3.question"),
        answer: () => i18n.t("faqs.3.answer"),
    },
    {
        question: () => i18n.t("faqs.4.question"),
        answer: () => i18n.t("faqs.4.answer"),
    },
    {
        question: () => i18n.t("faqs.5.question"),
        answer: () => i18n.t("faqs.5.answer"),
    },
    {
        question: () => i18n.t("faqs.6.question"),
        answer: () => i18n.t("faqs.6.answer"),
    },
    {
        question: () => i18n.t("faqs.7.question"),
        answer: () => i18n.t("faqs.7.answer"),
    },
    {
        question: () => i18n.t("faqs.8.question"),
        answer: () => i18n.t("faqs.8.answer"),
    },
    {
        question: () => i18n.t("faqs.9.question"),
        answer: () => i18n.t("faqs.9.answer"),
    },
] as const;