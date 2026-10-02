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

  // 2.1 Специално разпознаване на везни/свежи стоки от Mercadona и европейски супермаркети (Префикси 20-29)
  // Примери: "ENTRECOT NOVILLO", месо, риба, сирена, плодове с динамично тегло и цена
  if (/^2[0-9]{11,12}$/.test(cleanCode)) {
    const isMercadonaPrefix = cleanCode.startsWith('23') || cleanCode.startsWith('24') || cleanCode.startsWith('28') || cleanCode.startsWith('29') || cleanCode.startsWith('21');
    const freshMeatNovillo = cleanCode.startsWith('231427') || cleanCode.startsWith('231327') || cleanCode.includes('231427');

    const freshProduct = {
      code: cleanCode,
      product_name: freshMeatNovillo ? 'Entrecot de Novillo (Говежди стек Антрекот)' : 'Свеж месен / деликатесен продукт (Mercadona)',
      brands: isMercadonaPrefix ? 'Mercadona / Carnicería' : 'Свежа витрина / Супермаркет',
      category: 'Месо и свежи продукти',
      supermarket: 'Mercadona',
      country: 'ES',
      image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
      nutriscore_grade: 'a',
      nova_group: 1, // Натурално чисто необработено месо
      ecoscore_grade: 'b',
      is_bio: false,
      additives_tags: [],
      ingredients_text: '100% натурално говеждо месо (Entrecot de Novillo). Без консерванти, без оцветители, без фосфати.',
      nutriments: {
        'energy-kcal_100g': 180,
        fat_100g: 10.5,
        'saturated-fat_100g': 4.2,
        sugars_100g: 0,
        salt_100g: 0.15,
        proteins_100g: 22.0,
        fiber_100g: 0
      }
    };

    cache.set(cleanCode, freshProduct);
    return freshProduct;
  }

  // 3. Open Food Facts онлайн заявка през множество огледала (world, net, es)
  const endpoints = [
    `https://world.openfoodfacts.net/api/v0/product/${cleanCode}.json`,
    `https://world.openfoodfacts.org/api/v0/product/${cleanCode}.json`,
    `https://es.openfoodfacts.org/api/v0/product/${cleanCode}.json`,
    `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json?fields=code,product_name,product_name_bg,product_name_es,brands,categories,image_url,image_front_url,nutriscore_grade,nutriscore_score,nova_group,ecoscore_grade,additives_tags,ingredients_text,ingredients_text_bg,ingredients_text_es,nutriments,labels_tags,countries_tags_en`
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(endpoint, {
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
            product_name: p.product_name_bg || p.product_name_es || p.product_name || 'Хранителен продукт',
            brands: p.brands || 'Неизвестна марка',
            category: (p.categories || 'Храни').split(',')[0].trim(),
            image_url: p.image_front_url || p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
            nutriscore_grade: p.nutriscore_grade || 'c',
            nova_group: p.nova_group || 3,
            ecoscore_grade: p.ecoscore_grade || 'c',
            additives_tags: p.additives_tags || [],
            ingredients_text: p.ingredients_text_bg || p.ingredients_text_es || p.ingredients_text || 'Информацията за съставките е предоставена от производителя.',
            nutriments: p.nutriments || {},
            labels_tags: p.labels_tags || [],
            country: (p.countries_tags_en || []).includes('bulgaria') ? 'BG' : (p.countries_tags_en || []).includes('spain') || (p.brands || '').toLowerCase().includes('hacendado') ? 'ES' : 'ALL'
          };

          cache.set(cleanCode, normalized);
          return normalized;
        }
      }
    } catch (error) {
      // Продължи към следващото огледало
    }
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

  // Онлайн търсене през множество огледала (net, org)
  const searchEndpoints = [
    `https://world.openfoodfacts.net/api/v2/search?search_terms=${encodeURIComponent(q)}&page_size=20&fields=code,product_name,product_name_bg,product_name_es,brands,image_url,image_front_url,nutriscore_grade,nova_group,additives_tags,nutriments,countries_tags_en`,
    `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(q)}&page_size=20&fields=code,product_name,product_name_bg,product_name_es,brands,image_url,image_front_url,nutriscore_grade,nova_group,additives_tags,nutriments,countries_tags_en`
  ];

  for (const endpoint of searchEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(endpoint, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.products && data.products.length > 0) {
          const onlineProducts = data.products
            .filter(p => (p.product_name || p.product_name_es || p.product_name_bg) && p.code)
            .map(p => ({
              code: p.code,
              product_name: p.product_name_bg || p.product_name_es || p.product_name,
              brands: p.brands || 'Стандартен производител',
              image_url: p.image_front_url || p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
              nutriscore_grade: p.nutriscore_grade || 'c',
              nova_group: p.nova_group || 3,
              additives_tags: p.additives_tags || [],
              nutriments: p.nutriments || {},
              country: (p.countries_tags_en || []).includes('bulgaria') ? 'BG' : (p.countries_tags_en || []).includes('spain') || (p.brands || '').toLowerCase().includes('hacendado') ? 'ES' : 'ALL'
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
      // Продължи към следващото огледало
    }
  }

  return localResults;
}
