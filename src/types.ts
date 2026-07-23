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

export type SyncStatus = 'pending' | 'synced' | 'deleted' | 'deleted_synced';

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
  trash: string;
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

export const isDefaultNavLabel = (id: string, label?: string): boolean => {
  if (!label) return true;
  const trimmed = label.trim().toLowerCase();
  const defaults: Record<string, string[]> = {
    dashboard: ['início', 'inicio', 'home', 'accueil', 'dashboard', 'tableau de bord'],
    add: ['adicionar livro', 'cria novo registo', 'add book', 'create new record', 'ajouter un livre', 'créer un nouvel enregistrement'],
    library: ['a minha biblioteca', 'biblioteca', 'my library', 'library', 'ma bibliothèque', 'bibliothèque'],
    themes: ['temas', 'themes', 'thèmes'],
    borrowed: ['emprestados', 'borrowed books', 'livres empruntés', 'borrowed', 'empruntés'],
    reports: ['relatórios', 'relatorios', 'reports', 'rapports'],
    trash: ['reciclagem', 'lixeira', 'trash', 'corbeille'],
    settings: ['configurações/backup', 'configuracoes/backup', 'configurações', 'configuracoes', 'settings', 'paramètres', 'parametres'],
  };
  return defaults[id]?.includes(trimmed) ?? false;
};

export const DEFAULT_SETTINGS: AppSettings = {
  libraryName: 'Biblioteca Pessoal de Manuel Francisco',
  welcomeMessage: 'Bem-vindo à Biblioteca Pessoal de Manuel Francisco',
  subTitle: 'A tua Biblioteca Pessoal na nuvem',
  navLabels: {
    dashboard: '',
    library: '',
    add: '',
    themes: '',
    borrowed: '',
    reports: '',
    settings: '',
    trash: '',
  },
  colorTheme: 'blue',
  fontFamily: 'inter',
};
