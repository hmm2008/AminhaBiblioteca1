import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalBook } from './types';
import { getAllBooks, saveBook, deleteBook as dbDeleteBook } from './lib/db';
import { syncBooks } from './lib/syncService';

interface BookContextType {
  books: LocalBook[];
  addOrUpdateBook: (book: LocalBook) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  sync: () => Promise<void>;
  isSyncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

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
