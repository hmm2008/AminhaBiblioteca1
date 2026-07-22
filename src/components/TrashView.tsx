import React, { useState } from 'react';
import { Trash2, RefreshCcw, AlertTriangle, Box } from 'lucide-react';
import { useBooks } from '../BookContext';
import { useTranslation } from '../i18n/LanguageContext';

import { LocalBook } from '../types';

export function TrashView() {
  const { trashedBooks, hardRemoveBook, restoreBook } = useBooks();
  const { t } = useTranslation();
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [bookToRestore, setBookToRestore] = useState<LocalBook | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t('trash.title')}</h2>
              <p className="text-slate-500 mt-0.5 text-sm">{t('trash.subtitle')}</p>
            </div>
          </div>

          {/* Empty State */}
          {trashedBooks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
              <Box className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-slate-800 font-semibold mb-2">{t('trash.emptyTitle')}</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                {t('trash.emptySubtitle')}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <tr>
                      <th className="px-6 py-4">{t('library.title')}</th>
                      <th className="px-6 py-4">{t('common.author')}</th>
                      <th className="px-6 py-4">{t('common.category')}</th>
                      <th className="px-6 py-4">{t('bookForm.readStatus')}</th>
                      <th className="px-6 py-4 text-right">{t('trash.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trashedBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{book.title}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{book.author}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            book.readStatus === 'Lido' ? 'bg-emerald-50 text-emerald-700' :
                            book.readStatus === 'A ler' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {book.readStatus === 'Lido' ? t('common.readStatus.read') :
                             book.readStatus === 'A ler' ? t('common.readStatus.reading') :
                             t('common.readStatus.unread')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setBookToRestore(book)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t('trash.restoreAction')}
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setBookToDelete(book.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('trash.deleteAction')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4 text-red-600 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('trash.deleteConfirmTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('trash.deleteConfirmSubtitle')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setBookToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => { hardRemoveBook(bookToDelete); setBookToDelete(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('trash.deleteAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {bookToRestore && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4 text-[#1a5eb8] mx-auto">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('trash.restoreConfirmTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                Pretende restaurar "{bookToRestore.title}" para a sua biblioteca?
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setBookToRestore(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => { restoreBook(bookToRestore); setBookToRestore(null); }}
                style={{ backgroundColor: 'var(--color-primary, #1a5eb8)' }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                {t('trash.restoreAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
