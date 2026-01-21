'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Allow login page to render without check
        if (pathname === '/admin/login') {
            setAuthorized(true);
            return;
        }

        const isAdmin = localStorage.getItem('admin_ok') === '1';
        if (!isAdmin) {
            router.push('/admin/login');
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_ok');
        router.push('/admin/login');
    };

    if (!authorized) return null; // Or a loading spinner

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/admin" className="text-xl font-bold text-gray-900">
                            Site Manager Admin
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/admin" className="text-gray-600 hover:text-gray-900">Sites</Link>
                        <button
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
        </div>
    );
}
