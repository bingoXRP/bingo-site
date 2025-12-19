document.addEventListener('DOMContentLoaded', function() {
  
  let currentFeaturedIndex = 0;
  let rotationTimer;
  let countdownTimer;
  let isPaused = false;
  let timeRemaining = 15;
  
  function initSponsorsPage() {
    renderFeaturedSpotlight();
    renderAllSponsors();
    setupCategoryFilters();
    setupRotationControls();
    startRotation();
  }
  
  function renderFeaturedSpotlight() {
    const spotlight = document.getElementById('featured-spotlight');
    if (!spotlight || !featuredSponsors || featuredSponsors.length === 0) return;
    
    const sponsor = featuredSponsors[currentFeaturedIndex];
    const logoPath = `../assets/images/sponsors/${sponsor.logo}`;
    
    spotlight.innerHTML = `
      <div class="spotlight-card">
        <div class="spotlight-logo-container">
          <img src="${logoPath}" 
               alt="${sponsor.name}" 
               class="spotlight-logo"
               onerror="this.src='../assets/images/logo.png'">
        </div>
        <div class="spotlight-info">
          <h3 class="spotlight-name">${sponsor.name}</h3>
          <div class="spotlight-categories">
            ${sponsor.category.map(cat => `
              <span class="category-badge">${cat}</span>
            `).join('')}
          </div>
          <p class="spotlight-description">${sponsor.description}</p>
          <div class="spotlight-links">
            ${sponsor.website ? `<a href="${sponsor.website}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">🌐 Website</a>` : ''}
            ${sponsor.x ? `<a href="${sponsor.x}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">𝕏 Follow</a>` : ''}
            ${sponsor.telegram ? `<a href="${sponsor.telegram}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">📱 Telegram</a>` : ''}
            ${sponsor.discord ? `<a href="${sponsor.discord}" target="_blank" rel="noopener noreferrer" class="sponsor-link-btn">💬 Discord</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  function renderAllSponsors(filter = 'All') {
    const grid = document.getElementById('sponsors-grid');
    if (!grid || !sponsorsData) return;
    
    const filtered = filter === 'All' 
      ? sponsorsData 
      : sponsorsData.filter(s => s.category.includes(filter));
    
    grid.innerHTML = filtered.map(sponsor => {
      const logoPath = `../assets/images/sponsors/${sponsor.logo}`;
      
      return `
        <div class="sponsor-card">
          <img src="${logoPath}" 
               alt="${sponsor.name}" 
               class="sponsor-logo"
               onerror="this.src='../assets/images/logo.png'">
          <h3 class="sponsor-name">${sponsor.name}</h3>
          <div class="sponsor-card-categories">
            ${sponsor.category.map(cat => `
              <span class="category-badge">${cat}</span>
            `).join('')}
          </div>
          <p class="sponsor-description">${sponsor.description}</p>
          <div class="sponsor-links">
            ${sponsor.website ? `<a href="${sponsor.website}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Website</a>` : ''}
            ${sponsor.x ? `<a href="${sponsor.x}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">X</a>` : ''}
            ${sponsor.telegram ? `<a href="${sponsor.telegram}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Telegram</a>` : ''}
            ${sponsor.discord ? `<a href="${sponsor.discord}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Discord</a>` : ''}
            ${sponsor.firstLedger ? `<a href="${sponsor.firstLedger}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Token</a>` : ''}
            ${sponsor.linktree ? `<a href="${sponsor.linktree}" target="_blank" rel="noopener noreferrer" class="sponsor-link-small">Linktree</a>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
  
  function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons) return;
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        renderAllSponsors(category);
      });
    });
  }
  
  function setupRotationControls() {
    const pauseBtn = document.getElementById('pause-rotation');
    if (!pauseBtn) return;
    
    pauseBtn.addEventListener('click', function() {
      if (isPaused) {
        resumeRotation();
      } else {
        pauseRotation();
      }
    });
  }
  
  function startRotation() {
    if (!featuredSponsors || featuredSponsors.length === 0) return;
    
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
    const timerElement = document.getElementById('rotation-timer');
    if (timerElement) {
      timerElement.textContent = `${timeRemaining}s`;
    }
  }
  
  function nextFeaturedSponsor() {
    if (!featuredSponsors || featuredSponsors.length === 0) return;
    
    currentFeaturedIndex = (currentFeaturedIndex + 1) % featuredSponsors.length;
    renderFeaturedSpotlight();
    timeRemaining = 15;
  }
  
  function pauseRotation() {
    isPaused = true;
    const pauseIcon = document.querySelector('.pause-icon');
    const playIcon = document.querySelector('.play-icon');
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (playIcon) playIcon.style.display = 'block';
  }
  
  function resumeRotation() {
    isPaused = false;
    const pauseIcon = document.querySelector('.pause-icon');
    const playIcon = document.querySelector('.play-icon');
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (playIcon) playIcon.style.display = 'none';
  }
  
  const spotlight = document.getElementById('featured-spotlight');
  if (spotlight) {
    spotlight.addEventListener('mouseenter', () => {
      if (!isPaused) pauseRotation();
    });
    
    spotlight.addEventListener('mouseleave', () => {
      if (isPaused) resumeRotation();
    });
  }
  
  initSponsorsPage();
  
});
