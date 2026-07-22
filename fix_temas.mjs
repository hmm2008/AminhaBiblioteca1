import fs from 'fs';
let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(/>Temas<\/label>/g, ">{t('nav.themes')}</label>");
fs.writeFileSync('src/components/SettingsView.tsx', settings);
