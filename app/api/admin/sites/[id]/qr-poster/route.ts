import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';
import { getSiteById } from '@/lib/data/sites';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* =========================
       1. 現場データ取得
    ========================= */
    const { id } = params;
    const site = await getSiteById(id);
    if (!site) {
      return NextResponse.json({ error: 'site not found' }, { status: 404 });
    }

    const siteName = site.name;

    /* =========================
       2. QRリンク生成
    ========================= */
    const origin =
      process.env.PUBLIC_BASE_URL ??
      process.env.NEXT_PUBLIC_APP_BASE_URL ??
      req.nextUrl.origin;

    const targetUrl = `${origin}/s/${encodeURIComponent(site.code ?? id)}`;

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      margin: 1,
      scale: 6,
    });
    const pngBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    /* =========================
       3. PDF作成（A4）
    ========================= */
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    // 日本語フォント（※ここ重要）
    const fontPath = path.join(
      process.cwd(),
      'public/fonts/NotoSansJP-Regular.ttf'
    );
    const fontBytes = await fs.readFile(fontPath);
    const jpFont = await pdf.embedFont(fontBytes);

    const page = pdf.addPage([595.28, 841.89]); // A4 portrait
    const { width, height } = page.getSize();

    /* =========================
       4. QR配置
    ========================= */
    const qrSize = 220;
    const qrX = (width - qrSize) / 2;
    const qrY = height / 2 - qrSize / 2;

    const qrImg = await pdf.embedPng(pngBytes);
    page.drawImage(qrImg, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    /* =========================
       5. テキスト描画
    ========================= */

    // 現場名（上）
    page.drawText(siteName, {
      x: 48,
      y: height - 80,
      size: 24,
      font: jpFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // 説明文
    page.drawText('スマホで読み取って現場ページを開いてください', {
      x: 48,
      y: qrY + qrSize + 20,
      size: 12,
      font: jpFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // 右下：日付
    const today = new Date();
    const dateText = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const dateSize = 10;
    const dateWidth = jpFont.widthOfTextAtSize(dateText, dateSize);

    page.drawText(dateText, {
      x: width - 48 - dateWidth,
      y: 48,
      size: dateSize,
      font: jpFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // 右下：Produced by（←日付と右揃え）
    const producedText = 'Produced by Reglanz';
    const producedSize = 10;
    const producedWidth = jpFont.widthOfTextAtSize(
      producedText,
      producedSize
    );

    page.drawText(producedText, {
      x: width - 48 - producedWidth,
      y: 64,
      size: producedSize,
      font: jpFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    /* =========================
       6. レスポンス
    ========================= */
    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="qr-poster.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? 'failed' },
      { status: 500 }
    );
  }
}