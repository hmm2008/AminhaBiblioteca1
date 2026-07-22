import React, { useState, useEffect, useRef } from 'react';
import { LocalBook, ReadStatus } from '../types';
import { searchBNP } from '../lib/syncService';
import { v4 as uuidv4 } from 'uuid';
import { ScanBarcode, Camera, Search, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useBooks } from '../BookContext';

interface BookFormProps {
  book?: LocalBook | null;
  onSave: (book: LocalBook) => void;
  onClose: () => void;
}

export function BookForm({ book, onSave, onClose }: BookFormProps) {
  const { themes } = useBooks();
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [searchMode, setSearchMode] = useState<'title' | 'author' | 'publisher'>('title');
  const [searchValue, setSearchValue] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  
  const handleCoverSearch = () => {
    if (formData.isbn) {
      const cleanIsbn = formData.isbn.replace(/[- ]/g, '');
      window.open(`https://www.google.com/search?tbm=isch&q=isbn+${cleanIsbn}`, '_blank', 'noopener,noreferrer');
    } else if (formData.title) {
      window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(formData.title)}+livro+capa`, '_blank', 'noopener,noreferrer');
    } else {
      alert("Por favor, insira o ISBN ou Título primeiro para pesquisar a capa no Google Imagens.");
    }
  };
  
  const [formData, setFormData] = useState<Partial<LocalBook>>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedDate: '',
    pageCount: '',
    language: '',
    description: '',
    status: 'Disponível',
    readStatus: 'Não Lido',
    rating: 0,
    notes: '',
    coverImage: '',
    shelfLocation: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 450;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, coverImage: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (book) {
      setFormData(book);
    }
  }, [book]);

  const executeSearch = async (type: 'online' | 'isbn') => {
    setIsSearching(true);
    setSearchNotFound(false);
    try {
      let googleQuery = '';
      let openLibraryQuery = '';
      
      const cleanIsbn = formData.isbn ? formData.isbn.replace(/[- ]/g, '') : '';

      if (type === 'isbn' && cleanIsbn) {
        googleQuery = `q=isbn:${cleanIsbn}+OR+${cleanIsbn}`;
        openLibraryQuery = `isbn=${cleanIsbn}`;
      } else if (type === 'online' && searchValue) {
        if (searchMode === 'title') {
          googleQuery = `q=intitle:${encodeURIComponent(searchValue)}`;
          openLibraryQuery = `title=${encodeURIComponent(searchValue)}`;
        } else if (searchMode === 'author') {
          googleQuery = `q=inauthor:${encodeURIComponent(searchValue)}`;
          openLibraryQuery = `author=${encodeURIComponent(searchValue)}`;
        } else {
          googleQuery = `q=inpublisher:${encodeURIComponent(searchValue)}`;
          openLibraryQuery = `publisher=${encodeURIComponent(searchValue)}`;
        }
      }

      if (!googleQuery) {
        setIsSearching(false);
        return;
      }

      let bookFound = null;

      if (type === 'isbn' && cleanIsbn) {
        // BNP
        try {
          const xmlResponse = await searchBNP(`bath.isbn=${cleanIsbn}`);
          if (xmlResponse) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlResponse, "text/xml");
            const records = xmlDoc.getElementsByTagName("record");
            if (records && records.length > 0) {
              const getTag = (node: Element, tag: string) => {
                const els = node.getElementsByTagName(tag);
                if (els.length > 0) return els[0].textContent;
                const elsDc = node.getElementsByTagName(`dc:${tag}`);
                if (elsDc.length > 0) return elsDc[0].textContent;
                return null;
              };
              const title = getTag(records[0], "title");
              if (title) {
                bookFound = { source: 'bnp', data: { title, author: getTag(records[0], "creator"), publisher: getTag(records[0], "publisher"), date: getTag(records[0], "date"), language: getTag(records[0], "language") } };
              }
            }
          }
        } catch (e) {
          console.error("Erro na pesquisa BNP:", e);
        }

        if (!bookFound) {
          const isbnQueries = [
            { url: `/api/wook?isbn=${cleanIsbn}`, source: 'wook' },
            { url: `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`, source: 'google' },
            { url: `https://www.googleapis.com/books/v1/volumes?q=${cleanIsbn}`, source: 'google' },
            { url: `https://openlibrary.org/search.json?isbn=${cleanIsbn}`, source: 'openlibrary' }
          ];

          for (const query of isbnQueries) {
            if (bookFound) break;
            try {
              const res = await fetch(query.url);
              if (res.ok) {
                const data = await res.json();
                if (query.source === 'wook' && data.titulo) {
                  bookFound = { source: 'wook', data };
                } else if (query.source === 'google' && data.items && data.items.length > 0) {
                  bookFound = { source: 'google', data: data.items[0].volumeInfo };
                } else if (query.source === 'openlibrary' && data.docs && data.docs.length > 0) {
                  bookFound = { source: 'openlibrary', data: data.docs[0] };
                }
              }
            } catch (e) {
              console.error(`Erro na pesquisa (${query.url}):`, e);
            }
          }
        }
      } else {
        const textQueries = [
          { url: `https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&langRestrict=pt&maxResults=3`, source: 'google' },
          { url: `https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&maxResults=3`, source: 'google' },
          { url: `https://openlibrary.org/search.json?${openLibraryQuery}`, source: 'openlibrary' }
        ];

        for (const query of textQueries) {
          if (bookFound) break;
          try {
            const res = await fetch(query.url);
            if (res.ok) {
              const data = await res.json();
              if (query.source === 'google' && data.items && data.items.length > 0) {
                const bestMatch = data.items.find((item: any) => item.volumeInfo?.imageLinks) || data.items[0];
                bookFound = { source: 'google', data: bestMatch.volumeInfo };
              } else if (query.source === 'openlibrary' && data.docs && data.docs.length > 0) {
                const bestMatch = data.docs.find((doc: any) => doc.cover_i) || data.docs[0];
                bookFound = { source: 'openlibrary', data: bestMatch };
              }
            }
          } catch (e) {
            console.error(`Erro na pesquisa texto (${query.url}):`, e);
          }
        }
      }

      if (!bookFound && type === 'isbn') {
        try {
          const aiRes = await fetch('/api/ai-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isbn: cleanIsbn })
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (aiData && aiData.title) bookFound = { source: 'ai', data: aiData };
          }
        } catch (e) {
          console.error("Erro AI:", e);
        }
      }

      if (bookFound) {
        const newFormData = { ...formData };
        if (bookFound.source === 'wook') {
          const bookData = bookFound.data;
          if (!newFormData.title && bookData.titulo) newFormData.title = bookData.titulo;
          if (!newFormData.author && bookData.autor) newFormData.author = bookData.autor;
          if (!newFormData.isbn && bookData.isbn) newFormData.isbn = bookData.isbn;
          if (!newFormData.publisher && bookData.editora) newFormData.publisher = bookData.editora;
          if (!newFormData.publishedDate && bookData.ano) newFormData.publishedDate = bookData.ano;
          if (!newFormData.pageCount && bookData.paginas) newFormData.pageCount = bookData.paginas;
          if (!newFormData.language && bookData.idioma) newFormData.language = bookData.idioma;
          if (!newFormData.coverImage && bookData.imagem) newFormData.coverImage = bookData.imagem;
        } else if (bookFound.source === 'google') {
          const bookData = bookFound.data;
          if (!newFormData.title && bookData.title) newFormData.title = bookData.title;
          if (!newFormData.author && bookData.authors && bookData.authors.length > 0) newFormData.author = bookData.authors[0];
          if (!newFormData.isbn && bookData.industryIdentifiers) {
            const isbn13 = bookData.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
            if (isbn13) newFormData.isbn = isbn13.identifier;
          }
          if (!newFormData.category && bookData.categories && bookData.categories.length > 0) newFormData.category = bookData.categories[0];
          if (!newFormData.publisher && bookData.publisher) newFormData.publisher = bookData.publisher;
          if (!newFormData.publishedDate && bookData.publishedDate) newFormData.publishedDate = bookData.publishedDate;
          if (!newFormData.pageCount && bookData.pageCount) newFormData.pageCount = bookData.pageCount;
          if (!newFormData.language && bookData.language) newFormData.language = bookData.language;
          if (!newFormData.description && bookData.description) newFormData.description = bookData.description;
          if (!newFormData.coverImage && bookData.imageLinks?.thumbnail) newFormData.coverImage = bookData.imageLinks.thumbnail.replace('http:', 'https:').replace('&edge=curl', '');
        } else if (bookFound.source === 'bnp') {
          const bookData = bookFound.data;
          if (!newFormData.title && bookData.title) newFormData.title = bookData.title;
          if (!newFormData.author && bookData.author) newFormData.author = bookData.author;
          if (!newFormData.publisher && bookData.publisher) newFormData.publisher = bookData.publisher;
        } else if (bookFound.source === 'ai') {
          const bookData = bookFound.data;
          if (!newFormData.title && bookData.title) newFormData.title = bookData.title;
          if (!newFormData.author && bookData.author) newFormData.author = bookData.author;
          if (!newFormData.isbn && bookData.isbn) newFormData.isbn = bookData.isbn;
          if (!newFormData.publisher && bookData.publisher) newFormData.publisher = bookData.publisher;
          if (!newFormData.publishedDate && bookData.publishedDate) newFormData.publishedDate = bookData.publishedDate;
          if (!newFormData.pageCount && bookData.pageCount) newFormData.pageCount = bookData.pageCount;
          if (!newFormData.language && bookData.language) newFormData.language = bookData.language;
          if (!newFormData.description && bookData.description) newFormData.description = bookData.description;
          if (!newFormData.category && bookData.category) newFormData.category = bookData.category;
        } else if (bookFound.source === 'openlibrary') {
          const bookData = bookFound.data;
          if (!newFormData.title && bookData.title) newFormData.title = bookData.title;
          if (!newFormData.author && bookData.author_name && bookData.author_name.length > 0) newFormData.author = bookData.author_name[0];
          if (!newFormData.isbn && bookData.isbn && bookData.isbn.length > 0) newFormData.isbn = bookData.isbn[0];
          if (!newFormData.publisher && bookData.publisher && bookData.publisher.length > 0) newFormData.publisher = bookData.publisher[0];
          if (!newFormData.coverImage && bookData.cover_i) newFormData.coverImage = `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`;
        }
        
        setFormData(newFormData);
      } else {
        setSearchNotFound(true);
      }
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      setSearchNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newBook: LocalBook = {
      id: formData.id || uuidv4(),
      title: formData.title || '',
      author: formData.author || '',
      isbn: formData.isbn || '',
      category: formData.category || '',
      status: formData.status || 'Disponível',
      readStatus: formData.readStatus as ReadStatus || 'Não Lido',
      rating: formData.rating || 0,
      notes: formData.notes || '',
      dateAdded: formData.dateAdded || new Date().toISOString(),
      coverImage: formData.coverImage || '',
      publisher: formData.publisher || '',
      publishedDate: formData.publishedDate || '',
      pageCount: formData.pageCount || '',
      language: formData.language || '',
      description: formData.description || '',
      shelfLocation: formData.shelfLocation || '',
      syncStatus: 'pending',
    };

    onSave(newBook);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{book ? 'Editar Livro' : 'Adicionar Livro'}</h2>
        <p className="text-slate-500 mt-1">Insere o ISBN/EAN para pesquisar os dados automaticamente.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Pesquisa Online</h3>
        <div className="flex gap-2 mb-3">
          {['title', 'author', 'publisher'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSearchMode(mode as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                searchMode === mode ? 'bg-[#1a5eb8] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode === 'title' ? 'Título' : mode === 'author' ? 'Autor' : 'Editora'}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
            placeholder={`Ex: ${searchMode === 'title' ? 'O Nome da Rosa' : searchMode === 'author' ? 'Umberto Eco' : 'Gradiva'}`}
          />
          <button 
            onClick={() => executeSearch('online')}
            disabled={isSearching}
            className="bg-[#8bb4eb]/30 text-[#1a5eb8] hover:bg-[#8bb4eb]/50 px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Pesquisar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Pesquisa por ISBN / EAN</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">#</span>
              <input 
                type="text" 
                value={formData.isbn || ''}
                onChange={e => setFormData({...formData, isbn: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20"
                placeholder="Ex: 9789720049964"
              />
            </div>
            <button 
              onClick={() => executeSearch('isbn')}
              disabled={isSearching}
              className="bg-[#8bb4eb]/30 text-[#1a5eb8] hover:bg-[#8bb4eb]/50 px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Pesquisar
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-slate-400 bg-white">ou</span></div>
        </div>

        <button className="w-full py-4 rounded-xl border-2 border-dashed border-[#8bb4eb] text-[#1a5eb8] bg-[#8bb4eb]/10 hover:bg-[#8bb4eb]/20 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
          <ScanBarcode className="w-5 h-5" />
          Fotografar ou carregar imagem do código de barras
        </button>

        {searchNotFound && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-lg flex gap-3 text-sm">
            <Info className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Livro não encontrado online.</p>
              <p>Podes preencher os dados manualmente abaixo.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800">Dados do Livro</h3>
          <p className="text-sm text-slate-500">Preenche os campos manualmente.</p>
        </div>

        <form id="book-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">TÍTULO *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">AUTOR(ES)</label>
            <input type="text" value={formData.author || ''} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">EDITORA</label>
            <input type="text" value={formData.publisher || ''} onChange={e => setFormData({...formData, publisher: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">ANO DE PUBLICAÇÃO</label>
            <input type="text" value={formData.publishedDate || ''} onChange={e => setFormData({...formData, publishedDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">ISBN / EAN</label>
            <input type="text" value={formData.isbn || ''} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">Nº DE PÁGINAS</label>
            <input type="text" value={formData.pageCount || ''} onChange={e => setFormData({...formData, pageCount: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">IDIOMA</label>
            <select value={formData.language || ''} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20">
              <option value="">Selecione o idioma...</option>
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
              <option value="fr">Francês</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">LOCALIZAÇÃO NA PRATELEIRA</label>
            <input type="text" value={formData.shelfLocation || ''} onChange={e => setFormData({...formData, shelfLocation: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">TEMA / CATEGORIA</label>
            <select value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20">
              <option value="">Selecionar tema...</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider">CAPA DO LIVRO</label>
              <div className="flex gap-3 text-xs text-[#1a5eb8]">
                <button type="button" className="hover:underline hover:text-[#154a93] cursor-pointer" onClick={() => fileInputRef.current?.click()}>Colar imagem</button>
                <button type="button" className="hover:underline hover:text-[#154a93] cursor-pointer" onClick={() => setShowUrlInput(!showUrlInput)}>URL manual</button>
                <button type="button" className="hover:underline hover:text-[#154a93] cursor-pointer" onClick={handleCoverSearch}>Pesquisar capas</button>
              </div>
            </div>

            {showUrlInput && (
              <div className="flex gap-2 mb-3">
                <input 
                  type="url" 
                  placeholder="https://exemplo.com/capa.jpg" 
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20" 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (coverUrlInput) {
                      setFormData({...formData, coverImage: coverUrlInput});
                      setCoverUrlInput('');
                      setShowUrlInput(false);
                    }
                  }}
                  className="bg-[#1a5eb8] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#154a93]"
                >
                  Carregar
                </button>
              </div>
            )}

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            {formData.coverImage ? (
               <div className="relative w-24 h-32 rounded border border-slate-200 overflow-hidden">
                 <img src={formData.coverImage} className="w-full h-full object-cover" />
                 <button type="button" onClick={() => setFormData({...formData, coverImage: ''})} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><ScanBarcode className="w-3 h-3" /></button>
               </div>
            ) : (
              <div className="w-full h-32 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400">
                Sem capa
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">SINOPSE / DESCRIÇÃO</label>
            <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20 resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wider">NOTAS PESSOAIS</label>
            <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20 resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider">ESTADO</label>
              <select value={formData.status || 'Disponível'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20">
                <option value="Disponível">Disponível</option>
                <option value="Emprestado">Emprestado</option>
                <option value="Extraviado">Extraviado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider">ESTADO DE LEITURA</label>
              <select value={formData.readStatus || 'Não Lido'} onChange={e => setFormData({...formData, readStatus: e.target.value as ReadStatus})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20">
                <option value="Não Lido">Não lido</option>
                <option value="A ler">A ler</option>
                <option value="Lido">Lido</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <div className="flex gap-4 justify-end">
        <button onClick={onClose} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" form="book-form" className="px-8 py-2.5 bg-[#1a5eb8] text-white font-semibold rounded-lg hover:bg-[#154a93] transition-colors shadow-sm">
          Guardar Livro
        </button>
      </div>
    </div>
  );
}
