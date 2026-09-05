import React from 'react';
import { Game } from '../types.ts';
import { Play, Star, ExternalLink } from 'lucide-react';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onPlay: (game: Game) => void;
  onToggleFavorite: (id: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
}) => {
  return (
    <div
      id={`game-card-${game.id}`}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-1"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer" onClick={() => onPlay(game)}>
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            // fallback if external image fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Play hover button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>

        {/* Category & Real Game Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            {game.category}
          </span>
          {game.isRealGame && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 shadow-sm shadow-emerald-500/30">
              REAL GAME
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          id={`favorite-btn-${game.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
            isFavorite
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
              {game.title}
            </h3>
            {game.isCustom && (
              <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950/60 border border-sky-800/40 px-1.5 py-0.5 rounded">
                Custom
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {game.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 truncate max-w-[170px]">
            {game.controls || 'Iframe Game'}
          </span>
          <button
            onClick={() => onPlay(game)}
            className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group-hover:underline"
          >
            <span>Play</span>
            <Play className="w-3 h-3 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
