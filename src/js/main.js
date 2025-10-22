// Smooth scrolling for navigation
document.querySelectorAll('.smooth-scroll').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    target.scrollIntoView({ behavior: 'smooth' });
    if (window.innerWidth <= 480) {
      document.querySelector('.nav-menu').classList.remove('active');
    }
  });
});

// Toggle hamburger menu on mobile
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Confetti on trade button click
const tradeButton = document.getElementById('buy-button');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

if (tradeButton) {
  tradeButton.addEventListener('click', () => {
    confettiCanvas.style.display = 'block';
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const confettiCount = window.innerWidth < 768 ? 150 : 400;
    const confetti = [];

    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        r: Math.random() * 6 + 1,
        d: Math.random() * confettiCount,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        tilt: Math.random() * 10 - 10,
        tiltAngle: Math.random() * Math.PI
      });
    }

    function draw() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confetti.forEach((p, i) => {
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
        p.tiltAngle += 0.1;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        if (p.y > confettiCanvas.height) confetti.splice(i, 1);
      });
      if (confetti.length > 0) requestAnimationFrame(draw);
      else confettiCanvas.style.display = 'none';
    }

    draw();
  });
}
