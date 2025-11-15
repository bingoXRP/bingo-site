const letters = ['B','I','N','G','O'];
const ranges = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };

const gamePatterns = {
  fullCard: {
    pattern: [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
    name: "Full Card"
  },
  horizontal: {
    pattern: [[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    name: "Horizontal Line"
  },
  vertical: {
    pattern: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
    name: "Vertical Line"
  },
  diagonal: {
    pattern: [[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]],
    name: "Diagonal"
  },
  fourCorners: {
    pattern: [[1,0,0,0,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1]],
    name: "Four Corners"
  },
  xPattern: {
    pattern: [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    name: "X Pattern"
  }
};

let gameId = null;
let xHandle = null;
let isHost = false;
let gameRef = null;
let gameType = 'fullCard';
let calledNumbers = new Set();
let playerCard = null;
let playerWins = {};
let notifiedWinners = new Set();
let displayedPlayers = new Set();
let playersArray = [];
let initialLoadComplete = false;

const hostModeBtn = document.getElementById('host-mode-btn');
const playerModeBtn = document.getElementById('player-mode-btn');
const hostControls = document.getElementById('host-controls');
const playerControls = document.getElementById('player-controls');
const rollButton = document.getElementById('roll-button');
const resetButton = document.getElementById('reset-button');
const gameTypeSelect = document.getElementById('game-type-select');
const gameIdInput = document.getElementById('game-id-input');
const xHandleInput = document.getElementById('x-handle-input');
const joinGameBtn = document.getElementById('join-game-btn');
const copyGameIdBtn = document.getElementById('copy-game-id-btn');
const resultDiv = document.getElementById('result');
const statsDiv = document.getElementById('stats');
const boardDiv = document.getElementById('bingo-board');
const patternDiv = document.getElementById('win-pattern');
const currentGameTypeDiv = document.getElementById('current-game-type');
const playerListEl = document.getElementById('player-list');
const playerListContent = document.getElementById('player-list-content');
const toastEl = document.getElementById('toast');

function showToast(msg, duration = 3000) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), duration);
}

function isValidCalledFormat(str) {
  if (typeof str !== 'string') return false;
  const match = str.match(/^([BINGO])-(\d+)$/);
  if (!match) return false;
  const [, letter, numStr] = match;
  const num = parseInt(numStr);
  const [min, max] = ranges[letter];
  return num >= min && num <= max;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBoard() {
  boardDiv.innerHTML = '';
  
  letters.forEach(letter => {
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = letter;
    header.setAttribute('role', 'columnheader');
    boardDiv.appendChild(header);
    boardDiv.appendChild(document.createElement('div')).className = 'empty';
  });

  for(let col = 0; col < 5; col++) {
    const letter = letters[col];
    const [min, max] = ranges[letter];
    for(let num = min; num <= max; num++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = num;
      cell.id = `cell-${letter}-${num}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `${letter} ${num}`);
      if (calledNumbers.has(`${letter}-${num}`)) {
        cell.classList.add('called');
        cell.setAttribute('aria-current', 'true');
      }
      boardDiv.appendChild(cell);
    }
  }
}

function updateStats() {
  statsDiv.textContent = `Called: ${calledNumbers.size}/75`;
}

function highlightNumber(letter, number) {
  const cell = document.getElementById(`cell-${letter}-${number}`);
  if (cell) {
    cell.classList.add('called');
    cell.setAttribute('aria-current', 'true');
  }
}

function displayWinPattern() {
  patternDiv.innerHTML = '';
  const patternData = gamePatterns[gameType];
  if (!patternData) return;

  const pattern = patternData.pattern;
  for(let row = 0; row < 5; row++) {
    for(let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (pattern[row][col] === 1) {
        cell.classList.add('win');
      }
      patternDiv.appendChild(cell);
    }
  }

  const gameTypeName = gamePatterns[gameType].name;
  currentGameTypeDiv.textContent = `Current Game: ${gameTypeName}`;
}

function generatePlayerCard() {
  return new Promise((resolve) => {
    const card = { B:[], I:[], N:[], G:[], O:[] };
    
    letters.forEach(letter => {
      const [min, max] = ranges[letter];
      const available = [];
      for(let n = min; n <= max; n++) {
        available.push(n);
      }
      
      for(let i = 0; i < 5; i++) {
        if (letter === 'N' && i === 2) {
          card[letter].push('FREE');
        } else {
          const idx = Math.floor(Math.random() * available.length);
          card[letter].push(available.splice(idx, 1)[0]);
        }
      }
    });

    const cardID = String(Math.floor(Math.random() * 900) + 100);
    resolve({ card, cardID });
  });
}

function displayPlayerCard() {
  const container = document.getElementById('player-card-container');
  if (!playerCard) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '';
  const cardEl = document.createElement('div');
  cardEl.className = 'player-card';
  cardEl.setAttribute('role', 'grid');
  cardEl.setAttribute('aria-label', 'Your bingo card');

  letters.forEach(letter => {
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = letter;
    header.setAttribute('role', 'columnheader');
    cardEl.appendChild(header);
  });

  for(let row = 0; row < 5; row++) {
    letters.forEach(letter => {
      const value = playerCard[letter][row];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      
      if (value === 'FREE') {
        cell.classList.add('free');
        cell.textContent = 'FREE';
        cell.setAttribute('aria-label', 'Free space');
      } else {
        cell.textContent = value;
        const key = `${letter}-${value}`;
        cell.setAttribute('aria-label', `${letter} ${value}`);
        
        if (calledNumbers.has(key)) {
          cell.classList.add('called');
          cell.setAttribute('aria-current', 'true');
        }
      }
      
      cardEl.appendChild(cell);
    });
  }

  container.appendChild(cardEl);
}

function checkForBingo() {
  if (!playerCard) return false;
  const patternData = gamePatterns[gameType];
  if (!patternData) return false;
  
  const pattern = patternData.pattern;
  let isWin = true;
  
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (pattern[r][c] === 1) {
        const letter = letters[c];
        const num = playerCard[letter][r];
        if (num !== 'FREE' && !calledNumbers.has(`${letter}-${num}`)) {
          isWin = false;
          break;
        }
      }
    }
    if (!isWin) break;
  }
  
  return isWin;
}

function rollBingo() {
  if(calledNumbers.size >= 75){ 
    showToast('All 75 numbers have been called!', 3000); 
    return null; 
  }
  
  let letter, number, attempts = 0;
  do {
    letter = letters[Math.floor(Math.random() * letters.length)];
    const [min, max] = ranges[letter];
    number = getRandomNumber(min, max);
    attempts++;
    if(attempts > 200){ 
      showToast('Unable to find new number', 4000); 
      return null; 
    }
  } while(calledNumbers.has(`${letter}-${number}`));
  
  const rolled = `${letter}-${number}`;
  calledNumbers.add(rolled);
  
  if(gameRef && isHost){
    gameRef.child('called').push(rolled).catch(err => console.error('DB push error', err));
  }
  
  return rolled;
}

function cleanupListeners() {
  if (gameRef) {
    gameRef.off();
  }
}

function updatePlayerListSnapshot(playersObj) {
  playerListContent.innerHTML = '';
  displayedPlayers.clear();
  playersArray = [];
  
  if(playersObj) {
    Object.keys(playersObj).forEach(key => {
      const player = playersObj[key];
      playersArray.push(player);
      appendPlayerToList(key, player);
    });
  }
}

function appendPlayerToList(key, player) {
  if (!player || !player.handle) return;
  if (displayedPlayers.has(key)) return;
  
  displayedPlayers.add(key);
  const item = document.createElement('div');
  item.className = 'player-item';
  item.textContent = player.handle;
  item.dataset.key = key;
  playerListContent.appendChild(item);
}

function updateLeaderboard() {
  const leaderboardContent = document.getElementById('leaderboard-content');
  if (!leaderboardContent || !gameRef) return;
  
  gameRef.child('winners').once('value', snap => {
    const winnersObj = snap.val();
    leaderboardContent.innerHTML = '';
    
    if(!winnersObj || Object.keys(winnersObj).length === 0) {
      leaderboardContent.innerHTML = '<p style="opacity:0.6;">No winners yet...</p>';
      return;
    }
    
    Object.keys(winnersObj).forEach(k => {
      const v = winnersObj[k];
      const entry = document.createElement('div');
      entry.className = 'leaderboard-entry';
      entry.innerHTML = `<span>${v.handle}</span><span>${v.gameType || 'Unknown'}</span>`;
      leaderboardContent.appendChild(entry);
    });
  });
}

function setupGame(id) {
  try {
    cleanupListeners();
    initialLoadComplete = false;
    gameRef = database.ref(`games/${id}`);
    
    gameRef.child('called').once('value', snap => {
      calledNumbers.clear();
      const obj = snap.val();
      if(obj) {
        Object.values(obj).forEach(v => {
          if(isValidCalledFormat(v)) calledNumbers.add(v);
        });
      }
      createBoard();
      updateStats();
      if (!isHost && playerCard) displayPlayerCard();
      
      setTimeout(() => {
        initialLoadComplete = true;
      }, 1000);
    });
    
    gameRef.child('called').on('child_added', snap => {
      const rolled = snap.val();
      if(!isValidCalledFormat(rolled)) return;
      if(!initialLoadComplete) return;
      
      const [letter, num] = rolled.split('-');
      if(!calledNumbers.has(rolled)) {
        calledNumbers.add(rolled);
        highlightNumber(letter, parseInt(num));
        
        if(resultDiv) resultDiv.textContent = rolled;
        
        if (!isHost && playerCard) {
          displayPlayerCard();
          
          const winKey = `${gameId}-${gameType}`;
          if (!playerWins[winKey] && checkForBingo()) {
            playerWins[winKey] = true;
            
            gameRef.child('winners').push({
              handle: xHandle,
              timestamp: Date.now().toString(),
              gameType: gameType
            }).catch(err => console.error('Win push error', err));
            
            showToast(`🎉 BINGO! You won ${gamePatterns[gameType].name}! 🎉`, 5000);
          }
        }
      }
    });

    gameRef.child('gameType').on('value', snap => {
      const newGameType = snap.val() || 'fullCard';
      gameType = newGameType;
      
      if(isHost) {
        gameTypeSelect.value = gameType;
        displayWinPattern();
      } else {
        currentGameTypeDiv.style.display = 'block';
        displayWinPattern();
      }
    });

    gameRef.child('winners').once('value', snap => {
      const obj = snap.val() || {};
      Object.keys(obj).forEach(k => notifiedWinners.add(k));
      updateLeaderboard();
    });
    
    gameRef.child('winners').on('child_added', snap => {
      const key = snap.key, val = snap.val();
      if(!notifiedWinners.has(key)) {
        notifiedWinners.add(key);
        updateLeaderboard();
        if(isHost && val) {
          showToast(`🎉 BINGO! ${val.handle} won ${val.gameType}! 🎉`, 4000);
        }
      }
    });

    gameRef.child('players').once('value', snap => {
      updatePlayerListSnapshot(snap.val());
    });
    
    gameRef.child('players').on('child_added', snap => {
      const key = snap.key, val = snap.val();
      appendPlayerToList(key, val);
    });

  } catch(e) {
    console.error('Setup game error:', e);
    showToast('Error setting up game', 3000);
  }
}

hostModeBtn.addEventListener('click', () => {
  auth.signInAnonymously().then(() => {
    isHost = true;
    gameId = Math.random().toString(36).substring(2, 10);
    
    hostControls.style.display = 'block';
    playerControls.style.display = 'none';
    document.getElementById('mode-selection').style.display = 'none';
    playerListEl.style.display = window.innerWidth > 767 ? 'block' : 'none';
    
    calledNumbers.clear();
    notifiedWinners.clear();
    displayedPlayers.clear();
    playersArray = [];
    playerWins = {};
    initialLoadComplete = true;
    resultDiv.textContent = '';
    
    setupGame(gameId);
    
    gameType = gameTypeSelect.value;
    if(gameRef) {
      gameRef.child('gameType').set(gameType).catch(err => console.error(err));
    }
    
    displayWinPattern();
    createBoard();
    updateStats();
    
    showToast(`🎮 Host mode enabled. Game ID: ${gameId}`, 3500);
  }).catch(err => {
    console.error('Auth error for host:', err);
    showToast('Failed to authenticate for host mode', 3000);
  });
});

playerModeBtn.addEventListener('click', () => {
  isHost = false;
  hostControls.style.display = 'none';
  playerControls.style.display = 'block';
  document.getElementById('mode-selection').style.display = 'none';
  playerListEl.style.display = 'none';
  
  calledNumbers.clear();
  resultDiv.textContent = '';
  statsDiv.textContent = '';
  currentGameTypeDiv.textContent = '';
  
  createBoard();
  updateStats();
  displayWinPattern();
  
  showToast('👤 Player mode: Enter Game ID and X handle to join', 3000);
});

joinGameBtn.addEventListener('click', async () => {
  const providedGameId = gameIdInput.value.trim();
  const providedHandle = xHandleInput.value.trim();
  
  if(!providedGameId) return showToast('⚠️ Enter a valid Game ID', 3000);
  if(!providedHandle || !providedHandle.startsWith('@')) {
    return showToast('⚠️ Enter a valid X Handle (e.g., @UserX)', 3000);
  }
  
  try {
    await auth.signInAnonymously();
    
    gameId = providedGameId;
    xHandle = providedHandle;
    
    gameRef = database.ref(`games/${gameId}`);
    
    const { card, cardID } = await generatePlayerCard();
    playerCard = card;
    playerWins = {};
    
    displayPlayerCard();
    
    const handleKey = xHandle.replace('@','');
    await gameRef.child('players').child(handleKey).set({
      handle: xHandle,
      cardID: cardID,
      card: playerCard
    });
    
    showToast(`✅ Joined ${gameId} as ${xHandle}`, 3000);
    setupGame(gameId);
    
  } catch(err) {
    console.error('Error joining game:', err);
    showToast('❌ Error joining game: ' + (err.message || 'Unknown error'), 3500);
  }
});

copyGameIdBtn.addEventListener('click', () => {
  if(!gameId) return showToast('No Game ID to copy', 2000);
  navigator.clipboard.writeText(gameId)
    .then(() => showToast('✅ Game ID copied to clipboard!', 2000))
    .catch(() => showToast('Error copying', 2000));
});

rollButton.addEventListener('click', () => {
  if(!isHost || !gameRef) return showToast('Host a game first', 3000);
  
  const rolled = rollBingo();
  if(rolled) {
    const [L, N] = rolled.split('-');
    resultDiv.textContent = rolled;
    highlightNumber(L, parseInt(N));
  }
});

resetButton.addEventListener('click', () => {
  if(!confirm('Are you sure you want to reset the game? This will clear all data.')) return;
  
  if(gameRef && isHost) {
    gameRef.remove().catch(err => console.warn('Failed to remove game:', err));
  }
  
  cleanupListeners();
  calledNumbers.clear();
  playerCard = null;
  playerWins = {};
  notifiedWinners.clear();
  displayedPlayers.clear();
  playersArray = [];
  initialLoadComplete = false;
  resultDiv.textContent = '';
  statsDiv.textContent = '';
  currentGameTypeDiv.textContent = '';
  
  createBoard();
  updateStats();
  playerListContent.innerHTML = '';
  const leaderboardContent = document.getElementById('leaderboard-content');
  if(leaderboardContent) leaderboardContent.innerHTML = '';
  const playerCardContainer = document.getElementById('player-card-container');
  if(playerCardContainer) playerCardContainer.innerHTML = '';
  
  hostControls.style.display = 'none';
  playerControls.style.display = 'none';
  playerListEl.style.display = 'none';
  document.getElementById('mode-selection').style.display = 'block';
  
  gameId = null;
  xHandle = null;
  gameRef = null;
  isHost = false;
  
  showToast('🔄 Game reset complete. Start a new game!', 2500);
});

gameTypeSelect.addEventListener('change', () => {
  const val = gameTypeSelect.value;
  if(!Object.keys(gamePatterns).includes(val)) return;
  
  gameType = val;
  if(isHost && gameRef) {
    gameRef.child('gameType').set(gameType).catch(err => console.error(err));
  }
  displayWinPattern();
});

(function checkUrlAutoJoin() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get('gameId');
  if(urlGameId) {
    gameId = urlGameId;
    playerModeBtn.click();
    gameIdInput.value = gameId;
    showToast('🔗 Auto-join game ID detected from URL', 2500);
  }
})();

(function init() {
  hostControls.style.display = 'none';
  playerControls.style.display = 'none';
  playerListEl.style.display = 'none';
  document.getElementById('mode-selection').style.display = 'block';
  
  resultDiv.textContent = '';
  statsDiv.textContent = '';
  currentGameTypeDiv.textContent = '';
  
  createBoard();
})();

(function makePlayerListDraggable() {
  const el = playerListEl;
  let dragging = false, startX = 0, startY = 0, currentX = 0, currentY = 0, startTransform = {x:0, y:0};

  function onDown(e) {
    if(window.innerWidth < 768) return;
    dragging = true;
    el.style.cursor = 'grabbing';
    const client = (e.touches && e.touches[0]) || e;
    startX = client.clientX;
    startY = client.clientY;
    startTransform.x = currentX;
    startTransform.y = currentY;
    e.preventDefault();
  }
  
  function onMove(e) {
    if(!dragging) return;
    const client = (e.touches && e.touches[0]) || e;
    const dx = client.clientX - startX;
    const dy = client.clientY - startY;
    let nx = startTransform.x + dx;
    let ny = startTransform.y + dy;
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 6;
    const maxY = window.innerHeight - rect.height - 6;
    nx = Math.max(0, Math.min(nx, maxX));
    ny = Math.max(0, Math.min(ny, maxY));
    currentX = nx;
    currentY = ny;
    el.style.transform = `translate(${currentX}px, ${currentY}px)`;
  }
  
  function onUp() {
    if(!dragging) return;
    dragging = false;
    el.style.cursor = 'grab';
  }
  
  el.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  el.addEventListener('touchstart', onDown, {passive:false});
  window.addEventListener('touchmove', onMove, {passive:false});
  window.addEventListener('touchend', onUp);
})();

firebase.auth().onAuthStateChanged(user => { 
  console.log('Auth state changed:', user ? 'Authenticated' : 'Not authenticated'); 
});

window._bingoDebug = () => ({ 
  gameId, 
  isHost, 
  gameType, 
  calledCount: calledNumbers.size,
  playerCard,
  playerWins,
  xHandle,
  initialLoadComplete
});

console.log('%c$BINGO Roller v2.4 🎉', 'color: #00FF00; font-size: 20px; font-weight: bold;');
console.log('Debug info: window._bingoDebug()');
