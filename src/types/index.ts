export interface Artwork {
  id: number | string;
  title: string;
  thematique: string;
  technique: string;
  format: string;
  originalPrice: number;
  copyPrice: number;
  category?: string;
  image_url: string;
  is_original_available: boolean;
  is_print_available: boolean;
}

export interface ActuData {
  value: string;
  actuimage1: string;
  actuimage2: string;
  actuimage3: string;
  actuimage4: string;
}

export interface AproposData {
  value: string;
  image_url: string;
}