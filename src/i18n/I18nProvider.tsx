import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lang, translations } from "./translations";

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LANG_KEY = "odaki_lang";

const I18nContext = createContext<I18nCtx | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved === "tr" || saved === "en") setLangState(saved);
      } catch {}
    })();
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  };

  const t = (key: string) => translations[lang][key] ?? key;

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
