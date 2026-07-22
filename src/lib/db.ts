import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { LocalBook } from '../types';

interface BookCatalogDB extends DBSchema {
  books: {
    key: string;
    value: LocalBook;
    indexes: {
      'by-syncStatus': string;
    };
  };
}

const DB_NAME = 'book-catalog-db';
const DB_VERSION = 2;

export async function initDB(): Promise<IDBPDatabase<BookCatalogDB>> {
  return openDB<BookCatalogDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      let store;
      if (!db.objectStoreNames.contains('books')) {
        store = db.createObjectStore('books', { keyPath: 'id' });
      } else {
        store = transaction.objectStore('books');
      }
      if (!store.indexNames.contains('by-syncStatus')) {
        store.createIndex('by-syncStatus', 'syncStatus');
      }
    },
  });
}

export async function getAllBooks(): Promise<LocalBook[]> {
  const db = await initDB();
  const tx = db.transaction('books', 'readonly');
  const store = tx.objectStore('books');
  const books = await store.getAll();
  return books.filter(book => book.syncStatus !== 'deleted' && book.syncStatus !== 'deleted_synced');
}

export async function getPendingBooks(): Promise<LocalBook[]> {
  try {
    const db = await initDB();
    const tx = db.transaction('books', 'readonly');
    const store = tx.objectStore('books');
    const index = store.index('by-syncStatus');
    return await index.getAll('pending');
  } catch (e) {
    console.warn("Index by-syncStatus failed, falling back to manual filtering:", e);
    const db = await initDB();
    const tx = db.transaction('books', 'readonly');
    const store = tx.objectStore('books');
    const books = await store.getAll();
    return books.filter(book => book.syncStatus === 'pending');
  }
}

export async function getDeletedBooks(): Promise<LocalBook[]> {
  try {
    const db = await initDB();
    const tx = db.transaction('books', 'readonly');
    const store = tx.objectStore('books');
    const index = store.index('by-syncStatus');
    const del1 = await index.getAll('deleted');
    const del2 = await index.getAll('deleted_synced');
    return [...del1, ...del2];
  } catch (e) {
    console.warn("Index by-syncStatus failed, falling back to manual filtering:", e);
    const db = await initDB();
    const tx = db.transaction('books', 'readonly');
    const store = tx.objectStore('books');
    const books = await store.getAll();
    return books.filter(book => book.syncStatus === 'deleted' || book.syncStatus === 'deleted_synced');
  }
}

export async function saveBook(book: LocalBook): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('books', 'readwrite');
  const store = tx.objectStore('books');
  await store.put(book);
  await tx.done;
}

export async function deleteBook(id: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('books', 'readwrite');
  const store = tx.objectStore('books');
  const book = await store.get(id);
  if (book) {
    book.syncStatus = 'deleted';
    await store.put(book);
  }
  await tx.done;
}

export async function hardDeleteBook(id: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('books', 'readwrite');
  const store = tx.objectStore('books');
  await store.delete(id);
  await tx.done;
}

export async function clearAllBooks(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('books', 'readwrite');
  const store = tx.objectStore('books');
  await store.clear();
  await tx.done;
}
