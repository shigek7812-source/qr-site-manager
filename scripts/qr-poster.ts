import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import fontkit from '@pdf-lib/fontkit';
import { createClient } from '@supabase/supabase-js';

// ========= 設定 =========
const OUTPUT = path.resolve(process.cwd(), 'qr-poster.pdf');
const FONT_PATH = path.resolve(process.cwd(), 'public/fonts/NotoSansJP-Regular.ttf');
const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// ========================

async function main() {
  const siteId = process.argv[2];
  if (!siteId) {
    console.error('❌ siteId を指定してください');
    process.exit(1);
  }

  // 現場取得
  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (error || !site) {
    throw new Error('現場が見つかりません');
  }

  const url = `${BASE_URL}/s/${site.code}`;

  // QR生成
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 0, scale: 8 });
  const qrBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  // PDF
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontBytes = fs.readFileSync(FONT_PATH);
  const font = await pdf.embedFont(fontBytes);

  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // QR
  const qrSize = 260;
  page.drawImage(await pdf.embedPng(qrBytes), {
    x: (width - qrSize) / 2,
    y: (height - qrSize) / 2 - 20,
    width: qrSize,
    height: qrSize,
  });

  // 現場名
  page.drawText(site.name, {
    x: 48,
    y: height - 80,
    size: 26,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 右下署名
  const produced = 'Produced by Reglanz';
  const date = new Date().toISOString().slice(0, 10);
  const right = width - 48;

  page.drawText(produced, {
    x: right - font.widthOfTextAtSize(produced, 12),
    y: 78,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(date, {
    x: right - font.widthOfTextAtSize(date, 10),
    y: 60,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // 保存
  fs.writeFileSync(OUTPUT, await pdf.save());
  console.log(`✅ 生成完了: ${OUTPUT}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
