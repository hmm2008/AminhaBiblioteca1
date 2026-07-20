import React, { useState, useMemo } from 'react';
import { useBooks } from '../BookContext';
import { BookCard } from './BookCard';
import { BookForm } from './BookForm';
import { LocalBook, ReadStatus } from '../types';
import { Search, Plus, FilterX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export function Catalog() {
  const { books, addOrUpdateBook, removeBook } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReadStatus | 'Todos'>('Todos');
  const [genreFilter, setGenreFilter] = useState<string>('Todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<LocalBook | null>(null);

  const allGenres = useMemo(() => {
    const genres = new Set(books.map(b => b.genre).filter(Boolean));
    return ['Todos', ...Array.from(genres)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Todos' || book.readStatus === statusFilter;
      const matchesGenre = genreFilter === 'Todos' || book.genre === genreFilter;

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [books, searchTerm, statusFilter, genreFilter]);

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
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 transition-all appearance-none flex-grow md:flex-grow-0 max-w-[150px] truncate"
          >
            {allGenres.map(g => (
              <option key={g} value={g}>{g === 'Todos' ? 'Todos os géneros' : g}</option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'Todos' || genreFilter !== 'Todos') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); setGenreFilter('Todos'); }}
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
                onDelete={removeBook} 
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
    </div>
  );
}
