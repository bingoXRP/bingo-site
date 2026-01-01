// ============================================
// $BINGO LIVE - PRODUCTION v10.0
// All critical fixes + improvements included
// ============================================

const LETTERS = ['B','I','N','G','O'];
const RANGES = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };

const GAME_PATTERNS = {
  singleLine: {
    pattern: [[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    name: "Single Line (Any Row/Column)",
    checkFunction: 'checkSingleLine',
    description: 'Complete any horizontal row or vertical column'
  },
  doubleLine: {
    pattern: [[1,1,1,1,1],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    name: "Double Line (Any 2 Lines)",
    checkFunction: 'checkDoubleLine',
    description: 'Complete any two rows or columns'
  },
  fourCorners: {
    pattern: [[1,0,0,0,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1]],
    name: "Four Corners",
    description: 'Mark all four corner squares'
  },
  tShape: {
    pattern: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    name: "T-Shape",
    description: 'Form a T shape pattern'
  },
  plusSign: {
    pattern: [[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]],
    name: "Plus Sign",
    description: 'Form a + shape pattern'
  },
  xShape: {
    pattern: [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    name: "X-Shape",
    description: 'Form an X shape with diagonals'
  },
  letterH: {
    pattern: [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    name: "Letter H",
    description: 'Form the letter H'
  },
  letterL: {
    pattern: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    name: "Letter L",
    description: 'Form the letter L'
  },
  letterU: {
    pattern: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    name: "Letter U",
    description: 'Form the letter U'
  },
  pictureFrame: {
    pattern: [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    name: "Picture Frame",
    description: 'Mark the outer edge only'
  },
  perimeter: {
    pattern: [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    name: "Perimeter",
    description: 'Complete the outer perimeter'
  },
  fullCard: {
    pattern: [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
    name: "Full Card (Blackout)",
    description: 'Mark all squares on the card'
  }
};

let STATE = 'LANDING';
let isHost = false;
let gameId = null;
let hostHandle = null;
let playerHandle = null;
let playerCards = [];
let currentCardIndex = 0;
let numCards = 1;
let gameType = 'singleLine';
let calledNumbers = new Set();
let gameRef = null;
let playersData = [];
let winnersData = [];
let cardWins = [];
let initialLoadComplete = false;
let isConnected = true;
let connectionRef = null;

const screens = {
  landing: document.getElementById('landing-screen'),
  hostSetup: document.getElementById('host-setup-screen'),
  playerSetup: document.getElementById('player-setup-screen'),
  hostGame: document.getElementById('host-game-screen'),
  playerGame: document.getElementById('player-game-screen'),
  gameEnd: document.getElementById('game-end-screen')
};

const elems = {
  btnHostMode: document.getElementById('btn-host-mode'),
  btnPlayerMode: document.getElementById('btn-player-mode'),
  btnBackFromHost: document.getElementById('btn-back-from-host'),
  btnBackFromPlayer: document.getElementById('btn-back-from-player'),
  hostHandle: document.getElementById('host-handle'),
  hostPattern: document.getElementById('host-pattern'),
  hostPatternChange: document.getElementById('host-pattern-change'),
  btnStartHost: document.getElementById('btn-start-host'),
  playerGameId: document.getElementById('player-gameid'),
  playerHandle: document.getElementById('player-handle'),
  playerCardsSelect: document.getElementById('player-cards'),
  btnJoinGame: document.getElementById('btn-join-game'),
  displayGameId: document.getElementById('display-game-id'),
  btnCopyId: document.getElementById('btn-copy-id'),
  hostLastCalled: document.getElementById('host-last-called'),
  btnRoll: document.getElementById('btn-roll'),
  hostBoard: document.getElementById('host-board'),
  hostPatternGrid: document.getElementById('host-pattern-grid'),
  hostPatternName: document.getElementById('host-pattern-name'),
  hostPlayersList: document.getElementById('host-players-list'),
  statCalled: document.getElementById('stat-called'),
  statRemaining: document.getElementById('stat-remaining'),
  statPlayers: document.getElementById('stat-players'),
  statWinners: document.getElementById('stat-winners'),
  btnEndGame: document.getElementById('btn-end-game'),
  btnHostHome: document.getElementById('btn-host-home'),
  btnHostShare: document.getElementById('btn-host-share'),
  playerNameDisplay: document.getElementById('player-name-display'),
  playerLastCalled: document.getElementById('player-last-called'),
  cardsIndicator: document.getElementById('cards-indicator'),
  cardsNav: document.getElementById('cards-nav'),
  btnPrevCard: document.getElementById('btn-prev-card'),
  cardPosition: document.getElementById('card-position'),
  btnNextCard: document.getElementById('btn-next-card'),
  playerCardsContainer: document.getElementById('player-cards-container'),
  playerBoardView: document.getElementById('player-board-view'),
  playerPlayersList: document.getElementById('player-players-list'),
  infoGameId: document.getElementById('info-game-id'),
  infoPattern: document.getElementById('info-pattern'),
  infoCalled: document.getElementById('info-called'),
  infoPlayers: document.getElementById('info-players'),
  playerPatternGrid: document.getElementById('player-pattern-grid'),
  playerPatternName: document.getElementById('player-pattern-name'),
  btnLeaveGame: document.getElementById('btn-leave-game'),
  btnPlayerHome: document.getElementById('btn-player-home'),
  btnPlayerShare: document.getElementById('btn-player-share'),
  winnersDisplay: document.getElementById('winners-display'),
  endNumbers: document.getElementById('end-numbers'),
  endWinners: document.getElementById('end-winners'),
  btnPlayAgain: document.getElementById('btn-play-again'),
  btnNewGame: document.getElementById('btn-new-game'),
  btnGoHome: document.getElementById('btn-go-home'),
  toast: document.getElementById('toast'),
  loading: document.getElementById('loading')
};

function showScreen(screenName) {
  Object.values(screens).forEach(s => s?.classList.remove('active'));
  screens[screenName]?.classList.add('active');
  STATE = screenName.toUpperCase();
}

function showToast(message, duration = 3000) {
  if (!elems.toast) return;
  elems.toast.textContent = message;
  elems.toast.classList.add('show');
  setTimeout(() => elems.toast.classList.remove('show'), duration);
}

function showLoading(show = true) {
  if (!elems.loading) return;
  if (show) {
    elems.loading.classList.add('show');
  } else {
    elems.loading.classList.remove('show');
  }
}

function validateHandle(handle) {
  if (!handle || handle.trim().length < 2) {
    return { valid: false, error: 'Handle must be at least 2 characters' };
  }
  if (handle.length > 20) {
    return { valid: false, error: 'Handle must be 20 characters or less' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(handle.replace('@', ''))) {
    return { valid: false, error: 'Handle can only contain letters, numbers, _ and -' };
  }
  return { valid: true };
}

function validateGameId(gameId) {
  if (!gameId || gameId.trim().length !== 8) {
    return { valid: false, error: 'Game ID must be exactly 8 characters' };
  }
  if (!/^[A-Z0-9]+$/.test(gameId)) {
    return { valid: false, error: 'Game ID can only contain letters and numbers' };
  }
  return { valid: true };
}

function normalizeHandle(handle) {
  if (!handle) return '';
  handle = handle.trim();
  if (!handle.startsWith('@')) {
    handle = '@' + handle;
  }
  return handle;
}

function generateCardID() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${letter}${num}`;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isValidCalledFormat(str) {
  return typeof str === 'string' && /^(?:B|I|N|G|O)-\d{1,2}$/.test(str);
}

function generateGameId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateCard() {
  const card = {};
  const cardID = generateCardID();
  
  LETTERS.forEach(letter => {
    const [min, max] = RANGES[letter];
    const nums = [];
    const available = [];
    for (let i = min; i <= max; i++) available.push(i);
    
    while (nums.length < 5) {
      const idx = getRandomNumber(0, available.length - 1);
      nums.push(available.splice(idx, 1)[0]);
    }
    
    card[letter] = nums.sort((a, b) => a - b);
  });
  
  return { card, cardID };
}

function setupConnectionMonitoring() {
  if (connectionRef) return;
  
  connectionRef = database.ref('.info/connected');
  connectionRef.on('value', (snap) => {
    isConnected = snap.val() === true;
    
    if (!isConnected) {
      showToast('⚠️ Connection lost. Reconnecting...', 5000);
    } else if (STATE !== 'LANDING' && STATE !== 'HOSTSETUP' && STATE !== 'PLAYERSETUP') {
      showToast('✅ Connected', 2000);
    }
  });
}

function handleFirebaseError(error, context = '') {
  console.error(`Firebase error (${context}):`, error);
  
  let userMessage = 'An error occurred. Please try again.';
  
  if (error.code === 'PERMISSION_DENIED') {
    userMessage = 'Access denied. The game may not exist or has ended.';
  } else if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
    userMessage = 'Network error. Check your connection and try again.';
  } else if (error.code === 'UNAVAILABLE') {
    userMessage = 'Service temporarily unavailable. Please try again.';
  } else if (context === 'join') {
    userMessage = 'Could not join game. Verify the Game ID and try again.';
  } else if (context === 'create') {
    userMessage = 'Could not create game. Please try again.';
  }
  
  showToast(`❌ ${userMessage}`, 4000);
  return userMessage;
}

function createBoard(boardElement) {
  if (!boardElement) return;
  boardElement.innerHTML = '';
  
  LETTERS.forEach(l => {
    const header = document.createElement('div');
    header.textContent = l;
    header.className = 'header';
    boardElement.appendChild(header);
  });
  
  for (let row = 0; row < 8; row++) {
    LETTERS.forEach(letter => {
      const [min] = RANGES[letter];
      
      const leftNum = row < 8 ? min + row : null;
      const leftDiv = document.createElement('div');
      if (leftNum !== null) {
        leftDiv.textContent = leftNum;
        leftDiv.className = 'cell';
        leftDiv.id = `${letter}-${leftNum}`;
        if (calledNumbers.has(`${letter}-${leftNum}`)) leftDiv.classList.add('called');
      } else {
        leftDiv.className = 'empty';
      }
      boardElement.appendChild(leftDiv);
      
      const rightNum = row < 7 ? min + row + 8 : null;
      const rightDiv = document.createElement('div');
      if (rightNum !== null) {
        rightDiv.textContent = rightNum;
        rightDiv.className = 'cell';
        rightDiv.id = `${letter}-${rightNum}`;
        if (calledNumbers.has(`${letter}-${rightNum}`)) rightDiv.classList.add('called');
      } else {
        rightDiv.className = 'empty';
      }
      boardElement.appendChild(rightDiv);
    });
  }
}

function displayPattern(gridElement, nameElement) {
  if (!gridElement) return;
  gridElement.innerHTML = '';
  
  const patternConfig = GAME_PATTERNS[gameType];
  if (!patternConfig) return;
  
  const pattern = patternConfig.pattern || [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
  
  pattern.forEach((row, rowIndex) => {
    row.forEach((val, colIndex) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      if (rowIndex === 2 && colIndex === 2) {
        cellDiv.classList.add('win');
      } else if (val === 1) {
        cellDiv.classList.add('win');
      }
      gridElement.appendChild(cellDiv);
    });
  });
  
  if (nameElement) {
    nameElement.textContent = patternConfig.name || 'Unknown Pattern';
    nameElement.title = patternConfig.description || '';
  }
}

function displayPlayerCards() {
  if (!elems.playerCardsContainer) return;
  elems.playerCardsContainer.innerHTML = '';
  
  if (numCards === 1) {
    elems.playerCardsContainer.classList.add('single-card');
  } else {
    elems.playerCardsContainer.classList.remove('single-card');
  }
  
  playerCards.forEach((cardData, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'player-card-wrapper';
    if (index === currentCardIndex) wrapper.classList.add('active');
    
    const cardLabel = document.createElement('div');
    cardLabel.className = 'card-id-label';
    cardLabel.textContent = `Card ${cardData.cardID}`;
    
    const cardEl = document.createElement('div');
    cardEl.className = 'player-card';
    cardEl.dataset.cardIndex = index;
    
    LETTERS.forEach(L => {
      const h = document.createElement('div');
      h.className = 'header';
      h.textContent = L;
      cardEl.appendChild(h);
    });
    
    for (let row = 0; row < 5; row++) {
      LETTERS.forEach((L, colIdx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        
        if (row === 2 && colIdx === 2) {
          cellDiv.textContent = 'FREE';
          cellDiv.classList.add('free', 'called');
        } else {
          const num = cardData.card[L][row];
          cellDiv.textContent = num;
          cellDiv.dataset.letter = L;
          cellDiv.dataset.number = num;
          
          if (calledNumbers.has(`${L}-${num}`)) {
            cellDiv.classList.add('called');
          }
        }
        
        cardEl.appendChild(cellDiv);
      });
    }
    
    wrapper.appendChild(cardLabel);
    wrapper.appendChild(cardEl);
    elems.playerCardsContainer.appendChild(wrapper);
  });
  
  updateCardNavigation();
}

function updateCardNavigation() {
  if (numCards === 1) {
    if (elems.cardsNav) elems.cardsNav.style.display = 'none';
    if (elems.cardsIndicator) elems.cardsIndicator.textContent = '1/1';
  } else {
    if (elems.cardsNav) elems.cardsNav.style.display = 'flex';
    if (elems.cardPosition) elems.cardPosition.textContent = `Card ${currentCardIndex + 1} of ${numCards}`;
    if (elems.cardsIndicator) elems.cardsIndicator.textContent = `${currentCardIndex + 1}/${numCards}`;
    
    if (elems.btnPrevCard) elems.btnPrevCard.disabled = (currentCardIndex === 0);
    if (elems.btnNextCard) elems.btnNextCard.disabled = (currentCardIndex === numCards - 1);
    
    document.querySelectorAll('.player-card-wrapper').forEach((wrapper, idx) => {
      if (idx === currentCardIndex) {
        wrapper.classList.add('active');
      } else {
        wrapper.classList.remove('active');
      }
    });
  }
}

function checkSingleLine(card, called) {
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) continue;
      const L = LETTERS[col];
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
      const L = LETTERS[col];
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

function checkDoubleLine(card, called) {
  let linesComplete = 0;
  
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) continue;
      const L = LETTERS[col];
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
      const L = LETTERS[col];
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

function checkWinPattern(card, called, pattern) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) continue;
      if (pattern[row][col] === 1) {
        const L = LETTERS[col];
        const num = card[L][row];
        if (!called.has(`${L}-${num}`)) return false;
      }
    }
  }
  return true;
}

function checkAllCardsForWin() {
  const patternConfig = GAME_PATTERNS[gameType];
  if (!patternConfig) return [];
  
  const newWins = [];
  
  for (let i = 0; i < playerCards.length; i++) {
    if (cardWins[i]) continue;
    
    const cardData = playerCards[i];
    let hasWon = false;
    
    if (patternConfig.checkFunction === 'checkSingleLine') {
      hasWon = checkSingleLine(cardData.card, calledNumbers);
    } else if (patternConfig.checkFunction === 'checkDoubleLine') {
      hasWon = checkDoubleLine(cardData.card, calledNumbers);
    } else if (patternConfig.pattern) {
      hasWon = checkWinPattern(cardData.card, calledNumbers, patternConfig.pattern);
    }
    
    if (hasWon) {
      newWins.push({ cardIndex: i, cardID: cardData.cardID });
      cardWins[i] = true;
    }
  }
  
  return newWins;
}

function rollNumber() {
  const available = [];
  LETTERS.forEach(letter => {
    const [min, max] = RANGES[letter];
    for (let i = min; i <= max; i++) {
      const num = `${letter}-${i}`;
      if (!calledNumbers.has(num)) available.push({ letter, i });
    }
  });
  
  if (available.length === 0) {
    showToast('All 75 numbers have been called!', 3000);
    return null;
  }
  
  const chosen = available[getRandomNumber(0, available.length - 1)];
  const rolled = `${chosen.letter}-${chosen.i}`;
  
  calledNumbers.add(rolled);
  
  if (gameRef) {
    gameRef.child('called').push(rolled).catch(err => {
      handleFirebaseError(err, 'roll');
    });
  }
  
  return rolled;
}

function updateStats() {
  if (elems.statCalled) elems.statCalled.textContent = calledNumbers.size;
  if (elems.statRemaining) elems.statRemaining.textContent = 75 - calledNumbers.size;
  if (elems.infoCalled) elems.infoCalled.textContent = `${calledNumbers.size}/75`;
  
  if (elems.btnRoll && calledNumbers.size >= 75) {
    elems.btnRoll.disabled = true;
    elems.btnRoll.textContent = '✓ ALL CALLED';
  }
}

function displayPlayerList(listElement) {
  if (!listElement) return;
  listElement.innerHTML = '';
  
  if (isHost && hostHandle) {
    const hostDiv = document.createElement('div');
    hostDiv.className = 'player-item host-player';
    hostDiv.innerHTML = `<div>👑 ${hostHandle} (Host)</div><div class="cardid">HOST</div>`;
    listElement.appendChild(hostDiv);
  }
  
  playersData.forEach(p => {
    const div = document.createElement('div');
    div.className = 'player-item';
    const isWinner = winnersData.some(w => w.handle === p.handle);
    if (isWinner) div.classList.add('winner');
    
    const cardInfo = p.cardIDs && p.cardIDs.length > 1 
      ? `${p.cardIDs.length} cards` 
      : `#${p.cardIDs ? p.cardIDs[0] : p.cardID || 'N/A'}`;
    
    div.innerHTML = `<div>${isWinner ? '🏆 ' : ''}${p.handle}</div><div class="cardid">${cardInfo}</div>`;
    listElement.appendChild(div);
  });
  
  if (elems.statPlayers) elems.statPlayers.textContent = playersData.length + (isHost ? 1 : 0);
  if (elems.infoPlayers) elems.infoPlayers.textContent = playersData.length + (isHost ? 1 : 0);
}

function updatePlayersList() {
  displayPlayerList(elems.hostPlayersList);
  displayPlayerList(elems.playerPlayersList);
}

function setupFirebaseListeners() {
  if (!gameRef) return;
  
  gameRef.child('called').once('value', snap => {
    calledNumbers.clear();
    const obj = snap.val();
    if (obj) {
      Object.values(obj).forEach(v => {
        if (isValidCalledFormat(v)) calledNumbers.add(v);
      });
    }
    
    createBoard(elems.hostBoard);
    createBoard(elems.playerBoardView);
    if (!isHost && playerCards.length > 0) displayPlayerCards();
    updateStats();
    
    setTimeout(() => {
      initialLoadComplete = true;
    }, 1000);
  }).catch(err => {
    handleFirebaseError(err, 'load');
    showLoading(false);
  });
  
  gameRef.child('called').on('child_added', snap => {
    const rolled = snap.val();
    if (!isValidCalledFormat(rolled) || !initialLoadComplete) return;
    
    if (!calledNumbers.has(rolled)) {
      calledNumbers.add(rolled);
      
      if (elems.hostLastCalled) elems.hostLastCalled.textContent = rolled;
      if (elems.playerLastCalled) elems.playerLastCalled.textContent = rolled;
      
      createBoard(elems.hostBoard);
      createBoard(elems.playerBoardView);
      if (!isHost && playerCards.length > 0) displayPlayerCards();
      updateStats();
      
      if (!isHost) {
        const newWins = checkAllCardsForWin();
        newWins.forEach(winResult => {
          showToast(`🎉 BINGO! Card ${winResult.cardID} wins!`, 5000);
          if (gameRef && playerHandle) {
            const handleKey = normalizeHandle(playerHandle).substring(1);
            const winKey = `${handleKey}_${winResult.cardID}`;
            gameRef.child('winners').child(winKey).set({
              handle: playerHandle,
              cardID: winResult.cardID,
              gameType: gameType,
              wonAt: Date.now(),
              numbersCalled: calledNumbers.size
            }).catch(err => handleFirebaseError(err, 'win'));
          }
        });
      }
    }
  });
  
  gameRef.child('gameType').on('value', snap => {
    const newType = snap.val();
    if (newType && GAME_PATTERNS[newType] && newType !== gameType) {
      const oldType = gameType;
      gameType = newType;
      
      displayPattern(elems.hostPatternGrid, elems.hostPatternName);
      displayPattern(elems.playerPatternGrid, elems.playerPatternName);
      if (elems.infoPattern) elems.infoPattern.textContent = GAME_PATTERNS[gameType]?.name || 'Unknown';
      
      if (elems.hostPatternChange) elems.hostPatternChange.value = gameType;
      
      if (!isHost && initialLoadComplete) {
        showToast(`🔄 Pattern changed to: ${GAME_PATTERNS[gameType].name}`, 4000);
        cardWins = [];
        
        const newWins = checkAllCardsForWin();
        newWins.forEach(winResult => {
          showToast(`🎉 BINGO! Card ${winResult.cardID} wins with new pattern!`, 5000);
        });
      }
    }
  });
  
  gameRef.child('players').on('value', snap => {
    playersData = [];
    snap.forEach(childSnap => {
      const pData = childSnap.val();
      if (pData && pData.handle) {
        playersData.push({
          handle: pData.handle,
          cardID: pData.cardID || 'N/A',
          cardIDs: pData.cardIDs || [pData.cardID],
          numCards: pData.numCards || 1,
          joinedAt: pData.joinedAt || 0
        });
      }
    });
    updatePlayersList();
  });
  
  gameRef.child('winners').on('value', snap => {
    winnersData = [];
    snap.forEach(childSnap => {
      const wData = childSnap.val();
      if (wData) {
        winnersData.push(wData);
      }
    });
    winnersData.sort((a, b) => a.wonAt - b.wonAt);
    if (elems.statWinners) elems.statWinners.textContent = winnersData.length;
    updatePlayersList();
  });
}

function cleanupFirebaseListeners() {
  if (gameRef) {
    try {
      gameRef.child('called').off();
      gameRef.child('gameType').off();
      gameRef.child('players').off();
      gameRef.child('winners').off();
    } catch (e) {
      console.error('Listener cleanup error:', e);
    }
  }
}

function setupTabNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      const parent = btn.closest('.screen');
      
      parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetTab = parent.querySelector(`#${tabName}`);
      if (targetTab) targetTab.classList.add('active');
    });
  });
}

function handleURLParams() {
  const params = new URLSearchParams(window.location.search);
  const gameParam = params.get('game');
  const hostParam = params.get('host');
  
  if (gameParam) {
    if (elems.playerGameId) elems.playerGameId.value = gameParam.toUpperCase();
    showScreen('playerSetup');
    showToast('Game ID pre-filled from link!', 2000);
  } else if (hostParam === 'true') {
    showScreen('hostSetup');
  }
}

function exportWinnersForPrizes() {
  if (!winnersData || winnersData.length === 0) {
    console.log('No winners to export');
    return null;
  }
  
  const exportData = {
    gameId: gameId,
    totalWinners: winnersData.length,
    totalNumbersCalled: calledNumbers.size,
    winners: winnersData.map(w => ({
      handle: w.handle,
      cardID: w.cardID,
      pattern: GAME_PATTERNS[w.gameType]?.name || w.gameType,
      wonAt: new Date(w.wonAt).toLocaleString(),
      numbersCalled: w.numbersCalled
    }))
  };
  
  console.log('🏆 Winners Export for Prizes:', exportData);
  console.table(exportData.winners);
  return exportData;
}

function startOnboardingTour() {
  const hasSeenTour = localStorage.getItem('bingoTourCompleted');
  if (hasSeenTour) return;
  
  const tourSteps = [
    { element: '#display-game-id', text: 'This is your Game ID. Share it with players!', tab: null },
    { element: '#btn-copy-id', text: 'Click here to copy the game link to share.', tab: null },
    { element: '#btn-roll', text: 'Click ROLL to call the next number.', tab: null },
    { element: '#host-pattern-change', text: 'Change patterns mid-game for progressive gameplay!', tab: 'host-game-tab' },
    { element: '.game-tabs', text: 'Switch between tabs to see players, stats, and more.', tab: null },
    { element: '#btn-end-game', text: 'End the game when ready to see all winners.', tab: 'host-stats-tab' }
  ];
  
  let currentStep = 0;
  const overlay = document.createElement('div');
  overlay.className = 'tour-overlay';
  overlay.innerHTML = `
    <div class="tour-spotlight"></div>
    <div class="tour-tooltip">
      <div class="tour-progress">Step <span class="tour-current">1</span> of <span class="tour-total">${tourSteps.length}</span></div>
      <div class="tour-content"></div>
      <div class="tour-actions">
        <button class="tour-skip">Skip Tour</button>
        <button class="tour-next">Next</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  document.body.style.overflow = 'hidden';
  
  function positionTooltip(rect, tooltip) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const tooltipRect = tooltip.getBoundingClientRect();
    
    if (window.innerWidth <= 767) {
      tooltip.style.cssText = `
        left: 20px;
        right: 20px;
        bottom: 20px;
        top: auto;
        max-width: none;
        width: calc(100vw - 40px);
      `;
      return;
    }
    
    let top = rect.bottom + 20;
    let left = Math.max(20, rect.left);
    
    if (top + tooltipRect.height > viewportHeight - 20) {
      top = rect.top - tooltipRect.height - 20;
    }
    
    if (left + tooltipRect.width > viewportWidth - 20) {
      left = viewportWidth - tooltipRect.width - 20;
    }
    
    left = Math.max(20, left);
    
    tooltip.style.cssText = `
      top: ${top}px;
      left: ${left}px;
      right: auto;
      bottom: auto;
    `;
  }
  
  function calculateSpotlightPadding(rect) {
    const minPadding = 8;
    const maxPadding = 20;
    
    const widthPadding = Math.max(minPadding, Math.min(maxPadding, rect.width * 0.1));
    const heightPadding = Math.max(minPadding, Math.min(maxPadding, rect.height * 0.1));
    
    return { x: widthPadding, y: heightPadding };
  }
  
  function showStep(stepIndex) {
    if (stepIndex >= tourSteps.length) {
      endTour();
      return;
    }
    
    const step = tourSteps[stepIndex];
    
    if (step.tab) {
      const tabBtn = document.querySelector(`[data-tab="${step.tab}"]`);
      if (tabBtn && !tabBtn.classList.contains('active')) {
        tabBtn.click();
      }
    }
    
    setTimeout(() => {
      const element = document.querySelector(step.element);
      if (!element) {
        console.warn(`Tour element not found: ${step.element}`);
        showStep(stepIndex + 1);
        return;
      }
      
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const spotlight = overlay.querySelector('.tour-spotlight');
        const tooltip = overlay.querySelector('.tour-tooltip');
        const content = overlay.querySelector('.tour-content');
        const currentSpan = overlay.querySelector('.tour-current');
        const nextBtn = overlay.querySelector('.tour-next');
        
        const padding = calculateSpotlightPadding(rect);
        
        spotlight.style.cssText = `
          top: ${rect.top - padding.y}px;
          left: ${rect.left - padding.x}px;
          width: ${rect.width + (padding.x * 2)}px;
          height: ${rect.height + (padding.y * 2)}px;
        `;
        
        content.textContent = step.text;
        currentSpan.textContent = stepIndex + 1;
        
        if (stepIndex === tourSteps.length - 1) {
          nextBtn.textContent = 'Finish';
        } else {
          nextBtn.textContent = 'Next';
        }
        
        positionTooltip(rect, tooltip);
        
        overlay.classList.add('active');
        
        spotlight.classList.add('pulse');
        setTimeout(() => spotlight.classList.remove('pulse'), 3000);
      }, 500);
    }, step.tab ? 300 : 0);
  }
  
  function endTour() {
    overlay.remove();
    document.body.style.overflow = '';
    localStorage.setItem('bingoTourCompleted', 'true');
    showToast('Tour complete! Ready to host! 🎉', 3000);
    document.removeEventListener('keydown', handleKeyboard);
  }
  
  function handleKeyboard(e) {
    if (e.key === 'Escape') {
      endTour();
    } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      currentStep++;
      showStep(currentStep);
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      e.preventDefault();
      currentStep--;
      showStep(currentStep);
    }
  }
  
  document.addEventListener('keydown', handleKeyboard);
  
  overlay.querySelector('.tour-next').addEventListener('click', () => {
    currentStep++;
    showStep(currentStep);
  });
  
  overlay.querySelector('.tour-skip').addEventListener('click', endTour);
  
  setTimeout(() => showStep(0), 1000);
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.code === 'Space' && isHost && STATE === 'HOSTGAME') {
      e.preventDefault();
      if (elems.btnRoll && !elems.btnRoll.disabled) {
        elems.btnRoll.click();
      }
    }
  });
}

function loadLastHandle() {
  const lastHandle = localStorage.getItem('lastHandle');
  if (lastHandle && elems.hostHandle) {
    elems.hostHandle.value = lastHandle.replace('@', '');
  }
}

function saveLastHandle(handle) {
  localStorage.setItem('lastHandle', handle.replace('@', ''));
}

window.addEventListener('beforeunload', (e) => {
  if (STATE === 'HOSTGAME' || STATE === 'PLAYERGAME') {
    e.preventDefault();
    e.returnValue = 'You have an active game. Are you sure you want to leave?';
    return e.returnValue;
  }
});

if (elems.hostPattern) {
  elems.hostPattern.addEventListener('change', () => {
    gameType = elems.hostPattern.value;
  });
}

if (elems.hostPatternChange) {
  elems.hostPatternChange.addEventListener('change', () => {
    if (isHost && gameRef && initialLoadComplete) {
      const newPattern = elems.hostPatternChange.value;
      if (!confirm(`Change pattern to ${GAME_PATTERNS[newPattern]?.name}? This will reset all current wins.`)) {
        elems.hostPatternChange.value = gameType;
        return;
      }
      gameType = newPattern;
      gameRef.child('gameType').set(gameType).catch(err => handleFirebaseError(err, 'pattern'));
      displayPattern(elems.hostPatternGrid, elems.hostPatternName);
      showToast(`Pattern changed to: ${GAME_PATTERNS[gameType].name}`, 3000);
    }
  });
}

if (elems.btnHostMode) {
  elems.btnHostMode.addEventListener('click', () => {
    showScreen('hostSetup');
    loadLastHandle();
  });
}

if (elems.btnPlayerMode) {
  elems.btnPlayerMode.addEventListener('click', () => {
    showScreen('playerSetup');
  });
}

if (elems.btnBackFromHost) {
  elems.btnBackFromHost.addEventListener('click', () => {
    showScreen('landing');
  });
}

if (elems.btnBackFromPlayer) {
  elems.btnBackFromPlayer.addEventListener('click', () => {
    showScreen('landing');
  });
}

if (elems.btnStartHost) {
  elems.btnStartHost.addEventListener('click', () => {
    const handleInput = elems.hostHandle.value.trim();
    const validation = validateHandle(handleInput);
    
    if (!validation.valid) {
      return showToast(`⚠️ ${validation.error}`, 3000);
    }
    
    const handle = normalizeHandle(handleInput);
    const pattern = elems.hostPattern.value;
    
    showLoading(true);
    
    auth.signInAnonymously().then(() => {
      isHost = true;
      hostHandle = handle;
      gameType = pattern;
      gameId = generateGameId();
      
      saveLastHandle(handle);
      
      calledNumbers.clear();
      playersData = [];
      winnersData = [];
      cardWins = [];
      initialLoadComplete = false;
      
      if (elems.displayGameId) elems.displayGameId.textContent = gameId;
      if (elems.hostLastCalled) elems.hostLastCalled.textContent = '--';
      
      gameRef = database.ref(`games/${gameId}`);
      gameRef.child('gameType').set(gameType);
      gameRef.child('host').set(hostHandle);
      gameRef.child('created').set(Date.now());
      
      if (elems.hostPatternChange) elems.hostPatternChange.value = gameType;
      
      setupFirebaseListeners();
      createBoard(elems.hostBoard);
      displayPattern(elems.hostPatternGrid, elems.hostPatternName);
      updateStats();
      updatePlayersList();
      
      setTimeout(() => {
        initialLoadComplete = true;
      }, 1000);
      
      showLoading(false);
      showScreen('hostGame');
      showToast(`🎮 Game ${gameId} started! Share the ID with players.`, 3500);
      
      startOnboardingTour();
    }).catch(err => {
      showLoading(false);
      handleFirebaseError(err, 'create');
    });
  });
}

if (elems.btnJoinGame) {
  elems.btnJoinGame.addEventListener('click', () => {
    const gidInput = elems.playerGameId.value.trim().toUpperCase();
    const handleInput = elems.playerHandle.value.trim();
    const cardsCount = parseInt(elems.playerCardsSelect.value) || 1;
    
    const gidValidation = validateGameId(gidInput);
    if (!gidValidation.valid) {
      return showToast(`⚠️ ${gidValidation.error}`, 3000);
    }
    
    const handleValidation = validateHandle(handleInput);
    if (!handleValidation.valid) {
      return showToast(`⚠️ ${handleValidation.error}`, 3000);
    }
    
    const gid = gidInput;
    const handle = normalizeHandle(handleInput);
    
    showLoading(true);
    
    auth.signInAnonymously()
      .then(() => {
        gameId = gid;
        playerHandle = handle;
        numCards = cardsCount;
        playerCards = [];
        cardWins = [];
        currentCardIndex = 0;
        
        for (let i = 0; i < numCards; i++) {
          playerCards.push(generateCard());
        }
        
        if (elems.playerNameDisplay) elems.playerNameDisplay.textContent = handle.replace('@', '');
        if (elems.playerLastCalled) elems.playerLastCalled.textContent = '--';
        
        gameRef = database.ref(`games/${gameId}`);
        
        const handleKey = handle.substring(1);
        const allCardIDs = playerCards.map(c => c.cardID);
        
        return gameRef.child('players').child(handleKey).set({
          handle: handle,
          cardID: playerCards[0].cardID,
          cardIDs: allCardIDs,
          numCards: numCards,
          joinedAt: Date.now()
        });
      })
      .then(() => {
        setupFirebaseListeners();
        displayPlayerCards();
        createBoard(elems.playerBoardView);
        displayPattern(elems.playerPatternGrid, elems.playerPatternName);
        updateStats();
        
        if (elems.infoGameId) elems.infoGameId.textContent = gameId;
        if (elems.infoPattern) elems.infoPattern.textContent = GAME_PATTERNS[gameType]?.name || 'Unknown';
        
        showLoading(false);
        showScreen('playerGame');
        showToast(`✅ Joined game ${gameId} as ${playerHandle}`, 3000);
      })
      .catch(err => {
        showLoading(false);
        handleFirebaseError(err, 'join');
      });
  });
}

if (elems.btnRoll) {
  elems.btnRoll.addEventListener('click', () => {
    if (!isHost || !gameRef) return showToast('You must be hosting a game', 3000);
    if (calledNumbers.size >= 75) return showToast('All numbers have been called!', 2000);
    
    const rolled = rollNumber();
    if (rolled) {
      if (elems.hostLastCalled) elems.hostLastCalled.textContent = rolled;
      createBoard(elems.hostBoard);
      updateStats();
    }
  });
}

if (elems.btnCopyId) {
  elems.btnCopyId.addEventListener('click', () => {
    if (!gameId) return showToast('No Game ID to copy', 2000);
    
    const url = `${window.location.origin}${window.location.pathname}?game=${gameId}`;
    navigator.clipboard.writeText(url)
      .then(() => showToast('✅ Game link copied to clipboard!', 2000))
      .catch(() => showToast('❌ Error copying', 2000));
  });
}

if (elems.btnHostShare || elems.btnPlayerShare) {
  const shareHandler = () => {
    if (!gameId) return showToast('No Game ID to share', 2000);
    
    const url = `${window.location.origin}${window.location.pathname}?game=${gameId}`;
    const text = `Join my $BINGO game! Game ID: ${gameId}`;
    
    if (navigator.share) {
      navigator.share({ title: '$BINGO Live', text: text, url: url })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url)
        .then(() => showToast('✅ Game link copied!', 2000))
        .catch(() => showToast('❌ Error sharing', 2000));
    }
  };
  
  if (elems.btnHostShare) elems.btnHostShare.addEventListener('click', shareHandler);
  if (elems.btnPlayerShare) elems.btnPlayerShare.addEventListener('click', shareHandler);
}

if (elems.btnPrevCard) {
  elems.btnPrevCard.addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateCardNavigation();
    }
  });
}

if (elems.btnNextCard) {
  elems.btnNextCard.addEventListener('click', () => {
    if (currentCardIndex < numCards - 1) {
      currentCardIndex++;
      updateCardNavigation();
    }
  });
}

if (elems.btnEndGame) {
  elems.btnEndGame.addEventListener('click', () => {
    if (!confirm('End game and show results? This cannot be undone.')) return;
    
    if (elems.endNumbers) elems.endNumbers.textContent = calledNumbers.size;
    if (elems.endWinners) elems.endWinners.textContent = winnersData.length;
    
    if (elems.winnersDisplay) {
      elems.winnersDisplay.innerHTML = '';
      if (winnersData.length === 0) {
        elems.winnersDisplay.innerHTML = '<div style="color:rgba(255,255,255,0.5)">No winners yet</div>';
      } else {
        winnersData.forEach(w => {
          const div = document.createElement('div');
          div.className = 'winner-entry';
          div.textContent = `🎉 ${w.handle} - Card ${w.cardID}`;
          elems.winnersDisplay.appendChild(div);
        });
      }
    }
    
    const prizeData = exportWinnersForPrizes();
    
    showScreen('gameEnd');
  });
}

if (elems.btnLeaveGame) {
  elems.btnLeaveGame.addEventListener('click', () => {
    if (!confirm('Leave this game? You cannot rejoin with the same cards.')) return;
    
    cleanupFirebaseListeners();
    if (gameRef && playerHandle) {
      const handleKey = playerHandle.substring(1);
      gameRef.child('players').child(handleKey).remove();
    }
    
    showScreen('landing');
    showToast('Left the game', 2000);
  });
}

if (elems.btnHostHome || elems.btnPlayerHome) {
  const homeHandler = () => {
    if (!confirm('Leave to home? The game will continue without you.')) return;
    cleanupFirebaseListeners();
    showScreen('landing');
  };
  
  if (elems.btnHostHome) elems.btnHostHome.addEventListener('click', homeHandler);
  if (elems.btnPlayerHome) elems.btnPlayerHome.addEventListener('click', homeHandler);
}

if (elems.btnPlayAgain) {
  elems.btnPlayAgain.addEventListener('click', () => {
    calledNumbers.clear();
    winnersData = [];
    cardWins = [];
    initialLoadComplete = false;
    
    if (gameRef) {
      gameRef.child('called').remove();
      gameRef.child('winners').remove();
    }
    
    if (isHost) {
      if (elems.hostLastCalled) elems.hostLastCalled.textContent = '--';
      if (elems.btnRoll) {
        elems.btnRoll.disabled = false;
        elems.btnRoll.textContent = '🎲 ROLL';
      }
      createBoard(elems.hostBoard);
      updateStats();
      setTimeout(() => {
        initialLoadComplete = true;
      }, 1000);
      showScreen('hostGame');
      showToast('🔄 New round started! Same players, same pattern.', 3000);
    } else {
      if (elems.playerLastCalled) elems.playerLastCalled.textContent = '--';
      displayPlayerCards();
      createBoard(elems.playerBoardView);
      updateStats();
      setTimeout(() => {
        initialLoadComplete = true;
      }, 1000);
      showScreen('playerGame');
      showToast('🔄 New round started!', 3000);
    }
    
    setupFirebaseListeners();
  });
}

if (elems.btnNewGame) {
  elems.btnNewGame.addEventListener('click', () => {
    cleanupFirebaseListeners();
    if (gameRef) {
      gameRef.remove();
    }
    
    isHost = false;
    gameId = null;
    hostHandle = null;
    playerHandle = null;
    playerCards = [];
    cardWins = [];
    calledNumbers.clear();
    playersData = [];
    winnersData = [];
    gameRef = null;
    
    showScreen('landing');
    showToast('Ready for a new game!', 2000);
  });
}

if (elems.btnGoHome) {
  elems.btnGoHome.addEventListener('click', () => {
    cleanupFirebaseListeners();
    showScreen('landing');
  });
}

setupTabNavigation();
setupKeyboardShortcuts();
handleURLParams();
setupConnectionMonitoring();

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('✅ Firebase authenticated');
  } else {
    console.log('⚠️ Not authenticated');
  }
});

console.log('%c$BINGO Live v10.0 - Production Ready 🚀', 'color: #00FF00; font-size: 20px; font-weight: bold;');
console.log('Firebase Project:', firebaseConfig.projectId);
console.log('Export winners: Call exportWinnersForPrizes() in console');
console.log('Reset tour: Call window.resetTour() in console');

window.exportWinnersForPrizes = exportWinnersForPrizes;
window.resetTour = () => {
  localStorage.removeItem('bingoTourCompleted');
  showToast('Tour reset! Start hosting to see it again.', 2000);
};
