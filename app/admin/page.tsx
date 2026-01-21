'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteQrActions from './SiteQrActions';

type Site = any;

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
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">現場一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            QRで共有する現場情報を、ここで整備します。
          </p>
        </div>

        <Link
          href="/admin/sites/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg"
        >
          ＋ 新規現場作成
        </Link>
      </div>

      <ul className="divide-y divide-gray-100 bg-white rounded-xl ring-1 ring-gray-200">
        {sites.map((site) => (
          <li key={site.id} className="px-5 py-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <div>
                <Link
                  href={`/admin/sites/${site.id}`}
                  className="font-semibold hover:underline"
                >
                  {site.name}
                </Link>
                <div className="text-sm text-gray-600 mt-1">
                住所：{site.address || '未登録'} | 管理者：{site.manager_name || '未設定'}
 | 状況：{site.status || '未設定'} | 施主：{site.client_name || '未設定'} | 元請：{site.contractor_name || '未設定'}
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
  );
}