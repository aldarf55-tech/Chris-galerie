import { supabase } from '../supabaseClient';
import type { ActuData } from '../types';

export const actuService = {
  async getLatest(): Promise<ActuData | null> {
    const { data, error } = await supabase
      .from('actu')
      .select('*')
      .order('created_at', { ascending: false }) // Tri par date de création (car 'id' n'existe pas)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async save(text: string, currentUrls: Record<string, string>, newFiles: Record<string, File | null>): Promise<void> {
    const updatedUrls = { ...currentUrls };

    // 1. Upload des nouvelles images vers le bucket de stockage Supabase
    for (let i = 1; i <= 4; i++) {
      const fieldKey = `actuimage${i}`;
      const currentFile = newFiles[fieldKey];

      if (currentFile) {
        const fileExt = currentFile.name.split('.').pop();
        const fileName = `actu-${i}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, currentFile);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(fileName);

        updatedUrls[fieldKey] = publicURLData.publicUrl;
      }
    }

    // 2. Préparation des données pour la mise à jour
    const payload = {
      key: 'actu_intro', // ✅ La clé primaire requise par la table actu
      value: text,
      actuimage1: updatedUrls.actuimage1 || '',
      actuimage2: updatedUrls.actuimage2 || '',
      actuimage3: updatedUrls.actuimage3 || '',
      actuimage4: updatedUrls.actuimage4 || '',
      updated_at: new Date().toISOString(),
    };

    // 3. Mise à jour (ou création) dans la base de données
    const { error } = await supabase
      .from('actu')
      .upsert(payload, { onConflict: 'key' });

    if (error) throw error;
  }
};