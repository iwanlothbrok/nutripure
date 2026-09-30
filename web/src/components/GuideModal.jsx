import React from 'react';
import { X, ShieldCheck, Heart, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

export function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-pure-card border border-pure-border rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-pure-border">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Как работи NutriPure?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-pure-card2 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div>
            <h4 className="font-bold text-white text-sm flex items-center space-x-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Формула за оценка от 1 до 100</span>
            </h4>
            <p>
              Оценката е научно базирана на три основни стълба, аналогично на приложенията PureCheck и Scout:
            </p>
            <ul className="mt-2 space-y-1.5 pl-3 border-l-2 border-emerald-500/30">
              <li><strong className="text-white">60% Хранителни стойности:</strong> Оценка на захари, калории, наситени мазнини и сол спрямо протеини и фибри (по официалната методика Nutri-Score).</li>
              <li><strong className="text-white">30% Адитиви и Е-номера:</strong> Всеки открит консервант, оцветител или подсладител се оценява според токсикологичните доклади на EFSA и IARC.</li>
              <li><strong className="text-white">10% Индустриална преработка (NOVA):</strong> Санкционират се ултрапреработените храни (NOVA 4).</li>
            </ul>
          </div>

          {/* Section 2: Скала */}
          <div className="p-3 rounded-2xl bg-pure-card2 border border-pure-border">
            <h4 className="font-bold text-white mb-2">Нива на оценката:</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">75 - 100: Отличен избор</span>
                <span className="text-[10px] text-slate-400">Здравословен, чист състав</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lime-400">50 - 74: Добър продукт</span>
                <span className="text-[10px] text-slate-400">Балансиран състав</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">25 - 49: Посредствен</span>
                <span className="text-[10px] text-slate-400">Да се консумира умерено</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400">1 - 24: Лош състав</span>
                <span className="text-[10px] text-slate-400">Висок риск / химически добавки</span>
              </div>
            </div>
          </div>

          {/* Section 3: База данни България и Испания */}
          <div>
            <h4 className="font-bold text-white text-sm mb-1.5">
              База данни за България и Испания
            </h4>
            <p>
              Приложението е свързано с най-голямата глобална база данни за храни <strong>Open Food Facts</strong> (над 350 000 продукта от Испания и над 18 000 от България), комбинирана с вътрешен офлайн каталог на най-популярните супермаркетни марки:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇧🇬 Девин</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇧🇬 Верея</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇧🇬 Маджаров</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇧🇬 Сачи</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇧🇬 Дерони</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇪🇸 Hacendado</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇪🇸 Danone</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇪🇸 Alvalle</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">🇪🇸 Gullón</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-sm text-white transition-all shadow-lg shadow-emerald-600/20"
        >
          Разбрах, продължи!
        </button>
      </div>
    </div>
  );
}
