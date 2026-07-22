import fs from 'fs';

let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(/label: 'Azul \(Padrão\)'/g, "label: t('settings.colors.blue')");
settings = settings.replace(/label: 'Verde'/g, "label: t('settings.colors.green')");
settings = settings.replace(/label: 'Roxo'/g, "label: t('settings.colors.purple')");
settings = settings.replace(/label: 'Vermelho'/g, "label: t('settings.colors.red')");
settings = settings.replace(/label: 'Laranja'/g, "label: t('settings.colors.orange')");
settings = settings.replace(/label: 'Teal'/g, "label: t('settings.colors.teal')");
settings = settings.replace(/name: 'Inter \(Padrão\)'/g, "name: t('settings.fonts.inter')");
settings = settings.replace(/name: 'Georgia \(Serifada\)'/g, "name: t('settings.fonts.georgia')");
settings = settings.replace(/name: 'Mono'/g, "name: t('settings.fonts.mono')");
settings = settings.replace(/name: 'Nunito \(Arredondada\)'/g, "name: t('settings.fonts.nunito')");
fs.writeFileSync('src/components/SettingsView.tsx', settings);

let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
reports = reports.replace(/Guarda como PDF \(escolhe 'Guardar como PDF' na impressão\)/g, "{t('reports.pdfInstructions')}");
reports = reports.replace(/Pré-visualização do Relatório em PDF/g, "{t('reports.pdfPreview')}");
reports = reports.replace(/Relatório da Biblioteca/g, "{t('reports.libraryReport')}");
reports = reports.replace(/Total de livros no relatório/g, "{t('reports.totalReportBooks')}");
reports = reports.replace(/Tem a certeza que deseja gravar a exportação com \{filteredBooks\.length\} livro\(s\)\?/g, "{t('reports.exportConfirm', { count: filteredBooks.length })}");
fs.writeFileSync('src/components/ReportsView.tsx', reports);
