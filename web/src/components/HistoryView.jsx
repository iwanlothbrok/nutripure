import React, { useState } from 'react';
import { Trash2, Bookmark, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { calculateHealthScore } from '../services/healthScorer';

export function HistoryView({ history, favorites, onSelectProduct, onClearHistory, onRemoveItem }) {
  const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'healthy', 'risky'

  let displayItems = filter === 'favorites' ? favorites : history;

  if (filter === 'healthy') {
    displayItems = displayItems.filter(p => {
      const s = calculateHealthScore(p, 'bg');
      return s && s.score >= 70;
    });
  } else if (filter === 'risky') {
    displayItems = displayItems.filter(p => {
      const s = calculateHealthScore(p, 'bg');
      return s && s.score < 50;
    });
  }

  return (
    <div className="flex flex-col flex-1 p-4 pb-24">
      {/* Top Header & Clear */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-extrabold text-white">История на сканиранията</h2>
          <p className="text-xs text-pure-gray">Запазени продукти на вашето устройство</p>
        </div>
        {history.length > 0 && filter !== 'favorites' && (
          <button
            onClick={onClearHistory}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Изчисти</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-pure-card p-1 rounded-xl border border-pure-border mb-4 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Всички ({history.length})
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'favorites' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Любими ({favorites.length})
        </button>
        <button
          onClick={() => setFilter('healthy')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'healthy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Добри (&gt;70)
        </button>
        <button
          onClick={() => setFilter('risky')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'risky' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Рискови (&lt;50)
        </button>
      </div>

      {/* Items list */}
      {displayItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
          <Clock className="w-12 h-12 text-slate-600 mb-3" />
          <h4 className="font-bold text-white text-sm mb-1">Няма записани храни</h4>
          <p className="text-xs text-slate-500 max-w-xs">
            Сканирайте или потърсете храна, за да започнете да следите качеството на храната си.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item) => {
            const scoreData = calculateHealthScore(item, 'bg');
            const score = scoreData?.score || 50;
            const color = scoreData?.verdictColor || '#10B981';

            return (
              <div
                key={item.code}
                onClick={() => onSelectProduct(item.code)}
                className="p-3 rounded-2xl bg-pure-card hover:bg-pure-card2 border border-pure-border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-12 h-12 object-contain rounded-xl bg-white/5 p-1 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{item.country === 'BG' ? '🇧🇬' : item.country === 'ES' ? '🇪🇸' : '🌍'}</span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate">{item.brands}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {item.product_name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.scannedAt ? new Date(item.scannedAt).toLocaleDateString('bg-BG') : item.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 flex-shrink-0 ml-2">
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color }}>
                      {score}/100
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      {scoreData?.verdictTitle}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
