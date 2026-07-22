import React from 'react';
import { useBooks } from '../BookContext';
import { Plus, Search, Library, CheckCircle, Users, AlertTriangle, BookOpen, Book } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../i18n/LanguageContext';

interface DashboardProps {
  onAddBook: () => void;
  onViewLibrary?: () => void;
}

export function Dashboard({ onAddBook, onViewLibrary }: DashboardProps) {
  const { books, settings } = useBooks();
  const { t } = useTranslation();

  // Stats calculations
  const totalBooks = books.length;
  const available = books.filter(b => b.status === 'Disponível').length;
  const borrowed = books.filter(b => b.status === 'Emprestado').length;
  const lost = books.filter(b => b.status === 'Extraviado').length;
  const read = books.filter(b => b.readStatus === 'Lido').length;
  const unread = totalBooks - read;

  // Chart data calculation
  const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const chartData = months.slice(1, 7).map(month => ({
    name: month,
    uv: month === 'jul.' ? totalBooks : 0 // Fake data for previous months, current month has total
  }));

  // Categories popular
  const categoryCounts = books.reduce((acc, book) => {
    const cat = book.category || 'Sem Categoria';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularCategories = Object.entries(categoryCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([name, count]) => ({
      name,
      count: count as number,
      percent: Math.round(((count as number) / (totalBooks || 1)) * 100)
    }));

  const readPercent = Math.round((read / (totalBooks || 1)) * 100);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {t('dashboard.welcome')}
              </h2>
              <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
            </div>
            <button 
              onClick={onAddBook}
              className="bg-[#1a5eb8] hover:bg-[#154a93] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('dashboard.addBook')}
            </button>
          </div>

          {/* Search */}
          <div className="relative bg-white rounded-xl shadow-sm border border-slate-200">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('library.searchPlaceholder')}
              className="w-full bg-transparent border-none text-slate-700 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5eb8]/20 rounded-xl"
            />
          </div>

          {/* Estatísticas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('reports.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Library} color="bg-blue-600" label={t('dashboard.totalBooks')} value={totalBooks} />
              <StatCard icon={CheckCircle} color="bg-emerald-500" label={t('common.bookStatus.available')} value={available} />
              <StatCard icon={Users} color="bg-amber-500" label={t('dashboard.borrowedBooks')} value={borrowed} />
              <StatCard icon={AlertTriangle} color="bg-red-500" label={t('common.bookStatus.lost')} value={lost} />
              <StatCard icon={BookOpen} color="bg-purple-500" label={t('common.readStatus.read')} value={read} />
              <StatCard icon={Book} color="bg-slate-400" label={t('common.readStatus.unread')} value={unread} />
            </div>
          </div>

          {/* Charts and Categories */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-6">{t('dashboard.recent')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="uv" fill="#1a5eb8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-[#1a5eb8]">🏷️</span> {t('dashboard.themes')}
              </h3>
              
              <div className="flex-1 space-y-5">
                {popularCategories.slice(0, 5).map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
                      <span>{cat.name}</span>
                      <span className="text-slate-500">{cat.count} · {cat.percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-300 rounded-full" style={{ width: `${cat.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
                  <span>{t('dashboard.reading')}</span>
                  <span className="text-slate-500">{read} / {totalBooks} · {readPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a5eb8] rounded-full" style={{ width: `${readPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Por Tema */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('reports.booksByTheme')}</h3>
            <div className="flex flex-wrap gap-3">
              {popularCategories.map((cat, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-medium text-slate-700 flex items-center gap-2 shadow-sm">
                  {cat.name}
                  <span className="bg-blue-50 text-blue-700 text-xs py-0.5 px-2 rounded-full font-bold">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* A ler atualmente */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{t('dashboard.reading')}</h3>
              <button onClick={onViewLibrary} className="text-sm text-[#1a5eb8] font-medium hover:underline">{t('dashboard.viewAll')} →</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.filter(b => b.readStatus === 'A ler').slice(0, 5).map(book => (
                <div key={book.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="aspect-[2/3] w-full bg-slate-100 relative overflow-hidden">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Book className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1" title={book.title}>{book.title}</h4>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {book.author}
                    </p>
                    <div className="mt-auto">
                      <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-1 rounded-full truncate max-w-full">
                        {t('common.readStatus.reading')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {books.filter(b => b.readStatus === 'A ler').length === 0 && <div className="col-span-full text-center py-10 text-slate-400">{t('dashboard.noReading')}</div>}
            </div>
          </div>

          {/* Adicionados Recentemente */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{t('dashboard.recent')}</h3>
              <button onClick={onViewLibrary} className="text-sm text-[#1a5eb8] font-medium hover:underline">{t('dashboard.viewAll')} →</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.slice(0, 5).map(book => (
                <div key={book.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="aspect-[2/3] w-full bg-slate-100 relative overflow-hidden">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Book className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1" title={book.title}>{book.title}</h4>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {book.author}
                    </p>
                    <div className="mt-auto">
                      <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-full truncate max-w-full">
                        {book.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm hover:border-slate-300 transition-colors">
      <div className={`${color} text-white p-3 rounded-lg flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800 leading-tight">{value}</div>
        <div className="text-xs text-slate-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

