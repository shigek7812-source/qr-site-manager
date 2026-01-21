import fs from 'fs/promises';
import path from 'path';

function tsName(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function moveIfExists(from: string, to: string) {
  try {
    await fs.rename(from, to);
  } catch (e: any) {
    if (e?.code !== 'ENOENT') throw e;
  }
}

export async function archivePdf(params: {
  siteId: string;
  kind: 'schedule' | 'drawings';
  bytes: Buffer;
  filename?: string; // 参考用（今は使わない）
}) {
  const root = process.env.LOCAL_ARCHIVE_ROOT;
  if (!root) return; // 環境変数がなければローカル保存はスキップ

  const baseDir = path.join(root, params.siteId, params.kind);
  const historyDir = path.join(baseDir, 'history');
  await ensureDir(historyDir);

  const latestPath = path.join(baseDir, 'latest.pdf');
  const histPath = path.join(historyDir, `${tsName()}.pdf`);

  // 既存latestがあれば履歴へ退避
  await moveIfExists(latestPath, histPath);

  // 新しいPDFをlatestとして保存
  await ensureDir(baseDir);
  await fs.writeFile(latestPath, params.bytes);

  return { latestPath, histPath };
}