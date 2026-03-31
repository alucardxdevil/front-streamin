import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "./translations";

const LanguageContext = createContext();

// Idiomas soportados por la aplicación
const supportedLanguages = Object.keys(translations);

/**
 * Detecta el idioma del navegador y devuelve el código de idioma soportado.
 * Si el idioma del navegador no está soportado, retorna "en" como fallback.
 */
const detectBrowserLanguage = () => {
  // navigator.languages es un array ordenado por preferencia del usuario
  const browserLanguages = navigator.languages
    ? [...navigator.languages]
    : [navigator.language || navigator.userLanguage || "en"];

  for (const lang of browserLanguages) {
    // Extraer el código base del idioma (ej: "es-MX" -> "es", "pt-BR" -> "pt")
    const baseLang = lang.split("-")[0].toLowerCase();
    if (supportedLanguages.includes(baseLang)) {
      return baseLang;
    }
  }

  // Fallback a inglés si ningún idioma del navegador es soportado
  return "en";
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Recuperar idioma del localStorage, o detectar del navegador, o usar "en" como defecto
    return localStorage.getItem("language") || detectBrowserLanguage();
  });

  // Guardar idioma en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
