import React, { useState } from 'react';
import { useBooks } from '../BookContext';
import { Download, FileJson, FileText, Printer, BookOpen, Bookmark, Library, BookX, Book, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { isDefaultNavLabel } from '../types';

export function ReportsView() {
  const { books, themes, settings } = useBooks();
  const { t, translateTheme } = useTranslation();
  const [exportFilter, setExportFilter] = useState<'todos' | 'lidos' | 'emprestados' | 'extraviados' | 'nao-lidos'>('todos');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const [showExportConfirm, setShowExportConfirm] = useState<'csv' | 'json' | null>(null);

  const customNavLabel = settings?.navLabels?.reports;
  const pageTitle = customNavLabel && !isDefaultNavLabel('reports', customNavLabel)
    ? customNavLabel
    : t('nav.reports');

  // Stats calculations
  const totalBooks = books.length;
  const lidosCount = books.filter(b => b.readStatus === 'Lido').length;
  const emprestadosCount = books.filter(b => b.status === 'Emprestado').length;
  const extraviadosCount = books.filter(b => b.status === 'Extraviado').length;
  const temasCount = themes.length;
  const paginasTotais = books.reduce((acc, book) => {
    const pages = parseInt(book.pageCount as string) || 0;
    return acc + pages;
  }, 0);
  const naoLidosCount = books.filter(b => b.readStatus === 'Não Lido').length;

  // Filter books for preview
  const filteredBooks = books.filter(book => {
    switch (exportFilter) {
      case 'lidos': return book.readStatus === 'Lido';
      case 'emprestados': return book.status === 'Emprestado';
      case 'extraviados': return book.status === 'Extraviado';
      case 'nao-lidos': return book.readStatus === 'Não Lido';
      default: return true;
    }
  });

  const executeExportCSV = () => {
    const headers = [t('library.title'), t('library.author'), t('common.category'), t('reports.statusCol'), t('bookForm.readStatus'), t('bookForm.publishYear'), 'ISBN'];
    const csvContent = [
      headers.join(','),
      ...filteredBooks.map(b => [
        `"${b.title || ''}"`,
        `"${b.author || ''}"`,
        `"${b.category || ''}"`,
        `"${b.status || ''}"`,
        `"${b.readStatus || ''}"`,
        `"${b.publishedDate || ''}"`,
        `"${b.isbn || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'biblioteca.csv';
    link.click();
    setShowExportConfirm(null);
  };

  const executeExportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredBooks, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'biblioteca.json';
    link.click();
    setShowExportConfirm(null);
  };

  const handleExportCSV = () => {
    setShowExportConfirm('csv');
  };

  const handleExportJSON = () => {
    setShowExportConfirm('json');
  };

  const handleExportPDF = () => {
    setShowPdfPreview(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="print:hidden">
            <h2 className="text-2xl font-bold text-slate-800">{pageTitle}</h2>
            <p className="text-slate-500 mt-1">{t('reports.subtitle')}</p>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 print:hidden">
            <StatCard label={t('reports.stats.total')} value={totalBooks} />
            <StatCard label={t('reports.stats.read')} value={lidosCount} />
            <StatCard label={t('reports.stats.borrowed')} value={emprestadosCount} />
            <StatCard label={t('reports.stats.lost')} value={extraviadosCount} />
            <StatCard label={t('reports.stats.themes')} value={temasCount} />
            <StatCard label={t('reports.stats.pages')} value={paginasTotais} />
          </div>

          <div className="space-y-6 print:hidden">
            <h3 className="text-lg font-bold text-slate-800">{t('reports.performanceTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-orange-50 text-orange-600 p-3 rounded-lg"><BookOpen className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">0</div>
                  <div className="text-xs text-slate-500 font-medium">{t('reports.kpi.totalLoans')}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg"><BookOpen className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">0%</div>
                  <div className="text-xs text-slate-500 font-medium">{t('reports.kpi.onTimeReturns')}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><Bookmark className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">0</div>
                  <div className="text-xs text-slate-500 font-medium">{t('reports.kpi.completedReturns')}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400" /> {t('reports.mostRequested')}</h4>
              <p className="text-sm text-slate-500 text-center py-4">{t('reports.noLoans')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4">{t('reports.recentHistory')}</h4>
              <p className="text-sm text-slate-500 text-center py-4">{t('reports.noHistory')}</p>
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <h3 className="text-base font-bold text-slate-800 mb-1">{t('reports.filterTitle')}</h3>
            <p className="text-xs text-slate-500 mb-4">{t('reports.filterSubtitle')}</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              <FilterButton active={exportFilter === 'todos'} onClick={() => setExportFilter('todos')} icon={<Library className="w-4 h-4" />} label={t('reports.filterAll')} count={totalBooks} />
              <FilterButton active={exportFilter === 'lidos'} onClick={() => setExportFilter('lidos')} icon={<BookOpen className="w-4 h-4" />} label={t('reports.filterRead')} count={lidosCount} />
              <FilterButton active={exportFilter === 'emprestados'} onClick={() => setExportFilter('emprestados')} icon={<Book className="w-4 h-4" />} label={t('reports.filterBorrowed')} count={emprestadosCount} />
              <FilterButton active={exportFilter === 'extraviados'} onClick={() => setExportFilter('extraviados')} icon={<BookX className="w-4 h-4" />} label={t('reports.filterLost')} count={extraviadosCount} />
              <FilterButton active={exportFilter === 'nao-lidos'} onClick={() => setExportFilter('nao-lidos')} icon={<BookOpen className="w-4 h-4" />} label={t('reports.filterUnread')} count={naoLidosCount} />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">{t('reports.exportTitle')}</h3>
            <p className="text-xs text-slate-500 mb-4">{t('reports.exportCount').replace('{count}', filteredBooks.length.toString())}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button onClick={handleExportCSV} className="text-left p-4 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-50 transition-colors group">
                <Download className="w-5 h-5 text-green-600 mb-3" />
                <h4 className="font-bold text-green-900 text-sm mb-1">{t('reports.exportCsv')}</h4>
                <p className="text-xs text-green-700/70">{t('reports.openInExcel')}</p>
              </button>
              <button onClick={handleExportJSON} className="text-left p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors group">
                <FileJson className="w-5 h-5 text-blue-600 mb-3" />
                <h4 className="font-bold text-blue-900 text-sm mb-1">{t('reports.exportJson')}</h4>
                <p className="text-xs text-blue-700/70">{t('reports.structuredFormat')}</p>
              </button>
              <button onClick={handleExportPDF} className="text-left p-4 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors group">
                <FileText className="w-5 h-5 text-red-600 mb-3" />
                <h4 className="font-bold text-red-900 text-sm mb-1">{t('reports.exportPdf')}</h4>
                <p className="text-xs text-red-700/70">{t('reports.pdfInstructions')}</p>
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 print:text-xl print:mb-4">{t('reports.previewTitle')} ({filteredBooks.length})</h3>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">{t('library.title')}</th>
                      <th className="px-6 py-4">{t('common.author')}</th>
                      <th className="px-6 py-4">{t('common.category')}</th>
                      <th className="px-6 py-4">{t('common.status')}</th>
                      <th className="px-6 py-4">{t('bookForm.readStatus')}</th>
                      <th className="px-6 py-4">{t('bookForm.publishYear')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBooks.map(book => (
                      <tr key={book.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate" title={book.title}>{book.title}</td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{book.author}</td>
                        <td className="px-6 py-4 text-slate-600">{translateTheme(book.category || "")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                            book.status === 'Emprestado' ? 'bg-amber-50 text-amber-700' :
                            book.status === 'Extraviado' ? 'bg-red-50 text-red-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {book.status === 'Emprestado' ? t('common.bookStatus.borrowed') :
                             book.status === 'Extraviado' ? t('common.bookStatus.lost') :
                             t('common.bookStatus.available')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                           {book.readStatus === 'Lido' ? t('common.readStatus.read') :
                             book.readStatus === 'A ler' ? t('common.readStatus.reading') :
                             t('common.readStatus.unread')}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{book.publishedDate}</td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          {t('reports.noMatches')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-slate-800">{t('reports.pdfPreview')}</h3>
              </div>
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
              <div className="bg-white p-8 shadow-sm max-w-[21cm] mx-auto min-h-[29.7cm] text-black">
                <h1 className="text-2xl font-bold mb-6 text-center border-b pb-4">{t('reports.libraryReport')}</h1>
                <div className="flex justify-between text-sm mb-8 text-slate-600">
                  <span>{t('reports.totalReportBooks')}: <strong>{filteredBooks.length}</strong></span>
                  <span>Data: {new Date().toLocaleDateString()}</span>
                </div>
                
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase border-b border-slate-300">
                    <tr>
                      <th className="px-4 py-3">{t('library.title')}</th>
                      <th className="px-4 py-3">{t('library.author')}</th>
                      <th className="px-4 py-3">{t('common.category')}</th>
                      <th className="px-4 py-3">{t('reports.statusCol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBooks.map(book => (
                      <tr key={book.id}>
                        <td className="px-4 py-3 font-medium max-w-[250px] truncate">{book.title}</td>
                        <td className="px-4 py-3 max-w-[150px] truncate">{book.author}</td>
                        <td className="px-4 py-3">{translateTheme(book.category || "")}</td>
                        <td className="px-4 py-3">{book.status === 'Emprestado' ? t('common.bookStatus.borrowed') : book.status === 'Extraviado' ? t('common.bookStatus.lost') : t('common.bookStatus.available')}</td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">{t('reports.noMatches')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowPdfPreview(false);
                  setTimeout(() => {
                    window.print();
                  }, 100);
                }}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4 text-[var(--color-primary)] mx-auto">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('reports.exportTo')} {showExportConfirm === 'csv' ? 'CSV' : 'JSON'}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('reports.exportConfirm', { count: filteredBooks.length })}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setShowExportConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={showExportConfirm === 'csv' ? executeExportCSV : executeExportJSON}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Gravar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mt-1">{label}</div>
    </div>
  );
}

function FilterButton({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
        active 
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm' 
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      {icon}
      {label}
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
        {count}
      </span>
    </button>
  );
}
