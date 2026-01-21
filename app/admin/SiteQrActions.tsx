'use client';

import { useMemo, useState } from 'react';
import  QRCode from 'qrcode';


type Props = {
  siteCode: string;
};

export default function SiteQrActions({ siteCode }: Props) {
  const publicUrl = useMemo(() => `/s/${siteCode}`, [siteCode]);
  const fullUrl = useMemo(() => {
    if (typeof window === 'undefined') return publicUrl;
    return new URL(publicUrl, window.location.origin).toString();
  }, [publicUrl]);

  const [busy, setBusy] = useState(false);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(fullUrl);
    alert('公開URLをコピーしました');
  };

  const copyQrImage = async () => {
    setBusy(true);
    try {
      const dataUrl = await QRCode.toDataURL(fullUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 256,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const ClipboardItemAny = (window as any).ClipboardItem;
      if (!ClipboardItemAny || !navigator.clipboard?.write) {
        throw new Error('Clipboard image copy not supported');
      }

      await navigator.clipboard.write([
        new ClipboardItemAny({ [blob.type]: blob }),
      ]);

      alert('QR画像をコピーしました');
    } catch (e) {
      const dataUrl = await QRCode.toDataURL(fullUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 512,
      });
      window.open(dataUrl, '_blank');
      alert('このブラウザでは画像コピーが制限されるため、QR画像を別タブで開きました（保存して使ってください）');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <button
        type="button"
        onClick={copyUrl}
        className="text-xs px-2.5 py-1.5 rounded bg-gray-900 text-white hover:bg-black"
      >
        公開URLコピー
      </button>

      <button
        type="button"
        onClick={copyQrImage}
        disabled={busy}
        className="text-xs px-2.5 py-1.5 rounded bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-60"
      >
        {busy ? 'QR作成中…' : 'QRコピー'}
      </button>

      <a
        href={publicUrl}
        target="_blank"
        className="text-xs px-2.5 py-1.5 rounded bg-white border border-gray-300 hover:bg-gray-50"
      >
        公開ページを開く
      </a>
    </div>
  );
}