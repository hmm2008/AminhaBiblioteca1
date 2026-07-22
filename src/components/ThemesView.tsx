import React, { useState } from 'react';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { useBooks } from '../BookContext';
import { useTranslation } from '../i18n/LanguageContext';

interface ThemesViewProps {
  onNavigateToLibrary?: (theme: string) => void;
}

export function ThemesView({ onNavigateToLibrary }: ThemesViewProps) {
  const { themes, books, addTheme, removeTheme } = useBooks();
  const { t } = useTranslation();
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  const handleAddThemeSubmit = () => {
    if (newThemeName.trim()) {
      addTheme(newThemeName.trim());
      setIsAddingTheme(false);
      setNewThemeName('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t('nav.themes')}</h2>
              <p className="text-slate-500 mt-1">{t('themes.subtitle')}</p>
            </div>
            <button 
              onClick={() => setIsAddingTheme(true)}
              className="bg-[#1a5eb8] hover:bg-[#154a93] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t('themes.newTheme')}
            </button>
          </div>

          {/* Grid of Themes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
            {themes.map(theme => {
              const bookCount = books.filter(b => b.category === theme).length;
              
              return (
                <div key={theme} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-[#1a5eb8] p-2 rounded-lg">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-700 text-sm">{theme}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-[#1a5eb8] text-xs font-bold px-2 py-0.5 rounded-full">
                        {bookCount}
                      </span>
                      <button 
                        onClick={() => setThemeToDelete(theme)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title={t('themes.deleteTheme')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {bookCount > 0 ? (
                    <div className="pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => onNavigateToLibrary && onNavigateToLibrary(theme)}
                        className="text-[#1a5eb8] text-xs font-medium hover:underline flex items-center gap-1"
                      >
                        <Bookmark className="w-3 h-3" /> {t('themes.viewBooks').replace('{count}', bookCount.toString())}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
            
            {themes.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{t('themes.emptyState')}</p>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Add Theme Modal */}
      {isAddingTheme && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {t('themes.newTheme')}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Introduza o nome da nova categoria. Ela ficará disponível para futuras utilizações.
              </p>
              <input 
                type="text"
                autoFocus
                value={newThemeName}
                onChange={e => setNewThemeName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddThemeSubmit();
                }}
                placeholder="Nome da categoria..."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
              />
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => {
                  setIsAddingTheme(false);
                  setNewThemeName('');
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleAddThemeSubmit}
                disabled={!newThemeName.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#1a5eb8] text-white hover:bg-[#154a93] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Theme Confirmation Modal */}
      {themeToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4 text-red-600 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('themes.deleteTheme')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('themes.deleteConfirm').replace('{theme}', themeToDelete)}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setThemeToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => { 
                  removeTheme(themeToDelete); 
                  setThemeToDelete(null); 
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
