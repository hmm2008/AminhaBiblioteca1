import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const ptAddsReport = `      exportCsv: 'Exportar CSV',
      exportJson: 'Exportar JSON',
      exportPdf: 'Exportar PDF',
      exportTo: 'Exportar para',`;

const enAddsReport = `      exportCsv: 'Export CSV',
      exportJson: 'Export JSON',
      exportPdf: 'Export PDF',
      exportTo: 'Export to',`;

const frAddsReport = `      exportCsv: 'Exporter CSV',
      exportJson: 'Exporter JSON',
      exportPdf: 'Exporter PDF',
      exportTo: 'Exporter vers',`;

content = content.replace(/pdfInstructions: 'Guarda como PDF/g, `${ptAddsReport}\n      pdfInstructions: 'Guarda como PDF`);
content = content.replace(/pdfInstructions: 'Save as PDF/g, `${enAddsReport}\n      pdfInstructions: 'Save as PDF`);
content = content.replace(/pdfInstructions: 'Enregistrer en PDF/g, `${frAddsReport}\n      pdfInstructions: 'Enregistrer en PDF`);

const ptAddsBook = `      onlineSearch: 'Pesquisa Online',`;
const enAddsBook = `      onlineSearch: 'Online Search',`;
const frAddsBook = `      onlineSearch: 'Recherche en ligne',`;

content = content.replace(/scanBarcode: 'Fotografar/g, `${ptAddsBook}\n      scanBarcode: 'Fotografar`);
content = content.replace(/scanBarcode: 'Scan or/g, `${enAddsBook}\n      scanBarcode: 'Scan or`);
content = content.replace(/scanBarcode: 'Scanner/g, `${frAddsBook}\n      scanBarcode: 'Scanner`);

fs.writeFileSync('src/i18n/translations.ts', content);
