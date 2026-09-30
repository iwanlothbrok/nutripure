import React, { useState } from 'react';
import { 
  ArrowLeft, Share2, AlertTriangle, CheckCircle, Info, Flame, 
  ShieldAlert, Sparkles, ChevronRight, Check, Bookmark, Sparkle
} from 'lucide-react';
import { calculateHealthScore } from '../services/healthScorer';

export function ProductDetail({ product, onBack, onSelectAlternative, isFavorite, onToggleFavorite, lang = 'bg' }) {
  const [selectedAdditive, setSelectedAdditive] = useState(null);
  const [copied, setCopied] = useState(false);

  const analysis = calculateHealthScore(product, lang);
  if (!analysis) return null;

  const {
    score,
    verdictLevel,
    verdictColor,
    verdictTitle,
    explanation,
    positives,
    negatives,
    additivesAnalysis,
    nutrients,
    nova,
    nutriGrade,
    healthierAlternatives
  } = analysis;

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.product_name} - Оценка ${score}/100 в NutriPure`,
        text: `Храна: ${product.product_name} (${product.brands}). Оценка: ${score}/100 (${verdictTitle}).`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${product.product_name} - Оценка ${score}/100 в NutriPure. ${explanation}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-28 bg-[#08090E] animate-fadeIn">
      {/* Top iOS Bar */}
      <div className="sticky top-0 z-30 bg-[#08090E]/85 backdrop-blur-2xl border-b border-white/[0.06] px-4 pt-safe pb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 text-slate-200 active:scale-95 transition-all flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Назад</span>
        </button>

        <div className="text-xs font-bold text-slate-400 truncate max-w-[160px] text-center">
          {product.brands || 'Продукт'}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleFavorite(product)}
            className={`p-2 rounded-2xl border transition-all active:scale-95 ${
              isFavorite
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/5 text-slate-400'
            }`}
            title="Запази в любими"
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border-white/5 text-slate-300 active:scale-95 transition-all"
            title="Сподели"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero section: Product Photo + Scout-Style Floating Score Gauge */}
      <div className="p-4 bg-gradient-to-b from-[#101422] to-[#08090E] border-b border-white/[0.06]">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="relative w-28 h-28 bg-[#151B2B] rounded-3xl p-2.5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-xl">
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
              }}
            />
            {product.country && (
              <span className="absolute -top-1.5 -left-1.5 text-sm bg-[#08090E] border border-white/10 rounded-lg px-1.5 py-0.5 shadow-md">
                {product.country === 'BG' ? '🇧🇬' : product.country === 'ES' ? '🇪🇸' : '🌍'}
              </span>
            )}
          </div>

          {/* Product details */}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
              {product.brands || 'Стандартен производител'}
            </span>
            <h1 className="text-base font-extrabold text-white leading-snug mt-0.5 line-clamp-2">
              {product.product_name}
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {product.category || 'Храни'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              EAN: {product.code}
            </p>
          </div>
        </div>

        {/* Floating Luxury Score Card (Scout & PureCheck Signature Gauge) */}
        <div className="mt-5 p-5 rounded-3xl bg-[#101422]/90 backdrop-blur-xl border border-white/[0.08] flex items-center justify-between shadow-2xl relative overflow-hidden">
          {/* Ambient Glow behind gauge */}
          <div
            className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: verdictColor }}
          ></div>

          <div className="flex flex-col relative z-10">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Здравна оценка
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-5xl font-black text-white tracking-tight">
                {score}
              </span>
              <span className="text-sm font-bold text-slate-500">/ 100</span>
            </div>
            <div className="mt-2.5 inline-flex items-center space-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse shadow-md"
                style={{ backgroundColor: verdictColor }}
              ></span>
              <span
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: verdictColor }}
              >
                {verdictTitle}
              </span>
            </div>
          </div>

          {/* Circular SVG Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#1B2234"
                strokeWidth="11"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={verdictColor}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${verdictColor}99)`
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{score}</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">точки</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Authoritative Health Explanation Card */}
        <div className="p-4 rounded-3xl bg-[#101422] border border-white/[0.06] shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Info className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-sm text-white tracking-tight">Обяснение и анализ</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {explanation}
          </p>
        </div>

        {/* Positives & Negatives Cards */}
        <div className="grid grid-cols-1 gap-2.5">
          {positives.length > 0 && (
            <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs mb-2.5">
                <CheckCircle className="w-4 h-4" />
                <span>Положителни фактори</span>
              </div>
              <ul className="space-y-2">
                {positives.map((pos, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-slate-200">
                    <span className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                      <span>{pos.text}</span>
                    </span>
                    {pos.detail && (
                      <span className="text-[11px] font-bold text-emerald-400 ml-2 whitespace-nowrap">
                        {pos.detail}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {negatives.length > 0 && (
            <div className="p-4 rounded-3xl bg-rose-950/20 border border-rose-500/20">
              <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-xs mb-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Рискови фактори & добавки</span>
              </div>
              <ul className="space-y-2">
                {negatives.map((neg, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-slate-200">
                    <span className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></span>
                      <span>{neg.text}</span>
                    </span>
                    {neg.detail && (
                      <span className="text-[11px] font-bold text-rose-400 ml-2 whitespace-nowrap">
                        {neg.detail}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Additives & E-numbers section */}
        <div className="p-4 rounded-3xl bg-[#101422] border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-extrabold text-sm text-white tracking-tight">Добавки и Е-номера</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
              {additivesAnalysis.length} открити
            </span>
          </div>

          {additivesAnalysis.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Няма регистрирани изкуствени добавки или консерванти!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {additivesAnalysis.map((add) => {
                const isSelected = selectedAdditive?.id === add.id;
                return (
                  <div
                    key={add.id}
                    onClick={() => setSelectedAdditive(isSelected ? null : add)}
                    className="p-3.5 rounded-2xl bg-[#0B0E17] hover:bg-[#121726] border border-white/5 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                          add.risk === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          add.risk === 'moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          add.risk === 'low' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {add.id.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-white">{add.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{add.type}</span>
                    </div>

                    <div className="mt-1.5 text-[11px] text-slate-400 leading-normal pl-0.5">
                      {add.note}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nutritional Facts Table (Apple Health style) */}
        <div className="p-4 rounded-3xl bg-[#101422] border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-extrabold text-sm text-white tracking-tight">Хранителен състав (на 100g)</h3>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                nutriGrade === 'A' ? 'bg-emerald-500 text-black' :
                nutriGrade === 'B' ? 'bg-lime-500 text-black' :
                nutriGrade === 'C' ? 'bg-amber-500 text-black' :
                nutriGrade === 'D' ? 'bg-orange-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                Nutri {nutriGrade}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                NOVA {nova || 3}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* Calories */}
            <div className="p-3 rounded-2xl bg-[#090C14] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Калории</span>
              <span className="text-base font-black text-white mt-1">
                {nutrients.calories ? `${Math.round(nutrients.calories)} kcal` : 'N/A'}
              </span>
            </div>

            {/* Sugars */}
            <div className="p-3 rounded-2xl bg-[#090C14] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Захари</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  nutrients.sugars > 12.5 ? 'bg-red-500/20 text-red-400' :
                  nutrients.sugars > 5 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {nutrients.sugars > 12.5 ? 'Високо' : nutrients.sugars > 5 ? 'Умерено' : 'Ниско'}
                </span>
              </div>
              <span className="text-base font-black text-white mt-1">
                {nutrients.sugars.toFixed(1)} g
              </span>
            </div>

            {/* Saturated Fat */}
            <div className="p-3 rounded-2xl bg-[#090C14] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Наситени мазнини</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  nutrients.satFat > 5.0 ? 'bg-red-500/20 text-red-400' :
                  nutrients.satFat > 1.5 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {nutrients.satFat > 5.0 ? 'Високо' : nutrients.satFat > 1.5 ? 'Умерено' : 'Ниско'}
                </span>
              </div>
              <span className="text-base font-black text-white mt-1">
                {nutrients.satFat.toFixed(1)} g
              </span>
            </div>

            {/* Salt */}
            <div className="p-3 rounded-2xl bg-[#090C14] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Сол</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  nutrients.salt > 1.5 ? 'bg-red-500/20 text-red-400' :
                  nutrients.salt > 0.3 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {nutrients.salt > 1.5 ? 'Високо' : nutrients.salt > 0.3 ? 'Умерено' : 'Ниско'}
                </span>
              </div>
              <span className="text-base font-black text-white mt-1">
                {nutrients.salt.toFixed(2)} g
              </span>
            </div>

            {/* Protein */}
            <div className="p-3 rounded-2xl bg-[#090C14] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Протеин</span>
              <span className="text-base font-black text-white mt-1">
                {nutrients.proteins.toFixed(1)} g
              </span>
            </div>

            {/* Fiber */}
            <div className="p-3 rounded-2xl bg-[#090C14] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Фибри</span>
              <span className="text-base font-black text-white mt-1">
                {nutrients.fiber.toFixed(1)} g
              </span>
            </div>
          </div>
        </div>

        {/* Healthier Alternatives Recommendations */}
        {healthierAlternatives.length > 0 && (
          <div className="p-4 rounded-3xl bg-[#101422] border border-white/[0.06] shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-extrabold text-sm text-white tracking-tight">По-чисти алтернативи</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Тъй като този продукт има ниска оценка, ето по-здравословни варианти:
            </p>

            <div className="space-y-2">
              {healthierAlternatives.map((alt) => (
                <div
                  key={alt.code}
                  onClick={() => onSelectAlternative(alt.code)}
                  className="p-3 rounded-2xl bg-[#0A0D15] hover:bg-[#121624] border border-white/5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={alt.image_url}
                      alt={alt.name}
                      className="w-10 h-10 object-contain rounded-xl bg-white/5 p-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 truncate">{alt.brand}</div>
                      <div className="text-xs font-extrabold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {alt.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">{alt.score}/100</div>
                      <div className="text-[9px] text-slate-500 font-medium">{alt.verdictTitle}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
