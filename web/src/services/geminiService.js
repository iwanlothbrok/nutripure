/**
 * Google Gemini 1.5 Flash Service
 * Осигурява бърз и безплатен AI нутриционистичен анализ на хранителни съставки,
 * етикети от снимка или детайли на сканиран продукт.
 */

// Потребителският ключ се запазва в localStorage за пълна сигурност и лесна промяна
export function getGeminiApiKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

export function setGeminiApiKey(key) {
  if (key) {
    localStorage.setItem('gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}

/**
 * Изпраща заявка към Gemini 1.5 Flash за подробен експертен анализ на продукт/съставки
 */
export async function askGeminiNutritionist({ productName, ingredientsText, brand, score, additives = [], rawImageBase64 = null }) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
Ти си елитен клиничен нутриционист и токсиколог в премиум мобилното приложение "NutriPure". Твоята задача е да направиш бърз, авторитетен и изключително полезен за потребителя анализ на хранителен продукт на чист български език.

ИНФОРМАЦИЯ ЗА ПРОДУКТА:
- Име: ${productName || 'Неизвестен продукт'}
- Марка/Супермаркет: ${brand || 'Не е посочена'}
- Оценка на чистота/здравословност: ${score || 'Няма'} / 100
- Открити Е-номера: ${additives.join(', ') || 'Няма посочени'}
- Текст на съставките: """${ingredientsText || 'Няма въведен списък'}"""

ИЗИСКВАНИЯ КЪМ ОТГОВОРА:
1. Пиши кратко, директно и приятелски, структурирано в следните 3 кратки точки:
- 🩺 **Медицинска присъда:** (1-2 изречения: здравословно ли е, подходящо ли е за редовна консумация или трябва да се избягва)
- ⚠️ **Скрити рискове:** (Ако има палмово масло, добавени захари, вредни Е-номера като E250/E150d, трансмазнини или алергени — назови ги поименно и обясни кратко защо са проблем)
- 💡 **Здравословна препоръка:** (По-чиста алтернатива за пазаруване в супермаркета — Mercadona/Lidl/Billa/Kaufland)

Не използвай излишни уводи или общи фрази. Бъди точен и професионален.
`;

  const contents = [];

  if (rawImageBase64) {
    // Vision анализ директно от снимка
    contents.push({
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: rawImageBase64.replace(/^data:image\/\w+;base64,/, '')
          }
        }
      ]
    });
  } else {
    contents.push({
      parts: [{ text: prompt }]
    });
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Няма върнат отговор от Gemini.';
  return replyText;
}
