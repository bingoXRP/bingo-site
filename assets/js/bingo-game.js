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
let sessionId = null;
let hostHandle = null;
let playerHandle = null;
let playerCards = [];
let currentCardIndex = 0;
let numCards = 1;
let gameType = 'singleLine';
let calledNumbers = new Set();
let gameRef = null;
let sessionRef = null;
let playersData = [];
let winnersData = [];
let cardWins = [];
let initialLoadComplete = false;
let isConnected = true;
let connectionRef = null;
let walletMaxCards = 1;

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
  btnExportCSV: document.getElementById('btn-export-csv'),
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

if (typeof SessionManager !== 'undefined') {
  SessionManager.init(firebase.database());
}

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get('mode'),
    session: params.get('session'),
    game: params.get('game'),
    cards: params.get('cards') ? parseInt(params.get('cards'), 10) : null
  };
}

function updateURL(mode, session, cards) {
  const params = new URLSearchParams();
  if (mode) params.set('mode', mode);
  if (session) params.set('session', session);
  if (cards && cards > 1) params.set('cards', String(cards));
  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newURL);
}

function initWalletUI() {
  const container = document.getElementById('wallet-container');
  if (!container) return;

  function renderWalletButton() {
    if (typeof XRPLWallet === 'undefined') {
      container.innerHTML = '';
      return;
    }

    if (XRPLWallet.isConnected()) {
      const state = XRPLWallet.getState();
      container.innerHTML = `
        <div class="wallet-status">
          <div class="wallet-address">${XRPLWallet.formatAddress(state.address)}</div>
          <div class="wallet-info">
            ${state.nftCount > 0 ? `<span class="wallet-badge nft">🎨 ${state.nftCount} NFT${state.nftCount !== 1 ? 's' : ''}</span>` : ''}
            ${state.hasToken ? '<span class="wallet-badge">💎 $BINGO</span>' : ''}
            <span class="wallet-badge">${state.maxCards} Card${state.maxCards !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button class="wallet-disconnect-btn" id="disconnect-wallet">Disconnect</button>
      `;
      walletMaxCards = state.maxCards;
      const disconnectBtn = document.getElementById('disconnect-wallet');
      if (disconnectBtn) {
        disconnectBtn.addEventListener('click', () => {
          XRPLWallet.disconnect();
          walletMaxCards = 1;
          renderWalletButton();
          updatePlayerCardOptions();
        });
      }
    } else {
      container.innerHTML = `
        <button class="wallet-connect-btn" id="connect-wallet">
          <span class="icon">🔗</span>
          <span class="wallet-text">Connect Wallet</span>
        </button>
      `;
      const connectBtn = document.getElementById('connect-wallet');
      if (connectBtn) {
        connectBtn.addEventListener('click', showWalletSelector);
      }
    }
  }

  renderWalletButton();
  
  if (typeof XRPLWallet !== 'undefined') {
    XRPLWallet.reconnect().then(connected => {
      if (connected) {
        renderWalletButton();
        updatePlayerCardOptions();
      }
    });
  }
}

function updatePlayerCardOptions() {
  if (!elems.playerCardsSelect) return;
  
  const maxCards = walletMaxCards;
  elems.playerCardsSelect.innerHTML = '';
  
  for (let i = 1; i <= maxCards; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i + (i === 1 ? ' Card' : ' Cards');
    elems.playerCardsSelect.appendChild(option);
  }
}

function showWalletSelector() {
  if (typeof XRPLWallet === 'undefined') {
    showToast('Wallet module not loaded', 3000);
    return;
  }

  const modal = document.getElementById('wallet-selector-modal');
  const optionsContainer = document.getElementById('wallet-options');
  
  if (!modal || !optionsContainer) return;
  
  const available = XRPLWallet.getAvailableWallets();
  const wallets = ['xumm', 'gem', 'crossmark', 'joey'];
  
  optionsContainer.innerHTML = wallets.map(wallet => {
    const isAvailable = available.includes(wallet);
    const names = {xumm: 'Xumm', gem: 'Gem Wallet', crossmark: 'Crossmark', joey: 'Joey'};
    const icons = {xumm: '💳', gem: '💎', crossmark: '✖️', joey: '🦘'};
    return `
      <div class="wallet-option ${!isAvailable ? 'disabled' : ''}" data-wallet="${wallet}">
        <div class="wallet-option-icon">${icons[wallet]}</div>
        <div class="wallet-option-info">
          <h3 class="wallet-option-name">${names[wallet]}</h3>
          <p class="wallet-option-status">${isAvailable ? 'Click to connect' : 'Not installed'}</p>
        </div>
      </div>
    `;
  }).join('');
  
  modal.classList.add('show');
  
  document.querySelectorAll('.wallet-option:not(.disabled)').forEach(opt => {
    opt.addEventListener('click', async () => {
      const wallet = opt.dataset.wallet;
      try {
        await XRPLWallet.connect(wallet);
        modal.classList.remove('show');
        initWalletUI();
        updatePlayerCardOptions();
        showToast(`✅ Connected to ${opt.querySelector('.wallet-option-name').textContent}`, 3000);
      } catch (error) {
        showToast(`❌ ${error.message}`, 5000);
      }
    });
  });
  
  const closeBtn = document.getElementById('close-wallet-selector');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }
}

function showPlayerRejoinModal(gameNumber, hostName) {
  const modal = document.getElementById('player-rejoin-modal');
  const message = document.getElementById('rejoin-message');
  const details = document.getElementById('rejoin-details');
  const timer = document.getElementById('rejoin-timer');
  
  if (!modal || !message || !details || !timer) return;
  
  message.textContent = `${hostName} has started Game #${gameNumber}`;
  details.textContent = 'Same cards, fresh board';
  
  let countdown = 10;
  timer.textContent = `Auto-joining in ${countdown}s...`;
  
  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      timer.textContent = `Auto-joining in ${countdown}s...`;
    } else {
      clearInterval(interval);
      joinNewGame();
    }
  }, 1000);
  
  modal.classList.add('show');
  
  const joinBtn = document.getElementById('rejoin-join');
  const leaveBtn = document.getElementById('rejoin-leave');
  
  if (joinBtn) {
    joinBtn.onclick = () => {
      clearInterval(interval);
      joinNewGame();
    };
  }
  
  if (leaveBtn) {
    leaveBtn.onclick = () => {
      clearInterval(interval);
      modal.classList.remove('show');
      cleanupFirebaseListeners();
      showScreen('landing');
    };
  }
  
  function joinNewGame() {
    modal.classList.remove('show');
    calledNumbers.clear();
    cardWins = [];
    displayPlayerCards();
    createBoard(elems.playerBoardView);
    updateStats();
  }
}

function exportSessionCSV() {
  if (typeof SessionManager === 'undefined' || typeof CSVExport === 'undefined') {
    showToast('Export modules not loaded', 3000);
    return;
  }

  const stats = SessionManager.getSessionStats();
  if (!stats) {
    showToast('No session data to export', 3000);
    return;
  }

  CSVExport.exportSession(stats, 'comprehensive');
  showToast('✅ CSV exported successfully!', 3000);
}

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
    
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * available.length);
      nums.push(available.splice(idx, 1)[0]);
    }
    
    card[letter] = nums;
  });
  
  card.cardID = cardID;
  return card;
}

function checkSingleLine(card) {
  const rows = [0,1,2,3,4];
  for (const rowIdx of rows) {
    let allMarked = true;
    for (const letter of LETTERS) {
      const num = card[letter][rowIdx];
      const called = `${letter}-${num}`;
      if (!calledNumbers.has(called)) {
        allMarked = false;
        break;
      }
    }
    if (allMarked) return true;
  }
  
  for (const letter of LETTERS) {
    let colMarked = true;
    for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
      const num = card[letter][rowIdx];
      const called = `${letter}-${num}`;
      if (!calledNumbers.has(called)) {
        colMarked = false;
        break;
      }
    }
    if (colMarked) return true;
  }
  
  return false;
}

function checkDoubleLine(card) {
  let rowsComplete = 0;
  const rows = [0,1,2,3,4];
  for (const rowIdx of rows) {
    let allMarked = true;
    for (const letter of LETTERS) {
      const num = card[letter][rowIdx];
      const called = `${letter}-${num}`;
      if (!calledNumbers.has(called)) {
        allMarked = false;
        break;
      }
    }
    if (allMarked) rowsComplete++;
  }
  
  if (rowsComplete >= 2) return true;
  
  let colsComplete = 0;
  for (const letter of LETTERS) {
    let colMarked = true;
    for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
      const num = card[letter][rowIdx];
      const called = `${letter}-${num}`;
      if (!calledNumbers.has(called)) {
        colMarked = false;
        break;
      }
    }
    if (colMarked) colsComplete++;
  }
  
  if (colsComplete >= 2) return true;
  
  if (rowsComplete >= 1 && colsComplete >= 1) return true;
  
  return false;
}

function checkPattern(card, patternDef) {
  if (!patternDef || !patternDef.pattern) return false;
  
  const pattern = patternDef.pattern;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (pattern[row][col] === 1) {
        const letter = LETTERS[col];
        const num = card[letter][row];
        const called = `${letter}-${num}`;
        if (!calledNumbers.has(called)) {
          return false;
        }
      }
    }
  }
  
  return true;
}

function checkWinForCard(card) {
  const patternDef = GAME_PATTERNS[gameType];
  if (!patternDef) return false;
  
  if (patternDef.checkFunction === 'checkSingleLine') {
    return checkSingleLine(card);
  } else if (patternDef.checkFunction === 'checkDoubleLine') {
    return checkDoubleLine(card);
  } else {
    return checkPattern(card, patternDef);
  }
}

function createBoard(container) {
  if (!container) return;
  container.innerHTML = '';
  
  const table = document.createElement('table');
  table.className = 'bingo-board';
  
  const headerRow = document.createElement('tr');
  LETTERS.forEach(letter => {
    const th = document.createElement('th');
    th.textContent = letter;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  
  for (let num = 1; num <= 15; num++) {
    const row = document.createElement('tr');
    LETTERS.forEach(letter => {
      const [min, max] = RANGES[letter];
      const cellNum = min + (num - 1);
      
      if (cellNum <= max) {
        const td = document.createElement('td');
        td.className = 'board-cell';
        td.textContent = cellNum;
        td.dataset.letter = letter;
        td.dataset.number = cellNum;
        
        const calledKey = `${letter}-${cellNum}`;
        if (calledNumbers.has(calledKey)) {
          td.classList.add('called');
        }
        
        row.appendChild(td);
      } else {
        const td = document.createElement('td');
        td.className = 'board-cell empty';
        row.appendChild(td);
      }
    });
    table.appendChild(row);
  }
  
  container.appendChild(table);
}

function displayPattern(gridEl, nameEl) {
  if (!gridEl) return;
  
  const patternDef = GAME_PATTERNS[gameType];
  if (!patternDef) return;
  
  gridEl.innerHTML = '';
  const pattern = patternDef.pattern;
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.className = 'pattern-cell';
      if (pattern[row][col] === 1) {
        cell.classList.add('active');
      }
      gridEl.appendChild(cell);
    }
  }
  
  if (nameEl) {
    nameEl.textContent = patternDef.name;
  }
}

function rollNumber() {
  if (calledNumbers.size >= 75) return null;
  
  const available = [];
  LETTERS.forEach(letter => {
    const [min, max] = RANGES[letter];
    for (let num = min; num <= max; num++) {
      const key = `${letter}-${num}`;
      if (!calledNumbers.has(key)) {
        available.push(key);
      }
    }
  });
  
  if (available.length === 0) return null;
  
  const idx = Math.floor(Math.random() * available.length);
  const rolled = available[idx];
  
  if (!gameRef) return null;
  
  gameRef.child('called').push().set({
    value: rolled,
    timestamp: Date.now()
  }).then(() => {
    if (typeof SessionManager !== 'undefined' && SessionManager.getCurrentGame()) {
      const [letter, num] = rolled.split('-');
      SessionManager.addCalledNumber(parseInt(num, 10));
    }
  }).catch(err => {
    console.error('Error rolling number:', err);
  });
  
  return rolled;
}

function updateStats() {
  if (elems.statCalled) elems.statCalled.textContent = calledNumbers.size;
  if (elems.statRemaining) elems.statRemaining.textContent = 75 - calledNumbers.size;
  if (elems.infoCalled) elems.infoCalled.textContent = calledNumbers.size;
  if (elems.statPlayers) elems.statPlayers.textContent = playersData.length;
  if (elems.infoPlayers) elems.infoPlayers.textContent = playersData.length;
  if (elems.statWinners) elems.statWinners.textContent = winnersData.length;
}

function displayPlayerList(listElement) {
  if (!listElement) return;
  listElement.innerHTML = '';
  
  const sortedPlayers = [...playersData].sort((a, b) => {
    const aIsHost = a.handle === hostHandle || (gameRef && a.handle === hostHandle);
    const bIsHost = b.handle === hostHandle || (gameRef && b.handle === hostHandle);
    
    if (aIsHost && !bIsHost) return -1;
    if (!aIsHost && bIsHost) return 1;
    return a.handle.localeCompare(b.handle);
  });
  
  sortedPlayers.forEach(p => {
    const div = document.createElement('div');
    const isWinner = winnersData.some(w => w.handle === p.handle);
    const isHostPlayer = p.handle === hostHandle;
    
    div.className = 'player-item';
    if (isWinner) div.classList.add('winner');
    if (isHostPlayer) div.classList.add('host-player');
    
    const cardInfo = p.cardIDs && p.cardIDs.length > 1 
      ? `${p.cardIDs.length} cards` 
      : `#${p.cardIDs ? p.cardIDs[0] : p.cardID || 'N/A'}`;
    
    const hostBadge = isHostPlayer ? '👑 ' : '';
    const winnerBadge = isWinner ? '🏆 ' : '';
    
    div.innerHTML = `<div>${hostBadge}${winnerBadge}${p.handle}</div><div class="cardid">${cardInfo}</div>`;
    listElement.appendChild(div);
  });
  
  if (elems.statPlayers) elems.statPlayers.textContent = playersData.length;
  if (elems.infoPlayers) elems.infoPlayers.textContent = playersData.length;
}

function updatePlayersList() {
  if (isHost && elems.hostPlayersList) {
    displayPlayerList(elems.hostPlayersList);
  }
  if (!isHost && elems.playerPlayersList) {
    displayPlayerList(elems.playerPlayersList);
  }
}

function displayPlayerCards() {
  if (!elems.playerCardsContainer) return;
  elems.playerCardsContainer.innerHTML = '';
  
  if (playerCards.length === 0) return;
  
  const currentCard = playerCards[currentCardIndex];
  if (!currentCard) return;
  
  const cardDiv = document.createElement('div');
  cardDiv.className = 'player-card';
  
  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header';
  cardHeader.innerHTML = `<span class="card-id">Card ${currentCard.cardID}</span>`;
  cardDiv.appendChild(cardHeader);
  
  const table = document.createElement('table');
  table.className = 'bingo-card';
  
  const headerRow = document.createElement('tr');
  LETTERS.forEach(letter => {
    const th = document.createElement('th');
    th.textContent = letter;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  
  for (let row = 0; row < 5; row++) {
    const tr = document.createElement('tr');
    LETTERS.forEach(letter => {
      const td = document.createElement('td');
      td.className = 'cell';
      
      const num = currentCard[letter][row];
      td.textContent = num;
      td.dataset.letter = letter;
      td.dataset.number = num;
      
      const calledKey = `${letter}-${num}`;
      if (calledNumbers.has(calledKey)) {
        td.classList.add('called');
      }
      
      tr.appendChild(td);
    });
    table.appendChild(tr);
  }
  
  cardDiv.appendChild(table);
  elems.playerCardsContainer.appendChild(cardDiv);
  
  updateCardNavigation();
  checkAllCardsForWin();
}

function updateCardNavigation() {
  if (!elems.cardsNav || numCards <= 1) {
    if (elems.cardsNav) elems.cardsNav.style.display = 'none';
    return;
  }
  
  elems.cardsNav.style.display = 'flex';
  
  if (elems.cardPosition) {
    elems.cardPosition.textContent = `Card ${currentCardIndex + 1} of ${numCards}`;
  }
  
  if (elems.btnPrevCard) {
    elems.btnPrevCard.disabled = currentCardIndex === 0;
  }
  
  if (elems.btnNextCard) {
    elems.btnNextCard.disabled = currentCardIndex === numCards - 1;
  }
  
  if (elems.cardsIndicator) {
    elems.cardsIndicator.innerHTML = '';
    for (let i = 0; i < numCards; i++) {
      const dot = document.createElement('span');
      dot.className = 'card-dot';
      if (i === currentCardIndex) dot.classList.add('active');
      if (cardWins[i]) dot.classList.add('winner');
      elems.cardsIndicator.appendChild(dot);
    }
  }
}

function checkAllCardsForWin() {
  if (!isHost && playerCards.length > 0 && calledNumbers.size > 0) {
    playerCards.forEach((card, idx) => {
      if (!cardWins[idx] && checkWinForCard(card)) {
        cardWins[idx] = true;
        reportWin(card);
      }
    });
    updateCardNavigation();
  }
}

function reportWin(card) {
  if (!gameRef || !playerHandle) return;
  
  const winnerData = {
    handle: playerHandle,
    cardID: card.cardID,
    wonAt: Date.now(),
    numbersToWin: calledNumbers.size
  };
  
  gameRef.child('winners').push().set(winnerData).then(() => {
    if (typeof SessionManager !== 'undefined' && SessionManager.getCurrentGame()) {
      SessionManager.addWinner(winnerData);
    }
    showToast(`🎉 BINGO! Card ${card.cardID} wins!`, 5000);
  }).catch(err => {
    console.error('Error reporting win:', err);
  });
}

function exportWinnersForPrizes() {
  const prizeData = winnersData.map(w => ({
    handle: w.handle,
    cardID: w.cardID,
    timestamp: new Date(w.wonAt).toISOString(),
    numbersToWin: w.numbersToWin || calledNumbers.size
  }));
  
  console.log('🎁 Winners for prize distribution:');
  console.table(prizeData);
  return prizeData;
}

function setupConnectionMonitoring() {
  if (!firebase || !firebase.database) return;
  
  connectionRef = firebase.database().ref('.info/connected');
  connectionRef.on('value', (snap) => {
    const connected = snap.val() === true;
    isConnected = connected;
    
    if (elems.connectionStatus) {
      if (connected) {
        elems.connectionStatus.textContent = '🟢 Connected';
        elems.connectionStatus.classList.remove('disconnected');
      } else {
        elems.connectionStatus.textContent = '🔴 Connection lost. Reconnecting...';
        elems.connectionStatus.classList.add('disconnected');
      }
    }
  });
}

function setupFirebaseListeners() {
  if (!gameRef) return;
  
  gameRef.child('called').on('child_added', snap => {
    const data = snap.val();
    if (data && data.value && isValidCalledFormat(data.value)) {
      const wasNew = !calledNumbers.has(data.value);
      if (wasNew) {
        calledNumbers.add(data.value);
        
        const [letter, numStr] = data.value.split('-');
        const number = parseInt(numStr, 10);
        
        if (!initialLoadComplete) {
          if (isHost && elems.btnRoll) {
            elems.btnRoll.disabled = false;
            elems.btnRoll.textContent = '🎲 ROLL';
          }
        }
        
        if (initialLoadComplete) {
          if (isHost && elems.hostLastCalled) {
            elems.hostLastCalled.textContent = data.value;
          }
          if (!isHost && elems.playerLastCalled) {
            elems.playerLastCalled.textContent = data.value;
          }
        }
        
        if (isHost && elems.hostBoard) {
          createBoard(elems.hostBoard);
        }
        if (!isHost && elems.playerBoardView) {
          createBoard(elems.playerBoardView);
        }
        
        if (!isHost) {
          displayPlayerCards();
        }
        
        updateStats();
      }
    }
  });
  
  gameRef.child('players').on('value', snap => {
    playersData = [];
    snap.forEach(childSnap => {
      const pData = childSnap.val();
      if (pData && pData.handle) {
        playersData.push(pData);
      }
    });
    updatePlayersList();
    updateStats();
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
  
  if (isHost) {
    gameRef.child('winners').on('child_added', (snapshot) => {
      if (STATE === 'HOSTSETUP') return;
      
      const winner = snapshot.val();
      if (winner && winner.handle) {
        showToast(`🎉 ${winner.handle} wins with Card ${winner.cardID}!`, 5000);
      }
    });
  }
}

function cleanupFirebaseListeners() {
  if (gameRef) {
    gameRef.child('called').off();
    gameRef.child('players').off();
    gameRef.child('winners').off();
  }
  
  if (connectionRef) {
    connectionRef.off();
    connectionRef = null;
  }
}

function handleFirebaseError(error, context) {
  console.error(`Firebase error (${context}):`, error);
  
  if (error.code === 'PERMISSION_DENIED') {
    showToast('⚠️ Database permission denied. Check Firebase rules.', 5000);
  } else if (error.code === 'NETWORK_ERROR') {
    showToast('⚠️ Network error. Check your connection.', 5000);
  } else {
    showToast(`⚠️ Error: ${error.message}`, 5000);
  }
}

function setupTabNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
    
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    if (STATE === 'HOSTGAME' && isHost) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (elems.btnRoll && !elems.btnRoll.disabled) {
          elems.btnRoll.click();
        }
      }
    }
    
    if (STATE === 'PLAYERGAME' && !isHost && numCards > 1) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentCardIndex > 0) {
          currentCardIndex--;
          displayPlayerCards();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentCardIndex < numCards - 1) {
          currentCardIndex++;
          displayPlayerCards();
        }
      }
    }
  });
}

function handleURLParams() {
  const params = parseURLParams();
  
  if (params.game) {
    if (elems.playerGameId) {
      elems.playerGameId.value = params.game.toUpperCase();
    }
  }
  
  if (params.session) {
    sessionId = params.session;
  }
  
  if (params.cards && params.cards >= 1 && params.cards <= 3) {
    numCards = params.cards;
    if (elems.playerCardsSelect) {
      elems.playerCardsSelect.value = params.cards;
    }
  }
}

if (elems.btnHostMode) {
  elems.btnHostMode.addEventListener('click', () => {
    showScreen('hostSetup');
    if (elems.hostHandle) elems.hostHandle.value = '';
    if (elems.hostPattern) elems.hostPattern.value = 'singleLine';
  });
}

if (elems.btnPlayerMode) {
  elems.btnPlayerMode.addEventListener('click', () => {
    showScreen('playerSetup');
    if (elems.playerGameId) elems.playerGameId.value = '';
    if (elems.playerHandle) elems.playerHandle.value = '';
    updatePlayerCardOptions();
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
    const handle = normalizeHandle(elems.hostHandle?.value || '');
    const pattern = elems.hostPattern?.value || 'singleLine';
    
    const validation = validateHandle(handle);
    if (!validation.valid) {
      return showToast(validation.error, 3000);
    }
    
    showLoading(true);
    
    isHost = true;
    hostHandle = handle;
    gameType = pattern;
    gameId = generateGameId();
    calledNumbers.clear();
    winnersData = [];
    playersData = [];
    cardWins = [];
    
    if (typeof SessionManager !== 'undefined') {
      const session = SessionManager.createSession(hostHandle);
      sessionId = session.sessionID;
      SessionManager.createGame(gameType);
      updateURL('host', sessionId, null);
    } else {
      updateURL('host', gameId, null);
    }
    
    firebase.auth().signInAnonymously()
      .then(() => {
        gameRef = firebase.database().ref('games/' + gameId);
        return gameRef.set({
          host: hostHandle,
          pattern: gameType,
          created: Date.now(),
          sessionId: sessionId || null
        });
      })
      .then(() => {
        setupFirebaseListeners();
        
        if (elems.displayGameId) elems.displayGameId.textContent = gameId;
        if (elems.hostLastCalled) elems.hostLastCalled.textContent = '--';
        
        createBoard(elems.hostBoard);
        displayPattern(elems.hostPatternGrid, elems.hostPatternName);
        updateStats();
        
        initialLoadComplete = false;
        setTimeout(() => {
          initialLoadComplete = true;
        }, 1000);
        
        showLoading(false);
        showScreen('hostGame');
        showToast(`✅ Game ${gameId} created!`, 3000);
      })
      .catch(err => {
        showLoading(false);
        handleFirebaseError(err, 'host-start');
      });
  });
}

if (elems.hostPatternChange) {
  elems.hostPatternChange.addEventListener('change', (e) => {
    const newPattern = e.target.value;
    gameType = newPattern;
    
    if (gameRef) {
      gameRef.update({ pattern: newPattern }).then(() => {
        if (typeof SessionManager !== 'undefined') {
          SessionManager.changePattern(newPattern, true);
        }
        displayPattern(elems.hostPatternGrid, elems.hostPatternName);
        showToast(`Pattern changed to ${GAME_PATTERNS[newPattern]?.name}`, 3000);
      }).catch(err => {
        console.error('Error updating pattern:', err);
      });
    }
  });
}

if (elems.btnJoinGame) {
  elems.btnJoinGame.addEventListener('click', () => {
    const gId = (elems.playerGameId?.value || '').trim().toUpperCase();
    const handle = normalizeHandle(elems.playerHandle?.value || '');
    const cards = parseInt(elems.playerCardsSelect?.value || '1', 10);
    
    const gameValidation = validateGameId(gId);
    if (!gameValidation.valid) {
      return showToast(gameValidation.error, 3000);
    }
    
    const handleValidation = validateHandle(handle);
    if (!handleValidation.valid) {
      return showToast(handleValidation.error, 3000);
    }
    
    if (cards < 1 || cards > walletMaxCards) {
      return showToast(`You can play ${walletMaxCards} card${walletMaxCards !== 1 ? 's' : ''} max`, 3000);
    }
    
    showLoading(true);
    
    isHost = false;
    gameId = gId;
    playerHandle = handle;
    numCards = cards;
    calledNumbers.clear();
    cardWins = [];
    currentCardIndex = 0;
    
    playerCards = [];
    for (let i = 0; i < numCards; i++) {
      playerCards.push(generateCard());
    }
    
    updateURL('player', gameId, numCards);
    
    firebase.auth().signInAnonymously()
      .then(() => {
        gameRef = firebase.database().ref('games/' + gameId);
        return gameRef.once('value');
      })
      .then(snap => {
        if (!snap.exists()) {
          throw new Error('Game not found');
        }
        
        const gameData = snap.val();
        gameType = gameData.pattern || 'singleLine';
        hostHandle = gameData.host || '';
        
        const allCardIDs = playerCards.map(c => c.cardID);
        const handleKey = handle.substring(1);
        
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
        if (elems.playerNameDisplay) elems.playerNameDisplay.textContent = playerHandle;
        
        initialLoadComplete = false;
        setTimeout(() => {
          initialLoadComplete = true;
        }, 1000);
        
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
    
    const url = sessionId 
      ? `${window.location.origin}${window.location.pathname}?mode=player&session=${sessionId}`
      : `${window.location.origin}${window.location.pathname}?game=${gameId}`;
    
    navigator.clipboard.writeText(url)
      .then(() => showToast('✅ Game link copied to clipboard!', 2000))
      .catch(() => showToast('❌ Error copying', 2000));
  });
}

if (elems.btnHostShare || elems.btnPlayerShare) {
  const shareHandler = () => {
    if (!gameId) return showToast('No Game ID to share', 2000);
    
    const url = sessionId 
      ? `${window.location.origin}${window.location.pathname}?mode=player&session=${sessionId}`
      : `${window.location.origin}${window.location.pathname}?game=${gameId}`;
    
    const text = sessionId 
      ? `Join my $BINGO session! Session ID: ${sessionId}`
      : `Join my $BINGO game! Game ID: ${gameId}`;
    
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
      displayPlayerCards();
    }
  });
}

if (elems.btnNextCard) {
  elems.btnNextCard.addEventListener('click', () => {
    if (currentCardIndex < numCards - 1) {
      currentCardIndex++;
      displayPlayerCards();
    }
  });
}

if (elems.btnEndGame) {
  elems.btnEndGame.addEventListener('click', () => {
    if (!confirm('End game and show results? This cannot be undone.')) return;
    
    if (typeof SessionManager !== 'undefined') {
      SessionManager.endGame();
    }
    
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
    
    exportWinnersForPrizes();
    showScreen('gameEnd');
  });
}

if (elems.btnExportCSV) {
  elems.btnExportCSV.addEventListener('click', () => {
    exportSessionCSV();
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
    
    if (typeof SessionManager !== 'undefined') {
      const gameNumber = (SessionManager.getCurrentSession()?.games?.length || 0) + 1;
      SessionManager.createGame(gameType);
      
      if (!isHost) {
        showPlayerRejoinModal(gameNumber, hostHandle);
        return;
      }
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
    
    if (typeof SessionManager !== 'undefined') {
      SessionManager.endSession();
    }
    
    if (gameRef) {
      gameRef.remove();
    }
    
    isHost = false;
    gameId = null;
    sessionId = null;
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
initWalletUI();

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('✅ Firebase authenticated');
    setTimeout(() => {
      setupConnectionMonitoring();
    }, 2000);
  } else {
    console.log('⚠️ Not authenticated');
  }
});

console.log('%c$BINGO Live v12.0 Phase 2 - Complete Integration 🚀', 'color: #00FF00; font-size: 20px; font-weight: bold;');
console.log('Firebase Project:', firebaseConfig.projectId);
console.log('XRPL Wallet:', typeof XRPLWallet !== 'undefined' ? 'Loaded ✓' : 'Not loaded');
console.log('Session Manager:', typeof SessionManager !== 'undefined' ? 'Loaded ✓' : 'Not loaded');
console.log('CSV Export:', typeof CSVExport !== 'undefined' ? 'Loaded ✓' : 'Not loaded');

window.exportWinnersForPrizes = exportWinnersForPrizes;
window.exportSessionCSV = exportSessionCSV;
window.resetTour = () => {
  localStorage.removeItem('bingoTourCompleted');
  showToast('Tour reset! Start hosting to see it again.', 2000);
};
