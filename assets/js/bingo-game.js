const letters = ['B','I','N','G','O'];
const ranges = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };

const gamePatterns = {
  line: {
    pattern: [[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    name: "Single Line",
    checkFunction: 'checkLine'
  },
  twoLines: {
    pattern: [[1,1,1,1,1],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    name: "Two Lines",
    checkFunction: 'checkTwoLines'
  },
  fullHouse: {
    pattern: [[1,1,1,1,1],[1,1,1,1,1],[1,1,0,1,1],[1,1,1,1,1],[1,1,1,1,1]],
    name: "Full House",
    checkFunction: 'checkFullHouse'
  },
  corners: {
    pattern: [[1,0,0,0,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1]],
    name: "Four Corners"
  },
  diagonal: {
    pattern: [[1,0,0,0,1],[0,1,0,1,0],[0,0,0,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    name: "Diagonal"
  },
  X: {
    pattern: [[1,0,0,0,1],[0,1,0,1,0],[0,0,0,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    name: "X Pattern"
  },
  outerFrame: {
    pattern: [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    name: "Outer Frame"
  },
  innerSquare: {
    pattern: [[0,0,0,0,0],[0,1,1,1,0],[0,1,0,1,0],[0,1,1,1,0],[0,0,0,0,0]],
    name: "Inner Square"
  }
};

let calledNumbers = new Set();
let isHost = false;
let gameId = null;
let playerCard = null;
let xHandle = localStorage.getItem('xHandle') || null;
let gameRef = null;
let gameType = 'line';
let playerWins = {};
const notifiedWinners = new Set();
const displayedPlayers = new Set();
let playersArray = [];
let initialLoadComplete = false;
let numbersListener = null;
let playersListener = null;
let gameTypeListener = null;

const hostModeBtn = document.getElementById('host-mode-btn');
const playerModeBtn = document.getElementById('player-mode-btn');
const hostControls = document.getElementById('host-controls');
const playerControls = document.getElementById('player-controls');
const displayGameId = document.getElementById('display-game-id');
const gameIdInput = document.getElementById('game-id-input');
const xHandleInput = document.getElementById('x-handle-input');
const joinGameBtn = document.getElementById('join-game-btn');
const rollButton = document.getElementById('roll-button');
const resetButton = document.getElementById('reset-button');
const gameTypeSelect = document.getElementById('game-type-select');
const copyGameIdBtn = document.getElementById('copy-game-id-btn');
const resultDiv = document.getElementById('result');
const playerListEl = document.getElementById('player-list');
const playerListContent = document.getElementById('player-list-content');
const currentGameTypeDiv = document.getElementById('current-game-type');
const modeSelection = document.getElementById('mode-selection');

function getRandomNumber(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function isValidCalledFormat(str){ return typeof str === 'string' && /^(?:B|I|N|G|O)-\d{1,2}$/.test(str); }

function updateStats() {
  const statsDiv = document.getElementById('stats');
  if (statsDiv) {
    statsDiv.textContent = `Called: ${calledNumbers.size}/75 | Remaining: ${75 - calledNumbers.size}`;
  }
}

function createBoard(){
  const board = document.getElementById('bingo-board');
  if(!board) return;
  board.innerHTML = '';
  
  letters.forEach(l=>{
    const header = document.createElement('div');
    header.textContent = l;
    header.className = 'header';
    board.appendChild(header);
  });
  
  const maxRows = 8;
  for(let row = 0; row < maxRows; row++){
    letters.forEach(letter=>{
      const [min] = ranges[letter];
      
      const leftNum = row < 8 ? min + row : null;
      const leftDiv = document.createElement('div');
      if (leftNum !== null) {
        leftDiv.textContent = leftNum;
        leftDiv.className = 'cell';
        leftDiv.id = `${letter}-${leftNum}`;
        if(calledNumbers.has(`${letter}-${leftNum}`)) leftDiv.classList.add('called');
      } else {
        leftDiv.className = 'empty';
      }
      board.appendChild(leftDiv);
      
      const rightNum = row < 7 ? min + row + 8 : null;
      const rightDiv = document.createElement('div');
      if (rightNum !== null) {
        rightDiv.textContent = rightNum;
        rightDiv.className = 'cell';
        rightDiv.id = `${letter}-${rightNum}`;
        if(calledNumbers.has(`${letter}-${rightNum}`)) rightDiv.classList.add('called');
      } else {
        rightDiv.className = 'empty';
      }
      board.appendChild(rightDiv);
    });
  }
}

function highlightNumber(L,N){
  const id = `${L}-${N}`;
  const cell = document.getElementById(id);
  if(cell) cell.classList.add('called');
  
  if (playerCard) {
    const cardContainer = document.getElementById('player-card-container');
    if(!cardContainer) return;
    const cardEl = cardContainer.querySelector('.player-card');
    if(!cardEl) return;
    
    const allCells = cardEl.querySelectorAll('.cell:not(.header)');
    allCells.forEach(c => {
      const val = c.textContent.trim();
      if(val && val !== 'FREE' && val === N.toString() && c.dataset.letter === L){
        c.classList.add('called');
      }
    });
  }
}

function rollBingo(){
  const available = [];
  letters.forEach(letter => {
    const [min,max] = ranges[letter];
    for(let i=min; i<=max; i++){
      const num = `${letter}-${i}`;
      if(!calledNumbers.has(num)) available.push({letter,i});
    }
  });
  
  if(available.length === 0){
    showToast('All numbers have been called!', 3000);
    return null;
  }
  
  const chosen = available[getRandomNumber(0, available.length-1)];
  const rolled = `${chosen.letter}-${chosen.i}`;
  calledNumbers.add(rolled);
  localStorage.setItem('calledNumbers', JSON.stringify([...calledNumbers]));
  
  if(gameRef){
    gameRef.child('calledNumbers').push(rolled).catch(err => console.error('Error pushing to Firebase:', err));
  }
  
  updateStats();
  return rolled;
}

function displayWinPattern(){
  const patternDiv = document.getElementById('win-pattern');
  if(!patternDiv) return;
  
  patternDiv.innerHTML = '';
  const pattern = gamePatterns[gameType]?.pattern || [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
  
  pattern.forEach((row, rowIndex) => {
    row.forEach((val, colIndex) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      if (rowIndex === 2 && colIndex === 2) {
        cellDiv.classList.add('win');
      } else if (val === 1) {
        cellDiv.classList.add('win');
      }
      patternDiv.appendChild(cellDiv);
    });
  });
  
  if (currentGameTypeDiv) {
    currentGameTypeDiv.textContent = `Current Game: ${gamePatterns[gameType]?.name || 'Unknown'}`;
  }
}

function generatePlayerCard() {
  return new Promise((resolve) => {
    const card = {};
    const cardID = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    letters.forEach(letter => {
      const [min, max] = ranges[letter];
      const nums = [];
      const available = [];
      for (let i = min; i <= max; i++) available.push(i);
      
      while (nums.length < 5) {
        const idx = getRandomNumber(0, available.length - 1);
        nums.push(available.splice(idx, 1)[0]);
      }
      
      card[letter] = nums.sort((a,b) => a - b);
    });
    
    resolve({ card, cardID });
  });
}

function displayPlayerCard(){
  const container = document.getElementById('player-card-container');
  if(!container) return;
  container.innerHTML = '';
  
  if (!playerCard) return;
  
  const cardEl = document.createElement('div');
  cardEl.className = 'player-card';
  
  letters.forEach(L => {
    const h = document.createElement('div');
    h.className = 'header';
    h.textContent = L;
    cardEl.appendChild(h);
  });
  
  for(let row = 0; row < 5; row++){
    letters.forEach((L, colIdx) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      
      if(row === 2 && colIdx === 2){
        cellDiv.textContent = 'FREE';
        cellDiv.classList.add('free', 'called');
      } else {
        const num = playerCard[L][row];
        cellDiv.textContent = num;
        cellDiv.dataset.letter = L;
        
        if(calledNumbers.has(`${L}-${num}`)){
          cellDiv.classList.add('called');
        }
      }
      
      cardEl.appendChild(cellDiv);
    });
  }
  
  container.appendChild(cardEl);
}

function checkLine(card, called) {
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) continue;
      const L = letters[col];
      const num = card[L][row];
      if (!called.has(`${L}-${num}`)) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return true;
  }
  
  for (let col = 0; col < 5; col++) {
    let colComplete = true;
    for (let row = 0; row < 5; row++) {
      if (row === 2 && col === 2) continue;
      const L = letters[col];
      const num = card[L][row];
      if (!called.has(`${L}-${num}`)) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return true;
  }
  
  return false;
}

function checkTwoLines(card, called) {
  let linesComplete = 0;
  
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) continue;
      const L = letters[col];
      const num = card[L][row];
      if (!called.has(`${L}-${num}`)) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) linesComplete++;
  }
  
  for (let col = 0; col < 5; col++) {
    let colComplete = true;
    for (let row = 0; row < 5; row++) {
      if (row === 2 && col === 2) continue;
      const L = letters[col];
      const num = card[L][row];
      if (!called.has(`${L}-${num}`)) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) linesComplete++;
  }
  
  return linesComplete >= 2;
}

function checkFullHouse(card, called) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) continue;
      const L = letters[col];
      const num = card[L][row];
      if (!called.has(`${L}-${num}`)) return false;
    }
  }
  return true;
}

function checkWinPattern(card, called, pattern){
  for(let row = 0; row < 5; row++){
    for(let col = 0; col < 5; col++){
      if(row === 2 && col === 2) continue;
      if(pattern[row][col] === 1){
        const L = letters[col];
        const num = card[L][row];
        if(!called.has(`${L}-${num}`)) return false;
      }
    }
  }
  return true;
}

function checkPlayerWin(){
  if (!playerCard || !gameRef) return false;
  
  const patternConfig = gamePatterns[gameType];
  if(!patternConfig) return false;
  
  let hasWon = false;
  
  if (patternConfig.checkFunction === 'checkLine') {
    hasWon = checkLine(playerCard, calledNumbers);
  } else if (patternConfig.checkFunction === 'checkTwoLines') {
    hasWon = checkTwoLines(playerCard, calledNumbers);
  } else if (patternConfig.checkFunction === 'checkFullHouse') {
    hasWon = checkFullHouse(playerCard, calledNumbers);
  } else if (patternConfig.pattern) {
    hasWon = checkWinPattern(playerCard, calledNumbers, patternConfig.pattern);
  }
  
  if(hasWon){
    const winKey = `${gameId}-${gameType}`;
    if(!playerWins[winKey]){
      playerWins[winKey] = true;
      localStorage.setItem('playerWins', JSON.stringify(playerWins));
      
      showToast(`🎉 BINGO! You won ${gamePatterns[gameType]?.name || 'this game'}!`, 5000);
      
      if(xHandle){
        const handleKey = xHandle.replace('@','');
        gameRef.child('players').child(handleKey).child('wins').child(gameType).set(true)
          .catch(err => console.error('Error recording win:', err));
      }
      
      return true;
    }
  }
  
  return false;
}

function showToast(message, duration = 3000){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function setupGame(gid){
  cleanupListeners();
  
  gameRef = database.ref(`games/${gid}`);
  
  numbersListener = gameRef.child('calledNumbers').on('child_added', (snapshot) => {
    const num = snapshot.val();
    if(!isValidCalledFormat(num)) return;
    
    const wasNew = !calledNumbers.has(num);
    if(wasNew){
      calledNumbers.add(num);
      localStorage.setItem('calledNumbers', JSON.stringify([...calledNumbers]));
      
      const [L,N] = num.split('-');
      if(!isHost) resultDiv.textContent = num;
      
      highlightNumber(L, parseInt(N));
      updateStats();
      createBoard();
      
      if(playerCard && !isHost){
        checkPlayerWin();
      }
    }
  });
  
  gameTypeListener = gameRef.child('gameType').on('value', (snapshot) => {
    const newType = snapshot.val();
    if(newType && gamePatterns[newType]){
      gameType = newType;
      displayWinPattern();
      
      if(!isHost && currentGameTypeDiv){
        currentGameTypeDiv.textContent = `Current Game: ${gamePatterns[gameType]?.name || 'Unknown'}`;
      }
    }
  });
  
  playersListener = gameRef.child('players').on('value', (snapshot) => {
    playersArray = [];
    displayedPlayers.clear();
    
    snapshot.forEach(childSnap => {
      const pData = childSnap.val();
      if(pData && pData.handle){
        const wins = pData.wins || {};
        const hasWon = wins[gameType] === true;
        playersArray.push({ handle: pData.handle, cardID: pData.cardID, hasWon, card: pData.card });
      }
    });
    
    renderPlayerList();
    
    if(isHost && initialLoadComplete){
      updateLeaderboard();
    }
  });
  
  initialLoadComplete = true;
}

function renderPlayerList(){
  if(!playerListContent) return;
  playerListContent.innerHTML = '';
  
  if(playersArray.length === 0){
    playerListContent.innerHTML = '<div style="color:rgba(255,255,255,0.5);">No players yet</div>';
    return;
  }
  
  playersArray.forEach(p => {
    const item = document.createElement('div');
    item.className = 'player-item';
    if(p.hasWon) item.classList.add('winner');
    
    const handleSpan = document.createElement('span');
    handleSpan.textContent = p.handle;
    item.appendChild(handleSpan);
    
    const cardSpan = document.createElement('span');
    cardSpan.className = 'cardid';
    cardSpan.textContent = p.cardID || '';
    item.appendChild(cardSpan);
    
    if(p.hasWon){
      const winBadge = document.createElement('span');
      winBadge.textContent = '🎉 WIN';
      winBadge.style.color = '#00FF00';
      winBadge.style.fontWeight = '900';
      item.appendChild(winBadge);
    }
    
    playerListContent.appendChild(item);
  });
}

function updateLeaderboard(){
  const leaderboard = document.getElementById('leaderboard');
  if(!leaderboard) return;
  
  const winners = playersArray.filter(p => p.hasWon);
  
  if(winners.length === 0){
    leaderboard.innerHTML = '';
    return;
  }
  
  leaderboard.innerHTML = '<h3>🏆 Winners</h3>';
  winners.forEach(w => {
    const entry = document.createElement('div');
    entry.className = 'leaderboard-entry';
    entry.innerHTML = `
      <span>${w.handle}</span>
      <span>Won: ${gamePatterns[gameType]?.name || gameType}</span>
    `;
    leaderboard.appendChild(entry);
  });
}

function cleanupListeners(){
  if(numbersListener && gameRef){
    gameRef.child('calledNumbers').off('child_added', numbersListener);
    numbersListener = null;
  }
  if(gameTypeListener && gameRef){
    gameRef.child('gameType').off('value', gameTypeListener);
    gameTypeListener = null;
  }
  if(playersListener && gameRef){
    gameRef.child('players').off('value', playersListener);
    playersListener = null;
  }
}

function clearAllGameData(){
  cleanupListeners();
  calledNumbers.clear();
  localStorage.removeItem('calledNumbers');
  localStorage.removeItem('playerCard');
  localStorage.removeItem('playerWins');
  localStorage.removeItem('gameId');
  playerCard = null;
  playerWins = {};
  notifiedWinners.clear();
  displayedPlayers.clear();
  playersArray = [];
  initialLoadComplete = false;
  gameId = null;
  gameRef = null;
  isHost = false;
}

hostModeBtn.addEventListener('click', async ()=>{
  try {
    await auth.signInAnonymously();
    
    isHost = true;
    gameId = 'GAME-' + Date.now().toString(36);
    localStorage.setItem('gameId', gameId);
    
    modeSelection.style.display = 'none';
    hostControls.style.display = 'block';
    playerControls.style.display = 'none';
    playerListEl.classList.add('show');
    
    if (displayGameId) displayGameId.textContent = gameId;
    
    gameRef = database.ref(`games/${gameId}`);
    gameRef.child('gameType').set(gameType);
    
    setupGame(gameId);
    
    displayWinPattern();
    createBoard();
    updateStats();
    
    resultDiv.textContent = 'Ready to Roll!';
    showToast('🎮 Host mode enabled. Share your Game ID with players!',3500);
  } catch(err){
    console.error('Auth error for host:', err);
    showToast('❌ Failed to authenticate for host mode. Retrying...', 3000);
    setTimeout(() => {
      hostModeBtn.click();
    }, 2000);
  }
});

playerModeBtn.addEventListener('click', ()=>{
  isHost = false;
  modeSelection.style.display = 'none';
  hostControls.style.display = 'none';
  playerControls.style.display = 'block';
  playerListEl.style.display = window.innerWidth <= 767 ? 'block' : 'none';
  
  createBoard();
  updateStats();
  displayWinPattern();
  
  if(xHandle) xHandleInput.value = xHandle;
  
  showToast('👤 Player mode: Enter Game ID and X handle to join',3000);
});

joinGameBtn.addEventListener('click', async ()=>{
  const providedGameId = gameIdInput.value.trim();
  const providedHandle = xHandleInput.value.trim();
  
  if(!providedGameId) return showToast('⚠️ Enter a valid Game ID', 3000);
  if(!providedHandle || !providedHandle.startsWith('@')) return showToast('⚠️ Enter a valid X Handle (e.g., @UserX)', 3000);
  
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
    
    const handleKey = xHandle.replace('@','');
    await gameRef.child('players').child(handleKey).set({
      handle: xHandle,
      cardID: cardID,
      card: playerCard
    });
    
    showToast(`✅ Joined ${gameId} as ${xHandle}`,3000);
    setupGame(gameId);
    
  } catch(err){
    console.error('Error joining game:', err);
    showToast('❌ Error joining game: ' + (err.message || 'Unknown error'), 3500);
  }
});

copyGameIdBtn.addEventListener('click', ()=>{
  if(!gameId) return showToast('No Game ID to copy',2000);
  navigator.clipboard.writeText(gameId)
    .then(()=> showToast('✅ Game ID copied to clipboard!',2000))
    .catch(e => showToast('Error copying',2000));
});

rollButton.addEventListener('click', ()=>{
  if(!isHost || !gameRef) return showToast('Host a game first', 3000);
  
  const rolled = rollBingo();
  if(rolled){
    const [L,N] = rolled.split('-');
    resultDiv.textContent = rolled;
    highlightNumber(L, parseInt(N));
  }
});

resetButton.addEventListener('click', ()=>{
  if(!confirm('Are you sure you want to reset the game? This will clear all data.')) return;
  
  if(gameRef && isHost){
    gameRef.remove().catch(err=>console.warn('Failed to remove game:', err));
  }
  
  clearAllGameData();
  
  createBoard();
  updateStats();
  playerListContent.innerHTML = '';
  document.getElementById('leaderboard').innerHTML = '';
  
  modeSelection.style.display = 'block';
  hostControls.style.display='none';
  playerControls.style.display='none';
  playerListEl.classList.remove('show');
  
  resultDiv.textContent = '';
  
  showToast('🔄 Game reset complete. Start a new game!',2500);
});

gameTypeSelect.addEventListener('change', ()=>{
  const val = gameTypeSelect.value;
  if(!Object.keys(gamePatterns).includes(val)) return;
  
  gameType = val;
  if(isHost && gameRef) {
    gameRef.child('gameType').set(gameType).catch(err=>console.error(err));
  }
  displayWinPattern();
});

(function checkUrlAutoJoin(){
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get('gameId');
  if(urlGameId){
    gameId = urlGameId;
    localStorage.setItem('gameId', gameId);
    playerModeBtn.click();
    gameIdInput.value = gameId;
    showToast('🔗 Auto-join game ID detected from URL',2500);
  }
})();

(function init(){
  clearAllGameData();
  createBoard();
  updateStats();
  displayWinPattern();
  
  const savedX = parseFloat(localStorage.getItem('playerListTransformX') || '0');
  const savedY = parseFloat(localStorage.getItem('playerListTransformY') || '0');
  playerListEl.style.transform = `translate(${savedX}px, ${savedY}px)`;
})();

(function makePlayerListDraggable(){
  const el = playerListEl;
  let dragging = false, startX=0, startY=0, currentX=0, currentY=0, startTransform = {x:0,y:0};
  const savedX = parseFloat(localStorage.getItem('playerListTransformX') || '0');
  const savedY = parseFloat(localStorage.getItem('playerListTransformY') || '0');
  currentX = savedX; currentY = savedY;
  el.style.transform = `translate(${currentX}px, ${currentY}px)`;

  function onDown(e){
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
  
  function onMove(e){
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
    currentX = nx; currentY = ny;
    el.style.transform = `translate(${currentX}px, ${currentY}px)`;
  }
  
  function onUp(){
    if(!dragging) return;
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

window.addEventListener('beforeunload', () => {
  clearAllGameData();
});

firebase.auth().onAuthStateChanged(user => { 
  console.log('Auth state:', user ? '✅ Authenticated' : '❌ Not authenticated'); 
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

console.log('%c$BINGO Roller v3.1 🎉', 'color: #00FF00; font-size: 20px; font-weight: bold;');
console.log('Debug: window._bingoDebug()');
