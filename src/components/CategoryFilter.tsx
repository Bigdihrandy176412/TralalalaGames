import React from 'react';
import { Category } from '../types.ts';
import { Sparkles, Gamepad, Puzzle, Trophy, Flame, History, Star, MousePointerClick, ShieldCheck, Activity } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  categoryCounts: Record<Category, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const categories: { key: Category; label: string; icon: React.ReactNode }[] = [
    { key: 'All', label: 'All Games', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'Real Games', label: 'Real Games', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
    { key: 'Sports', label: 'Sports', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'Action', label: 'Action', icon: <Flame className="w-3.5 h-3.5" /> },
    { key: 'Arcade', label: 'Arcade', icon: <Gamepad className="w-3.5 h-3.5" /> },
    { key: 'Clicker', label: 'Clicker', icon: <MousePointerClick className="w-3.5 h-3.5" /> },
    { key: 'Puzzle', label: 'Puzzle', icon: <Puzzle className="w-3.5 h-3.5" /> },
    { key: 'Classic', label: 'Classic', icon: <Trophy className="w-3.5 h-3.5" /> },
    { key: 'Retro', label: 'Retro', icon: <History className="w-3.5 h-3.5" /> },
    { key: 'Favorites', label: 'Favorites', icon: <Star className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.key;
        const count = categoryCounts[cat.key] || 0;
        return (
          <button
            key={cat.key}
            id={`filter-${cat.key.toLowerCase()}`}
            onClick={() => onSelectCategory(cat.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none active:scale-95 ${
              isActive
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/90 text-slate-300 border border-slate-800/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-slate-950/20 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
