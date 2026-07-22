import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const ptSettings = `      selectFile: 'Selecionar Ficheiro',
      sendDriveNow: 'Enviar para o Drive agora',`;
const enSettings = `      selectFile: 'Select File',
      sendDriveNow: 'Send to Drive now',`;
const frSettings = `      selectFile: 'Sélectionner un fichier',
      sendDriveNow: 'Envoyer sur Drive maintenant',`;

content = content.replace(/driveVerified: 'Backup verificado no Google Drive\.',\n/g, "driveVerified: 'Backup verificado no Google Drive.',\n" + ptSettings + "\n");
content = content.replace(/driveVerified: 'Backup verified in Google Drive\.',\n/g, "driveVerified: 'Backup verified in Google Drive.',\n" + enSettings + "\n");
content = content.replace(/driveVerified: 'Sauvegarde vérifiée dans Google Drive\.',\n/g, "driveVerified: 'Sauvegarde vérifiée dans Google Drive.',\n" + frSettings + "\n");

fs.writeFileSync('src/i18n/translations.ts', content);
