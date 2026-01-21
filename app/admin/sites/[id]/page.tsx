'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ScheduleUpload from './ScheduleUpload';

type Site = {
  id: string;
  name: string;
  address?: string;
  schedule_pdf_url?: string;
};

type Resource = {
  id: string;
  title: string;
  url: string;
  category: string;
};

export default function EditSitePage() {
  const params = useParams();
  const id = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const res = await fetch(`/api/admin/sites/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load site');
    const data = await res.json();
    setSite(data.site);
    setResources(data.resources ?? []);
  };

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        await reload();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!site) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">{site.name}</h1>

      {site.schedule_pdf_url && (
        <a
          href={site.schedule_pdf_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          📄 工程表PDFを見る
        </a>
      )}

      {/* アップロードUI（アップ後に最新状態を取り直す） */}
      <ScheduleUpload siteId={id} onUploaded={reload} />

      <div>
        <h2 className="font-semibold mt-6">Resources</h2>
        <ul className="list-disc pl-5">
          {resources.map((r) => (
            <li key={r.id}>
              <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {r.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}