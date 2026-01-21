import { NextRequest, NextResponse } from 'next/server';
import { getSiteById } from '@/lib/data/sites';
import { listResourcesBySiteId } from '@/lib/data/resources';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ★ここが重要（paramsはPromise）

    const site = await getSiteById(id);
    if (!site) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const resources = await listResourcesBySiteId(id);
    return NextResponse.json({ site, resources });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'failed' },
      { status: 500 }
    );
  }
}