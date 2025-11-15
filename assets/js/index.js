document.addEventListener('DOMContentLoaded', function() {
  const buyDropdown = document.querySelector('.buy-dropdown');
  const buyDropdownBtn = document.querySelector('.buy-dropdown-btn');

  if (buyDropdown && buyDropdownBtn) {
    buyDropdownBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      buyDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function() {
      buyDropdown.classList.remove('active');
    });

    buyDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  const carouselTrack = document.querySelector('.carousel-track');
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const indicators = document.querySelectorAll('.carousel-indicator');
  
  if (carouselTrack && carouselSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = carouselSlides.length;

    function updateCarousel() {
      const slideWidth = carouselSlides[0].offsetWidth;
      carouselTrack.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
      
      indicators.forEach(function(indicator, index) {
        if (index === currentSlide) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });

      if (prevBtn && nextBtn) {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (currentSlide > 0) {
          currentSlide--;
          updateCarousel();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (currentSlide < totalSlides - 1) {
          currentSlide++;
          updateCarousel();
        }
      });
    }

    indicators.forEach(function(indicator, index) {
      indicator.addEventListener('click', function() {
        currentSlide = index;
        updateCarousel();
      });
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
  }

  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(function(header) {
    header.addEventListener('click', function() {
      const item = this.parentElement;
      const isActive = item.classList.contains('active');
      
      accordionHeaders.forEach(function(h) {
        h.parentElement.classList.remove('active');
      });
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(function(section) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      sectionObserver.observe(section);
    });
  }
});
