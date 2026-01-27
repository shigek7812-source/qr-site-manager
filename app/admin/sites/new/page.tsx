"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ★ここを担当者リストに変更しました
const MANAGERS = [
  { label: '片島', value: 'katashima' },
  { label: '高沢', value: 'takazawa' },
  { label: '渡辺', value: 'watanabe' },
  { label: '坊内', value: 'bouuchi' },
  { label: '重本', value: 'shigemoto' },
  { label: '国近', value: 'kunichika' },
];

export default function NewSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // フォームの初期値
  const [formData, setFormData] = useState({
    name: '',
    code: '', // 自動連番が入ります
    status: '見積中',
    manager_name: '',
    address: '',
    client_name: '',
    contractor_name: '',
    notes: '',
  });

  // 自動連番ロジック（さっき追加したもの）
  useEffect(() => {
    const fetchNextCode = async () => {
      try {
        const res = await fetch('/api/admin/sites');
        if (res.ok) {
          const json = await res.json();
          const sites = Array.isArray(json) ? json : json.sites;
          
          let maxNum = 0;
          sites.forEach((site: any) => {
            const n = parseInt(site.code, 10);
            if (!isNaN(n) && n > maxNum) maxNum = n;
          });

          const nextCode = String(maxNum + 1).padStart(3, '0');
          setFormData(prev => ({ ...prev, code: nextCode }));
        }
      } catch (e) {
        console.error("連番の取得に失敗しました", e);
      }
    };

    fetchNextCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return alert('現場名とコードは必須です');

    try {
      setLoading(true);
      const res = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin'); // 作成したら一覧に戻る
        router.refresh();
      } else {
        alert('作成に失敗しました');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-neutral-900 font-sans p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-6">新規現場の登録</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm space-y-6">
          
          {/* 現場コード */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1">現場番号 (Code)</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full bg-neutral-100 border border-neutral-300 p-3 rounded font-bold text-lg"
              placeholder="例: 001"
              required
            />
            <p className="text-[10px] text-neutral-400 mt-1">※自動で連番が入りますが書き換え可能です</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1">現場名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-neutral-300 p-3 rounded font-bold"
              placeholder="例: 大阪市中央区 ○○邸"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">状況</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-neutral-300 p-3 rounded"
              >
                <option value="見積中">見積中</option>
                <option value="プランニング中">プランニング中</option>
                <option value="見積提出済">見積提出済</option>
                <option value="着工準備中">着工準備中</option>
                <option value="工事中">工事中</option>
                <option value="手直し">手直し</option>
                <option value="追加工事">追加工事</option>
                <option value="完了">完了</option>
                <option value="保留">保留</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">担当者</label>
              <select
                value={formData.manager_name}
                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                className="w-full border border-neutral-300 p-3 rounded"
              >
                <option value="">未設定</option>
                {/* ★ここを自動生成に変更 */}
                {MANAGERS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* その他の入力項目 */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div>
               <label className="block text-xs font-bold text-neutral-500 mb-1">住所</label>
               <input
                 type="text"
                 value={formData.address}
                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                 className="w-full border border-neutral-300 p-2 rounded text-sm"
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">施主名</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full border border-neutral-300 p-2 rounded text-sm"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">元請名</label>
                  <input
                    type="text"
                    value={formData.contractor_name}
                    onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                    className="w-full border border-neutral-300 p-2 rounded text-sm"
                  />
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-neutral-500 mb-1">メモ</label>
               <textarea
                 value={formData.notes}
                 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                 className="w-full border border-neutral-300 p-2 rounded text-sm h-20"
               />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
             <button
               type="button"
               onClick={() => router.back()}
               className="flex-1 bg-neutral-200 text-neutral-700 font-bold py-3 rounded hover:bg-neutral-300 transition"
             >
               キャンセル
             </button>
             <button
               type="submit"
               disabled={loading}
               className="flex-[2] bg-black text-white font-bold py-3 rounded hover:bg-neutral-800 transition"
             >
               {loading ? '登録中...' : '登録する'}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}