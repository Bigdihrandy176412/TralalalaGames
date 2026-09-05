import React, { useRef, useState, useEffect } from 'react';
import { Game } from '../types.ts';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Info,
  ShieldCheck,
  AlertTriangle,
  Globe,
} from 'lucide-react';

interface GameViewerProps {
  game: Game | null;
  onClose: () => void;
  onOpenInBrowser?: (game: Game) => void;
}

export const GameViewer: React.FC<GameViewerProps> = ({ game, onClose, onOpenInBrowser }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [sourceMode, setSourceMode] = useState<'direct' | 'proxy' | 'backup'>('direct');

  useEffect(() => {
    setIsLoading(true);
    setSourceMode('direct');
    setIframeKey((prev) => prev + 1);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!game) return null;

  const getEffectiveUrl = () => {
    if (sourceMode === 'backup' && game.backupUrl) {
      return game.backupUrl;
    }
    if (sourceMode === 'proxy') {
      return `/api/proxy?url=${encodeURIComponent(game.url)}`;
    }
    return game.url;
  };

  const handleSourceChange = (mode: 'direct' | 'proxy' | 'backup') => {
    setSourceMode(mode);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const openInNewTab = () => {
    window.open(game.url, '_blank', 'noopener,noreferrer');
  };

  const effectiveUrl = getEffectiveUrl();

  return (
    <div
      id="gameViewer"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div
        ref={containerRef}
        className="w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="currentTitle" className="font-bold text-slate-100 text-base md:text-lg truncate">
                {game.title}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                {game.category}
              </span>
              {game.isRealGame && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30">
                  REAL GAME
                </span>
              )}
              {game.realSource && (
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hidden md:inline-block">
                  {game.realSource}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Source switch pills for real games */}
            <div className="hidden lg:flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px] font-medium mr-1">
              <button
                onClick={() => handleSourceChange('direct')}
                className={`px-2 py-1 rounded transition-colors ${
                  sourceMode === 'direct'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Play official direct release"
              >
                Official
              </button>
              <button
                onClick={() => handleSourceChange('proxy')}
                className={`px-2 py-1 rounded transition-colors ${
                  sourceMode === 'proxy'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Unblock through local server proxy"
              >
                Proxy Unblock
              </button>
              {game.backupUrl && (
                <button
                  onClick={() => handleSourceChange('backup')}
                  className={`px-2 py-1 rounded transition-colors ${
                    sourceMode === 'backup'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Play offline mirror version"
                >
                  Offline Mirror
                </button>
              )}
            </div>

            <button
              onClick={handleReload}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {onOpenInBrowser && (
              <button
                onClick={() => onOpenInBrowser(game)}
                className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                title="Open in Web Browser Tabs"
              >
                <Globe className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={openInNewTab}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              id="fullscreenBtn"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              id="closeBtn"
              onClick={onClose}
              className="flex items-center gap-1 ml-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-sm shadow-rose-600/20 active:scale-95"
              title="Close game viewer"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Iframe Viewport Area */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-400 animate-pulse">
                Loading {game.title}...
              </p>
            </div>
          )}

          <iframe
            id="gameIframe"
            key={`${iframeKey}-${effectiveUrl}`}
            ref={iframeRef}
            src={effectiveUrl}
            title={game.title}
            className="w-full h-full border-0 bg-slate-950"
            allow="autoplay; fullscreen; gamepad; focus-without-user-activation; accelerometer; gyroscope"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-slate-950/95 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-300 font-medium">Controls:</strong>{' '}
              {game.controls || 'Use keyboard / mouse'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {sourceMode === 'direct' ? 'Official Embed' : sourceMode === 'proxy' ? 'Proxy Unblocked' : 'Offline Backup'}
            </span>
            <span>&bull;</span>
            <button
              onClick={openInNewTab}
              className="text-slate-400 hover:text-emerald-400 transition-colors underline"
            >
              Open in standalone tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
