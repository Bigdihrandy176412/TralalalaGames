export interface Game {
  id: string;
  title: string;
  category: string;
  description: string;
  controls?: string;
  image: string;
  url: string;
  featured?: boolean;
  isCustom?: boolean;
  isRealGame?: boolean;
  realSource?: string;
  backupUrl?: string;
}

export type Category = 'All' | 'Real Games' | 'Sports' | 'Arcade' | 'Puzzle' | 'Classic' | 'Action' | 'Retro' | 'Clicker' | 'Favorites';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  appliedSrc?: string;
  history: string[];
  historyIndex: number;
  mode?: 'proxy' | 'direct';
  isLoading?: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category?: string;
  description?: string;
}
