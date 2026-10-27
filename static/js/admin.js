/* ==========================================================================
   MAISON DE BEAUTÉ — SALON STAFF DASHBOARD & MANAGER EXECUTIVE SUITE
   Pure Client-Side JavaScript Architecture
   ========================================================================== */

let isManagerUnlocked = false;
let currentAdminTab = 'appointments';
let currentManagerSubTab = 'services';
let activeModalWorkerId = null;

const SERVICE_PHOTO_PRESETS = {
  hair: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
  nails: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80',
  barber: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
  makeup: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
  spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80'
};

document.addEventListener('DOMContentLoaded', () => {
  isManagerUnlocked = window.SalonStore.isManagerAuthenticated();

  renderMetrics();
  renderAppointmentsTable();
  renderManagerServices();
  renderManagerWorkers();

  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const targetTab = urlParams.get('tab');
  if (targetTab === 'manager' || targetTab === 'workers' || targetTab === 'services') {
    switchAdminTab('manager');
    if (targetTab === 'workers') {
      switchManagerSubTab('workers');
    }
  }

  // Setup appointment filters
  const filterForm = document.getElementById('appointmentFilterForm');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('filterDate').value;
      const statusVal = document.getElementById('filterStatus').value;
      renderAppointmentsTable(dateVal, statusVal);
    });
  }

  // Checkbox styling listener
  document.querySelectorAll('.day-checkbox-label input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const parent = cb.closest('.day-checkbox-label');
      if (parent) {
        if (cb.checked) parent.classList.add('checked');
        else parent.classList.remove('checked');
      }
    });
  });
});

// ----------------- METRICS -----------------
function renderMetrics() {
  const m = window.SalonStore.getMetrics();
  const elTotal = document.getElementById('metricTotalBookings');
  const elToday = document.getElementById('metricTodayBookings');
  const elRev = document.getElementById('metricTotalRevenue');
  const elWorkers = document.getElementById('metricActiveWorkers');
  const elTabCount = document.getElementById('tabAppointmentCount');

  if (elTotal) elTotal.textContent = m.total_bookings;
  if (elToday) elToday.textContent = m.today_bookings;
  if (elRev) elRev.textContent = `$${m.total_revenue.toFixed(2)}`;
  if (elWorkers) {
    elWorkers.innerHTML = `${m.active_stylists} <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: 500;">/ ${m.total_stylists}</span>`;
  }
  if (elTabCount) elTabCount.textContent = m.total_bookings;
}

// ----------------- APPOINTMENTS TABLE -----------------
function renderAppointmentsTable(filterDate = '', filterStatus = '') {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  const bookings = window.SalonStore.getBookings(filterDate, filterStatus);

  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No appointments found matching your filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>
        <strong style="font-family: monospace; font-size: 0.95rem; color: var(--gold-dark);">${escapeHtml(b.booking_code)}</strong>
      </td>
      <td>
        <strong>${escapeHtml(b.appointment_date)}</strong><br>
        <small class="text-muted">${escapeHtml(b.appointment_time)}</small>
      </td>
      <td>
        <strong>${escapeHtml(b.customer_name)}</strong><br>
        <small class="text-muted">${escapeHtml(b.customer_email)} • ${escapeHtml(b.customer_phone)}</small>
        ${b.notes ? `<br><small style="color: #666; font-style: italic;">Note: ${escapeHtml(b.notes)}</small>` : ''}
      </td>
      <td>${escapeHtml(b.service_name)}</td>
      <td><strong>${escapeHtml(b.stylist_name)}</strong></td>
      <td style="font-weight: 700; color: var(--gold-dark);">$${Number(b.total_price).toFixed(2)}</td>
      <td>
        <span id="status-badge-${b.id}" class="status-badge status-${b.status}">
          ${escapeHtml(b.status)}
        </span>
      </td>
      <td>
        <select class="custom-input admin-status-select" onchange="handleStatusChange(${b.id}, this.value)" style="padding: 0.4rem 0.6rem; font-size: 0.82rem; width: auto;">
          <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

window.handleStatusChange = function (bookingId, newStatus) {
  const res = window.SalonStore.updateBookingStatus(bookingId, newStatus);
  if (res.success) {
    window.showToast(`Booking marked as ${newStatus}`, 'success');
    const badge = document.getElementById(`status-badge-${bookingId}`);
    if (badge) {
      badge.className = `status-badge status-${newStatus}`;
      badge.textContent = newStatus;
    }
    renderMetrics();
  } else {
    alert(res.message || 'Failed to update status');
  }
};

window.resetAppointmentFilters = function () {
  document.getElementById('filterDate').value = '';
  document.getElementById('filterStatus').value = '';
  renderAppointmentsTable();
};

// ----------------- TAB SWITCHING -----------------
window.switchAdminTab = function (tabName) {
  currentAdminTab = tabName;
  const btnApp = document.getElementById('tabBtnAppointments');
  const btnMgr = document.getElementById('tabBtnManager');
  const contentApp = document.getElementById('tabContentAppointments');
  const contentMgr = document.getElementById('tabContentManager');

  if (tabName === 'manager') {
    btnMgr.classList.add('active');
    btnApp.classList.remove('active');
    contentMgr.style.display = 'block';
    contentApp.style.display = 'none';

    const gateEl = document.getElementById('managerAuthGate');
    const wsEl = document.getElementById('managerWorkspace');
    if (isManagerUnlocked) {
      gateEl.style.display = 'none';
      wsEl.style.display = 'block';
    } else {
      gateEl.style.display = 'flex';
      wsEl.style.display = 'none';
      setTimeout(() => {
        const passInp = document.getElementById('managerPassInput');
        if (passInp) passInp.focus();
      }, 100);
    }
  } else {
    btnApp.classList.add('active');
    btnMgr.classList.remove('active');
    contentApp.style.display = 'block';
    contentMgr.style.display = 'none';
  }
};

window.switchManagerSubTab = function (subTabName) {
  currentManagerSubTab = subTabName;
  const btnServices = document.getElementById('subBtnServices');
  const btnWorkers = document.getElementById('subBtnWorkers');
  const subServices = document.getElementById('managerSubServices');
  const subWorkers = document.getElementById('managerSubWorkers');

  if (subTabName === 'workers') {
    btnWorkers.classList.add('active');
    btnServices.classList.remove('active');
    subWorkers.style.display = 'block';
    subServices.style.display = 'none';
  } else {
    btnServices.classList.add('active');
    btnWorkers.classList.remove('active');
    subServices.style.display = 'block';
    subWorkers.style.display = 'none';
  }
};

// ----------------- MANAGER AUTH -----------------
window.submitManagerPassword = function (e) {
  e.preventDefault();
  const inputEl = document.getElementById('managerPassInput');
  const errEl = document.getElementById('managerAuthError');
  const pass = inputEl.value.trim();

  errEl.style.display = 'none';

  if (window.SalonStore.verifyManagerPassword(pass)) {
    isManagerUnlocked = true;
    document.getElementById('managerTabLockBadge').innerHTML = '🔓 Unlocked';
    document.getElementById('managerAuthGate').style.display = 'none';
    document.getElementById('managerWorkspace').style.display = 'block';
    inputEl.value = '';
    window.showToast('Executive Suite unlocked', 'success');
  } else {
    errEl.textContent = 'Invalid manager passcode. Hint: ceo2026';
    errEl.style.display = 'block';
    inputEl.select();
  }
};

window.lockManagerSuite = function () {
  window.SalonStore.logoutManager();
  isManagerUnlocked = false;
  document.getElementById('managerTabLockBadge').innerHTML = '🔒 Password Required';
  document.getElementById('managerAuthGate').style.display = 'flex';
  document.getElementById('managerWorkspace').style.display = 'none';
  window.showToast('Manager Suite locked', 'info');
};

// ----------------- SERVICES MANAGEMENT -----------------
function renderManagerServices(filterCategory = 'all') {
  const grid = document.getElementById('managerServicesGrid');
  const filtersContainer = document.getElementById('managerServiceFilters');
  if (!grid) return;

  const services = window.SalonStore.getServices();
  const categories = window.SalonStore.getCategories();

  // Render filter buttons
  if (filtersContainer) {
    filtersContainer.innerHTML = `
      <button type="button" class="filter-btn ${filterCategory === 'all' ? 'active' : ''}" onclick="filterManagerServices('all', this)">All Treatments</button>
      ${categories.map(c => `
        <button type="button" class="filter-btn ${filterCategory === c ? 'active' : ''}" onclick="filterManagerServices('${escapeHtml(c)}', this)">${escapeHtml(c)}</button>
      `).join('')}
    `;
  }

  // Update tab sub-btn count
  const btnServices = document.getElementById('subBtnServices');
  if (btnServices) {
    btnServices.innerHTML = `<span>✨</span> Salon Services & Pricing Catalog (${services.length})`;
  }

  const displayed = filterCategory === 'all' ? services : services.filter(s => s.category === filterCategory);

  grid.innerHTML = displayed.map(s => `
    <div class="service-mgmt-card" data-category="${escapeHtml(s.category)}" id="service-card-${s.id}">
      <div class="service-mgmt-image">
        <img src="${s.image_url}" alt="${escapeHtml(s.name)}" loading="lazy">
        ${s.badge ? `
          <span class="specialty-tag" style="position: absolute; top: 12px; left: 12px; background: rgba(18, 19, 22, 0.85); color: var(--gold-light); border: 1px solid rgba(232, 207, 130, 0.3); font-size: 11px;">
            ${escapeHtml(s.badge)}
          </span>
        ` : ''}
        ${s.is_popular === 1 ? `
          <span class="status-badge status-confirmed" style="position: absolute; top: 12px; right: 12px; font-size: 10px;">
            ★ Featured
          </span>
        ` : ''}
      </div>
      <div class="service-mgmt-body">
        <div class="service-mgmt-category">${escapeHtml(s.category)}</div>
        <div class="service-mgmt-title">${escapeHtml(s.name)}</div>
        <div class="service-mgmt-desc">${escapeHtml(s.description)}</div>
        
        <div class="service-mgmt-meta">
          <div class="service-mgmt-price">$${Number(s.price).toFixed(2)}</div>
          <div class="service-mgmt-duration">⏱ ${s.duration_min} mins</div>
        </div>

        <div class="service-mgmt-actions">
          <button type="button" class="btn btn-outline btn-sm" style="flex: 1;" onclick='openEditServiceModal(${JSON.stringify(s)})'>
            ✏ Edit Details
          </button>
          <button type="button" class="btn btn-sm" style="background: #FFF0F0; color: #C03737; border: 1px solid #FFD0D0;" onclick="deleteService(${s.id}, '${escapeHtml(s.name)}')">
            🗑 Remove
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.filterManagerServices = function (cat, btn) {
  renderManagerServices(cat);
};

window.openAddServiceModal = function () {
  populateCategorySelect('add');
  openModal('addServiceModal');
};

window.submitAddService = function (e) {
  e.preventDefault();
  const form = e.target;
  let category = form.category_select.value;
  if (category === '__custom__') {
    category = form.category_custom.value.trim();
  }

  const payload = {
    name: form.name.value.trim(),
    category: category,
    price: parseFloat(form.price.value),
    duration_min: parseInt(form.duration_min.value, 10),
    badge: form.badge.value.trim(),
    image_url: form.image_url.value.trim(),
    description: form.description.value.trim(),
    is_popular: form.is_popular.checked ? 1 : 0
  };

  window.SalonStore.addService(payload);
  closeModal('addServiceModal');
  form.reset();
  renderManagerServices();
  window.showToast(`Service "${payload.name}" added successfully!`, 'success');
};

window.openEditServiceModal = function (service) {
  document.getElementById('editServiceId').value = service.id;
  document.getElementById('editServiceName').value = service.name;
  document.getElementById('editServicePrice').value = service.price;
  document.getElementById('editServiceDuration').value = service.duration_min;
  document.getElementById('editServiceBadge').value = service.badge || '';
  document.getElementById('editServiceImgInput').value = service.image_url || '';
  document.getElementById('editServiceDesc').value = service.description || '';
  document.getElementById('editServiceIsPopular').checked = service.is_popular === 1;

  populateCategorySelect('edit', service.category);
  openModal('editServiceModal');
};

window.submitEditService = function (e) {
  e.preventDefault();
  const form = e.target;
  let category = form.category_select.value;
  if (category === '__custom__') {
    category = form.category_custom.value.trim();
  }

  const payload = {
    id: parseInt(document.getElementById('editServiceId').value, 10),
    name: document.getElementById('editServiceName').value.trim(),
    category: category,
    price: parseFloat(document.getElementById('editServicePrice').value),
    duration_min: parseInt(document.getElementById('editServiceDuration').value, 10),
    badge: document.getElementById('editServiceBadge').value.trim(),
    image_url: document.getElementById('editServiceImgInput').value.trim(),
    description: document.getElementById('editServiceDesc').value.trim(),
    is_popular: document.getElementById('editServiceIsPopular').checked ? 1 : 0
  };

  window.SalonStore.updateService(payload);
  closeModal('editServiceModal');
  renderManagerServices();
  window.showToast(`Service "${payload.name}" updated successfully!`, 'success');
};

window.deleteService = function (id, name) {
  if (!confirm(`Are you sure you want to delete the treatment "${name}"?`)) return;
  window.SalonStore.deleteService(id);
  renderManagerServices();
  window.showToast(`Service "${name}" removed.`, 'info');
};

function populateCategorySelect(formType, selectedCat = '') {
  const select = document.getElementById(`${formType}ServiceCatSelect`);
  if (!select) return;

  const categories = window.SalonStore.getCategories();
  let html = categories.map(c => `<option value="${escapeHtml(c)}" ${c === selectedCat ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
  html += `<option value="__custom__" ${selectedCat && !categories.includes(selectedCat) ? 'selected' : ''}>+ Enter New Category...</option>`;
  select.innerHTML = html;

  const customInput = document.getElementById(`${formType}ServiceCatCustom`);
  if (selectedCat && !categories.includes(selectedCat)) {
    customInput.style.display = 'block';
    customInput.value = selectedCat;
  } else {
    customInput.style.display = 'none';
  }
}

window.toggleCustomCategory = function (formType) {
  const select = document.getElementById(`${formType}ServiceCatSelect`);
  const custom = document.getElementById(`${formType}ServiceCatCustom`);
  if (select.value === '__custom__') {
    custom.style.display = 'block';
    custom.required = true;
    custom.focus();
  } else {
    custom.style.display = 'none';
    custom.required = false;
  }
};

window.setServiceImgPreset = function (formType, presetKey) {
  const input = document.getElementById(`${formType}ServiceImgInput`);
  if (input && SERVICE_PHOTO_PRESETS[presetKey]) {
    input.value = SERVICE_PHOTO_PRESETS[presetKey];
  }
};

// ----------------- WORKERS MANAGEMENT -----------------
function renderManagerWorkers() {
  const container = document.getElementById('workerCardsContainer');
  if (!container) return;

  const stylists = window.SalonStore.getStylists();

  const btnWorkers = document.getElementById('subBtnWorkers');
  if (btnWorkers) {
    btnWorkers.innerHTML = `<span>👥</span> Salon Staff & Personnel Roster (${stylists.length})`;
  }

  container.innerHTML = stylists.map(worker => `
    <div class="worker-card" id="worker-card-${worker.id}">
      <div class="worker-header">
        <img src="${worker.image_url}" alt="${escapeHtml(worker.name)}" class="worker-avatar">
        <div class="worker-identity">
          <h3>${escapeHtml(worker.name)}</h3>
          <div class="worker-title">${escapeHtml(worker.title)}</div>
          <div class="worker-meta">
            <span>★ ${Number(worker.rating).toFixed(2)} (${worker.reviews_count})</span> • 
            <span>${worker.experience_years} yrs master exp</span>
          </div>
        </div>
      </div>

      <div class="worker-shift-box">
        <div class="worker-shift-row">
          <span style="font-weight: 600; color: var(--text-muted);">Working Shift:</span>
          <span class="shift-badge">⏰ ${escapeHtml(worker.shift_start || '09:00 AM')} – ${escapeHtml(worker.shift_end || '07:00 PM')}</span>
        </div>
        <div class="worker-shift-row" style="margin-top: 0.35rem;">
          <span style="font-weight: 600; color: var(--text-muted);">Shift Schedule:</span>
          <span style="font-weight: 700; color: var(--gold-dark); font-size: 0.8rem;">${escapeHtml(worker.shift_type || 'Full Day')}</span>
        </div>
        <div class="worker-shift-row" style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed var(--border-subtle);">
          <span style="font-weight: 600; color: var(--text-muted);">Scheduled Days:</span>
          <span class="days-list-badge">🗓 ${escapeHtml(worker.available_days)}</span>
        </div>
        <div class="worker-shift-row" style="margin-top: 0.35rem;">
          <span style="font-weight: 600; color: var(--text-muted);">Status:</span>
          <span id="worker-status-badge-${worker.id}" class="status-badge ${worker.is_active === 1 ? 'status-confirmed' : 'status-cancelled'}">
            ${worker.is_active === 1 ? 'Active on Duty' : 'Inactive / Off'}
          </span>
        </div>
      </div>

      <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700; text-transform: uppercase;">
        Specialties:
      </div>
      <div class="stylist-specialties" style="margin-bottom: 1rem;">
        ${(worker.specialties || '').split(',').map(sp => `
          <span class="specialty-tag" style="font-size: 0.7rem; padding: 0.2rem 0.6rem;">${escapeHtml(sp.trim())}</span>
        `).join('')}
      </div>

      <div class="worker-actions">
        <button type="button" class="btn btn-outline btn-sm" style="flex: 1;" onclick='openEditWorkerModal(${JSON.stringify(worker)})'>
          ✏ Edit Shift & Info
        </button>
        <button type="button" class="btn btn-dark btn-sm" style="flex: 1;" onclick="openWorkerScheduleModal(${worker.id}, '${escapeHtml(worker.name)}')">
          🗓 Check Slots
        </button>
        <button type="button" class="btn btn-sm" style="background: #EFEFEF; color: #333;" onclick="toggleWorkerStatus(${worker.id})">
          ${worker.is_active === 1 ? 'Pause' : 'Activate'}
        </button>
        <button type="button" class="btn btn-sm" style="background: #FFF0F0; color: #C03737;" onclick="deleteWorker(${worker.id}, '${escapeHtml(worker.name)}')">
          🗑 Remove
        </button>
      </div>
    </div>
  `).join('');
}

window.openAddWorkerModal = function () {
  openModal('addWorkerModal');
};

window.submitAddWorker = function (e) {
  e.preventDefault();
  const form = e.target;
  const daysChecked = Array.from(form.querySelectorAll('input[name="days"]:checked')).map(cb => cb.value);

  const payload = {
    name: form.name.value.trim(),
    title: form.title.value.trim(),
    experience_years: parseInt(form.experience_years.value, 10) || 3,
    rating: parseFloat(form.rating.value) || 5.0,
    reviews_count: 12,
    image_url: form.image_url.value.trim() || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
    specialties: form.specialties.value.trim() || 'Bespoke Styling, Precision Cuts',
    bio: form.bio.value.trim(),
    shift_start: form.shift_start.value.trim() || '09:00 AM',
    shift_end: form.shift_end.value.trim() || '07:00 PM',
    shift_type: form.shift_type.value.trim() || 'Full Day Shift',
    available_days: daysChecked.join(',') || 'Mon,Tue,Wed,Thu,Fri,Sat',
    is_active: 1
  };

  window.SalonStore.addStylist(payload);
  closeModal('addWorkerModal');
  form.reset();
  renderManagerWorkers();
  renderMetrics();
  window.showToast(`Worker "${payload.name}" added successfully!`, 'success');
};

window.openEditWorkerModal = function (worker) {
  document.getElementById('editWorkerId').value = worker.id;
  document.getElementById('editWorkerName').value = worker.name;
  document.getElementById('editWorkerTitle').value = worker.title;
  document.getElementById('editWorkerExp').value = worker.experience_years;
  document.getElementById('editWorkerRating').value = worker.rating;
  document.getElementById('editWorkerImage').value = worker.image_url;
  document.getElementById('editWorkerSpecialties').value = worker.specialties;
  document.getElementById('editWorkerBio').value = worker.bio || '';
  document.getElementById('editShiftStart').value = worker.shift_start || '09:00 AM';
  document.getElementById('editShiftEnd').value = worker.shift_end || '07:00 PM';
  document.getElementById('editShiftType').value = worker.shift_type || 'Full Day';
  document.getElementById('editWorkerActive').value = worker.is_active !== undefined ? worker.is_active : 1;

  const workerDays = (worker.available_days || '').split(',').map(d => d.trim());
  const checkboxes = document.querySelectorAll('input[name="edit_days"]');
  checkboxes.forEach(cb => {
    cb.checked = workerDays.includes(cb.value);
    const parent = cb.closest('.day-checkbox-label');
    if (parent) {
      if (cb.checked) parent.classList.add('checked');
      else parent.classList.remove('checked');
    }
  });

  openModal('editWorkerModal');
};

window.submitEditWorker = function (e) {
  e.preventDefault();
  const form = e.target;
  const daysChecked = Array.from(form.querySelectorAll('input[name="edit_days"]:checked')).map(cb => cb.value);

  const payload = {
    id: parseInt(document.getElementById('editWorkerId').value, 10),
    name: document.getElementById('editWorkerName').value.trim(),
    title: document.getElementById('editWorkerTitle').value.trim(),
    experience_years: parseInt(document.getElementById('editWorkerExp').value, 10),
    rating: parseFloat(document.getElementById('editWorkerRating').value),
    image_url: document.getElementById('editWorkerImage').value.trim(),
    specialties: document.getElementById('editWorkerSpecialties').value.trim(),
    bio: document.getElementById('editWorkerBio').value.trim(),
    shift_start: document.getElementById('editShiftStart').value.trim(),
    shift_end: document.getElementById('editShiftEnd').value.trim(),
    shift_type: document.getElementById('editShiftType').value.trim(),
    available_days: daysChecked.join(',') || 'Mon,Tue,Wed,Thu,Fri,Sat',
    is_active: parseInt(document.getElementById('editWorkerActive').value, 10)
  };

  window.SalonStore.updateStylist(payload);
  closeModal('editWorkerModal');
  renderManagerWorkers();
  renderMetrics();
  window.showToast(`Worker "${payload.name}" updated successfully!`, 'success');
};

window.toggleWorkerStatus = function (id) {
  const updated = window.SalonStore.toggleStylistStatus(id);
  if (updated) {
    renderManagerWorkers();
    renderMetrics();
    window.showToast(`Status changed to ${updated.is_active === 1 ? 'Active' : 'Inactive'}`, 'info');
  }
};

window.deleteWorker = function (id, name) {
  if (!confirm(`Are you sure you want to remove ${name} from your staff?`)) return;
  window.SalonStore.deleteStylist(id);
  renderManagerWorkers();
  renderMetrics();
  window.showToast(`Staff member "${name}" removed.`, 'info');
};

// ----------------- SHIFT PRESET HELPERS -----------------
const SHIFT_PRESETS = {
  full: { start: '09:00 AM', end: '07:00 PM', desc: 'Full Day Shift (9:00 AM - 7:00 PM)' },
  morning: { start: '09:00 AM', end: '02:30 PM', desc: 'Morning Shift (9:00 AM - 2:30 PM)' },
  afternoon: { start: '01:00 PM', end: '07:00 PM', desc: 'Afternoon & Evening (1:00 PM - 7:00 PM)' },
  midday: { start: '11:00 AM', end: '05:00 PM', desc: 'Midday Shift (11:00 AM - 5:00 PM)' }
};

window.applyShiftPreset = function (formType) {
  const presetKey = document.getElementById(`${formType}ShiftPreset`).value;
  if (SHIFT_PRESETS[presetKey]) {
    document.getElementById(`${formType}ShiftStart`).value = SHIFT_PRESETS[presetKey].start;
    document.getElementById(`${formType}ShiftEnd`).value = SHIFT_PRESETS[presetKey].end;
    document.getElementById(`${formType}ShiftType`).value = SHIFT_PRESETS[presetKey].desc;
  }
};

// ----------------- LIVE SCHEDULE MODAL -----------------
window.openWorkerScheduleModal = function (workerId, workerName) {
  activeModalWorkerId = workerId;
  document.getElementById('scheduleModalTitle').textContent = `Schedule & Shifts: ${workerName}`;
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('scheduleModalDate');
  dateInput.value = today;
  dateInput.min = today;
  openModal('workerScheduleModal');
  window.loadModalSchedule();
};

window.loadModalSchedule = function () {
  if (!activeModalWorkerId) return;
  const dateVal = document.getElementById('scheduleModalDate').value;
  const detailsEl = document.getElementById('scheduleModalDetails');
  const slotsEl = document.getElementById('scheduleModalSlots');

  const data = window.SalonStore.getSpecialistAvailability(activeModalWorkerId, dateVal);
  if (!data) return;

  const w = data.stylist;
  detailsEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
      <div>
        <strong>${escapeHtml(w.name)}</strong> • ${escapeHtml(w.title)}<br>
        <small class="text-muted">🗓 Scheduled Days: ${escapeHtml(w.available_days)}</small>
      </div>
      <div style="text-align: right;">
        <span class="shift-badge">⏰ ${escapeHtml(w.shift_start)} - ${escapeHtml(w.shift_end)}</span><br>
        <small style="font-weight: 700; color: var(--gold-dark);">${escapeHtml(w.shift_type || 'Full Day')}</small>
      </div>
    </div>
    <div style="margin-top: 0.6rem; font-size: 0.85rem;">
      Status on <strong>${escapeHtml(data.formatted_date)}</strong>: 
      ${data.is_working_day 
        ? `<strong style="color: #17663D;">● Working Shift (${data.available_count} Open Slots, ${data.booked_count} Booked)</strong>` 
        : `<strong style="color: #C03737;">○ Off-Duty (Next Available: ${escapeHtml(data.next_working_date || 'N/A')})</strong>`}
    </div>
  `;

  slotsEl.innerHTML = data.slots.map(slot => `
    <div class="avail-slot-btn is-${slot.status.replace('_', '-')}" title="${slot.reason}">
      <span>${slot.time}</span>
      <span class="slot-status-text">${slot.status.replace('_', ' ')}</span>
    </div>
  `).join('');
};

// ----------------- MODAL HELPERS -----------------
window.openModal = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
};

window.closeModal = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
};

// Factory Reset Data
window.factoryResetData = function () {
  if (!confirm('Are you sure you want to restore default factory data? This will reset all bookings, staff, and services to original presets.')) return;
  window.SalonStore.resetToDefaults();
  renderMetrics();
  renderAppointmentsTable();
  renderManagerServices();
  renderManagerWorkers();
  window.showToast('Data restored to initial factory defaults.', 'success');
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
