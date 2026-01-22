'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Props = { siteCode: string };

function safeCopyText(text: string) {
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

export default function SiteQrActions({ siteCode }: Props) {
  const publicPath = useMemo(() => `/sites/${siteCode}`, [siteCode]);
  const absoluteUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URL(publicPath, window.location.origin).toString();
  }, [publicPath]);

  const [busy, setBusy] = useState(false);

  const copyUrl = async () => {
    try {
      if (!absoluteUrl) return;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
      } else {
        safeCopyText(absoluteUrl);
      }
    } catch {
      safeCopyText(absoluteUrl);
    }
  };

  const copyQr = async () => {
    // まずは「QRのリンク(URL)をコピー」で運用（画像コピーは後で強化）
    await copyUrl();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 公開ページを開く */}
      <Link
        href={publicPath}
        className="inline-flex items-center justify-center h-9 px-3 text-xs rounded bg-gray-900 text-white hover:bg-black transition whitespace-nowrap"
      >
        公開ページを開く
      </Link>

      {/* QRコピー */}
      <button
        type="button"
        onClick={async () => {
          if (busy) return;
          setBusy(true);
          try {
            await copyQr();
          } finally {
            setBusy(false);
          }
        }}
        className="inline-flex items-center justify-center h-9 px-3 text-xs rounded border border-gray-300 hover:bg-gray-50 transition whitespace-nowrap"
      >
        QRコピー
      </button>

      {/* URLコピー */}
      <button
        type="button"
        onClick={async () => {
          if (busy) return;
          setBusy(true);
          try {
            await copyUrl();
          } finally {
            setBusy(false);
          }
        }}
        className="inline-flex items-center justify-center h-9 px-3 text-xs rounded border border-gray-300 hover:bg-gray-50 transition whitespace-nowrap"
      >
        URLコピー
      </button>
    </div>
  );
}