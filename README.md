# Maison De Beauté — Luxury Salon & Spa Web Application

A modern, high-end luxury Salon & Spa web application built with a **Pure HTML5, CSS3, and Vanilla JavaScript** tech stack. Designed for high-end beauty salons, barbershops, and aesthetic spas.

All features run entirely client-side with persistent `localStorage` data management, zero external backend dependencies, and seamless instant execution in any modern web browser or static hosting platform (GitHub Pages, Netlify, Vercel, etc.).

---

## 🌟 Key Features & Tech Stack

### 🛠 Tech Stack:
- **HTML5:** Semantic, accessible markup across all pages (`index.html`, `services.html`, `team.html`, `transformations.html`, `book.html`, `confirmation.html`, `manage_booking.html`, `admin.html`).
- **CSS3:** Luxury color palette (rich gold gradients, deep onyx, ivory sand, refined typography with *Libre Baskerville* and *Poppins*), responsive layout grids, glassmorphism, 3D rotating cursor-follow watermark logo ball.
- **Vanilla JavaScript (ES6+):**
  - Modular client data store (`js/store.js`) with persistent `localStorage` state for treatments, specialists, shifts, reviews, and appointments.
  - Interactive Before & After comparison gallery with dynamic category filtering (`js/comparison.js`).
  - Real-time slot conflict and double-booking prevention engine (`js/booking.js`).
  - Specialist live shift inspector and schedule modal (`js/team.js`).
  - Salon operations portal & password-gated Executive Manager Suite (`js/admin.js`).
  - Direct browser `.ics` calendar file generation and export.

---

## 🚀 How to Run

### Method 1: Double-Click
Simply double-click `run.bat` in the project folder to launch in your browser.

### Method 2: Open Directly
Double-click `index.html` directly in File Explorer to open in Chrome, Edge, Safari, or Firefox without any web server needed!

### Method 3: Static Server (Any)
Run any simple static web server in this directory:
```bash
# Python
python -m http.server 8080

# Or Node npx
npx serve .
```
Then navigate to: **[http://127.0.0.1:8080](http://127.0.0.1:8080)**

---

## 📂 Project Architecture

```
seloon website/
├── index.html               # Homepage (Hero, Featured Services, Transformations, Specialists, Reviews)
├── services.html            # Full treatments menu with live category filters
├── team.html                # Specialist profiles, live shifts & availability finder + interactive modal
├── transformations.html     # Side-by-side Before & After gallery with category filters
├── book.html                # 4-Step Booking wizard with real-time slot checking
├── confirmation.html        # Booking confirmation with direct .ics calendar download & print receipt
├── manage_booking.html      # Client appointment lookup & cancel portal
├── admin.html               # Salon staff operations dashboard & password-gated Manager/CEO suite
├── css/
│   └── style.css            # Luxury salon styling, typography & responsive grid
├── js/
│   ├── store.js             # Data models, local storage management, seed data, appointment slots engine, .ics generator
│   ├── main.js              # Navbar toggle, 3D rotating cursor-follow watermark logo ball, shared utilities
│   ├── booking.js           # Multi-step booking flow, live conflict checks, state management
│   ├── comparison.js        # Category filters for before/after transformations
│   ├── team.js              # Live availability finder and modal inspection for specialists
│   └── admin.js             # Salon staff dashboard, manager authentication, service CRUD, worker & shift CRUD
├── images/                  # High-definition treatment photos, before/after pairs & logo assets
└── run.bat                  # One-click Windows runner
```

---

## 👑 Executive Manager & CEO Suite

- Access the Executive Suite on `admin.html` by clicking **Manager & CEO Suite**.
- **Default Passcode:** `ceo2026`
- **Capabilities:**
  - Add, edit, or remove salon treatments & adjust pricing/durations.
  - Add, edit, or remove salon staff & customize shift schedules and working days.
  - Inspect specialist availability calendars in real time.
  - Restore factory sample data anytime with the *Reset Sample Data* button.
