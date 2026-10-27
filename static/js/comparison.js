/* ==========================================================================
   BEFORE & AFTER ARTISTRY — SIDE-BY-SIDE GALLERY & FILTERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTransformationFilters();
});

function initTransformationFilters() {
  const filterBtns = document.querySelectorAll('.transformations-filter-btn');
  const cards = document.querySelectorAll('.transformation-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-category');

      cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory === filterCategory) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}
