import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey } from '../services/geminiService';

export function GeminiKeyModal({ isOpen, onClose, onSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(apiKey);
    setSavedSuccess(true);
    if (onSaved) onSaved(apiKey);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleRemove = () => {
    setGeminiApiKey('');
    setApiKey('');
    if (onSaved) onSaved('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#101422] border border-emerald-500/30 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Google Gemini AI</h3>
            <p className="text-[11px] text-emerald-400 font-bold">Личен клиничен нутриционист</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Въведете вашия <strong>безплатен Gemini API ключ</strong>, за да активирате експертен AI анализ на съставките и диетични препоръки в реално време.
        </p>

        {/* Input */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#08090E] border border-white/10 rounded-2xl py-3 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-cyan-400 transition-colors"
          >
            <span className="font-medium text-[11px]">Вземи безплатен ключ от Google AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-98 flex items-center justify-center space-x-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Запазено успешно!</span>
              </>
            ) : (
              <span>Запази API ключа</span>
            )}
          </button>

          {getGeminiApiKey() && (
            <button
              onClick={handleRemove}
              className="w-full py-2.5 rounded-2xl bg-transparent hover:bg-rose-500/10 text-rose-400 font-semibold text-xs transition-colors"
            >
              Премахни запазения ключ
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Ключът се съхранява само локално на твоя iPhone.</span>
        </div>
      </div>
    </div>
  );
}
