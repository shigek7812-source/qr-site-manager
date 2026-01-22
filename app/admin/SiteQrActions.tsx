'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Props = { siteCode: string };

function safeCopyText(text: string) {
  // clipboard API が弾かれる環境のフォールバック
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

async function copyText(text: string) {
  if (!text) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      safeCopyText(text);
    }
  } catch {
    safeCopyText(text);
  }
}

export default function SiteQrActions({ siteCode }: Props) {
  const publicPath = useMemo(() => `/sites/${siteCode}`, [siteCode]);
  const absoluteUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URL(publicPath, window.location.origin).toString(); // vercel/localhost両対応
  }, [publicPath]);

  const [busy, setBusy] = useState(false);

  const onCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    try {
      await copyText(absoluteUrl);
    } finally {
      setBusy(false);
    }
  };

  const onCopyQr = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    try {
      // 依存が無い環境でも落ちないように、動的import + fallback
      const mod = await import('qrcode').catch(() => null as any);
      if (!mod?.toDataURL) {
        // fallback: QR生成できないならURLをコピー（最低限ユーザーは困らない）
        await copyText(absoluteUrl);
        return;
      }
      const dataUrl: string = await mod.toDataURL(absoluteUrl, { margin: 1, scale: 8 });

      // 画像としてコピーできる環境だけ対応、無理ならURLコピーへフォールバック
      const canWriteImage = !!(navigator.clipboard as any)?.write && typeof (window as any).ClipboardItem !== 'undefined';
      if (!canWriteImage) {
        await copyText(absoluteUrl);
        return;
      }

      const blob = await (await fetch(dataUrl)).blob();
      const item = new (window as any).ClipboardItem({ [blob.type]: blob });
      await (navigator.clipboard as any).write([item]);
    } catch {
      // 最後は必ずURLコピーに逃がす
      await copyText(absoluteUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      onClick={(e) => e.stopPropagation()} // 親クリック対策（重要）
    >
      {/* 公開ページ（先頭・黒） */}
      <Link
        href={publicPath}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center h-9 px-3 text-xs rounded bg-gray-900 text-white hover:bg-black transition"
      >
        公開ページを開く
      </Link>

      {/* QR（高さ揃え） */}
      <button
        type="button"
        onClick={onCopyQr}
        disabled={busy}
        className="inline-flex items-center justify-center h-9 px-3 text-xs rounded border hover:bg-gray-50 disabled:opacity-60"
      >
        QRコピー
      </button>

      {/* URL（高さ揃え） */}
      <button
        type="button"
        onClick={onCopyUrl}
        disabled={busy}
        className="inline-flex items-center justify-center h-9 px-3 text-xs rounded border hover:bg-gray-50 disabled:opacity-60"
      >
        URLコピー
      </button>
    </div>
  );
}