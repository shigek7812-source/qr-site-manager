// app/api/admin/sites/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// ★追加: 編集画面を開いたときに既存データを取得する処理
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ★修正: データの更新処理（新しい項目を追加）
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 更新する項目（図面・工程表・見積りを追加）
    const patch = {
      name: body.name ?? null,
      code: body.code ?? null,
      status: body.status ?? null,
      manager_name: body.manager_name ?? null,
      
      address: body.address ?? null,
      client_name: body.client_name ?? null,
      contractor_name: body.contractor_name ?? null,
      designer_name: body.designer_name ?? null,
      notes: body.notes ?? null,

      // ★追加したリンク項目
      drawing_url: body.drawing_url ?? null,  // 図面
      schedule_url: body.schedule_url ?? null,// 工程表
      quote_url: body.quote_url ?? null,      // 見積り

      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('sites')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 });
  }
}