import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Copy,
  Check,
  Download,
  Code2,
  ExternalLink,
  FolderArchive,
  Terminal,
  FileCode,
} from 'lucide-react';
import { Game } from '../types.ts';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({
  isOpen,
  onClose,
  games,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'code'>('guide');
  const [selectedFile, setSelectedFile] = useState<'index.html' | 'style.css' | 'script.js' | 'games.json'>('games.json');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getFileContent = (fileName: string): string => {
    if (fileName === 'games.json') {
      return JSON.stringify(
        games.map((g) => ({
          title: g.title,
          category: g.category,
          image: g.image,
          url: g.url,
          description: g.description,
          controls: g.controls,
        })),
        null,
        2
      );
    }
    if (fileName === 'index.html') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tralalala Games</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>Tralalala Games</h1>
    <input type="text" id="searchBar" placeholder="Search for a game..." />
  </header>

  <div id="gameGrid" class="game-grid">
    <!-- Games are injected here -->
  </div>

  <!-- The Iframe Container (Overlay) -->
  <div id="gameModal" class="modal hidden">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="currentTitle">Game Name</h2>
        <div class="modal-actions">
          <button id="openNewTabBtn">Open in New Tab</button>
          <button id="closeBtn">Close &times;</button>
        </div>
      </div>
      <iframe id="gameIframe" src="" frameborder="0" allowfullscreen></iframe>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`;
    }
    if (fileName === 'style.css') {
      return `body {
  background-color: #0b0f19;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
}

header {
  background: #111827;
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid #1f2937;
}

header h1 {
  margin: 0 0 12px 0;
  font-size: 1.75rem;
  color: #10b981;
}

#searchBar {
  width: 90%;
  max-width: 440px;
  padding: 10px 16px;
  border-radius: 9999px;
  border: 1px solid #374151;
  background: #1f2937;
  color: #fff;
  font-size: 0.95rem;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 28px;
  max-width: 1200px;
  margin: 0 auto;
}

.game-card {
  background: #111827;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  border: 1px solid #1f2937;
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: #10b981;
}

.game-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.game-card h3 {
  font-size: 0.95rem;
  margin: 10px 12px 4px 12px;
}

.game-card p {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0 12px 12px 12px;
}

/* Modal Styling */
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(3, 7, 18, 0.94);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hidden { display: none; }

.modal-content {
  width: 92%;
  height: 90%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  background: #111827;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #374151;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #0f172a;
  border-bottom: 1px solid #1f2937;
}

.modal-header h2 { margin: 0; font-size: 1.1rem; color: #fff; }

.modal-actions { display: flex; gap: 8px; }

#openNewTabBtn {
  background: #374151;
  color: #fff;
  border: none;
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 6px;
  cursor: pointer;
}

#closeBtn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 6px;
}

#gameIframe {
  flex-grow: 1;
  background: #000;
  border: none;
}`;
    }
    if (fileName === 'script.js') {
      return `const gameGrid = document.getElementById('gameGrid');
const searchBar = document.getElementById('searchBar');
const gameModal = document.getElementById('gameModal');
const gameIframe = document.getElementById('gameIframe');
const closeBtn = document.getElementById('closeBtn');
const openNewTabBtn = document.getElementById('openNewTabBtn');
const currentTitle = document.getElementById('currentTitle');

let allGames = [];
let currentUrl = '';

// 1. Fetch the JSON data
async function fetchGames() {
  try {
    const response = await fetch('games.json');
    allGames = await response.json();
    renderGames(allGames);
  } catch (error) {
    console.error('Failed to load games list:', error);
  }
}

// 2. Render games to the HTML grid
function renderGames(gamesList) {
  gameGrid.innerHTML = '';
  gamesList.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = \`
      <img src="\${game.image}" alt="\${game.title}">
      <h3>\${game.title}</h3>
      <p>\${game.category || 'Arcade'}</p>
    \`;
    card.addEventListener('click', () => {
      openGame(game.title, game.url);
    });
    gameGrid.appendChild(card);
  });
}

// 3. Open the game in the iframe
function openGame(title, url) {
  currentTitle.innerText = title;
  currentUrl = url;
  gameIframe.src = url;
  gameModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// 4. Close the game
closeBtn.addEventListener('click', () => {
  gameModal.classList.add('hidden');
  gameIframe.src = '';
  document.body.style.overflow = 'auto';
});

// 5. Open in New Tab
if (openNewTabBtn) {
  openNewTabBtn.addEventListener('click', () => {
    if (currentUrl) window.open(currentUrl, '_blank');
  });
}

// 6. Search Filter
searchBar.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allGames.filter(g =>
    g.title.toLowerCase().includes(query) ||
    (g.category && g.category.toLowerCase().includes(query))
  );
  renderGames(filtered);
});

fetchGames();`;
    }
    return '';
  };

  const downloadFile = (fileName: string) => {
    const content = getFileContent(fileName);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const gitCliSnippet = `# 1. Initialize git in your project folder
git init -b main

# 2. Add files and commit
git add .
git commit -m "Initial commit of unblocked games website"

# 3. Create a GitHub repository using GitHub CLI (or manually on github.com)
gh repo create my-unblocked-games --public --source=. --remote=origin --push

# 4. Enable GitHub Pages on the 'main' branch in repo Settings -> Pages`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                Deploy Website to GitHub
              </h3>
              <p className="text-xs text-slate-400">
                Deploy to GitHub Pages or export the 4 core files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'guide'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Deployment Steps
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'code'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw Files ({selectedFile})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {activeTab === 'guide' ? (
            <>
              {/* Option A: Google AI Studio Export */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-300 text-sm mb-1">
                      Direct AI Studio Export to GitHub
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You can directly push this entire live repository to GitHub without manual downloads:
                      open the <strong>AI Studio Settings Menu</strong> (top-right of your workspace), select <strong>Export to GitHub</strong>, connect your GitHub account, and choose your repository name!
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B: Git CLI command */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    Deploy via Git Commands
                  </h4>
                  <button
                    onClick={() => copyToClipboard(gitCliSnippet, 'cli')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400"
                  >
                    {copiedSection === 'cli' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                  {gitCliSnippet}
                </pre>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 text-sm">Step-by-Step GitHub Pages Setup</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-emerald-400 mb-1">1. Create Repo</div>
                    <p className="text-slate-400">
                      Go to github.com/new, name your repository (e.g. <code>games-hub</code>), and make it Public.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-emerald-400 mb-1">2. Upload Files</div>
                    <p className="text-slate-400">
                      Upload the 4 files (<code>index.html</code>, <code>style.css</code>, <code>script.js</code>, <code>games.json</code>).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-emerald-400 mb-1">3. Enable Pages</div>
                    <p className="text-slate-400">
                      Navigate to <strong>Settings &rarr; Pages</strong>, select <strong>Deploy from branch: main</strong>, and Save.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-emerald-400 mb-1">4. Live URL</div>
                    <p className="text-slate-400">
                      Your website will be live at <code>https://username.github.io/games-hub/</code>!
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Raw Code Viewer */
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                  {(['games.json', 'index.html', 'style.css', 'script.js'] as const).map(
                    (fileName) => (
                      <button
                        key={fileName}
                        onClick={() => setSelectedFile(fileName)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          selectedFile === fileName
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        {fileName}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(getFileContent(selectedFile), selectedFile)
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    {copiedSection === selectedFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
                  {getFileContent(selectedFile)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>All games are embedded via Iframe format specified in games.json</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
