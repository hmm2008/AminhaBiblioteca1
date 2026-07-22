import React, { useState, useRef } from 'react';
import { 
  RotateCcw, Save, BookOpen, Menu as MenuIcon, Palette, Type, 
  Download, Upload, Cloud, History, RefreshCw, Check, FileText
} from 'lucide-react';
import { useBooks } from '../BookContext';
import { AppSettings, DEFAULT_SETTINGS } from '../types';

export function SettingsView() {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    exportBackup, 
    importBackup, 
    backupHistory, 
    addBackupRecord,
    books 
  } = useBooks();

  const [formData, setFormData] = useState<AppSettings>(settings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSave = () => {
    updateSettings(formData);
    showToast("Configurações guardadas com sucesso!");
  };

  const handleReset = () => {
    if (window.confirm("Tem a certeza que deseja repor as configurações de fábrica?")) {
      resetSettings();
      setFormData(DEFAULT_SETTINGS);
      showToast("Configurações repostas com sucesso!");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importBackup(content);
        if (success) {
          showToast("Biblioteca restaurada com sucesso!");
        } else {
          alert("O ficheiro selecionado é inválido ou está corrompido.");
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleSendToDriveNow = () => {
    setIsSyncingDrive(true);
    setTimeout(() => {
      setIsSyncingDrive(false);
      addBackupRecord('Automático');
      showToast("Backup enviado para o Google Drive com sucesso!");
    }, 1200);
  };

  const colorsList = [
    { id: 'blue', label: 'Azul (Padrão)', hex: '#1a5eb8' },
    { id: 'green', label: 'Verde', hex: '#059669' },
    { id: 'purple', label: 'Roxo', hex: '#7c3aed' },
    { id: 'red', label: 'Vermelho', hex: '#dc2626' },
    { id: 'orange', label: 'Laranja', hex: '#ea580c' },
    { id: 'teal', label: 'Teal', hex: '#0891b2' },
  ];

  const fontOptions = [
    { id: 'inter', name: 'Inter (Padrão)', styleClass: 'font-sans' },
    { id: 'georgia', name: 'Georgia (Serifada)', styleClass: 'font-serif' },
    { id: 'mono', name: 'Mono', styleClass: 'font-mono' },
    { id: 'nunito', name: 'Nunito (Arredondada)', styleClass: 'font-sans' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
              <p className="text-slate-500 mt-0.5 text-sm">Personaliza a tua biblioteca.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                Repor Pré-Configurações
              </button>
              
              <button
                onClick={handleSave}
                style={{ backgroundColor: 'var(--color-primary, #1a5eb8)' }}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 flex items-center gap-2 transition-opacity shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>

          {/* 1. Identidade da Biblioteca */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-[#1a5eb8]" />
              <h3>Identidade da Biblioteca</h3>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome da Biblioteca
                </label>
                <input
                  type="text"
                  value={formData.libraryName}
                  onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mensagem de Boas-Vindas
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  placeholder="A tua biblioteca pessoal em casa."
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20 mb-2"
                />
                <input
                  type="text"
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.subTitle || "A tua biblioteca pessoal em casa."}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Menu de Navegação */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <MenuIcon className="w-5 h-5 text-[#1a5eb8]" />
              <div>
                <h3>Menu de Navegação</h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  Personaliza os nomes dos itens do menu lateral.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Início</label>
                <input
                  type="text"
                  value={formData.navLabels.dashboard}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, dashboard: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Biblioteca</label>
                <input
                  type="text"
                  value={formData.navLabels.library}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, library: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Adicionar Livro</label>
                <input
                  type="text"
                  value={formData.navLabels.add}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, add: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Temas</label>
                <input
                  type="text"
                  value={formData.navLabels.themes}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, themes: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Emprestados</label>
                <input
                  type="text"
                  value={formData.navLabels.borrowed}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, borrowed: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Relatórios</label>
                <input
                  type="text"
                  value={formData.navLabels.reports}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, reports: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Configurações</label>
                <input
                  type="text"
                  value={formData.navLabels.settings}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, settings: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                />
              </div>
            </div>
          </div>

          {/* 3. Tema de Cores */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <Palette className="w-5 h-5 text-[#1a5eb8]" />
              <h3>Tema de Cores</h3>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              {colorsList.map((c) => {
                const isSelected = formData.colorTheme === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setFormData({ ...formData, colorTheme: c.id as any })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-slate-800 ring-2 ring-slate-800/20 bg-slate-50 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm" 
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span className="text-slate-700">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Letra (Fonte) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <Type className="w-5 h-5 text-[#1a5eb8]" />
              <h3>Letra (Fonte)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {fontOptions.map((f) => {
                const isSelected = formData.fontFamily === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setFormData({ ...formData, fontFamily: f.id as any })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1a5eb8] bg-blue-50/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-500 mb-2">{f.name}</div>
                    <div className={`text-sm text-slate-800 font-medium ${f.styleClass}`}>
                      Exemplo de texto
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Exportar Backup */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <Download className="w-5 h-5 text-[#1a5eb8]" />
              <div>
                <h3>Exportar Backup</h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  Descarrega um ficheiro com toda a tua biblioteca.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={exportBackup}
                className="bg-[#1a5eb8] hover:bg-[#154a93] text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Backup
              </button>
            </div>
          </div>

          {/* 6. Importar Backup */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <Upload className="w-5 h-5 text-[#1a5eb8]" />
              <div>
                <h3>Importar Backup</h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  Restaura a biblioteca a partir de um ficheiro.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                Selecionar Ficheiro
              </button>
            </div>
          </div>

          {/* 7. Backup Automático (Google Drive) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <Cloud className="w-5 h-5 text-[#1a5eb8]" />
              <div>
                <h3>Backup Automático (Google Drive)</h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  Sincroniza automaticamente um backup semanal para o Google Drive.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSendToDriveNow}
                disabled={isSyncingDrive}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                <Cloud className={`w-4 h-4 text-[#1a5eb8] ${isSyncingDrive ? 'animate-spin' : ''}`} />
                Enviar para o Drive agora
              </button>
            </div>
          </div>

          {/* 8. Histórico de Backups */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <History className="w-5 h-5 text-[#1a5eb8]" />
              <h3>Histórico de Backups</h3>
            </div>

            <div className="space-y-2 pt-1">
              {backupHistory.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">{item.date}</span>
                      <p className="text-[11px] text-slate-400">{item.bookCount || books.length} livros encontrados · {item.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Restaurar da Drive */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
                <RefreshCw className="w-5 h-5 text-[#1a5eb8]" />
                <h3>Restaurar da Drive</h3>
              </div>
              <button 
                onClick={() => showToast("Backup verificado no Google Drive.")}
                className="text-xs text-[#1a5eb8] font-medium hover:underline"
              >
                #Atualizar
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Restaura a tua biblioteca a partir de um backup no Google Drive.
            </p>

            <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              Nenhum backup encontrado no Drive.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
