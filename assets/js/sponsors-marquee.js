document.addEventListener('DOMContentLoaded', function() {
  
  const marqueeTrack = document.querySelector('.marquee-track');
  const marqueeWrapper = document.querySelector('.marquee-wrapper');
  
  if (!marqueeTrack || !sponsorsData) return;
  
  const allSponsors = [...sponsorsData, ...sponsorsData];
  
  function renderMarqueeSponsors() {
    const html = allSponsors.map(sponsor => `
      <div class="sponsor-marquee-card" data-slug="${sponsor.slug}">
        <img src="assets/images/sponsors/${sponsor.logo}" 
             alt="${sponsor.name}" 
             class="sponsor-marquee-logo"
             onerror="this.style.display='none'">
        <h3 class="sponsor-marquee-name">${sponsor.name}</h3>
      </div>
    `).join('');
    
    marqueeTrack.innerHTML = html;
    
    marqueeTrack.querySelectorAll('.sponsor-marquee-card').forEach(card => {
      card.addEventListener('click', function() {
        const slug = this.getAttribute('data-slug');
        const sponsor = sponsorsData.find(s => s.slug === slug);
        if (sponsor && sponsor.website) {
          window.open(sponsor.website, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }
  
  renderMarqueeSponsors();
  
  if (marqueeWrapper) {
    marqueeWrapper.addEventListener('mouseenter', function() {
      marqueeTrack.classList.add('paused');
    });
    
    marqueeWrapper.addEventListener('mouseleave', function() {
      marqueeTrack.classList.remove('paused');
    });
  }
  
});
