'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

type Site = {
  id: string;
  code: string;
  name: string;
};

export default function SiteQrActions({ site }: { site: Site }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // 現場ごとのURL
  const url = `${window.location.origin}/s/${site.code || site.id}`;

  const handleDownload = () => {
    setDownloading(true);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrSvg = document.getElementById(`qr-svg-${site.id}`);

    if (!ctx || !qrSvg) {
      setDownloading(false);
      return;
    }

    const size = 600; 
    const padding = 40;
    const headerHeight = 120;
    const footerHeight = 80; // 少し高さを調整
    
    canvas.width = size;
    canvas.height = size + headerHeight + footerHeight;

    // 1. 背景白
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 現場名 (上部・黒・太字)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 40px sans-serif'; // 普通のゴシック体
    ctx.textAlign = 'center';
    const displayName = site.name.length > 12 ? site.name.substring(0, 12) + '...' : site.name;
    ctx.fillText(displayName, size / 2, 70);
    
    // No. (上部・グレー)
    ctx.fillStyle = '#666666';
    ctx.font = '24px sans-serif';
    ctx.fillText(`No. ${site.code}`, size / 2, 110);

    // 3. 署名 "by Reglanz" (下部) - ★ここを修正★
    // 色を薄く(グレー)、フォントを普通に、サイズは控えめに
    ctx.fillStyle = '#999999'; 
    ctx.font = '24px sans-serif'; 
    // 少し字間を空けて整える
    ctx.letterSpacing = '2px';
    ctx.fillText('by Reglanz', size / 2, canvas.height - 30);

    // 4. QR描画
    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

    img.onload = () => {
      const qrSize = size - (padding * 2);
      ctx.drawImage(img, padding, headerHeight, qrSize, qrSize);

      const link = document.createElement('a');
      link.download = `${site.name}_QR.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    };
  };

  return (
    <>
      {/* 一覧画面のボタン (変更なし) */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold px-4 py-2 rounded-sm transition border border-neutral-300 h-full whitespace-nowrap"
      >
        QR保存
      </button>

      {/* ポップアップ画面 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-3 right-3 text-neutral-400 hover:text-black p-2"
            >
              ✕
            </button>

            <div className="text-center space-y-4 py-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 leading-tight mb-1">{site.name}</h3>
                <p className="text-xs font-mono text-neutral-400">No. {site.code}</p>
              </div>

              <div className="bg-white inline-block">
                <div className="border-4 border-black p-2 rounded-lg">
                  <QRCode
                    id={`qr-svg-${site.id}`}
                    value={url}
                    size={200}
                    level="H"
                  />
                </div>
              </div>

              <div className="pt-2">
                {/* ★ここを修正: プレビュー表示も薄く普通のフォントに */}
                <p className="text-sm text-neutral-400 font-sans tracking-wider">
                  by Reglanz
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2"
              >
                {downloading ? '作成中...' : '画像を保存する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}