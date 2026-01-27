'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteQrActions from './SiteQrActions';

// --- Types ---
type Site = {
  id: string;
  code: string;
  name: string;
  status?: string | null;
  address?: string | null;
  client_name?: string | null;
  contractor_name?: string | null;
  designer_name?: string | null;
  manager_name?: string | null;
  notes?: string | null;
  updated_at?: string | null;
};

type SortKey = 'code' | 'status' | 'updated';

// --- Constants ---
const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  '見積中':      { dot: 'bg-sky-500',    badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  'プランニング中': { dot: 'bg-sky-500',    badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  '見積提出済':   { dot: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  '着工準備中':   { dot: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  '工事中':      { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  '手直し':      { dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  '追加工事':    { dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  '完了':        { dot: 'bg-neutral-400', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  '保留':        { dot: 'bg-neutral-400', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  'その他':      { dot: 'bg-neutral-400', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
};

const MANAGERS = [
  { label: '片島', value: 'katashima' },
  { label: '高沢', value: 'takazawa' },
  { label: '渡辺', value: 'watanabe' },
  { label: '坊内', value: 'bouuchi' },
  { label: '重本', value: 'shigemoto' },
  { label: '国近', value: 'kunichika' },
];

const MANAGER_MAP: Record<string, string> = {
  'katashima': '片島',
  'takazawa': '高沢',
  'watanabe': '渡辺',
  'bouuchi': '坊内',
  'shigemoto': '重本',
  'kunichika': '国近',
};

function fmtDate(d?: string | null) {
  if (!d) return '-';
  const date = new Date(d);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export default function AdminDashboard() {
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [preferredManager, setPreferredManager] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/sites', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setSites(Array.isArray(json) ? json : json?.sites ?? []);
        } else {
           setSites([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('preferredManager');
      if (saved) setPreferredManager(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('preferredManager', preferredManager);
    } catch {}
  }, [preferredManager]);

  const copyUrl = (code: string) => {
    const url = `${window.location.origin}/s/${code}`;
    navigator.clipboard.writeText(url);
    alert('URLをコピーしました');
  };

  const sortedSites: Site[] = useMemo(() => {
    let list = [...sites];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(site => {
        const managerLabel = MANAGER_MAP[site.manager_name || ''] || '';
        return (
          (site.name && site.name.toLowerCase().includes(term)) ||
          (site.address && site.address.toLowerCase().includes(term)) ||
          (site.client_name && site.client_name.toLowerCase().includes(term)) ||
          (site.contractor_name && site.contractor_name.toLowerCase().includes(term)) ||
          (managerLabel && managerLabel.includes(term))
        );
      });
    }

    if (sortKey === 'code') list.sort((a, b) => (a.code ?? '').localeCompare(b.code ?? ''));
    if (sortKey === 'status') list.sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));
    if (sortKey === 'updated') list.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));

    if (preferredManager) {
      list.sort((a, b) => {
        const am = a.manager_name === preferredManager;
        const bm = b.manager_name === preferredManager;
        return (am === bm) ? 0 : am ? -1 : 1;
      });
    }
    return list;
  }, [sites, sortKey, preferredManager, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-neutral-900 font-sans pb-20 relative">
      
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <img
          src="/brand/logo-black.png"
          alt=""
          className="w-[500px] opacity-[0.03] grayscale translate-y-10"
        />
      </div>

      {/* ヘッダーエリア */}
      <div className="bg-white border-b border-neutral-300 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col">
             <div className="flex items-center gap-3">
               <h1 className="text-xl font-bold text-neutral-900 tracking-tight">現場一覧</h1>
             </div>
             <p className="text-[10px] text-neutral-400 mt-0.5 font-medium tracking-wide">Produced by Reglanz.</p>
          </div>
          
          <button
            onClick={() => window.location.href = '/admin/sites/new'}
            className="bg-black hover:bg-neutral-800 text-white text-sm font-bold px-5 py-2.5 rounded-sm transition flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <span>＋ 新規</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 relative z-10">

        {/* --- 検索・フィルターエリア (スマホ最適化) --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 mb-6 space-y-4">
            
            {/* 1. 検索窓 (全幅) */}
            <div className="relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-neutral-400 group-focus-within:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="現場名・住所・施主名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-3 text-sm font-bold bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition w-full placeholder-neutral-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 2. フィルター類 (横並び) */}
            <div className="flex flex-wrap gap-3">
              <div className="text-sm font-bold text-neutral-600 flex items-center mr-auto">
                {sortedSites.length} 件
              </div>

              {/* ソート */}
              <div className="relative">
                <select 
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="appearance-none bg-white text-xs font-bold border border-neutral-300 text-neutral-700 px-3 py-2 pr-8 rounded-md focus:outline-none focus:border-black transition cursor-pointer"
                >
                  <option value="updated">更新日順</option>
                  <option value="code">番号順</option>
                  <option value="status">状況順</option>
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">▼</div>
              </div>

              {/* 担当者 */}
              <div className="relative">
                <select
                  value={preferredManager}
                  onChange={(e) => setPreferredManager(e.target.value)}
                  className={`appearance-none bg-white text-xs font-bold border px-3 py-2 pr-8 rounded-md focus:outline-none focus:border-black transition cursor-pointer
                    ${preferredManager ? 'border-neutral-800 text-neutral-900' : 'border-neutral-300 text-neutral-700'}
                  `}
                >
                  <option value="">担当: 全員</option>
                  {MANAGERS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">▼</div>
              </div>
            </div>
        </div>

        {/* --- リストエリア --- */}
        <div className="space-y-4 pb-12">
          {sortedSites.map((site) => {
            const style = STATUS_STYLES[site.status || ''] || { dot: 'bg-neutral-300', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200' };
            const managerLabel = MANAGERS.find(m => m.value === site.manager_name)?.label;

            return (
              <div 
                key={site.id} 
                className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* 左側のステータスカラーバー */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.dot}`} />

                <div className="pl-3">
                   {/* 1. ヘッダー行: 現場名 (独立させる) */}
                   <h3 className="text-lg font-bold text-neutral-900 mb-3 leading-tight">
                     {site.name}
                   </h3>

                   {/* 2. ステータス・担当者行 */}
                   <div className="flex flex-wrap items-center gap-2 mb-4">
                       <span className={`px-2 py-1 text-[10px] font-bold border rounded-sm ${style.badge}`}>
                         {site.status || '未設定'}
                       </span>

                       {managerLabel && (
                         <span className="px-2 py-1 text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-sm">
                           担当: {managerLabel}
                         </span>
                       )}
                       
                       <span className="text-[10px] text-neutral-400 font-mono ml-auto">
                         Upd: {fmtDate(site.updated_at)}
                       </span>
                   </div>

                   {/* 3. 詳細情報 */}
                   <div className="space-y-1 text-xs text-neutral-600 font-medium mb-4 bg-neutral-50 p-3 rounded-md border border-neutral-100">
                      <div className="flex gap-2">
                        <span className="text-neutral-400 w-8 shrink-0">住所</span>
                        <span className="break-all">{site.address || '-'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-neutral-400 w-8 shrink-0">施主</span>
                        <span>{site.client_name || '-'} 様</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-neutral-400 w-8 shrink-0">元請</span>
                        <span>{site.contractor_name || '-'}</span>
                      </div>
                   </div>
                   
                   {/* メモがあれば表示 */}
                   {site.notes && (
                      <div className="text-xs text-neutral-500 mb-4 flex items-start gap-2">
                        <span className="text-amber-500 shrink-0">⚠️</span>
                        <span className="line-clamp-2">{site.notes}</span>
                      </div>
                   )}

                   {/* 4. アクションボタン群 */}
                   <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                       <a 
                         href={`/s/${site.code || site.id}`} 
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-md text-center hover:bg-neutral-800 transition"
                       >
                         公開ページ
                       </a>

                       <button
                         onClick={() => window.location.href = `/admin/sites/${site.id}`}
                         className="flex-1 bg-white text-neutral-900 border border-neutral-300 text-xs font-bold py-2.5 rounded-md text-center hover:bg-neutral-50 transition"
                       >
                         編集
                       </button>

                       <div className="flex gap-2 shrink-0">
                         <div className="h-[36px]"> 
                           <SiteQrActions site={site} />
                         </div>
                         <button
                           onClick={() => copyUrl(site.code || site.id)}
                           className="h-[36px] w-[36px] flex items-center justify-center bg-white border border-neutral-300 rounded-md text-neutral-600 hover:text-black transition"
                           title="URLをコピー"
                         >
                           🔗
                         </button>
                       </div>
                   </div>
                </div>
              </div>
            );
          })}
          
          {sortedSites.length === 0 && !loading && (
            <div className="py-20 text-center text-neutral-400 bg-white rounded-lg border border-neutral-200 border-dashed">
              <p className="font-bold mb-1">表示する現場がありません</p>
              <p className="text-xs">条件を変更するか、新規作成してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}