import React from 'react';
import { 
  Activity, ShieldAlert, Sparkles, TrendingUp, AlertTriangle, 
  CheckCircle2, Flame, Heart, Info, ArrowUpRight, Award, Trash2 
} from 'lucide-react';
import { calculateHealthScore } from '../services/healthScorer';

export function NutriTracker({ history, onSelectProduct, onClearHistory }) {
  // Анализ на всички сканирани продукти в историята
  const scannedAnalyses = history.map(item => ({
    product: item,
    analysis: calculateHealthScore(item, 'bg')
  })).filter(x => x.analysis !== null);

  const totalScanned = scannedAnalyses.length;

  // Изчисляване на среден резултат
  const averageScore = totalScanned > 0
    ? Math.round(scannedAnalyses.reduce((acc, curr) => acc + curr.analysis.score, 0) / totalScanned)
    : 0;

  // Преброяване на избегнати и срещнати Е-номера
  let highRiskAdditivesCount = 0;
  let moderateRiskAdditivesCount = 0;
  let ultraProcessedCount = 0; // NOVA 4
  let healthyCount = 0; // Score >= 75

  scannedAnalyses.forEach(({ analysis }) => {
    if (analysis.nova === 4) ultraProcessedCount++;
    if (analysis.score >= 75) healthyCount++;
    
    (analysis.additivesAnalysis || []).forEach(add => {
      if (add.risk === 'high') highRiskAdditivesCount++;
      if (add.risk === 'moderate') moderateRiskAdditivesCount++;
    });
  });

  const healthyPercentage = totalScanned > 0 ? Math.round((healthyCount / totalScanned) * 100) : 0;
  const ultraProcessedPercentage = totalScanned > 0 ? Math.round((ultraProcessedCount / totalScanned) * 100) : 0;

  // Цвят и статус според средната оценка
  let scoreBadge = { text: 'Няма данни', color: 'text-slate-400 bg-white/5 border-white/10' };
  if (totalScanned > 0) {
    if (averageScore >= 75) scoreBadge = { text: 'Отличен хранителен профил', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    else if (averageScore >= 50) scoreBadge = { text: 'Балансиран / Среден профил', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    else scoreBadge = { text: 'Висока консумация на токсични храни', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-3 animate-fadeIn pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#101422] to-amber-950/40 border border-emerald-500/20 rounded-3xl p-5 mb-5 relative overflow-hidden shadow-2xl">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">Здравен Радар</span>
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Личен отчет за токсичност</h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Проследява общото качество на пазаруваните храни, натрупването на консерванти и степента на ултра-преработка.
        </p>
      </div>

      {totalScanned === 0 ? (
        <div className="text-center py-16 px-4 bg-[#101422]/60 rounded-3xl border border-white/5">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-white font-black text-sm mb-1">Все още нямате сканирани продукти</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Сканирайте баркодове или етикети в магазина, за да генерирате своята персонална здравна статистика.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {/* Main Average Score Gauge */}
          <div className="bg-[#101422] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${scoreBadge.color}`}>
                {scoreBadge.text}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {totalScanned} {totalScanned === 1 ? 'продукт' : 'продукта'}
              </span>
            </div>

            <div className="flex items-center space-x-5">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-emerald-500/30 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                  <span className="text-3xl font-black text-white">{averageScore}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">/ 100 ср.</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Чисти храни (75-100)</span>
                    <span className="font-bold text-emerald-400">{healthyPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${healthyPercentage}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Ултра-преработени (NOVA 4)</span>
                    <span className="font-bold text-rose-400">{ultraProcessedPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${ultraProcessedPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Danger Counters Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#101422] border border-rose-500/20 rounded-3xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">Опасни Е-номера</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">{highRiskAdditivesCount}</div>
              <p className="text-[10px] text-slate-400 mt-1">Канцерогени / азо-оцветители</p>
            </div>

            <div className="bg-[#101422] border border-amber-500/20 rounded-3xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">Умерени добавки</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">{moderateRiskAdditivesCount}</div>
              <p className="text-[10px] text-slate-400 mt-1">Алергени и подсладители</p>
            </div>
          </div>

          {/* Smart Diet Advice */}
          <div className="bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-500/20 rounded-3xl p-4 flex items-start space-x-3">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-emerald-300">Препоръка на нутрициониста:</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {averageScore >= 75
                  ? 'Перфектен подбор! Повечето от сканираните храни са със сурови натурални съставки без промишлени добавки.'
                  : averageScore >= 50
                  ? 'Добър баланс, но се стремете да избягвате продукти с NOVA 4 и синтетични консерванти като E250 и E150d.'
                  : 'Внимание! Висок дял на преработени храни и консерванти. Използвайте бутона "По-здравословни алтернативи" при всяко пазаруване.'}
              </p>
            </div>
          </div>

          {/* Quick List of Recent Scanned Foods */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Последно сканирани храни
              </h5>
              <button
                onClick={onClearHistory}
                className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Изчисти</span>
              </button>
            </div>

            <div className="space-y-2">
              {scannedAnalyses.slice(0, 5).map(({ product, analysis }) => (
                <div
                  key={product.code}
                  onClick={() => onSelectProduct(product.code)}
                  className="bg-[#101422] hover:bg-[#151a2d] border border-white/5 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <h6 className="text-xs font-bold text-white truncate">{product.product_name}</h6>
                      <p className="text-[10px] text-slate-400 truncate">{product.brands || product.supermarket}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-1 rounded-xl text-xs font-black ${
                      analysis.score >= 75
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : analysis.score >= 50
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {analysis.score}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
