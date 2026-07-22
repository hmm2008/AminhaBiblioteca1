import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// The error messages say:
// Duplicate key "structuredFormat" in object literal
// Duplicate key "selectFile" in object literal

// Let's remove the older ones or the newly added ones. Actually, the newly added ones were in "settings" and "reports".
// Let's just remove the ones that are already there.
content = content.replace(/      structuredFormat: 'Formato estruturado para programadores\.',\n/g, "");
content = content.replace(/      selectFile: 'Selecionar Ficheiro',\n/g, "");
content = content.replace(/      sendDrive: 'Enviar para o Drive agora',\n/g, "");

content = content.replace(/      structuredFormat: 'Structured format for developers\.',\n/g, "");
content = content.replace(/      selectFile: 'Select File',\n/g, "");
content = content.replace(/      sendDrive: 'Send to Drive now',\n/g, "");

content = content.replace(/      structuredFormat: 'Format structuré pour les développeurs\.',\n/g, "");
content = content.replace(/      selectFile: 'Sélectionner un fichier',\n/g, "");
content = content.replace(/      sendDrive: 'Envoyer sur Drive maintenant',\n/g, "");

fs.writeFileSync('src/i18n/translations.ts', content);
