/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookProvider } from './BookContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LibraryView } from './components/LibraryView';
import { ThemesView } from './components/ThemesView';
import { BookForm } from './components/BookForm';
import { useBooks } from './BookContext';
import { LocalBook } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add' | 'library' | 'themes'>('dashboard');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const { addOrUpdateBook, books } = useBooks();

  const handleSaveBook = async (book: LocalBook) => {
    await addOrUpdateBook(book);
    setEditingBookId(null);
    setCurrentView('library');
  };

  const handleEditBook = (id: string) => {
    setEditingBookId(id);
    setCurrentView('add');
  };

  const editingBook = editingBookId ? books.find(b => b.id === editingBookId) || null : null;

  return (
    <div className="h-screen flex bg-gray-50 text-slate-800 font-sans selection:bg-blue-500/30 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={(v) => {
        if (v !== 'add') setEditingBookId(null);
        setCurrentView(v);
      }} />
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {currentView === 'dashboard' && <Dashboard onAddBook={() => setCurrentView('add')} />}
        {currentView === 'library' && <LibraryView onAddBook={() => setCurrentView('add')} onEditBook={handleEditBook} />}
        {currentView === 'themes' && <ThemesView />}
        {currentView === 'add' && (
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <BookForm 
                book={editingBook}
                onSave={handleSaveBook} 
                onClose={() => {
                  setEditingBookId(null);
                  setCurrentView('library');
                }} 
             />
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BookProvider>
      <AppContent />
    </BookProvider>
  );
}
