import fs from 'fs';

let content = fs.readFileSync('src/i18n/LanguageContext.tsx', 'utf8');

if (!content.includes('const translateTheme = (theme: string) => {')) {
  content = content.replace(
    /return key;\n  };\n\n  return \(/g,
    `return key;\n  };\n\n  const translateTheme = (theme: string) => {\n    const translated = t(\`themes.list.\${theme}\`);\n    return translated !== \`themes.list.\${theme}\` ? translated : theme;\n  };\n\n  return (`
  );
}

content = content.replace(
  /value=\{\{\s*language,\s*setLanguage,\s*t\s*\}\}/g,
  "value={{ language, setLanguage, t, translateTheme }}"
);

fs.writeFileSync('src/i18n/LanguageContext.tsx', content);
