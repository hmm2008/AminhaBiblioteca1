import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const ptAdds = `      pdfInstructions: 'Guarda como PDF (escolhe "Guardar como PDF" na impressão)',
      pdfPreview: 'Pré-visualização do Relatório em PDF',
      libraryReport: 'Relatório da Biblioteca',
      totalReportBooks: 'Total de livros no relatório',
      exportConfirm: 'Tem a certeza que deseja gravar a exportação com {count} livro(s)?',`;

const enAdds = `      pdfInstructions: 'Save as PDF (choose "Save as PDF" when printing)',
      pdfPreview: 'PDF Report Preview',
      libraryReport: 'Library Report',
      totalReportBooks: 'Total books in report',
      exportConfirm: 'Are you sure you want to save the export with {count} book(s)?',`;

const frAdds = `      pdfInstructions: 'Enregistrer en PDF (choisissez "Enregistrer en PDF" lors de l\\'impression)',
      pdfPreview: 'Aperçu du rapport PDF',
      libraryReport: 'Rapport de la bibliothèque',
      totalReportBooks: 'Nombre total de livres dans le rapport',
      exportConfirm: 'Êtes-vous sûr de vouloir enregistrer l\\'exportation avec {count} livre(s) ?',`;

content = content.replace(/saveAsPdf: 'Guarda como PDF\.\.\.',/, `saveAsPdf: 'Guarda como PDF...',\n${ptAdds}`);
content = content.replace(/saveAsPdf: 'Save as PDF\.\.\.',/, `saveAsPdf: 'Save as PDF...',\n${enAdds}`);
content = content.replace(/saveAsPdf: 'Enregistrer au format PDF\.\.\.',/, `saveAsPdf: 'Enregistrer au format PDF...',\n${frAdds}`);

fs.writeFileSync('src/i18n/translations.ts', content);
