import { Book, LocalBook } from '../types';
import { getPendingBooks, getDeletedBooks, saveBook, hardDeleteBook, getAllBooks } from './db';

const API_URL = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || import.meta.env.VITE_SYNC_API_URL || '').trim();
const AUTH_TOKEN = (import.meta.env.VITE_SYNC_AUTH_TOKEN || "seu_token_secreto_aqui").trim();

const isApiConfigured = () => !!API_URL;

export async function syncBooks(): Promise<void> {
  if (!isApiConfigured()) {
    throw new Error('A variável de ambiente VITE_GOOGLE_APPS_SCRIPT_URL não está configurada no painel de Definições.');
  }

  // Validar se o URL parece correto (erro muito comum é copiar o URL do editor)
  if (API_URL.includes('/edit') || API_URL.includes('/home') || !API_URL.includes('/macros/s/')) {
    throw new Error('URL do Script Inválido! Copiou o URL do editor. Clique em "Implementar" (Deploy) > "Nova implementação", mude para "Aplicação Web" e copie o URL que termina com "/exec".');
  }

  // 1. Obter todos os livros pendentes de envio e marcados para eliminação
  const pendingBooks = await getPendingBooks();
  const deletedBooks = await getDeletedBooks();
  
  if (pendingBooks.length > 0 || deletedBooks.length > 0) {
    // 2. Enviar livros pendentes e IDs eliminados para o servidor
    const booksToSync: Book[] = pendingBooks.map(({ syncStatus, ...rest }) => rest);
    const deletedIds = deletedBooks.map(b => b.id);
        
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // Evita o pedido CORS preflight (OPTIONS)
        },
        body: JSON.stringify({ 
          action: 'syncBooks', 
          token: AUTH_TOKEN, 
          books: booksToSync,
          deletedIds: deletedIds
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar dados para a folha (${response.status}): ${response.statusText}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Resposta não-JSON do servidor no POST:", text);
        throw new Error('O Google Apps Script retornou uma resposta inválida. Verifique se configurou o ID da folha e se publicou o script para "Qualquer pessoa".');
      }

      if (data.error) {
        throw new Error(`Erro no Google Sheets: ${data.error}`);
      }

      // Atualizar status local para sincronizado
      for (const book of pendingBooks) {
        await saveBook({ ...book, syncStatus: 'synced' });
      }

      // Eliminar definitivamente localmente os livros eliminados e confirmados pelo Sheets
      for (const book of deletedBooks) {
        await hardDeleteBook(book.id);
      }
    } catch (error: any) {
      console.error('Error pushing books to Sheets', error);
      throw new Error(error.message || 'Erro de rede ao ligar ao Google Sheets.');
    }
  }

  // 3. Obter atualizações do servidor (sincronização bidirecional)
  try {
    const response = await fetch(`${API_URL}?action=getBooks&token=${encodeURIComponent(AUTH_TOKEN)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Erro ao descarregar dados (${response.status}): ${response.statusText}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Resposta não-JSON do servidor no GET:", text);
      throw new Error('O Google Apps Script retornou uma resposta inválida no descarregamento.');
    }

    if (data.error) {
      throw new Error(`Erro no Google Sheets (GET): ${data.error}`);
    }

    const remoteBooks: Book[] = data.books || [];
    const remoteIds = new Set(remoteBooks.map(b => b && b.id ? String(b.id).trim() : '').filter(Boolean));

    // Gravar livros remotos localmente
    for (const remoteBook of remoteBooks) {
      if (remoteBook && remoteBook.id) {
        const normalizedBook: LocalBook = {
          ...remoteBook,
          id: String(remoteBook.id).trim(),
          syncStatus: 'synced'
        };
        await saveBook(normalizedBook);
      }
    }

    // Se um livro estiver como 'synced' localmente mas não vier da folha, 
    // significa que foi eliminado na folha diretamente, então eliminamos localmente.
    const allLocalBooks = await getAllBooks();
    for (const localBook of allLocalBooks) {
      if (localBook.syncStatus === 'synced' && !remoteIds.has(String(localBook.id).trim())) {
        await hardDeleteBook(localBook.id);
      }
    }
  } catch (error: any) {
    console.error('Error fetching books from Sheets', error);
    throw new Error(error.message || 'Erro ao descarregar dados do Google Sheets.');
  }
}

export async function searchBNP(query: string): Promise<string> {
  try {
    const url = `/api/bnp?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao pesquisar na BNP (${response.status})`);
    }

    const xml = await response.text();
    return xml;
  } catch (error: any) {
    console.error('Error searching BNP via proxy', error);
    throw error;
  }
}

