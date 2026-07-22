export type ReadStatus = 'Lido' | 'A ler' | 'Não Lido';
export type BookStatus = 'Disponível' | 'Emprestado' | 'Extraviado';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  readStatus: ReadStatus;
  status?: BookStatus;
  rating: number; // 1 to 5
  notes: string;
  dateAdded: string; // ISO String
  coverImage?: string; // Base64 or URL
  publisher?: string;
  publishedDate?: string;
  pageCount?: string | number;
  language?: string;
  description?: string;
  shelfLocation?: string;
}

export type SyncStatus = 'pending' | 'synced' | 'deleted';

export interface LocalBook extends Book {
  syncStatus: SyncStatus;
}

export interface NavLabels {
  dashboard: string;
  library: string;
  add: string;
  themes: string;
  borrowed: string;
  reports: string;
  settings: string;
  [key: string]: string;
}

export interface AppSettings {
  libraryName: string;
  subTitle: string;
  welcomeMessage: string;
  navLabels: NavLabels;
  colorTheme: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal';
  fontFamily: 'inter' | 'georgia' | 'mono' | 'nunito';
}

export interface BackupRecord {
  id: string;
  date: string;
  type: 'Automático' | 'Manual';
  bookCount: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  libraryName: 'Biblioteca Pessoal de Manuel Francisco',
  subTitle: 'A tua biblioteca pessoal em casa.',
  welcomeMessage: 'Bem-vindo à Biblioteca Pessoal de Manuel Francisco 👋',
  navLabels: {
    dashboard: 'Início',
    library: 'Biblioteca',
    add: 'Adicionar Livro',
    themes: 'Temas',
    borrowed: 'Emprestados',
    reports: 'Relatórios',
    settings: 'Configurações',
  },
  colorTheme: 'blue',
  fontFamily: 'inter',
};
