/**
 * api.js
 * -------
 * Single source of truth for all HTTP requests to the Hotels API.
 * Every function builds a URL with the correct query parameters and
 * returns a parsed JSON response (or throws on network / HTTP errors).
 *
 * API Base: https://demohotelsapi.pythonanywhere.com/hotels/
 *
 * Supported query parameters (server-side):
 *   search      - icontains match on name OR location
 *   location    - filter by exact city (case-insensitive on server)
 *   min_price   - price >= value
 *   max_price   - price <= value
 *   min_rating  - rating >= value
 *   max_rating  - rating <= value
 *   order_by    - field name; prefix "-" for descending (e.g. "-rating")
 *   limit       - number of results to return
 *   skip        - offset (for pagination)
 */

const API_BASE = 'https://demohotelsapi.pythonanywhere.com/hotels/';

/**
 * Core fetch wrapper.
 * Builds a URL from the base + query-param object, fetches, and returns data[].
 *
 * @param {Object} params - Key/value pairs to append as query parameters.
 * @returns {Promise<Array>} Resolves to the `data` array from the API response.
 * @throws {Error} On network failure or non-2xx status.
 */
async function fetchHotels(params = {}) {
  const url = new URL(API_BASE);

  // Append only defined, non-empty parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  // The API wraps results in a "data" array
  if (!Array.isArray(json.data)) {
    throw new Error('Unexpected API response format.');
  }

  return json.data;
}

/**
 * Fetch all hotels (no filters).
 * @returns {Promise<Array>}
 */
async function getAllHotels() {
  return fetchHotels();
}

/**
 * Fetch a single hotel by its numeric ID.
 * The API does not have a dedicated /hotels/:id endpoint exposed,
 * so we fetch all and filter client-side (500 records, fast enough).
 *
 * @param {number|string} id
 * @returns {Promise<Object|null>} The hotel object, or null if not found.
 */
async function getHotelById(id) {
  const hotels = await getAllHotels();
  return hotels.find((h) => String(h.id) === String(id)) || null;
}

/**
 * Search + filter hotels using server-side query parameters.
 *
 * @param {Object} options
 * @param {string}  [options.search]     - Text search (name or location)
 * @param {string}  [options.location]   - Exact city filter
 * @param {number}  [options.minPrice]   - Minimum price
 * @param {number}  [options.maxPrice]   - Maximum price
 * @param {number}  [options.minRating]  - Minimum rating
 * @param {number}  [options.maxRating]  - Maximum rating
 * @param {string}  [options.orderBy]    - Sort field, e.g. "price" or "-rating"
 * @param {number}  [options.limit]      - Max results
 * @param {number}  [options.skip]       - Offset for pagination
 * @returns {Promise<Array>}
 */
async function searchHotels({
  search,
  location,
  minPrice,
  maxPrice,
  minRating,
  maxRating,
  orderBy,
  limit,
  skip,
} = {}) {
  return fetchHotels({
    search,
    location,
    min_price: minPrice,
    max_price: maxPrice,
    min_rating: minRating,
    max_rating: maxRating,
    order_by: orderBy,
    limit,
    skip,
  });
}

// Export as a module-like object (no bundler needed — we use vanilla ES modules)
export { getAllHotels, getHotelById, searchHotels };
