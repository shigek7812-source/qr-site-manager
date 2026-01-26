// app/admin/sites/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('現場名を入力してください');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/sites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, code }),
});

const text = await res.text();
let data: any = {};
try { data = text ? JSON.parse(text) : {}; } catch {}

if (!res.ok) {
  throw new Error(data?.error || text || 'Failed to create site');
}

      router.push('/admin'); // 一覧へ
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? '作成エラー');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-xl font-bold">新規現場作成</h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <label className="block">
        <div className="text-sm text-gray-600 mb-1">現場名（必須）</div>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例）test001"
        />
      </label>

      <label className="block">
        <div className="text-sm text-gray-600 mb-1">現場コード（任意）</div>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="未入力なら自動生成"
        />
      </label>

      <button
        onClick={submit}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-60"
      >
        {saving ? '作成中…' : '作成する'}
      </button>
    </div>
  );
}