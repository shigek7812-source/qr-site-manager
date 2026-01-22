'use client';

console.log("ADMIN PAGE LOADED", Date.now());
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteQrActions from './SiteQrActions';

type Site = {
  id: string | number;
  code: string;
  name: string;
  status?: string | null;

  address?: string | null;

  manager_name?: string | null;     // 管理者
  contractor_name?: string | null;  // 元請
  client_name?: string | null;      // 施主
  designer_name?: string | null;    // 設計（なければ未設定）

  notes?: string | null;
  updated_at?: string | null;
};

type SiteStatus = string | null | undefined;

const statusLabel = (status: SiteStatus) => {
  const s = (status ?? '').trim();
  return s || '未設定';
};

const statusStyle = (status: SiteStatus) => {
  switch (statusLabel(status)) {
    case '進行中':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    case '保留':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    case '完了':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    default:
      return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200';
  }
};

export default function AdminDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const count = sites.length;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/sites', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');

        const json = await res.json();
        setSites(json.sites ?? []);
      } catch {
        setError('現場一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const headerLeft = useMemo(() => {
    return (
      <div className="flex items-center gap-3">
        <Image
          src="/brand/logo-black.png"
          alt="Reglanz"
          width={28}
          height={28}
          className="opacity-80"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">現場一覧</h1>
          <p className="text-sm text-gray-500 mt-1">Managed by Reglanz.</p>
        </div>
      </div>
    );
  }, []);

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4 mb-6">
        {headerLeft}

        <Link
          href="/admin/sites/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm whitespace-nowrap"
        >
          <span className="text-lg leading-none">＋</span>
          新規現場作成
        </Link>
      </div>

      {/* 一覧カード */}
      <div className="relative bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        {/* 背景ロゴ（うっすら） */}
       <Image
  src="/brand/logo-black.png"
  alt=""
  width={700}
  height={700}
  className="
    pointer-events-none
    absolute
    opacity-[0.04]

    /* PC */
    md:right-[-160px] md:top-[-120px]

    /* スマホ */
    left-1/2 top-1/2
    -translate-x-1/2 -translate-y-1/2
    md:translate-x-0 md:translate-y-0

    md:w-[700px]
    w-[420px]
  "
/>
        {/* 上部メタ */}
        <div className="relative px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            登録現場：<span className="font-semibold text-gray-900">{count}</span> 件
          </p>
          <p className="text-xs text-gray-400 whitespace-nowrap">クリックで詳細へ</p>
        </div>

        {/* 一覧 */}
        <ul className="relative divide-y divide-gray-100">
          {sites.length === 0 ? (
            <li className="px-6 py-10 text-center">
              <p className="text-gray-700 font-medium">まだ現場がありません</p>
              <p className="text-sm text-gray-500 mt-1">右上から新規作成できます。</p>
            </li>
          ) : (
            sites.map((site) => (
              <li key={site.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  {/* 左：ステータス + 本文 */}
                  <div className="min-w-0 flex-1">
                    {/* 1行目：ステータス丸ぽち + 現場名 + 管理者丸ぽち */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={[
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          statusStyle(site.status),
                        ].join(' ')}
                      >
                        {statusLabel(site.status)}
                      </span>

                      <Link
                        href={`/admin/sites/${site.id}`}
                        className="text-base font-semibold text-gray-900 hover:underline truncate"
                        title={site.name}
                      >
                        {site.name}
                      </Link>

                      {/* 管理者（現場名の右隣：丸ぽち・かっこよく） */}
                      {site.manager_name ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900 text-white whitespace-nowrap">
                          {site.manager_name}
                        </span>
                      ) : null}
                    </div>

                    {/* メモ：現場名の下あたり */}
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {site.notes?.trim() ? site.notes : 'メモなし'}
                    </p>

                    {/* 2行目：住所・元請・施主・設計 */}
                    <div className="mt-2 text-sm text-gray-700 leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="whitespace-nowrap">住所：{site.address || '未登録'}</span>
                      <span className="text-gray-300 hidden sm:inline">|</span>

                      <span className="whitespace-nowrap">元請：{site.contractor_name || '未設定'}</span>
                      <span className="text-gray-300 hidden sm:inline">|</span>

                      <span className="whitespace-nowrap">施主：{site.client_name || '未設定'}</span>
                      <span className="text-gray-300 hidden sm:inline">|</span>

                      <span className="whitespace-nowrap">設計：{site.designer_name || '未設定'}</span>
                    </div>

                    {/* ボタン（公開ページを左・QR/URL高さ揃え） */}
                    <div className="mt-3">
                      <SiteQrActions siteCode={site.code} />
                    </div>
                  </div>

                  {/* 右：編集＋更新日 */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Link
                      href={`/admin/sites/${site.id}`}
                      className="h-8 px-3 text-xs rounded-md bg-gray-900 text-white hover:bg-black transition whitespace-nowrap inline-flex items-center"
                    >
                      編集
                    </Link>

                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      更新日：
                      {site.updated_at
                        ? new Date(site.updated_at).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}