# StayLux — Hotel Listing Web Application

A professional **Hotel Listing Web App** built with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**, consuming the [Hotels API](https://demohotelsapi.pythonanywhere.com/).

---

## 🌐 Live Demo

Open `index.html` in a browser (or serve with a local server).

> **Note:** ES6 `import/export` modules require a server. Use VS Code's Live Server extension or run:
> ```bash
> npx serve .
> ```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Live Search** | Debounced search by hotel name or city |
| 📍 **City Filter** | Filter by 12 Indian cities |
| 💰 **Price Range** | Min/Max price filter using API query params |
| ⭐ **Rating Filter** | Minimum rating filter |
| ↕ **Sort** | Sort by price or rating (ascending/descending) |
| 🖼️ **Detail Page** | Full photo gallery with thumbnail strip |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |
| ♿ **Accessible** | ARIA labels, keyboard navigation, focus management |
| ⚡ **Performance** | Lazy loading images, debounced inputs, spinner |
| 🎨 **Animations** | Card entrance animations, hover effects, counter animation |

---

## 📂 Folder Structure

```
hotel-project/
│
├── index.html          ← Hotel listing page
├── hotel.html          ← Hotel detail page
│
├── css/
│   ├── style.css       ← Core design system & components
│   └── responsive.css  ← All media queries
│
├── js/
│   ├── api.js          ← All API fetch calls
│   ├── app.js          ← Listing page controller
│   ├── hotel.js        ← Detail page controller
│   └── utils.js        ← Shared helpers
│
├── assets/
│   ├── images/
│   │   └── placeholder.svg
│   └── icons/
│
└── README.md
```

---

## 🔌 API Reference

**Base URL:** `https://demohotelsapi.pythonanywhere.com/hotels/`

| Parameter | Example | Description |
|---|---|---|
| `search` | `?search=Regal` | Name or location search |
| `location` | `?location=Goa` | Filter by city |
| `min_price` | `?min_price=3000` | Minimum price |
| `max_price` | `?max_price=10000` | Maximum price |
| `min_rating` | `?min_rating=4` | Minimum rating |
| `order_by` | `?order_by=-rating` | Sort field (`-` = descending) |
| `limit` / `skip` | `?limit=10&skip=0` | Pagination |

**Hotel Object:**
```json
{
  "id": 1,
  "name": "Hotel Regal Crescent",
  "price": "8531.24",
  "thumbnail": "https://...",
  "rating": 3.4,
  "location": "Noida",
  "description": "...",
  "photos": ["https://...", "..."]
}
```

---

## 🏃 Running Locally

### Option 1 — VS Code Live Server
Install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.

### Option 2 — npx serve
```bash
cd hotel-project
npx serve .
```

### Option 3 — Python
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`.

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **JavaScript ES6+** — ES Modules, async/await, Fetch API
- **Google Fonts** — Outfit + DM Sans
- **Unsplash** — Hotel images via API

---

## 📋 Coding Standards

- ✅ No inline CSS or inline JavaScript
- ✅ Modular ES6 imports/exports
- ✅ JSDoc comments on all functions
- ✅ Semantic HTML with ARIA attributes
- ✅ Error handling with user-friendly messages
- ✅ DRY — no duplicate code across modules

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#111827` (Dark Charcoal) |
| Accent | `#2563eb` (Royal Blue) |
| Background | `#f4efe8` (Sand/Warm Cream) |
| Surface | `rgba(255, 255, 255, 0.45)` (Glassmorphism) |
| Font | Outfit + DM Sans |

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Desktop | > 1024px | 3-column grid |
| Tablet | ≤ 768px | 2-column grid, hamburger nav |
| Mobile | ≤ 640px | 1-column grid |
| Small Phone | ≤ 480px | Compact layout |

---

## 👨‍💻 Author

Built with ❤️ by **KAIF** using Vanilla JS & Hotels API.

---

*© 2026 StayLux — All rights reserved.*
