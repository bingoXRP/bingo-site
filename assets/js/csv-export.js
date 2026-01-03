const CSVExport = (function() {
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  }

  function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function generateSessionCSV(sessionStats) {
    let csv = 'Session ID,Host,Total Games,Total Players,Total Winners,Duration,Patterns Played\n';
    
    csv += [
      escapeCSV(sessionStats.sessionID),
      escapeCSV(sessionStats.host),
      sessionStats.totalGames,
      sessionStats.totalPlayers,
      sessionStats.totalWinners,
      escapeCSV(formatDuration(sessionStats.duration)),
      escapeCSV(sessionStats.patternsPlayed.join('; '))
    ].join(',') + '\n';

    return csv;
  }

  function generateWinnersCSV(sessionStats) {
    let csv = 'Session ID,Game #,Pattern,Winner Handle,Card ID,Won At,Numbers Called,Timestamp\n';
    
    sessionStats.games.forEach(game => {
      game.winners.forEach(winner => {
        csv += [
          escapeCSV(sessionStats.sessionID),
          game.gameNumber,
          escapeCSV(winner.pattern || game.pattern),
          escapeCSV(winner.handle),
          escapeCSV(winner.cardID),
          winner.numbersToWin || 0,
          winner.numbersToWin || 0,
          escapeCSV(formatTimestamp(winner.wonAt))
        ].join(',') + '\n';
      });
    });

    return csv;
  }

  function generateGamesCSV(sessionStats) {
    let csv = 'Session ID,Game #,Pattern,Started At,Ended At,Duration,Numbers Called,Total Winners\n';
    
    sessionStats.games.forEach(game => {
      const duration = game.endedAt ? game.endedAt - game.startedAt : Date.now() - game.startedAt;
      
      csv += [
        escapeCSV(sessionStats.sessionID),
        game.gameNumber,
        escapeCSV(game.pattern),
        escapeCSV(formatTimestamp(game.startedAt)),
        escapeCSV(game.endedAt ? formatTimestamp(game.endedAt) : 'In Progress'),
        escapeCSV(formatDuration(duration)),
        game.calledNumbers ? game.calledNumbers.length : 0,
        game.winners ? game.winners.length : 0
      ].join(',') + '\n';
    });

    return csv;
  }

  function generateComprehensiveCSV(sessionStats) {
    let csv = '';
    
    csv += 'SESSION SUMMARY\n';
    csv += generateSessionCSV(sessionStats);
    csv += '\n';
    
    csv += 'GAMES\n';
    csv += generateGamesCSV(sessionStats);
    csv += '\n';
    
    csv += 'WINNERS\n';
    csv += generateWinnersCSV(sessionStats);
    
    return csv;
  }

  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  }

  function exportSession(sessionStats, type = 'comprehensive') {
    let csvContent = '';
    let filename = '';
    
    switch (type) {
      case 'winners':
        csvContent = generateWinnersCSV(sessionStats);
        filename = `bingo-winners-${sessionStats.sessionID}-${Date.now()}.csv`;
        break;
      case 'games':
        csvContent = generateGamesCSV(sessionStats);
        filename = `bingo-games-${sessionStats.sessionID}-${Date.now()}.csv`;
        break;
      case 'session':
        csvContent = generateSessionCSV(sessionStats);
        filename = `bingo-session-${sessionStats.sessionID}-${Date.now()}.csv`;
        break;
      default:
        csvContent = generateComprehensiveCSV(sessionStats);
        filename = `bingo-complete-${sessionStats.sessionID}-${Date.now()}.csv`;
    }
    
    downloadCSV(csvContent, filename);
  }

  return {
    exportSession,
    generateSessionCSV,
    generateWinnersCSV,
    generateGamesCSV,
    generateComprehensiveCSV,
    downloadCSV
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSVExport;
}
