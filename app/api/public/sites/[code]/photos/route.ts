import { NextRequest, NextResponse } from 'next/server';
import { getSiteByCode } from '@/lib/data/sites';
import { listPhotosBySiteId } from '@/lib/data/photos';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const site = await getSiteByCode(code);
    if (!site) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const photos = await listPhotosBySiteId(site.id);
    return NextResponse.json({ site, photos });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}