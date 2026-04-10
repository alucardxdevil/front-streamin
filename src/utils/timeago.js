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

// Locale para ruso
const localeRU = (number, index) => [
  ['только что', 'прямо сейчас'],
  ['%s секунд назад', 'через %s секунд'],
  ['1 минуту назад', 'через 1 минуту'],
  ['%s минут назад', 'через %s минут'],
  ['1 час назад', 'через 1 час'],
  ['%s часов назад', 'через %s часов'],
  ['1 день назад', 'через 1 день'],
  ['%s дней назад', 'через %s дней'],
  ['1 неделю назад', 'через 1 неделю'],
  ['%s недель назад', 'через %s недель'],
  ['1 месяц назад', 'через 1 месяц'],
  ['%s месяцев назад', 'через %s месяцев'],
  ['1 год назад', 'через 1 год'],
  ['%s лет назад', 'через %s лет'],
][index];

// Locale para chino simplificado
const localeZH = (number, index) => [
  ['刚刚', '马上'],
  ['%s 秒前', '%s 秒后'],
  ['1 分钟前', '1 分钟后'],
  ['%s 分钟前', '%s 分钟后'],
  ['1 小时前', '1 小时后'],
  ['%s 小时前', '%s 小时后'],
  ['1 天前', '1 天后'],
  ['%s 天前', '%s 天后'],
  ['1 周前', '1 周后'],
  ['%s 周前', '%s 周后'],
  ['1 个月前', '1 个月后'],
  ['%s 个月前', '%s 个月后'],
  ['1 年前', '1 年后'],
  ['%s 年前', '%s 年后'],
][index];

// Locale para japonés
const localeJP = (number, index) => [
  ['たった今', 'すぐに'],
  ['%s 秒前', '%s 秒後'],
  ['1 分前', '1 分後'],
  ['%s 分前', '%s 分後'],
  ['1 時間前', '1 時間後'],
  ['%s 時間前', '%s 時間後'],
  ['1 日前', '1 日後'],
  ['%s 日前', '%s 日後'],
  ['1 週間前', '1 週間後'],
  ['%s 週間前', '%s 週間後'],
  ['1 か月前', '1 か月後'],
  ['%s か月前', '%s か月後'],
  ['1 年前', '1 年後'],
  ['%s 年前', '%s 年後'],
][index];

// Locale para francés
const localeFR = (number, index) => [
  ['à l’instant', 'à l’instant'],
  ['il y a %s secondes', 'dans %s secondes'],
  ['il y a 1 minute', 'dans 1 minute'],
  ['il y a %s minutes', 'dans %s minutes'],
  ['il y a 1 heure', 'dans 1 heure'],
  ['il y a %s heures', 'dans %s heures'],
  ['il y a 1 jour', 'dans 1 jour'],
  ['il y a %s jours', 'dans %s jours'],
  ['il y a 1 semaine', 'dans 1 semaine'],
  ['il y a %s semaines', 'dans %s semaines'],
  ['il y a 1 mois', 'dans 1 mois'],
  ['il y a %s mois', 'dans %s mois'],
  ['il y a 1 an', 'dans 1 an'],
  ['il y a %s ans', 'dans %s ans'],
][index];

// Locale para hindi
const localeHI = (number, index) => [
  ['अभी', 'अभी'],
  ['%s सेकंड पहले', '%s सेकंड में'],
  ['1 मिनट पहले', '1 मिनट में'],
  ['%s मिनट पहले', '%s मिनट में'],
  ['1 घंटा पहले', '1 घंटे में'],
  ['%s घंटे पहले', '%s घंटे में'],
  ['1 दिन पहले', '1 दिन में'],
  ['%s दिन पहले', '%s दिन में'],
  ['1 हफ्ता पहले', '1 हफ्ते में'],
  ['%s हफ्ते पहले', '%s हफ्तों में'],
  ['1 महीना पहले', '1 महीने में'],
  ['%s महीने पहले', '%s महीनों में'],
  ['1 साल पहले', '1 साल में'],
  ['%s साल पहले', '%s सालों में'],
][index];

// Locale para árabe
const localeAR = (number, index) => [
  ['الآن', 'الآن'],
  ['منذ %s ثانية', 'خلال %s ثانية'],
  ['منذ دقيقة واحدة', 'خلال دقيقة واحدة'],
  ['منذ %s دقائق', 'خلال %s دقائق'],
  ['منذ ساعة واحدة', 'خلال ساعة واحدة'],
  ['منذ %s ساعات', 'خلال %s ساعات'],
  ['منذ يوم واحد', 'خلال يوم واحد'],
  ['منذ %s أيام', 'خلال %s أيام'],
  ['منذ أسبوع واحد', 'خلال أسبوع واحد'],
  ['منذ %s أسابيع', 'خلال %s أسابيع'],
  ['منذ شهر واحد', 'خلال شهر واحد'],
  ['منذ %s أشهر', 'خلال %s أشهر'],
  ['منذ سنة واحدة', 'خلال سنة واحدة'],
  ['منذ %s سنوات', 'خلال %s سنوات'],
][index];

// Locale para italiano
const localeIT = (number, index) => [
  ['proprio ora', 'proprio ora'],
  ['%s secondi fa', 'tra %s secondi'],
  ['1 minuto fa', 'tra 1 minuto'],
  ['%s minuti fa', 'tra %s minuti'],
  ['1 ora fa', 'tra 1 ora'],
  ['%s ore fa', 'tra %s ore'],
  ['1 giorno fa', 'tra 1 giorno'],
  ['%s giorni fa', 'tra %s giorni'],
  ['1 settimana fa', 'tra 1 settimana'],
  ['%s settimane fa', 'tra %s settimane'],
  ['1 mese fa', 'tra 1 mese'],
  ['%s mesi fa', 'tra %s mesi'],
  ['1 anno fa', 'tra 1 anno'],
  ['%s anni fa', 'tra %s anni'],
][index];

// Locale para coreano
const localeKO = (number, index) => [
  ['방금 전', '곧'],
  ['%s초 전', '%s초 후'],
  ['1분 전', '1분 후'],
  ['%s분 전', '%s분 후'],
  ['1시간 전', '1시간 후'],
  ['%s시간 전', '%s시간 후'],
  ['1일 전', '1일 후'],
  ['%s일 전', '%s일 후'],
  ['1주 전', '1주 후'],
  ['%s주 전', '%s주 후'],
  ['1개월 전', '1개월 후'],
  ['%s개월 전', '%s개월 후'],
  ['1년 전', '1년 후'],
  ['%s년 전', '%s년 후'],
][index];

// Registrar todos los locales
register('es', localeES);
register('pt', localePT);
register('de', localeDE);
register('ru', localeRU);
register('zh', localeZH);
register('jp', localeJP);
register('fr', localeFR);
register('hi', localeHI);
register('ar', localeAR);
register('it', localeIT);
register('ko', localeKO);

/**
 * Map app language to timeago locale
 * @param {string} language - El idioma de la app ('es', 'en', 'pt', 'de', 'ru', 'zh', 'jp', 'fr', 'hi', 'ar', 'it', 'ko')
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
    case 'ru':
      return 'ru';
    case 'zh':
      return 'zh';
    case 'jp':
      return 'jp';
    case 'fr':
      return 'fr';
    case 'hi':
      return 'hi';
    case 'ar':
      return 'ar';
    case 'it':
      return 'it';
    case 'ko':
      return 'ko';
    default:
      return 'en_US';
  }
};

/**
 * Formatea una fecha usando timeago con el locale correspondiente
 * @param {string|Date} date - La fecha a formatear
 * @param {string} language - El idioma de la app ('es', 'en', 'pt', 'de', 'ru', 'zh', 'jp', 'fr', 'hi', 'ar', 'it', 'ko')
 * @returns {string} - La fecha formateada
 */
export const formatTimeago = (date, language = 'en') => {
  const locale = getTimeagoLocale(language);
  return format(date, locale);
};

export { format };
