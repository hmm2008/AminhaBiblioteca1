import fs from 'fs';

// BookForm.tsx
let bookForm = fs.readFileSync('src/components/BookForm.tsx', 'utf8');
bookForm = bookForm.replace(/const { t } = useTranslation\(\);/g, "const { t, translateTheme } = useTranslation();");
bookForm = bookForm.replace(/<option key=\{theme\} value=\{theme\}>\{theme\}<\/option>/g, "<option key={theme} value={theme}>{translateTheme(theme)}</option>");
fs.writeFileSync('src/components/BookForm.tsx', bookForm);

// ThemesView.tsx
let themes = fs.readFileSync('src/components/ThemesView.tsx', 'utf8');
themes = themes.replace(/const { t } = useTranslation\(\);/g, "const { t, translateTheme } = useTranslation();");
themes = themes.replace(/<h3 className="font-bold text-slate-800 text-lg">\{theme\}<\/h3>/g, `<h3 className="font-bold text-slate-800 text-lg">{translateTheme(theme)}</h3>`);
fs.writeFileSync('src/components/ThemesView.tsx', themes);

// Dashboard.tsx
let dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/const { t } = useTranslation\(\);/g, "const { t, translateTheme } = useTranslation();");
dashboard = dashboard.replace(/<span className="font-medium text-slate-700 truncate block">\{cat\.name\}<\/span>/g, '<span className="font-medium text-slate-700 truncate block">{translateTheme(cat.name)}</span>');
fs.writeFileSync('src/components/Dashboard.tsx', dashboard);

// ReportsView.tsx
let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
reports = reports.replace(/const { t } = useTranslation\(\);/g, "const { t, translateTheme } = useTranslation();");
reports = reports.replace(/<span className="font-medium text-slate-700">\{stat\.theme\}<\/span>/g, '<span className="font-medium text-slate-700">{translateTheme(stat.theme)}</span>');
// And inside the table
reports = reports.replace(/<td className="px-6 py-4 text-slate-600">\{book\.category\}<\/td>/g, '<td className="px-6 py-4 text-slate-600">{translateTheme(book.category || "")}</td>');
reports = reports.replace(/<td className="px-4 py-3">\{book\.category\}<\/td>/g, '<td className="px-4 py-3">{translateTheme(book.category || "")}</td>');
fs.writeFileSync('src/components/ReportsView.tsx', reports);

// LibraryView.tsx
let library = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');
library = library.replace(/const { t } = useTranslation\(\);/g, "const { t, translateTheme } = useTranslation();");
library = library.replace(/<option key=\{cat\} value=\{cat\}>\{cat === 'Todos os temas' \? t\('library\.allThemes'\) : cat\}<\/option>/g, "<option key={cat} value={cat}>{cat === 'Todos os temas' ? t('library.allThemes') : translateTheme(cat)}</option>");
// Inside BookCard
library = library.replace(/\{book\.category \|\| t\('common\.category'\)\}/g, "{translateTheme(book.category || '') || t('common.category')}");
fs.writeFileSync('src/components/LibraryView.tsx', library);

