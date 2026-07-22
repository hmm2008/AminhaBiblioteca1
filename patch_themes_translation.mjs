import fs from 'fs';

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const ptThemesList = `      list: {
        'Autoajuda': 'Autoajuda',
        'Ciência Política': 'Ciência Política',
        'Cooking (Natural foods)': 'Culinária (Alimentos naturais)',
        'Culinária': 'Culinária',
        'Desenvolvimento pessoal': 'Desenvolvimento pessoal',
        'Economia/Gestão': 'Economia/Gestão',
        'Enfermagem': 'Enfermagem',
        'Escolar': 'Escolar',
        'Farmácia': 'Farmácia',
        'Filosofia': 'Filosofia',
        'Gestão': 'Gestão',
        'Health & Fitness': 'Saúde & Fitness',
        'História': 'História',
        'Literatura': 'Literatura',
        'Medicina': 'Medicina',
        'Outros': 'Outros',
        'Religião': 'Religião',
        'Rich people': 'Pessoas Ricas',
        'Saúde e Nutrição': 'Saúde e Nutrição',
        'Tecnologia': 'Tecnologia'
      }`;

const enThemesList = `      list: {
        'Autoajuda': 'Self-Help',
        'Ciência Política': 'Political Science',
        'Cooking (Natural foods)': 'Cooking (Natural foods)',
        'Culinária': 'Cooking',
        'Desenvolvimento pessoal': 'Personal Development',
        'Economia/Gestão': 'Economics/Management',
        'Enfermagem': 'Nursing',
        'Escolar': 'School',
        'Farmácia': 'Pharmacy',
        'Filosofia': 'Philosophy',
        'Gestão': 'Management',
        'Health & Fitness': 'Health & Fitness',
        'História': 'History',
        'Literatura': 'Literature',
        'Medicina': 'Medicine',
        'Outros': 'Others',
        'Religião': 'Religion',
        'Rich people': 'Rich people',
        'Saúde e Nutrição': 'Health & Nutrition',
        'Tecnologia': 'Technology'
      }`;

const frThemesList = `      list: {
        'Autoajuda': 'Développement personnel',
        'Ciência Política': 'Science Politique',
        'Cooking (Natural foods)': 'Cuisine (Aliments naturels)',
        'Culinária': 'Cuisine',
        'Desenvolvimento pessoal': 'Développement personnel',
        'Economia/Gestão': 'Économie/Gestion',
        'Enfermagem': 'Infirmerie',
        'Escolar': 'Scolaire',
        'Farmácia': 'Pharmacie',
        'Filosofia': 'Philosophie',
        'Gestão': 'Gestion',
        'Health & Fitness': 'Santé et Forme',
        'História': 'Histoire',
        'Literatura': 'Littérature',
        'Medicina': 'Médecine',
        'Outros': 'Autres',
        'Religião': 'Religion',
        'Rich people': 'Personnes riches',
        'Saúde e Nutrição': 'Santé et Nutrition',
        'Tecnologia': 'Technologie'
      }`;

content = content.replace(/themes: \{/, `themes: {\n${ptThemesList},`);
// The second match will be for EN
let indexEN = content.indexOf('themes: {', content.indexOf('en: {'));
if (indexEN !== -1) {
  content = content.slice(0, indexEN) + `themes: {\n${enThemesList},` + content.slice(indexEN + 'themes: {'.length);
}

// The third match will be for FR
let indexFR = content.indexOf('themes: {', content.indexOf('fr: {'));
if (indexFR !== -1) {
  content = content.slice(0, indexFR) + `themes: {\n${frThemesList},` + content.slice(indexFR + 'themes: {'.length);
}

fs.writeFileSync('src/i18n/translations.ts', content);

let context = fs.readFileSync('src/i18n/LanguageContext.tsx', 'utf8');
context = context.replace(
  /t: \(key: string, params\?: Record<string, any>\) => string;/g,
  `t: (key: string, params?: Record<string, any>) => string;\n  translateTheme: (theme: string) => string;`
);

context = context.replace(
  /return result \|\| key;\n  };\n\n  return \(/g,
  `return result || key;\n  };\n\n  const translateTheme = (theme: string) => {\n    const translated = t(\`themes.list.\${theme}\`);\n    return translated !== \`themes.list.\${theme}\` ? translated : theme;\n  };\n\n  return (`
);

context = context.replace(
  /value=\{\{\n\s*language,\n\s*setLanguage,\n\s*t\n\s*\}\}/g,
  `value={{\n        language,\n        setLanguage,\n        t,\n        translateTheme\n      }}`
);
fs.writeFileSync('src/i18n/LanguageContext.tsx', context);

