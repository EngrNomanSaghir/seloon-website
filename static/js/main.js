/* ==========================================================================
   MAISON DE BEAUTÉ — MAIN SCRIPTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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

  // Services Page Category Filtering
  const serviceFilterBtns = document.querySelectorAll('.service-filter-btn');
  const serviceCards = document.querySelectorAll('.service-card-item');

  if (serviceFilterBtns.length && serviceCards.length) {
    serviceFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        serviceFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.getAttribute('data-category');

        serviceCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (cat === 'all' || cardCat === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Admin Dashboard Status Update Handlers
  const statusSelectors = document.querySelectorAll('.admin-status-select');
  statusSelectors.forEach(select => {
    select.addEventListener('change', async () => {
      const bookingId = select.getAttribute('data-id');
      const newStatus = select.value;

      try {
        const res = await fetch('/api/admin/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId, status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
          if (window.showToast) window.showToast(`Booking #${bookingId} marked as ${newStatus}`, 'success');
          // Update row badge class
          const badge = document.getElementById(`status-badge-${bookingId}`);
          if (badge) {
            badge.className = `status-badge status-${newStatus}`;
            badge.textContent = newStatus;
          }
        }
      } catch (e) {
        alert('Failed to update status');
      }
    });
  });

  // Cancel Booking in Manage Portal
  const cancelBtn = document.getElementById('cancelAppointmentBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', async () => {
      const code = cancelBtn.getAttribute('data-code');
      if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
        return;
      }

      try {
        const res = await fetch('/api/cancel-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_code: code })
        });
        const data = await res.json();
        if (data.success) {
          alert('Your appointment has been cancelled successfully.');
          window.location.reload();
        } else {
          alert(data.message || 'Could not cancel booking.');
        }
      } catch (err) {
        alert('Network error while cancelling.');
      }
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
