export type ReadStatus = 'Lido' | 'A ler' | 'Não Lido';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  readStatus: ReadStatus;
  rating: number; // 1 to 5
  notes: string;
  dateAdded: string; // ISO String
  coverImage?: string; // Base64 or URL
  publisher?: string;
  publishedDate?: string;
  pageCount?: string | number;
  language?: string;
  description?: string;
}

export type SyncStatus = 'pending' | 'synced' | 'deleted';

export interface LocalBook extends Book {
  syncStatus: SyncStatus;
}
