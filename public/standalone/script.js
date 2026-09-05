const gameGrid = document.getElementById('gameGrid');
const searchBar = document.getElementById('searchBar');
const gameModal = document.getElementById('gameModal');
const gameIframe = document.getElementById('gameIframe');
const closeBtn = document.getElementById('closeBtn');
const openNewTabBtn = document.getElementById('openNewTabBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const currentTitle = document.getElementById('currentTitle');

let allGames = [];
let currentGameUrl = '';

// 1. Fetch the JSON data
async function fetchGames() {
  try {
    const response = await fetch('/games.json');
    allGames = await response.json();
    renderGames(allGames);
  } catch (error) {
    console.error('Failed to load games list:', error);
    gameGrid.innerHTML = '<p style="color: #ef4444; grid-column: 1/-1; text-align: center;">Could not load games.json database.</p>';
  }
}

// 2. Render games to the HTML grid
function renderGames(gamesList) {
  gameGrid.innerHTML = '';

  if (gamesList.length === 0) {
    gameGrid.innerHTML = '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 40px;">No games match your search.</p>';
    return;
  }

  gamesList.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.image}" alt="${game.title}" loading="lazy" />
      <div class="game-info">
        <div>
          <div class="game-cat">${game.category || 'Arcade'}</div>
          <h3 class="game-title">${game.title}</h3>
          <p class="game-desc">${game.description || ''}</p>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openGame(game.title, game.url);
    });

    gameGrid.appendChild(card);
  });
}

// 3. Open game in Iframe
function openGame(title, url) {
  currentTitle.innerText = title;
  currentGameUrl = url;
  gameIframe.src = url;
  gameModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// 4. Close game
closeBtn.addEventListener('click', () => {
  gameModal.classList.add('hidden');
  gameIframe.src = '';
  document.body.style.overflow = 'auto';
});

// 5. Open in New Tab
if (openNewTabBtn) {
  openNewTabBtn.addEventListener('click', () => {
    if (currentGameUrl) {
      window.open(currentGameUrl, '_blank', 'noopener,noreferrer');
    }
  });
}

// 6. Fullscreen
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      gameModal.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  });
}

// 7. Search filter
searchBar.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allGames.filter(g =>
    g.title.toLowerCase().includes(query) ||
    (g.category && g.category.toLowerCase().includes(query)) ||
    (g.description && g.description.toLowerCase().includes(query))
  );
  renderGames(filtered);
});

// Run on page load
fetchGames();
