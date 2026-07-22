import fs from 'fs';

let themes = fs.readFileSync('src/components/ThemesView.tsx', 'utf8');

themes = themes.replace(/t\('themes.emptyState'\)/g, "t('themes.noThemes')");
themes = themes.replace(/t\('themes.deleteTheme'\)/g, "t('themes.deleteTitle')");
themes = themes.replace(/t\('themes.deleteConfirm'\)\.replace\('\{theme\}', themeToDelete\)/g, "t('themes.deleteMessage').replace('{theme}', themeToDelete)");
themes = themes.replace(/t\('themes\.viewBooks'\)\.replace\('\{count\}', bookCount\.toString\(\)\)/g, "(bookCount === 1 ? '1 livro' : `${bookCount} livros`)"); // simple fix for now, since it wasn't there

fs.writeFileSync('src/components/ThemesView.tsx', themes);

