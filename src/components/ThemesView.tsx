import React from 'react';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { useBooks } from '../BookContext';

export function ThemesView() {
  const { themes, books, addTheme, removeTheme } = useBooks();

  const handleAddTheme = () => {
    const newTheme = window.prompt("Nome do novo tema:");
    if (newTheme && newTheme.trim()) {
      addTheme(newTheme.trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Temas</h2>
              <p className="text-slate-500 mt-1">Categorias da tua biblioteca.</p>
            </div>
            <button 
              onClick={handleAddTheme}
              className="bg-[#1a5eb8] hover:bg-[#154a93] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Tema
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
                        onClick={() => {
                          if (window.confirm(`Tem a certeza que quer apagar o tema "${theme}"?`)) {
                            removeTheme(theme);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Eliminar tema"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {bookCount > 0 ? (
                    <div className="pt-2 border-t border-slate-100">
                      <button className="text-[#1a5eb8] text-xs font-medium hover:underline flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> Ver {bookCount} livro{bookCount > 1 ? 's' : ''}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
            
            {themes.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum tema encontrado.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
