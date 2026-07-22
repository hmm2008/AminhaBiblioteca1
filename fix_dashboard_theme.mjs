import fs from 'fs';

let dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/<span>\{cat\.name\}<\/span>/g, "<span>{translateTheme(cat.name)}</span>");
dashboard = dashboard.replace(/\{cat\.name\}\n\s*<span/g, "{translateTheme(cat.name)}\n                  <span");
fs.writeFileSync('src/components/Dashboard.tsx', dashboard);
