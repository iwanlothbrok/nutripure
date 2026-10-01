import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Scanner } from './components/Scanner';
import { ProductDetail } from './components/ProductDetail';
import { ManualSearch } from './components/ManualSearch';
import { HistoryView } from './components/HistoryView';
import { BottomNav } from './components/BottomNav';
import { GuideModal } from './components/GuideModal';
import { GeminiKeyModal } from './components/GeminiKeyModal';
import { OcrScanner } from './components/OcrScanner';
import { NutriTracker } from './components/NutriTracker';
import { IPhoneInstallModal } from './components/IPhoneInstallModal';
import { getProductByBarcode } from './services/openFoodFacts';
import { Loader2, AlertCircle } from 'lucide-react';

export function App() {
  const [country, setCountry] = useState(() => localStorage.getItem('nutri_country') || 'BG');
  const [activeTab, setActiveTab] = useState('scanner');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [iphoneOpen, setIphoneOpen] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);

  // History & Favorites from LocalStorage
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nutri_history') || '[]');
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nutri_favorites') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nutri_country', country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem('nutri_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('nutri_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleScan = async (barcode) => {
    if (!barcode) return;
    setLoading(true);
    setNotFoundBarcode(null);

    try {
      const product = await getProductByBarcode(barcode);
      if (product) {
        setSelectedProduct(product);
        setHistory((prev) => {
          const filtered = prev.filter((p) => p.code !== product.code);
          return [{ ...product, scannedAt: Date.now() }, ...filtered].slice(0, 50);
        });
      } else {
        setNotFoundBarcode(barcode);
      }
    } catch (e) {
      console.error(e);
      setNotFoundBarcode(barcode);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.code === product.code);
      if (exists) {
        return prev.filter((p) => p.code !== product.code);
      } else {
        return [{ ...product, favoriteAt: Date.now() }, ...prev];
      }
    });
  };

  const handleClearHistory = () => {
    if (confirm('Сигурни ли сте, че искате да изчистите историята?')) {
      setHistory([]);
    }
  };

  const isFavorite = selectedProduct
    ? favorites.some((p) => p.code === selectedProduct.code)
    : false;

  return (
    <div className="min-h-screen bg-[#08090E] text-slate-100 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-x-hidden selection:bg-emerald-500/30">
      {/* Header (hidden in detail view) */}
      {!selectedProduct && (
        <Header
          country={country}
          setCountry={setCountry}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenIPhone={() => setIphoneOpen(true)}
          onOpenGemini={() => setGeminiOpen(true)}
        />
      )}

      {/* Main Views */}
      <main className="flex-1 flex flex-col">
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onSelectAlternative={(code) => handleScan(code)}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onOpenGemini={() => setGeminiOpen(true)}
            lang="bg"
          />
        ) : activeTab === 'scanner' ? (
          <Scanner onScan={handleScan} country={country} />
        ) : activeTab === 'ocr' ? (
          <OcrScanner onOpenGemini={() => setGeminiOpen(true)} />
        ) : activeTab === 'tracker' ? (
          <NutriTracker
            history={history}
            onSelectProduct={(code) => handleScan(code)}
            onClearHistory={handleClearHistory}
          />
        ) : activeTab === 'search' ? (
          <ManualSearch
            onSelectProduct={(code) => handleScan(code)}
            country={country}
          />
        ) : (
          <HistoryView
            history={history}
            favorites={favorites}
            onSelectProduct={(code) => handleScan(code)}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Floating Bottom Nav */}
      {!selectedProduct && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#101422] border border-white/10 flex items-center justify-center mb-3 shadow-2xl">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <h4 className="font-extrabold text-white text-base mb-1">
            Анализиране на храната...
          </h4>
          <p className="text-xs text-slate-400 max-w-xs">
            Извличане на хранителен състав и оценка на Е-номерата
          </p>
        </div>
      )}

      {/* Not Found Barcode Modal */}
      {notFoundBarcode && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101422] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-base mb-1.5">
              Продуктът не е открит
            </h3>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">
              Баркод <span className="font-mono text-emerald-400 font-bold">{notFoundBarcode}</span> все още не е регистриран за пазарите в България или Испания.
            </p>
            <p className="text-[11px] text-slate-400 mb-5">
              Можете да проверите номера или да изберете храна от примерните продукти.
            </p>
            <button
              onClick={() => setNotFoundBarcode(null)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
            >
              Разбрах
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* iPhone PWA & iOS Installation Modal */}
      <IPhoneInstallModal isOpen={iphoneOpen} onClose={() => setIphoneOpen(false)} />

      {/* Google Gemini AI Key Modal */}
      <GeminiKeyModal isOpen={geminiOpen} onClose={() => setGeminiOpen(false)} />
    </div>
  );
}
export default App;
