const letters = ['B','I','N','G','O'];
const ranges = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };

const gamePatterns = {
  singleLine: {
    pattern: [[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    name: "Single Line (Any Line)",
    checkFunction: 'checkSingleLine'
  },
  doubleLine: {
    pattern: [[1,1,1,1,1],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    name: "Double Line (Any 2 Lines)",
    checkFunction: 'checkDoubleLine'
  },
  fourCorners: {
    pattern: [[1,0,0,0,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1]],
    name: "Four Corners"
  },
  tShape: {
    pattern: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    name: "T-Shape"
  },
  plusSign: {
    pattern: [[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]],
    name: "Plus Sign (+)"
  },
  xShape: {
    pattern: [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    name: "X-Shape"
  },
  letterH: {
    pattern: [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    name: "Letter H"
  },
  letterL: {
    pattern: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    name: "Letter L"
  },
  letterU: {
    pattern: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    name: "Letter U"
  },
  pictureFrame: {
    pattern: [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    name: "Picture Frame"
  },
  perimeter: {
    pattern: [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    name: "Perimeter (Outside Edge)"
  },
  fullCard: {
    pattern: [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
    name: "Full Card (Blackout)"
  }
};

let calledNumbers = new Set();
let isHost = false;
let gameId = null;
let playerCard = null;
let xHandle = localStorage.getItem('xHandle') || null;
let gameRef = null;
let gameType = 'singleLine';
let playerWins = JSON.parse(localStorage.getItem('playerWins') || '{}');
const notifiedWinners = new Set();
const displayedPlayers = new Set();
let playersArray = [];
let initialLoadComplete = false;

const hostModeBtn = document.getElementById('host-mode-btn');
const playerModeBtn = document.getElementById('player-mode-btn');
const hostControls = document.getElementById('host-controls');
const playerControls = document.getElementById('player-controls');
const gameIdDisplay = document.getElementById('display-game-id');
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
const modeSelection = document.getElementById('mode-selection');
const numbersCalledEl = document.getElementById('numbers-called');
const numbersRemainingEl = document.getElementById('numbers-remaining');

function getRandomNumber(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function isValidCalledFormat(str){ return typeof str === 'string' && /^(?:B|I|N|G|O)-\d{1,2}$/.test(str); }

function updateStats(){
  if(numbersCalledEl) numbersCalledEl.textContent = calledNumbers.size;
  if(numbersRemainingEl) numbersRemainingEl.textContent = 75 - calledNumbers.size;
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
    gameRef.child('called').push(rolled).catch(err => console.error('Error pushing to Firebase:', err));
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
  
  const gameTypeName = gamePatterns[gameType]?.name || 'Unknown Pattern';
  const currentGameTypeDiv = document.getElementById('current-game-type');
  if(currentGameTypeDiv) {
    currentGameTypeDiv.textContent = `Current Game: ${gameTypeName}`;
    currentGameTypeDiv.style.display = 'block';
  }
}

function generatePlayerCard(){
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

function checkSingleLine(card, called){
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

function checkDoubleLine(card, called){
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
  
  if (patternConfig.checkFunction === 'checkSingleLine') {
    hasWon = checkSingleLine(playerCard, calledNumbers);
  } else if (patternConfig.checkFunction === 'checkDoubleLine') {
    hasWon = checkDoubleLine(playerCard, calledNumbers);
  } else if (patternConfig.pattern) {
    hasWon = checkWinPattern(playerCard, calledNumbers, patternConfig.pattern);
  }
  
  if(hasWon){
    const winKey = `${gameId}-${gameType}`;
    if(!playerWins[winKey]){
      playerWins[winKey] = true;
      localStorage.setItem('playerWins', JSON.stringify(playerWins));
      
      showToast(`🎉 BINGO! You won ${gamePatterns[gameType]?.name || 'this game'}!`, 5000);
      
      if(xHandle && gameRef){
        const handleKey = xHandle.replace('@','');
        gameRef.child('winners').child(handleKey).set({
          handle: xHandle,
          gameType: gameType,
          timestamp: Date.now()
        }).catch(err => console.error('Error recording win:', err));
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

function cleanupListeners(){
  if(gameRef){
    try {
      gameRef.child('called').off();
      gameRef.child('gameType').off();
      gameRef.child('winners').off();
      gameRef.child('players').off();
    } catch(e){ 
      console.error('Listener cleanup error', e); 
    }
  }
}

function setupGame(id){
  try {
    cleanupListeners();
    initialLoadComplete = false;
    gameRef = database.ref(`games/${id}`);
    
    gameRef.child('called').once('value', snap=>{
      calledNumbers.clear();
      const obj = snap.val();
      if(obj){ 
        Object.values(obj).forEach(v=> { 
          if(isValidCalledFormat(v)) calledNumbers.add(v); 
        }); 
      }
      localStorage.setItem('calledNumbers', JSON.stringify([...calledNumbers]));
      createBoard();
      updateStats();
      if (!isHost && playerCard) displayPlayerCard();
      
      setTimeout(() => {
        initialLoadComplete = true;
      }, 1000);
    });
    
    gameRef.child('called').on('child_added', snap=>{
      const rolled = snap.val();
      if(!isValidCalledFormat(rolled)) return;
      
      if(!initialLoadComplete) return;
      
      const wasNew = !calledNumbers.has(rolled);
      if(wasNew){
        calledNumbers.add(rolled);
        localStorage.setItem('calledNumbers', JSON.stringify([...calledNumbers]));
        
        const [L,N] = rolled.split('-');
        if(!isHost) resultDiv.textContent = rolled;
        
        highlightNumber(L, parseInt(N));
        updateStats();
        createBoard();
        
        if(playerCard && !isHost){
          checkPlayerWin();
        }
      }
    });
    
    gameRef.child('gameType').on('value', snap=>{
      const newType = snap.val();
      if(newType && gamePatterns[newType]){
        gameType = newType;
        displayWinPattern();
      }
    });
    
    gameRef.child('players').on('value', snap=>{
      playersArray = [];
      displayedPlayers.clear();
      
      if(playerListContent) {
        playerListContent.innerHTML = '';
      }
      
      snap.forEach(childSnap => {
        const pData = childSnap.val();
        if(pData && pData.handle){
          const handle = pData.handle;
          const cardID = pData.cardID || 'N/A';
          playersArray.push({ handle, cardID });
          
          if(playerListContent){
            const div = document.createElement('div');
            div.className = 'player-item';
            const left = document.createElement('div');
            left.textContent = handle;
            const right = document.createElement('div');
            right.className = 'cardid';
            right.textContent = `#${cardID}`;
            div.appendChild(left);
            div.appendChild(right);
            playerListContent.appendChild(div);
          }
        }
      });
      
      if(playerListContent && playersArray.length === 0){
        playerListContent.innerHTML = '<div style="color:rgba(255,255,255,0.5);">No players yet</div>';
      }
    });
    
  } catch(e){
    console.error('Setup game error:', e);
    showToast('Error setting up game', 3000);
  }
}

hostModeBtn.addEventListener('click', ()=>{
  auth.signInAnonymously().then(()=>{
    isHost = true;
    modeSelection.style.display = 'none';
    hostControls.style.display = 'block';
    playerControls.style.display = 'none';
    playerListEl.classList.add('show');
    
    calledNumbers.clear();
    localStorage.removeItem('calledNumbers');
    notifiedWinners.clear();
    displayedPlayers.clear();
    playersArray = [];
    playerWins = {};
    localStorage.setItem('playerWins', JSON.stringify(playerWins));
    initialLoadComplete = true;
    
    gameId = Math.random().toString(36).substring(2,10);
    localStorage.setItem('gameId', gameId);
    gameIdDisplay.textContent = gameId;
    
    setupGame(gameId);
    
    gameType = gameTypeSelect.value;
    if(gameRef) gameRef.child('gameType').set(gameType).catch(err=>console.error(err));
    
    displayWinPattern();
    createBoard();
    updateStats();
    
    resultDiv.textContent = 'Ready to Roll!';
    showToast('🎮 Host mode enabled. Share your Game ID with players!',3500);
  }).catch(err=>{
    console.error('Auth error for host:', err);
    showToast('❌ Failed to authenticate. Check console for details.', 4000);
  });
});

playerModeBtn.addEventListener('click', ()=>{
  isHost = false;
  modeSelection.style.display = 'none';
  hostControls.style.display = 'none';
  playerControls.style.display = 'block';
  playerListEl.style.display = window.innerWidth <= 767 ? 'block' : 'none';
  
  const stored = JSON.parse(localStorage.getItem('calledNumbers') || '[]');
  calledNumbers = new Set(stored);
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
  if(playerListContent) playerListContent.innerHTML = '';
  
  modeSelection.style.display = 'block';
  hostControls.style.display='none';
  playerControls.style.display='none';
  playerListEl.classList.remove('show');
  
  gameId = null;
  localStorage.removeItem('gameId');
  gameRef = null;
  isHost = false;
  
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

(function init(){
  const stored = JSON.parse(localStorage.getItem('calledNumbers') || '[]');
  calledNumbers = new Set(stored);
  createBoard();
  updateStats();
  displayWinPattern();
})();

(function makePlayerListDraggable(){
  const el = playerListEl;
  if(!el) return;
  
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

firebase.auth().onAuthStateChanged(user => { 
  console.log('🔐 Auth state:', user ? '✅ Authenticated' : '❌ Not authenticated'); 
});

console.log('%c$BINGO Roller v4.0 🎉', 'color: #00FF00; font-size: 20px; font-weight: bold;');
console.log('Firebase Project:', firebaseConfig.projectId);
