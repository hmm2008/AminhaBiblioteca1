import fs from 'fs';

// SettingsView.tsx
let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(/Descarrega um ficheiro com toda a tua biblioteca\./g, "{t('settings.exportDesc')}");
settings = settings.replace(/>\s*Exportar Backup\s*<\/button>/g, ">\\n                <Download className=\"w-4 h-4\" />\\n                {t('settings.exportBackupBtn')}\\n              </button>");
settings = settings.replace(/Restaura a biblioteca a partir de um ficheiro\./g, "{t('settings.importDesc')}");
settings = settings.replace(/Selecionar Ficheiro/g, "{t('settings.selectFile')}");
settings = settings.replace(/Sincroniza automaticamente um backup semanal para o Google Drive\./g, "{t('settings.autoBackupDesc')}");
settings = settings.replace(/Enviar para o Drive agora/g, "{t('settings.sendDriveNow')}");
settings = settings.replace(/livros encontrados/g, "{t('settings.booksFound')}");
settings = settings.replace(/#Atualizar/g, "#{t('settings.refresh')}");
settings = settings.replace(/Restaura a tua biblioteca a partir de um backup no Google Drive\./g, "{t('settings.restoreDriveDesc')}");
settings = settings.replace(/Nenhum backup encontrado no Drive\./g, "{t('settings.noBackupFound')}");
fs.writeFileSync('src/components/SettingsView.tsx', settings);

// Sidebar.tsx
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/Sincronizar\n\s*<\/span>/g, "{t('sidebar.sync')}\n            </span>");
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

// ReportsView.tsx
let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
reports = reports.replace(/Formato estruturado para programadores/g, "{t('reports.structuredFormat')}");
fs.writeFileSync('src/components/ReportsView.tsx', reports);
