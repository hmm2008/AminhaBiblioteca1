import React, { useState, useMemo } from 'react';
import { useBooks } from '../BookContext';
import { BookCard } from './BookCard';
import { BookForm } from './BookForm';
import { LocalBook, ReadStatus } from '../types';
import { Search, Plus, FilterX, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export function Catalog() {
  const { books, addOrUpdateBook, removeBook } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReadStatus | 'Todos'>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<LocalBook | null>(null);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const categories = new Set(books.map(b => b.category).filter(Boolean));
    return ['Todos', ...Array.from(categories)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Todos' || book.readStatus === statusFilter;
      const matchesCategory = categoryFilter === 'Todos' || book.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [books, searchTerm, statusFilter, categoryFilter]);

  const handleSave = async (book: LocalBook) => {
    await addOrUpdateBook(book);
    setIsFormOpen(false);
    setEditingBook(null);
  };

  const handleEdit = (book: LocalBook) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-2xl font-semibold text-white">Catálogo da Biblioteca</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 hidden sm:block">Mostrando {filteredBooks.length} de {books.length} livros</div>
          <button 
            onClick={() => { setEditingBook(null); setIsFormOpen(true); }}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Novo Registo
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-6 flex flex-col md:flex-row gap-3 shrink-0 shadow-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Pesquisar por título ou autor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-500"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReadStatus | 'Todos')}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 transition-all appearance-none flex-grow md:flex-grow-0"
          >
            <option value="Todos">Todos os estados</option>
            <option value="Lido">Lido</option>
            <option value="A ler">A ler</option>
            <option value="Não Lido">Não Lido</option>
          </select>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 transition-all appearance-none flex-grow md:flex-grow-0 max-w-[150px] truncate"
          >
            {allCategories.map(c => (
              <option key={c} value={c}>{c === 'Todos' ? 'Todas as categorias' : c}</option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'Todos' || categoryFilter !== 'Todos') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); setCategoryFilter('Todos'); }}
              className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-400/50 rounded-lg transition-colors"
              title="Limpar filtros"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filteredBooks.length > 0 ? (
          <AnimatePresence>
            {filteredBooks.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                onEdit={handleEdit} 
                onDelete={setBookToDelete} 
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
            <h3 className="text-lg font-medium text-slate-300 mb-1">Nenhum livro encontrado</h3>
            <p className="text-slate-500 text-sm">
              {books.length === 0 ? 'O seu catálogo está vazio. Comece por adicionar um livro.' : 'Tente ajustar os filtros de pesquisa.'}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <BookForm 
            book={editingBook} 
            onSave={handleSave} 
            onClose={() => { setIsFormOpen(false); setEditingBook(null); }} 
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4 text-red-600 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                Apagar Registo
              </h3>
              <p className="text-sm text-slate-500 text-center">
                Tem a certeza que deseja apagar este livro? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setBookToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { removeBook(bookToDelete); setBookToDelete(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
