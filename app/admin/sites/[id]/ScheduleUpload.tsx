'use client';

import { useState } from 'react';

type Props = {
  siteId: string;
  onUploaded?: () => void;
};

export default function ScheduleUpload({ siteId, onUploaded }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [url, setUrl] = useState<string>('');

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setMsg('');
    setUrl('');

    try {
      // ★ JSONじゃなく FormData で送る（PDFを送るため）
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`/api/admin/sites/${siteId}/schedule`, {
        method: 'POST',
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || '保存に失敗しました');
      }

      setMsg('工程表PDFを更新しました');
      setUrl(data?.url || '');
      onUploaded?.();
    } catch (err: any) {
      setMsg(`エラー: ${err?.message || String(err)}`);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-white">
      <p className="text-sm font-semibold text-gray-900">工程表PDF</p>
      <p className="text-xs text-gray-500 mt-1">PDFを選ぶとアップロードして現場に紐づけます。</p>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={onPick}
          disabled={busy}
          className="text-sm"
        />
        {busy && <span className="text-xs text-gray-500">アップ中…</span>}
      </div>

      {msg && <p className="text-xs mt-2 text-gray-700">{msg}</p>}

      {url && (
        <p className="text-xs mt-2">
          <a className="text-blue-600 underline" href={url} target="_blank" rel="noreferrer">
            工程表PDFを開く
          </a>
        </p>
      )}
    </div>
  );
}