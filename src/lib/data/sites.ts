import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface Site {
  id: string;
  code: string;
  name: string;
  address?: string;
  manager_name?: string;
  manager_phone?: string;
  notes?: string;
  schedule_pdf_url?: string | null; // ★追加
  updated_at: string;

}

export interface CreateSiteInput {
  code: string;
  name: string;
  address?: string;
  manager_name?: string;
  manager_phone?: string;
  notes?: string;
  schedule_pdf_url?: string; // ★追加
}

export interface UpdateSiteInput extends Partial<CreateSiteInput> {}

export async function listSites() {
  const { data, error } = await supabaseAdmin
    .from('sites')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Site[];
}

export async function getSiteByCode(code: string) {
  const { data, error } = await supabaseAdmin
    .from('sites')
    .select('*')
    .eq('code', code)
    .single();

  if (error) return null;
  return data as Site;
}

export async function getSiteById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createSite(input: CreateSiteInput) {
  const { data, error } = await supabaseAdmin
    .from('sites')
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data as Site;
}

export async function updateSite(id: string, input: UpdateSiteInput) {
  const { data, error } = await supabaseAdmin
    .from('sites')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Site;
}