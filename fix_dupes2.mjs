import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// I'll just find and remove the exact duplicate keys in settings & reports if they were already there.
// Actually, I'll just remove the ones I added recently or fix the keys.
// The errors say: Duplicate key "structuredFormat" in object literal, etc.
content = content.replace(/      structuredFormat: 'Formato estruturado para programadores',\n/g, "");
content = content.replace(/      structuredFormat: 'Structured format for developers',\n/g, "");
content = content.replace(/      structuredFormat: 'Format structuré pour les développeurs',\n/g, "");

content = content.replace(/      selectFile: 'Selecionar Ficheiro',\n/g, "");
content = content.replace(/      sendDriveNow: 'Enviar para o Drive agora',\n/g, "");

content = content.replace(/      selectFile: 'Select File',\n/g, "");
content = content.replace(/      sendDriveNow: 'Send to Drive now',\n/g, "");

content = content.replace(/      selectFile: 'Sélectionner un fichier',\n/g, "");
content = content.replace(/      sendDriveNow: 'Envoyer sur Drive maintenant',\n/g, "");

fs.writeFileSync('src/i18n/translations.ts', content);
