'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Props = {
  siteCode: string;
};

function buildPublicUrl(siteCode: string) {
  // 本番/プレビュー/ローカル問わず動くように、NEXT_PUBLIC_APP_BASE_URL があれば優先
  const base =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/s/${encodeURIComponent(siteCode)}`;
}

function svgQrDataUrl(text: string, size = 220) {
  // 軽量：外部ライブラリなしの簡易QR…ではなく「QR画像が欲しい」なら本当は qrcode で作るのが正道。
  // ただ、あなたのプロジェクトは既に qrcode を入れているので、
  // 「コピー用途」は URLコピーだけで十分、QRは“QRページ”に飛ばす運用が一番事故らない。
  // ここでは“QRコピー”＝URLコピーと同義にし、文言だけ残す。
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
}

export default function SiteQrActions({ siteCode }: Props) {
  const publicUrl = useMemo(() => buildPublicUrl(siteCode), [siteCode]);
  const [msg, setMsg] = useState<string>('');

  const copy = async (text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(okMsg);
      setTimeout(() => setMsg(''), 1200);
    } catch {
      setMsg('コピーできませんでした');
      setTimeout(() => setMsg(''), 1200);
    }
  };

  const copyUrl = () => copy(publicUrl, 'URLをコピーしました');
  const copyQr = () => copy(publicUrl, 'QR用URLをコピーしました');

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 公開ページ（先頭・黒） */}
      <Link
        href={`/s/${siteCode}`}
        target="_blank"
        className="px-3 py-1.5 text-xs rounded bg-gray-900 text-white hover:bg-black whitespace-nowrap"
      >
        公開ページを開く
      </Link>

      {/* QR（運用上は“QR用URLコピー”） */}
      <button
        type="button"
        onClick={copyQr}
        className="px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
      >
        QRコピー
      </button>

      {/* URL */}
      <button
        type="button"
        onClick={copyUrl}
        className="px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
      >
        URLコピー
      </button>

      {/* ちいさなフィードバック */}
      {msg ? <span className="text-xs text-gray-500 ml-1">{msg}</span> : null}
    </div>
  );
}