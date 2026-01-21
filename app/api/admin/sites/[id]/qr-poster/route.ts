import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import { getSiteById } from '@/lib/data/sites';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const rightMargin = 48;
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const site = await getSiteById(id);
    if (!site) {
      throw new Error('site not found');
    }

    const siteName = site.name;

    // QRリンク先
    const origin = process.env.PUBLIC_BASE_URL ?? req.nextUrl.origin;
    const targetUrl = `${origin}/s/${encodeURIComponent(site.code ?? id)}`;

    // QRコード生成
    const qrDataUrl = await QRCode.toDataURL(targetUrl, { margin: 0, scale: 8 });
    const pngBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // PDF作成
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    const page = pdf.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // 日本語フォント読み込み
    const fontPath = path.join(
      process.cwd(),
      'public/fonts/NotoSansJP-Regular.ttf'
    );
    const fontBytes = await fs.readFile(fontPath);
    const font = await pdf.embedFont(fontBytes);

    // QR配置
    const qrSize = 220;
    const qrX = (width - qrSize) / 2;
    const qrY = (height - qrSize) / 2 - 40;

    const qrImg = await pdf.embedPng(pngBytes);
    page.drawImage(qrImg, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // 現場名
    page.drawText(siteName, {
      x: 48,
      y: height - 90,
      size: 26,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    // 説明文
    page.drawText('現場情報', {
      x: 48,
      y: qrY + qrSize + 24,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Produced by
    const produced = 'Produced by Reglanz';
const producedSize = 12;
const producedWidth = font.widthOfTextAtSize(produced, producedSize);

page.drawText(produced, {
  x: width - rightMargin - producedWidth, // ←ここがポイント
  y: 78, // 日付より少し上
  size: producedSize,
  font,
  color: rgb(0.35, 0.35, 0.35),
});

    // 日付
const dt = new Date();
const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

const dateSize = 10;
const dateWidth = font.widthOfTextAtSize(stamp, dateSize);

const rightX = width - rightMargin - dateWidth;

page.drawText(stamp, {
  x: rightX,
  y: 60,
  size: dateSize,
  font,
  color: rgb(0.35, 0.35, 0.35),
});

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="qr-poster.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'failed' },
      { status: 500 }
    );
  }
}