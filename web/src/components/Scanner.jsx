import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Image, Flashlight, Sparkles, Search, AlertCircle, ScanLine } from 'lucide-react';
import { OFFLINE_FOODS } from '../data/offlineFoodsDb';

export function Scanner({ onScan, country }) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Филтриране на примерните храни според държавата
  const sampleFoods = OFFLINE_FOODS.filter(f => country === 'ALL' || f.country === country || f.country === 'ALL');

  useEffect(() => {
    let html5QrCode = null;

    const startScanner = async () => {
      try {
        setCameraError(null);
        html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            playBeep();
            stopScanner();
            onScan(decodedText);
          },
          () => {}
        );
        setIsScanning(true);
      } catch (err) {
        console.warn("Camera start failed:", err);
        setCameraError("Камерата не може да се стартира в браузъра без изрично разрешение. Можете да качите снимка с баркод или да изберете храна от каталога.");
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
    }
    setIsScanning(false);
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      let qrCode = scannerRef.current;
      if (!qrCode) {
        qrCode = new Html5Qrcode("reader");
      }
      const result = await qrCode.scanFile(file, true);
      playBeep();
      onScan(result);
    } catch (err) {
      alert("Не бе открит четлив баркод или QR код в снимката. Моля опитайте с по-ясен кадър.");
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current && isScanning) {
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: !torchOn }]
          });
          setTorchOn(!torchOn);
        } else {
          alert("Фенерчето не се поддържа от текущата камера.");
        }
      } catch (err) {
        console.warn("Torch error:", err);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      setShowManualInput(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-28">
      {/* Precision Viewfinder (Scout & PureCheck Minimalist Dark Look) */}
      <div className="relative w-full aspect-square max-h-[380px] bg-[#05060A] overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
        {/* Live Video Feed */}
        <div id="reader" className="w-full h-full object-cover"></div>

        {/* Minimalist Viewfinder Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* 4 Sleek Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-2xl"></div>

            {/* Glowing Laser scanning bar */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-laser"></div>
          </div>
        </div>

        {/* Floating Quick Action Buttons on Viewfinder */}
        <div className="absolute top-3.5 right-3.5 flex items-center space-x-2 z-10">
          <button
            onClick={toggleTorch}
            className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            title="Фенерче"
          >
            <Flashlight className={`w-4 h-4 ${torchOn ? 'text-amber-300 fill-amber-300' : 'text-slate-200'}`} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            title="Качи снимка от галерията"
          >
            <Image className="w-4 h-4 text-slate-200" />
          </button>
        </div>

        {/* Center Target Hint */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-300 flex items-center space-x-2 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Позиционирайте баркода във визьора</span>
          </div>
        </div>

        {/* Camera fallback message */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#08090E]/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center z-20">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">Камерата не е активна</h4>
            <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">{cameraError}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Image className="w-4 h-4" />
                <span>Качи снимка</span>
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="px-4 py-2.5 rounded-xl bg-[#131722] hover:bg-slate-800 border border-white/10 font-bold text-xs text-white flex items-center space-x-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Ръчен код</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Action Row */}
      <div className="px-4 py-3 bg-[#0D101A] flex items-center justify-between border-b border-white/[0.05]">
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 border border-white/5 flex items-center space-x-1.5 transition-all active:scale-95"
        >
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ръчно въвеждане на код</span>
        </button>
        <span className="text-[11px] text-slate-400">
          Активен пазар: <strong className="text-white">{country === 'BG' ? 'България 🇧🇬' : country === 'ES' ? 'Испания 🇪🇸' : 'Всички 🌍'}</strong>
        </span>
      </div>

      {/* Manual Input Drawer */}
      {showManualInput && (
        <form onSubmit={handleManualSubmit} className="p-4 bg-[#101422] border-b border-white/5 flex gap-2 animate-fadeIn">
          <input
            type="text"
            placeholder="Въведете баркод (напр. 3800000600593)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 bg-[#08090E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Търси
          </button>
        </form>
      )}

      {/* Sample Foods Catalog (Instant 1-Click Scan) */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-sm text-white tracking-tight">
              Бърз тест с популярни храни
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">1-клик анализ</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {sampleFoods.map((food) => (
            <button
              key={food.code}
              onClick={() => onScan(food.code)}
              className="bg-[#101422] hover:bg-[#151B2E] border border-white/[0.06] rounded-2xl p-3 flex items-center space-x-2.5 text-left active:scale-[0.98] transition-all group shadow-sm"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border border-white/5">
                <img
                  src={food.image_url}
                  alt={food.product_name}
                  className="w-full h-full object-contain drop-shadow"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=80';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-xs">{food.country === 'BG' ? '🇧🇬' : food.country === 'ES' ? '🇪🇸' : '🌍'}</span>
                  <span className="text-[10px] font-bold text-slate-400 truncate">{food.brands}</span>
                </div>
                <h4 className="text-xs font-extrabold text-white truncate group-hover:text-emerald-400 transition-colors mt-0.5">
                  {food.product_name}
                </h4>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className={`text-[9px] font-black px-1 rounded uppercase tracking-wider ${
                    food.nutriscore_grade === 'a' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    food.nutriscore_grade === 'b' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' :
                    food.nutriscore_grade === 'c' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    food.nutriscore_grade === 'd' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    Nutri {food.nutriscore_grade}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">NOVA {food.nova_group}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
