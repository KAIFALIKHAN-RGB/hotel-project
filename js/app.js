/**
 * app.js
 * -------
 * Main page controller for index.html.
 *
 * Responsibilities:
 *  - Fetch hotels from the API on page load
 *  - Render hotel cards in the grid
 *  - Wire up the search input (debounced)
 *  - Wire up location filter, price range, rating range
 *  - Wire up sort select
 *  - Handle "View Details" card clicks → navigate to hotel.html
 *
 * All DOM queries are scoped to IDs defined in index.html.
 */

import { searchHotels } from './api.js';
import {
  formatPrice,
  renderStars,
  truncateText,
  storeHotel,
  showSpinner,
  showError,
  showEmptyState,
  debounce,
  ratingClass,
} from './utils.js';

/* ─────────────────────────────────────────
   DOM REFERENCES
───────────────────────────────────────── */
const hotelGrid        = document.getElementById('hotel-grid');
const searchInput      = document.getElementById('search-input');
const locationFilter   = document.getElementById('location-filter');
const sortSelect       = document.getElementById('sort-select');
const minPriceInput    = document.getElementById('min-price');
const maxPriceInput    = document.getElementById('max-price');
const minRatingInput   = document.getElementById('min-rating');
const resultsCount     = document.getElementById('results-count');
const clearFiltersBtn  = document.getElementById('clear-filters-btn');
const mobileMenuBtn    = document.getElementById('mobile-menu-btn');
const navLinks         = document.getElementById('nav-links');

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
/** @type {Array} Latest hotel list from the API */
let currentHotels = [];

/* ─────────────────────────────────────────
   CARD RENDERING
───────────────────────────────────────── */

/**
 * Build the HTML for a single hotel card.
 *
 * @param {Object} hotel
 * @returns {string} HTML string
 */
function buildHotelCard(hotel) {
  const { id, name, location, price, rating, thumbnail, description } = hotel;
  const stars = renderStars(rating);
  const formattedPrice = formatPrice(price);
  const shortDesc = truncateText(description, 110);
  const badgeClass = ratingClass(rating);

  return `
    <article class="hotel-card" data-id="${id}" tabindex="0" aria-label="${name}">
      <div class="hotel-card__image-wrapper">
        <img
          class="hotel-card__image"
          src="${thumbnail}"
          alt="${name} thumbnail"
          loading="lazy"
          onerror="this.src='assets/images/placeholder.svg'"
        />
        <div class="hotel-card__badge ${badgeClass}">${rating.toFixed(1)}</div>
      </div>
      <div class="hotel-card__body">
        <div class="hotel-card__location">
          <span class="hotel-card__location-icon">📍</span>
          <span>${location}</span>
        </div>
        <h2 class="hotel-card__name">${name}</h2>
        <div class="hotel-card__stars">${stars}</div>
        <p class="hotel-card__desc">${shortDesc}</p>
        <div class="hotel-card__footer">
          <div class="hotel-card__price">
            <span class="hotel-card__price-label">per night</span>
            <span class="hotel-card__price-value">${formattedPrice}</span>
          </div>
          <button
            class="btn btn--primary hotel-card__btn"
            data-id="${id}"
            aria-label="View details for ${name}"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render an array of hotels into the grid.
 *
 * @param {Array} hotels
 */
function renderHotels(hotels) {
  if (!hotels.length) {
    showEmptyState(hotelGrid);
    updateResultsCount(0);
    return;
  }

  hotelGrid.innerHTML = hotels
    .map((hotel) => buildHotelCard(hotel))
    .join('');

  updateResultsCount(hotels.length);
  attachCardListeners();
}

/**
 * Update the "X hotels found" counter in the UI.
 *
 * @param {number} count
 */
function updateResultsCount(count) {
  if (!resultsCount) return;
  resultsCount.textContent =
    count === 1 ? '1 hotel found' : `${count} hotels found`;
}

/* ─────────────────────────────────────────
   CARD CLICK → DETAIL PAGE
───────────────────────────────────────── */

/**
 * Attach click + keyboard listeners to every "View Details" button.
 * Stores the hotel in sessionStorage and navigates to hotel.html.
 */
function attachCardListeners() {
  const buttons = hotelGrid.querySelectorAll('.hotel-card__btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      const hotel = currentHotels.find((h) => h.id === id);
      if (hotel) {
        storeHotel(hotel);
        window.location.href = `hotel.html?id=${id}`;
      }
    });
  });

  // Also allow clicking the whole card
  const cards = hotelGrid.querySelectorAll('.hotel-card');
  cards.forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const btn = card.querySelector('.hotel-card__btn');
        if (btn) btn.click();
      }
    });
  });
}

/* ─────────────────────────────────────────
   DATA FETCHING
───────────────────────────────────────── */

/**
 * Read all current filter/sort/search values from the UI
 * and fetch matching hotels from the API.
 */
async function loadHotels() {
  showSpinner(hotelGrid);

  // Gather filter values
  const search    = searchInput?.value.trim()      || '';
  const location  = locationFilter?.value          || '';
  const orderBy   = sortSelect?.value              || '';
  const minPrice  = minPriceInput?.value            || '';
  const maxPrice  = maxPriceInput?.value            || '';
  const minRating = minRatingInput?.value           || '';

  try {
    const hotels = await searchHotels({
      search,
      location,
      orderBy,
      minPrice,
      maxPrice,
      minRating,
    });

    currentHotels = hotels;
    renderHotels(hotels);
  } catch (err) {
    console.error('[app.js] Failed to load hotels:', err);
    showError(hotelGrid, 'Failed to load hotels. Please check your connection and try again.');
  }
}

/* ─────────────────────────────────────────
   FILTER/SEARCH EVENT WIRING
───────────────────────────────────────── */

/** Debounced version for text input */
const debouncedLoad = debounce(loadHotels, 450);

function initEventListeners() {
  // Live search (debounced)
  searchInput?.addEventListener('input', debouncedLoad);

  // Dropdown filters — fire immediately
  locationFilter?.addEventListener('change', loadHotels);
  sortSelect?.addEventListener('change', loadHotels);

  // Price / rating range — debounced
  minPriceInput?.addEventListener('input', debouncedLoad);
  maxPriceInput?.addEventListener('input', debouncedLoad);
  minRatingInput?.addEventListener('change', loadHotels);

  // Clear all filters
  clearFiltersBtn?.addEventListener('click', () => {
    if (searchInput)    searchInput.value    = '';
    if (locationFilter) locationFilter.value = '';
    if (sortSelect)     sortSelect.value     = '';
    if (minPriceInput)  minPriceInput.value  = '';
    if (maxPriceInput)  maxPriceInput.value  = '';
    if (minRatingInput) minRatingInput.value = '';
    loadHotels();
  });

  // Mobile hamburger menu toggle
  mobileMenuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('nav__links--open');
    const isOpen = navLinks?.classList.contains('nav__links--open');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close mobile menu when a nav link is clicked
  navLinks?.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav__links--open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu when clicking outside the nav
  document.addEventListener('click', (e) => {
    if (navLinks?.classList.contains('nav__links--open') &&
        !navLinks.contains(e.target) &&
        !mobileMenuBtn?.contains(e.target)) {
      navLinks.classList.remove('nav__links--open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ─────────────────────────────────────────
   HERO STATS (animated counters)
───────────────────────────────────────── */

/**
 * Animate a number from 0 to `target` over `duration` ms.
 *
 * @param {HTMLElement} el
 * @param {number} target
 * @param {number} [duration=1500]
 */
function animateCounter(el, target, duration = 1500) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('en-IN');
  };
  requestAnimationFrame(step);
}

function initHeroCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  // Use IntersectionObserver so counters animate when they scroll into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────────────
   SCROLL-TO-TOP BUTTON
───────────────────────────────────────── */
function initScrollToTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initHeroCounters();
  initScrollToTop();
  loadHotels();        // Initial data load — no filters applied
});
