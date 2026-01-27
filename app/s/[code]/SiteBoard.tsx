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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="お名前 (任意)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-1/3 text-xs p-2 border border-neutral-300 rounded bg-neutral-50"
          />
          <div className="flex-1 text-[10px] text-neutral-400 flex items-center justify-end">
            ※誰でも閲覧可能です
          </div>
        </div>
        <textarea
          placeholder="連絡事項を入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full text-sm p-3 border border-neutral-300 rounded h-20 bg-neutral-50 focus:bg-white focus:border-neutral-500 focus:outline-none mb-2"
        />
        <button
          disabled={sending || !input.trim()}
          className={`w-full py-3 rounded font-bold text-sm text-white transition
            ${sending || !input.trim() ? 'bg-neutral-300' : 'bg-neutral-900 hover:bg-black'}
          `}
        >
          {sending ? '送信中...' : '掲示板に書き込む'}
        </button>
      </form>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">まだ書き込みはありません</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-sm text-neutral-800">{msg.author}</span>
                <span className="text-[10px] text-neutral-400">
                  {new Date(msg.date).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}