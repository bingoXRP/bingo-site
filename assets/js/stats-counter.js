 const StatsCounter = (function() {
  let database = null;
  let statsRef = null;
  let gamesListener = null;
  
  function init(firebaseDb) {
    database = firebaseDb;
    statsRef = database.ref('stats/totalGames');
    setupListener();
  }
  
  function setupListener() {
    if (!statsRef) return;
    
    gamesListener = statsRef.on('value', (snapshot) => {
      const totalGames = snapshot.val() || 0;
      updateDisplay(totalGames);
    });
  }
  
  function updateDisplay(count) {
    const displayElements = document.querySelectorAll('.stats-games-count');
    displayElements.forEach(el => {
      animateCounter(el, count);
    });
  }
  
  function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const duration = 1000;
    const steps = 30;
    const increment = (targetValue - currentValue) / steps;
    let current = currentValue;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current += increment;
      
      if (step >= steps) {
        current = targetValue;
        clearInterval(timer);
      }
      
      element.textContent = formatNumber(Math.floor(current));
    }, duration / steps);
  }
  
  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }
  
  function incrementGamesPlayed() {
    if (!statsRef) return;
    
    statsRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
    });
  }
  
  function getGamesPlayed(callback) {
    if (!statsRef) return;
    
    statsRef.once('value', (snapshot) => {
      const count = snapshot.val() || 0;
      callback(count);
    });
  }
  
  function cleanup() {
    if (statsRef && gamesListener) {
      statsRef.off('value', gamesListener);
    }
  }
  
  return {
    init,
    incrementGamesPlayed,
    getGamesPlayed,
    cleanup
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatsCounter;
}
