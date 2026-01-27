import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// 書き込み (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId, content, author } = body;

    const { data: site } = await supabaseAdmin
      .from('sites')
      .select('board_data')
      .eq('id', siteId)
      .single();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const newMessage = {
      id: crypto.randomUUID(),
      content,
      author,
      date: new Date().toISOString(),
    };

    const currentMessages = Array.isArray(site.board_data) ? site.board_data : [];
    // 新しい順（上に新しいのが来る）
    const updatedMessages = [newMessage, ...currentMessages];

    const { error } = await supabaseAdmin
      .from('sites')
      .update({ board_data: updatedMessages })
      .eq('id', siteId);

    if (error) throw error;

    return NextResponse.json({ data: updatedMessages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// 削除 (DELETE)
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { siteId, messageId } = body;

    console.log("削除リクエスト受信:", messageId); // ログ確認用

    // 1. 現在のデータを取得
    const { data: site } = await supabaseAdmin
      .from('sites')
      .select('board_data')
      .eq('id', siteId)
      .single();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const currentMessages = Array.isArray(site.board_data) ? site.board_data : [];
    
    // 2. フィルタリング（削除対象以外を残す）
    const updatedMessages = currentMessages.filter((msg: any) => msg.id !== messageId);

    // 3. 更新して保存
    const { error } = await supabaseAdmin
      .from('sites')
      .update({ board_data: updatedMessages })
      .eq('id', siteId);

    if (error) throw error;

    return NextResponse.json({ data: updatedMessages });
  } catch (error) {
    console.error("削除エラー:", error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}