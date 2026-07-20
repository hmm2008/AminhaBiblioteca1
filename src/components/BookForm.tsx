import React, { useState, useEffect, useRef } from 'react';
import { LocalBook, ReadStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, ScanBarcode, BookOpen, Camera, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface BookFormProps {
  book?: LocalBook | null;
  onSave: (book: LocalBook) => void;
  onClose: () => void;
}

export function BookForm({ book, onSave, onClose }: BookFormProps) {
  const [isSearching, setIsSearching] = useState(false);
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
    readStatus: 'Não Lido',
    rating: 0,
    notes: '',
    coverImage: '',
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

  const handleSearchOnline = async () => {
    setIsSearching(true);
    try {
      let googleQuery = '';
      let openLibraryQuery = '';
      
      // Clean up ISBN (remove hyphens, spaces) if it exists
      const cleanIsbn = formData.isbn ? formData.isbn.replace(/[- ]/g, '') : '';

      if (cleanIsbn) {
        // For Google Books, searching just the number sometimes yields better results than forcing "isbn:" prefix,
        // but we can try both or a combined query.
        googleQuery = `q=isbn:${cleanIsbn}+OR+${cleanIsbn}`;
        openLibraryQuery = `isbn=${cleanIsbn}`;
      } else if (formData.title && formData.author) {
        googleQuery = `q=intitle:${encodeURIComponent(formData.title)}+inauthor:${encodeURIComponent(formData.author)}`;
        openLibraryQuery = `title=${encodeURIComponent(formData.title)}&author=${encodeURIComponent(formData.author)}`;
      } else if (formData.title) {
        googleQuery = `q=intitle:${encodeURIComponent(formData.title)}`;
        openLibraryQuery = `title=${encodeURIComponent(formData.title)}`;
      } else if (formData.author) {
        googleQuery = `q=inauthor:${encodeURIComponent(formData.author)}`;
        openLibraryQuery = `author=${encodeURIComponent(formData.author)}`;
      }

      if (!googleQuery) {
        alert("Por favor, preencha o ISBN/EAN, Título ou Autor para pesquisar.");
        setIsSearching(false);
        return;
      }

      let bookFound = null;

      if (cleanIsbn) {
        // 1. Pesquisa focada e em cascata apenas por ISBN/EAN
        const isbnQueries = [
          { url: `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`, source: 'google' },
          { url: `https://www.googleapis.com/books/v1/volumes?q=${cleanIsbn}`, source: 'google' }, // Apanha EANs não marcados estritamente como ISBN
          { url: `https://openlibrary.org/search.json?isbn=${cleanIsbn}`, source: 'openlibrary' },
          { url: `https://openlibrary.org/search.json?q=${cleanIsbn}`, source: 'openlibrary' }
        ];

        for (const query of isbnQueries) {
          if (bookFound) break;
          try {
            const res = await fetch(query.url);
            if (res.ok) {
              const data = await res.json();
              if (query.source === 'google' && data.items && data.items.length > 0) {
                bookFound = { source: 'google', data: data.items[0].volumeInfo };
              } else if (query.source === 'openlibrary' && data.docs && data.docs.length > 0) {
                bookFound = { source: 'openlibrary', data: data.docs[0] };
              }
            }
          } catch (e) {
            console.error(`Erro na pesquisa por ISBN (${query.url}):`, e);
          }
        }
      } else {
        // 2. Pesquisa em cascata por Título / Autor
        let gQuery = '';
        if (formData.title && formData.author) gQuery = `intitle:${encodeURIComponent(formData.title)}+inauthor:${encodeURIComponent(formData.author)}`;
        else if (formData.title) gQuery = `intitle:${encodeURIComponent(formData.title)}`;
        else if (formData.author) gQuery = `inauthor:${encodeURIComponent(formData.author)}`;

        let oQuery = '';
        if (formData.title && formData.author) oQuery = `title=${encodeURIComponent(formData.title)}&author=${encodeURIComponent(formData.author)}`;
        else if (formData.title) oQuery = `title=${encodeURIComponent(formData.title)}`;
        else if (formData.author) oQuery = `author=${encodeURIComponent(formData.author)}`;

        const textQueries = [
          { url: `https://www.googleapis.com/books/v1/volumes?q=${gQuery}&langRestrict=pt&maxResults=3`, source: 'google' },
          { url: `https://www.googleapis.com/books/v1/volumes?q=${gQuery}&maxResults=3`, source: 'google' },
          { url: `https://openlibrary.org/search.json?${oQuery}`, source: 'openlibrary' }
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
            console.error(`Erro na pesquisa por texto (${query.url}):`, e);
          }
        }
      }

      if (bookFound) {
        const newFormData = { ...formData };
        
        if (bookFound.source === 'google') {
          const bookData = bookFound.data;
          if (!newFormData.title && bookData.title) newFormData.title = bookData.title;
          if (!newFormData.author && bookData.authors && bookData.authors.length > 0) newFormData.author = bookData.authors[0];
          
          if (!newFormData.isbn && bookData.industryIdentifiers) {
            const isbn13 = bookData.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
            const isbn10 = bookData.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
            if (isbn13) newFormData.isbn = isbn13.identifier;
            else if (isbn10) newFormData.isbn = isbn10.identifier;
          }

          if (!newFormData.category && bookData.categories && bookData.categories.length > 0) {
            newFormData.category = bookData.categories[0];
          }
          
          if (!newFormData.publisher && bookData.publisher) newFormData.publisher = bookData.publisher;
          if (!newFormData.publishedDate && bookData.publishedDate) newFormData.publishedDate = bookData.publishedDate;
          if (!newFormData.pageCount && bookData.pageCount) newFormData.pageCount = bookData.pageCount;
          if (!newFormData.language && bookData.language) newFormData.language = bookData.language;
          if (!newFormData.description && bookData.description) newFormData.description = bookData.description;

          if (!newFormData.coverImage && bookData.imageLinks?.thumbnail) {
            let coverUrl = bookData.imageLinks.thumbnail.replace('http:', 'https:');
            coverUrl = coverUrl.replace('&edge=curl', '');
            newFormData.coverImage = coverUrl;
          }
        } else if (bookFound.source === 'openlibrary') {
          const bookData = bookFound.data;
          if (!newFormData.title && bookData.title) newFormData.title = bookData.title;
          if (!newFormData.author && bookData.author_name && bookData.author_name.length > 0) newFormData.author = bookData.author_name[0];
          if (!newFormData.isbn && bookData.isbn && bookData.isbn.length > 0) newFormData.isbn = bookData.isbn[0];
          
          if (!newFormData.publisher && bookData.publisher && bookData.publisher.length > 0) newFormData.publisher = bookData.publisher[0];
          if (!newFormData.publishedDate && bookData.first_publish_year) newFormData.publishedDate = String(bookData.first_publish_year);
          if (!newFormData.pageCount && bookData.number_of_pages_median) newFormData.pageCount = bookData.number_of_pages_median;
          if (!newFormData.language && bookData.language && bookData.language.length > 0) newFormData.language = bookData.language[0];

          if (!newFormData.coverImage && bookData.cover_i) {
            newFormData.coverImage = `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`;
          }
        }
        
        setFormData(newFormData);
      } else {
        alert("Nenhum livro encontrado. Tente verificar o ISBN/EAN ou procure por Título e Autor.");
      }
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      alert("Ocorreu um erro ao pesquisar o livro.");
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
      syncStatus: 'pending',
    };

    onSave(newBook);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900 border sm:rounded-2xl border-slate-800 w-full sm:w-[440px] h-full sm:h-auto sm:max-h-[90vh] shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{book ? 'Editar Registo' : 'Novo Registo'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="book-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Título do Livro *</label>
              <div className="relative">
                <input 
                  required
                  autoFocus
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Ex: O Alquimista"
                />
                <button 
                  type="button" 
                  onClick={handleSearchOnline}
                  disabled={isSearching}
                  className="absolute right-3 top-2.5 text-sky-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Pesquisar Online por este Título"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Autor</label>
                <input 
                  type="text" 
                  value={formData.author || ''}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Nome"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Categoria</label>
                <input 
                  type="text" 
                  value={formData.category || ''}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Ex: Ficção"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">ISBN / EAN</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.isbn || ''}
                  onChange={e => setFormData({...formData, isbn: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="978-0-..."
                />
                <button type="button" className="absolute right-3 top-2.5 text-sky-400 hover:text-white transition-colors">
                  <ScanBarcode className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Editora</label>
                <input 
                  type="text" 
                  value={formData.publisher || ''}
                  onChange={e => setFormData({...formData, publisher: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Ex: Porto Editora"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Data de Lançamento</label>
                <input 
                  type="text" 
                  value={formData.publishedDate || ''}
                  onChange={e => setFormData({...formData, publishedDate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="AAAA-MM-DD ou AAAA"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Nº de Páginas</label>
                <input 
                  type="number" 
                  value={formData.pageCount || ''}
                  onChange={e => setFormData({...formData, pageCount: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Ex: 350"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Idioma</label>
                <input 
                  type="text" 
                  value={formData.language || ''}
                  onChange={e => setFormData({...formData, language: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Ex: pt"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Estado de Leitura</label>
              <div className="grid grid-cols-3 gap-2">
                {['Lido', 'A ler', 'Não Lido'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({...formData, readStatus: status as ReadStatus})}
                    className={`text-[10px] py-1.5 border rounded font-medium uppercase tracking-wider transition-colors ${
                      formData.readStatus === status 
                        ? 'bg-slate-800 border-slate-600 text-white shadow-inner' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Avaliação</label>
              <div className="flex gap-1 text-sky-400 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setFormData({...formData, rating: star === formData.rating ? 0 : star})}
                    className={`text-xl hover:scale-110 transition-transform ${star <= (formData.rating || 0) ? 'text-sky-400' : 'text-slate-700'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Capa do Livro</label>
              <div className="flex mb-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-32 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 hover:bg-slate-800 transition-all overflow-hidden group"
                >
                  {formData.coverImage ? (
                    <>
                      <img src={formData.coverImage} alt="Capa" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500 group-hover:text-sky-400 transition-colors">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[8px] uppercase font-bold tracking-wider text-center px-2">Adicionar Capa</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Sinopse / Conteúdo</label>
              <textarea 
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm h-32 focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600 resize-none"
                placeholder="Resumo ou descrição do livro..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Notas e Citações</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm h-24 focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600 resize-none"
                placeholder="Anotações pessoais..."
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-800 shrink-0 bg-slate-900 sm:rounded-b-2xl">
          <button 
            form="book-form"
            type="submit"
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] active:scale-[0.98] transition-all"
          >
            Guardar Livro
          </button>
        </div>

      </motion.div>
    </div>
  );
}
