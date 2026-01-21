'use client';

import { createSite } from '@/lib/data/sites';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewSitePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        address: '',
        manager_name: '',
        manager_phone: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createSite(formData);
            router.push('/admin');
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create site');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Site</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
                {error && <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Site Code (URL Slug)</label>
                        <input
                            type="text"
                            name="code"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="e.g. site-a"
                            value={formData.code}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Site Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Construction Site A"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        name="address"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Manager Name</label>
                        <input
                            type="text"
                            name="manager_name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.manager_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Manager Phone</label>
                        <input
                            type="text"
                            name="manager_phone"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.manager_phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes (Internal)</label>
                    <textarea
                        name="notes"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={formData.notes}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Site'}
                    </button>
                </div>
            </form>
        </div>
    );
}
