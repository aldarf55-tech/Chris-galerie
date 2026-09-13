import { supabase } from '../supabaseClient';
import type { ActuData } from '../types';

const BUCKET_NAME = 'gallery-images';

export const actuService = {
  /**
   * Récupère l'actualité unique (key: 'actu_intro')
   */
  async getLatest(): Promise<ActuData | null> {
    const { data, error } = await supabase
      .from('actu')
      .select('*')
      .eq('key', 'actu_intro')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Enregistre ou remplace l'actualité et ses images
   */
  async save(
    text: string,
    currentUrls: Record<string, string>,
    newFiles: Record<string, File | null>
  ): Promise<void> {
    const updatedUrls = { ...currentUrls };

    // 1. Traitement des 4 emplacements d'images
    for (let i = 1; i <= 4; i++) {
      const fieldKey = `actuimage${i}`;
      const currentFile = newFiles[fieldKey];

      if (currentFile) {
        // Nom fixe par emplacement pour écraser l'ancienne image
        const fileExt = currentFile.name.split('.').pop() || 'jpg';
        const fileName = `actu-slot-${i}.${fileExt}`;

        // Upload avec l'option upsert: true pour remplacer le fichier sur Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, currentFile, {
            upsert: true,
            contentType: currentFile.type,
          });

        if (uploadError) throw uploadError;

        // Récupération de l'URL publique
        const { data: publicURLData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        // Ajout d'un paramètre de timestamp (?t=...) pour forcer le navigateur à recharger l'image mise à jour
        updatedUrls[fieldKey] = `${publicURLData.publicUrl}?t=${Date.now()}`;
      }
    }

    // 2. Clé fixe 'actu_intro' pour remplacer systématiquement l'ancienne entrée SQL
    const payload = {
      key: 'actu_intro',
      value: text,
      actuimage1: updatedUrls.actuimage1 || '',
      actuimage2: updatedUrls.actuimage2 || '',
      actuimage3: updatedUrls.actuimage3 || '',
      actuimage4: updatedUrls.actuimage4 || '',
      updated_at: new Date().toISOString(),
    };

    // 3. Mise à jour (écrasement) de la ligne en base de données
    const { error: dbError } = await supabase
      .from('actu')
      .upsert(payload, { onConflict: 'key' });

    if (dbError) throw dbError;
  },
};