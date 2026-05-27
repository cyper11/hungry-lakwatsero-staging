# HungryLakwatsero - Cavite Culinary Tourism Platform

HungryLakwatsero is a full-stack, production-ready culinary tourism platform focused on the Province of Cavite, Philippines. The application promotes Cavite's gastronomy heritage through restaurant discovery, interactive maps, food storytelling, and community engagement.

---

## 📂 Project Architecture

```
hungry-lakwatsero/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL pool config + dynamic SQLite fallback
│   ├── controllers/
│   │   ├── adminController.js     # User, reports, verifications moderation
│   │   ├── analyticsController.js # Stats aggregates for Admin & Owners
│   │   ├── authController.js      # JWT registration, logins, token refresh
│   │   ├── restaurantController.js# CRUD listings, menu edits, uploads
│   │   └── storyController.js     # CMS cultural food articles
│   ├── database/
│   │   ├── schema.sql             # Normalised MySQL database definition
│   │   └── seed.sql               # Seed data for Cavite municipalities & eateries
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT check + Server-side RBAC guards
│   │   ├── rateLimiter.js         # express-rate-limit protection
│   │   ├── uploadMiddleware.js    # Multer configuration for image files
│   │   └── validationMiddleware.js# Input sanitization and XSS protection
│   ├── routes/                    # Express routing endpoints
│   ├── uploads/                   # Local uploads directory (simulates cloud bucket)
│   ├── .env                       # Environment credentials
│   ├── package.json               # Backend Node configuration
│   └── server.js                  # Entry-point initialization
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapContainer.jsx   # Leaflet Map Wrapper (coordinates & routing)
│   │   │   └── Navbar.jsx         # Global navigation state
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth Context, Axios tokens & offline checks
│   │   ├── pages/                 # UI views (Landing, Detail, Dashboards, CMS)
│   │   ├── services/
│   │   ├── App.jsx                # React Router mappings
│   │   ├── index.css              # Custom styling definitions
│   │   └── main.jsx               # React mount root
│   ├── index.html                 # Main template loading Google Fonts & CDNs
│   ├── package.json               # Frontend Node configuration
│   ├── tailwind.config.js         # Design tokens & color palettes
│   └── vite.config.js             # Vite configuration
│
└── preview.html                   # Zero-Install Interactive Single-File Preview
```

---

## ⚡ Zero-Install Local Preview (Quick Demo)

Since Node.js or NPM might not be configured on your terminal environment right now, we have bundled the **entire** application flow (Landing page, interactive Leaflet map of Cavite, dashboards, CMS, and reviews forms) into a single, highly aesthetic interactive file.

1. Locate [preview.html](file:///C:/Users/karen/.gemini/antigravity/scratch/hungry-lakwatsero/preview.html) in your browser or double-click the file in Windows Explorer.
2. You can navigate, filter municipalities, login as Admin or Merchant, submit reviews, respond to comments, add dishes, and review security logs instantly.

---

## ⚙️ Setting Up the Full-Stack Production Environment

To run the real full-stack Express and React application:

### Prerequisites
- Install **Node.js** (v18 or higher)
- Install **MySQL Server** (Optional: the backend is equipped to fall back to an auto-initializing local **SQLite** database if MySQL is not available)

### Step 1: Backend Installation & DB Setup
1. Open a command terminal in `hungry-lakwatsero/backend`
2. Run `npm install` to load Express dependencies.
3. Configure your database details inside `.env`:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_token
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=eaty_wonders
   ```
4. If using MySQL, create the database `eaty_wonders` and run `database/schema.sql` and `database/seed.sql` inside your MySQL command line.
5. Boot up the server:
   ```bash
   npm run start
   ```
   *(The server will print confirmations: `HungryLakwatsero API SERVER RUNNING ON PORT 5000`)*

### Step 2: Frontend Installation & Launch
1. Open a command terminal in `hungry-lakwatsero/frontend`
2. Run `npm install` to download Vite, Tailwind CSS, Leaflet, and Axios.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the development URL in your browser: `http://localhost:3000`

---

## 🔐 Role-Based Access Control (RBAC) Accounts

You can test authentications with these pre-seeded accounts:

| Role | Username | Password | Actions Enabled |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password123` | Moderate verifications, ban users, resolve content reports, edit CMS stories, view audit logs |
| **Merchant Owner** | `mang_tomas` | `password123` | Edit restaurant profile, manage menu items, post announcements, reply to tourist reviews |
| **Tourist** | `tourist_ph` | `password123` | Save favorites, submit reviews/ratings, view coordinates and draw routing directions |
