import React, { useState, useEffect } from 'react';
import {
  Play,
  Search,
  Flame,
  Gamepad2,
  Music,
  Sparkles,
  ExternalLink,
  Bookmark,
  Check,
  Copy,
  RefreshCw,
  X,
  Radio,
  Tv,
  Film,
  Compass,
} from 'lucide-react';

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration?: string;
  views?: string;
  thumbnail?: string;
  category?: string;
}

interface YouTubeViewProps {
  initialVideoId?: string;
  initialQuery?: string;
  onNavigateUrl: (url: string) => void;
  onAddBookmark: (title: string, url: string) => void;
  isBookmarked: (url: string) => boolean;
}

// Rich fallback collection of popular, school-unblocked friendly YouTube videos
const CURATED_VIDEOS: Record<string, YouTubeVideo[]> = {
  trending: [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      channel: 'Rick Astley',
      duration: '3:33',
      views: '1.5B views',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      category: 'trending',
    },
    {
      id: '0e3GPea1Tyg',
      title: '$456,000 Squid Game In Real Life!',
      channel: 'MrBeast',
      duration: '25:41',
      views: '650M views',
      thumbnail: 'https://img.youtube.com/vi/0e3GPea1Tyg/hqdefault.jpg',
      category: 'trending',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channel: 'Luis Fonsi',
      duration: '4:41',
      views: '8.4B views',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      category: 'trending',
    },
    {
      id: 'hFZFjoX4cGg',
      title: 'World\'s Largest Jello Pool- Can you swim in Jello?',
      channel: 'Mark Rober',
      duration: '11:15',
      views: '142M views',
      thumbnail: 'https://img.youtube.com/vi/hFZFjoX4cGg/hqdefault.jpg',
      category: 'trending',
    },
    {
      id: 'k2qgadSvNyU',
      title: 'Dua Lipa - New Rules (Official Music Video)',
      channel: 'Dua Lipa',
      duration: '3:45',
      views: '3.1B views',
      thumbnail: 'https://img.youtube.com/vi/k2qgadSvNyU/hqdefault.jpg',
      category: 'trending',
    },
    {
      id: 'JGwWNGJdvx8',
      title: 'Shape of You - Ed Sheeran [Official Video]',
      channel: 'Ed Sheeran',
      duration: '4:23',
      views: '6.3B views',
      thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
      category: 'trending',
    },
  ],
  gaming: [
    {
      id: 'MmB9b5njVbA',
      title: 'Minecraft Official Trailer',
      channel: 'Minecraft',
      duration: '1:22',
      views: '172M views',
      thumbnail: 'https://img.youtube.com/vi/MmB9b5njVbA/hqdefault.jpg',
      category: 'gaming',
    },
    {
      id: 'fJg-JtM9Z_I',
      title: '100 Days in Hardcore Minecraft (Full Movie)',
      channel: 'Luke TheNote',
      duration: '42:15',
      views: '38M views',
      thumbnail: 'https://img.youtube.com/vi/fJg-JtM9Z_I/hqdefault.jpg',
      category: 'gaming',
    },
    {
      id: 'V-_O7nl0Ii0',
      title: 'GTA V - Official Trailer',
      channel: 'Rockstar Games',
      duration: '1:24',
      views: '105M views',
      thumbnail: 'https://img.youtube.com/vi/V-_O7nl0Ii0/hqdefault.jpg',
      category: 'gaming',
    },
    {
      id: 'QkkoHAzjnUs',
      title: 'Roblox - Official Launch Trailer',
      channel: 'Roblox',
      duration: '1:06',
      views: '24M views',
      thumbnail: 'https://img.youtube.com/vi/QkkoHAzjnUs/hqdefault.jpg',
      category: 'gaming',
    },
    {
      id: '1rPXZJKS53A',
      title: 'Geometry Dash - Full Soundtrack & Walkthrough',
      channel: 'RobTop Games',
      duration: '18:40',
      views: '12M views',
      thumbnail: 'https://img.youtube.com/vi/1rPXZJKS53A/hqdefault.jpg',
      category: 'gaming',
    },
    {
      id: '3PZ65s2qLTE',
      title: 'Super Mario Odyssey - Jump Up, Super Star!',
      channel: 'Nintendo',
      duration: '4:08',
      views: '45M views',
      thumbnail: 'https://img.youtube.com/vi/3PZ65s2qLTE/hqdefault.jpg',
      category: 'gaming',
    },
  ],
  music: [
    {
      id: 'jfKfPfyJRdk',
      title: 'lofi hip hop radio - beats to relax/study to',
      channel: 'Lofi Girl',
      duration: 'LIVE',
      views: '75K watching',
      thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      category: 'music',
    },
    {
      id: '5yx6BWlEVcY',
      title: 'Chillhop Radio - jazzy & lofi hip hop beats',
      channel: 'Chillhop Music',
      duration: 'LIVE',
      views: '40M views',
      thumbnail: 'https://img.youtube.com/vi/5yx6BWlEVcY/hqdefault.jpg',
      category: 'music',
    },
    {
      id: 'fHI8X4893TS',
      title: 'Syntwave Radio - chill synth / retro beats to work/game to',
      channel: 'Lofi Girl - Synthwave',
      duration: 'LIVE',
      views: '25K watching',
      thumbnail: 'https://img.youtube.com/vi/fHI8X4893TS/hqdefault.jpg',
      category: 'music',
    },
    {
      id: '2Vv-BfVoq4g',
      title: 'Ed Sheeran - Perfect (Official Music Video)',
      channel: 'Ed Sheeran',
      duration: '4:39',
      views: '3.8B views',
      thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
      category: 'music',
    },
    {
      id: 'CevxZvSJLk8',
      title: 'Katy Perry - Roar (Official)',
      channel: 'Katy Perry',
      duration: '4:30',
      views: '4.0B views',
      thumbnail: 'https://img.youtube.com/vi/CevxZvSJLk8/hqdefault.jpg',
      category: 'music',
    },
    {
      id: 'LsoLEjrDogU',
      title: 'Bruno Mars - Uptown Funk ft. Mark Ronson',
      channel: 'Mark Ronson',
      duration: '4:30',
      views: '5.2B views',
      thumbnail: 'https://img.youtube.com/vi/LsoLEjrDogU/hqdefault.jpg',
      category: 'music',
    },
  ],
  science: [
    {
      id: '4_aOIA-vyBo',
      title: 'What If We Detonated All Nuclear Bombs at Once?',
      channel: 'Kurzgesagt – In a Nutshell',
      duration: '11:04',
      views: '35M views',
      thumbnail: 'https://img.youtube.com/vi/4_aOIA-vyBo/hqdefault.jpg',
      category: 'science',
    },
    {
      id: 'bbcpr_i3tWw',
      title: 'The Simplest Math Problem No One Can Solve (Collatz Conjecture)',
      channel: 'Veritasium',
      duration: '22:08',
      views: '42M views',
      thumbnail: 'https://img.youtube.com/vi/bbcpr_i3tWw/hqdefault.jpg',
      category: 'science',
    },
    {
      id: 'sNhhvQGsMEc',
      title: 'The Egg - A Short Story',
      channel: 'Kurzgesagt – In a Nutshell',
      duration: '7:56',
      views: '38M views',
      thumbnail: 'https://img.youtube.com/vi/sNhhvQGsMEc/hqdefault.jpg',
      category: 'science',
    },
    {
      id: 'UBVV8pch1Rs',
      title: 'Can You Solve The 100 Hats Riddle?',
      channel: 'TED-Ed',
      duration: '4:48',
      views: '24M views',
      thumbnail: 'https://img.youtube.com/vi/UBVV8pch1Rs/hqdefault.jpg',
      category: 'science',
    },
  ],
  memes: [
    {
      id: 'QH2-TGUlwu4',
      title: 'Nyan Cat [original]',
      channel: 'saraj00n',
      duration: '3:37',
      views: '215M views',
      thumbnail: 'https://img.youtube.com/vi/QH2-TGUlwu4/hqdefault.jpg',
      category: 'memes',
    },
    {
      id: 'jNQXAC9IVRw',
      title: 'Me at the zoo (The First YouTube Video)',
      channel: 'jawed',
      duration: '0:19',
      views: '320M views',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
      category: 'memes',
    },
    {
      id: '9bZkp7q19f0',
      title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
      channel: 'officialpsy',
      duration: '4:13',
      views: '5.2B views',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
      category: 'memes',
    },
  ],
};

export const YouTubeView: React.FC<YouTubeViewProps> = ({
  initialVideoId,
  initialQuery,
  onNavigateUrl,
  onAddBookmark,
  isBookmarked,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(() => {
    if (initialVideoId) {
      return {
        id: initialVideoId,
        title: 'YouTube Video',
        channel: 'YouTube Creator',
        thumbnail: `https://img.youtube.com/vi/${initialVideoId}/hqdefault.jpg`,
      };
    }
    return null;
  });

  const [activeCategory, setActiveCategory] = useState<string>('trending');
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [urlPasteInput, setUrlPasteInput] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Parse YouTube video ID from URL or text
  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const match = trimmed.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i
    );
    if (match) return match[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    return null;
  };

  // Perform YouTube search via backend API
  const handleSearch = async (query: string) => {
    const q = query.trim();
    if (!q) return;

    // Check if input is a direct video URL or ID
    const extractedId = extractVideoId(q);
    if (extractedId) {
      setSelectedVideo({
        id: extractedId,
        title: 'Custom Video',
        channel: 'YouTube',
        thumbnail: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
      });
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
          setSearchResults(data.videos);
          setActiveCategory('search');
        } else {
          // Fallback search filter in curated
          const allCurated = Object.values(CURATED_VIDEOS).flat();
          const filtered = allCurated.filter((v) =>
            v.title.toLowerCase().includes(q.toLowerCase()) ||
            v.channel.toLowerCase().includes(q.toLowerCase())
          );
          setSearchResults(filtered.length > 0 ? filtered : allCurated);
          setActiveCategory('search');
        }
      }
    } catch {
      // Fallback
      const allCurated = Object.values(CURATED_VIDEOS).flat();
      setSearchResults(allCurated);
      setActiveCategory('search');
    } finally {
      setIsSearching(false);
    }
  };

  // Run initial search or initial video
  useEffect(() => {
    if (initialVideoId) {
      setSelectedVideo({
        id: initialVideoId,
        title: 'Playing Video',
        channel: 'YouTube',
        thumbnail: `https://img.youtube.com/vi/${initialVideoId}/hqdefault.jpg`,
      });
    } else if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialVideoId, initialQuery]);

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(urlPasteInput);
    if (id) {
      setSelectedVideo({
        id,
        title: `YouTube Video (${id})`,
        channel: 'YouTube',
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      });
      setUrlPasteInput('');
    } else {
      handleSearch(urlPasteInput);
    }
  };

  const handleCopyLink = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(videoId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Determine current displayed video list
  const currentVideos =
    activeCategory === 'search'
      ? searchResults
      : CURATED_VIDEOS[activeCategory] || CURATED_VIDEOS.trending;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto select-text">
      {/* Top Banner & Search Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">YouTube</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  UNBLOCKED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zero blocks • Full HD • Privacy Player</p>
            </div>
          </div>

          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="flex-1 max-w-xl w-full flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, music, channels or paste YouTube link..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-red-600/20"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Quick Paste Video Input */}
          <form
            onSubmit={handlePasteSubmit}
            className="hidden lg:flex items-center gap-1.5 bg-slate-950 border border-slate-800/80 rounded-xl p-1 shrink-0"
          >
            <input
              type="text"
              value={urlPasteInput}
              onChange={(e) => setUrlPasteInput(e.target.value)}
              placeholder="Paste watch?v=..."
              className="bg-transparent border-none px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none w-36"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors"
            >
              Play
            </button>
          </form>
        </div>

        {/* Category Pills Bar */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'trending', label: 'Trending', icon: Flame },
            { id: 'gaming', label: 'Gaming & Minecraft', icon: Gamepad2 },
            { id: 'music', label: 'Music & Lo-Fi', icon: Music },
            { id: 'science', label: 'Science & Education', icon: Sparkles },
            { id: 'memes', label: 'Memes & Classics', icon: Film },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (activeCategory === 'search') setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}

          {searchResults.length > 0 && (
            <button
              onClick={() => setActiveCategory('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'search'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Search Results ({searchResults.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Active Theater Video Player */}
        {selectedVideo && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* 16:9 Video Frame */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1&rel=0&enablejsapi=1`}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            </div>

            {/* Video Controls & Info Bar */}
            <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90">
              <div className="space-y-1 max-w-2xl">
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
                  {selectedVideo.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-red-400">{selectedVideo.channel}</span>
                  {selectedVideo.views && <span>• {selectedVideo.views}</span>}
                  {selectedVideo.duration && <span>• {selectedVideo.duration}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* Copy Link */}
                <button
                  onClick={() => handleCopyLink(selectedVideo.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Copy YouTube Link"
                >
                  {copiedId === selectedVideo.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {/* Bookmark Video */}
                <button
                  onClick={() =>
                    onAddBookmark(
                      selectedVideo.title,
                      `https://www.youtube.com/watch?v=${selectedVideo.id}`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bookmark</span>
                </button>

                {/* Direct Embed Open in Tab */}
                <button
                  onClick={() =>
                    onNavigateUrl(`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1`)
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="View pure fullscreen embed"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Pure Embed</span>
                </button>

                {/* Close Player */}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                  title="Close Player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white capitalize flex items-center gap-2">
              {activeCategory === 'search' ? (
                <>
                  <Search className="w-4 h-4 text-red-500" />
                  Search Results for "{searchQuery}"
                </>
              ) : (
                <>
                  <Tv className="w-4 h-4 text-red-500" />
                  {activeCategory} Videos
                </>
              )}
            </h3>
            <span className="text-xs text-slate-500">({currentVideos.length} videos)</span>
          </div>

          <p className="text-[11px] text-slate-400 hidden sm:block">
            Click any video thumbnail to watch immediately
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {currentVideos.map((video) => {
            const isPlaying = selectedVideo?.id === video.id;
            return (
              <div
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group cursor-pointer rounded-xl bg-slate-900/80 border ${
                  isPlaying
                    ? 'border-red-500 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10'
                    : 'border-slate-800/80 hover:border-slate-700'
                } overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 flex flex-col`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={
                      video.thumbnail ||
                      `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                    }
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Play Overlay Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-bold text-white">
                      {video.duration}
                    </div>
                  )}

                  {/* Playing Indicator Badge */}
                  {isPlaying && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Radio className="w-3 h-3 animate-pulse" />
                      Now Playing
                    </div>
                  )}
                </div>

                {/* Video Info Card */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-red-400 line-clamp-2 leading-snug transition-colors">
                    {video.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="font-medium text-slate-300 truncate max-w-[140px]">
                      {video.channel}
                    </span>
                    {video.views && <span>{video.views}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
