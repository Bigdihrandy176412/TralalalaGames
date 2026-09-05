import React from 'react';
import { Gamepad2, Search, X, PlusCircle, GitBranch, Shuffle, Globe } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenAddModal: () => void;
  onOpenDeployModal: () => void;
  onOpenBrowser: () => void;
  onRandomGame: () => void;
  totalGames: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenDeployModal,
  onOpenBrowser,
  onRandomGame,
  totalGames,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white leading-none">
                  Tralalala Games
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {totalGames} games available &bull; JSON Iframe Database
              </p>
            </div>
          </div>

          {/* Quick actions on mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              id="mobile-browser-btn"
              onClick={onOpenBrowser}
              className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95 transition-all"
              title="Open Web Browser"
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              id="mobile-random-btn"
              onClick={onRandomGame}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
              title="Play Random Game"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              id="mobile-deploy-btn"
              onClick={onOpenDeployModal}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
              title="GitHub Deployment"
            >
              <GitBranch className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:max-w-md relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="searchBar"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by game title, category, or controls..."
              className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-slate-800 text-slate-100 text-sm rounded-xl focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            id="browser-btn"
            onClick={onOpenBrowser}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-500/50 transition-all active:scale-95 shadow-sm shadow-emerald-500/10"
            title="Open In-App Web Browser"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Browser</span>
          </button>

          <button
            id="random-game-btn"
            onClick={onRandomGame}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95"
            title="Launch random game"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Random</span>
          </button>

          <button
            id="add-custom-game-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95"
            title="Add a custom game iframe"
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Add Game</span>
          </button>

          <button
            id="deploy-guide-btn"
            onClick={onOpenDeployModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all active:scale-95"
            title="Deploy website to GitHub Pages"
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deploy</span>
          </button>
        </div>
      </div>
    </header>
  );
};
