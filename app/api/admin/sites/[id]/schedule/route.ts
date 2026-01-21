import { NextRequest, NextResponse } from 'next/server';
import { uploadSchedulePdf } from '@/lib/storage';
import { updateSite } from '@/lib/data/sites';
import { archivePdf } from '@/lib/localArchive';

export const runtime = 'nodejs';
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'PDFがありません' }, { status: 400 });
    }

    // 1) Supabaseへアップロード（既存挙動）
    const { publicUrl } = await uploadSchedulePdf(id, file);

    // 2) DBにURL保存（既存挙動）
    await updateSite(id, { schedule_pdf_url: publicUrl });

    // 3) OneDriveへ latest + history 保存（追加）
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    await archivePdf({ siteId: id, kind: 'schedule', bytes: buf, filename: file.name });

    return NextResponse.json({ ok: true, url: publicUrl, saved: publicUrl });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'アップロード失敗' },
      { status: 500 }
    );
  }
}