/**
 * utils.js
 * ---------
 * Shared utility functions used by both app.js and hotel.js.
 * Keep this file pure — no DOM side-effects, no API calls.
 * Exception: showSpinner / hideSpinner / showError manipulate a
 * pre-defined container element passed in as an argument.
 */

/* ─────────────────────────────────────────
   FORMATTING HELPERS
───────────────────────────────────────── */

/**
 * Format a raw price string/number to Indian Rupee format.
 * e.g. "8531.24" → "₹8,531"
 *
 * @param {string|number} price
 * @returns {string}
 */
function formatPrice(price) {
  const num = parseFloat(price);
  if (isNaN(num)) return '₹—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Render star icons for a given rating (0–5).
 * Returns an HTML string of filled, half, and empty stars.
 *
 * @param {number} rating
 * @returns {string} HTML string
 */
function renderStars(rating) {
  const maxStars = 5;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = maxStars - full - half;

  const star = (type) => {
    const map = {
      full: '★',
      half: '⯨',
      empty: '☆',
    };
    return `<span class="star star--${type}" aria-hidden="true">${map[type]}</span>`;
  };

  const stars =
    Array(full).fill(star('full')).join('') +
    Array(half).fill(star('half')).join('') +
    Array(empty).fill(star('empty')).join('');

  return `<span class="stars" role="img" aria-label="Rating: ${rating} out of 5">${stars}</span>`;
}

/**
 * Truncate a string to a max length and append "…".
 *
 * @param {string} text
 * @param {number} [maxLength=120]
 * @returns {string}
 */
function truncateText(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Safely encode a hotel object for URL storage.
 * Used to pass hotel data between index.html → hotel.html via sessionStorage.
 *
 * @param {Object} hotel
 */
function storeHotel(hotel) {
  sessionStorage.setItem('selectedHotel', JSON.stringify(hotel));
}

/**
 * Retrieve a stored hotel object from sessionStorage.
 *
 * @returns {Object|null}
 */
function retrieveHotel() {
  try {
    const raw = sessionStorage.getItem('selectedHotel');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────
   LOADING / ERROR UI HELPERS
───────────────────────────────────────── */

/**
 * Show an animated loading spinner inside `container`.
 * Clears previous content.
 *
 * @param {HTMLElement} container
 */
function showSpinner(container) {
  container.innerHTML = `
    <div class="spinner-wrapper" role="status" aria-live="polite">
      <div class="spinner">
        <div class="spinner__ring"></div>
        <div class="spinner__ring"></div>
        <div class="spinner__ring"></div>
      </div>
      <p class="spinner__text">Finding the best hotels for you…</p>
    </div>
  `;
}

/**
 * Remove the spinner from `container`.
 *
 * @param {HTMLElement} container
 */
function hideSpinner(container) {
  const spinner = container.querySelector('.spinner-wrapper');
  if (spinner) spinner.remove();
}

/**
 * Show a user-friendly error message inside `container`.
 *
 * @param {HTMLElement} container
 * @param {string} [message]
 */
function showError(container, message = 'Something went wrong. Please try again.') {
  container.innerHTML = `
    <div class="error-state" role="alert">
      <div class="error-state__icon">⚠️</div>
      <h2 class="error-state__title">Oops!</h2>
      <p class="error-state__message">${message}</p>
      <button class="btn btn--primary" onclick="location.reload()">
        Try Again
      </button>
    </div>
  `;
}

/**
 * Show an empty-state message when no hotels match the filters.
 *
 * @param {HTMLElement} container
 */
function showEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">🏨</div>
      <h2 class="empty-state__title">No hotels found</h2>
      <p class="empty-state__message">
        Try adjusting your search or filter criteria.
      </p>
    </div>
  `;
}

/* ─────────────────────────────────────────
   DEBOUNCE
───────────────────────────────────────── */

/**
 * Classic debounce — delays execution until `delay` ms after last call.
 *
 * @param {Function} fn
 * @param {number} [delay=400]
 * @returns {Function}
 */
function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get the badge colour class for a rating value.
 *
 * @param {number} rating
 * @returns {string} CSS class name
 */
function ratingClass(rating) {
  if (rating >= 4.5) return 'badge--excellent';
  if (rating >= 3.5) return 'badge--good';
  if (rating >= 2.5) return 'badge--average';
  return 'badge--poor';
}

export {
  formatPrice,
  renderStars,
  truncateText,
  storeHotel,
  retrieveHotel,
  showSpinner,
  hideSpinner,
  showError,
  showEmptyState,
  debounce,
  ratingClass,
};
