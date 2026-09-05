import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  ExternalLink,
  Star,
  Maximize2,
  Minimize2,
  Shield,
  ShieldCheck,
  Globe,
  Bookmark as BookmarkIcon,
  Trash2,
  Compass,
  Sparkles,
  Gamepad2,
  Eye,
  Zap,
  Check,
  RotateCcw,
  Play,
  Tv,
} from 'lucide-react';
import { BrowserTab, Bookmark, Game } from '../types.ts';
import { YouTubeView } from './browser/YouTubeView.tsx';

interface WebBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  initialUrl?: string;
}

const DEFAULT_HOME_URL = 'tralalala://home';
const DEFAULT_YOUTUBE_URL = 'tralalala://youtube';

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-youtube',
    title: 'YouTube (Unblocked)',
    url: 'tralalala://youtube',
    category: 'Media & Video',
    description: 'Watch any YouTube video, listen to music, and browse in full HD with zero blocks.',
  },
  {
    id: 'bm-ddg-html',
    title: 'DuckDuckGo (Fast & Unblocked)',
    url: 'https://html.duckduckgo.com/html/',
    category: 'Search & Tools',
    description: 'Ultra-fast, privacy-first web search engine unblocked through proxy.',
  },
  {
    id: 'bm-wiki',
    title: 'Wikipedia Mobile',
    url: 'https://en.m.wikipedia.org',
    category: 'Reference',
    description: 'The free encyclopedia, clean format unblocked for iframe reading.',
  },
  {
    id: 'bm-archive',
    title: 'Internet Archive / Wayback',
    url: 'https://web.archive.org',
    category: 'Reference',
    description: 'Explore billions of archived web pages, retro games, and classics.',
  },
  {
    id: 'bm-desmos',
    title: 'Desmos Graphing Calc',
    url: 'https://www.desmos.com/calculator',
    category: 'Utilities',
    description: 'High performance math, graph plotter, and scientific calculator.',
  },
  {
    id: 'bm-maths',
    title: 'Math is Fun',
    url: 'https://www.mathsisfun.com',
    category: 'Educational',
    description: 'Puzzles, geometry, algebra, and interactive educational activities.',
  },
  {
    id: 'bm-w3',
    title: 'W3Schools Code Editor',
    url: 'https://www.w3schools.com/tryit/',
    category: 'Development',
    description: 'Interactive HTML, CSS, and JavaScript live testing playground.',
  },
  {
    id: 'bm-scratch',
    title: 'Scratch MIT Explore',
    url: 'https://scratch.mit.edu/explore/projects/all',
    category: 'Creative',
    description: 'Explore and play community games and creative animations.',
  },
  {
    id: 'bm-hn',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    category: 'Search & Tools',
    description: 'Lightweight tech news, programming discussions, and links.',
  },
  {
    id: 'bm-shadertoy',
    title: 'Shadertoy WebGL',
    url: 'https://www.shadertoy.com/browse',
    category: 'Creative',
    description: 'Real-time raymarching and 3D computer graphics demos.',
  },
  {
    id: 'bm-gutenberg',
    title: 'Project Gutenberg',
    url: 'https://www.gutenberg.org',
    category: 'Reference',
    description: 'Library of over 70,000 free public domain eBooks.',
  },
];

type SearchEngine = 'ddg_html' | 'ddg_web' | 'google' | 'bing' | 'wiki';

export const WebBrowserModal: React.FC<WebBrowserModalProps> = ({
  isOpen,
  onClose,
  games,
  initialUrl,
}) => {
  // Search Engine preference
  const [searchEngine, setSearchEngine] = useState<SearchEngine>('ddg_html');

  // Helper to compute iframe src url
  const computeIframeSrc = (url: string, mode: 'proxy' | 'direct' = 'proxy') => {
    if (!url || url === DEFAULT_HOME_URL || url.startsWith('tralalala://')) return '';
    if (url.startsWith('/')) {
      return url;
    }
    if (mode === 'direct') {
      return url;
    }
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  // Tabs State
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: initialUrl || DEFAULT_HOME_URL,
      appliedSrc: initialUrl ? (initialUrl.startsWith('/') || initialUrl.startsWith('tralalala://') ? initialUrl : `/api/proxy?url=${encodeURIComponent(initialUrl)}`) : '',
      history: [initialUrl || DEFAULT_HOME_URL],
      historyIndex: 0,
      mode: 'proxy',
      isLoading: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Omnibox URL input for active tab
  const [urlInput, setUrlInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCloaked, setIsCloaked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Custom Bookmarks stored in localStorage
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('tralalala_browser_bookmarks');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  // New Bookmark form modal
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBmTitle, setNewBmTitle] = useState('');
  const [newBmUrl, setNewBmUrl] = useState('');

  // Find active tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Update input text whenever active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url === DEFAULT_HOME_URL ? '' : activeTab.url);
    }
  }, [activeTabId, activeTab?.url]);

  // Handle messages posted from our unblocking proxy iframe interceptor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TRALALALA_NAVIGATE') {
        const { url: navigatedUrl, title: pageTitle, fromIframe } = event.data;
        if (!navigatedUrl) return;

        setTabs((prev) =>
          prev.map((tab) => {
            if (tab.id !== activeTabId) return tab;

            const newTitle = pageTitle && pageTitle !== 'Page' ? pageTitle : tab.title;

            // If already on this URL, just update title if changed
            if (tab.url === navigatedUrl) {
              return {
                ...tab,
                title: newTitle,
                isLoading: false,
              };
            }

            const newHistory = tab.history.slice(0, tab.historyIndex + 1);
            newHistory.push(navigatedUrl);
            return {
              ...tab,
              url: navigatedUrl,
              title: newTitle || getDisplayHost(navigatedUrl),
              history: newHistory,
              historyIndex: newHistory.length - 1,
              isLoading: false,
              // If navigation came from inside iframe, preserve appliedSrc so iframe isn't re-mounted
              appliedSrc: fromIframe ? tab.appliedSrc : computeIframeSrc(navigatedUrl, tab.mode),
            };
          })
        );
        setUrlInput(navigatedUrl === DEFAULT_HOME_URL ? '' : navigatedUrl);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTabId]);

  // If an initialUrl is passed dynamically when opening
  useEffect(() => {
    if (initialUrl && isOpen) {
      handleNewTab(initialUrl);
    }
  }, [initialUrl, isOpen]);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('tralalala_browser_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Could not save browser bookmarks', e);
    }
  }, [bookmarks]);

  // Handle ESC or keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen) return null;

  // Helper to extract query parameters from internal tralalala URLs
  const getYoutubeParam = (url: string, param: string): string | undefined => {
    try {
      const qIndex = url.indexOf('?');
      if (qIndex === -1) return undefined;
      const params = new URLSearchParams(url.slice(qIndex));
      return params.get(param) || undefined;
    } catch {
      return undefined;
    }
  };

  // Format URL helper
  const normalizeUrl = (input: string, engine: SearchEngine = searchEngine): string => {
    const trimmed = input.trim();
    if (!trimmed) return DEFAULT_HOME_URL;
    if (trimmed.startsWith('tralalala://')) return trimmed;

    // Check for YouTube domain or keyword
    const lower = trimmed.toLowerCase();
    if (
      lower === 'youtube' ||
      lower === 'youtube.com' ||
      lower === 'www.youtube.com' ||
      lower === 'm.youtube.com' ||
      lower === 'https://youtube.com' ||
      lower === 'https://www.youtube.com' ||
      lower === 'https://m.youtube.com' ||
      lower === 'http://youtube.com' ||
      lower === 'http://www.youtube.com' ||
      lower === 'https://youtube.com/' ||
      lower === 'https://www.youtube.com/'
    ) {
      return DEFAULT_YOUTUBE_URL;
    }

    // Check if input is a YouTube video link (watch?v=, youtu.be/, shorts/)
    const ytMatch = trimmed.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `tralalala://youtube?v=${ytMatch[1]}`;
    }

    // Internal games or local files
    if (trimmed.startsWith('/') || trimmed.endsWith('.html')) {
      return trimmed;
    }

    // Explicit protocol
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    // Domain name (e.g. "wikipedia.org", "news.ycombinator.com", "desmos.com")
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      return `https://${trimmed}`;
    }

    // Search query routing
    switch (engine) {
      case 'google':
        return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      case 'bing':
        return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
      case 'wiki':
        return `https://en.m.wikipedia.org/w/index.php?search=${encodeURIComponent(trimmed)}`;
      case 'ddg_web':
        return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
      case 'ddg_html':
      default:
        // DuckDuckGo HTML is ultra-fast, zero-JS, and works 100% reliably in proxied iframes
        return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
    }
  };

  const navigateTo = (destination: string, customMode?: 'proxy' | 'direct') => {
    const validUrl = normalizeUrl(destination);
    const isInternal = validUrl.startsWith('/') || validUrl.startsWith('tralalala://');
    const mode = customMode || (isInternal ? 'direct' : activeTab?.mode || 'proxy');
    const src = computeIframeSrc(validUrl, mode);

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(validUrl);
        return {
          ...tab,
          url: validUrl,
          appliedSrc: src,
          title: validUrl === DEFAULT_HOME_URL ? 'New Tab' : getDisplayHost(validUrl),
          history: newHistory,
          historyIndex: newHistory.length - 1,
          mode,
          isLoading: validUrl !== DEFAULT_HOME_URL,
        };
      })
    );
    setUrlInput(validUrl === DEFAULT_HOME_URL ? '' : validUrl);
    setReloadKey((prev) => prev + 1);
  };

  const handleBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const nextIndex = activeTab.historyIndex - 1;
    const targetUrl = activeTab.history[nextIndex];
    const src = computeIframeSrc(targetUrl, activeTab.mode);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: targetUrl,
              appliedSrc: src,
              title: targetUrl === DEFAULT_HOME_URL ? 'New Tab' : getDisplayHost(targetUrl),
              historyIndex: nextIndex,
              isLoading: targetUrl !== DEFAULT_HOME_URL,
            }
          : t
      )
    );
    setUrlInput(targetUrl === DEFAULT_HOME_URL ? '' : targetUrl);
  };

  const handleForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const nextIndex = activeTab.historyIndex + 1;
    const targetUrl = activeTab.history[nextIndex];
    const src = computeIframeSrc(targetUrl, activeTab.mode);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: targetUrl,
              appliedSrc: src,
              title: targetUrl === DEFAULT_HOME_URL ? 'New Tab' : getDisplayHost(targetUrl),
              historyIndex: nextIndex,
              isLoading: targetUrl !== DEFAULT_HOME_URL,
            }
          : t
      )
    );
    setUrlInput(targetUrl === DEFAULT_HOME_URL ? '' : targetUrl);
  };

  const handleReload = () => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              appliedSrc: computeIframeSrc(t.url, t.mode),
              isLoading: true,
            }
          : t
      )
    );
    setReloadKey((k) => k + 1);
  };

  const handleHome = () => {
    navigateTo(DEFAULT_HOME_URL);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      handleHome();
      return;
    }
    navigateTo(urlInput);
  };

  // Toggle Proxy Mode vs Direct Mode for active tab
  const handleToggleProxyMode = () => {
    if (!activeTab) return;
    const newMode = activeTab.mode === 'direct' ? 'proxy' : 'direct';
    const src = computeIframeSrc(activeTab.url, newMode);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, mode: newMode, appliedSrc: src, isLoading: true } : t
      )
    );
    setReloadKey((k) => k + 1);
  };

  // Add new tab
  const handleNewTab = (customUrl?: string) => {
    const newId = `tab-${Date.now()}`;
    const targetUrl = customUrl || DEFAULT_HOME_URL;
    const isInternal = targetUrl.startsWith('/') || targetUrl.startsWith('tralalala://');
    const mode = isInternal ? 'direct' : 'proxy';
    const newTab: BrowserTab = {
      id: newId,
      title: targetUrl === DEFAULT_HOME_URL ? 'New Tab' : getDisplayHost(targetUrl),
      url: targetUrl,
      appliedSrc: computeIframeSrc(targetUrl, mode),
      history: [targetUrl],
      historyIndex: 0,
      mode,
      isLoading: targetUrl !== DEFAULT_HOME_URL,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // Close tab
  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // If closing last tab, reset to home
      setTabs([
        {
          id: `tab-${Date.now()}`,
          title: 'New Tab',
          url: DEFAULT_HOME_URL,
          appliedSrc: '',
          history: [DEFAULT_HOME_URL],
          historyIndex: 0,
          mode: 'proxy',
          isLoading: false,
        },
      ]);
      return;
    }

    const filtered = tabs.filter((t) => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  function getDisplayHost(url: string): string {
    if (!url || url === DEFAULT_HOME_URL) return 'Home';
    if (url.startsWith('tralalala://youtube')) return 'YouTube';
    try {
      if (url.startsWith('/')) {
        const parts = url.split('/');
        return parts[parts.length - 1].replace('.html', '') || 'Game';
      }
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url.slice(0, 18);
    }
  }

  // Generate the actual iframe src: routes through our unblocking proxy if in proxy mode
  const getIframeSrc = (tab: BrowserTab) => {
    if (!tab.url || tab.url === DEFAULT_HOME_URL || tab.url.startsWith('tralalala://')) return '';
    if (tab.url.startsWith('/')) {
      return tab.url;
    }
    if (tab.mode === 'direct') {
      return tab.url;
    }
    return `/api/proxy?url=${encodeURIComponent(tab.url)}`;
  };

  // Bookmark toggle for active tab
  const isCurrentBookmarked = bookmarks.some((b) => b.url === activeTab?.url);

  const toggleBookmarkCurrent = () => {
    if (!activeTab || activeTab.url === DEFAULT_HOME_URL) return;
    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        title: activeTab.title || getDisplayHost(activeTab.url),
        url: activeTab.url,
        category: 'Saved Bookmarks',
      };
      setBookmarks((prev) => [...prev, newBm]);
    }
  };

  const handleAddCustomBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBmTitle.trim() || !newBmUrl.trim()) return;
    const formattedUrl = normalizeUrl(newBmUrl);
    const item: Bookmark = {
      id: `bm-${Date.now()}`,
      title: newBmTitle.trim(),
      url: formattedUrl,
      category: 'Custom Sites',
    };
    setBookmarks((prev) => [...prev, item]);
    setNewBmTitle('');
    setNewBmUrl('');
    setIsAddingBookmark(false);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const isHomePage = !activeTab || activeTab.url === DEFAULT_HOME_URL;
  const isYouTubePage = Boolean(activeTab?.url?.startsWith('tralalala://youtube'));
  const isInternalPage = isHomePage || isYouTubePage;
  const isProxyActive = activeTab?.mode !== 'direct';

  return (
    <div
      id="webBrowserModal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-3"
    >
      <div
        className={`w-full bg-slate-950 border border-slate-800 shadow-2xl flex flex-col transition-all overflow-hidden ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none h-full'
            : 'h-full md:h-[94vh] max-w-7xl md:rounded-2xl'
        }`}
      >
        {/* Top Window Title & Tab Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 pt-2.5 flex items-center justify-between select-none">
          {/* Tabs Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[calc(100%-140px)]">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const isTabYouTube = Boolean(tab.url?.startsWith('tralalala://youtube'));
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-semibold cursor-pointer border-t border-x transition-all max-w-[180px] min-w-[110px] truncate ${
                    isActive
                      ? isTabYouTube
                        ? 'bg-slate-950 text-red-400 border-slate-800 shadow-sm'
                        : 'bg-slate-950 text-emerald-400 border-slate-800 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                  title={tab.url}
                >
                  {isTabYouTube ? (
                    <Play className="w-3.5 h-3.5 shrink-0 text-red-500 fill-red-500" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-400/80" />
                  )}
                  <span className="truncate flex-1">
                    {isCloaked ? 'Google Classroom' : isTabYouTube ? 'YouTube' : tab.title}
                  </span>
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
                    title="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Add Tab Button */}
            <button
              onClick={() => handleNewTab()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0 ml-1"
              title="New Tab"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 pb-1.5">
            {/* Cloak / Stealth Mode Button */}
            <button
              onClick={() => setIsCloaked(!isCloaked)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                isCloaked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Disguise tab titles"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCloaked ? 'Cloaked' : 'Stealth'}</span>
            </button>

            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close window */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 border border-rose-900/40 transition-all"
              title="Close Browser"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation & Omnibox Toolbar */}
        <div className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center gap-2 relative">
          {/* Nav Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleBack}
              disabled={!activeTab || activeTab.historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleForward}
              disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Reload Page"
            >
              <RotateCw className={`w-4 h-4 ${activeTab?.isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={handleHome}
              className={`p-1.5 rounded-lg transition-all ${
                isHomePage
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Browser Home"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo(DEFAULT_YOUTUBE_URL)}
              className={`p-1.5 rounded-lg transition-all ${
                isYouTubePage
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="YouTube (Unblocked)"
            >
              <Tv className="w-4 h-4" />
            </button>
          </div>

          {/* Omnibox / Search & URL Input */}
          <form onSubmit={handleUrlSubmit} className="flex-1 relative flex items-center">
            {/* Status indicator pill in Omnibox */}
            {!isInternalPage ? (
              <div
                className="absolute left-2.5 flex items-center gap-1 text-xs cursor-pointer select-none"
                onClick={handleToggleProxyMode}
                title={
                  isProxyActive
                    ? 'Proxy Active: Bypassing X-Frame-Options & CORS blocks. Click to toggle Direct Mode.'
                    : 'Direct Mode: Direct iframe connection. Click to toggle Proxy Unblocker.'
                }
              >
                {isProxyActive ? (
                  <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="hidden sm:inline">PROXY</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-400 font-mono text-[10px] bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                    <Zap className="w-3 h-3" />
                    <span className="hidden sm:inline">DIRECT</span>
                  </div>
                )}
              </div>
            ) : isYouTubePage ? (
              <div className="absolute left-2.5 flex items-center gap-1 text-red-400 font-mono text-[10px] bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded-md select-none">
                <Play className="w-3 h-3 fill-red-400" />
                <span className="hidden sm:inline">YOUTUBE</span>
              </div>
            ) : null}

            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Search, enter URL, or paste YouTube link..."
              className={`w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm ${
                !isInternalPage || isYouTubePage ? 'pl-20 sm:pl-24' : 'pl-4'
              } pr-16 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40 transition-all font-mono placeholder:font-sans placeholder:text-slate-500`}
            />

            {/* Quick Actions in Omnibox */}
            <div className="absolute right-2 flex items-center gap-1">
              {!isHomePage && (
                <button
                  type="button"
                  onClick={toggleBookmarkCurrent}
                  className={`p-1 rounded transition-colors ${
                    isCurrentBookmarked
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={isCurrentBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                >
                  <Star className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-amber-400' : ''}`} />
                </button>
              )}
              <button
                type="submit"
                className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all"
              >
                Go
              </button>
            </div>
          </form>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle Proxy Button */}
            {!isInternalPage && (
              <button
                onClick={handleToggleProxyMode}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                  isProxyActive
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title={isProxyActive ? 'Using Proxy Unblocker' : 'Using Direct Embed'}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{isProxyActive ? 'Unblocker: On' : 'Direct'}</span>
              </button>
            )}

            {/* Bookmarks drawer toggle */}
            <button
              onClick={() => setShowBookmarksDrawer(!showBookmarksDrawer)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                showBookmarksDrawer
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
              }`}
              title="Saved Bookmarks"
            >
              <BookmarkIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bookmarks</span>
            </button>

            {/* Open in Real Browser Tab */}
            {!isInternalPage && (
              <a
                href={activeTab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center gap-1 text-xs"
                title="Open directly in browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">External</span>
              </a>
            )}
          </div>

          {/* Loading Progress Bar */}
          {activeTab?.isLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-400 animate-pulse w-2/3" />
            </div>
          )}
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex">
          {/* Main Web View / Home Dashboard */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {isHomePage ? (
              /* HOME / QUICK-DIAL DASHBOARD */
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl flex flex-col gap-8">
                  {/* Hero Header */}
                  <div className="text-center space-y-2 mt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Unblocked Web Engine</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Browse Any Site Unblocked
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                      Powered by an integrated proxy that bypasses X-Frame-Options, CSP restrictions, and allows you to search and view the live web inside your arcade.
                    </p>
                  </div>

                  {/* Big Search Input with Engine Selection */}
                  <div className="w-full max-w-2xl mx-auto space-y-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                        if (query) navigateTo(query);
                      }}
                      className="w-full"
                    >
                      <div className="relative flex items-center">
                        <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                        <input
                          name="search"
                          type="text"
                          placeholder="Search anything or type a website address..."
                          className="w-full pl-12 pr-24 py-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-lg"
                        />
                        <button
                          type="submit"
                          className="absolute right-2.5 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all active:scale-95 shadow"
                        >
                          Search
                        </button>
                      </div>
                    </form>

                    {/* Search Engine Badges */}
                    <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-1">
                        Search via:
                      </span>
                      {[
                        { id: 'ddg_html', label: 'DuckDuckGo Fast (Unblocked)' },
                        { id: 'ddg_web', label: 'DuckDuckGo Web' },
                        { id: 'google', label: 'Google' },
                        { id: 'bing', label: 'Bing' },
                        { id: 'wiki', label: 'Wikipedia' },
                      ].map((eng) => (
                        <button
                          key={eng.id}
                          type="button"
                          onClick={() => setSearchEngine(eng.id as SearchEngine)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            searchEngine === eng.id
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {eng.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick-Dial Recommended Sites */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Featured Unblocked Web Resources</span>
                      </h3>
                      <button
                        onClick={() => setIsAddingBookmark(true)}
                        className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bookmark</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bookmarks.slice(0, 9).map((bm) => (
                        <div
                          key={bm.id}
                          onClick={() => navigateTo(bm.url)}
                          className="group p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between gap-2 text-left shadow-sm"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-200 text-xs group-hover:text-emerald-400 transition-colors truncate">
                                {bm.title}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {bm.description || bm.url}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span className="truncate">{getDisplayHost(bm.url)}</span>
                            <span className="text-emerald-400/80 font-sans font-medium">{bm.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Launch Local Arcade Games Inside Tabs */}
                  <div className="space-y-3 pb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Launch Tralalala Games in Browser Tabs</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      {games.slice(0, 6).map((game) => (
                        <button
                          key={game.id}
                          onClick={() => handleNewTab(game.url)}
                          className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-850 transition-all flex flex-col items-center text-center gap-1.5 group"
                        >
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-800 group-hover:scale-105 transition-transform"
                          />
                          <span className="text-[11px] font-semibold text-slate-300 group-hover:text-sky-300 truncate w-full">
                            {game.title}
                          </span>
                          <span className="text-[9px] text-slate-500">{game.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : isYouTubePage ? (
              /* YOUTUBE UNBLOCKED HUB */
              <div className="flex-1 w-full h-full relative flex flex-col bg-slate-950 overflow-hidden">
                <YouTubeView
                  initialVideoId={getYoutubeParam(activeTab.url, 'v')}
                  initialQuery={getYoutubeParam(activeTab.url, 'q')}
                  onNavigateUrl={(url) => navigateTo(url)}
                  onAddBookmark={(title, url) => {
                    const newBm: Bookmark = {
                      id: `bm-${Date.now()}`,
                      title,
                      url,
                      category: 'Media & Video',
                    };
                    setBookmarks((prev) => [...prev.filter((b) => b.url !== url), newBm]);
                  }}
                  isBookmarked={(url) => bookmarks.some((b) => b.url === url)}
                />
              </div>
            ) : (
              /* ACTIVE IFRAME EMBED VIEW */
              <div className="flex-1 w-full h-full relative flex flex-col bg-slate-950">
                {/* Embed Sandbox Iframe with Proxy URL */}
                <iframe
                  ref={iframeRef}
                  key={`${activeTab.id}-${reloadKey}`}
                  src={activeTab.appliedSrc || getIframeSrc(activeTab)}
                  onLoad={() => {
                    setTabs((prev) =>
                      prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
                    );
                  }}
                  className="w-full h-full border-0 flex-1 bg-white"
                  title={activeTab.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals allow-downloads allow-presentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad"
                />

                {/* Bottom Frame Advisory / Unblocker Status Bar */}
                <div className="bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`flex h-2 w-2 rounded-full shrink-0 ${
                        isProxyActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-mono text-slate-300 truncate">{activeTab.url}</span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      ({isProxyActive ? 'Unblocked via Proxy' : 'Direct Embed'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    {/* Toggle Mode Button */}
                    <button
                      onClick={handleToggleProxyMode}
                      className="px-2 py-0.5 rounded font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-[10px]"
                    >
                      {isProxyActive ? 'Switch to Direct' : 'Switch to Proxy'}
                    </button>

                    <a
                      href={activeTab.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded font-bold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 flex items-center gap-1 transition-all text-[10px]"
                      title="Open page in a real browser tab"
                    >
                      <span>Open External Tab</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bookmarks Drawer (collapsible side panel) */}
          {showBookmarksDrawer && (
            <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-20 shadow-xl">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookmarkIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bookmarks ({bookmarks.length})</span>
                </span>
                <button
                  onClick={() => setIsAddingBookmark(true)}
                  className="p-1 rounded hover:bg-slate-800 text-emerald-400 text-xs flex items-center gap-1"
                  title="Add Bookmark"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => {
                      navigateTo(bm.url);
                      setShowBookmarksDrawer(false);
                    }}
                    className="group p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between text-left"
                  >
                    <div className="truncate flex-1 pr-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 truncate">
                        {bm.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{bm.url}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBookmark(bm.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Bookmark Modal */}
        {isAddingBookmark && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Add Bookmark</span>
                </h4>
                <button
                  onClick={() => setIsAddingBookmark(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomBookmark} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Site Title</label>
                  <input
                    type="text"
                    required
                    value={newBmTitle}
                    onChange={(e) => setNewBmTitle(e.target.value)}
                    placeholder="e.g. My Favorite Site"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">URL</label>
                  <input
                    type="text"
                    required
                    value={newBmUrl}
                    onChange={(e) => setNewBmUrl(e.target.value)}
                    placeholder="e.g. wikipedia.org or full https://..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingBookmark(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  >
                    Save Bookmark
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
