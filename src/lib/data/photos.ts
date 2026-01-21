import { supabase } from '@/lib/supabase';

export interface Photo {
    id: string;
    site_id: string;
    image_url: string;
    taken_at?: string;
    phase?: string;
    location?: string;
    comment?: string;
    created_at: string;
}

export interface CreatePhotoInput {
    site_id: string;
    image_url: string;
    taken_at?: string; // ISO string
    phase?: string;
    location?: string;
    comment?: string;
}

export interface PhotoFilters {
    phase?: string;
    location?: string;
    date?: string; // YYYY-MM-DD
}

export async function listPhotosBySiteId(siteId: string, filters?: PhotoFilters) {
    let query = supabase
        .from('photos')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

    if (filters?.phase) {
        query = query.eq('phase', filters.phase);
    }
    if (filters?.location) {
        query = query.eq('location', filters.location);
    }
    if (filters?.date) {
        // Basic date filtering assuming taken_at is set.
        // This looks for taken_at >= date AND taken_at < date+1 day
        const startDate = new Date(filters.date).toISOString();
        const endDate = new Date(new Date(filters.date).getTime() + 86400000).toISOString();
        query = query.gte('taken_at', startDate).lt('taken_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Photo[];
}

export async function createPhoto(input: CreatePhotoInput) {
    const { data, error } = await supabase
        .from('photos')
        .insert([input])
        .select()
        .single();

    if (error) throw error;
    return data as Photo;
}

export async function deletePhoto(id: string) {
    const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
