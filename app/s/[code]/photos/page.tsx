'use client';
import PublicPhotosClient from "./PublicPhotosClient";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Site = { id: string; name?: string; code?: string };
type Photo = { id: string; image_url: string; phase?: string; location?: string; comment?: string; taken_at?: string };

export default function PublicPhotosPage() {
  const params = useParams();
  const code = params.code as string;

  const [site, setSite] = useState<Site | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!code) return;

    (async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`/api/public/sites/${encodeURIComponent(code)}/photos`);
        const data = await res.json().catch(() => null);

        if (!res.ok) throw new Error(data?.error || 'Failed to load');

        setSite(data.site);
        setPhotos(data.photos || []);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!site) return <div className="p-8 text-red-600">Site not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{site.name ?? site.code}</h1>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {photos.map((p) => (
          <a key={p.id} href={p.image_url} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt="" className="w-full rounded" />
          </a>
        ))}
      </div>
    </div>
  );
}