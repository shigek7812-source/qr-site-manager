import { supabase } from '@/lib/supabase';

export interface Changelog {
    id: string;
    site_id: string;
    message: string;
    created_at: string;
    created_by?: string;
}

export interface CreateChangelogInput {
    site_id: string;
    message: string;
    created_by?: string;
}

export async function listChangelogBySiteId(siteId: string) {
    const { data, error } = await supabase
        .from('changelog')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(50); // Reasonable limit

    if (error) throw error;
    return data as Changelog[];
}

export async function createChangelog(input: CreateChangelogInput) {
    const { data, error } = await supabase
        .from('changelog')
        .insert([input])
        .select()
        .single();

    if (error) throw error;
    return data as Changelog;
}
