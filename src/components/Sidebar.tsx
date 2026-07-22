import React from 'react';
import { Home, Library, PlusCircle, Bookmark, Users, BarChart2, Archive, Settings, Trash2, LogOut, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { useBooks } from '../BookContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " anos";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " dias";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min";
  return Math.floor(seconds) + " seg";
}

export function Sidebar({ currentView, setCurrentView, isOpen, onClose }: SidebarProps) {
  const { isSyncing, lastSync, syncError, sync, books, settings, exportBackup } = useBooks();
  const pendingCount = books.filter(b => b.syncStatus === 'pending').length;

  const defaultNavItems = [
    { id: 'dashboard', defaultLabel: 'Início', icon: Home },
    { id: 'library', defaultLabel: 'Biblioteca', icon: Library },
    { id: 'add', defaultLabel: 'Adicionar Livro', icon: PlusCircle },
    { id: 'themes', defaultLabel: 'Temas', icon: Bookmark },
    { id: 'borrowed', defaultLabel: 'Emprestados', icon: Users },
    { id: 'reports', defaultLabel: 'Relatórios', icon: BarChart2 },
    { id: 'archive', defaultLabel: 'Arquivo', icon: Archive },
    { id: 'settings', defaultLabel: 'Configurações', icon: Settings },
    { id: 'trash', defaultLabel: 'Lixeira', icon: Trash2 },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside 
        style={{ backgroundColor: 'var(--color-primary, #1a5eb8)' }}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 text-white flex flex-col h-screen shrink-0 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Library className="w-6 h-6 shrink-0" />
          <h1 className="font-bold text-base leading-tight break-words">
            {settings.libraryName || 'Biblioteca Pessoal'}
          </h1>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {defaultNavItems.map((item) => {
            const isActive = currentView === item.id;
            const isWired = ['dashboard', 'add', 'library', 'themes', 'borrowed', 'reports', 'settings'].includes(item.id);
            const displayLabel = settings.navLabels?.[item.id] || item.defaultLabel;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => isWired && setCurrentView(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white font-semibold' 
                      : isWired 
                        ? 'text-blue-100 hover:bg-white/10 hover:text-white' 
                        : 'text-blue-200/50 cursor-not-allowed'
                  }`}
                >
                  <item.icon className="w-4 h-4 opacity-80" />
                  {displayLabel}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-2 border-t border-white/20">
        <div className="mb-4">
          <button
            onClick={sync}
            disabled={isSyncing}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </span>
            {pendingCount > 0 ? (
              <CloudOff className="w-4 h-4 text-amber-300" title={`${pendingCount} pendentes`} />
            ) : (
              <Cloud className="w-4 h-4 text-emerald-300" title={`Sincronizado há ${lastSync ? timeSince(lastSync) : 'pouco'}`} />
            )}
          </button>
          {syncError && <div className="text-[10px] text-red-200 mt-1 px-1">Erro de Sincronização</div>}
        </div>

        <button 
          onClick={exportBackup}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors border border-white/20"
        >
          <LogOut className="w-4 h-4 opacity-80" />
          Exportar CSV
        </button>
        
        <div className="flex gap-4 px-4 py-2 text-xs text-blue-200 mt-2">
          <button className="hover:text-white font-bold text-white">PT</button>
          <button className="hover:text-white">EN</button>
          <button className="hover:text-white">FR</button>
        </div>
        <div className="px-4 text-[10px] text-blue-300 flex justify-between">
          <span>v1.0<br/>© 2026 Manuel Francisco</span>
        </div>
      </div>
    </aside>
    </>
  );
}

