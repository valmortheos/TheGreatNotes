import { useState } from 'react';
import changelogData from '../constants/changelog.json';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Calendar } from 'lucide-react';

export function Changelog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-10 h-10 bg-white border border-zinc-200 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center text-zinc-400 hover:text-zinc-900 z-[100]"
        title="What's New"
      >
        <Info className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Changelog</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Tracking product evolution</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
                {changelogData.map((release, idx) => (
                  <div key={idx} className="relative pl-8">
                    {/* Timeline line */}
                    {idx !== changelogData.length - 1 && (
                      <div className="absolute left-[7px] top-8 bottom-[-40px] w-px bg-zinc-100" />
                    )}
                    
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-zinc-900 shadow-sm" />
                    
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-bold text-zinc-900">v{release.version}</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 rounded text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                        <Calendar className="w-2.5 h-2.5" />
                        {release.date}
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {release.changes.map((change, cIdx) => (
                        <li key={cIdx} className="text-sm text-zinc-600 leading-relaxed flex gap-3">
                          <span className="text-zinc-300 select-none text-xs mt-0.5">—</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-zinc-50/50 border-t border-zinc-100 italic text-[10px] text-zinc-400 text-center">
                Notes from the previous versions are preserved here indefinitely.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
