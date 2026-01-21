'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSiteByCode, Site } from '@/lib/data/sites';
import { listPhotosBySiteId, Photo } from '@/lib/data/photos';
import Link from 'next/link';

export default function PublicPhotosPage() {
    const params = useParams();
    const code = params.code as string;
    const router = useRouter();

    const [site, setSite] = useState<Site | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [phaseFilter, setPhaseFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const siteData = await getSiteByCode(code);
                if (!siteData) {
                    // Handle not found
                    return;
                }
                setSite(siteData);
                // Initially load all, client-side filter for smoother UX on small datasets
                const allPhotos = await listPhotosBySiteId(siteData.id);
                setPhotos(allPhotos);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [code]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading photos...</div>;
    if (!site) return <div className="p-8 text-center text-red-500">Site not found</div>;

    // Extract unique filter options
    const existingPhases = Array.from(new Set(photos.map(p => p.phase).filter(Boolean))) as string[];
    const existingLocations = Array.from(new Set(photos.map(p => p.location).filter(Boolean))) as string[];

    // Apply filters
    const filteredPhotos = photos.filter(p => {
        if (phaseFilter && p.phase !== phaseFilter) return false;
        if (locationFilter && p.location !== locationFilter) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                <Link href={`/s/${code}`} className="text-sm font-medium text-gray-300 hover:text-white flex items-center">
                    ← Back
                </Link>
                <div className="text-center">
                    <h1 className="font-bold text-lg">{site.name}</h1>
                    <p className="text-xs text-gray-400">Photo Gallery ({filteredPhotos.length})</p>
                </div>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Filters */}
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex gap-2 overflow-x-auto whitespace-nowrap">
                <select
                    className="bg-gray-700 text-sm rounded px-3 py-1.5 border-none text-white focus:ring-1 focus:ring-purple-500"
                    value={phaseFilter}
                    onChange={e => setPhaseFilter(e.target.value)}
                >
                    <option value="">All Phases</option>
                    {existingPhases.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select
                    className="bg-gray-700 text-sm rounded px-3 py-1.5 border-none text-white focus:ring-1 focus:ring-purple-500"
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                >
                    <option value="">All Locations</option>
                    {existingLocations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>

            {/* Grid */}
            <div className="p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredPhotos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-w-1 aspect-h-1 bg-gray-800 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photo.image_url}
                            alt={photo.comment || 'Site Photo'}
                            className="object-cover w-full h-full cursor-pointer transition transform hover:scale-105"
                            // Simple "lightbox" could be added here, for now relying on browser zoom or just viewing the grid
                            onClick={() => window.open(photo.image_url, '_blank')}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white font-medium truncate">{new Date(photo.created_at).toLocaleDateString()}</p>
                            {photo.comment && <p className="text-[10px] text-gray-300 truncate">{photo.comment}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPhotos.length === 0 && (
                <div className="p-10 text-center text-gray-500">
                    No photos found matching filters.
                </div>
            )}
        </div>
    );
}
