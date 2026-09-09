import { supabase } from '../supabaseClient';
import type { AproposData } from '../types';

export const aproposService = {
  async get(): Promise<AproposData | null> {
    const { data, error } = await supabase
      .from('apropos')
      .select('value, image_url')
      .eq('key', 'apropos_intro')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async save(introText: string, imageUrl: string, newFile: File | null): Promise<string> {
    let finalImageUrl = imageUrl;

    if (newFile) {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `apropos-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, newFile);

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(fileName);

      finalImageUrl = publicURLData.publicUrl;
    }

    const { error } = await supabase
      .from('apropos')
      .upsert({
        key: 'apropos_intro',
        value: introText,
        image_url: finalImageUrl,
      });

    if (error) throw error;
    return finalImageUrl;
  },

  async removeImage(introText: string): Promise<void> {
    const { error } = await supabase
      .from('apropos')
      .upsert({
        key: 'apropos_intro',
        value: introText,
        image_url: '',
      });

    if (error) throw error;
  }
};