import React, { useState, useEffect } from 'react';
import { Search, Loader2, X, ChevronRight, Sparkles } from 'lucide-react';
import { searchProducts } from '../services/openFoodFacts';
import { calculateHealthScore } from '../services/healthScorer';

export function ManualSearch({ onSelectProduct, country }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      // Търсим глобално във всички бази (Испания, Mercadona, България и др.), за да не се филтрират неволно продукти
      const res = await searchProducts(query, 'ALL');
      setResults(res);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const popularSearches = [
    'Mercadona', 'Lidl', 'Billa', 'Kaufland', 'Hacendado', 'Верея', 'Маджаров', 'Дерони', 'Guacamole', 'Овесени ядки'
  ];

  return (
    <div className="flex flex-col flex-1 p-4 pb-24">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Търсете по име на продукт, марка или баркод..."
          className="w-full bg-pure-card border border-pure-border rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-sm"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Search Pills */}
      {!query && (
        <div className="mb-6">
          <div className="flex items-center space-x-1.5 mb-2.5 text-xs font-bold text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Популярни търсения в България & Испания:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="text-xs px-3 py-1.5 rounded-full bg-pure-card hover:bg-pure-card2 border border-pure-border text-slate-300 transition-all active:scale-95"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
          <span className="text-xs">Търсене в базата данни на България и Испания...</span>
        </div>
      )}

      {/* Results List */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-pure-gray mb-1">
            Намерени храни ({results.length}):
          </div>
          {results.map((product) => {
            const scoreData = calculateHealthScore(product, 'bg');
            const score = scoreData?.score || 50;
            const verdictTitle = scoreData?.verdictTitle || 'Оценка';
            const color = scoreData?.verdictColor || '#10B981';

            return (
              <div
                key={product.code}
                onClick={() => onSelectProduct(product.code)}
                className="p-3 rounded-2xl bg-pure-card hover:bg-pure-card2 border border-pure-border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-12 h-12 object-contain rounded-xl bg-white/5 p-1 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{product.country === 'BG' ? '🇧🇬' : product.country === 'ES' ? '🇪🇸' : '🌍'}</span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate">{product.brands}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {product.product_name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {product.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 flex-shrink-0 ml-2">
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color }}>
                      {score}/100
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      {verdictTitle}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!loading && query && results.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <p className="text-sm font-medium mb-1">Няма открити продукти за "{query}"</p>
          <p className="text-xs text-slate-500">
            Опитайте с друга ключова дума или сканирайте директно баркода с камерата.
          </p>
        </div>
      )}
    </div>
  );
}
