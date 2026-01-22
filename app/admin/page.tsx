'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteQrActions from './SiteQrActions';

type Site = {
  id: string;
  code: string;
  name: string;
  status?: string | null;

  address?: string | null;
  client_name?: string | null; // 施主
  contractor_name?: string | null; // 元請
  designer_name?: string | null; // 設計（DBになければ未登録表示）

  manager_name?: string | null; // 管理者
  notes?: string | null;

  updated_at?: string | null;
};

function statusStyle(status?: string | null) {
  const s = (status ?? '').toLowerCase();

  if (s.includes('見積提出済') || s.includes('プランニング中') || s.includes('進行') || s.includes('in')) {
    return { dot: 'bg-emerald-500', label: 'text-emerald-700 bg-emerald-50 ring-emerald-100' };
  }
  if (s.includes('工事中') || s.includes('保留') || s.includes('検討') || s.includes('quote')) {
    return { dot: 'bg-amber-500', label: 'text-amber-700 bg-amber-50 ring-amber-100' };
  }
  if (s.includes('完了') || s.includes('手直し') || s.includes('done')) {
    return { dot: 'bg-sky-500', label: 'text-sky-700 bg-sky-50 ring-sky-100' };
  }
  return { dot: 'bg-gray-400', label: 'text-gray-700 bg-gray-50 ring-gray-200' };
}

export default function AdminDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const count = useMemo(() => sites.length, [sites]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/sites', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        setSites(json.sites ?? []);
      } catch (_e) {
        setError('現場一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div className="flex items-end gap-3">
          <Image
            src="/brand/logo-black.png"
            alt="Reglanz"
            width={28}
            height={28}
            className="opacity-80"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">現場一覧</h1>
            <p className="text-sm text-gray-500 mt-1">Produced by Reglanz.</p>
          </div>
        </div>

        <Link
          href="/admin/sites/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm whitespace-nowrap"
        >
          <span className="text-lg leading-none">＋</span>
          新規現場作成
        </Link>
      </div>

      {/* 一覧ラッパー（relative 必須） */}
      <div className="relative bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        {/* 背景ロゴ（縦横比維持） */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] w-[520px] h-[520px] sm:w-[640px] sm:h-[640px] md:w-[820px] md:h-[820px]">
          <Image src="/brand/logo-black.png" alt="" fill className="object-contain" />
        </div>

        {/* 上部メタ */}
        <div className="relative px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            登録現場：<span className="font-semibold text-gray-900">{count}</span> 件
          </p>
          <p className="text-xs text-gray-400">一覧は管理者のみ</p>
        </div>

        {/* 一覧 */}
        <ul role="list" className="relative divide-y divide-gray-100">
          {sites.length === 0 ? (
            <li className="px-6 py-10 text-center">
              <p className="text-gray-700 font-medium">まだ現場がありません</p>
              <p className="text-sm text-gray-500 mt-1">
                右上の「新規現場作成」から1件作ってみましょう。
              </p>
            </li>
          ) : (
            sites.map((site) => {
              const st = statusStyle(site.status);

              return (
                <li key={site.id} className="hover:bg-gray-50 transition">
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* 左：情報 */}
                      <div className="min-w-0 flex-1">
                        {/* 1行目：丸ぽち → 現場名 → 管理者（丸ぽち） */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`h-2.5 w-2.5 rounded-full ${st.dot} shrink-0`} />

                          <Link
                            href={`/admin/sites/${site.id}`}
                            className="text-base font-semibold text-gray-900 truncate hover:underline"
                          >
                            {site.name}
                          </Link>

                          {site.manager_name ? (
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 ring-1 ring-gray-200 shrink-0"
                              title="管理者"
                            >
                             <span className="...">
  {site.manager_name?.trim() ? site.manager_name : '未設定'}
</span>
                            </span>
                          ) : null}

                          {/* ステータス文字も出す（不要ならこのブロック削除OK） */}
                          {site.status ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 shrink-0 ${st.label}`}
                              title="現場ステータス"
                            >
                              {site.status}
                            </span>
                          ) : null}
                        </div>

                        {/* 2行目：住所 / 施主 / 元請 / 設計 */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span>住所：{site.address || '未登録'}</span>
                          <span className="text-gray-300">|</span>
                          <span>施主：{site.client_name || '未登録'}</span>
                          <span className="text-gray-300">|</span>
                          <span>元請：{site.contractor_name || '未登録'}</span>
                          <span className="text-gray-300">|</span>
                          <span>設計：{site.designer_name || '未登録'}</span>
                        </div>

                        {/* メモ（現場名の下あたり） */}
                        <p className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">
                          {site.notes || 'メモなし'}
                        </p>

                        {/* ボタン群（公開ページ/QR/URL） */}
                        <div className="mt-3">
                          <SiteQrActions siteCode={site.code} />
                        </div>
                      </div>

                      {/* 右：編集＋更新日 */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                       <Link
  href={`/admin/sites/${site.id}`}
  onClick={(e) => e.stopPropagation()}
  className="text-xs px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black transition whitespace-nowrap"
>
  編集
</Link>

                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          更新日：
                          {site.updated_at ? new Date(site.updated_at).toLocaleDateString() : '-'}
                        </p>

                        <span className="text-[10px] text-gray-400">code: {site.code}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}