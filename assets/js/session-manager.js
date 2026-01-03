const SessionManager = (function() {
  let currentSession = null;
  let currentGame = null;
  let database = null;

  function init(firebaseDb) {
    database = firebaseDb;
  }

  function generateSessionID() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  function generateGameID() {
    return `g${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function createSession(hostHandle) {
    const sessionID = generateSessionID();
    const session = {
      sessionID,
      host: hostHandle,
      created: Date.now(),
      status: 'active',
      games: []
    };

    currentSession = session;

    if (database) {
      database.ref(`sessions/${sessionID}`).set({
        host: hostHandle,
        created: session.created,
        status: 'active'
      });
    }

    return session;
  }

  function createGame(pattern) {
    if (!currentSession) throw new Error('No active session');

    const gameID = generateGameID();
    const gameNumber = currentSession.games.length + 1;

    const game = {
      gameID,
      gameNumber,
      sessionID: currentSession.sessionID,
      pattern,
      startedAt: Date.now(),
      endedAt: null,
      calledNumbers: [],
      patterns: [{
        pattern,
        startedAt: Date.now(),
        endedAt: null,
        winners: []
      }],
      players: {},
      winners: []
    };

    currentSession.games.push(game);
    currentGame = game;

    if (database) {
      database.ref(`sessions/${currentSession.sessionID}/games/${gameID}`).set({
        gameNumber,
        pattern,
        startedAt: game.startedAt,
        status: 'active'
      });
    }

    return game;
  }

  function changePattern(newPattern, keepNumbers) {
    if (!currentGame) throw new Error('No active game');

    const currentPatternIndex = currentGame.patterns.length - 1;
    if (currentPatternIndex >= 0) {
      currentGame.patterns[currentPatternIndex].endedAt = Date.now();
    }

    const newPatternData = {
      pattern: newPattern,
      startedAt: Date.now(),
      endedAt: null,
      numbersWhenStarted: currentGame.calledNumbers.length,
      winners: []
    };

    if (!keepNumbers) {
      currentGame.calledNumbers = [];
    }

    currentGame.patterns.push(newPatternData);
    currentGame.pattern = newPattern;

    if (database) {
      database.ref(`sessions/${currentSession.sessionID}/games/${currentGame.gameID}`).update({
        pattern: newPattern,
        patternChangedAt: Date.now()
      });
    }

    return newPatternData;
  }

  function addWinner(winnerData) {
    if (!currentGame) throw new Error('No active game');

    const currentPatternIndex = currentGame.patterns.length - 1;
    const winner = {
      ...winnerData,
      gameNumber: currentGame.gameNumber,
      pattern: currentGame.pattern,
      wonAt: Date.now(),
      numbersToWin: currentGame.calledNumbers.length
    };

    currentGame.patterns[currentPatternIndex].winners.push(winner);
    currentGame.winners.push(winner);

    if (database) {
      const winnerRef = database.ref(`sessions/${currentSession.sessionID}/games/${currentGame.gameID}/winners`).push();
      winnerRef.set(winner);
    }

    return winner;
  }

  function addCalledNumber(number) {
    if (!currentGame) throw new Error('No active game');
    if (!currentGame.calledNumbers.includes(number)) {
      currentGame.calledNumbers.push(number);
    }
  }

  function endGame() {
    if (!currentGame) return;

    currentGame.endedAt = Date.now();
    const currentPatternIndex = currentGame.patterns.length - 1;
    if (currentPatternIndex >= 0) {
      currentGame.patterns[currentPatternIndex].endedAt = Date.now();
    }

    if (database) {
      database.ref(`sessions/${currentSession.sessionID}/games/${currentGame.gameID}`).update({
        endedAt: currentGame.endedAt,
        status: 'completed'
      });
    }
  }

  function endSession() {
    if (!currentSession) return;

    endGame();
    currentSession.status = 'completed';

    if (database) {
      database.ref(`sessions/${currentSession.sessionID}`).update({
        status: 'completed',
        endedAt: Date.now()
      });
    }

    return currentSession;
  }

  function getSessionStats() {
    if (!currentSession) return null;

    const totalGames = currentSession.games.length;
    const allWinners = [];
    const uniquePlayers = new Set();
    const patternsPlayed = new Set();

    currentSession.games.forEach(game => {
      game.winners.forEach(winner => {
        allWinners.push(winner);
        uniquePlayers.add(winner.handle);
      });
      game.patterns.forEach(p => patternsPlayed.add(p.pattern));
    });

    const duration = currentSession.games.length > 0
      ? Date.now() - currentSession.created
      : 0;

    return {
      sessionID: currentSession.sessionID,
      host: currentSession.host,
      totalGames,
      totalPlayers: uniquePlayers.size,
      totalWinners: allWinners.length,
      patternsPlayed: Array.from(patternsPlayed),
      duration,
      games: currentSession.games
    };
  }

  function getCurrentSession() {
    return currentSession;
  }

  function getCurrentGame() {
    return currentGame;
  }

  function loadSession(sessionData) {
    currentSession = sessionData;
    if (sessionData.games && sessionData.games.length > 0) {
      currentGame = sessionData.games[sessionData.games.length - 1];
    }
  }

  function reset() {
    currentSession = null;
    currentGame = null;
  }

  return {
    init,
    createSession,
    createGame,
    changePattern,
    addWinner,
    addCalledNumber,
    endGame,
    endSession,
    getSessionStats,
    getCurrentSession,
    getCurrentGame,
    loadSession,
    reset
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}
