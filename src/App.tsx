/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookProvider } from './BookContext';
import { SyncBanner } from './components/SyncBanner';
import { Catalog } from './components/Catalog';

export default function App() {
  return (
    <BookProvider>
      <div className="h-screen flex flex-col bg-slate-950 text-slate-300 font-sans selection:bg-sky-500/30 overflow-hidden">
        <SyncBanner />
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <Catalog />
        </main>
      </div>
    </BookProvider>
  );
}
