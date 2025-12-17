/**
 * INDEX.JS - Enhanced Homepage Interactions
 * BingoXRPL
 */

(function() {
  'use strict';

  // ===================================
  // NAVIGATION
  // ===================================
  
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.header-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.querySelector('.site-header');

  // Hamburger menu toggle
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('show');
      document.body.style.overflow = expanded ? '' : 'hidden';
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('show');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('show') && 
          !nav.contains(e.target) && 
          !hamburger.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // Sticky header scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // Active section highlighting in nav
  const sections = document.querySelectorAll('section[id]');
  
  const highlightNav = () => {
    const scrollPos = window.pageYOffset + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  
  window.addEventListener('scroll', highlightNav);
  highlightNav(); // Initial check

  // ===================================
  // HERO INTERACTIONS
  // ===================================

  // Buy Dropdown Toggle
  const buyDropdownBtn = document.querySelector('.buy-dropdown-btn');
  const buyDropdownMenu = document.querySelector('.buy-dropdown-menu');

  if (buyDropdownBtn && buyDropdownMenu) {
    buyDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = buyDropdownBtn.getAttribute('aria-expanded') === 'true';
      buyDropdownBtn.setAttribute('aria-expanded', !expanded);
      buyDropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!buyDropdownBtn.contains(e.target) && !buyDropdownMenu.contains(e.target)) {
        buyDropdownBtn.setAttribute('aria-expanded', 'false');
        buyDropdownMenu.classList.remove('show');
      }
    });
  }

  // Connect Wallet Button (Placeholder - will be enhanced in Phase 3)
  const connectWalletBtn = document.getElementById('connect-wallet-btn');
  
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', () => {
      alert('Wallet connection coming soon! Phase 3 will add support for Xaman, Joey Wallet, Gem Wallet, and Crossmark.');
    });
  }

  // Particle Generation for Hero
  const createParticles = () => {
    const particleContainer = document.querySelector('.particle-container');
    if (!particleContainer) return;

    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random size
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      
      // Random color (cyan or green)
      const colors = ['#00B8D9', '#00FF00'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.background}`;
      
      // Random animation
      const duration = Math.random() * 10 + 5;
      const delay = Math.random() * 5;
      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 0.5) * 200;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.animation = `particle-float ${duration}s ${delay}s infinite ease-in-out`;
      particle.style.position = 'absolute';
      particle.style.opacity = '0';
      particle.style.pointerEvents = 'none';
      
      particleContainer.appendChild(particle);
    }
  };

  // Create particles on load
  createParticles();

  // ===================================
  // TOKENOMICS INTERACTIONS
  // ===================================

  // Accordion Functionality
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      
      // Close all other accordions (single accordion behavior)
      accordionHeaders.forEach(otherHeader => {
        if (otherHeader !== header) {
          otherHeader.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current accordion
      header.setAttribute('aria-expanded', !expanded);
    });
  });

  // Chart Segment Hover (Legend Interaction)
  const legendItems = document.querySelectorAll('.legend-item');
  const chartSegments = document.querySelectorAll('.chart-segment');
  
  legendItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      if (chartSegments[index]) {
        chartSegments[index].style.opacity = '1';
        chartSegments[index].style.filter = 'brightness(1.3)';
      }
    });
    
    item.addEventListener('mouseleave', () => {
      if (chartSegments[index]) {
        chartSegments[index].style.opacity = '1';
        chartSegments[index].style.filter = 'brightness(1)';
      }
    });
  });

  // ===================================
  // FAQ INTERACTIONS
  // ===================================

  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const expanded = question.getAttribute('aria-expanded') === 'true';
      
      // Close all other FAQs (single FAQ open behavior)
      faqQuestions.forEach(otherQuestion => {
        if (otherQuestion !== question) {
          otherQuestion.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current FAQ
      question.setAttribute('aria-expanded', !expanded);
    });
  });

  // ===================================
  // SMOOTH SCROLLING
  // ===================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===================================
  // SCROLL ANIMATIONS
  // ===================================

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements that should animate in
  const animateElements = document.querySelectorAll('.section, .feature-icon-card, .burn-card, .nft-card, .step-card, .timeline-item');
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });

  // ===================================
  // PERFORMANCE OPTIMIZATIONS
  // ===================================

  // Lazy load images (native loading="lazy" is already in HTML, but fallback)
  if ('loading' in HTMLImageElement.prototype === false) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.dataset.src || img.src;
    });
  }

  // Debounce scroll events
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Apply debouncing to scroll-heavy functions
  window.addEventListener('scroll', debounce(() => {
    // Any expensive scroll operations go here
  }, 100));

  // ===================================
  // ACCESSIBILITY ENHANCEMENTS
  // ===================================

  // Skip to main content
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.getElementById('main-content');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        main.removeAttribute('tabindex');
      }
    });
  }

  // Keyboard navigation for dropdowns
  if (buyDropdownBtn && buyDropdownMenu) {
    buyDropdownBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        buyDropdownBtn.setAttribute('aria-expanded', 'false');
        buyDropdownMenu.classList.remove('show');
        buyDropdownBtn.focus();
      }
    });
  }

  // Keyboard navigation for accordions
  accordionHeaders.forEach(header => {
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  // Keyboard navigation for FAQs
  faqQuestions.forEach(question => {
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  // ===================================
  // CONSOLE MESSAGE
  // ===================================

  console.log('%c$BINGO Enhanced 🎉', 'color: #00FF00; font-size: 24px; font-weight: bold;');
  console.log('%cHomepage v2.0 - Built for the XRPL community', 'color: #00B8D9; font-size: 14px;');
  console.log('Website: https://bingoxrp.com');
  console.log('Play Bingo: https://bingoxrp.com/bingo-roller.html');

})();
