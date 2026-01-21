import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * 工程表PDFを Storage にアップロードして公開URLを返す
 * - バケット名: schedule-pdfs
 * - 保存先: <siteId>/schedule.pdf
 */
export async function uploadSchedulePdf(siteId: string, file: File) {
  const bucket = 'schedule-pdfs';
  const path = `${siteId}/schedule.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/pdf',
    });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error('公開URLの取得に失敗しました');

  return { publicUrl, path, bucket };
}