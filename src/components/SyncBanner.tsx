import React from 'react';
import { useBooks } from '../BookContext';
import { RefreshCw, Cloud, CloudOff, BookMarked } from 'lucide-react';

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

export function SyncBanner() {
  const { isSyncing, lastSync, syncError, sync, books } = useBooks();
  const pendingCount = books.filter(b => b.syncStatus === 'pending').length;
  const [showGuide, setShowGuide] = React.useState(true);

  return (
    <div className="flex flex-col shrink-0">
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-slate-950">
            <BookMarked className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Biblio<span className="text-sky-400">Sync</span></h1>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm">
            {pendingCount > 0 ? (
               <span className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                 <CloudOff className="w-4 h-4" />
                 {pendingCount} pendente(s)
               </span>
            ) : (
               <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                 <Cloud className="w-4 h-4" />
                 {lastSync ? `Sincronizado há ${timeSince(lastSync)}` : 'Sincronizado'}
               </span>
            )}
          </div>
          <button
            onClick={sync}
            disabled={isSyncing}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-1.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
        </div>
      </header>

      {/* Alerta de erro altamente visível */}
      {syncError && (
        <div className="bg-red-950/80 border-b border-red-800/60 p-4 text-slate-200 text-sm">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="bg-red-800 text-white font-bold px-2 py-0.5 rounded text-xs mt-0.5 shrink-0">
                ERRO DE CONEXÃO
              </span>
              <div className="flex-1">
                <p className="font-semibold text-red-200">{syncError}</p>
              </div>
              <button 
                onClick={() => setShowGuide(!showGuide)} 
                className="text-xs text-sky-400 hover:underline shrink-0"
              >
                {showGuide ? "Ocultar Guia" : "Ver Solução de Problemas"}
              </button>
            </div>

            {showGuide && (
              <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 text-xs text-slate-300 space-y-3 mt-1">
                <p className="font-bold text-sky-400 text-sm border-b border-slate-800 pb-1">
                  💡 Como resolver este erro no seu Google Sheets & Apps Script:
                </p>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>
                    <strong className="text-white">Verifique o Tipo de Implementação:</strong> No editor do Apps Script, clique no botão azul <strong className="text-white">"Implementar" (Deploy) &gt; "Nova implementação"</strong>. Certifique-se de escolher <strong className="text-white">Aplicação Web</strong> (ícone de engrenagem).
                  </li>
                  <li>
                    <strong className="text-white">Configuração de Acesso (Crítico):</strong> No campo <strong className="text-white">"Quem tem acesso" (Who has access)</strong>, tem de selecionar obrigatoriamente <strong className="text-white">"Qualquer pessoa" (Anyone)</strong>. Se deixar "Apenas eu", a aplicação não conseguirá comunicar com a folha!
                  </li>
                  <li>
                    <strong className="text-white">O ID da Folha está correto?</strong> Abra o código do Apps Script e verifique a variável <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-400 font-mono">const SPREADSHEET_ID = "..."</code>. Ela deve conter o ID da sua folha de cálculo (encontrado no URL do browser entre <code className="text-slate-400">/d/</code> e <code className="text-slate-400">/edit</code>).
                  </li>
                  <li>
                    <strong className="text-white">Crie SEMPRE uma Nova Versão ao alterar o código:</strong> Sempre que modificar o código no Apps Script, tem de clicar em <strong className="text-white">Implementar &gt; Gerir implementações &gt; Ícone do Lápis &gt; Em "Versão", escolher "Nova versão" (New version)</strong> e clicar em <strong className="text-white">Implementar</strong>. Se não escolher "Nova versão", o Google continuará a correr o código antigo!
                  </li>
                  <li>
                    <strong className="text-white">URL correto nas Definições:</strong> O URL colocado na variável <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-400 font-mono">VITE_GOOGLE_APPS_SCRIPT_URL</code> no painel de Definições (Secrets) do AI Studio tem de terminar com <code className="text-white font-mono">/exec</code> (e não <code className="text-white font-mono">/edit</code> ou <code className="text-white font-mono">/home</code>).
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
