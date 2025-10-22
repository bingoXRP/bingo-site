// Firebase config - Replace with real keys or use .env
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  databaseURL: 'https://your-project-default-rtdb.firebaseio.com',
  projectId: 'your-project',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
  measurementId: 'your-measurement-id'
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
const analytics = firebase.analytics();

const gamePatterns = {
  singleLine: [[0,0,0,0,0], [1,1,1,1,1], [2,2,2,2,2], [3,3,3,3,3], [4,4,4,4,4], [0,1,2,3,4], [0,0,0,0,0], [4,3,2,1,0]],
  perimeter: [0,0,0,0,0, 0,4,3,2,1, 4,4,4,4,4, 1,2,3,4,0],
  xShape: [0,1,2,3,4, 4,3,2,1,0],
  fourCorners: [0,0,4,4,0,4,0,4],
  fullCard: [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4]
};

let gameId = null, isHost = false, gameRef = null, playerCard = null, xHandle = null, gameType = 'singleLine';
const calledNumbers = new Set();
const notifiedWinners = new Set();
const displayedPlayers = new Set();
let playersArray = [];
let playerWins = {};
const hostModeBtn = document.getElementById('host-mode');
const playerModeBtn = document.getElementById('player-mode');
const joinGameBtn = document.getElementById('join-game');
const copyGameIdBtn = document.getElementById('copy-game-id');
const gameIdInput = document.getElementById('game-id-input');
const xHandleInput = document.getElementById('xhandle-input');
const rollButton = document.getElementById('roll-button');
const resultDiv = document.getElementById('result');
const resetButton = document.getElementById('reset-button');
const gameTypeSelect = document.getElementById('game-type');
const gameIdDisplay = document.getElementById('game-id-display');
const hostControls = document.getElementById('host-controls');
const playerControls = document.getElementById('player-controls');
const playerListEl = document.getElementById('player-list');
const playerListContent = document.getElementById('player-list-content');

function showToast(message, duration, isSuccess) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.background = isSuccess ? '#28a745' : '#dc3545';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '10000';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function createBoard() {
  const board = document.getElementById('bingo-board');
  board.innerHTML = '';
  const letters = ['B', 'I', 'N', 'G', 'O'];
  letters.forEach(letter => {
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = letter;
    board.appendChild(header);
    const empty = document.createElement('div');
    empty.className = 'empty';
    board.appendChild(empty);
  });
  for (let i = 1; i <= 15; i++) {
    letters.forEach(letter => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const num = letter + '-' + (i + (['B','I','N','G','O'].indexOf(letter) * 15));
      cell.textContent = i;
      cell.dataset.number = num;
      if (calledNumbers.has(num)) cell.classList.add('called');
      board.appendChild(cell);
    });
  }
}

function highlightNumber(letter, number) {
  const cell = document.querySelector(`[data-number="${letter}-${number}"]`);
  if (cell) cell.classList.add('called');
  if (playerCard && !isHost) {
    const idx = ['B','I','N','G','O'].indexOf(letter);
    const row = playerCard[idx].indexOf(parseInt(number));
    if (row !== -1) {
      document.querySelector(`#player-card .cell[data-row="${row}"][data-col="${idx}"]`).classList.add('called');
      checkForBingo();
    }
  }
}

function displayWinPattern() {
  const winPattern = document.getElementById('win-pattern');
  winPattern.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      if (gamePatterns[gameType].some(pattern => pattern.includes(i * 5 + j))) cell.classList.add('win');
      if (i === 2 && j === 2) cell.classList.add('free');
      winPattern.appendChild(cell);
    }
  }
}

async function generatePlayerCard() {
  const card = [];
  const ranges = [[1,15], [16,30], [31,45], [46,60], [61,75]];
  for (let i = 0; i < 5; i++) {
    const col = [];
    const used = new Set();
    const range = ranges[i];
    while (col.length < 5) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const num = (array[0] % (range[1] - range[0] + 1)) + range[0];
      if (!used.has(num)) {
        col.push(num);
        used.add(num);
      }
    }
    card.push(col);
  }
  card[2][2] = 'FREE';
  const cardID = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  return { card, cardID };
}

function displayPlayerCard() {
  const playerCardEl = document.getElementById('player-card');
  playerCardEl.innerHTML = '';
  if (!playerCard) return;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.textContent = playerCard[j][i];
      if (playerCard[j][i] === 'FREE') cell.classList.add('free');
      if (calledNumbers.has(['B','I','N','G','O'][j] + '-' + playerCard[j][i])) cell.classList.add('called');
      playerCardEl.appendChild(cell);
    }
  }
}

function checkForBingo() {
  if (!playerCard || isHost) return;
  const patterns = gamePatterns[gameType];
  const won = patterns.some(pattern => {
    return pattern.every((pos, idx) => {
      if (idx % 5 === 4 && idx !== 0) return true;
      const row = Math.floor(pos / 5);
      const col = pos % 5;
      if (row === 2 && col === 2) return true;
      const num = playerCard[col][row];
      return calledNumbers.has(['B','I','N','G','O'][col] + '-' + num);
    });
  });
  if (won && !playerWins[gameType]) {
    playerWins[gameType] = true;
    localStorage.setItem('playerWins', JSON.stringify(playerWins));
    gameRef.child('winners').push({ handle: xHandle, gameType });
  }
}

function rollBingo() {
  if (calledNumbers.size >= 75) {
    showToast('All numbers called!', 3000);
    return null;
  }
  const letters = ['B', 'I', 'N', 'G', 'O'];
  const ranges = [[1,15], [16,30], [31,45], [46,60], [61,75]];
  let rolled;
  do {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const col = array[0] % 5;
    const offset = ranges[col][0] - 1;
    const num = (array[0] % 15) + 1 + offset;
    rolled = `${letters[col]}-${num}`;
  } while (calledNumbers.has(rolled));
  calledNumbers.add(rolled);
  localStorage.setItem('calledNumbers', JSON.stringify(Array.from(calledNumbers)));
  resultDiv.textContent = rolled;
  gameRef.child('calledNumbers').push(rolled);
  showToast(`Rolled: ${rolled}`, 2000);
  return rolled;
}

function updatePlayerListSnapshot(playersObj) {
  playersArray = Object.entries(playersObj || {}).map(([key, val]) => ({ key, ...val }));
  playerListContent.innerHTML = '';
  playersArray.forEach(p => appendPlayerToList(p.key, p));
}

function appendPlayerToList(key, player) {
  if (displayedPlayers.has(key)) return;
  displayedPlayers.add(key);
  const div = document.createElement('div');
  div.className = 'player-item';
  div.innerHTML = `<span>${player.handle}</span><span class="cardid">${player.cardID.substring(0,8)}</span>`;
  playerListContent.appendChild(div);
}

function updateLeaderboardSnapshot(winnersObj) {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '';
  Object.entries(winnersObj || {}).forEach(([key, val]) => appendWinnerToLeaderboard(key, val));
}

function appendWinnerToLeaderboard(key, winner) {
  const leaderboard = document.getElementById('leaderboard');
  const div = document.createElement('div');
  div.className = 'player-item';
  div.innerHTML = `<span>${winner.handle}</span><span>${winner.gameType}</span>`;
  leaderboard.appendChild(div);
}

function cleanupListeners() {
  if (gameRef) {
    gameRef.off('child_added');
    gameRef.child('calledNumbers').off();
    gameRef.child('players').off();
    gameRef.child('winners').off();
  }
}

async function setupGame(id) {
  try {
    gameRef = database.ref(`games/${id}`);
    gameRef.child('calledNumbers').once('value', snap => {
      const obj = snap.val() || {};
      Object.values(obj).forEach(num => {
        calledNumbers.add(num);
        const [letter, number] = num.split('-');
        highlightNumber(letter, number);
      });
      localStorage.setItem('calledNumbers', JSON.stringify(Array.from(calledNumbers)));
    });
    gameRef.child('calledNumbers').on('child_added', snap => {
      const num = snap.val();
      if (!calledNumbers.has(num)) {
        calledNumbers.add(num);
        localStorage.setItem('calledNumbers', JSON.stringify(Array.from(calledNumbers)));
        const [letter, number] = num.split('-');
        highlightNumber(letter, number);
        if (!isHost) checkForBingo();
      }
    });
    gameRef.child('gameType').on('value', snap => {
      const val = snap.val();
      if (val && Object.keys(gamePatterns).includes(val)) {
        gameType = val;
        gameTypeSelect.value = val;
        displayWinPattern();
        if (!isHost) checkForBingo();
      }
    });
    gameRef.child('winners').once('value', snap => {
      const obj = snap.val() || {};
      updateLeaderboardSnapshot(obj);
    });
    gameRef.child('winners').on('child_added', snap => {
      const key = snap.key, val = snap.val();
      if (!notifiedWinners.has(key)) {
        notifiedWinners.add(key);
        appendWinnerToLeaderboard(key, val);
        if (isHost) showToast(`BINGO! ${val.handle} won (${val.gameType})!`, 4000);
        if (!isHost && val.handle === xHandle) showToast('BINGO! You won!', 5000, true);
      }
    });
    gameRef.child('players').once('value', snap => {
      console.log('Players snapshot:', snap.val());
      updatePlayerListSnapshot(snap.val());
    });
    gameRef.child('players').on('child_added', snap => {
      const key = snap.key, val = snap.val();
      console.log('Player added:', key, val);
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
    hostControls.style.display = 'block';
    playerControls.style.display = 'none';
    playerListEl.style.display = 'block';
    calledNumbers.clear();
    localStorage.removeItem('calledNumbers');
    notifiedWinners.clear();
    displayedPlayers.clear();
    playersArray = [];
    playerWins = {};
    localStorage.setItem('playerWins', JSON.stringify(playerWins));
    gameId = Math.random().toString(36).substring(2,10);
    localStorage.setItem('gameId', gameId);
    gameIdDisplay.textContent = `Game ID: ${gameId} (Share this!)`;
    setupGame(gameId);
    gameType = gameTypeSelect.value;
    if (gameRef) gameRef.child('gameType').set(gameType).catch(err => console.error(err));
    displayWinPattern();
    createBoard();
    showToast('Host mode enabled. New game created.', 3000);
  }).catch(err => {
    console.error('Auth error for host:', err);
    showToast('Failed to authenticate for host mode', 3000);
  });
});

playerModeBtn.addEventListener('click', () => {
  isHost = false;
  hostControls.style.display = 'none';
  playerControls.style.display = 'block';
  playerListEl.style.display = 'none';
  const stored = JSON.parse(localStorage.getItem('calledNumbers') || '[]');
  calledNumbers = new Set(stored);
  createBoard();
  displayWinPattern();
  showToast('Player mode: enter game ID and handle to join.', 2500);
});

joinGameBtn.addEventListener('click', async () => {
  const providedGameId = gameIdInput.value.trim();
  const providedHandle = xHandleInput.value.trim();
  if (!providedGameId) return showToast('Enter a valid Game ID', 3000);
  if (!providedHandle || !providedHandle.startsWith('@')) return showToast('Enter a valid X Handle (e.g., @UserX)', 3000);
  const handleKey = providedHandle.replace('@', '');
  if (!/^[a-zA-Z0-9_]+$/.test(handleKey)) {
    showToast('Invalid handle characters (alphanumeric and _ only)', 3000);
    return;
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
    playerWins = {};
    localStorage.setItem('playerWins', JSON.stringify(playerWins));
    displayPlayerCard();
    await gameRef.child('players').child(handleKey).set({
      handle: xHandle,
      cardID: cardID,
      card: playerCard
    });
    showToast(`Joined ${gameId} as ${xHandle}`, 3000);
    setupGame(gameId);
  } catch(err) {
    console.error('Error joining game:', err);
    showToast('Error joining game: ' + (err.message || 'Unknown error'), 3000);
  }
});

copyGameIdBtn.addEventListener('click', () => {
  if (!gameId) return showToast('No Game ID to copy', 2000);
  navigator.clipboard.writeText(gameId).then(() => showToast('Game ID copied!', 2000)).catch(e => showToast('Error copying', 2000));
});

rollButton.addEventListener('click', () => {
  if (!isHost || !gameRef) return showToast('Host a game first', 3000);
  const rolled = rollBingo();
  if (rolled) {
    const [L,N] = rolled.split('-');
    highlightNumber(L,N);
  }
});

resetButton.addEventListener('click', () => {
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
  resultDiv.textContent = '';
  createBoard();
  playerListContent.innerHTML = '';
  document.getElementById('leaderboard').innerHTML = '';
  hostControls.style.display = 'none';
  playerControls.style.display = 'none';
  gameId = null;
  localStorage.removeItem('gameId');
  localStorage.removeItem('xHandle');
  xHandle = null;
  gameRef = null;
  showToast('Game reset complete', 2000);
});

gameTypeSelect.addEventListener('change', () => {
  const val = gameTypeSelect.value;
  if (!Object.keys(gamePatterns).includes(val)) return;
  gameType = val;
  if (isHost && gameRef) gameRef.child('gameType').set(gameType).catch(err => console.error(err));
  displayWinPattern();
  if (!isHost) checkForBingo();
});

(function checkUrlAutoJoin() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get('gameId');
  if (urlGameId) {
    gameId = urlGameId;
    localStorage.setItem('gameId', gameId);
    playerModeBtn.click();
    gameIdInput.value = gameId;
    showToast('Auto-join game ID detected', 2000);
  }
})();

(function init() {
  const stored = JSON.parse(localStorage.getItem('calledNumbers') || '[]');
  calledNumbers = new Set(stored);
  createBoard();
  displayWinPattern();
  const savedX = parseFloat(localStorage.getItem('playerListTransformX') || '0');
  const savedY = parseFloat(localStorage.getItem('playerListTransformY') || '0');
  playerListEl.style.transform = `translate(${savedX}px, ${savedY}px)`;
})();

(function makePlayerListDraggable() {
  const el = playerListEl;
  let dragging = false, startX = 0, startY = 0, currentX = 0, currentY = 0, startTransform = {x:0,y:0};
  const savedX = parseFloat(localStorage.getItem('playerListTransformX') || '0');
  const savedY = parseFloat(localStorage.getItem('playerListTransformY') || '0');
  currentX = savedX; currentY = savedY;
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
    currentX = nx; currentY = ny;
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
  el.addEventListener('touchstart', onDown, {passive:false});
  window.addEventListener('touchmove', onMove, {passive:false});
  window.addEventListener('touchend', onUp);
})();

firebase.auth().onAuthStateChanged(user => { console.log('Auth state changed:', user); });
window._bingoState = () => ({ gameId, isHost, gameType, calledCount: calledNumbers.size });
