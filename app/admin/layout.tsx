// app/admin/layout.tsx
import type { ReactNode } from 'react';
import AdminLayoutClient from './AdminLayoutClient';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}