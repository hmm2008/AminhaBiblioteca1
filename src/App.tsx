/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookProvider } from './BookContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BookForm } from './components/BookForm';
import { useBooks } from './BookContext';
import { LocalBook } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add'>('dashboard');
  const { addOrUpdateBook } = useBooks();

  const handleSaveBook = async (book: LocalBook) => {
    await addOrUpdateBook(book);
    setCurrentView('dashboard');
  };

  return (
    <div className="h-screen flex bg-gray-50 text-slate-800 font-sans selection:bg-blue-500/30 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {currentView === 'dashboard' ? (
          <Dashboard onAddBook={() => setCurrentView('add')} />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <BookForm 
                onSave={handleSaveBook} 
                onClose={() => setCurrentView('dashboard')} 
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
