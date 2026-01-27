import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Image from 'next/image';
import SiteBoard from './SiteBoard';

export const dynamic = 'force-dynamic';

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function ensureUrl(url: string | null | undefined) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

export default async function PublicSitePage({ params }: { params: Promise<{ code: string }> }) {
  // ★修正1：URLの文字化けや空白を直して読み取る
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).trim();

  let site = null;

  // ★修正2：探し方を強化（IDっぽければIDで探す、ダメならコードで探す）
  if (isUUID(code)) {
    // UUIDの形式なら、まずはIDとして探してみる
    const { data } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', code)
      .maybeSingle();
    site = data;
  }

  // IDで見つからなかった（またはUUIDじゃなかった）場合、codeカラムで探す
  if (!site) {
    const { data } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    site = data;
  }

  if (!site) return notFound();

  // 図面リスト
  let drawings: string[] = [];
  if (Array.isArray(site.drawing_url)) {
    drawings = site.drawing_url;
  } else if (typeof site.drawing_url === 'string' && site.drawing_url) {
    drawings = [site.drawing_url];
  }

  // 名前リスト
  let drawingNames: string[] = [];
  if (Array.isArray(site.drawing_names)) {
    drawingNames = site.drawing_names;
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-neutral-900 pb-20 font-sans">
      
      <header className="bg-neutral-900 text-white sticky top-0 z-10 px-5 py-4 flex items-center justify-between shadow-md">
        <div>
          {/* codeがない場合はIDを表示しないように調整 */}
          <div className="text-[10px] text-neutral-400 font-mono mb-0.5">
            No.{site.code || '---'}
          </div>
          <h1 className="text-lg font-bold leading-tight">{site.name}</h1>
        </div>
        <div className="shrink-0 ml-4">
           <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300">
             {site.status || '---'}
           </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-8">
        
        {/* 1. 現場掲示板 */}
        <section>
          <h2 className="text-sm font-bold text-neutral-500 mb-3 flex items-center gap-2">📢 現場連絡事項</h2>
          
          {site.notes && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
              <div className="text-xs font-bold text-yellow-600 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                【重要】現場からの連絡
              </div>
              <p className="text-sm font-bold text-neutral-800 whitespace-pre-wrap leading-relaxed">
                {site.notes}
              </p>
            </div>
          )}

          <SiteBoard siteId={site.id} initialMessages={site.board_data || []} />
        </section>

        {/* 2. 図面・工程表 */}
        <section className="grid gap-3">
          <h2 className="text-sm font-bold text-neutral-500 mb-1 flex items-center gap-2">📂 図面・工程表</h2>

          {/* 図面 */}
          {drawings.length > 0 ? (
            drawings.map((url, index) => {
              const label = drawingNames[index] || `図面データ (${index + 1})`;
              return (
                <a key={index} href={ensureUrl(url)} className="flex items-center p-4 bg-white border border-neutral-200 rounded-xl shadow-sm active:scale-95 transition">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg mr-4 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-800 truncate">{label}</div>
                    <div className="text-[10px] text-neutral-400 truncate">タップして確認</div>
                  </div>
                  <span className="text-neutral-300">→</span>
                </a>
              );
            })
          ) : (
            <div className="flex items-center p-4 bg-neutral-100 border border-transparent rounded-xl opacity-60">
              <div className="bg-neutral-200 text-neutral-400 p-3 rounded-lg mr-4">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="text-sm font-bold text-neutral-400">図面未登録</div>
            </div>
          )}

          {/* 工程表 */}
          {site.schedule_url ? (
            <a href={ensureUrl(site.schedule_url)} className="flex items-center p-4 bg-white border border-neutral-200 rounded-xl shadow-sm active:scale-95 transition">
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-neutral-800">工程表データ</div>
                <div className="text-[10px] text-neutral-400">タップして確認</div>
              </div>
              <span className="text-neutral-300">→</span>
            </a>
          ) : (
            <div className="flex items-center p-4 bg-neutral-100 border border-transparent rounded-xl opacity-60">
              <div className="bg-neutral-200 text-neutral-400 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="text-sm font-bold text-neutral-400">工程表未登録</div>
            </div>
          )}
        </section>

        {/* 3. 現場写真 */}
        <section>
          <h2 className="text-sm font-bold text-neutral-500 mb-2 flex items-center gap-2">📷 現場写真</h2>
          {site.photos_url ? (
            <a href={ensureUrl(site.photos_url)} className="block w-full py-4 bg-[#0078D4] text-white rounded-xl font-bold text-center shadow-md active:scale-95 transition flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.46 9.47a5.5 5.5 0 0 0-9.92-2.3 4 4 0 0 0-4.54 4.54A4.5 4.5 0 0 0 5.5 20h13a4.5 4.5 0 0 0 .96-8.97V9.47z"/></svg>
              OneDriveで写真を見る
            </a>
          ) : (
            <div className="w-full py-4 bg-neutral-200 text-neutral-400 rounded-xl font-bold text-center">
              写真フォルダ未設定
            </div>
          )}
        </section>

        {site.address && (
          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
             <div className="text-xs font-bold text-neutral-400 mb-2">ACCESS</div>
             <div className="text-lg text-neutral-800 font-bold mb-3">{site.address}</div>
             {/* ★修正3：マップのリンクが壊れていたので修正 */}
             <a 
               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="inline-block text-xs font-bold text-neutral-500 border-b border-neutral-400 pb-0.5 hover:text-black hover:border-black transition"
             >
               Google Mapで開く
             </a>
          </div>
        )}

      </main>
      
      <footer className="py-10 text-center opacity-30 grayscale pointer-events-none">
         <Image src="/brand/logo-black.png" alt="logo" width={60} height={20} className="mx-auto" />
      </footer>
    </div>
  );
}