import { supabase } from '@/lib/supabase';

export interface Resource {
    id: string;
    site_id: string;
    category: 'schedule' | 'drawing' | 'doc';
    title: string;
    url: string;
    version?: string;
    tags?: string;
    updated_at: string;
}

export interface CreateResourceInput {
    site_id: string;
    category: string;
    title: string;
    url: string;
    version?: string;
    tags?: string;
}

export interface UpdateResourceInput {
    category?: string;
    title?: string;
    url?: string;
    version?: string;
    tags?: string;
}

export async function listResourcesBySiteId(siteId: string) {
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('site_id', siteId)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Resource[];
}

export async function createResource(input: CreateResourceInput) {
    const { data, error } = await supabase
        .from('resources')
        .insert([input])
        .select()
        .single();

    if (error) throw error;
    return data as Resource;
}

export async function updateResource(id: string, input: UpdateResourceInput) {
    const { data, error } = await supabase
        .from('resources')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Resource;
}

export async function deleteResource(id: string) {
    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
