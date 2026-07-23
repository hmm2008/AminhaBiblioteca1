import * as XLSX from 'xlsx';
import { LocalBook, AppSettings } from '../types';

export function exportToExcel(books: LocalBook[], themes: string[], settings: AppSettings) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Livros
  const booksData = books.map(book => ({
    ID: book.id,
    Título: book.title,
    Autor: book.author || '',
    Editora: book.publisher || '',
    'Data de Publicação': book.publishedDate || '',
    Páginas: book.pageCount || '',
    Categoria: book.category || '',
    Notas: book.notes || '',
    'Capa (URL)': book.coverImage || '',
    ISBN: book.isbn || '',
    'Data Adição': book.dateAdded || '',
    Estado: book.readStatus || '',
    Classificação: book.rating || '',
    Localização: book.shelfLocation || '',
    Idioma: book.language || '',
    Descrição: book.description || '',
    _rawJson: JSON.stringify(book)
  }));

  const wsBooks = XLSX.utils.json_to_sheet(booksData);
  XLSX.utils.book_append_sheet(wb, wsBooks, 'Livros');

  // Sheet 2: Temas (Categorias)
  const themesData = themes.map(t => ({ Tema: t }));
  const wsThemes = XLSX.utils.json_to_sheet(themesData);
  XLSX.utils.book_append_sheet(wb, wsThemes, 'Temas');

  // Sheet 3: Configurações
  const settingsData = Object.entries(settings).map(([k, v]) => ({
    Chave: k,
    Valor: typeof v === 'object' ? JSON.stringify(v) : String(v)
  }));
  const wsSettings = XLSX.utils.json_to_sheet(settingsData);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Configurações');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `biblioteca_backup_${dateStr}.xlsx`);
}

export function parseExcelBackup(buffer: ArrayBuffer): { books: LocalBook[]; themes?: string[]; settings?: Partial<AppSettings> } {
  const wb = XLSX.read(buffer, { type: 'array' });

  const books: LocalBook[] = [];
  let themes: string[] | undefined = undefined;
  let settings: Partial<AppSettings> | undefined = undefined;

  // Read Livros sheet
  const sheetNameLivros = wb.SheetNames.find(s => s.toLowerCase().includes('livro') || s.toLowerCase().includes('book')) || wb.SheetNames[0];
  if (sheetNameLivros) {
    const ws = wb.Sheets[sheetNameLivros];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);

    for (const row of rows) {
      if (row._rawJson) {
        try {
          const parsed = JSON.parse(row._rawJson);
          if (parsed && parsed.id && parsed.title) {
            books.push(parsed as LocalBook);
            continue;
          }
        } catch {
          // Fallback to row mapping
        }
      }

      const title = row['Título'] || row['Title'] || row['title'] || row['NOME'] || row['Nome'];
      if (!title) continue;

      const id = row['ID'] || row['id'] || String(Date.now() + Math.random());
      const author = row['Autor'] || row['Author'] || row['author'] || '';
      const publisher = row['Editora'] || row['Publisher'] || row['publisher'] || '';
      const publishedDate = String(row['Data de Publicação'] || row['publishedDate'] || row['Ano'] || row['year'] || '');
      const pageCount = row['Páginas'] || row['pageCount'] || '';
      const category = row['Categoria'] || row['Tema'] || row['category'] || 'Outros';
      const notes = row['Notas'] || row['Notes'] || row['notes'] || '';
      const coverImage = row['Capa (URL)'] || row['Capa'] || row['coverImage'] || '';
      const isbn = String(row['ISBN'] || row['isbn'] || '');
      const dateAdded = row['Data Adição'] || row['dateAdded'] || new Date().toISOString();
      const readStatus = row['Estado'] || row['readStatus'] || 'Não Lido';
      const rating = Number(row['Classificação'] || row['rating']) || 0;
      const shelfLocation = row['Localização'] || row['shelfLocation'] || '';
      const language = row['Idioma'] || row['language'] || '';
      const description = row['Descrição'] || row['description'] || row['Sinopse'] || '';

      books.push({
        id: String(id),
        title: String(title),
        author: String(author),
        publisher: String(publisher),
        publishedDate,
        pageCount,
        category: String(category),
        notes: String(notes),
        coverImage: String(coverImage),
        isbn,
        dateAdded: String(dateAdded),
        readStatus: readStatus as any,
        rating,
        shelfLocation: String(shelfLocation),
        language: String(language),
        description: String(description),
        syncStatus: 'pending'
      });
    }
  }

  // Read Temas sheet if present
  const sheetNameTemas = wb.SheetNames.find(s => s.toLowerCase().includes('tema') || s.toLowerCase().includes('categoria'));
  if (sheetNameTemas) {
    const ws = wb.Sheets[sheetNameTemas];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);
    const loadedThemes = rows.map(r => r['Tema'] || r['Categoria'] || r['tema']).filter(Boolean);
    if (loadedThemes.length > 0) {
      themes = loadedThemes;
    }
  }

  return { books, themes, settings };
}
