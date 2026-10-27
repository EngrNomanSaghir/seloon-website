/* ==========================================================================
   MAISON DE BEAUTÉ — MAIN CLIENT JAVASCRIPT
   Pure HTML, CSS, JavaScript Architecture
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav link based on current page filename
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html') || (currentPath === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    } else if (href !== 'index.html' && currentPath.endsWith(href)) {
      link.classList.add('active');
    }
  });

  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isOpen = navMenu.classList.contains('active');
      navToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (navToggle) navToggle.innerHTML = '☰';
      });
    });
  }

  // =========================================================================
  // BACKGROUND TRANSPARENT ROTATING LOGO BALL (FOLLOWS CURSOR + 360° SCROLL ROTATION)
  // =========================================================================
  const watermarkWrapper = document.getElementById('bgWatermarkWrapper');
  const watermarkSpinner = document.getElementById('bgWatermarkSpinner');

  if (watermarkWrapper && watermarkSpinner) {
    let currentAngle = 0;
    let targetAngle = 0;
    let isScrolling = false;
    let scrollTimeout = null;

    // Gentle rotation speed: ~0.15 deg / px (~2400px of scroll for a full 360° rotation)
    const ROTATION_FACTOR = 0.15;

    // Cursor tracking coordinates with smooth lerp physics
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    // Track mouse position smoothly
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    // Also support touch tracking on touch devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        targetX = e.touches[0].clientX;
        targetY = e.touches[0].clientY;
      }
    }, { passive: true });

    // Handle window resize gracefully
    window.addEventListener('resize', () => {
      if (targetX === currentX && targetY === currentY) {
        targetX = window.innerWidth / 2;
        targetY = window.innerHeight / 2;
      }
    }, { passive: true });

    // Set initial rotation based on any existing scroll position
    const getScrollY = () => window.pageYOffset || document.documentElement.scrollTop || 0;
    const initialY = getScrollY();
    targetAngle = initialY * ROTATION_FACTOR;
    currentAngle = targetAngle;
    watermarkSpinner.style.transform = `rotate(${currentAngle}deg)`;

    const onScroll = () => {
      const scrollY = getScrollY();
      targetAngle = scrollY * ROTATION_FACTOR;

      if (!isScrolling) {
        isScrolling = true;
        watermarkWrapper.classList.add('is-scrolling');
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        watermarkWrapper.classList.remove('is-scrolling');
      }, 350);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Smooth physics loop with momentum lerp for both cursor following and rotation
    const updateBallPhysics = () => {
      // Smooth cursor follow interpolation (gentle floating fluid motion)
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        currentX += dx * 0.055;
        currentY += dy * 0.055;
        watermarkWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }

      // Smooth scroll rotation interpolation
      const diff = targetAngle - currentAngle;
      if (Math.abs(diff) > 0.02) {
        currentAngle += diff * 0.07;
        watermarkSpinner.style.transform = `rotate(${currentAngle}deg)`;
      }

      requestAnimationFrame(updateBallPhysics);
    };

    requestAnimationFrame(updateBallPhysics);
  }
});

// Global Toast Notification Helper
window.showToast = function (message, type = 'info') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.zIndex = '9999';
    toast.style.padding = '0.9rem 1.6rem';
    toast.style.borderRadius = '30px';
    toast.style.fontSize = '0.92rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }

  if (type === 'error') {
    toast.style.background = '#C03737';
    toast.style.color = '#FFFFFF';
  } else if (type === 'success') {
    toast.style.background = '#1B834E';
    toast.style.color = '#FFFFFF';
  } else {
    toast.style.background = '#1C1E24';
    toast.style.color = '#FFFFFF';
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 4000);
};
