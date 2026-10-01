import { OFFLINE_FOODS } from '../data/offlineFoodsDb.js';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'NutriPureApp - FoodSafetyScanner - Version 1.0';

// Кеш в паметта
const cache = new Map();

/**
 * Търси продукт по баркод
 * 1. Проверява кеша
 * 2. Проверява вградената офлайн база (за България и Испания)
 * 3. Извиква Open Food Facts API
 */
export async function getProductByBarcode(barcode) {
  if (!barcode) return null;
  const cleanCode = barcode.trim();

  // 1. Кеш
  if (cache.has(cleanCode)) {
    return cache.get(cleanCode);
  }

  // 2. Вградена база за България и Испания (мигновена скорост)
  const offlineMatch = OFFLINE_FOODS.find(p => p.code === cleanCode);
  if (offlineMatch) {
    cache.set(cleanCode, offlineMatch);
    return offlineMatch;
  }

  // 3. Open Food Facts онлайн заявка с таймаут
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(`${BASE_URL}/product/${cleanCode}.json?fields=code,product_name,product_name_bg,product_name_es,brands,categories,image_url,image_front_url,nutriscore_grade,nutriscore_score,nova_group,ecoscore_grade,additives_tags,ingredients_text,ingredients_text_bg,ingredients_text_es,nutriments,labels_tags,countries_tags_en`, {
      headers: {
        'User-Agent': USER_AGENT
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 1 && data.product) {
        const p = data.product;
        const normalized = {
          code: p.code || cleanCode,
          product_name: p.product_name_bg || p.product_name || p.product_name_es || 'Хранителен продукт',
          brands: p.brands || 'Неизвестна марка',
          category: p.categories?.split(',')[0] || 'Храни',
          image_url: p.image_front_url || p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
          nutriscore_grade: p.nutriscore_grade || 'c',
          nova_group: p.nova_group || 3,
          ecoscore_grade: p.ecoscore_grade || 'c',
          additives_tags: p.additives_tags || [],
          ingredients_text: p.ingredients_text_bg || p.ingredients_text || p.ingredients_text_es || 'Съставките не са въведени за този продукт.',
          nutriments: p.nutriments || {},
          labels_tags: p.labels_tags || [],
          country: (p.countries_tags_en || []).includes('bulgaria') ? 'BG' : (p.countries_tags_en || []).includes('spain') ? 'ES' : 'ALL'
        };

        cache.set(cleanCode, normalized);
        return normalized;
      }
    }
  } catch (error) {
    console.warn('Open Food Facts API error, using fallback if available:', error);
  }

  return null;
}

/**
 * Търси продукти по име или текст (на български, испански или английски)
 */
export async function searchProducts(query, country = 'ALL') {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();

  // Филтриране на офлайн базата
  const localResults = OFFLINE_FOODS.filter(p => {
    const matchesName = (p.product_name || '').toLowerCase().includes(q) ||
                        (p.brands || '').toLowerCase().includes(q) ||
                        (p.supermarket || '').toLowerCase().includes(q) ||
                        (p.category || '').toLowerCase().includes(q) ||
                        p.code.includes(q);
    const matchesCountry = country === 'ALL' || p.country === country || p.country === 'ALL';
    return matchesName && matchesCountry;
  });

  // Онлайн търсене
  try {
    const countryFilter = country === 'BG' ? '&countries_tags_en=bulgaria' : country === 'ES' ? '&countries_tags_en=spain' : '';
    const url = `${BASE_URL}/search?search_terms=${encodeURIComponent(q)}${countryFilter}&page_size=15&fields=code,product_name,product_name_bg,product_name_es,brands,image_url,image_front_url,nutriscore_grade,nova_group,additives_tags,nutriments,countries_tags_en`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.products) {
        const onlineProducts = data.products
          .filter(p => p.product_name && p.code)
          .map(p => ({
            code: p.code,
            product_name: p.product_name_bg || p.product_name || p.product_name_es,
            brands: p.brands || 'Стандартен производител',
            image_url: p.image_front_url || p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
            nutriscore_grade: p.nutriscore_grade || 'c',
            nova_group: p.nova_group || 3,
            additives_tags: p.additives_tags || [],
            nutriments: p.nutriments || {},
            country: (p.countries_tags_en || []).includes('bulgaria') ? 'BG' : (p.countries_tags_en || []).includes('spain') ? 'ES' : 'ALL'
          }));

        // Обединяване без дубликати по баркод
        const combined = [...localResults];
        const seenCodes = new Set(localResults.map(p => p.code));

        for (const op of onlineProducts) {
          if (!seenCodes.has(op.code)) {
            combined.push(op);
            seenCodes.add(op.code);
          }
        }

        return combined;
      }
    }
  } catch (err) {
    console.warn('Search API failed, returning local matches:', err);
  }

  return localResults;
}
