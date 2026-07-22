/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { BookProvider } from './BookContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LibraryView } from './components/LibraryView';
import { ThemesView } from './components/ThemesView';
import { BorrowedView } from './components/BorrowedView';
import { ReportsView } from './components/ReportsView';
import { BookForm } from './components/BookForm';
import { useBooks } from './BookContext';
import { LocalBook } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 text-slate-800 font-sans selection:bg-blue-500/30 overflow-hidden">
      <div className="lg:hidden bg-[#1a5eb8] text-white p-4 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-lg">Biblioteca Pessoal</h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-white hover:bg-white/10 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar 
        currentView={currentView} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        setCurrentView={(v) => {
          if (v !== 'add') setEditingBookId(null);
          setCurrentView(v);
          setIsMobileMenuOpen(false);
        }} 
      />
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {currentView === 'dashboard' && <Dashboard onAddBook={() => setCurrentView('add')} />}
        {currentView === 'library' && <LibraryView onAddBook={() => setCurrentView('add')} onEditBook={handleEditBook} />}
        {currentView === 'themes' && <ThemesView />}
        {currentView === 'borrowed' && <BorrowedView />}
        {currentView === 'reports' && <ReportsView />}
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
