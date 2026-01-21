'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteQrActions from './SiteQrActions';
import Image from "next/image";
type Site = any;

<div className="flex items-end gap-3 mb-6">
  <Image
    src="/brand/logo-black.png"
    alt="Reglanz"
    width={28}
    height={28}
    className="opacity-80"
  />
  <div>
    <h1 className="text-2xl font-bold text-gray-900">現場一覧</h1>
    <p className="text-sm text-gray-500 mt-1">
      Managed by Rglanz.
    </p>
  </div>
</div>
export default function AdminDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/sites');
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        setSites(json.sites);
      } catch (e) {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">現場一覧</h1>
        <p className="text-sm text-gray-500 mt-1">Managed by Reglanz.</p>
      </div>

      <Link
        href="/admin/sites/new"
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm"
      >
        <span className="text-lg leading-none">＋</span>
        新規現場作成
      </Link>
    </div>

    {/* ✅ 一覧ラッパー（ここが正しい場所） */}
    <div className="relative bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
      {/* 背景ロゴ（うっすら） */}
      <Image
        src="/brand/logo-black.png"
        alt=""
        width={700}
        height={700}
        className="pointer-events-none absolute right-[-160px] top-[-120px] opacity-[0.03]"
      />

      {/* 一覧本体 */}
      <ul className="relative divide-y divide-gray-100">
        {sites.map((site) => (
          <li key={site.id} className="px-5 py-4 hover:bg-gray-50">
            {/* ↓ここはあなたの今のli中身をそのまま貼ってOK */}
            <div className="flex justify-between">
              <div>
                <Link href={`/admin/sites/${site.id}`} className="font-semibold hover:underline">
                  {site.name}
                </Link>
                <div className="text-sm text-gray-600 mt-1">
                  住所：{site.address || '未登録'} | 管理者：{site.manager_name || '未設定'}
                </div>

                <SiteQrActions siteCode={site.code} />
              </div>

              <div className="text-xs text-gray-400">
                更新日：{new Date(site.updated_at).toLocaleDateString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
}