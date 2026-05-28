import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SUPPORTED_LANGUAGES,
  loadMessages,
  getInitialLanguage,
} from "../i18n";

const LanguageContext = createContext();

// Idiomas soportados por la aplicación (lista estática, ~50 bytes; los
// diccionarios completos se cargan por separado vía import dinámico).
const supportedLanguages = SUPPORTED_LANGUAGES;

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);
  // Diccionario del idioma activo. null mientras carga el primer chunk.
  const [messages, setMessages] = useState(null);

  // Cargar el diccionario del idioma activo. Cada idioma es un chunk aparte,
  // así que sólo descargamos el que el usuario realmente usa.
  useEffect(() => {
    let active = true;

    loadMessages(language)
      .then((dict) => {
        if (active) setMessages(dict);
      })
      .catch((err) => {
        console.error(`[i18n] Error cargando idioma "${language}":`, err);
        if (active) setMessages({}); // Degradar a claves crudas antes que colgar
      });

    try {
      localStorage.setItem("language", language);
    } catch {
      // localStorage no disponible
    }
    document.documentElement.lang = language;

    return () => {
      active = false;
    };
  }, [language]);

  // Wrapper para setLanguage que marca la selección como manual
  const changeLanguage = (lang) => {
    if (!supportedLanguages.includes(lang)) return;
    try {
      localStorage.setItem("languageManuallySet", "true");
    } catch {
      // localStorage no disponible
    }
    setLanguageState(lang);
  };

  // El diccionario ya viene completo con fallback a inglés horneado en tiempo
  // de build (ver scripts/splitTranslations.mjs), así que aquí basta con
  // devolver la clave si no existe.
  const t = (key) => (messages && messages[key]) || key;

  // No renderizar la app hasta tener el primer diccionario, para evitar un
  // flash de claves crudas. El chunk de locale es pequeño (~10-15 KB gzip) y
  // se cachea, así que el retraso es mínimo (equivalente al PersistGate).
  if (!messages) return null;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
