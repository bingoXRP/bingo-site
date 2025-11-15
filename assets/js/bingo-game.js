let gameId = localStorage.getItem('gameId') || null;
let xHandle = localStorage.getItem('xHandle') || null;
let isHost = false;
let gameRef = null;
let gameType = 'fullCard';
let calledNumbers = new Set(JSON.parse(localStorage.getItem('calledNumbers') || '[]'));
let playerCard = JSON.parse(localStorage.getItem('playerCard')) || null;
let playerWins = JSON.parse(localStorage.getItem('playerWins') || '{}');
let notifiedWinners = new Set();
let displayedPlayers = new Set();
let playersArray = [];
let initialLoadComplete = false;
let listeners = [];

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

const gamePatterns = {
  fullCard: Array.from({length:25}, (_,i) => i),
  horizontal: [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]],
  vertical: [[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24]],
  diagonal: [[0,6,12,18,24],[4,8,12,16,20]],
  fourCorners: [[0,4,20,24]],
  xPattern: [[0,4,6,8,12,16,18,20,24]]
};

function showToast(msg, duration = 3000) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), duration);
}

function generateGameId() {
  return 'GAME-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function createBoard() {
  boardDiv.innerHTML = '';
  const letters = ['B','I','N','G','O'];
  letters.forEach(letter => {
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = letter;
    header.setAttribute('role', 'columnheader');
    boardDiv.appendChild(header);
    boardDiv.appendChild(document.createElement('div')).className = 'empty';
  });

  for(let col = 0; col < 5; col++) {
    for(let num = 1; num <= 15; num++) {
      const letter = letters[col];
      const number = col * 15 + num;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = number;
      cell.id = `cell-${letter}-${number}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `${letter} ${number}`);
      if (calledNumbers.has(`${letter}-${number}`)) {
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

function displayWinPattern() {
  patternDiv.innerHTML = '';
  const pattern = gamePatterns[gameType];
  if (!pattern) return;

  for(let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    let isWin = false;
    if (Array.isArray(pattern[0])) {
      isWin = pattern.some(p => p.includes(i));
    } else {
      isWin = pattern.includes(i);
    }
    if (isWin) cell.classList.add('win');
    patternDiv.appendChild(cell);
  }

  const gameTypeName = gameTypeSelect.options[gameTypeSelect.selectedIndex].text;
  currentGameTypeDiv.textContent = `Current Game: ${gameTypeName}`;
}

function rollBingo() {
  const letters = ['B','I','N','G','O'];
  const available = [];
  
  for(let col = 0; col < 5; col++) {
    for(let num = 1; num <= 15; num++) {
      const letter = letters[col];
      const number = col * 15 + num;
      const key = `${letter}-${number}`;
      if (!calledNumbers.has(key)) {
        available.push(key);
      }
    }
  }

  if (available.length === 0) {
    showToast('All numbers called!', 3000);
    return null;
  }

  const rolled = available[Math.floor(Math.random() * available.length)];
  calledNumbers.add(rolled);
  localStorage.setItem('calledNumbers', JSON.stringify([...calledNumbers]));

  if (gameRef && isHost) {
    gameRef.child('calledNumbers').set([...calledNumbers]);
  }

  updateStats();
  return rolled;
}

function highlightNumber(letter, number) {
  const cell = document.getElementById(`cell-${letter}-${number}`);
  if (cell) {
    cell.classList.add('called');
    cell.setAttribute('aria-current', 'true');
  }
}

function generatePlayerCard() {
  return new Promise((resolve) => {
    const card = [];
    const letters = ['B','I','N','G','O'];
    
    for(let col = 0; col < 5; col++) {
      const colNumbers = [];
      const start = col * 15 + 1;
      const end = start + 14;
      
      const available = [];
      for(let n = start; n <= end; n++) {
        available.push(n);
      }
      
      for(let i = 0; i < 5; i++) {
        if (col === 2 && i === 2) {
          colNumbers.push('FREE');
        } else {
          const idx = Math.floor(Math.random() * available.length);
          colNumbers.push(available.splice(idx, 1)[0]);
        }
      }
      
      card.push(colNumbers);
    }

    const cardID = Date.now().toString(36) + Math.random().toString(36).substr(2);
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

  const letters = ['B','I','N','G','O'];
  letters.forEach(letter => {
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = letter;
    header.setAttribute('role', 'columnheader');
    cardEl.appendChild(header);
  });

  for(let row = 0; row < 5; row++) {
    for(let col = 0; col < 5; col++) {
      const value = playerCard[col][row];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      
      if (value === 'FREE') {
        cell.classList.add('free');
        cell.textContent = 'FREE';
        cell.setAttribute('aria-label', 'Free space');
      } else {
        cell.textContent = value;
        const letter = letters[col];
        const key = `${letter}-${value}`;
        cell.setAttribute('aria-label', `${letter} ${value}`);
        
        if (calledNumbers.has(key)) {
          cell.classList.add('called');
          cell.setAttribute('aria-current', 'true');
        }
      }
      
      cardEl.appendChild(cell);
    }
  }

  container.appendChild(cardEl);
}

function checkWin(card) {
  if (!card) return false;
  const letters = ['B','I','N','G','O'];
  const pattern = gamePatterns[gameType];
  if (!pattern) return false;

  const cardFlat = [];
  for(let row = 0; row < 5; row++) {
    for(let col = 0; col < 5; col++) {
      const value = card[col][row];
      if (value === 'FREE') {
        cardFlat.push(true);
      } else {
        const letter = letters[col];
        const key = `${letter}-${value}`;
        cardFlat.push(calledNumbers.has(key));
      }
    }
  }

  if (Array.isArray(pattern[0])) {
    return pattern.some(p => p.every(idx => cardFlat[idx]));
  } else {
    return pattern.every(idx => cardFlat[idx]);
  }
}

function setupGame(gid) {
  gameRef = database.ref(`games/${gid}`);
  cleanupListeners();

  const calledListener = gameRef.child('calledNumbers').on('value', (snapshot) => {
    const serverCalled = snapshot.val();
    if (serverCalled) {
      const newCalled = new Set(serverCalled);
      const added = [...newCalled].filter(x => !calledNumbers.has(x));
      calledNumbers = newCalled;
      localStorage.setItem('calledNumbers', JSON.stringify([...calledNumbers]));
      createBoard();
      updateStats();
      displayPlayerCard();

      if (added.length > 0 && !isHost) {
        const latest = added[added.length - 1];
        resultDiv.textContent = latest;
        const [L, N] = latest.split('-');
        highlightNumber(L, parseInt(N));
        
        if (playerCard && checkWin(playerCard)) {
          const winKey = `${gameType}`;
          if (!playerWins[winKey]) {
            playerWins[winKey] = true;
            localStorage.setItem('playerWins', JSON.stringify(playerWins));
            showToast(`🎉 BINGO! You won ${gameType}!`, 5000);
            
            if (xHandle && gameRef) {
              const handleKey = xHandle.replace('@','');
              gameRef.child('winners').child(handleKey).set({
                handle: xHandle,
                gameType: gameType,
                timestamp: Date.now()
              });
            }
          }
        }
      }
    }
  });
  listeners.push({ ref: gameRef.child('calledNumbers'), event: 'value', callback: calledListener });

  const gameTypeListener = gameRef.child('gameType').on('value', (snapshot) => {
    const serverType = snapshot.val();
    if (serverType && gamePatterns[serverType]) {
      gameType = serverType;
      gameTypeSelect.value = gameType;
      displayWinPattern();
    }
  });
  listeners.push({ ref: gameRef.child('gameType'), event: 'value', callback: gameTypeListener });

  const playersListener = gameRef.child('players').on('value', (snapshot) => {
    const players = snapshot.val();
    playersArray = players ? Object.values(players) : [];
    updatePlayerList();
  });
  listeners.push({ ref: gameRef.child('players'), event: 'value', callback: playersListener });

  const winnersListener = gameRef.child('winners').on('child_added', (snapshot) => {
    const winner = snapshot.val();
    if (!winner || !winner.handle) return;
    
    const key = `${winner.handle}-${winner.gameType}`;
    if (notifiedWinners.has(key)) return;
    notifiedWinners.add(key);
    
    if (!isHost || winner.handle !== xHandle) {
      showToast(`🏆 ${winner.handle} won ${winner.gameType}!`, 5000);
    }
    updateLeaderboard();
  });
  listeners.push({ ref: gameRef.child('winners'), event: 'child_added', callback: winnersListener });

  if (isHost) {
    playerListEl.style.display = window.innerWidth > 767 ? 'block' : 'none';
  }
}

function cleanupListeners() {
  listeners.forEach(({ ref, event, callback }) => {
    ref.off(event, callback);
  });
  listeners = [];
}

function updatePlayerList() {
  if (!playersArray.length) {
    playerListContent.innerHTML = '<p style="opacity:0.7;">No players yet</p>';
    return;
  }

  const newPlayers = playersArray.filter(p => !displayedPlayers.has(p.handle));
  newPlayers.forEach(p => {
    displayedPlayers.add(p.handle);
    const item = document.createElement('div');
    item.className = 'player-item';
    item.textContent = p.handle;
    item.id = `player-${p.handle.replace('@','')}`;
    playerListContent.appendChild(item);
  });

  const currentHandles = new Set(playersArray.map(p => p.handle));
  Array.from(displayedPlayers).forEach(handle => {
    if (!currentHandles.has(handle)) {
      const item = document.getElementById(`player-${handle.replace('@','')}`);
      if (item) item.remove();
      displayedPlayers.delete(handle);
    }
  });
}

function updateLeaderboard() {
  if (!gameRef) return;
  
  gameRef.child('winners').once('value', (snapshot) => {
    const winners = snapshot.val();
    if (!winners) return;

    const scores = {};
    Object.values(winners).forEach(w => {
      if (!scores[w.handle]) scores[w.handle] = 0;
      scores[w.handle]++;
    });

    const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
    const leaderboardEl = document.getElementById('leaderboard');
    const contentEl = leaderboardEl.querySelector('#leaderboard-content') || document.createElement('div');
    contentEl.id = 'leaderboard-content';
    contentEl.innerHTML = '';

    sorted.forEach(([handle, wins], idx) => {
      const entry = document.createElement('div');
      entry.className = 'leaderboard-entry';
      entry.innerHTML = `
        <span>${idx + 1}. ${handle}</span>
        <span>${wins} win${wins > 1 ? 's' : ''}</span>
      `;
      contentEl.appendChild(entry);
    });

    if (!leaderboardEl.contains(contentEl)) {
      leaderboardEl.appendChild(contentEl);
    }
  });
}

hostModeBtn.addEventListener('click', async () => {
  auth.signInAnonymously().then(() => {
    isHost = true;
    gameId = generateGameId();
    localStorage.setItem('gameId', gameId);
    gameRef = database.ref(`games/${gameId}`);
    
    gameRef.set({
      gameType: gameType,
      calledNumbers: [...calledNumbers],
      createdAt: Date.now()
    });

    hostControls.style.display = 'block';
    playerControls.style.display = 'none';
    document.getElementById('mode-selection').style.display = 'none';
    playerListEl.style.display = window.innerWidth > 767 ? 'block' : 'none';
    
    displayWinPattern();
    createBoard();
    updateStats();
    
    resultDiv.textContent = 'Ready to Roll!';
    showToast(`🎮 Host mode enabled. Game ID: ${gameId}`, 3500);
    setupGame(gameId);
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
  
  const stored = JSON.parse(localStorage.getItem('calledNumbers') || '[]');
  calledNumbers = new Set(stored);
  createBoard();
  updateStats();
  displayWinPattern();
  
  if (xHandle) xHandleInput.value = xHandle;
  
  showToast('👤 Player mode: Enter Game ID and X handle to join', 3000);
});

joinGameBtn.addEventListener('click', async () => {
  const providedGameId = gameIdInput.value.trim();
  const providedHandle = xHandleInput.value.trim();
  
  if (!providedGameId) return showToast('⚠️ Enter a valid Game ID', 3000);
  if (!providedHandle || !providedHandle.startsWith('@')) {
    return showToast('⚠️ Enter a valid X Handle (e.g., @UserX)', 3000);
  }
  
  try {
    await auth.signInAnonymously();
    
    gameId = providedGameId;
    xHandle = providedHandle;
    localStorage.setItem('gameId', gameId);
    localStorage.setItem('xHandle', xHandle);
    
    gameRef = database.ref(`games/${gameId}`);
    
    const { card, cardID } = await generatePlayerCard();
    playerCard = card;
    localStorage.setItem('playerCard', JSON.stringify(playerCard));
    
    playerWins = {};
    localStorage.setItem('playerWins', JSON.stringify(playerWins));
    
    displayPlayerCard();
    
    const handleKey = xHandle.replace('@','');
    await gameRef.child('players').child(handleKey).set({
      handle: xHandle,
      cardID: cardID,
      card: playerCard
    });
    
    showToast(`✅ Joined ${gameId} as ${xHandle}`, 3000);
    setupGame(gameId);
    
  } catch (err) {
    console.error('Error joining game:', err);
    showToast('❌ Error joining game: ' + (err.message || 'Unknown error'), 3500);
  }
});

copyGameIdBtn.addEventListener('click', () => {
  if (!gameId) return showToast('No Game ID to copy', 2000);
  navigator.clipboard.writeText(gameId)
    .then(() => showToast('✅ Game ID copied to clipboard!', 2000))
    .catch(() => showToast('Error copying', 2000));
});

rollButton.addEventListener('click', () => {
  if (!isHost || !gameRef) return showToast('Host a game first', 3000);
  
  const rolled = rollBingo();
  if (rolled) {
    const [L, N] = rolled.split('-');
    resultDiv.textContent = rolled;
    highlightNumber(L, parseInt(N));
  }
});

resetButton.addEventListener('click', () => {
  if (!confirm('Are you sure you want to reset the game? This will clear all data.')) return;
  
  if (gameRef && isHost) {
    gameRef.remove().catch(err => console.warn('Failed to remove game:', err));
  }
  
  cleanupListeners();
  calledNumbers.clear();
  localStorage.removeItem('calledNumbers');
  localStorage.removeItem('playerCard');
  localStorage.removeItem('playerWins');
  playerCard = null;
  playerWins = {};
  notifiedWinners.clear();
  displayedPlayers.clear();
  playersArray = [];
  initialLoadComplete = false;
  resultDiv.textContent = '';
  
  createBoard();
  updateStats();
  playerListContent.innerHTML = '';
  const leaderboardContent = document.getElementById('leaderboard-content');
  if (leaderboardContent) leaderboardContent.innerHTML = '';
  const playerCardContainer = document.getElementById('player-card-container');
  if (playerCardContainer) playerCardContainer.innerHTML = '';
  
  hostControls.style.display = 'none';
  playerControls.style.display = 'none';
  playerListEl.style.display = 'none';
  document.getElementById('mode-selection').style.display = 'block';
  
  gameId = null;
  localStorage.removeItem('gameId');
  localStorage.removeItem('xHandle');
  xHandle = null;
  gameRef = null;
  isHost = false;
  
  showToast('🔄 Game reset complete. Start a new game!', 2500);
});

gameTypeSelect.addEventListener('change', () => {
  const val = gameTypeSelect.value;
  if (!Object.keys(gamePatterns).includes(val)) return;
  
  gameType = val;
  if (isHost && gameRef) {
    gameRef.child('gameType').set(gameType).catch(err => console.error(err));
  }
  displayWinPattern();
});

(function checkUrlAutoJoin() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get('gameId');
  if (urlGameId) {
    gameId = urlGameId;
    localStorage.setItem('gameId', gameId);
    playerModeBtn.click();
    gameIdInput.value = gameId;
    showToast('🔗 Auto-join game ID detected from URL', 2500);
  }
})();

(function init() {
  const stored = JSON.parse(localStorage.getItem('calledNumbers') || '[]');
  calledNumbers = new Set(stored);
  createBoard();
  updateStats();
  displayWinPattern();
  
  const savedX = parseFloat(localStorage.getItem('playerListTransformX') || '0');
  const savedY = parseFloat(localStorage.getItem('playerListTransformY') || '0');
  playerListEl.style.transform = `translate(${savedX}px, ${savedY}px)`;
})();

(function makePlayerListDraggable() {
  const el = playerListEl;
  let dragging = false, startX = 0, startY = 0, currentX = 0, currentY = 0, startTransform = {x:0, y:0};
  const savedX = parseFloat(localStorage.getItem('playerListTransformX') || '0');
  const savedY = parseFloat(localStorage.getItem('playerListTransformY') || '0');
  currentX = savedX;
  currentY = savedY;
  el.style.transform = `translate(${currentX}px, ${currentY}px)`;

  function onDown(e) {
    if (window.innerWidth < 768) return;
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
    if (!dragging) return;
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
    if (!dragging) return;
    dragging = false;
    el.style.cursor = 'grab';
    localStorage.setItem('playerListTransformX', String(currentX));
    localStorage.setItem('playerListTransformY', String(currentY));
  }
  
  el.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  el.addEventListener('touchstart', onDown, {passive: false});
  window.addEventListener('touchmove', onMove, {passive: false});
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

console.log('%c$BINGO Roller v2.2 🎉', 'color: #00FF00; font-size: 20px; font-weight: bold;');
console.log('Debug info: window._bingoDebug()');
