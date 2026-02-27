import { format, register } from 'timeago.js';

// Locale para español
const localeES = (number, index) => [
  ['justo ahora', 'ahora mismo'],
  ['hace %s segundos', 'en %s segundos'],
  ['hace 1 minuto', 'en 1 minuto'],
  ['hace %s minutos', 'en %s minutos'],
  ['hace 1 hora', 'en 1 hora'],
  ['hace %s horas', 'en %s horas'],
  ['hace 1 día', 'en 1 día'],
  ['hace %s días', 'en %s días'],
  ['hace 1 semana', 'en 1 semana'],
  ['hace %s semanas', 'en %s semanas'],
  ['hace 1 mes', 'en 1 mes'],
  ['hace %s meses', 'en %s meses'],
  ['hace 1 año', 'en 1 año'],
  ['hace %s años', 'en %s años'],
][index];

// Locale para portugués
const localePT = (number, index) => [
  ['agora mesmo', 'agora mesmo'],
  ['há %s segundos', 'em %s segundos'],
  ['há 1 minuto', 'em 1 minuto'],
  ['há %s minutos', 'em %s minutos'],
  ['há 1 hora', 'em 1 hora'],
  ['há %s horas', 'em %s horas'],
  ['há 1 dia', 'em 1 dia'],
  ['há %s dias', 'em %s dias'],
  ['há 1 semana', 'em 1 semana'],
  ['há %s semanas', 'em %s semanas'],
  ['há 1 mês', 'em 1 mês'],
  ['há %s meses', 'em %s meses'],
  ['há 1 ano', 'em 1 ano'],
  ['há %s anos', 'em %s anos'],
][index];

// Locale para alemán
const localeDE = (number, index) => [
  ['gerade eben', 'gerade eben'],
  ['vor %s Sekunden', 'in %s Sekunden'],
  ['vor 1 Minute', 'in 1 Minute'],
  ['vor %s Minuten', 'in %s Minuten'],
  ['vor 1 Stunde', 'in 1 Stunde'],
  ['vor %s Stunden', 'in %s Stunden'],
  ['vor 1 Tag', 'in 1 Tag'],
  ['vor %s Tagen', 'in %s Tagen'],
  ['vor 1 Woche', 'in 1 Woche'],
  ['vor %s Wochen', 'in %s Wochen'],
  ['vor 1 Monat', 'in 1 Monat'],
  ['vor %s Monaten', 'in %s Monaten'],
  ['vor 1 Jahr', 'in 1 Jahr'],
  ['vor %s Jahren', 'in %s Jahren'],
][index];

// Registrar todos los locales
register('es', localeES);
register('pt', localePT);
register('de', localeDE);

/**
 * Map app language to timeago locale
 * @param {string} language - El idioma de la app ('es', 'en', 'pt', 'de')
 * @returns {string} - El locale para timeago
 */
export const getTimeagoLocale = (language) => {
  switch (language) {
    case 'es':
      return 'es';
    case 'pt':
      return 'pt';
    case 'de':
      return 'de';
    default:
      return 'en_US';
  }
};

/**
 * Formatea una fecha usando timeago con el locale correspondiente
 * @param {string|Date} date - La fecha a formatear
 * @param {string} language - El idioma de la app ('es', 'en', 'pt', 'de')
 * @returns {string} - La fecha formateada
 */
export const formatTimeago = (date, language = 'en') => {
  const locale = getTimeagoLocale(language);
  return format(date, locale);
};

export { format };
