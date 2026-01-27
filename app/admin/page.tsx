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
  // URL系
  quote_url?: string | null;
  drawing_url?: string | null;
  schedule_url?: string | null;
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

function fmtDate(d?: string | null) {
  if (!d) return '-';
  const date = new Date(d);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export default function AdminDashboard() {
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [preferredManager, setPreferredManager] = useState<string>('');
  
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // データ取得
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

  // localStorage
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
    const list = [...sites];
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
  }, [sites, sortKey, preferredManager]);

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-neutral-900 font-sans pb-20 relative">
      
      {/* 背景の透かしロゴ */}
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
            className="bg-black hover:bg-neutral-800 text-white text-sm font-bold px-5 py-2.5 rounded-sm transition flex items-center gap-2 shadow-sm"
          >
            <span>＋ 新規現場作成</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 relative z-10">

        {/* --- フィルター & ソート --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-300">
          <div className="text-sm font-bold text-neutral-600">
            登録現場 : {sortedSites.length} 件
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="appearance-none bg-transparent text-xs font-bold border border-neutral-400 text-neutral-700 px-3 py-1.5 pr-8 rounded-sm focus:outline-none focus:bg-white hover:bg-white transition cursor-pointer"
              >
                <option value="updated">並び替え: 更新日順</option>
                <option value="code">並び替え: 番号順</option>
                <option value="status">並び替え: ステータス順</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">▼</div>
            </div>

            <div className="relative">
              <select
                value={preferredManager}
                onChange={(e) => setPreferredManager(e.target.value)}
                className={`appearance-none bg-transparent text-xs font-bold border px-3 py-1.5 pr-8 rounded-sm focus:outline-none focus:bg-white hover:bg-white transition cursor-pointer
                  ${preferredManager ? 'border-neutral-800 text-neutral-900' : 'border-neutral-400 text-neutral-700'}
                `}
              >
                <option value="">担当者: 全員</option>
                {MANAGERS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">▼</div>
            </div>
          </div>
        </div>

        {/* --- リストエリア --- */}
        <div className="divide-y divide-neutral-300 border-t border-b border-neutral-300">
          {sortedSites.map((site) => {
            const style = STATUS_STYLES[site.status || ''] || { dot: 'bg-neutral-300', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200' };
            const managerLabel = MANAGERS.find(m => m.value === site.manager_name)?.label;

            return (
              <div 
                key={site.id} 
                className="py-6 px-3 hover:bg-black/5 transition-colors group"
              >
                {/* スマホレイアウト対応: flex-colにして縦並びに強くする */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* メイン情報 */}
                  <div className="flex-1 min-w-0">
                    
                    {/* 1行目: ステータス行 */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <span className={`w-2.5 h-2.5 rounded-full ${style.dot} shrink-0`} />
                       
                       {/* 現場名 (折り返し許可: break-words) */}
                       <h3 className="text-lg font-bold text-neutral-900 leading-tight break-words">
                         {site.name}
                       </h3>

                       <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-sm whitespace-nowrap ${style.badge}`}>
                         {site.status || '未設定'}
                       </span>

                       {managerLabel && (
                         <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-200 text-neutral-700 rounded-sm whitespace-nowrap">
                           {managerLabel}
                         </span>
                       )}
                    </div>

                    {/* 2行目: 詳細情報 (折り返し許可) */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 font-medium mb-3">
                      <span className="flex items-center gap-1">
                        <span className="text-neutral-400">住所:</span> <span className="break-words">{site.address || '-'}</span>
                      </span>
                      <span className="text-neutral-300 hidden sm:inline">|</span>
                      <span className="flex items-center gap-1">
                        <span className="text-neutral-400">施主:</span> {site.client_name || '-'}
                      </span>
                      <span className="text-neutral-300 hidden sm:inline">|</span>
                      <span className="flex items-center gap-1">
                        <span className="text-neutral-400">元請:</span> {site.contractor_name || '-'}
                      </span>
                    </div>
                    
                    {/* メモ */}
                    {site.notes && (
                      <div className="text-xs text-neutral-400 pl-4 border-l-2 border-neutral-200 mt-1 mb-3 break-words">
                        {site.notes}
                      </div>
                    )}

                    {/* ボタン群 (flex-wrapで折り返し) */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 opacity-90 group-hover:opacity-100 transition-opacity">
                       
                       <a 
                         href={`/s/${site.code || site.id}`} 
                         target="_blank"
                         rel="noopener noreferrer"
                         className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-sm transition border border-black whitespace-nowrap"
                       >
                         公開ページ
                       </a>

                       {/* ★追加: 見積りボタン (URLがある時だけ表示) */}
                       {site.quote_url && (
                         <a
                           href={site.quote_url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold px-4 py-2 rounded-sm transition border border-neutral-300 flex items-center gap-1 whitespace-nowrap"
                         >
                           <svg className="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           見積書
                         </a>
                       )}

                       <div className="h-[34px]"> 
                         <SiteQrActions site={site} />
                       </div>

                       <button
                         onClick={() => copyUrl(site.code || site.id)}
                         className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold px-4 py-2 rounded-sm transition border border-neutral-300 whitespace-nowrap"
                       >
                         URLコピー
                       </button>
                    </div>

                  </div>

                  {/* 右上：編集ボタン・更新日 */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 md:ml-4 w-full md:w-auto mt-2 md:mt-0">
                    <button
                      onClick={() => window.location.href = `/admin/sites/${site.id}`}
                      className="text-sm font-bold text-black border-2 border-black px-5 py-1.5 rounded-sm hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                    >
                      編集
                    </button>
                    
                    <div className="text-[10px] text-neutral-400 text-right font-mono flex gap-2 md:block">
                      <span className="md:hidden">Updated:</span>
                      <div>{fmtDate(site.updated_at)}</div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
          
          {/* データなし */}
          {sortedSites.length === 0 && !loading && (
            <div className="py-12 text-center text-neutral-400">
              表示する現場がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}