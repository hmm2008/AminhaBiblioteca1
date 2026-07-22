import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalBook } from './types';
import { getAllBooks, saveBook, deleteBook as dbDeleteBook } from './lib/db';
import { syncBooks } from './lib/syncService';

const DEFAULT_THEMES = [
  'Autoajuda', 'Ciência Política', 'Cooking (Natural foods)', 'Culinária', 
  'Desenvolvimento pessoal', 'Economia/Gestão', 'Enfermagem', 'Escolar', 
  'Farmácia', 'Filosofia', 'Gestão', 'Health & Fitness', 'História', 
  'Literatura', 'Medicina', 'Outros', 'Religião', 'Rich people', 
  'Saúde e Nutrição', 'Tecnologia'
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
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    const savedThemes = localStorage.getItem('library_themes');
    if (savedThemes) {
      setThemes(JSON.parse(savedThemes));
    } else {
      setThemes(DEFAULT_THEMES);
      localStorage.setItem('library_themes', JSON.stringify(DEFAULT_THEMES));
    }
  }, []);

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
    } catch (e) {
      console.error('Failed to load books from DB', e);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

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
