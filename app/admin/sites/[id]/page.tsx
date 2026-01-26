'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// --- Types ---
type Site = {
  id: string;
  code: string;
  name: string;
  status?: string | null;
  
  // 基本情報
  address?: string | null;
  client_name?: string | null;
  contractor_name?: string | null;
  designer_name?: string | null;
  manager_name?: string | null;
  notes?: string | null;

  // リンク情報
  drawing_url?: string | null;  // 図面
  schedule_url?: string | null; // 工程表
  quote_url?: string | null;    // 見積り（社内用）

  updated_at?: string | null;
};

// --- Constants ---
const STATUS_OPTIONS = [
  { value: '見積中', dotCore: 'bg-sky-600', dotGlow: 'bg-sky-400', pill: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'プランニング中', dotCore: 'bg-sky-600', dotGlow: 'bg-sky-400', pill: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: '見積提出済', dotCore: 'bg-emerald-600', dotGlow: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: '着工準備中', dotCore: 'bg-emerald-600', dotGlow: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: '工事中', dotCore: 'bg-yellow-500', dotGlow: 'bg-yellow-300', pill: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { value: '手直し', dotCore: 'bg-orange-600', dotGlow: 'bg-orange-400', pill: 'bg-orange-50 text-orange-800 border-orange-200' },
  { value: '追加工事', dotCore: 'bg-orange-600', dotGlow: 'bg-orange-400', pill: 'bg-orange-50 text-orange-800 border-orange-200' },
  { value: '完了', dotCore: 'bg-rose-600', dotGlow: 'bg-rose-400', pill: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: '保留', dotCore: 'bg-slate-500', dotGlow: 'bg-slate-400', pill: 'bg-slate-50 text-slate-600 border-slate-200' },
  { value: 'その他', dotCore: 'bg-slate-500', dotGlow: 'bg-slate-400', pill: 'bg-slate-50 text-slate-600 border-slate-200' },
] as const;

const MANAGERS = [
  { label: '片島', value: 'katashima' },
  { label: '高沢', value: 'takazawa' },
  { label: '渡辺', value: 'watanabe' },
  { label: '坊内', value: 'bouuchi' },
  { label: '重本', value: 'shigemoto' },
  { label: '国近', value: 'kunichika' },
] as const;

// --- Helpers ---
function field(v?: string | null) {
  return (v ?? '').toString();
}
function statusDotCoreClass(status?: string | null) {
  const found = STATUS_OPTIONS.find((o) => o.value === status);
  return found?.dotCore ?? 'bg-slate-400';
}
function statusDotGlowClass(status?: string | null) {
  const found = STATUS_OPTIONS.find((o) => o.value === status);
  return found?.dotGlow ?? 'bg-slate-300';
}
function statusPillClass(status?: string | null) {
  const found = STATUS_OPTIONS.find((o) => o.value === status);
  return found?.pill ?? 'bg-slate-50 text-slate-600 border-slate-200';
}
function fmtDate(d?: string | null) {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
}

// --- Components ---
function Input({
  label,
  value,
  onChange,
  placeholder,
  note,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  note?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        {note && <div className="text-[10px] text-slate-400">{note}</div>}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl px-4 py-3 text-sm bg-white/70 backdrop-blur shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/30 transition-all"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="text-xs text-slate-500 mb-2 font-medium">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-2xl px-4 py-3 text-sm bg-white/70 backdrop-blur shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/30 transition-all"
      />
    </label>
  );
}

export default function SiteEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orig, setOrig] = useState<Site | null>(null);
  const [form, setForm] = useState<Site | null>(null);

  // 変更検知
  const dirty = useMemo(() => {
    if (!orig || !form) return false;
    const keys: (keyof Site)[] = [
      'code', 'name', 'status', 'address', 
      'client_name', 'contractor_name', 'designer_name', 'manager_name', 'notes',
      'drawing_url', 'schedule_url', 'quote_url'
    ];
    return keys.some((k) => field(orig[k]).trim() !== field(form[k]).trim());
  }, [orig, form]);

  // データ取得
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/sites/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('データ取得に失敗しました');
        
        const s = (await res.json()) as Site;
        setOrig(s);
        setForm(s);
      } catch (e) {
        console.error(e);
        setError('現場データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // 保存処理
  const save = async () => {
    if (!id || !form) return;
    try {
      setSaving(true);
      setError(null);

      const body = {
        name: field(form.name),
        code: field(form.code),
        status: form.status ?? null,
        
        address: field(form.address) || null,
        client_name: field(form.client_name) || null,
        contractor_name: field(form.contractor_name) || null,
        designer_name: field(form.designer_name) || null,
        manager_name: field(form.manager_name) || null,
        notes: field(form.notes) || null,

        drawing_url: field(form.drawing_url) || null,
        schedule_url: field(form.schedule_url) || null,
        quote_url: field(form.quote_url) || null,
      };

      const res = await fetch(`/api/admin/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('保存に失敗しました');

      const saved = (await res.json()) as Site;
      setOrig(saved);
      setForm(saved);
      
      router.refresh();
      router.push('/admin');

    } catch (e) {
      console.error(e);
      setError('保存できませんでした');
    } finally {
      setSaving(false);
    }
  };

  // --- Render ---

  if (loading) return <div className="p-8 text-center text-slate-500">読み込み中...</div>;
  if (error && !form) return <div className="p-8 text-center text-rose-500">{error}</div>;
  if (!form) return null;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden pb-24">
      {/* 背景ロゴ */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none opacity-[0.035]">
        <img src="/brand/logo-black.png" alt="" className="w-[70vw] max-w-[900px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
        
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-black.png" alt="Reglanz" width={44} height={44} className="opacity-90" />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-semibold tracking-tight">現場編集</h1>
                
                {/* ステータスバッジ（ここを修正しました） */}
                {/* relative を追加して光の範囲を制限 */}
                <span className="relative inline-flex items-center justify-center w-5 h-5">
                   <span className={`absolute w-3 h-3 rounded-full ${statusDotCoreClass(form.status)}`}/>
                   <span className={`absolute w-full h-full rounded-full blur-md opacity-60 ${statusDotGlowClass(form.status)}`}/>
                </span>

                <span className={`text-sm px-3 py-1 rounded-full border ${statusPillClass(form.status)}`}>
                  {field(form.status)?.trim() ? form.status : '未設定'}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-500">
                更新日：{fmtDate(orig?.updated_at)}
              </div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition"
          >
            キャンセルして戻る
          </button>
        </div>

        {/* フォームエリア */}
        <div className="space-y-6">
          
          {/* 基本情報 */}
          <div className="rounded-3xl bg-white/60 p-6 shadow-sm backdrop-blur">
            <h2 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="現場名" value={field(form.name)} onChange={(v) => setForm({ ...form, name: v })} placeholder="例）test001" />
              <Input label="管理番号 (Code)" value={field(form.code)} onChange={(v) => setForm({ ...form, code: v })} placeholder="例）test001" />
              
              <label className="block">
                <div className="text-xs text-slate-500 mb-2 font-medium">ステータス</div>
                <div className="relative">
                  <select
                    value={field(form.status)}
                    onChange={(e) => setForm({ ...form, status: e.target.value || null })}
                    className="w-full appearance-none rounded-2xl px-4 py-3 text-sm bg-white/70 backdrop-blur shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 cursor-pointer"
                  >
                    <option value="">未設定</option>
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                  </select>
                </div>
              </label>

              <label className="block">
                <div className="text-xs text-slate-500 mb-2 font-medium">担当者</div>
                <div className="relative">
                  <select
                    value={field(form.manager_name)}
                    onChange={(e) => setForm({ ...form, manager_name: e.target.value || null })}
                    className="w-full appearance-none rounded-2xl px-4 py-3 text-sm bg-white/70 backdrop-blur shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 cursor-pointer"
                  >
                    <option value="">未登録</option>
                    {MANAGERS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </label>
            </div>
          </div>

          {/* 関係者情報 */}
          <div className="rounded-3xl bg-white/60 p-6 shadow-sm backdrop-blur">
            <h2 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">関係者・住所</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="住所" value={field(form.address)} onChange={(v) => setForm({ ...form, address: v })} />
              <Input label="施主" value={field(form.client_name)} onChange={(v) => setForm({ ...form, client_name: v })} />
              <Input label="元請" value={field(form.contractor_name)} onChange={(v) => setForm({ ...form, contractor_name: v })} />
              <Input label="設計" value={field(form.designer_name)} onChange={(v) => setForm({ ...form, designer_name: v })} />
            </div>
          </div>

          {/* 共有ドキュメント（第三者公開） */}
          <div className="rounded-3xl bg-white/60 p-6 shadow-sm backdrop-blur border-l-4 border-emerald-400">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                共有ドキュメント (公開)
              </h2>
              <p className="text-xs text-slate-500 mt-1 ml-7">
                QRコードからアクセスできるページに表示されます。施主や職人さんと共有したいファイルのURLを入力してください。
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 ml-1">
              <Input 
                label="図面" 
                note="Google Drive / Dropbox / PDFへのリンク等"
                value={field(form.drawing_url)} 
                onChange={(v) => setForm({ ...form, drawing_url: v })} 
                placeholder="https://..." 
              />
              <Input 
                label="工程表" 
                note="Google Drive / Dropbox / PDFへのリンク等"
                value={field(form.schedule_url)} 
                onChange={(v) => setForm({ ...form, schedule_url: v })} 
                placeholder="https://..." 
              />
            </div>
          </div>

          {/* 社内用データ（非公開） */}
          <div className="rounded-3xl bg-slate-200/50 p-6 shadow-inner">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-600 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                社内用データ (非公開)
              </h2>
              <p className="text-xs text-slate-500 mt-1 ml-7">
                ここは管理者のみ閲覧可能です。外部には公開されません。
              </p>
            </div>

            <div className="space-y-4">
              <Input 
                label="見積り URL" 
                note="Google Drive / Dropbox / PDFへのリンク等"
                value={field(form.quote_url)} 
                onChange={(v) => setForm({ ...form, quote_url: v })} 
                placeholder="https://..." 
              />
              
              <TextArea 
                label="社内用メモ" 
                value={field(form.notes)} 
                onChange={(v) => setForm({ ...form, notes: v })} 
                placeholder="現場の注意点、段取り、駐車場の位置など"
              />
            </div>
          </div>

        </div>

        {/* 保存アクションバー */}
        <div className="sticky bottom-6 mt-8 z-20">
          <div className="rounded-2xl bg-slate-900/90 backdrop-blur text-white p-4 shadow-xl flex items-center justify-between">
             <button
               onClick={() => setForm(orig)}
               disabled={!dirty || saving}
               className="text-xs text-slate-400 hover:text-white disabled:opacity-30 transition"
             >
               変更をリセット
             </button>

             <div className="flex items-center gap-4">
               <span className="text-xs text-slate-300">
                 {dirty ? '保存されていない変更があります' : '変更はありません'}
               </span>
               <button
                 onClick={save}
                 disabled={!dirty || saving}
                 className={`
                   px-6 py-2 rounded-xl text-sm font-bold transition
                   ${dirty ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}
                 `}
               >
                 {saving ? '保存中...' : '変更を保存'}
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}