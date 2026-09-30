import { getAdditiveInfo } from '../data/additivesDb';
import { OFFLINE_FOODS } from '../data/offlineFoodsDb';

/**
 * Изчислява комплексна здравна оценка (1 - 100) по стандартите на PureCheck & Scout / Yuka
 * @param {Object} product - Обект с данни за продукта (от Open Food Facts или офлайн базата)
 * @param {string} lang - Език за текстовите обяснения ('bg', 'es', 'en')
 */
export function calculateHealthScore(product, lang = 'bg') {
  if (!product) return null;

  const nutriments = product.nutriments || {};
  const sugars = parseFloat(nutriments.sugars_100g ?? nutriments.sugars ?? 0);
  const satFat = parseFloat(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'] ?? 0);
  const salt = parseFloat(nutriments.salt_100g ?? nutriments.salt ?? 0);
  const calories = parseFloat(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? (nutriments.energy_100g ? nutriments.energy_100g / 4.184 : 0));
  const fiber = parseFloat(nutriments.fiber_100g ?? nutriments.fiber ?? 0);
  const proteins = parseFloat(nutriments.proteins_100g ?? nutriments.proteins ?? 0);

  // 1. Хранителен компонент (макс 60 точки)
  // Базира се на Nutri-Score класификацията
  let nutriGrade = (product.nutriscore_grade || '').toLowerCase();
  let nutritionBase = 35; // по подразбиране
  
  if (nutriGrade === 'a') nutritionBase = 60;
  else if (nutriGrade === 'b') nutritionBase = 50;
  else if (nutriGrade === 'c') nutritionBase = 35;
  else if (nutriGrade === 'd') nutritionBase = 20;
  else if (nutriGrade === 'e') nutritionBase = 8;
  else {
    // Изчисляване при липсващ официален Nutri-Score
    let penalty = 0;
    if (sugars > 20) penalty += 18;
    else if (sugars > 10) penalty += 10;
    else if (sugars > 5) penalty += 4;

    if (satFat > 8) penalty += 16;
    else if (satFat > 4) penalty += 8;

    if (salt > 2.0) penalty += 16;
    else if (salt > 1.0) penalty += 8;

    let bonus = 0;
    if (fiber > 5) bonus += 10;
    else if (fiber > 2.5) bonus += 5;

    if (proteins > 10) bonus += 10;
    else if (proteins > 5) bonus += 5;

    nutritionBase = Math.max(5, Math.min(60, 45 - penalty + bonus));
  }

  // 2. Анализ на адитивите / Е-номерата (макс 30 точки)
  let additivesBase = 30;
  const rawAdditives = product.additives_tags || [];
  const additivesAnalysis = [];
  let highRiskCount = 0;
  let moderateRiskCount = 0;
  let safeCount = 0;

  for (const tag of rawAdditives) {
    const info = getAdditiveInfo(tag);
    if (!info) continue;
    additivesAnalysis.push(info);

    if (info.risk === 'high') {
      highRiskCount++;
      additivesBase -= 14; // тежка санкция за опасни консерванти и канцерогенни оцветители
    } else if (info.risk === 'moderate') {
      moderateRiskCount++;
      additivesBase -= 6;
    } else if (info.risk === 'low') {
      additivesBase -= 2;
    } else {
      safeCount++;
    }
  }
  additivesBase = Math.max(0, additivesBase);

  // 3. Степен на преработка NOVA (макс 10 точки)
  const nova = parseInt(product.nova_group) || 0;
  let novaScore = 7;
  if (nova === 1) novaScore = 10;
  else if (nova === 2) novaScore = 8;
  else if (nova === 3) novaScore = 5;
  else if (nova === 4) novaScore = 0;

  // 4. Бонус за Био/Органичен произход (+5 до +10)
  const isBio = product.is_bio || (product.labels_tags || []).some(l => l.includes('organic') || l.includes('bio'));
  const bioBonus = isBio ? 8 : 0;

  // Краен резултат
  let totalScore = Math.round(nutritionBase + additivesBase + novaScore + bioBonus);

  // Ако има опасни адитиви от висок риск (E250, E150d, E951 и т.н.), ограничаваме тавана
  if (highRiskCount >= 2) {
    totalScore = Math.min(totalScore, 34);
  } else if (highRiskCount === 1) {
    totalScore = Math.min(totalScore, 48);
  }

  // Защита на границите [1, 100]
  totalScore = Math.max(1, Math.min(100, totalScore));

  // Категоризация
  let verdictLevel = 'bad';
  let verdictColor = '#EF4444';
  let verdictTitle = 'Лош избор';

  if (totalScore >= 75) {
    verdictLevel = 'excellent';
    verdictColor = '#10B981';
    verdictTitle = 'Отличен състав';
  } else if (totalScore >= 50) {
    verdictLevel = 'good';
    verdictColor = '#84CC16';
    verdictTitle = 'Добър избор';
  } else if (totalScore >= 25) {
    verdictLevel = 'mediocre';
    verdictColor = '#F59E0B';
    verdictTitle = 'Посредствен';
  }

  // Генериране на Плюсове и Минуси
  const positives = [];
  const negatives = [];

  // Захари
  if (sugars <= 2.5 && !nutriGrade?.includes('e')) {
    positives.push({ text: lang === 'es' ? 'Bajo contenido de azúcares' : 'Много ниско съдържание на захар', detail: `${sugars.toFixed(1)}g / 100g` });
  } else if (sugars > 15) {
    negatives.push({ text: lang === 'es' ? 'Demasiado azúcar' : 'Твърде високо съдържание на захар', detail: `${sugars.toFixed(1)}g / 100g`, severity: 'danger' });
  }

  // Наситени мазнини
  if (satFat <= 1.0) {
    positives.push({ text: lang === 'es' ? 'Bajo en grasas saturadas' : 'Ниско съдържание на наситени мазнини', detail: `${satFat.toFixed(1)}g / 100g` });
  } else if (satFat > 5.0) {
    negatives.push({ text: lang === 'es' ? 'Alto contenido de grasas saturadas' : 'Високо съдържание на наситени мазнини', detail: `${satFat.toFixed(1)}g / 100g`, severity: 'warn' });
  }

  // Сол
  if (salt <= 0.3) {
    positives.push({ text: lang === 'es' ? 'Bajo contenido en sal' : 'Ниско съдържание на сол', detail: `${salt.toFixed(2)}g / 100g` });
  } else if (salt > 1.8) {
    negatives.push({ text: lang === 'es' ? 'Exceso de sal' : 'Прекомерно съдържание на сол', detail: `${salt.toFixed(2)}g / 100g`, severity: 'danger' });
  }

  // Протеини и фибри
  if (proteins >= 8) {
    positives.push({ text: lang === 'es' ? 'Excelente fuente de proteínas' : 'Богат източник на протеини', detail: `${proteins.toFixed(1)}g / 100g` });
  }
  if (fiber >= 4) {
    positives.push({ text: lang === 'es' ? 'Rico en fibra dietética' : 'Богат на полезни фибри', detail: `${fiber.toFixed(1)}g / 100g` });
  }

  // Адитиви
  if (rawAdditives.length === 0) {
    positives.push({ text: lang === 'es' ? 'Sin aditivos ni conservantes artificiales' : 'Чист състав без консерванти и адитиви', detail: '0 E-номера' });
  } else {
    if (highRiskCount > 0) {
      negatives.push({
        text: lang === 'es' ? `Contiene ${highRiskCount} aditivo(s) de alto riesgo` : `Съдържа ${highRiskCount} високорисков(и) адитив(а)`,
        detail: additivesAnalysis.filter(a => a.risk === 'high').map(a => `${a.id.toUpperCase()} (${a.name})`).join(', '),
        severity: 'danger'
      });
    }
    if (moderateRiskCount > 0) {
      negatives.push({
        text: lang === 'es' ? `Contiene ${moderateRiskCount} aditivo(s) de riesgo moderado` : `Съдържа ${moderateRiskCount} адитив(а) с умерен риск`,
        detail: additivesAnalysis.filter(a => a.risk === 'moderate').map(a => a.id.toUpperCase()).join(', '),
        severity: 'warn'
      });
    }
  }

  // Преработка NOVA
  if (nova === 1) {
    positives.push({ text: lang === 'es' ? 'Alimento no procesado o mínimamente procesado' : 'Натурална, минимално преработена храна (NOVA 1)', detail: 'Естествен произход' });
  } else if (nova === 4) {
    negatives.push({ text: lang === 'es' ? 'Alimento ultraprocesado (NOVA 4)' : 'Ултрапреработена индустриална храна (NOVA 4)', detail: 'Индустриални мазнини / съставки', severity: 'danger' });
  }

  // Био
  if (isBio) {
    positives.push({ text: lang === 'es' ? 'Certificación ecológica / Bio' : 'Сертифициран Био / Екологичен продукт', detail: '+8 точки' });
  }

  // Обобщаващо обяснение за потребителя (текстова присъда)
  let explanation = '';
  if (lang === 'es') {
    if (totalScore >= 75) {
      explanation = 'Este producto presenta una composición nutricional saludable y equilibrada, sin aditivos peligrosos para la salud. Recomendado para el consumo habitual.';
    } else if (totalScore >= 50) {
      explanation = 'Producto de calidad aceptable. Aunque aporta nutrientes adecuados, contiene niveles moderados de sal, azúcar o grasas. Consumir con moderación.';
    } else if (totalScore >= 25) {
      explanation = 'Calidad nutricional baja o presencia de aditivos desaconsejados. Su ingesta frecuente puede afectar a la salud cardiovascular o metabólica.';
    } else {
      explanation = 'Producto altamente desaconsejado. Combina un procesamiento ultraelevado con un exceso crítico de azúcares/grasas y aditivos químicos de riesgo contrastado.';
    }
  } else {
    // Български език (по подразбиране)
    if (totalScore >= 75) {
      explanation = 'Този продукт има отличен и чист състав с висока хранителна стойност. Не съдържа вредни консерванти и е подходящ за редовна здравословна консумация.';
    } else if (totalScore >= 50) {
      explanation = 'Продукт с приемливи качества. Притежава добри съставки, но съдържа умерени нива на сол, захар или мазнини. Препоръчва се умерена консумация.';
    } else if (totalScore >= 25) {
      explanation = 'Продукт с незадоволителен състав. Наличието на изкуствени добавки, повишена захарност или индустриална преработка налагат ограничаване на приема.';
    } else {
      explanation = 'Не се препоръчва за честа употреба! Продуктът е силно преработен (ултрапреработен), с критично високи нива на захари/мазнини/сол и съдържа спорни химически адитиви.';
    }
  }

  // Търсене на по-здравословни алтернативи от каталога
  const healthierAlternatives = [];
  if (totalScore < 70) {
    // Търсим алтернативи с висок резултат от същата страна или сходна категория
    for (const alt of OFFLINE_FOODS) {
      if (alt.code !== product.code) {
        const altScore = calculateHealthScore(alt, lang);
        if (altScore && altScore.score >= 75) {
          healthierAlternatives.push({
            code: alt.code,
            name: alt.product_name,
            brand: alt.brands,
            score: altScore.score,
            verdictTitle: altScore.verdictTitle,
            image_url: alt.image_url,
            category: alt.category
          });
        }
      }
    }
  }

  return {
    score: totalScore,
    verdictLevel,
    verdictColor,
    verdictTitle,
    explanation,
    positives,
    negatives,
    additivesAnalysis,
    nutrients: {
      sugars,
      satFat,
      salt,
      calories,
      fiber,
      proteins
    },
    nova,
    nutriGrade: nutriGrade.toUpperCase() || 'N/A',
    healthierAlternatives: healthierAlternatives.slice(0, 3)
  };
}
