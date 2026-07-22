import fs from 'fs';

let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
reports = reports.replace(/Nenhum livro para mostrar\./g, "{t('reports.noMatches')}");
fs.writeFileSync('src/components/ReportsView.tsx', reports);
