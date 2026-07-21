import React from 'react';
import { Home, Library, PlusCircle, Bookmark, Users, BarChart2, Archive, Settings, Trash2, LogOut, Lock, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { useBooks } from '../BookContext';

interface SidebarProps {
  currentView: 'dashboard' | 'add';
  setCurrentView: (view: 'dashboard' | 'add') => void;
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

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { isSyncing, lastSync, syncError, sync, books } = useBooks();
  const pendingCount = books.filter(b => b.syncStatus === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'library', label: 'Biblioteca', icon: Library },
    { id: 'add', label: 'Adicionar Livro', icon: PlusCircle },
    { id: 'themes', label: 'Temas', icon: Bookmark },
    { id: 'borrowed', label: 'Emprestados', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart2 },
    { id: 'archive', label: 'Arquivo', icon: Archive },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
  ];

  return (
    <aside className="w-64 bg-[#1a5eb8] text-white flex flex-col h-screen shrink-0 relative z-10">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Library className="w-6 h-6" />
          <h1 className="font-bold text-lg leading-tight">Biblioteca Pessoal de<br/>Manuel Francisco</h1>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (currentView === 'dashboard' && item.id === 'dashboard') || (currentView === 'add' && item.id === 'add');
            const isWired = item.id === 'dashboard' || item.id === 'add';
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => isWired && setCurrentView(item.id as 'dashboard' | 'add')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 opacity-80" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-2 border-t border-blue-400/30">
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

        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors border border-blue-400/30">
          <LogOut className="w-4 h-4 opacity-80" />
          Exportar CSV
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors border border-blue-400/30">
          <Lock className="w-4 h-4 opacity-80" />
          Configurar PIN
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
  );
}
