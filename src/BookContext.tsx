import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalBook, AppSettings, DEFAULT_SETTINGS, BackupRecord } from './types';
import { getAllBooks, saveBook, deleteBook as dbDeleteBook, getDeletedBooks, hardDeleteBook } from './lib/db';
import { syncBooks } from './lib/syncService';

const DEFAULT_THEMES = [
  'Autoajuda', 'Ciência Política', 'Cooking (Natural foods)', 'Culinária', 
  'Desenvolvimento pessoal', 'Economia/Gestão', 'Enfermagem', 'Escolar', 
  'Farmácia', 'Filosofia', 'Gestão', 'Health & Fitness', 'História', 
  'Literatura', 'Medicina', 'Outros', 'Religião', 'Rich people', 
  'Saúde e Nutrição', 'Tecnologia'
];

const INITIAL_BACKUPS: BackupRecord[] = [
  { id: '1', date: '18/07/2026, 10:42', type: 'Automático', bookCount: 8 },
  { id: '2', date: '16/07/2026, 10:20', type: 'Manual', bookCount: 8 },
  { id: '3', date: '15/07/2026, 10:20', type: 'Automático', bookCount: 8 },
];

interface BookContextType {
  books: LocalBook[];
  addOrUpdateBook: (book: LocalBook) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  sync: () => Promise<void>;
  isSyncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
  themes: string[];
  addTheme: (theme: string) => void;
  removeTheme: (theme: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  resetSettings: () => void;
  backupHistory: BackupRecord[];
  addBackupRecord: (type: 'Automático' | 'Manual') => void;
  exportBackup: () => void;
  importBackup: (jsonString: string) => Promise<boolean>;
  trashedBooks: LocalBook[];
  hardRemoveBook: (id: string) => Promise<void>;
  restoreBook: (book: LocalBook) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [trashedBooks, setTrashedBooks] = useState<LocalBook[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [themes, setThemes] = useState<string[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('library_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>(() => {
    const saved = localStorage.getItem('library_backup_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BACKUPS;
      }
    }
    return INITIAL_BACKUPS;
  });

  useEffect(() => {
    const savedThemes = localStorage.getItem('library_themes');
    if (savedThemes) {
      setThemes(JSON.parse(savedThemes));
    } else {
      setThemes(DEFAULT_THEMES);
      localStorage.setItem('library_themes', JSON.stringify(DEFAULT_THEMES));
    }
  }, []);

  useEffect(() => {
    // Apply font family dynamically
    const fontMap: Record<string, string> = {
      inter: "'Inter', sans-serif",
      georgia: "'Georgia', 'Cambria', serif",
      mono: "'Courier New', Courier, monospace",
      nunito: "'Nunito', 'Segoe UI', sans-serif",
    };
    document.body.style.fontFamily = fontMap[settings.fontFamily] || fontMap.inter;

    // Apply color theme dynamically via CSS variable
    const colorMap: Record<string, { primary: string; hover: string }> = {
      blue: { primary: '#1a5eb8', hover: '#154a93' },
      green: { primary: '#059669', hover: '#047857' },
      purple: { primary: '#7c3aed', hover: '#6d28d9' },
      red: { primary: '#dc2626', hover: '#b91c1c' },
      orange: { primary: '#ea580c', hover: '#c2410c' },
      teal: { primary: '#0891b2', hover: '#0e7490' },
    };
    const themeColors = colorMap[settings.colorTheme] || colorMap.blue;
    document.documentElement.style.setProperty('--color-primary', themeColors.primary);
    document.documentElement.style.setProperty('--color-primary-hover', themeColors.hover);
  }, [settings]);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('library_settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('library_settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  const addBackupRecord = (type: 'Automático' | 'Manual') => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newRecord: BackupRecord = {
      id: Date.now().toString(),
      date: formattedDate,
      type,
      bookCount: books.length,
    };
    const updated = [newRecord, ...backupHistory];
    setBackupHistory(updated);
    localStorage.setItem('library_backup_history', JSON.stringify(updated));
  };

  const exportBackup = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      books,
      themes,
      settings,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `biblioteca_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addBackupRecord('Manual');
  };

  const importBackup = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.books)) {
        for (const book of data.books) {
          await saveBook(book);
        }
        if (Array.isArray(data.themes)) {
          setThemes(data.themes);
          localStorage.setItem('library_themes', JSON.stringify(data.themes));
        }
        if (data.settings) {
          updateSettings(data.settings);
        }
        await loadBooks();
        addBackupRecord('Manual');
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error importing backup", e);
      return false;
    }
  };

  const addTheme = (theme: string) => {
    if (!themes.includes(theme)) {
      const newThemes = [...themes, theme].sort((a, b) => a.localeCompare(b));
      setThemes(newThemes);
      localStorage.setItem('library_themes', JSON.stringify(newThemes));
    }
  };

  const removeTheme = (theme: string) => {
    const newThemes = themes.filter(t => t !== theme);
    setThemes(newThemes);
    localStorage.setItem('library_themes', JSON.stringify(newThemes));
  };

  const loadBooks = useCallback(async () => {
    try {
      const allBooks = await getAllBooks();
      // Sort by date added desc
      allBooks.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      setBooks(allBooks);

      const deletedBooks = await getDeletedBooks();
      deletedBooks.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      setTrashedBooks(deletedBooks);
    } catch (e) {
      console.error('Failed to load books from DB', e);
    }
  }, []);

  useEffect(() => {
    loadBooks();
    // Trigger an initial sync on load if online
    if (navigator.onLine) {
      sync();
    }
  }, []);

  // Attempt sync on network recovery
  useEffect(() => {
    const handleOnline = () => {
      sync();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const addOrUpdateBook = async (book: LocalBook) => {
    await saveBook({ ...book, syncStatus: 'pending' });
    await loadBooks();
    // Optimistic sync if online
    if (navigator.onLine) {
      sync();
    }
  };

  const removeBook = async (id: string) => {
    await dbDeleteBook(id);
    await loadBooks();
    if (navigator.onLine) {
      sync();
    }
  };

  const hardRemoveBook = async (id: string) => {
    await hardDeleteBook(id);
    await loadBooks();
    if (navigator.onLine) {
      sync();
    }
  };

  const restoreBook = async (book: LocalBook) => {
    await saveBook({ ...book, syncStatus: 'pending' });
    await loadBooks();
    if (navigator.onLine) {
      sync();
    }
  };

  const sync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      await syncBooks();
      setLastSync(new Date());
      await loadBooks();
    } catch (e: any) {
      setSyncError(e.message || 'Error syncing data');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <BookContext.Provider
      value={{
        books,
        addOrUpdateBook,
        removeBook,
        sync,
        isSyncing,
        lastSync,
        syncError,
        themes,
        addTheme,
        removeTheme,
        settings,
        updateSettings,
        resetSettings,
        backupHistory,
        addBackupRecord,
        exportBackup,
        importBackup,
        trashedBooks,
        hardRemoveBook,
        restoreBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

