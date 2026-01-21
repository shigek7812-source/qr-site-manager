import { getSiteByCode } from '@/lib/data/sites';
import { listResourcesBySiteId } from '@/lib/data/resources';
import { listChangelogBySiteId } from '@/lib/data/changelog';
import { listPhotosBySiteId } from '@/lib/data/photos';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Disable caching for fresh data

export default async function PublicSitePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const site = await getSiteByCode(code);

    if (!site) {
        notFound();
    }

    const [resources, changelogs, photos] = await Promise.all([
        listResourcesBySiteId(site.id),
        listChangelogBySiteId(site.id),
        listPhotosBySiteId(site.id) // We'll just slice the latest 4-6
    ]);

    // Group Resources
    const schedules = resources.filter(r => r.category === 'schedule');
    const drawings = resources.filter(r => r.category === 'drawing');
    const docs = resources.filter(r => r.category === 'doc');

    const latestPhotos = photos.slice(0, 6);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-4 py-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
                {site.address && <p className="text-gray-500 text-sm mt-1">{site.address}</p>}

                {(site.manager_name || site.manager_phone) && (
                    <div className="mt-4 bg-blue-50 p-3 rounded-lg inline-block border border-blue-100">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Site Manager</p>
                        <p className="font-medium text-gray-900">{site.manager_name}</p>
                        {site.manager_phone && (
                            <a href={`tel:${site.manager_phone}`} className="text-blue-600 font-bold block mt-1 hover:underline">
                                📞 {site.manager_phone}
                            </a>
                        )}
                    </div>
                )}

                {site.notes && (
                    <div className="mt-4 text-sm text-gray-600 max-w-md mx-auto bg-yellow-50 p-3 rounded border border-yellow-100 italic">
                        {site.notes}
                    </div>
                )}
            </div>
{site.schedule_pdf_url && (
  <div className="mt-4 text-center">
    <a
      href={site.schedule_pdf_url}
      target="_blank"
      rel="noreferrer"
      className="inline-block px-5 py-2 rounded bg-blue-600 text-white text-sm font-medium"
    >
      📄 工程表PDFを見る
    </a>
  </div>
)}
            <div className="max-w-md mx-auto px-4 space-y-8 mt-6">

                {/* Resources Section - Schedule */}
                {schedules.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <span className="bg-green-100 text-green-800 p-1.5 rounded mr-2">📅</span>
                            Schedule
                        </h2>
                        <div className="space-y-3">
                            {schedules.map(res => (
                                <a
                                    key={res.id}
                                    href={res.url}
                                    target="_blank"
                                    className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 transition"
                                >
                                    <p className="font-bold text-gray-900">{res.title}</p>
                                    {res.version && <p className="text-xs text-gray-500 mt-1">Version: {res.version}</p>}
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Resources Section - Drawings */}
                {drawings.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <span className="bg-orange-100 text-orange-800 p-1.5 rounded mr-2">📐</span>
                            Drawings
                        </h2>
                        <div className="space-y-3">
                            {drawings.map(res => (
                                <a
                                    key={res.id}
                                    href={res.url}
                                    target="_blank"
                                    className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 transition"
                                >
                                    <p className="font-bold text-gray-900">{res.title}</p>
                                    {res.version && <p className="text-xs text-gray-500 mt-1">Ver: {res.version}</p>}
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Resources Section - Docs */}
                {docs.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <span className="bg-blue-100 text-blue-800 p-1.5 rounded mr-2">📄</span>
                            Documents
                        </h2>
                        <div className="space-y-3">
                            {docs.map(res => (
                                <a
                                    key={res.id}
                                    href={res.url}
                                    target="_blank"
                                    className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition"
                                >
                                    <p className="font-bold text-gray-900">{res.title}</p>
                                    {res.version && <p className="text-xs text-gray-500 mt-1">Ver: {res.version}</p>}
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Photos Preview */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="bg-purple-100 text-purple-800 p-1.5 rounded mr-2">📷</span>
                            Latest Photos
                        </h2>
                        <Link href={`/s/${code}/photos`} className="text-sm font-semibold text-purple-600 hover:text-purple-800">
                            View All →
                        </Link>
                    </div>

                    {latestPhotos.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No photos yet.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {latestPhotos.map(photo => (
                                <Link key={photo.id} href={`/s/${code}/photos`}>
                                    <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={photo.image_url} alt="Site" className="object-cover w-full h-full transform hover:scale-105 transition" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Changelog */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <span className="bg-gray-100 text-gray-800 p-1.5 rounded mr-2">📝</span>
                        Latest Updates
                    </h2>
                    {changelogs.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No updates yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {changelogs.map(log => (
                                <div key={log.id} className="relative pl-4 border-l-2 border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">{new Date(log.created_at).toLocaleDateString()}</p>
                                    <p className="text-gray-900 text-sm">{log.message}</p>
                                    {log.created_by && <p className="text-xs text-gray-400 mt-1">- {log.created_by}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
