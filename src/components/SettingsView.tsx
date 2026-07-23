import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw, Save, BookOpen, Menu as MenuIcon, Palette, Type, 
  Download, Upload, Cloud, History, RefreshCw, Check, FileText, Folder, LogIn, LogOut, CheckCircle
} from 'lucide-react';
import { useBooks } from '../BookContext';
import { AppSettings, DEFAULT_SETTINGS, isDefaultNavLabel } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { initAuth, googleSignIn, getAccessToken, logoutGoogle } from '../lib/authService';
import { 
  uploadBackupToDrive, 
  listBackupsFromDrive, 
  downloadBackupFromDrive, 
  DRIVE_FOLDER_NAME, 
  DriveFile 
} from '../lib/driveService';
import { User } from 'firebase/auth';

export function SettingsView() {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    exportBackup, 
    getBackupJSONString,
    importBackup, 
    backupHistory, 
    addBackupRecord,
    books 
  } = useBooks();
  const { t } = useTranslation();

  const customNavLabel = settings?.navLabels?.settings;
  const pageTitle = customNavLabel && !isDefaultNavLabel('settings', customNavLabel)
    ? customNavLabel
    : t('nav.settings');

  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingImportContent, setPendingImportContent] = useState<string | ArrayBuffer | null>(null);
  const [showAutoBackupModal, setShowAutoBackupModal] = useState(false);
  const [showRestoreDriveModal, setShowRestoreDriveModal] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<DriveFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [driveBackups, setDriveBackups] = useState<DriveFile[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        fetchDriveBackups(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setDriveBackups([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchDriveBackups = async (token?: string) => {
    const activeToken = token || googleToken || getAccessToken();
    if (!activeToken) return;
    setIsLoadingDriveFiles(true);
    try {
      const files = await listBackupsFromDrive(activeToken, DRIVE_FOLDER_NAME);
      setDriveBackups(files);
    } catch (err: any) {
      console.error('Erro ao carregar ficheiros da Drive:', err);
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        showToast(t('settings.googleConnected'));
        fetchDriveBackups(res.accessToken);
      }
    } catch (e: any) {
      showToast("Erro na ligação ao Google Drive.");
    }
  };

  const handleDisconnectGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
    setDriveBackups([]);
    showToast("Sessão do Google encerrada.");
  };

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const confirmSave = () => {
    updateSettings(formData);
    setShowSaveModal(false);
    showToast(t('settings.saveSuccess'));
  };

  const confirmReset = () => {
    resetSettings();
    setFormData(DEFAULT_SETTINGS);
    setShowResetModal(false);
    showToast(t('settings.resetSuccess'));
  };

  const confirmExport = () => {
    exportBackup();
    setShowExportModal(false);
    showToast(t('settings.exportSuccess'));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      reader.onload = (event) => {
        const content = event.target?.result as ArrayBuffer;
        if (content) {
          setPendingImportContent(content);
          setShowImportModal(true);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setPendingImportContent(content);
          setShowImportModal(true);
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingImportContent) return;
    const success = await importBackup(pendingImportContent);
    if (success) {
      showToast(t('settings.importSuccess'));
    } else {
      alert(t('settings.invalidFile'));
    }
    setPendingImportContent(null);
    setShowImportModal(false);
  };

  const handleSendToDriveNow = async () => {
    setIsSyncingDrive(true);
    try {
      let token = googleToken || getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes) throw new Error('Não foi possível obter autorização.');
        token = authRes.accessToken;
        setGoogleUser(authRes.user);
        setGoogleToken(token);
      }

      const backupStr = getBackupJSONString();
      await uploadBackupToDrive(token, backupStr, DRIVE_FOLDER_NAME);

      addBackupRecord('Automático');
      showToast(t('settings.driveUploadSuccess'));
      fetchDriveBackups(token);
    } catch (error: any) {
      console.error('Erro ao enviar backup para o Google Drive:', error);
      alert('Erro ao enviar backup para o Google Drive: ' + (error.message || error));
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const confirmAutoBackup = () => {
    setShowAutoBackupModal(false);
    handleSendToDriveNow();
  };

  const confirmRestoreDrive = async () => {
    const fileToRestore = pendingRestoreFile;
    setShowRestoreDriveModal(false);
    setPendingRestoreFile(null);
    setIsSyncingDrive(true);
    try {
      let token = googleToken || getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes) throw new Error('Não foi possível obter autorização.');
        token = authRes.accessToken;
        setGoogleUser(authRes.user);
        setGoogleToken(token);
      }

      let fileId = fileToRestore?.id;

      if (!fileId) {
        const files = await listBackupsFromDrive(token, DRIVE_FOLDER_NAME);
        setDriveBackups(files);

        if (!files || files.length === 0) {
          alert(t('settings.noBackupFound'));
          return;
        }
        fileId = files[0].id;
      }

      const jsonContent = await downloadBackupFromDrive(token, fileId);
      const success = await importBackup(jsonContent);

      if (success) {
        showToast(t('settings.driveRestoreSuccess'));
      } else {
        alert(t('settings.invalidFile'));
      }
    } catch (error: any) {
      console.error('Erro ao restaurar backup do Google Drive:', error);
      alert('Erro ao restaurar backup do Google Drive: ' + (error.message || error));
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleRestoreSpecificFile = (file: DriveFile) => {
    setPendingRestoreFile(file);
    setShowRestoreDriveModal(true);
  };

  const colorsList = [
    { id: 'blue', label: t('settings.colors.blue'), hex: '#1a5eb8' },
    { id: 'green', label: t('settings.colors.green'), hex: '#059669' },
    { id: 'purple', label: t('settings.colors.purple'), hex: '#7c3aed' },
    { id: 'red', label: t('settings.colors.red'), hex: '#dc2626' },
    { id: 'orange', label: t('settings.colors.orange'), hex: '#ea580c' },
    { id: 'teal', label: t('settings.colors.teal'), hex: '#0891b2' },
  ];

  const fontOptions = [
    { id: 'inter', name: t('settings.fonts.inter'), styleClass: 'font-sans' },
    { id: 'georgia', name: t('settings.fonts.georgia'), styleClass: 'font-serif' },
    { id: 'mono', name: t('settings.fonts.mono'), styleClass: 'font-mono' },
    { id: 'nunito', name: t('settings.fonts.nunito'), styleClass: 'font-sans' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      {/* Centered Success Dialog Modal */}
      {toastMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm flex flex-col items-center p-6 text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />
            
            {/* Success Icon */}
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mt-2 mb-3 shadow-inner">
              <CheckCircle className="w-8 h-8 stroke-[2.2]" />
            </div>

            {/* Message Text */}
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Confirmação
            </h3>
            <p className="text-sm font-medium text-slate-600 max-w-xs leading-relaxed my-1">
              {toastMessage}
            </p>

            {/* Action button & Auto-close hint */}
            <div className="w-full pt-4 mt-3 border-t border-slate-100 flex flex-col items-center gap-2">
              <button
                onClick={() => setToastMessage(null)}
                style={{ backgroundColor: 'var(--color-primary, var(--color-primary))' }}
                className="w-full py-2.5 px-6 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                OK
              </button>
              
              <span className="text-[11px] text-slate-400 font-normal">
                A fechar automaticamente em 4 segundos...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{pageTitle}</h2>
              <p className="text-slate-500 mt-0.5 text-sm">{t('settings.subtitle')}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 active:bg-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                {t('settings.reset')}
              </button>
              
              <button
                onClick={() => setShowSaveModal(true)}
                style={{ backgroundColor: 'var(--color-primary, var(--color-primary))' }}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-85 hover:shadow-md active:opacity-100 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                {t('common.save')}
              </button>
            </div>
          </div>

          {/* 1. Identidade da Biblioteca */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
              <h3>{t('settings.identity')}</h3>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('settings.libraryName')}</label>
                <input
                  type="text"
                  value={formData.libraryName}
                  onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('settings.homeTitle')}</label>
                <input
                  type="text"
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  placeholder="Bem-vindo à Biblioteca Pessoal de Manuel Francisco"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('settings.subTitleLabel')}</label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  placeholder="A tua Biblioteca Pessoal na nuvem"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          </div>

          {/* 2. Menu de Navegação */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <MenuIcon className="w-5 h-5 text-[var(--color-primary)]" />
              <div>
                <h3>{t('settings.navMenu')}</h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  Personaliza os nomes dos itens do menu lateral.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('nav.dashboard')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('dashboard', formData.navLabels.dashboard) ? '' : formData.navLabels.dashboard}
                  placeholder={t('nav.dashboard')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, dashboard: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('nav.library')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('library', formData.navLabels.library) ? '' : formData.navLabels.library}
                  placeholder={t('nav.library')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, library: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('nav.addBook')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('add', formData.navLabels.add) ? '' : formData.navLabels.add}
                  placeholder={t('nav.addBook')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, add: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('nav.themes')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('themes', formData.navLabels.themes) ? '' : formData.navLabels.themes}
                  placeholder={t('nav.themes')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, themes: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('nav.borrowed')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('borrowed', formData.navLabels.borrowed) ? '' : formData.navLabels.borrowed}
                  placeholder={t('nav.borrowed')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, borrowed: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('nav.reports')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('reports', formData.navLabels.reports) ? '' : formData.navLabels.reports}
                  placeholder={t('nav.reports')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, reports: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('nav.trash')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('trash', formData.navLabels.trash) ? '' : formData.navLabels.trash}
                  placeholder={t('nav.trash')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, trash: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('settings.title')}</label>
                <input
                  type="text"
                  value={isDefaultNavLabel('settings', formData.navLabels.settings) ? '' : formData.navLabels.settings}
                  placeholder={t('nav.settings')}
                  onChange={(e) => setFormData({
                    ...formData,
                    navLabels: { ...formData.navLabels, settings: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          </div>

          {/* 3. Tema de Cores */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <Palette className="w-5 h-5 text-[var(--color-primary)]" />
              <h3>{t('settings.colorTheme')}</h3>
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
              <Type className="w-5 h-5 text-[var(--color-primary)]" />
              <h3>{t('settings.font')}</h3>
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
                        ? 'border-[var(--color-primary)] bg-blue-50/20 shadow-sm'
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
              <Download className="w-5 h-5 text-[var(--color-primary)]" />
              <div>
                <h3>{t('settings.exportBackup')}</h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  {t('settings.exportDesc')}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                {t('settings.exportBackupBtn')}
              </button>
            </div>
          </div>

          {/* 6. Importar Backup */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
              <Upload className="w-5 h-5 text-[var(--color-primary)]" />
              <div>
                <h3>{t('settings.importBackup')}</h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  {t('settings.importDesc')}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".xlsx,.xls,.json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                {t('settings.selectFile')}
              </button>
            </div>
          </div>

          {/* 7. Backup Automático (Google Drive) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
                <Cloud className="w-5 h-5 text-[var(--color-primary)]" />
                <div>
                  <h3>{t('settings.autoBackup')}</h3>
                  <p className="text-xs font-normal text-slate-400 mt-0.5">
                    {t('settings.autoBackupDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Account Status Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              {googleUser ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold overflow-hidden border border-emerald-200">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="Google Avatar" className="w-full h-full object-cover" />
                    ) : (
                      googleUser.email?.substring(0, 2).toUpperCase() || 'G'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('settings.googleConnected')}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">{googleUser.email}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <Cloud className="w-4 h-4 text-slate-400" />
                  <span>Conecte a sua conta Google para autorizar o envio de backups.</span>
                </div>
              )}

              {googleUser ? (
                <button
                  onClick={handleDisconnectGoogle}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('settings.disconnectGoogle')}
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t('settings.connectGoogle')}
                </button>
              )}
            </div>

            {/* Folder Destination Notice */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
              <Folder className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Pasta de Destino no Google Drive: </span>
                <span className="font-mono bg-blue-100/80 px-1.5 py-0.5 rounded text-[var(--color-primary)] font-semibold">{DRIVE_FOLDER_NAME}</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Todos os backups são guardados e geridos de forma organizada dentro da pasta <strong className="text-slate-700">{DRIVE_FOLDER_NAME}</strong> do seu Google Drive.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setShowAutoBackupModal(true)}
                disabled={isSyncingDrive}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                <Cloud className={`w-4 h-4 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                {t('settings.sendDriveNow')}
              </button>
            </div>
          </div>

          {/* 8. Histórico de Backups */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
                <History className="w-5 h-5 text-[var(--color-primary)]" />
                <h3>{t('settings.backupHistory')}</h3>
              </div>
              {backupHistory.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="text-xs text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showAllHistory ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {(showAllHistory ? backupHistory : backupHistory.slice(0, 5)).map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">{item.date}</span>
                      <p className="text-[11px] text-slate-400">{item.bookCount || books.length} {t('settings.booksFound')} · {item.type}</p>
                    </div>
                  </div>
                </div>
              ))}
              {backupHistory.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  Nenhum histórico de backup disponível.
                </div>
              )}
            </div>
          </div>

          {/* 9. Restaurar Backup da Drive */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
                <RefreshCw className="w-5 h-5 text-[var(--color-primary)]" />
                <h3>{t('settings.restoreDrive')}</h3>
              </div>
              <button 
                onClick={() => fetchDriveBackups()}
                disabled={isLoadingDriveFiles}
                className="text-xs text-[var(--color-primary)] font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
                {t('settings.refresh')}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {t('settings.restoreDriveDesc')}
            </p>

            {/* List of files found in Drive Folder */}
            {driveBackups.length > 0 ? (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ficheiros em Google Drive &gt; {DRIVE_FOLDER_NAME} (3 mais recentes):
                </div>
                {driveBackups.slice(0, 3).map((file) => (
                  <div key={file.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">{file.name}</span>
                        {file.createdTime && (
                          <div className="text-[11px] text-slate-400">
                            {new Date(file.createdTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreSpecificFile(file)}
                      disabled={isSyncingDrive}
                      className="px-3 py-1.5 rounded bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-[var(--color-primary)] font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
                    >
                      Restaurar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center gap-3">
                <span>{t('settings.noBackupFound')}</span>
                <button
                  onClick={() => setShowRestoreDriveModal(true)}
                  disabled={isSyncingDrive}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                  {t('settings.restoreDrive')}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4 text-[var(--color-primary)] mx-auto">
                <Save className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('settings.saveModalTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('settings.saveModalMsg')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmSave}
                style={{ backgroundColor: 'var(--color-primary, var(--color-primary))' }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 mb-4 text-orange-600 mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('settings.resetModalTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('settings.resetModalMsg')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmReset}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4 text-[var(--color-primary)] mx-auto">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('settings.exportModalTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('settings.exportModalMsg')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmExport}
                style={{ backgroundColor: 'var(--color-primary, var(--color-primary))' }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirmation Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4 text-[var(--color-primary)] mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('settings.importModalTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('settings.importModalMsg')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => { setShowImportModal(false); setPendingImportContent(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmImport}
                style={{ backgroundColor: 'var(--color-primary, var(--color-primary))' }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Backup Confirmation Modal */}
      {showAutoBackupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4 text-[var(--color-primary)] mx-auto">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('settings.autoBackupModalTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {t('settings.autoBackupModalMsg')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => setShowAutoBackupModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmAutoBackup}
                style={{ backgroundColor: 'var(--color-primary, var(--color-primary))' }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Drive Confirmation Modal */}
      {showRestoreDriveModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4 text-[var(--color-primary)] mx-auto">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {t('settings.restoreDriveModalTitle')}
              </h3>
              <p className="text-sm text-slate-500 text-center">
                {pendingRestoreFile 
                  ? `Tem a certeza que deseja restaurar a biblioteca a partir do ficheiro "${pendingRestoreFile.name}"? Os dados atuais serão substituídos pelo conteúdo deste backup.`
                  : t('settings.restoreDriveModalMsg')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button 
                onClick={() => { setShowRestoreDriveModal(false); setPendingRestoreFile(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmRestoreDrive}
                style={{ backgroundColor: 'var(--color-primary, var(--color-primary))' }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
