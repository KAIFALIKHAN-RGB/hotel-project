/**
 * hotel.js
 * ---------
 * Controller for hotel.html — the individual hotel detail page.
 *
 * Responsibilities:
 *  - Read hotel ID from the URL query string (?id=X)
 *  - Retrieve hotel data from sessionStorage (set by app.js on card click)
 *  - Fall back to a fresh API fetch if sessionStorage is empty
 *  - Render full hotel details: image gallery, info panel, description
 *  - Handle gallery navigation (prev/next + thumbnail strip)
 *  - Handle "Back" button
 */

import { getHotelById } from './api.js';
import {
  formatPrice,
  renderStars,
  retrieveHotel,
  showError,
  ratingClass,
} from './utils.js';

/* ─────────────────────────────────────────
   DOM REFERENCES
───────────────────────────────────────── */
const detailContainer    = document.getElementById('hotel-detail');
const galleryMain        = document.getElementById('gallery-main');
const galleryThumbs      = document.getElementById('gallery-thumbs');
const prevBtn            = document.getElementById('gallery-prev');
const nextBtn            = document.getElementById('gallery-next');
const backBtn            = document.getElementById('back-btn');

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let photos = [];
let currentPhotoIndex = 0;

/* ─────────────────────────────────────────
   GALLERY LOGIC
───────────────────────────────────────── */

/**
 * Display the photo at `index` in the main gallery slot.
 * Updates active state on thumbnails.
 *
 * @param {number} index
 */
function showPhoto(index) {
  if (!photos.length || !galleryMain) return;

  // Clamp index
  currentPhotoIndex = (index + photos.length) % photos.length;

  // Animate out → in
  galleryMain.classList.add('gallery__main--fade');
  setTimeout(() => {
    galleryMain.src = photos[currentPhotoIndex];
    galleryMain.alt = `Hotel photo ${currentPhotoIndex + 1} of ${photos.length}`;
    galleryMain.classList.remove('gallery__main--fade');
  }, 200);

  // Update active thumbnail
  if (galleryThumbs) {
    const thumbs = galleryThumbs.querySelectorAll('.gallery__thumb');
    thumbs.forEach((t, i) => {
      t.classList.toggle('gallery__thumb--active', i === currentPhotoIndex);
    });
  }
}

/**
 * Build and inject the thumbnail strip.
 *
 * @param {string[]} photoUrls
 */
function buildThumbnails(photoUrls) {
  if (!galleryThumbs) return;

  galleryThumbs.innerHTML = photoUrls
    .map(
      (url, i) => `
      <button
        class="gallery__thumb ${i === 0 ? 'gallery__thumb--active' : ''}"
        data-index="${i}"
        aria-label="View photo ${i + 1}"
        style="background-image: url('${url}')"
      ></button>
    `
    )
    .join('');

  // Attach click listeners
  galleryThumbs.querySelectorAll('.gallery__thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      showPhoto(parseInt(btn.dataset.index, 10));
    });
  });
}

/**
 * Wire up prev/next buttons and keyboard navigation.
 */
function initGalleryControls() {
  prevBtn?.addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
  nextBtn?.addEventListener('click', () => showPhoto(currentPhotoIndex + 1));

  // Keyboard arrows
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  showPhoto(currentPhotoIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
  });
}

/* ─────────────────────────────────────────
   HOTEL DETAIL RENDERING
───────────────────────────────────────── */

/**
 * Render all hotel details into the page.
 *
 * @param {Object} hotel
 */
function renderHotelDetail(hotel) {
  const { name, location, price, rating, description, photos: hotelPhotos } = hotel;

  photos = hotelPhotos || [];

  // Inject page title
  document.title = `${name} — StayLux`;

  // Update meta description for SEO
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', description.slice(0, 155));

  // ── Hotel header info ──
  const nameEl        = document.getElementById('detail-name');
  const locationEl    = document.getElementById('detail-location');
  const ratingEl      = document.getElementById('detail-rating');
  const priceEl       = document.getElementById('detail-price');
  const descEl        = document.getElementById('detail-description');
  const badgeEl       = document.getElementById('detail-badge');

  if (nameEl)     nameEl.textContent     = name;
  // Target the inner <span> so the 📍 emoji icon span is preserved
  if (locationEl) {
    const locTextSpan = locationEl.querySelector('span:last-child');
    if (locTextSpan) locTextSpan.textContent = location;
    else locationEl.textContent = location;
  }
  if (ratingEl)   ratingEl.innerHTML     = `${renderStars(rating)} <span class="detail__rating-num">${rating.toFixed(1)}</span>`;
  if (priceEl)    priceEl.textContent    = `${formatPrice(price)} / night`;
  if (descEl)     descEl.textContent     = description;
  if (badgeEl) {
    badgeEl.textContent  = rating.toFixed(1);
    badgeEl.className    = `detail__badge ${ratingClass(rating)}`;
  }

  // ── Gallery ──
  if (photos.length) {
    buildThumbnails(photos);
    showPhoto(0);
    initGalleryControls();
  } else {
    // Hide gallery navigation if no extra photos
    prevBtn?.classList.add('hidden');
    nextBtn?.classList.add('hidden');
  }

  // Reveal the content (remove loading state)
  detailContainer?.classList.add('loaded');
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */

async function init() {
  // Add loading class — does NOT touch innerHTML so DOM refs stay valid
  detailContainer?.classList.add('detail-main--loading');

  // Parse hotel ID from URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    detailContainer?.classList.remove('detail-main--loading');
    showError(detailContainer, 'No hotel ID found in the URL.');
    return;
  }

  // Try sessionStorage first (fast path)
  let hotel = retrieveHotel();

  // Validate that cached hotel matches the URL id
  if (!hotel || String(hotel.id) !== String(id)) {
    try {
      hotel = await getHotelById(id);
    } catch (err) {
      console.error('[hotel.js] Failed to fetch hotel:', err);
      showError(detailContainer, 'Could not load hotel details. Please try again.');
      return;
    }
  }

  if (!hotel) {
    detailContainer?.classList.remove('detail-main--loading');
    showError(detailContainer, `Hotel with ID ${id} not found.`);
    return;
  }

  detailContainer?.classList.remove('detail-main--loading');
  renderHotelDetail(hotel);
}

/* ─────────────────────────────────────────
   BACK BUTTON
───────────────────────────────────────── */
function initBackButton() {
  backBtn?.addEventListener('click', () => {
    // Go back if there's history, else go home
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
      history.back();
    } else {
      window.location.href = 'index.html';
    }
  });
}

/* ─────────────────────────────────────────
   MOBILE MENU (shared with index)
───────────────────────────────────────── */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks      = document.getElementById('nav-links');

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
   SCROLL-TO-TOP
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

document.addEventListener('DOMContentLoaded', () => {
  initBackButton();
  initMobileMenu();
  initScrollToTop();
  init();
});
