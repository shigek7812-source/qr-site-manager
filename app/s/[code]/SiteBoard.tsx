'use client';

import { useState } from 'react';

type Message = {
  id: string;
  content: string;
  date: string;
  author: string;
};

export default function SiteBoard({ siteId, initialMessages }: { siteId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [author, setAuthor] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          content: input,
          author: author || '職人さん',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setMessages(json.data);
        setInput('');
      }
    } catch (err) {
      alert('書き込みに失敗しました');
    } finally {
      setSending(false);
    }
  };

  // 削除処理
  const handleDelete = async (e: React.MouseEvent, messageId: string) => {
    // ボタンクリックが親要素に伝わらないようにする（誤作動防止）
    e.stopPropagation();
    e.preventDefault();

    if (!confirm('本当に削除しますか？')) return;
    
    setDeletingId(messageId);
    try {
      const res = await fetch('/api/board', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, messageId }),
      });

      if (res.ok) {
        const json = await res.json();
        setMessages(json.data);
      } else {
        alert('削除できませんでした。通信環境を確認してください。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="bg-white p-3 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="お名前"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-1/3 text-xs p-2 border border-neutral-300 rounded bg-neutral-50 focus:outline-none focus:border-black"
          />
          <div className="flex-1 text-[10px] text-neutral-400 flex items-center justify-end">
            ※連絡事項はこちらへ
          </div>
        </div>
        <div className="flex gap-2">
          <textarea
            placeholder="メッセージを入力..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-sm p-3 border border-neutral-300 rounded h-12 bg-neutral-50 focus:bg-white focus:border-black focus:outline-none resize-none"
          />
          <button
            disabled={sending || !input.trim()}
            className={`w-16 rounded font-bold text-xs text-white transition flex items-center justify-center
              ${sending || !input.trim() ? 'bg-neutral-300' : 'bg-neutral-900 hover:bg-black'}
            `}
          >
            {sending ? '...' : '送信'}
          </button>
        </div>
      </form>

      {/* ★ここ変更: スクロールエリア (高さ固定) */}
      <div className="bg-neutral-100 p-3 rounded-xl h-80 overflow-y-auto border border-neutral-200 shadow-inner space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-400 text-xs flex-col gap-2">
            <span>📭</span>
            <span>まだ書き込みはありません</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm relative group">
              
              {/* 削除ボタン (赤くして右上に配置) */}
              <button
                type="button"
                onClick={(e) => handleDelete(e, msg.id)}
                disabled={deletingId === msg.id}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-red-500 rounded-md transition z-10 cursor-pointer"
                title="削除する"
              >
                {deletingId === msg.id ? (
                  <span className="animate-spin text-neutral-400">c</span>
                ) : (
                  <span className="text-lg font-bold leading-none">×</span>
                )}
              </button>

              <div className="flex justify-between items-baseline mb-1 pr-8">
                <span className="font-bold text-sm text-neutral-800">{msg.author}</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(msg.date).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}