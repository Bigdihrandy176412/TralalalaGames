import React, { useState, useEffect, useMemo } from 'react';
import { Game, Category } from './types.ts';
import { Header } from './components/Header.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { GameCard } from './components/GameCard.tsx';
import { GameViewer } from './components/GameViewer.tsx';
import { AddGameModal } from './components/AddGameModal.tsx';
import { GitHubDeployModal } from './components/GitHubDeployModal.tsx';
import { WebBrowserModal } from './components/WebBrowserModal.tsx';
import {
  Gamepad2,
  Sparkles,
  Flame,
  Search,
  ExternalLink,
  Code2,
  ShieldCheck,
  Zap,
  Globe,
} from 'lucide-react';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [browserInitialUrl, setBrowserInitialUrl] = useState<string | undefined>(undefined);

  // Favorites in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unblocked_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom games in localStorage
  const [customGames, setCustomGames] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem('unblocked_custom_games');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load games from games.json
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/games.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Game[] = await res.json();
        setGames(data);
      } catch (err) {
        console.error('Failed to load games.json:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  // Save favorites
  useEffect(() => {
    try {
      localStorage.setItem('unblocked_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.warn('Could not save favorites', err);
    }
  }, [favorites]);

  // Save custom games
  useEffect(() => {
    try {
      localStorage.setItem('unblocked_custom_games', JSON.stringify(customGames));
    } catch (err) {
      console.warn('Could not save custom games', err);
    }
  }, [customGames]);

  // Combine default and custom games
  const allGames = useMemo(() => {
    return [...customGames, ...games];
  }, [games, customGames]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomGame = (newGame: Game) => {
    setCustomGames((prev) => [newGame, ...prev]);
    setActiveGame(newGame);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      All: allGames.length,
      'Real Games': allGames.filter((g) => g.isRealGame).length,
      Sports: 0,
      Clicker: 0,
      Arcade: 0,
      Puzzle: 0,
      Action: 0,
      Classic: 0,
      Retro: 0,
      Favorites: favorites.length,
    };

    allGames.forEach((g) => {
      const cat = g.category as Category;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    return counts;
  }, [allGames, favorites]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      // Category filter
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(game.id)) return false;
      } else if (selectedCategory === 'Real Games') {
        if (!game.isRealGame) return false;
      } else if (selectedCategory !== 'All') {
        if (game.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(query);
        const matchesCat = game.category.toLowerCase().includes(query);
        const matchesDesc = game.description.toLowerCase().includes(query);
        const matchesCtrl = game.controls?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCat && !matchesDesc && !matchesCtrl) {
          return false;
        }
      }

      return true;
    });
  }, [allGames, selectedCategory, searchQuery, favorites]);

  const handleRandomGame = () => {
    if (allGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allGames.length);
    setActiveGame(allGames[randomIndex]);
  };

  const featuredGames = useMemo(() => {
    return allGames.filter((g) => g.featured).slice(0, 3);
  }, [allGames]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenBrowser={() => {
          setBrowserInitialUrl(undefined);
          setIsBrowserOpen(true);
        }}
        onRandomGame={handleRandomGame}
        totalGames={allGames.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Quick Highlights / Banner */}
        {!searchQuery && selectedCategory === 'All' && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-5 md:p-6 shadow-md">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Tralalala Games Arcade
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Play Instant Iframe Games Offline &amp; Online
                </h2>
                <p className="text-xs md:text-sm text-slate-400 max-w-xl">
                  Each title is embedded cleanly in an isolated iframe. No downloads or installations required.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    setBrowserInitialUrl(undefined);
                    setIsBrowserOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all shadow-sm shadow-emerald-500/10 active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Web Browser</span>
                </button>
                <button
                  onClick={handleRandomGame}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Random Game</span>
                </button>
                <button
                  onClick={() => setIsDeployModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GitHub &amp; Files</span>
                </button>
              </div>
            </div>

            {/* Decorative background grid */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center justify-between gap-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Games Grid Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-xs">Loading games database...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-200 text-base">No games found</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchQuery
                ? `No games matched "${searchQuery}". Try a different search term or category.`
                : 'No games in this category yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:underline"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          <div
            id="gameGrid"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={favorites.includes(game.id)}
                onPlay={(g) => setActiveGame(g)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Tralalala Games</span>
            <span className="text-slate-500">&bull;</span>
            <span>JSON Iframe Portal</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setBrowserInitialUrl(undefined);
                setIsBrowserOpen(true);
              }}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Web Browser</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Export to GitHub
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Add Custom Game
            </button>
            <span>&bull;</span>
            <a
              href="/standalone/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Vanilla HTML/JS Version
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GameViewer
        game={activeGame}
        onClose={() => setActiveGame(null)}
        onOpenInBrowser={(g) => {
          setActiveGame(null);
          setBrowserInitialUrl(g.url);
          setIsBrowserOpen(true);
        }}
      />

      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddCustomGame}
      />

      <GitHubDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        games={allGames}
      />

      <WebBrowserModal
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        games={allGames}
        initialUrl={browserInitialUrl}
      />
    </div>
  );
}
