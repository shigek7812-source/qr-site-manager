'use client';

import { useEffect, useState } from 'react';

type Site = {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  notes?: string | null;
};

type Photo = {
  id: string;
  site_id: string;
  url: string;
  phase?: string | null;
  location?: string | null;
  created_at?: string | null;
};

export default function PublicPhotosClient({ code }: { code: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`/api/public/sites/${code}/photos`, {
          cache: 'no-store',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load');

        if (!cancelled) {
          setSite(data.site);
          setPhotos(data.photos || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!site) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{site.name}</h1>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {photos.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noreferrer">
            <img src={p.url} alt="" className="w-full rounded border" />
          </a>
        ))}
      </div>
    </div>
  );
}