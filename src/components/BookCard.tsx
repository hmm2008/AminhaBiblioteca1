import React from 'react';
import { LocalBook } from '../types';
import { Star, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface BookCardProps {
  key?: React.Key;
  book: LocalBook;
  onEdit: (book: LocalBook) => void;
  onDelete: (id: string) => void;
}

export function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  const getStatusColor = () => {
    switch (book.readStatus) {
      case 'Lido': return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
      case 'A ler': return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
      case 'Não Lido': return 'border-slate-500/30 bg-slate-500/5 text-slate-400';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-sky-500/50 hover:bg-slate-800/50 transition-all cursor-pointer relative"
    >
      <div className="w-12 h-16 bg-slate-800 rounded flex-shrink-0 flex items-center justify-center border border-slate-700 overflow-hidden">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-6 h-6 text-slate-600" />
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 items-center gap-4 pr-12 sm:pr-8">
        <div className="col-span-1 sm:col-span-2">
          <div className="text-white font-medium truncate" title={book.title}>{book.title}</div>
          <div className="text-slate-500 text-sm truncate">{book.author || 'Autor desconhecido'}</div>
          {book.category && <div className="text-[10px] text-slate-500 uppercase mt-1 tracking-wider">{book.category}</div>}
        </div>
        
        <div className="hidden sm:block">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor()}`}>
            {book.readStatus}
          </span>
        </div>
        
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= book.rating ? 'fill-sky-400 text-sky-400' : 'text-slate-700'}`}
              />
            ))}
          </div>
          <div className={`text-[10px] mt-1 uppercase font-bold tracking-wider ${book.syncStatus === 'pending' ? 'text-amber-500' : 'text-slate-500'}`}>
            SYNC: {book.syncStatus === 'pending' ? 'PENDENTE' : 'SINCRONIZADO'}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/95 p-1.5 rounded-lg border border-slate-700 shadow-xl backdrop-blur-sm">
         <button onClick={() => onEdit(book)} className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-md transition-colors" title="Editar">
           <Edit3 className="w-4 h-4" />
         </button>
         <button onClick={() => onDelete(book.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Apagar">
           <Trash2 className="w-4 h-4" />
         </button>
      </div>
    </motion.div>
  );
}
