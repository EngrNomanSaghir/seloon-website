/* ==========================================================================
   MAISON DE BEAUTÉ — APPOINTMENT BOOKING WIZARD ENGINE
   Pure Client-Side JavaScript Architecture
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const wizardContainer = document.getElementById('bookingWizard');
  if (!wizardContainer) return;

  const state = {
    step: 1,
    serviceId: null,
    serviceName: '',
    servicePrice: 0,
    serviceDuration: '',
    stylistId: null,
    stylistName: 'Any Available Specialist',
    stylistRole: 'Salon Match',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  };

  // DOM Elements
  const steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
    document.getElementById('step4')
  ];

  const stepItems = document.querySelectorAll('.step-item');
  const servicesListEl = document.querySelector('.booking-services-list');
  const stylistsListEl = document.querySelector('.booking-stylists-list');
  const dateInput = document.getElementById('appointmentDate');
  const slotsContainer = document.getElementById('slotsContainer');
  const slotsLoading = document.getElementById('slotsLoading');

  // Summary Elements
  const summaryService = document.getElementById('summaryService');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryStylist = document.getElementById('summaryStylist');
  const summaryDateTime = document.getElementById('summaryDateTime');
  const summaryTotal = document.getElementById('summaryTotal');

  // URL parameters for preselection
  const urlParams = new URLSearchParams(window.location.search);
  const preServiceId = urlParams.get('service_id');
  const preStylistId = urlParams.get('stylist_id');
  const preDate = urlParams.get('date');
  const preTime = urlParams.get('time');

  // Initialize Date Input (Today to +60 days)
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    dateInput.min = minDate;
    dateInput.value = preDate || minDate;
    state.date = dateInput.value;

    dateInput.addEventListener('change', () => {
      state.date = dateInput.value;
      state.time = '';
      updateSummary();
      loadAvailableSlots();
      // Disable step 3 next button until a slot is chosen
      const nextBtn3 = document.querySelector('#step3 .btn-next');
      if (nextBtn3) nextBtn3.disabled = true;
    });
  }

  // Render Services list dynamically from SalonStore
  function renderServices() {
    if (!servicesListEl) return;
    const services = window.SalonStore.getServices();
    servicesListEl.innerHTML = services.map(s => `
      <div class="select-service-item ${preServiceId && String(preServiceId) === String(s.id) ? 'selected preselected' : ''}"
           data-id="${s.id}"
           data-name="${escapeHtml(s.name)}"
           data-price="${s.price}"
           data-duration="${s.duration_min}">
        <img src="${s.image_url}" alt="${escapeHtml(s.name)}" class="select-service-img">
        <div class="select-service-info">
          <span class="service-category-tag">${escapeHtml(s.category)}</span>
          <h4>${escapeHtml(s.name)}</h4>
          <p>${escapeHtml((s.description || '').substring(0, 110))}...</p>
        </div>
        <div class="select-service-meta">
          <div class="select-service-price">$${Number(s.price).toFixed(2)}</div>
          <div class="select-service-duration">⏱ ${s.duration_min} mins</div>
        </div>
      </div>
    `).join('');

    // Attach click handlers
    document.querySelectorAll('.select-service-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.select-service-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        state.serviceId = parseInt(item.getAttribute('data-id'), 10);
        state.serviceName = item.getAttribute('data-name');
        state.servicePrice = parseFloat(item.getAttribute('data-price'));
        state.serviceDuration = item.getAttribute('data-duration');

        updateSummary();
        enableNextButton(1);
      });
    });

    // Auto-select if preselected
    if (preServiceId) {
      const target = document.querySelector(`.select-service-item[data-id="${preServiceId}"]`);
      if (target) target.click();
    }
  }

  // Render Stylists list dynamically from SalonStore
  function renderStylists() {
    if (!stylistsListEl) return;
    const stylists = window.SalonStore.getStylists(true); // Active stylists only

    let html = `
      <div class="select-stylist-item ${!preStylistId ? 'selected' : ''}"
           data-id="any"
           data-name="Any Available Specialist"
           data-role="Salon Match">
        <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 2px solid var(--gold-primary); margin: 0 auto 0.75rem auto; box-shadow: 0 4px 12px rgba(197, 168, 128, 0.25);">
          <img src="images/lady_logo_round.png" alt="Any Specialist Salon Match" style="width: 100%; height: 100%; object-fit: cover; display: block;">
        </div>
        <h3 class="select-stylist-name">Any Specialist</h3>
        <div class="select-stylist-role">Fastest Availability</div>
        <div class="select-stylist-rating">Auto-assigned top artisan</div>
      </div>
    `;

    html += stylists.map(s => `
      <div class="select-stylist-item ${preStylistId && String(preStylistId) === String(s.id) ? 'selected preselected' : ''}"
           data-id="${s.id}"
           data-name="${escapeHtml(s.name)}"
           data-role="${escapeHtml(s.title)}">
        <img src="${s.image_url}" alt="${escapeHtml(s.name)}" class="select-stylist-avatar">
        <h3 class="select-stylist-name">${escapeHtml(s.name)}</h3>
        <div class="select-stylist-role">${escapeHtml((s.title || '').substring(0, 30))}...</div>
        <div class="select-stylist-rating">★ ${Number(s.rating).toFixed(2)} (${s.reviews_count})</div>
        <div style="margin-top: 0.5rem; font-size: 0.72rem; padding: 0.3rem 0.5rem; background: var(--bg-cream); border-radius: 4px; border: 1px solid var(--border-subtle); text-align: left;">
          <div>⏰ <strong>Shift:</strong> ${escapeHtml(s.shift_start)} – ${escapeHtml(s.shift_end)}</div>
          <div>🗓 <strong>Days:</strong> ${escapeHtml(s.available_days)}</div>
        </div>
      </div>
    `).join('');

    stylistsListEl.innerHTML = html;

    // Attach click handlers
    document.querySelectorAll('.select-stylist-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.select-stylist-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        const rawId = item.getAttribute('data-id');
        state.stylistId = rawId === 'any' ? null : parseInt(rawId, 10);
        state.stylistName = item.getAttribute('data-name');
        state.stylistRole = item.getAttribute('data-role');

        updateSummary();
        enableNextButton(2);

        if (state.date) {
          loadAvailableSlots();
        }
      });
    });

    // Auto-select if preselected
    if (preStylistId) {
      const target = document.querySelector(`.select-stylist-item[data-id="${preStylistId}"]`);
      if (target) target.click();
    } else {
      const anyTarget = document.querySelector('.select-stylist-item[data-id="any"]');
      if (anyTarget) anyTarget.click();
    }
  }

  // Render initial components
  renderServices();
  renderStylists();

  if (preTime) {
    state.time = preTime;
  }

  // Step Navigation
  window.goToStep = function (targetStep) {
    if (targetStep > state.step) {
      if (state.step === 1 && !state.serviceId) {
        showToast('Please select a treatment or service first.', 'error');
        return;
      }
      if (state.step === 2 && state.stylistId === undefined) {
        showToast('Please choose your preferred specialist.', 'error');
        return;
      }
      if (state.step === 3 && (!state.date || !state.time)) {
        showToast('Please select an available date and time slot.', 'error');
        return;
      }
    }

    state.step = targetStep;

    steps.forEach((s, idx) => {
      if (s) {
        s.style.display = (idx + 1 === targetStep) ? 'block' : 'none';
      }
    });

    stepItems.forEach((si, idx) => {
      const stepNum = idx + 1;
      si.classList.remove('active', 'completed');
      if (stepNum === targetStep) {
        si.classList.add('active');
      } else if (stepNum < targetStep) {
        si.classList.add('completed');
      }
    });

    if (targetStep === 3) {
      loadAvailableSlots();
    }

    window.scrollTo({ top: wizardContainer.offsetTop - 100, behavior: 'smooth' });
  };

  function enableNextButton(stepNum) {
    const nextBtn = document.querySelector(`#step${stepNum} .btn-next`);
    if (nextBtn) nextBtn.removeAttribute('disabled');
  }

  // Load Available Slots
  function loadAvailableSlots() {
    if (!slotsContainer || !state.date) return;
    slotsContainer.innerHTML = '';
    if (slotsLoading) slotsLoading.style.display = 'block';

    const data = window.SalonStore.getAvailableSlots(state.date, state.stylistId);

    if (slotsLoading) slotsLoading.style.display = 'none';

    // Shift alert box
    const alertBox = document.getElementById('stylistShiftAlert');
    if (alertBox) {
      if (data.is_off_day) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FFF5F5';
        alertBox.style.border = '1px solid #F8D7DA';
        alertBox.style.color = '#C03737';
        alertBox.innerHTML = `⚠️ <strong>${escapeHtml(data.stylist_name)} is Off-Duty on ${escapeHtml(data.day_name)}s</strong>. Please pick another date or switch to <em>Any Specialist</em>.`;
      } else if (state.stylistId) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#F0FAF4';
        alertBox.style.border = '1px solid #A3E3BE';
        alertBox.style.color = '#17663D';
        alertBox.innerHTML = `⏰ <strong>${escapeHtml(data.stylist_name)} Working Shift Today:</strong> ${escapeHtml(data.shift_info)}`;
      } else {
        alertBox.style.display = 'none';
      }
    }

    if (!data.slots || data.slots.length === 0) {
      slotsContainer.innerHTML = '<p class="text-muted">No slots available for this date. Please select another day.</p>';
      return;
    }

    data.slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = state.time === slot.time;
      btn.className = `time-slot-btn ${isSelected ? 'selected' : ''} is-${slot.status ? slot.status.replace('_', '-') : 'available'}`;
      btn.textContent = slot.time;
      btn.disabled = !slot.available;

      if (!slot.available) {
        if (slot.status === 'booked') {
          btn.title = 'Slot is already booked';
        } else if (slot.status === 'outside_shift') {
          btn.title = 'Outside specialist shift hours';
        } else if (slot.status === 'off_duty') {
          btn.title = 'Specialist is off-duty';
        }
      }

      if (slot.available) {
        if (isSelected) {
          enableNextButton(3);
        }
        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          state.time = slot.time;
          updateSummary();
          enableNextButton(3);
        });
      }

      slotsContainer.appendChild(btn);
    });
  }

  // Update Summary Sidebar
  function updateSummary() {
    if (summaryService) {
      summaryService.textContent = state.serviceName || 'Select a treatment';
    }
    if (summaryDuration) {
      summaryDuration.textContent = state.serviceDuration ? `${state.serviceDuration} mins` : '—';
    }
    if (summaryStylist) {
      summaryStylist.textContent = state.stylistName || 'Any Specialist';
    }
    if (summaryDateTime) {
      if (state.date && state.time) {
        summaryDateTime.textContent = `${state.date} at ${state.time}`;
      } else if (state.date) {
        summaryDateTime.textContent = `${state.date} (Select time)`;
      } else {
        summaryDateTime.textContent = 'Select date & time';
      }
    }
    if (summaryTotal) {
      summaryTotal.textContent = state.servicePrice > 0 ? `$${Number(state.servicePrice).toFixed(2)}` : '$0.00';
    }
  }

  // Form Submission
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const notes = document.getElementById('clientNotes').value.trim();

      if (!name || !email || !phone) {
        showToast('Please fill out your name, email, and phone number.', 'error');
        return;
      }

      state.name = name;
      state.email = email;
      state.phone = phone;
      state.notes = notes;

      const submitBtn = document.getElementById('submitBookingBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Securing your slot...</span>';

      const result = window.SalonStore.createBooking({
        service_id: state.serviceId,
        stylist_id: state.stylistId,
        date: state.date,
        time: state.time,
        name: state.name,
        email: state.email,
        phone: state.phone,
        notes: state.notes
      });

      if (result.success) {
        showToast('Appointment Confirmed! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 700);
      } else {
        showToast(result.message || 'Booking could not be completed.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Confirm & Book Appointment →</span>';
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
