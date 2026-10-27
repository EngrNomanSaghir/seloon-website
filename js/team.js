/* ==========================================================================
   MAISON DE BEAUTÉ — SPECIALISTS & TEAM AVAILABILITY FINDER
   Pure Client-Side JavaScript Architecture
   ========================================================================== */

let activeClientModalStylistId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Set default date for finder input
  const finderDate = document.getElementById('finderDateInput');
  if (finderDate) {
    const today = new Date().toISOString().split('T')[0];
    finderDate.value = today;
    finderDate.min = today;
  }

  // Populate finder stylist dropdown if empty
  const finderSelect = document.getElementById('finderStylistSelect');
  if (finderSelect && finderSelect.options.length === 0) {
    const stylists = window.SalonStore.getStylists(true);
    finderSelect.innerHTML = stylists.map(s => `
      <option value="${s.id}">
        ${s.name} (${s.title}) — Shift: ${s.shift_start} to ${s.shift_end}
      </option>
    `).join('');
  }
});

// Check availability in on-page finder
window.checkFinderAvailability = function () {
  const select = document.getElementById('finderStylistSelect');
  const dateInput = document.getElementById('finderDateInput');
  const resultsBox = document.getElementById('finderResultsBox');

  if (!select || !dateInput || !resultsBox) return;

  const stylistId = parseInt(select.value, 10);
  const dateVal = dateInput.value;

  if (!dateVal) {
    alert('Please select a date first.');
    return;
  }

  const data = window.SalonStore.getSpecialistAvailability(stylistId, dateVal);
  if (!data) return;

  const w = data.stylist;
  let statusHtml = data.is_working_day
    ? `<span style="color: #17663D; font-weight: 700;">● On Duty (${data.available_count} Open Slots, ${data.booked_count} Booked)</span>`
    : `<span style="color: #C03737; font-weight: 700;">○ Off-Duty (Next Available: ${data.next_working_date || 'N/A'})</span>`;

  resultsBox.style.display = 'block';
  resultsBox.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <h4 style="margin: 0; font-size: 1.15rem; color: var(--text-dark);">${w.name}</h4>
        <small style="color: var(--text-muted);">${w.title} • Scheduled Days: ${w.available_days}</small>
      </div>
      <div style="text-align: right;">
        <span class="shift-badge">⏰ ${w.shift_start} – ${w.shift_end}</span><br>
        <small style="font-weight: 700; color: var(--gold-dark);">${w.shift_type || 'Full Day'}</small>
      </div>
    </div>

    <div style="margin-bottom: 1rem; font-size: 0.9rem; padding: 0.6rem 0.85rem; background: #FFFFFF; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
      Status on <strong>${data.formatted_date}</strong>: ${statusHtml}
    </div>

    <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase; color: var(--text-muted);">
      Operating Time Slots:
    </div>
    <div class="avail-slot-grid" id="finderSlotButtons">
      ${data.slots.map(slot => `
        <div class="avail-slot-btn is-${slot.status.replace('_', '-')}" title="${slot.reason}">
          <span>${slot.time}</span>
          <span class="slot-status-text">${slot.status.replace('_', ' ')}</span>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 1.5rem; text-align: right;">
      <a href="book.html?stylist_id=${w.id}&date=${data.date}" class="btn btn-primary btn-sm">
        Book Appointment with ${w.name.split(' ')[0]} on this Day →
      </a>
    </div>
  `;

  resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Open Client Availability Modal
window.openClientAvailabilityModal = function (stylistId, stylistName) {
  activeClientModalStylistId = stylistId;
  const modal = document.getElementById('clientAvailModal');
  const title = document.getElementById('clientModalTitle');
  const dateInput = document.getElementById('clientModalDateInput');

  if (title) title.textContent = `${stylistName} — Live Availability & Shifts`;

  const today = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.value = today;
    dateInput.min = today;
  }

  if (modal) modal.classList.add('active');
  window.loadClientModalData();
};

window.closeClientAvailModal = function () {
  const modal = document.getElementById('clientAvailModal');
  if (modal) modal.classList.remove('active');
};

window.setClientModalDate = function (offsetDays) {
  const dateInput = document.getElementById('clientModalDateInput');
  if (!dateInput) return;
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  dateInput.value = d.toISOString().split('T')[0];
  window.loadClientModalData();
};

window.loadClientModalData = function () {
  if (!activeClientModalStylistId) return;
  const dateInput = document.getElementById('clientModalDateInput');
  const summaryEl = document.getElementById('clientModalSummary');
  const slotsEl = document.getElementById('clientModalSlots');
  if (!dateInput || !summaryEl || !slotsEl) return;

  const dateVal = dateInput.value;
  const data = window.SalonStore.getSpecialistAvailability(activeClientModalStylistId, dateVal);
  if (!data) return;

  const w = data.stylist;
  summaryEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <h4 style="margin: 0 0 0.25rem 0; font-size: 1.15rem; color: var(--text-dark);">${w.name}</h4>
        <div style="font-size: 0.85rem; color: var(--text-muted);">${w.title}</div>
        <div style="font-size: 0.82rem; margin-top: 0.25rem;">🗓 Scheduled Days: <strong>${w.available_days}</strong></div>
      </div>
      <div style="text-align: right;">
        <span class="shift-badge">⏰ ${w.shift_start} – ${w.shift_end}</span><br>
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--gold-dark);">${w.shift_type || 'Full Day'}</span>
      </div>
    </div>
    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); font-size: 0.88rem;">
      Status on <strong>${data.formatted_date}</strong>: 
      ${data.is_working_day 
        ? `<strong style="color: #17663D;">● Working Shift (${data.available_count} Open Slots, ${data.booked_count} Booked)</strong>` 
        : `<strong style="color: #C03737;">○ Off-Duty (Next Available: ${data.next_working_date || 'N/A'})</strong>`}
    </div>
  `;

  slotsEl.innerHTML = data.slots.map(slot => `
    <div class="avail-slot-btn is-${slot.status.replace('_', '-')}" title="${slot.reason}">
      <span>${slot.time}</span>
      <span class="slot-status-text">${slot.status.replace('_', ' ')}</span>
    </div>
  `).join('');

  const bookBtn = document.getElementById('clientModalBookBtn');
  if (bookBtn) {
    bookBtn.href = `book.html?stylist_id=${w.id}&date=${data.date}`;
  }
};
