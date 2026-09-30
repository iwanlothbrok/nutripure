import React, { useState } from 'react';
import { X, Smartphone, Share, PlusSquare, Check, Copy, ExternalLink, QrCode } from 'lucide-react';

export function IPhoneInstallModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // URL за достъп от iPhone в локалната мрежа
  const localIp = '192.168.1.42';
  const port = window.location.port || '5173';
  const iphoneUrl = `http://${localIp}:${port}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(iphoneUrl)}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(iphoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#101420] border border-white/10 rounded-3xl max-w-sm w-full p-6 text-slate-100 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight">
              Инсталиране на iPhone
            </h3>
            <p className="text-xs text-slate-400">PWA & iOS Нативно приложение</p>
          </div>
        </div>

        {/* Step 1: Scan QR or Open URL */}
        <div className="p-4 rounded-2xl bg-[#090C14] border border-white/5 mb-4 text-center">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
            1. Отворете на вашия iPhone
          </span>
          <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl shadow-inner mb-3 flex items-center justify-center">
            <img
              src={qrUrl}
              alt="Scan to open on iPhone"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Сканирайте с камерата на вашия iPhone (или посетете адреса в Safari):
          </p>
          <div className="flex items-center space-x-1.5 bg-white/5 rounded-xl px-2.5 py-1.5 text-xs font-mono justify-between border border-white/5">
            <span className="truncate text-emerald-300 font-semibold">{iphoneUrl}</span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white p-1"
              title="Копирай"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2: Add to Home Screen in Safari */}
        <div className="space-y-2.5 mb-5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            2. Добавяне към началния екран:
          </span>

          <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Share className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block font-semibold">Натиснете Share (Сподели)</strong>
              <span className="text-slate-400 text-[11px]">Квадратчето със стрелка нагоре в долната лента на Safari.</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <PlusSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block font-semibold">„Добави към начален екран“</strong>
              <span className="text-slate-400 text-[11px]">Изберете „Add to Home Screen“ от менюто.</span>
            </div>
          </div>
        </div>

        {/* Xcode Native Info note */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 mb-4">
          <strong className="text-white">За разработчици:</strong> Генериран е и нативен Xcode проект в папка <code className="text-emerald-400">web/ios/App</code> за компилиране през Mac/Xcode и качване в TestFlight / App Store.
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
