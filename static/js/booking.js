/* ==========================================================================
   SALON APPOINTMENT BOOKING ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const wizardContainer = document.getElementById('bookingWizard');
  if (!wizardContainer) return;

  // Booking state object
  const state = {
    step: 1,
    serviceId: null,
    serviceName: '',
    servicePrice: 0,
    serviceDuration: '',
    stylistId: null,
    stylistName: 'Any Available Specialist',
    stylistRole: '',
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
  const serviceItems = document.querySelectorAll('.select-service-item');
  const stylistItems = document.querySelectorAll('.select-stylist-item');
  const dateInput = document.getElementById('appointmentDate');
  const slotsContainer = document.getElementById('slotsContainer');
  const slotsLoading = document.getElementById('slotsLoading');

  // Summary Elements
  const summaryService = document.getElementById('summaryService');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryStylist = document.getElementById('summaryStylist');
  const summaryDateTime = document.getElementById('summaryDateTime');
  const summaryTotal = document.getElementById('summaryTotal');

  // Set minimum date to today and max date to 60 days in future
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    dateInput.min = minDate;
    dateInput.value = minDate;
    state.date = minDate;

    dateInput.addEventListener('change', () => {
      state.date = dateInput.value;
      state.time = ''; // Reset selected slot
      updateSummary();
      loadAvailableSlots();
    });
  }

  // Handle Service Selection
  serviceItems.forEach(item => {
    item.addEventListener('click', () => {
      serviceItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');

      state.serviceId = parseInt(item.getAttribute('data-id'), 10);
      state.serviceName = item.getAttribute('data-name');
      state.servicePrice = parseFloat(item.getAttribute('data-price'));
      state.serviceDuration = item.getAttribute('data-duration');

      updateSummary();
      enableNextButton(1);
    });
  });

  // Handle Stylist Selection
  stylistItems.forEach(item => {
    item.addEventListener('click', () => {
      stylistItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');

      const rawId = item.getAttribute('data-id');
      state.stylistId = rawId === 'any' ? null : parseInt(rawId, 10);
      state.stylistName = item.getAttribute('data-name');
      state.stylistRole = item.getAttribute('data-role');

      updateSummary();
      enableNextButton(2);
      
      // If date is already chosen, reload slots for this stylist
      if (state.date) {
        loadAvailableSlots();
      }
    });
  });

  // Step Navigation Buttons
  window.goToStep = function(targetStep) {
    if (targetStep > state.step) {
      // Validate current step before advancing
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

    // Switch step views
    steps.forEach((s, idx) => {
      if (s) {
        s.style.display = (idx + 1 === targetStep) ? 'block' : 'none';
      }
    });

    // Update stepper pills
    stepItems.forEach((si, idx) => {
      const stepNum = idx + 1;
      si.classList.remove('active', 'completed');
      if (stepNum === targetStep) {
        si.classList.add('active');
      } else if (stepNum < targetStep) {
        si.classList.add('completed');
      }
    });

    // When reaching step 3, auto load slots
    if (targetStep === 3) {
      loadAvailableSlots();
    }

    window.scrollTo({ top: wizardContainer.offsetTop - 100, behavior: 'smooth' });
  };

  function enableNextButton(stepNum) {
    const nextBtn = document.querySelector(`#step${stepNum} .btn-next`);
    if (nextBtn) nextBtn.removeAttribute('disabled');
  }

  // Fetch Slots
  async function loadAvailableSlots() {
    if (!slotsContainer || !state.date) return;
    
    slotsContainer.innerHTML = '';
    if (slotsLoading) slotsLoading.style.display = 'block';

    try {
      let url = `/api/available-slots?date=${encodeURIComponent(state.date)}`;
      if (state.stylistId) {
        url += `&stylist_id=${state.stylistId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (slotsLoading) slotsLoading.style.display = 'none';

      // Update shift & off-duty alert
      const alertBox = document.getElementById('stylistShiftAlert');
      if (alertBox) {
        if (data.is_off_day) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#FFF5F5';
          alertBox.style.border = '1px solid #F8D7DA';
          alertBox.style.color = '#C03737';
          alertBox.innerHTML = `⚠️ <strong>${data.stylist_name} is Off-Duty on ${data.day_name}s</strong>. Please pick another date or switch to <em>Any Specialist</em>.`;
        } else if (state.stylistId) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#F0FAF4';
          alertBox.style.border = '1px solid #A3E3BE';
          alertBox.style.color = '#17663D';
          alertBox.innerHTML = `⏰ <strong>${data.stylist_name} Working Shift Today:</strong> ${data.shift_info}`;
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
    } catch (err) {
      if (slotsLoading) slotsLoading.style.display = 'none';
      slotsContainer.innerHTML = '<p class="text-danger">Failed to load slots. Please refresh or try again.</p>';
    }
  }

  // Update Sidebar Summary
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
      summaryTotal.textContent = state.servicePrice > 0 ? `$${state.servicePrice.toFixed(2)}` : '$0.00';
    }
  }

  // Handle Form Submission
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
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

      try {
        const payload = {
          service_id: state.serviceId,
          stylist_id: state.stylistId,
          date: state.date,
          time: state.time,
          name: state.name,
          email: state.email,
          phone: state.phone,
          notes: state.notes
        };

        const res = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
          showToast('Appointment Confirmed! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = result.redirect_url;
          }, 800);
        } else {
          showToast(result.message || 'Booking could not be completed.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Confirm & Book Appointment</span>';
        }
      } catch (err) {
        showToast('Network error while booking. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Confirm & Book Appointment</span>';
      }
    });
  }

  // Check pre-selected params
  const urlParams = new URLSearchParams(window.location.search);
  const paramDate = urlParams.get('date');
  const paramTime = urlParams.get('time');

  if (paramDate && dateInput) {
    dateInput.value = paramDate;
    state.date = paramDate;
  }
  if (paramTime) {
    state.time = paramTime;
  }

  const preService = document.querySelector('.select-service-item.preselected');
  if (preService) {
    preService.click();
  }

  const preStylist = document.querySelector('.select-stylist-item.preselected');
  if (preStylist) {
    preStylist.click();
  }
});

// Toast notification helper
function showToast(message, type = 'info') {
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
}
