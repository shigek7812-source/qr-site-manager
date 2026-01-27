'use client';

import { useEffect, useState, use } from 'react';
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
  drawing_url: string[];
  drawing_names: string[];
  schedule_url: string;
  photos_url: string;
  board_data: any[];
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
  const { id } = use(params);
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'drawing' | 'schedule' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // ★修正ポイント：URLを本来の /api/admin/sites/ID に戻しました
        const res = await fetch(`/api/admin/sites/${id}`, { cache: 'no-store' });
        if (!res.ok) {
           setLoading(false);
           return;
        }
        const json = await res.json();
        
        // サーバーから返ってくる { site: { ... } } を正しく取り出す
        const siteData = json.site || json.data || json;
        
        if (siteData && siteData.id) {
          if (!Array.isArray(siteData.drawing_url)) siteData.drawing_url = siteData.drawing_url ? [siteData.drawing_url] : [];
          if (!Array.isArray(siteData.drawing_names)) siteData.drawing_names = [];
          setSite(siteData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!site) return;
    setSite({ ...site, [e.target.name]: e.target.value });
  };

  const handleDrawingNameChange = (index: number, newName: string) => {
    if (!site) return;
    const newNames = [...site.drawing_names];
    while (newNames.length <= index) newNames.push('');
    newNames[index] = newName;
    setSite({ ...site, drawing_names: newNames });
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
      drawing_url: site.drawing_url,
      drawing_names: site.drawing_names,
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

  // ★修正ポイント：削除も本来の住所（URL）に送るように戻しました
  const handleDelete = async () => {
    if (!window.confirm('本当にこの現場を削除しますか？\n（この操作は取り消せません）')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sites/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const err = await res.json();
        alert(`削除に失敗しました: ${err.error || 'サーバーエラー'}`);
      }
    } catch (e) {
      alert('通信エラーが発生しました');
    }
  };

  // 共通アップロード処理
  const uploadFileCore = async (file: File, field: 'drawing' | 'schedule') => {
    if (!site || !site.id) return;
    
    const fileExt = file.name.split('.').pop();
    const fileNameBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const randomString = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
    const fileName = `${site.id.slice(0, 8)}_${field}_${randomString}.${fileExt}`;

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
        setSite(prev => {
          if (!prev) return null;
          const currentNames = [...(prev.drawing_names || [])];
          while (currentNames.length < prev.drawing_url.length) {
            currentNames.push(''); 
          }
          return { 
            ...prev, 
            drawing_url: [...prev.drawing_url, publicUrl],
            drawing_names: [...currentNames, fileNameBase]
          };
        });
      } else {
        setSite(prev => prev ? ({ ...prev, schedule_url: publicUrl }) : null);
      }

    } catch (error: any) {
      alert(`アップロード失敗: ${error.message}`);
    } finally {
      setUploading(null);
      setIsDragging(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'drawing' | 'schedule') => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFileCore(e.target.files[0], field);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, field: 'drawing' | 'schedule') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFileCore(e.dataTransfer.files[0], field);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeDrawing = (indexToRemove: number) => {
    if (!site) return;
    setSite({
      ...site,
      drawing_url: site.drawing_url.filter((_, index) => index !== indexToRemove),
      drawing_names: (site.drawing_names || []).filter((_, index) => index !== indexToRemove)
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
            <div className="text-xs font-bold text-neutral-500 mb-0.5">現場情報編集</div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {site.name || '(現場名未設定)'}
            </h1>
            <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">ID: {site.id ? site.id.slice(0, 8) : '---'}...</div>
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

        {/* 2. 詳細・連絡事項 */}
        <section className="bg-white border border-neutral-300 p-6 rounded-sm shadow-sm">
          <h2 className="text-sm font-bold text-[#0052CC] border-l-4 border-[#0052CC] pl-3 mb-6">2. 詳細・連絡事項</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">施主名</label><input type="text" name="client_name" value={site.client_name || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold" /></div>
            <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">担当者</label>
            <div className="relative"><select name="manager_name" value={site.manager_name || ''} onChange={handleChange} className="w-full appearance-none bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold"><option value="">未設定</option>{MANAGERS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select><div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">▼</div></div></div>
             <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">元請</label><input type="text" name="contractor_name" value={site.contractor_name || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold" /></div>
             <div><label className="block text-[10px] font-bold text-neutral-500 mb-1">設計</label><input type="text" name="designer_name" value={site.designer_name || ''} onChange={handleChange} className="w-full bg-[#FAFBFC] border border-neutral-300 p-2 rounded-sm text-sm font-bold" /></div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-red-600 mb-1">★ 現場連絡事項 (上部に固定表示)</label>
              <textarea 
                name="notes" 
                value={site.notes || ''} 
                onChange={handleChange} 
                className="w-full bg-yellow-50 border-2 border-yellow-200 p-3 rounded-sm text-sm h-32 text-neutral-800 font-bold" 
                placeholder="ここに書いた内容は、公開ページの掲示板の一番上に固定表示されます。"
              />
            </div>
          </div>
        </section>

        {/* 3. 公開ファイル */}
        <section className="bg-white border border-neutral-300 p-6 rounded-sm shadow-sm">
          <h2 className="text-sm font-bold text-[#0052CC] border-l-4 border-[#0052CC] pl-3 mb-6">3. 公開ファイル</h2>
          
          <div className="space-y-8">
            {/* 図面 */}
            <div>
              <span className="text-sm font-bold text-neutral-800 block mb-2">図面データ (名前を編集できます)</span>
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'drawing')}
                className={`
                  relative flex flex-col items-center justify-center w-full h-32
                  border-2 border-dashed rounded-sm bg-[#F4F7FC]
                  transition cursor-pointer mb-4
                  ${uploading === 'drawing' ? 'opacity-50 pointer-events-none' : ''}
                  ${isDragging ? 'border-[#0052CC] bg-blue-50 scale-[1.01]' : 'border-[#B3C6E6] hover:bg-[#EBF1FA] hover:border-[#0052CC]'}
                `}
              >
                <div className="text-center pointer-events-none">
                  <span className="text-sm text-[#0052CC] font-bold">＋ 図面を追加</span>
                  <p className="text-[10px] text-neutral-400 mt-1">ドラッグ＆ドロップ または クリック</p>
                </div>
                <input type="file" accept="image/*,.pdf,.xlsx,.xls" className="hidden" onChange={(e) => handleFileInput(e, 'drawing')} disabled={uploading !== null} />
              </label>

              <div className="space-y-3">
                {site.drawing_url.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white border border-neutral-200 p-3 rounded-sm shadow-sm">
                    <div className="bg-neutral-800 text-white w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold shrink-0">{index + 1}</div>
                    <div className="flex-1">
                       <label className="text-[10px] font-bold text-neutral-400 block mb-1">表示名</label>
                       <input 
                         type="text" 
                         value={site.drawing_names?.[index] || ''} 
                         onChange={(e) => handleDrawingNameChange(index, e.target.value)}
                         placeholder={`図面データ ${index + 1}`}
                         className="w-full border border-neutral-300 rounded-sm px-2 py-1 text-sm font-bold focus:border-[#0052CC] focus:outline-none"
                       />
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <a href={url} target="_blank" className="text-xs font-bold text-[#0052CC] border border-[#0052CC] px-2 py-1 rounded-sm hover:bg-blue-50">確認</a>
                      <button onClick={() => removeDrawing(index)} className="text-xs font-bold text-red-600 border border-red-200 px-2 py-1 rounded-sm hover:bg-red-50">削除</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 工程表 */}
            <div>
              <span className="text-sm font-bold text-neutral-800 block mb-2">工程表データ (1ファイル)</span>
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'schedule')}
                className={`
                  relative flex flex-col items-center justify-center w-full h-24
                  border-2 border-dashed rounded-sm bg-[#F4F7FC]
                  transition cursor-pointer
                  ${uploading === 'schedule' ? 'opacity-50 pointer-events-none' : ''}
                  ${isDragging ? 'border-[#0052CC] bg-blue-50' : 'border-[#B3C6E6] hover:bg-[#EBF1FA] hover:border-[#0052CC]'}
                `}
              >
                <div className="text-center pointer-events-none">
                  <p className="text-sm text-[#0052CC] font-bold">アップロード / 入替</p>
                  <p className="text-[10px] text-neutral-400 mt-1">PDF / 画像 / Excel</p>
                </div>
                <input type="file" accept="image/*,.pdf,.xlsx,.xls" className="hidden" onChange={(e) => handleFileInput(e, 'schedule')} disabled={uploading !== null} />
              </label>
              <div className="mt-2 text-[10px] text-neutral-400 truncate">{site.schedule_url || '未登録'}</div>
            </div>
            
            {/* 写真 */}
            <div>
               <label className="block text-sm font-bold text-neutral-800 mb-2">現場写真フォルダ (公開)</label>
               <div className="flex gap-2">
                <input type="text" name="photos_url" value={site.photos_url || ''} onChange={handleChange} placeholder="https://..." className="flex-1 bg-[#F4F7FC] border border-neutral-300 p-3 rounded-sm text-sm" />
                {site.photos_url && <a href={site.photos_url} target="_blank" className="bg-neutral-800 text-white px-4 py-2 rounded-sm text-xs font-bold hover:bg-black flex items-center">確認</a>}
              </div>
            </div>
          </div>
        </section>

        {/* 削除ボタン */}
        <div className="mt-12 pt-8 border-t border-neutral-300 text-center">
           <button
             type="button"
             onClick={handleDelete}
             className="text-sm text-red-500 font-bold hover:text-red-700 underline"
           >
             この現場を削除する
           </button>
        </div>

      </div>
    </div>
  );
}