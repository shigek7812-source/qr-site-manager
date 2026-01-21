'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSiteById, Site } from '@/lib/data/sites';
import { listPhotosBySiteId, createPhoto, deletePhoto, Photo } from '@/lib/data/photos';
import Link from 'next/link';

export default function SitePhotosPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [site, setSite] = useState<Site | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        image_url: '',
        taken_at: new Date().toISOString().slice(0, 16), // datetime-local format-ish
        phase: '',
        location: '',
        comment: ''
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [siteData, photosData] = await Promise.all([
                getSiteById(id),
                listPhotosBySiteId(id)
            ]);
            setSite(siteData);
            setPhotos(photosData);
        } catch (err) {
            console.error(err);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPhoto({
                site_id: id,
                image_url: form.image_url,
                taken_at: form.taken_at ? new Date(form.taken_at).toISOString() : undefined,
                phase: form.phase,
                location: form.location,
                comment: form.comment
            });
            setForm({
                image_url: '',
                taken_at: new Date().toISOString().slice(0, 16),
                phase: '',
                location: '',
                comment: ''
            });
            loadData();
        } catch (err) {
            console.error(err);
            alert('Failed to add photo');
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!confirm('Delete this photo?')) return;
        try {
            await deletePhoto(photoId);
            loadData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete photo');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!site) return <div>Site not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/admin/sites/${id}`} className="text-blue-600 hover:text-blue-800 mb-2 block">← Back to Site</Link>
                    <h1 className="text-2xl font-bold">Manage Photos: {site.name}</h1>
                </div>
            </div>

            {/* Add Photo Form */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Add Photo URL</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium">Image URL (External)</label>
                        <input
                            type="url" required
                            className="w-full border p-2 rounded"
                            placeholder="https://example.com/image.jpg"
                            value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Taken At</label>
                        <input
                            type="datetime-local"
                            className="w-full border p-2 rounded"
                            value={form.taken_at} onChange={e => setForm({ ...form, taken_at: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Phase</label>
                        <input
                            type="text" placeholder="e.g. Foundation, Framing"
                            className="w-full border p-2 rounded"
                            value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Location</label>
                        <input
                            type="text" placeholder="e.g. North Side"
                            className="w-full border p-2 rounded"
                            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Comment</label>
                        <input
                            type="text" placeholder="Optional comments"
                            className="w-full border p-2 rounded"
                            value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                        />
                    </div>
                    <div className="sm:col-span-2 text-right">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Photo</button>
                    </div>
                </form>
            </div>

            {/* List Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                    <div key={photo.id} className="bg-white rounded shadow p-2 space-y-2">
                        <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded overflow-hidden relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.image_url} alt="Site" className="object-cover w-full h-48" />
                        </div>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold text-gray-900">{new Date(photo.created_at).toLocaleDateString()}</p>
                            {photo.phase && <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 mr-2">{photo.phase}</span>}
                            {photo.location && <span className="text-gray-500 text-xs">{photo.location}</span>}
                            {photo.comment && <p className="text-gray-700 italic text-xs mt-1">{photo.comment}</p>}
                        </div>
                        <button
                            onClick={() => handleDelete(photo.id)}
                            className="w-full text-center text-red-600 hover:bg-red-50 py-1.5 rounded text-sm border border-red-200"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
