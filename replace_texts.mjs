import fs from 'fs';

let dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/const cat = book\.category \|\| 'Sem Categoria';/g, "const cat = book.category || t('dashboard.noCategory');");
fs.writeFileSync('src/components/Dashboard.tsx', dashboard);

let bookForm = fs.readFileSync('src/components/BookForm.tsx', 'utf8');
bookForm = bookForm.replace(/Fotografar ou carregar imagem do código de barras/g, "{t('bookForm.scanBarcode')}");
bookForm = bookForm.replace(/>Livro não encontrado online\.</g, ">{t('bookForm.bookNotFound')}<");
bookForm = bookForm.replace(/>Podes preencher os dados manualmente abaixo\.</g, ">{t('bookForm.fillManuallySub')}<");
bookForm = bookForm.replace(/>Preenche os campos manualmente\.</g, ">{t('bookForm.fillManually')}<");
bookForm = bookForm.replace(/>IDIOMA</g, ">{t('bookForm.languageLabel')}<");
bookForm = bookForm.replace(/>Selecione o idioma\.\.\.</g, ">{t('bookForm.languagePlaceholder')}<");
bookForm = bookForm.replace(/>LOCALIZAÇÃO NA PRATELEIRA</g, ">{t('bookForm.shelfLocation')}<");
bookForm = bookForm.replace(/>Selecionar tema\.\.\.</g, ">{t('bookForm.selectTheme')}<");
bookForm = bookForm.replace(/>\+ Nova Categoria</g, ">{t('bookForm.newCategory')}<");
bookForm = bookForm.replace(/>CAPA DO LIVRO</g, ">{t('bookForm.bookCover')}<");
bookForm = bookForm.replace(/>Colar imagem</g, ">{t('bookForm.pasteImage')}<");
bookForm = bookForm.replace(/>URL manual</g, ">{t('bookForm.manualUrl')}<");
bookForm = bookForm.replace(/>Pesquisar capas</g, ">{t('bookForm.searchCovers')}<");
bookForm = bookForm.replace(/>Sem capa</g, ">{t('bookForm.noCover')}<");
bookForm = bookForm.replace(/>NOTAS PESSOAIS</g, ">{t('bookForm.personalNotes')}<");
bookForm = bookForm.replace(/>Carregar</g, ">{t('bookForm.load')}<");
bookForm = bookForm.replace(/alert\("Por favor, insira o ISBN ou Título primeiro para pesquisar a capa no Google Imagens\."\);/g, "alert(t('bookForm.searchCoverAlert'));");
bookForm = bookForm.replace(/placeholder="Introduza o nome da nova categoria. Ela ficará disponível para futuras utilizações."/g, "placeholder={t('bookForm.newCategoryPrompt')}");
fs.writeFileSync('src/components/BookForm.tsx', bookForm);

let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
reports = reports.replace(/>Abre no Excel, Sheets\.\.\.</g, ">{t('reports.openInExcel')}<");
reports = reports.replace(/>Formato estruturado para programadores\.</g, ">{t('reports.structuredFormat')}<");
reports = reports.replace(/>Guarda como PDF\.\.\.</g, ">{t('reports.saveAsPdf')}<");
fs.writeFileSync('src/components/ReportsView.tsx', reports);

let themes = fs.readFileSync('src/components/ThemesView.tsx', 'utf8');
themes = themes.replace(/placeholder="Introduza o nome da nova categoria. Ela ficará disponível para futuras utilizações."/g, "placeholder={t('themes.newCategoryPrompt')}");
fs.writeFileSync('src/components/ThemesView.tsx', themes);

let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(/"Configurações guardadas com sucesso!"/g, "t('settings.saveSuccess')");
settings = settings.replace(/"Configurações repostas com sucesso!"/g, "t('settings.resetSuccess')");
settings = settings.replace(/"Biblioteca restaurada com sucesso!"/g, "t('settings.importSuccess')");
settings = settings.replace(/"O ficheiro selecionado é inválido ou está corrompido\."/g, "t('settings.invalidFile')");
settings = settings.replace(/"Backup verificado no Google Drive\."/g, "t('settings.driveVerified')");
settings = settings.replace(/>Configurações</g, ">{t('settings.title')}<");
settings = settings.replace(/>Personaliza a tua biblioteca\.</g, ">{t('settings.subtitle')}<");
settings = settings.replace(/>Repor Pré-Configurações</g, ">{t('settings.resetBtn')}<");
settings = settings.replace(/>Identidade da Biblioteca</g, ">{t('settings.identity')}<");
settings = settings.replace(/>Nome da Biblioteca</g, ">{t('settings.libraryName')}<");
settings = settings.replace(/>Mensagem de Boas-Vindas</g, ">{t('settings.welcomeMsg')}<");
settings = settings.replace(/>Menu de Navegação</g, ">{t('settings.navMenu')}<");
settings = settings.replace(/>Personaliza os nomes dos itens do menu lateral\.</g, ">{t('settings.navMenuDesc')}<");
settings = settings.replace(/>Tema de Cores</g, ">{t('settings.colorTheme')}<");
settings = settings.replace(/>Letra \(Fonte\)</g, ">{t('settings.font')}<");
settings = settings.replace(/>Exportar Backup</g, ">{t('settings.exportBackup')}<");
settings = settings.replace(/>Descarrega um ficheiro com toda a tua biblioteca\.</g, ">{t('settings.exportDesc')}<");
settings = settings.replace(/>Importar Backup</g, ">{t('settings.importBackup')}<");
settings = settings.replace(/>Restaura a biblioteca a partir de um ficheiro\.</g, ">{t('settings.importDesc')}<");
settings = settings.replace(/>Selecionar Ficheiro</g, ">{t('settings.selectFile')}<");
settings = settings.replace(/>Backup Automático \(Google Drive\)</g, ">{t('settings.autoBackup')}<");
settings = settings.replace(/>Sincroniza automaticamente um backup semanal para o Google Drive\.</g, ">{t('settings.autoBackupDesc')}<");
settings = settings.replace(/>Enviar para o Drive agora</g, ">{t('settings.sendDrive')}<");
settings = settings.replace(/>Histórico de Backups</g, ">{t('settings.backupHistory')}<");
settings = settings.replace(/>Restaurar da Drive</g, ">{t('settings.restoreDrive')}<");
settings = settings.replace(/>Restaura a tua biblioteca a partir de um backup no Google Drive\.</g, ">{t('settings.restoreDriveDesc')}<");
settings = settings.replace(/>Guardar Alterações</g, ">{t('settings.saveModalTitle')}<");
settings = settings.replace(/>Pretende guardar as novas configurações da sua biblioteca\?</g, ">{t('settings.saveModalMsg')}<");
settings = settings.replace(/>Repor Configurações</g, ">{t('settings.resetModalTitle')}<");
settings = settings.replace(/>Tem a certeza que deseja repor as configurações de fábrica\? Irá perder todas as personalizações de forma irreversível\.</g, ">{t('settings.resetModalMsg')}<");
settings = settings.replace(/>Cancelar</g, ">{t('common.cancel')}<");
settings = settings.replace(/>Guardar</g, ">{t('settings.saveBtn')}<");

fs.writeFileSync('src/components/SettingsView.tsx', settings);

let trash = fs.readFileSync('src/components/TrashView.tsx', 'utf8');
trash = trash.replace(/>Ações</g, ">{t('trash.actions')}<");
fs.writeFileSync('src/components/TrashView.tsx', trash);

