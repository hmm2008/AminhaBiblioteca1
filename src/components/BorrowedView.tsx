import React from 'react';
import { useBooks } from '../BookContext';
import { Book, Users, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export function BorrowedView() {
  const { books } = useBooks();
  const { t } = useTranslation();
  
  const borrowedBooks = books.filter(b => b.status === 'Emprestado');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t('nav.borrowed')}</h2>
              <p className="text-slate-500 mt-1">{t('borrowed.subtitle').replace('{count}', borrowedBooks.length.toString())}</p>
            </div>
          </div>

          {borrowedBooks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-20 flex flex-col items-center justify-center text-center shadow-sm mt-8">
              <Book className="w-16 h-16 text-[#8bb4eb] mb-4 opacity-70" />
              <h3 className="text-[#1a5eb8] font-semibold text-lg mb-1">{t('borrowed.emptyTitle')}</h3>
              <p className="text-[#1a5eb8] text-sm opacity-80">{t('borrowed.emptySubtitle')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pt-4">
              {borrowedBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col relative h-full">
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
                      <Users className="w-3 h-3" /> {book.author || t('library.unknownAuthor')}
                    </p>
                    <div className="mt-auto">
                      <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded-full truncate max-w-full">
                        {t('common.bookStatus.borrowed')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
