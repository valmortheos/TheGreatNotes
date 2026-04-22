import changelogData from '../constants/changelog.json';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';

export function ChangelogView() {
  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-20">
      <div className="max-w-3xl mx-auto px-8 pt-20">
        <header className="mb-20">
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">Evolution of The Great Notes</h2>
          <p className="text-lg text-zinc-500 font-medium leading-relaxed">
            A quiet log of how this tool for thought is growing.
          </p>
        </header>

        <div className="space-y-24">
          {changelogData.map((release, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-12 border-l border-zinc-100"
            >
              <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-200 border-2 border-white ring-4 ring-zinc-50" />
              
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">v{release.version}</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {release.date}
                </div>
              </div>

              <ul className="space-y-6">
                {release.changes.map((change, cIdx) => (
                  <li key={cIdx} className="text-zinc-700 leading-relaxed group flex items-start gap-4">
                    <span className="w-6 h-px bg-zinc-200 mt-3 group-hover:bg-zinc-400 transition-colors" />
                    {change}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
