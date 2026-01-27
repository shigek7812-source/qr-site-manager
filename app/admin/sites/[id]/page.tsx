'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// --- Types ---
type Site = {
  id: string;
  code: string;
  name: string;
  status: string;
  address: string;
  client_name: string;
  contractor_name: string;
  designer_name: string;
  manager_name: string;
  notes: string;
  quote_url: string;
  drawing_url: string[]; // ★ここを配列に変更
  schedule_url: string;
  photos_url: string;
};

// --- Constants ---
const STATUS_OPTIONS = [
  '見積中', 'プランニング中', '見積提出済', '着工準備中', 
  '工事中', '手直し', '追加工事', '完了', '保留', 'その他'
];

const MANAGERS = [
  { label: '片島', value: 'katashima' },
  { label: '高沢', value: 'takazawa' },
  { label: '渡辺', value: 'watanabe' },
  { label: '坊内', value: 'bouuchi' },
  { label: '重本', value: 'shigemoto' },
  { label: '国近', value: 'kunichika' },
];

export default function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'drawing' | 'schedule' | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/admin/sites/${id}`, { cache: 'no-store' });
        if (!res.ok) {
           setLoading(false);
           return;
        }
        const json = await res.json();
        const siteData = json.site || json.data || json;
        
        // 配列じゃなかった場合の保険（nullなら空配列にする）
        if (siteData) {
          if (!Array.isArray(siteData.drawing_url)) {
             siteData.drawing_url = siteData.drawing_url ? [siteData.drawing_url] : [];
          }
          setSite(siteData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!site) return;
    setSite({ ...site, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!site) return;
    setSaving(true);
    
    const payload = {
      code: site.code,
      name: site.name,
      status: site.status,
      address: site.address,
      client_name: site.client_name,
      contractor_name: site.contractor_name,
      designer_name: site.designer_name,
      manager_name: site.manager_name,
      notes: site.notes,
      quote_url: site.quote_url,
      drawing_url: site.drawing_url, // 配列のまま送信
      schedule_url: site.schedule_url,
      photos_url: site.photos_url,
    };

    try {
      const res = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const err = await res.json();
        alert(`保存失敗: ${err.error || '不明なエラー'}`);
      }
    } catch (e: any) {
      alert(`通信エラー: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ファイルアップロード
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'drawing' | 'schedule') => {
    if (!e.target.files || e.target.files.length === 0 || !site) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const randomString = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
    const shortId = site.id.slice(0, 8);
    const fileName = `${shortId}_${field}_${randomString}.${fileExt}`;

    setUploading(field);

    try {
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      if (field === 'drawing') {
        // 図面の場合は「追加」する
        setSite({ ...site, drawing_url: [...site.drawing_url, publicUrl] });
      } else {
        // 工程表の場合は「上書き」する（1つだけ）
        setSite({ ...site, schedule_url: publicUrl });
      }

    } catch (error: any) {
      alert(`アップロード失敗: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  // 図面削除ハンドラ
  const removeDrawing = (indexToRemove: number) => {
    if (!site) return;
    setSite({
      ...site,
      drawing_url: site.drawing_url.filter((_, index) => index !== indexToRemove)
    });
  };

  if (loading) return <div className="p-20 text-center font-bold text-neutral-400 font-mono">LOADING DATA...</div>;
  if (!site) return <div className="p-20 text-center font-bold text-neutral-400">NO DATA FOUND</div>;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-neutral-900 font-sans pb-32 relative">
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <img src="/brand/logo-black.png" alt="" className="w-[600px] opacity-[0.03] grayscale translate-y-10" />
      </div>

      <header className="bg-white border-b border-neutral-300 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-800">現場情報編集</h1>
            <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">ID: {site.id.slice(0, 8)}...</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-black transition">キャンセル</button>
            <button onClick={handleSave} disabled={saving} className="bg-[#0052CC] hover:bg-[#0042A4] text-white text-sm font-bold px-6 py-2 rounded-sm shadow-sm transition disabled:opacity-50">
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-8 relative z-10 space-y-8">
        
        {/* 1. 現場情報 */}
        <section className="bg-white border border-neutral-300 p-6 rounded-sm shadow-sm">
          <h2 className="text-sm font-bold text-[#0052CC] border-l-4 border-[#0052CC] pl-3 mb-6">1. 現場情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-neutral-500 mb-1">管理番号</label>
              <input type="text" name="code" value={site.code || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2.5 rounded-sm font-bold text-lg text-center" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-neutral-500 mb-1">ステータス</label>
              <div className="relative">
                <select name="status" value={site.status || ''} onChange={handleChange} className="w-full appearance-none bg-[#FAFBFC] border border-neutral-300 p-2.5 rounded-sm font-bold text-sm">
                  <option value="">未設定</option>
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">▼</div>
              </div>
            </div>
            <div className="md:col-span-6">
              <label className="block text-[10px] font-bold text-neutral-500 mb-1">現場名</label>
              <input type="text" name="name" value={site.name || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2.5 rounded-sm font-bold text-lg" />
            </div>
            <div className="md:col-span-12">
              <label className="block text-[10px] font-bold text-neutral-500 mb-1">住所</label>
              <input type="text" name="address" value={site.address || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2.5 rounded-sm text-sm" />
            </div>
          </div>
        </section>

        {/* 2. 詳細 */}
        <section className="bg-white border border-neutral-300 p-6 rounded-sm shadow-sm">
          <h2 className="text-sm font-bold text-[#0052CC] border-l-4 border-[#0052CC] pl-3 mb-6">2. 詳細</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">施主名</label><input type="text" name="client_name" value={site.client_name || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold" /></div>
            <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">担当者</label>
            <div className="relative"><select name="manager_name" value={site.manager_name || ''} onChange={handleChange} className="w-full appearance-none bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold"><option value="">未設定</option>{MANAGERS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select><div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">▼</div></div></div>
             <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">元請</label><input type="text" name="contractor_name" value={site.contractor_name || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold" /></div>
             <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">設計</label><input type="text" name="designer_name" value={site.designer_name || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold" /></div>
            <div className="md:col-span-2"><label className="block text-[10px] font-bold text-neutral-500 mb-1">メモ</label><textarea name="notes" value={site.notes || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm h-24" /></div>
          </div>
        </section>

        {/* 3. 公開ファイル */}
        <section className="bg-white border border-neutral-300 p-6 rounded-sm shadow-sm">
          <h2 className="text-sm font-bold text-[#0052CC] border-l-4 border-[#0052CC] pl-3 mb-6">3. 公開ファイル</h2>
          
          <div className="space-y-8">
            
            {/* ★ここを大幅変更: 複数図面 */}
            <div>
              <span className="text-sm font-bold text-neutral-800 block mb-2">図面データ (複数登録可)</span>
              
              {/* アップロードエリア */}
              <label className={`
                relative flex flex-col items-center justify-center w-full h-24
                border-2 border-dashed border-[#B3C6E6] rounded-sm bg-[#F4F7FC]
                hover:bg-[#EBF1FA] hover:border-[#0052CC] transition cursor-pointer mb-4
                ${uploading === 'drawing' ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <div className="text-center">
                  <span className="text-sm text-[#0052CC] font-bold">＋ 図面を追加する</span>
                  <p className="text-[10px] text-neutral-400 mt-1">PDF / 画像 / Excel</p>
                </div>
                <input type="file" accept="image/*,.pdf,.xlsx,.xls" className="hidden" onChange={(e) => handleFileUpload(e, 'drawing')} disabled={uploading !== null} />
              </label>

              {/* 登録済みリスト */}
              <div className="space-y-2">
                {site.drawing_url.length === 0 && <div className="text-xs text-neutral-400 text-center py-2">まだ図面はありません</div>}
                
                {site.drawing_url.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 p-2 rounded-sm">
                    <div className="bg-neutral-200 text-neutral-500 w-8 h-8 flex items-center justify-center rounded-sm text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="text-[10px] text-neutral-400 truncate font-mono">{url.split('/').pop()}</div>
                       <a href={url} target="_blank" className="text-xs font-bold text-[#0052CC] hover:underline">内容を確認</a>
                    </div>
                    <button 
                      onClick={() => removeDrawing(index)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 工程表 (1つのみ) */}
            <div>
              <span className="text-sm font-bold text-neutral-800 block mb-2">工程表データ (1ファイルのみ)</span>
              <label className={`
                relative flex flex-col items-center justify-center w-full h-24
                border-2 border-dashed border-[#B3C6E6] rounded-sm bg-[#F4F7FC]
                hover:bg-[#EBF1FA] hover:border-[#0052CC] transition cursor-pointer group
              `}>
                <div className="text-center">
                   <p className="text-sm text-[#0052CC] font-bold">ファイルをアップロード / 入替</p>
                   <p className="text-[10px] text-neutral-400 mt-1">PDF / 画像 / Excel</p>
                </div>
                <input type="file" accept="image/*,.pdf,.xlsx,.xls" className="hidden" onChange={(e) => handleFileUpload(e, 'schedule')} disabled={uploading !== null} />
              </label>
              <div className="mt-2 flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold text-neutral-400 shrink-0">URL:</span>
                <input type="text" value={site.schedule_url || ''} readOnly className="flex-1 bg-transparent border-none p-0 text-[10px] text-neutral-500 focus:ring-0 truncate font-mono" placeholder="未登録" />
              </div>
            </div>

            {/* 写真 (公開) */}
            <div>
               <label className="block text-sm font-bold text-neutral-800 mb-2">現場写真フォルダ (公開)</label>
               <div className="flex gap-2">
                <input type="text" name="photos_url" value={site.photos_url || ''} onChange={handleChange} placeholder="https://..." className="flex-1 bg-[#F4F7FC] border border-neutral-300 p-3 rounded-sm text-sm focus:border-[#0052CC] focus:outline-none font-mono placeholder-neutral-400" />
                {site.photos_url && <a href={site.photos_url} target="_blank" className="bg-neutral-800 text-white px-4 py-2 rounded-sm text-xs font-bold hover:bg-black transition flex items-center justify-center shrink-0">確認</a>}
              </div>
            </div>
          </div>
        </section>

        {/* 4. 管理者用リンク (非公開) */}
        <section className="bg-neutral-200 border border-neutral-300 p-6 rounded-sm">
          <h2 className="text-sm font-bold text-neutral-700 border-l-4 border-neutral-600 pl-3 mb-6 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             4. 管理者用リンク (非公開)
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">見積書リンク</label>
              <div className="flex gap-2">
                <input type="text" name="quote_url" value={site.quote_url || ''} onChange={handleChange} placeholder="https://..." className="flex-1 bg-white border border-neutral-300 p-2.5 rounded-sm text-xs focus:border-neutral-500 focus:outline-none font-mono text-neutral-800 placeholder-neutral-400" />
                {site.quote_url && <a href={site.quote_url} target="_blank" className="bg-white border border-neutral-400 text-neutral-700 px-3 py-2 rounded-sm text-xs font-bold hover:bg-neutral-200 transition flex items-center justify-center shrink-0">開く</a>}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}