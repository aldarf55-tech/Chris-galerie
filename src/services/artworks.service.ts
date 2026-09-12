import { supabase } from '../supabaseClient';
import type { Artwork } from '../types';

export const artworksService = {
  async getAll(): Promise<Artwork[]> {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(artworkData: Omit<Artwork, 'id' | 'image_url'>, file: File): Promise<void> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicURLData } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase.from('artworks').insert([
      {
        ...artworkData,
        image_url: publicURLData.publicUrl,
      },
    ]);

    if (dbError) throw dbError;
  },

  async update(artwork: Artwork): Promise<void> {
    const { error } = await supabase
      .from('artworks')
      .update({
        title: artwork.title,
        thematique: artwork.thematique,
        technique: artwork.technique,
        format: artwork.format,
        originalPrice: artwork.originalPrice,
        copyPrice: artwork.copyPrice,
        is_original_available: artwork.is_original_available,
        is_print_available: artwork.is_print_available,
      })
      .eq('id', artwork.id);

    if (error) throw error;
  },

  async delete(id: number | string, imageUrl: string): Promise<void> {
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('gallery-images').remove([fileName]);
    }

    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (error) throw error;
  }
};