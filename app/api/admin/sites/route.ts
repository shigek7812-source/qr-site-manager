import { NextRequest, NextResponse } from 'next/server';
import { createSite } from '@/lib/data/sites';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const site = await createSite(body);
    return NextResponse.json({ ok: true, site });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'failed' },
      { status: 500 }
    );
  }
}