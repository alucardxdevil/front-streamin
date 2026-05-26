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
    // Solo usar localStorage si el usuario eligió el idioma manualmente
    const manuallySet = localStorage.getItem("languageManuallySet");
    if (manuallySet === "true") {
      const saved = localStorage.getItem("language");
      if (saved && supportedLanguages.includes(saved)) {
        return saved;
      }
    }
    // Detectar idioma del navegador
    return detectBrowserLanguage();
  });

  // Guardar idioma en localStorage y actualizar atributo lang del HTML cuando cambia
  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  // Wrapper para setLanguage que marca la selección como manual
  const changeLanguage = (lang) => {
    localStorage.setItem("languageManuallySet", "true");
    setLanguage(lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
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
