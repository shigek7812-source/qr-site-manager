# QR Site Manager

A Next.js + Supabase application for managing site information, resources, and photos, accessible via QR codes (URLs).

## Setup Instructions

### 1. Environment Variables

Ensure `.env.local` exists in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASS=1234
```

### 2. Database Setup

Run the contents of `schema.sql` in your Supabase project's SQL Editor. This will:
- Create `sites`, `resources`, `changelog`, `photos` tables.
- Enable RLS (Prototype mode: allows all operations).
- Create necessary indexes.

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## URL Routes

- **Public Site**: `/s/[code]` (e.g., `/s/demo`)
  - Mobile-optimized view of resources and updates.
- **Public Photos**: `/s/[code]/photos`
  - Gallery view with filters.
- **Admin Login**: `/admin/login`
- **Admin Dashboard**: `/admin`
  - Manage sites, resources, and photos.

## Demo Walkthrough

1. Go to `/admin/login` and enter the passcode `1234`.
2. Click "Create New Site".
   - Code: `demo`
   - Name: `Demo Site`
   - Address: `123 Main St`
3. In the Site list, click "Demo Site" to edit.
4. Add a Resource (e.g., Schedule).
5. Add a Changelog entry.
6. Click "Manage Photos" and add some photo URLs.
7. Visit `/s/demo` to see the public view.
