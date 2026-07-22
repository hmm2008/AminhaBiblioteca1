import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const ptSettings = `      exportBackupBtn: 'Exportar Backup',
      selectFile: 'Selecionar Ficheiro',
      sendDriveNow: 'Enviar para o Drive agora',
      booksFound: 'livros encontrados',
      refresh: 'Atualizar',
      noBackupFound: 'Nenhum backup encontrado no Drive.',`;

const enSettings = `      exportBackupBtn: 'Export Backup',
      selectFile: 'Select File',
      sendDriveNow: 'Send to Drive now',
      booksFound: 'books found',
      refresh: 'Refresh',
      noBackupFound: 'No backup found on Drive.',`;

const frSettings = `      exportBackupBtn: 'Exporter la sauvegarde',
      selectFile: 'Sélectionner un fichier',
      sendDriveNow: 'Envoyer sur Drive maintenant',
      booksFound: 'livres trouvés',
      refresh: 'Actualiser',
      noBackupFound: 'Aucune sauvegarde trouvée sur Drive.',`;

content = content.replace(/restoreDriveDesc: 'Restaura a tua biblioteca a partir de um backup no Google Drive\.',\n/g, "restoreDriveDesc: 'Restaura a tua biblioteca a partir de um backup no Google Drive.',\n" + ptSettings + "\n");
content = content.replace(/restoreDriveDesc: 'Restore your library from a Google Drive backup\.',\n/g, "restoreDriveDesc: 'Restore your library from a Google Drive backup.',\n" + enSettings + "\n");
content = content.replace(/restoreDriveDesc: 'Restaurez votre bibliothèque à partir d\\'une sauvegarde Google Drive\.',\n/g, "restoreDriveDesc: 'Restaurez votre bibliothèque à partir d\\'une sauvegarde Google Drive.',\n" + frSettings + "\n");

const ptReports = `      structuredFormat: 'Formato estruturado para programadores',`;
const enReports = `      structuredFormat: 'Structured format for developers',`;
const frReports = `      structuredFormat: 'Format structuré pour les développeurs',`;

content = content.replace(/pdfInstructions: 'Guarda como PDF/g, `${ptReports}\n      pdfInstructions: 'Guarda como PDF`);
content = content.replace(/pdfInstructions: 'Save as PDF/g, `${enReports}\n      pdfInstructions: 'Save as PDF`);
content = content.replace(/pdfInstructions: 'Enregistrer en PDF/g, `${frReports}\n      pdfInstructions: 'Enregistrer en PDF`);

const ptSidebar = `      sync: 'Sincronizar',`;
const enSidebar = `      sync: 'Sync',`;
const frSidebar = `      sync: 'Synchroniser',`;

content = content.replace(/syncJustNow: 'Sincronizado há pouco',\n/g, "syncJustNow: 'Sincronizado há pouco',\n" + ptSidebar + "\n");
content = content.replace(/syncJustNow: 'Synced just now',\n/g, "syncJustNow: 'Synced just now',\n" + enSidebar + "\n");
content = content.replace(/syncJustNow: 'Synchronisé à l\\'instant',\n/g, "syncJustNow: 'Synchronisé à l\\'instant',\n" + frSidebar + "\n");

fs.writeFileSync('src/i18n/translations.ts', content);
