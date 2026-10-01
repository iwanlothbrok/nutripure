import { ADDITIVES_DB } from '../data/additivesDb.js';

/**
 * Парсва суров текст на етикет/съставки и извлича:
 * 1. Намерени E-номера (e100, e250, e621 и т.н.)
 * 2. Скрити подозрителни съставки (палмово масло, царевичен сироп, аспартам и т.н.)
 * 3. Изчислява безопасност и генерира пълна характеристика
 */
export function analyzeIngredientsText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  const text = rawText.toLowerCase();

  // 1. Търсене на E-номера: формати "E102", "E-102", "e 102", "e102a"
  const eMatches = new Set();
  const eRegex = /\b[eе][\s-]?([0-9]{3,4}[a-z]?)\b/gi;
  let match;
  while ((match = eRegex.exec(rawText)) !== null) {
    const code = 'e' + match[1].toLowerCase();
    eMatches.add(code);
  }

  // 2. Търсене по имена на известни добавки от нашата база (напр. "натриев бензоат", "аспартам", "глутамат")
  Object.keys(ADDITIVES_DB).forEach(code => {
    const item = ADDITIVES_DB[code];
    if (item && item.name) {
      const nameLower = item.name.toLowerCase();
      // Проверка на основни термини от името
      const cleanName = nameLower.replace(/\([^)]*\)/g, '').trim();
      if (cleanName.length > 4 && text.includes(cleanName)) {
        eMatches.add(code);
      }
    }
  });

  // 3. Формиране на списъка с разпознати добавки
  const recognizedAdditives = [];
  let worstRisk = 'safe';

  const riskWeight = { safe: 0, low: 1, moderate: 2, high: 3 };

  eMatches.forEach(code => {
    const data = ADDITIVES_DB[code] || {
      name: `Добавка ${code.toUpperCase()}`,
      risk: 'low',
      type: 'Хранителна добавка',
      note: 'Одобрена за употреба в ЕС добавка.'
    };

    recognizedAdditives.push({
      code: code.toUpperCase(),
      name: data.name,
      risk: data.risk,
      type: data.type,
      note: data.note
    });

    if (riskWeight[data.risk] > riskWeight[worstRisk]) {
      worstRisk = data.risk;
    }
  });

  // 4. Детекция на червени флагове в състава
  const flags = [];
  if (text.includes('палмов') || text.includes('палма') || text.includes('aceite de palma') || text.includes('palm oil')) {
    flags.push({
      type: 'warning',
      title: 'Палмово масло',
      desc: 'Съдържа наситени палмови мазнини, свързани с повишен лош холестерол.'
    });
  }

  if (text.includes('глюкозо-фруктозен') || text.includes('глюкозен сироп') || text.includes('jarabe de glucosa') || text.includes('high fructose')) {
    flags.push({
      type: 'warning',
      title: 'Глюкозо-фруктозен сироп',
      desc: 'Рафиниран евтин подсладител с висок гликемичен индекс.'
    });
  }

  if (text.includes('хидрогениран') || text.includes('частично хидрогенирани') || text.includes('grasas hidrogenadas') || text.includes('trans')) {
    flags.push({
      type: 'danger',
      title: 'Трансмазнини / Хидрогенирани мазнини',
      desc: 'Силно вредни индустриални мазнини, увеличаващи риска от сърдечно-съдови болести.'
    });
  }

  if (text.includes('глутамат') || text.includes('мононатриев глутамат') || text.includes('glutamato')) {
    flags.push({
      type: 'warning',
      title: 'Усилвател на вкуса (Глутамат)',
      desc: 'Изкуствено стимулира апетита и може да предизвика свръхвъзбудимост.'
    });
  }

  // 5. Изчисляване на оценка за чистота (1-100)
  let cleanScore = 95;
  recognizedAdditives.forEach(a => {
    if (a.risk === 'high') cleanScore -= 25;
    else if (a.risk === 'moderate') cleanScore -= 12;
    else if (a.risk === 'low') cleanScore -= 4;
  });

  flags.forEach(f => {
    if (f.type === 'danger') cleanScore -= 20;
    else cleanScore -= 10;
  });

  cleanScore = Math.max(10, Math.min(100, cleanScore));

  let statusText = 'Чист състав';
  let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (cleanScore < 45 || worstRisk === 'high') {
    statusText = 'Критични добавки';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (cleanScore < 75 || worstRisk === 'moderate') {
    statusText = 'Умерено количество Е-номера';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  return {
    rawText,
    additives: recognizedAdditives,
    flags,
    cleanScore,
    worstRisk,
    statusText,
    statusColor,
    totalCount: recognizedAdditives.length
  };
}
