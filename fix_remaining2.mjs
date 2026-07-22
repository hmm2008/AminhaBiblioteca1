import fs from 'fs';

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/title=\{\`Sincronizado há \$\{lastSync \? timeSince\(lastSync\) : 'pouco'\}\`\}/g, "title={lastSync ? t('sidebar.syncAgo').replace('{time}', timeSince(lastSync)) : t('sidebar.syncJustNow')}");
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let bookForm = fs.readFileSync('src/components/BookForm.tsx', 'utf8');
bookForm = bookForm.replace(/>Português<\/option>/g, ">{t('bookForm.langPt')}</option>");
bookForm = bookForm.replace(/>Inglês<\/option>/g, ">{t('bookForm.langEn')}</option>");
bookForm = bookForm.replace(/>Francês<\/option>/g, ">{t('bookForm.langFr')}</option>");
fs.writeFileSync('src/components/BookForm.tsx', bookForm);

let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
reports = reports.replace(/const headers = \['Título', 'Autor', 'Tema', 'Estado', 'Estado de leitura', 'Ano', 'ISBN'\];/g, "const headers = [t('library.title'), t('library.author'), t('common.category'), t('reports.statusCol'), t('bookForm.readStatus'), t('bookForm.publishYear'), 'ISBN'];");
reports = reports.replace(/>Título<\/th>/g, ">{t('library.title')}</th>");
reports = reports.replace(/>Autor<\/th>/g, ">{t('library.author')}</th>");
reports = reports.replace(/>Tema<\/th>/g, ">{t('common.category')}</th>");
reports = reports.replace(/>Estado<\/th>/g, ">{t('reports.statusCol')}</th>");
reports = reports.replace(/\{book\.status \|\| 'Disponível'\}/g, "{book.status === 'Emprestado' ? t('common.bookStatus.borrowed') : book.status === 'Extraviado' ? t('common.bookStatus.lost') : t('common.bookStatus.available')}");
fs.writeFileSync('src/components/ReportsView.tsx', reports);
