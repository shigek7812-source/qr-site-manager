import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// --- 一覧取得 (GET) ---
export async function GET() {
  try {
    // 更新順に並べて取得
    const { data: sites, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 新規登録 (POST) ---
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. コードの自動生成ロジック
    // 送られてきたコードがあればそれを使う。なければ自動採番。
    let newCode = body.code;

    if (!newCode) {
      // 一番大きい番号(code)を持っている現場を探す
      // (数字以外のcodeが混ざっていると正確ではないですが、簡易的に「降順の1件目」を見ます)
      const { data: maxSite } = await supabaseAdmin
        .from('sites')
        .select('code')
        .order('code', { ascending: false })
        .limit(1)
        .single();

      let nextNum = 1;
      
      // もし既存のデータがあれば、その番号 + 1
      if (maxSite && maxSite.code) {
        // "005" -> 5 に変換
        const currentMax = parseInt(maxSite.code, 10);
        if (!isNaN(currentMax)) {
          nextNum = currentMax + 1;
        }
      }
      
      // 3桁の0埋めにする (例: 1 -> "001")
      newCode = String(nextNum).padStart(3, '0');
    }

    // 2. データベースに登録するデータ
    const insertData = {
      name: body.name,
      code: newCode, // ここで決めたコード
      status: body.status || '見積中', // デフォルトは見積中
      
      address: body.address || null,
      client_name: body.client_name || null,
      contractor_name: body.contractor_name || null,
      designer_name: body.designer_name || null,
      manager_name: body.manager_name || null,
      notes: body.notes || null,

      // 新しく追加したURL系
      drawing_url: body.drawing_url || null,
      schedule_url: body.schedule_url || null,
      quote_url: body.quote_url || null,
      
      // 掲示板データ（新規なので空っぽ）
      board_data: [],
      
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('sites')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}