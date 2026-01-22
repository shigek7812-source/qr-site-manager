import { NextRequest, NextResponse } from 'next/server';
import { getSiteById, updateSite } from '@/lib/data/sites';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const site = await getSiteById(id);
    if (!site) return NextResponse.json({ error: 'site not found' }, { status: 404 });

    return NextResponse.json({ site });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json().catch(() => ({}));

    // 受け取る項目はホワイトリスト方式（余計な更新を防ぐ）
    const patch: Record<string, any> = {};

    if (typeof body.status === 'string') patch.status = body.status;
    if (typeof body.manager_name === 'string') patch.manager_name = body.manager_name;

    if (typeof body.address === 'string') patch.address = body.address;

    // 表示順：施主 → 元請 → 設計
    if (typeof body.client_name === 'string') patch.client_name = body.client_name;
    if (typeof body.contractor_name === 'string') patch.contractor_name = body.contractor_name;
    if (typeof body.designer_name === 'string') patch.designer_name = body.designer_name;

    // 何も来てない時
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'no fields' }, { status: 400 });
    }

    const updated = await updateSite(id, patch);
    return NextResponse.json({ ok: true, site: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 });
  }
}