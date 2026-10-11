import { supabase } from '../supabaseClient';

export interface ArtworkLikeState {
  count: number;
  liked: boolean;
}

interface ArtworkLikeRow {
  artwork_id: string;
  like_count: number;
  liked: boolean;
}

const VISITOR_ID_KEY = 'christographik-visitor-id';

export const artworkLikesService = {
  getVisitorId(): string {
    const savedId = localStorage.getItem(VISITOR_ID_KEY);
    if (savedId) return savedId;

    const visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    return visitorId;
  },

  async getForArtworks(artworkIds: Array<number | string>, visitorId: string): Promise<Map<string, ArtworkLikeState>> {
    if (artworkIds.length === 0) return new Map();

    const { data, error } = await supabase.rpc('get_artwork_like_counts', {
      p_artwork_ids: [...new Set(artworkIds.map(String))],
      p_visitor_id: visitorId,
    });

    if (error) throw error;
    if (!data) throw new Error('La réponse des mentions J’aime est vide.');

    const rows: ArtworkLikeRow[] = data;
    return new Map(rows.map(row => [
      row.artwork_id,
      { count: Number(row.like_count), liked: row.liked },
    ]));
  },

  async toggle(artworkId: number | string, visitorId: string): Promise<ArtworkLikeState> {
    const { data, error } = await supabase.rpc('toggle_artwork_like', {
      p_artwork_id: String(artworkId),
      p_visitor_id: visitorId,
    });

    if (error) throw error;
    if (!data?.[0]) throw new Error('La réponse au clic sur le cœur est vide.');

    return {
      count: Number(data[0].like_count),
      liked: data[0].liked,
    };
  },
};
