import fs from 'fs';

// ReportsView.tsx
let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
reports = reports.replace(/Exportar CSV/g, "{t('reports.exportCsv')}");
reports = reports.replace(/Exportar JSON/g, "{t('reports.exportJson')}");
reports = reports.replace(/Exportar PDF/g, "{t('reports.exportPdf')}");
reports = reports.replace(/Exportar para /g, "{t('reports.exportTo')} ");
fs.writeFileSync('src/components/ReportsView.tsx', reports);

// SettingsView.tsx
let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(/>\s*Nome da Biblioteca\s*<\/label>/g, ">{t('settings.libraryName')}</label>");
settings = settings.replace(/>\s*Mensagem de Boas-Vindas\s*<\/label>/g, ">{t('settings.welcomeMsg')}</label>");
settings = settings.replace(/>\s*Início\s*<\/label>/g, ">{t('nav.dashboard')}</label>");
settings = settings.replace(/>\s*Biblioteca\s*<\/label>/g, ">{t('nav.library')}</label>");
settings = settings.replace(/>\s*Adicionar Livro\s*<\/label>/g, ">{t('nav.addBook')}</label>");
settings = settings.replace(/>\s*Temas e Categorias\s*<\/label>/g, ">{t('nav.themes')}</label>");
settings = settings.replace(/>\s*Emprestados\s*<\/label>/g, ">{t('nav.borrowed')}</label>");
settings = settings.replace(/>\s*Relatórios\s*<\/label>/g, ">{t('nav.reports')}</label>");
settings = settings.replace(/>\s*Configurações\s*<\/label>/g, ">{t('nav.settings')}</label>");
fs.writeFileSync('src/components/SettingsView.tsx', settings);

// BookForm.tsx - Pesquisa Online
let bookForm = fs.readFileSync('src/components/BookForm.tsx', 'utf8');
bookForm = bookForm.replace(/Pesquisa Online/g, "{t('bookForm.onlineSearch')}");
fs.writeFileSync('src/components/BookForm.tsx', bookForm);

