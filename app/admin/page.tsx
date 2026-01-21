'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteQrActions from './SiteQrActions';

type Site = any;

export default function AdminDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/sites', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        setSites(json.sites ?? []);
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
        <div className="flex items-end gap-3">
          {/* 左上の小ロゴ */}
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
            <p className="text-sm text-gray-500 mt-1">Managed by Reglanz.</p>
          </div>
        </div>

        <Link
          href="/admin/sites/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm"
        >
          <span className="text-lg leading-none">＋</span>
          新規現場作成
        </Link>
      </div>

      {/* 一覧ラッパー */}
      <div className="relative bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        {/* 背景ロゴ（うっすら・レスポンシブでズレ吸収） */}
        <Image
          src="/brand/logo-black.png"
          alt=""
          width={900}
          height={900}
          className="
            pointer-events-none select-none
            absolute top-1/2 -translate-y-1/2
            right-[-45%] sm:right-[-30%] md:right-[-15%]
            opacity-[0.04]
          "
        />

        <ul className="relative z-10 divide-y divide-gray-100">
          {sites.map((site) => (
            <li key={site.id} className="px-5 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/sites/${site.id}`}
                    className="font-semibold hover:underline block"
                  >
                    {site.name}
                  </Link>

                  <div className="text-sm text-gray-600 mt-1">
                    住所：{site.address || '未登録'} | 管理者：{site.manager_name || '未設定'}
                  </div>

                  <SiteQrActions siteCode={site.code} />
                </div>

                <div className="text-xs text-gray-400 shrink-0">
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