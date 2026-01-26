'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Site = {
  id: string;
  code: string;
  name: string;
};

export default function SiteQrActions({ site }: { site: Site }) {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = `${window.location.origin}/s/${site.code || site.id}`;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* QRコードボタン：白背景・グレー枠に変更 */}
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold px-4 py-2 rounded-sm transition flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
          </svg>
          QRコピー
        </button>
      </div>

      {/* QRコードモーダル（デザインをモノトーンに調整） */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white p-6 rounded-sm shadow-2xl max-w-sm w-full text-center space-y-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-neutral-800">
              共有用QRコード
            </h3>
            <div className="bg-white p-2 rounded border border-neutral-200 inline-block">
              <QRCodeSVG value={shareUrl} size={200} />
            </div>
            <p className="text-xs text-neutral-500 break-all px-2 font-mono bg-neutral-100 py-2 rounded">
              {shareUrl}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-sm bg-black text-white font-bold text-sm hover:bg-neutral-800 transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}