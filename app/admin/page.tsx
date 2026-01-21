import { listSites } from '@/lib/data/sites';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const sites = await listSites();

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
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm"
        >
          <span className="text-lg leading-none">＋</span>
          新規現場作成
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            登録現場：<span className="font-semibold text-gray-900">{sites.length}</span> 件
          </p>
          <p className="text-xs text-gray-400">クリックで詳細へ</p>
        </div>

        <ul role="list" className="divide-y divide-gray-100">
          {sites.length === 0 ? (
            <li className="px-6 py-10 text-center">
              <p className="text-gray-700 font-medium">まだ現場がありません</p>
              <p className="text-sm text-gray-500 mt-1">
                右上の「新規現場作成」から1件作ってみましょう。
              </p>
            </li>
          ) : (
            sites.map((site) => (
              <li key={site.id}>
                <Link
                  href={`/admin/sites/${site.id}`}
                  className="block hover:bg-gray-50 transition"
                >
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {site.name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span>
                            住所：{site.address || '未登録'}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>
                            管理者：{site.manager_name || '未設定'}
                            {site.manager_phone ? `（${site.manager_phone}）` : ''}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                          {site.notes || 'メモなし'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                          {site.code}
                        </span>
                        <p className="text-xs text-gray-400">
                          更新日：{new Date(site.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}