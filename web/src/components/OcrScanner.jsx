import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import { analyzeIngredientsText } from '../services/ingredientAnalyzer';
import { askGeminiNutritionist, getGeminiApiKey } from '../services/geminiService';

export function OcrScanner({ onAnalysisDone, onOpenGemini }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [manualText, setManualText] = useState('');
  const [mode, setMode] = useState('camera'); // 'camera' or 'paste'
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiReply, setGeminiReply] = useState(null);
  const [geminiError, setGeminiError] = useState(null);
  const fileInputRef = useRef(null);

  const processImage = async (file) => {
    if (!file) return;
    setLoading(true);
    setProgress('Подготовка на изображението...');

    try {
      // Dynamic import to keep initial bundle ultra fast
      const Tesseract = await import('tesseract.js');
      
      setProgress('Сканиране и разпознаване на буквите...');
      const result = await Tesseract.recognize(
        file,
        'bul+spa+eng', // Български, испански и английски
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              const pct = Math.round((m.progress || 0) * 100);
              setProgress(`Разпознаване на съставките... ${pct}%`);
            }
          }
        }
      );

      const text = result?.data?.text || '';
      setRecognizedText(text);
      
      const analysis = analyzeIngredientsText(text);
      setAnalysisResult(analysis);
      if (onAnalysisDone && analysis) {
        onAnalysisDone(analysis);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      // Fallback: ако Tesseract не успее поради мрежа/памет, предлагаме ръчно въвеждане
      setProgress('Неуспешно разпознаване. Моля, снимайте по-близо или въведете текста ръчно.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyze = () => {
    if (!manualText.trim()) return;
    const analysis = analyzeIngredientsText(manualText);
    setAnalysisResult(analysis);
    if (onAnalysisDone && analysis) {
      onAnalysisDone(analysis);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setRecognizedText('');
    setManualText('');
    setProgress('');
    setGeminiReply(null);
    setGeminiError(null);
  };

  const handleAskGeminiOcr = async () => {
    const key = getGeminiApiKey();
    if (!key) {
      if (onOpenGemini) {
        onOpenGemini();
      } else {
        setGeminiError('Моля, въведете Google Gemini API ключ от бутона в горната лента.');
      }
      return;
    }

    setGeminiLoading(true);
    setGeminiError(null);
    try {
      const response = await askGeminiNutritionist({
        productName: 'Сканиран етикет на продукт',
        ingredientsText: recognizedText || manualText,
        score: analysisResult?.cleanScore,
        additives: (analysisResult?.additives || []).map(a => `${a.code} (${a.name})`)
      });
      setGeminiReply(response);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        if (onOpenGemini) onOpenGemini();
        setGeminiError('Липсва Gemini API ключ. Натиснете бутона Gemini горе.');
      } else {
        setGeminiError(`Грешка при връзка с Gemini: ${err.message}`);
      }
    } finally {
      setGeminiLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-3 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#101422] to-cyan-950/40 border border-emerald-500/20 rounded-3xl p-5 mb-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">AI Етикет Скенер</span>
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">Снимай съставките директно</h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          За продукти без баркод или деликатеси: изкуственият интелект прочита текста на гърба и намира скритите Е-номера и палмови мазнини за секунди.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-[#121626] p-1 rounded-2xl border border-white/5 mb-4">
        <button
          onClick={() => setMode('camera')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'camera' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white'}`}
        >
          📸 Снимка от камера / галерия
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'paste' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white'}`}
        >
          ✍️ Въвеждане на текст
        </button>
      </div>

      {/* Main Content Area */}
      {!analysisResult ? (
        <div className="flex-1 flex flex-col justify-center">
          {mode === 'camera' ? (
            <div className="border-2 border-dashed border-emerald-500/30 bg-[#101422]/60 rounded-3xl p-6 text-center flex flex-col items-center justify-center relative backdrop-blur-md">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => processImage(e.target.files[0])}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-xl">
                <Camera className="w-8 h-8" />
              </div>

              <h3 className="font-extrabold text-white text-base mb-1">
                Снимай етикета на продукта
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-5">
                Насочи камерата към списъка със съставките ("Съставки: ..." или "Ingredientes: ...")
              </p>

              <div className="flex flex-col w-full space-y-2.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Направи снимка на съставките</span>
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 font-bold text-xs transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Качи снимка от галерията</span>
                </button>
              </div>

              {loading && (
                <div className="mt-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-full animate-pulse">
                  <p className="text-xs font-bold text-emerald-300">{progress}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#101422] border border-white/10 rounded-3xl p-5 flex flex-col space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Поставете списъка със съставките тук:</span>
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="напр.: вода, захар, консервант E250, оцветител Е150d, натриев бензоат, палмово масло..."
                rows={5}
                className="w-full bg-[#08090E] border border-white/10 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none font-mono"
              />
              <button
                onClick={handleManualAnalyze}
                disabled={!manualText.trim()}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Анализирай съставките с AI</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="flex flex-col space-y-4">
          {/* Health Cleanliness Score Card */}
          <div className="bg-[#101422] border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${analysisResult.statusColor}`}>
                {analysisResult.statusText}
              </span>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all text-xs flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ново сканиране</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-emerald-500/30 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{analysisResult.cleanScore}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">/ 100</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-white text-sm">Индекс на чистота на състава</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Открити са <strong className="text-emerald-400">{analysisResult.totalCount}</strong> хранителни добавки (Е-номера) и <strong className="text-amber-400">{analysisResult.flags.length}</strong> рискови съставки.
                </p>
              </div>
            </div>
          </div>

          {/* Google Gemini AI OCR Expert Opinion */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#101422] via-[#0d121f] to-emerald-950/20 border border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Gemini 1.5 Flash Нутриционист</h4>
                  <p className="text-[10px] text-emerald-400 font-bold">AI експертен анализ на етикета</p>
                </div>
              </div>

              <button
                onClick={handleAskGeminiOcr}
                disabled={geminiLoading}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-extrabold text-[11px] transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center space-x-1"
              >
                {geminiLoading ? <span>Мислене...</span> : <span>Попитай AI</span>}
              </button>
            </div>

            {geminiReply ? (
              <div className="mt-3 p-3.5 rounded-2xl bg-[#08090E]/80 border border-emerald-500/20 text-xs text-slate-200 leading-relaxed whitespace-pre-line animate-fadeIn font-normal">
                {geminiReply}
              </div>
            ) : geminiError ? (
              <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl">
                {geminiError}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Натиснете <strong>"Попитай AI"</strong> за пълно медицинско тълкуване на тези съставки от <strong>Google Gemini Flash</strong>.
              </p>
            )}
          </div>

          {/* Red Flags / Warnings */}
          {analysisResult.flags.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                ⚠️ Открити рискови съставки
              </h5>
              {analysisResult.flags.map((f, idx) => (
                <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-amber-300">{f.title}</h6>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additives List */}
          <div>
            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 mb-2">
              🧪 Анализ на откритите Е-номера ({analysisResult.additives.length})
            </h5>
            {analysisResult.additives.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300 font-bold">
                  Страхотно! Не са разпознати изкуствени Е-номера или синтетични консерванти.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {analysisResult.additives.map((add, idx) => {
                  const isHigh = add.risk === 'high';
                  const isMod = add.risk === 'moderate';
                  const badgeColor = isHigh
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : isMod
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

                  return (
                    <div key={idx} className="bg-[#101422] border border-white/5 rounded-2xl p-3.5 flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-black border ${badgeColor}`}>
                            {add.code}
                          </span>
                          <span className="font-extrabold text-xs text-white">{add.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{add.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                        {add.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Raw Text Toggle */}
          {recognizedText && (
            <details className="bg-[#101422]/60 border border-white/5 rounded-2xl p-3 text-xs text-slate-400">
              <summary className="font-bold cursor-pointer text-slate-300 hover:text-white">
                Покажи разчетения текст от етикета
              </summary>
              <p className="mt-2 text-[11px] font-mono leading-relaxed bg-[#08090E] p-2.5 rounded-xl border border-white/5 break-words">
                {recognizedText}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
