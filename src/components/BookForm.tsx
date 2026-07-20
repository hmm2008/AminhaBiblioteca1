import React, { useState, useEffect } from 'react';
import { LocalBook, ReadStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, ScanBarcode, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface BookFormProps {
  book?: LocalBook | null;
  onSave: (book: LocalBook) => void;
  onClose: () => void;
}

export function BookForm({ book, onSave, onClose }: BookFormProps) {
  const [formData, setFormData] = useState<Partial<LocalBook>>({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    readStatus: 'Não Lido',
    rating: 0,
    notes: '',
  });

  useEffect(() => {
    if (book) {
      setFormData(book);
    }
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newBook: LocalBook = {
      id: formData.id || uuidv4(),
      title: formData.title || '',
      author: formData.author || '',
      isbn: formData.isbn || '',
      genre: formData.genre || '',
      readStatus: formData.readStatus as ReadStatus || 'Não Lido',
      rating: formData.rating || 0,
      notes: formData.notes || '',
      dateAdded: formData.dateAdded || new Date().toISOString(),
      syncStatus: 'pending',
    };

    onSave(newBook);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm sm:p-4">
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900 border-l sm:border sm:rounded-2xl border-slate-800 w-full sm:w-[360px] h-full sm:h-auto sm:max-h-[90vh] shadow-2xl flex flex-col"
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
              <input 
                required
                autoFocus
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                placeholder="Ex: O Alquimista"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Autor</label>
                <input 
                  type="text" 
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Nome"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Género</label>
                <input 
                  type="text" 
                  value={formData.genre}
                  onChange={e => setFormData({...formData, genre: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="Ex: Ficção"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">ISBN / Código de Barras</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.isbn}
                  onChange={e => setFormData({...formData, isbn: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                  placeholder="978-0-..."
                />
                <button type="button" className="absolute right-3 top-2.5 text-sky-400 hover:text-white transition-colors">
                  <ScanBarcode className="w-4 h-4" />
                </button>
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
