import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const ptReports = `      structuredFormat: 'Formato estruturado para programadores',`;
const enReports = `      structuredFormat: 'Structured format for developers',`;
const frReports = `      structuredFormat: 'Format structuré pour les développeurs',`;

content = content.replace(/exportTo: 'Exportar para',\n/g, "exportTo: 'Exportar para',\n" + ptReports + "\n");
content = content.replace(/exportTo: 'Export to',\n/g, "exportTo: 'Export to',\n" + enReports + "\n");
content = content.replace(/exportTo: 'Exporter vers',\n/g, "exportTo: 'Exporter vers',\n" + frReports + "\n");

fs.writeFileSync('src/i18n/translations.ts', content);
