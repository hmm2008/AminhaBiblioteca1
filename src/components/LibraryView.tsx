import React, { useState } from 'react';
import { useBooks } from '../BookContext';
import { Search, Book, Users, Pencil, Trash2, Filter } from 'lucide-react';
import { LocalBook } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface LibraryViewProps {
  onAddBook: () => void;
  onEditBook: (id: string) => void;
  initialCategory?: string;
}

export function LibraryView({ onAddBook, onEditBook, initialCategory }: LibraryViewProps) {
  const { books, removeBook, hardRemoveBook, themes } = useBooks();
  const { t, translateTheme } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory || 'Todos os temas');
  const [sortBy, setSortBy] = useState('Título');
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCategory) {
      setCategoryFilter(initialCategory);
    }
  }, [initialCategory]);

  const categories = ['Todos os temas', ...themes];

  // Filter and sort books
  const filteredBooks = books.filter(book => {
    const matchesSearch = (book.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (book.isbn || '').includes(searchTerm);
    const matchesCategory = categoryFilter === 'Todos os temas' || book.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'Título') {
      return (a.title || '').localeCompare(b.title || '');
    }
    // Add other sorting methods if needed
    return 0;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t('nav.library')}</h2>
              <p className="text-slate-500 mt-1">{filteredBooks.length === 1 ? t('library.booksFound_one') : t('library.booksFound_other', { count: filteredBooks.length })}</p>
            </div>
            <button 
              onClick={onAddBook}
              className="bg-[#1a5eb8] hover:bg-[#154a93] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              {t('library.addBook')}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl shadow-sm border border-slate-200">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('library.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-slate-700 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20 rounded-xl"
              />
            </div>

            <div className="flex gap-4">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1a5eb8] shadow-sm appearance-none min-w-[200px]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'Todos os temas' ? t('library.allThemes') : translateTheme(cat)}</option>
                ))}
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1a5eb8] shadow-sm appearance-none min-w-[200px]"
              >
                <option value="Título">{t('library.title')}</option>
                {/* Add more sort options if needed */}
              </select>
            </div>
          </div>

          {/* Grid of Books */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pt-4">
            {filteredBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onEdit={() => onEditBook(book.id)} 
                onDelete={() => setBookToDelete(book.id)} 
              />
            ))}
            {filteredBooks.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                <Book className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{t('library.noBooksFound')}</p>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4 text-red-600 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('library.deleteTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('library.deleteMessage')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50">
              <button 
                onClick={() => setBookToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors order-3 sm:order-1"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => { removeBook(bookToDelete); setBookToDelete(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors order-2"
              >
                {t('library.trashBtn')}
              </button>
              <button 
                onClick={() => { hardRemoveBook(bookToDelete); setBookToDelete(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors order-1 sm:order-3"
              >
                {t('library.hardDeleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BookCard: React.FC<{ book: LocalBook, onEdit: () => void, onDelete: () => any }> = ({ book, onEdit, onDelete }) => {
  const { t, translateTheme } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col relative h-full">
      {/* Action Buttons Overlay */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="bg-white text-slate-600 hover:text-[#1a5eb8] p-1.5 rounded-full shadow-sm border border-slate-200"
          title={t('common.edit')}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="bg-white text-slate-600 hover:text-red-600 p-1.5 rounded-full shadow-sm border border-slate-200"
          title={t('common.delete')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="aspect-[2/3] w-full bg-slate-100 relative overflow-hidden">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Book className="w-12 h-12" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1" title={book.title}>{book.title}</h4>
        <p className="text-xs text-slate-500 mb-3 line-clamp-1 flex items-center gap-1">
          <Users className="w-3 h-3" /> {book.author || t('common.author')}
        </p>
        <div className="mt-auto">
          <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-full truncate max-w-full">
            {translateTheme(book.category || '') || t('common.category')}
          </span>
        </div>
      </div>
    </div>
  );
}
