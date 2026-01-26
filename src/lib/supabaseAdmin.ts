// app/api/admin/sites/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server'; // ★ここを追加

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ルートハンドラ内でクライアントを作成するか、libなど別ファイルからインポート推奨ですが、
// ここで定義する場合は export せず、このファイル内だけで使う形が無難です。
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export async function PATCH(
  req: Request,
  // Next.js 15以降の場合は params が Promise になるため、型定義に注意が必要ですが、
  // 一旦一般的な Next.js 13/14 の書き方で修正します。
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    // 更新対象のフィールドを定義
    const patch = {
      status: body.status ?? null,
      name: body.name ?? null,
      manager_name: body.manager_name ?? null,
      address: body.address ?? null,
      client_name: body.client_name ?? null,
      contractor_name: body.contractor_name ?? null,
      designer_name: body.designer_name ?? null,
      notes: body.notes ?? null,
      // updated_at を自動更新する場合はここで現在時刻を入れるのも手です
      // updated_at: new Date().toISOString(), 
    };

    const { data, error } = await supabaseAdmin
      .from('sites')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error:', error); // デバッグ用にログ出力
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ site: data }, { status: 200 });
  } catch (e: any) {
    console.error('Server Error:', e);
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 });
  }
}