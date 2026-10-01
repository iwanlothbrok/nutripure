import React from 'react';
import { Smartphone, HelpCircle, Sparkles } from 'lucide-react';

export function Header({ country, setCountry, onOpenGuide, onOpenIPhone, onOpenGemini }) {
  return (
    <header className="sticky top-0 z-40 bg-[#08090E]/85 backdrop-blur-2xl border-b border-white/[0.06] px-4 pt-safe pb-3 flex items-center justify-between transition-all">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-2.5">
        <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 p-0.5 shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
            {/* PureCheck leaf & Scout magnifier hybrid mark */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8a3 3 0 0 1 3 3" strokeWidth="1.8" />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">
              NutriPure
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">България &bull; Испания</p>
        </div>
      </div>

      {/* Right controls: Segmented country picker + iPhone + Guide */}
      <div className="flex items-center space-x-1.5">
        {/* Segmented Country Selector (iOS style) */}
        <div className="flex items-center bg-[#131722] rounded-xl p-0.5 border border-white/5 text-xs">
          <button
            onClick={() => setCountry('BG')}
            className={`px-2 py-1 rounded-lg transition-all font-semibold flex items-center space-x-1 ${
              country === 'BG' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="България"
          >
            <span>🇧🇬</span>
            <span className="text-[10px]">BG</span>
          </button>
          <button
            onClick={() => setCountry('ES')}
            className={`px-2 py-1 rounded-lg transition-all font-semibold flex items-center space-x-1 ${
              country === 'ES' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Испания"
          >
            <span>🇪🇸</span>
            <span className="text-[10px]">ES</span>
          </button>
          <button
            onClick={() => setCountry('ALL')}
            className={`px-1.5 py-1 rounded-lg transition-all font-semibold ${
              country === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Глобален филтър"
          >
            <span className="text-[11px]">🌍</span>
          </button>
        </div>

        {/* Google Gemini AI Key Button */}
        <button
          onClick={onOpenGemini}
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-[#101422] hover:from-emerald-900/50 hover:to-[#151a2d] border border-emerald-500/30 flex items-center space-x-1.5 text-emerald-400 transition-all active:scale-95 shadow-sm"
          title="Google Gemini Настройки"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-extrabold text-white">Gemini</span>
        </button>

        {/* iPhone Install Button */}
        <button
          onClick={onOpenIPhone}
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-white/10 flex items-center space-x-1 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
          title="Инсталирай на iPhone"
        >
          <span className="text-[11px] font-bold"> iPhone</span>
        </button>

        {/* Guide modal button */}
        <button
          onClick={onOpenGuide}
          className="w-8 h-8 rounded-xl bg-[#131722] hover:bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
          title="Как се формира оценката?"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
