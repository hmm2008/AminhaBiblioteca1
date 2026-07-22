const fs = require('fs');
let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// Dashboard Additions
const ptDashboardAdd = `      noCategory: 'Sem categoria',`;
content = content.replace(/coverUnavailable: 'Capa Indisponível'/, `coverUnavailable: 'Capa Indisponível',\n${ptDashboardAdd}`);

const enDashboardAdd = `      noCategory: 'Uncategorized',`;
content = content.replace(/coverUnavailable: 'Cover Unavailable'/, `coverUnavailable: 'Cover Unavailable',\n${enDashboardAdd}`);

const frDashboardAdd = `      noCategory: 'Non classé',`;
content = content.replace(/coverUnavailable: 'Couverture indisponible'/, `coverUnavailable: 'Couverture indisponible',\n${frDashboardAdd}`);

// BookForm Additions
const ptBookFormAdd = `      scanBarcode: 'Fotografar ou carregar imagem do código de barras',
      bookNotFound: 'Livro não encontrado online.',
      fillManuallySub: 'Podes preencher os dados manualmente abaixo.',
      fillManually: 'Preenche os campos manualmente.',
      languageLabel: 'IDIOMA',
      languagePlaceholder: 'Selecione o idioma...',
      shelfLocation: 'LOCALIZAÇÃO NA PRATELEIRA',
      selectTheme: 'Selecionar tema...',
      newCategory: '+ Nova Categoria',
      bookCover: 'CAPA DO LIVRO',
      pasteImage: 'Colar imagem',
      manualUrl: 'URL manual',
      searchCovers: 'Pesquisar capas',
      noCover: 'Sem capa',
      personalNotes: 'NOTAS PESSOAIS',
      load: 'Carregar',
      searchCoverAlert: 'Por favor, insira o ISBN ou Título primeiro para pesquisar a capa no Google Imagens.',
      newCategoryPrompt: 'Introduza o nome da nova categoria. Ela ficará disponível para futuras utilizações.'`;
content = content.replace(/pages: 'Páginas'/, `pages: 'Páginas',\n${ptBookFormAdd}`);

const enBookFormAdd = `      scanBarcode: 'Scan or upload barcode image',
      bookNotFound: 'Book not found online.',
      fillManuallySub: 'You can fill in the details manually below.',
      fillManually: 'Fill in the fields manually.',
      languageLabel: 'LANGUAGE',
      languagePlaceholder: 'Select language...',
      shelfLocation: 'SHELF LOCATION',
      selectTheme: 'Select theme...',
      newCategory: '+ New Category',
      bookCover: 'BOOK COVER',
      pasteImage: 'Paste image',
      manualUrl: 'Manual URL',
      searchCovers: 'Search covers',
      noCover: 'No cover',
      personalNotes: 'PERSONAL NOTES',
      load: 'Load',
      searchCoverAlert: 'Please enter the ISBN or Title first to search for a cover on Google Images.',
      newCategoryPrompt: 'Enter the name of the new category. It will be available for future use.'`;
content = content.replace(/pages: 'Pages'/, `pages: 'Pages',\n${enBookFormAdd}`);

const frBookFormAdd = `      scanBarcode: 'Scanner ou télécharger une image de code-barres',
      bookNotFound: 'Livre introuvable en ligne.',
      fillManuallySub: 'Vous pouvez remplir les détails manuellement ci-dessous.',
      fillManually: 'Remplissez les champs manuellement.',
      languageLabel: 'LANGUE',
      languagePlaceholder: 'Sélectionner la langue...',
      shelfLocation: 'EMPLACEMENT SUR L\'ÉTAGÈRE',
      selectTheme: 'Sélectionner un thème...',
      newCategory: '+ Nouvelle catégorie',
      bookCover: 'COUVERTURE DU LIVRE',
      pasteImage: 'Coller l\\'image',
      manualUrl: 'URL manuelle',
      searchCovers: 'Rechercher des couvertures',
      noCover: 'Pas de couverture',
      personalNotes: 'NOTES PERSONNELLES',
      load: 'Charger',
      searchCoverAlert: 'Veuillez d\\'abord saisir l\\'ISBN ou le Titre pour rechercher une couverture sur Google Images.',
      newCategoryPrompt: 'Saisissez le nom de la nouvelle catégorie. Elle sera disponible pour une utilisation future.'`;
content = content.replace(/pages: 'Pages'/, `pages: 'Pages',\n${frBookFormAdd}`);

// Reports Additions
const ptReportsAdd = `      openInExcel: 'Abre no Excel, Sheets...',
      structuredFormat: 'Formato estruturado para programadores.',
      saveAsPdf: 'Guarda como PDF...',`;
content = content.replace(/completedReturns: 'Devoluções Concluídas'\n      }/, `completedReturns: 'Devoluções Concluídas'\n      },\n${ptReportsAdd}`);

const enReportsAdd = `      openInExcel: 'Opens in Excel, Sheets...',
      structuredFormat: 'Structured format for developers.',
      saveAsPdf: 'Save as PDF...',`;
content = content.replace(/completedReturns: 'Completed Returns'\n      }/, `completedReturns: 'Completed Returns'\n      },\n${enReportsAdd}`);

const frReportsAdd = `      openInExcel: 'S\\'ouvre dans Excel, Sheets...',
      structuredFormat: 'Format structuré pour les développeurs.',
      saveAsPdf: 'Enregistrer au format PDF...',`;
content = content.replace(/completedReturns: 'Retours terminés'\n      }/, `completedReturns: 'Retours terminés'\n      },\n${frReportsAdd}`);

fs.writeFileSync('src/i18n/translations.ts', content);
