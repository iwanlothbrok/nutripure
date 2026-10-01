import React from 'react';
import { ScanLine, Search, History, Sparkles, Activity } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'scanner', label: 'Баркод', icon: ScanLine },
    { id: 'ocr', label: 'AI Етикет', icon: Sparkles },
    { id: 'tracker', label: 'Радар', icon: Activity },
    { id: 'search', label: 'Търсене', icon: Search },
    { id: 'history', label: 'История', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto mb-2 pointer-events-auto">
        <div className="bg-[#101422]/95 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-1.5 shadow-2xl flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-4 rounded-full transition-all active:scale-95 ${
                  isActive
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
