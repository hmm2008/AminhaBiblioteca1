import fs from 'fs';
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const ptAdds = `      syncAgo: 'Sincronizado há {time}',
      syncJustNow: 'Sincronizado há pouco',`;
const enAdds = `      syncAgo: 'Synced {time} ago',
      syncJustNow: 'Synced just now',`;
const frAdds = `      syncAgo: 'Synchronisé il y a {time}',
      syncJustNow: 'Synchronisé à l\\'instant',`;

content = content.replace(/library: 'Biblioteca',\n/, `library: 'Biblioteca',\n${ptAdds}\n`);
content = content.replace(/library: 'Library',\n/, `library: 'Library',\n${enAdds}\n`);
content = content.replace(/library: 'Bibliothèque',\n/, `library: 'Bibliothèque',\n${frAdds}\n`);

const ptBookForm = `      langPt: 'Português',
      langEn: 'Inglês',
      langFr: 'Francês',`;
const enBookForm = `      langPt: 'Portuguese',
      langEn: 'English',
      langFr: 'French',`;
const frBookForm = `      langPt: 'Portugais',
      langEn: 'Anglais',
      langFr: 'Français',`;

content = content.replace(/onlineSearch: 'Pesquisa Online'\n/, `onlineSearch: 'Pesquisa Online',\n${ptBookForm}\n`);
content = content.replace(/onlineSearch: 'Online Search'\n/, `onlineSearch: 'Online Search',\n${enBookForm}\n`);
content = content.replace(/onlineSearch: 'Recherche en ligne'\n/, `onlineSearch: 'Recherche en ligne',\n${frBookForm}\n`);

const ptReports = `      statusCol: 'Estado',`;
const enReports = `      statusCol: 'Status',`;
const frReports = `      statusCol: 'Statut',`;

content = content.replace(/exportTo: 'Exportar para',\n/, `exportTo: 'Exportar para',\n${ptReports}\n`);
content = content.replace(/exportTo: 'Export to',\n/, `exportTo: 'Export to',\n${enReports}\n`);
content = content.replace(/exportTo: 'Exporter vers',\n/, `exportTo: 'Exporter vers',\n${frReports}\n`);

fs.writeFileSync('src/i18n/translations.ts', content);
