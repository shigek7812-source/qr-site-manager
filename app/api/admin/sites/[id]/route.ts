import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// --- 1. 現場情報の取得 (GET) ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ★ここが重要: Promise型にする
) {
  try {
    const { id } = await params; // ★ここでawaitする

    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- 2. 現場情報の更新 (PUT) ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ★ここもPromise型
) {
  try {
    const { id } = await params; // ★ここでawaitする
    const body = await request.json();

    // 更新処理
    const { error } = await supabaseAdmin
      .from('sites')
      .update(body)
      .eq('id', id);

    if (error) {
      console.error('Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}