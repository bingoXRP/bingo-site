document.addEventListener('DOMContentLoaded', function() {
  
  let currentFeaturedIndex = 0;
  let rotationTimer;
  let countdownTimer;
  let isPaused = false;
  let timeRemaining = 15;
  
  const spotlightElement = document.getElementById('featured-spotlight');
  const sponsorsGrid = document.getElementById('sponsors-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const pauseBtn = document.getElementById('pause-rotation');
  const timerDisplay = document.getElementById('rotation-timer');
  const dotsContainer = document.getElementById('spotlight-dots');
  
  if (!spotlightElement || !sponsorsGrid) return;
  
  function renderFeaturedSpotlight() {
    if (!featuredSponsors || featuredSponsors.length === 0) {
      spotlightElement.innerHTML = '<p>No featured sponsors available.</p>';
      return;
    }
    
    const sponsor = featuredSponsors[currentFeaturedIndex];
    
    const categoriesHTML = sponsor.category.map(cat => 
      `<span class="category-badge">${cat}</span>`
    ).join('');
    
    const linksHTML = [];
    if (sponsor.website) linksHTML.push(`<a href="${sponsor.website}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">🌐 Website</a>`);
    if (sponsor.x) linksHTML.push(`<a href="${sponsor.x}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">𝕏 Follow</a>`);
    if (sponsor.telegram) linksHTML.push(`<a href="${sponsor.telegram}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">📱 Telegram</a>`);
    if (sponsor.discord) linksHTML.push(`<a href="${sponsor.discord}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">💬 Discord</a>`);
    
    spotlightElement.innerHTML = `
      <div class="spotlight-card">
        <div class="spotlight-logo-container">
          <img src="assets/images/sponsors/${sponsor.logo}" 
               alt="${sponsor.name}" 
               class="spotlight-logo"
               onerror="this.src='assets/images/mascot-hero.png'">
        </div>
        <div class="spotlight-info">
          <h3 class="spotlight-name">${sponsor.name}</h3>
          <div class="spotlight-categories">
            ${categoriesHTML}
          </div>
          <p class="spotlight-description">${sponsor.description}</p>
          <div class="spotlight-links">
            ${linksHTML.join('')}
          </div>
        </div>
      </div>
    `;
    
    updateDots();
  }
  
  function updateDots() {
    if (!dotsContainer) return;
    
    const dotsHTML = featuredSponsors.map((_, index) => 
      `<div class="spotlight-dot ${index === currentFeaturedIndex ? 'active' : ''}" data-index="${index}"></div>`
    ).join('');
    
    dotsContainer.innerHTML = dotsHTML;
    
    document.querySelectorAll('.spotlight-dot').forEach(dot => {
      dot.addEventListener('click', function() {
        currentFeaturedIndex = parseInt(this.getAttribute('data-index'));
        renderFeaturedSpotlight();
        resetRotationTimer();
      });
    });
  }
  
  function renderAllSponsors(filter = 'All') {
    const filtered = filter === 'All' 
      ? sponsorsData 
      : sponsorsData.filter(s => s.category.includes(filter));
    
    const html = filtered.map(sponsor => {
      const categoriesHTML = sponsor.category.map(cat => 
        `<span class="category-badge">${cat}</span>`
      ).join('');
      
      const linksHTML = [];
      if (sponsor.website) linksHTML.push(`<a href="${sponsor.website}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Website</a>`);
      if (sponsor.x) linksHTML.push(`<a href="${sponsor.x}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">X</a>`);
      if (sponsor.telegram) linksHTML.push(`<a href="${sponsor.telegram}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Telegram</a>`);
      if (sponsor.discord) linksHTML.push(`<a href="${sponsor.discord}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Discord</a>`);
      if (sponsor.firstLedger) linksHTML.push(`<a href="${sponsor.firstLedger}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Token</a>`);
      if (sponsor.linktree) linksHTML.push(`<a href="${sponsor.linktree}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Links</a>`);
      
      return `
        <div class="sponsor-card">
          <img src="assets/images/sponsors/${sponsor.logo}" 
               alt="${sponsor.name}" 
               class="sponsor-logo"
               onerror="this.src='assets/images/mascot-hero.png'">
          <h3 class="sponsor-name">${sponsor.name}</h3>
          <div class="sponsor-card-categories">
            ${categoriesHTML}
          </div>
          <p class="sponsor-description">${sponsor.description}</p>
          <div class="sponsor-links">
            ${linksHTML.join('')}
          </div>
        </div>
      `;
    }).join('');
    
    sponsorsGrid.innerHTML = html;
  }
  
  function setupFilters() {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        renderAllSponsors(category);
      });
    });
  }
  
  function nextFeaturedSponsor() {
    if (!featuredSponsors || featuredSponsors.length === 0) return;
    
    currentFeaturedIndex = (currentFeaturedIndex + 1) % featuredSponsors.length;
    renderFeaturedSpotlight();
    timeRemaining = 15;
  }
  
  function startRotation() {
    clearInterval(rotationTimer);
    clearInterval(countdownTimer);
    
    rotationTimer = setInterval(() => {
      if (!isPaused) {
        nextFeaturedSponsor();
      }
    }, 15000);
    
    startCountdown();
  }
  
  function startCountdown() {
    timeRemaining = 15;
    updateTimerDisplay();
    
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (!isPaused) {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
          timeRemaining = 15;
        }
      }
    }, 1000);
  }
  
  function updateTimerDisplay() {
    if (timerDisplay) {
      timerDisplay.textContent = `${timeRemaining}s`;
    }
  }
  
  function resetRotationTimer() {
    clearInterval(rotationTimer);
    clearInterval(countdownTimer);
    timeRemaining = 15;
    startRotation();
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function() {
      isPaused = !isPaused;
      this.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
    });
  }
  
  if (spotlightElement) {
    spotlightElement.addEventListener('mouseenter', () => {
      if (!isPaused) {
        isPaused = true;
        if (pauseBtn) pauseBtn.textContent = '▶️ Resume';
      }
    });
    
    spotlightElement.addEventListener('mouseleave', () => {
      if (isPaused && pauseBtn && pauseBtn.textContent === '▶️ Resume') {
        isPaused = false;
        pauseBtn.textContent = '⏸️ Pause';
      }
    });
  }
  
  renderFeaturedSpotlight();
  renderAllSponsors();
  setupFilters();
  startRotation();
  
});
