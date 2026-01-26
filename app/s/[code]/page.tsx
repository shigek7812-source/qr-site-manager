import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

// --- Types ---
type BoardMessage = {
  id: string;
  content: string;
  date: string;
  author: string;
};

type PublicSiteData = {
  id: string;
  name: string;
  code: string;
  status: string | null;
  address: string | null;
  drawing_url: string | null;
  schedule_url: string | null;
  board_data: BoardMessage[] | null;
  updated_at: string | null;
};

// UUIDかどうかを判定する便利関数
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // ★最強の検索ロジック
  // 1. まず「管理番号(code)」として探す
  let { data: site } = await supabaseAdmin
    .from('sites')
    .select('id, name, code, status, address, drawing_url, schedule_url, board_data, updated_at')
    .eq('code', code) // code列を探す
    .maybeSingle();   // エラーを出さずに「見つからなかったらnull」にする

  // 2. もし見つからなくて、かつURLが「IDっぽい(長い英数字)」なら、IDとしても探してみる
  if (!site && isUUID(code)) {
    const { data: siteById } = await supabaseAdmin
      .from('sites')
      .select('id, name, code, status, address, drawing_url, schedule_url, board_data, updated_at')
      .eq('id', code)
      .maybeSingle();
    
    site = siteById;
  }

  // それでも無ければ404
  if (!site) {
    return notFound();
  }

  const s = site as PublicSiteData;
  const messages = s.board_data || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* ヘッダー: 現場名 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-5 py-4 flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 border border-slate-200">
              No.{s.code}
            </span>
            <span className={`w-2 h-2 rounded-full ${s.status === '完了' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
          </div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">{s.name}</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 py-6 space-y-6">
        
        {/* 1. 掲示板 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-indigo-100 text-indigo-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
            <h2 className="text-sm font-bold text-slate-700">現場連絡事項</h2>
          </div>
          
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-xs text-slate-400 bg-white/50 p-6 rounded border border-dashed border-slate-300 text-center">
                お知らせはありません
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow-sm">
                  <div className="flex justify-between items-baseline mb-2 border-b border-slate-100 pb-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{msg.author}</span>
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. 資料リンク */}
        <section className="grid gap-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-emerald-100 text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
            </span>
            <h2 className="text-sm font-bold text-slate-700">図面・工程表</h2>
          </div>

          {/* 図面ボタン */}
          {s.drawing_url ? (
            <a href={s.drawing_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded hover:border-emerald-500 transition shadow-sm group">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded text-emerald-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <div className="font-bold text-slate-800">図面を開く</div>
                  <div className="text-[10px] text-slate-400">PDF / Drive</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-emerald-500">→</span>
            </a>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded flex items-center gap-3 opacity-60">
              <div className="bg-slate-200 p-2 rounded text-slate-400">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <span className="text-sm text-slate-400 font-medium">図面未登録</span>
            </div>
          )}

          {/* 工程表ボタン */}
          {s.schedule_url ? (
            <a href={s.schedule_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded hover:border-sky-500 transition shadow-sm group">
              <div className="flex items-center gap-3">
                <div className="bg-sky-50 p-2 rounded text-sky-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <div className="font-bold text-slate-800">工程表を開く</div>
                  <div className="text-[10px] text-slate-400">Schedule</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-sky-500">→</span>
            </a>
          ) : (
             <div className="p-4 bg-slate-50 border border-slate-100 rounded flex items-center gap-3 opacity-60">
              <div className="bg-slate-200 p-2 rounded text-slate-400">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-sm text-slate-400 font-medium">工程表未登録</span>
            </div>
          )}
          
          {/* 写真機能 */}
          <a href={`/s/${code}/photos`} className="mt-2 block w-full py-4 rounded bg-slate-800 text-white font-bold text-center text-sm shadow hover:bg-slate-700 transition">
            📸 現場写真をアップ・閲覧
          </a>
        </section>

        {/* 住所 */}
        {s.address && (
          <div className="mt-6 pt-6 border-t border-slate-200">
             <div className="text-xs font-bold text-slate-400 mb-1">ACCESS</div>
             <div className="text-sm text-slate-700 font-medium">{s.address}</div>
             <a 
               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-block mt-2 text-xs text-indigo-600 underline"
             >
               Google Mapで開く
             </a>
          </div>
        )}

      </main>
      
      <footer className="py-10 text-center opacity-30 grayscale">
         <Image src="/brand/logo-black.png" alt="logo" width={60} height={20} className="mx-auto" />
      </footer>
    </div>
  );
}