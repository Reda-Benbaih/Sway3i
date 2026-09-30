# Sway3i – frontend

React 19 + Vite single-page app for the Sway3i tutoring platform. It talks to the Spring Boot API in `backend/sway3i`.

## Run it locally

1. Start the backend first (it listens on `http://localhost:8080`).
2. Install and start the frontend:

```bash
npm install
npm run dev
```

The app opens on http://localhost:5173 (the port allowed by the backend CORS configuration).

## Configuration

Copy `.env.example` to `.env.local` and adjust if needed:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080/api/v1` | URL of the Spring Boot API |
| `VITE_GOOGLE_CLIENT_ID` | empty | Google OAuth client ID. When empty, the "Continue with Google" button is hidden. |

Vite reads these values at build time, so restart `npm run dev` (or rebuild) after changing them.

### Enabling Google sign-in

1. In the Google Cloud console, create an **OAuth client ID** of type *Web application*.
2. Add `http://localhost:5173` (and your production URL) to **Authorized JavaScript origins**.
3. Put the client ID in `VITE_GOOGLE_CLIENT_ID` (frontend) **and** in the `GOOGLE_CLIENT_ID` environment variable of the backend (`app.google.client-id`).

The browser gets an ID token from Google; the backend checks its signature, issuer and audience at `POST /api/v1/auth/google`, then returns the usual Sway3i JWT.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serves the production build |
| `npm run lint` | Lints the code with oxlint |

## Structure

```
src/
  api/          axios instance (JWT header, 401 handling) and one function per backend endpoint
  context/      AuthContext: session, login/register/Google, logout, role
  routing/      ProtectedRoute (role check), GuestRoute, dashboard redirect
  components/
    ui/         design-system components (Button, Field, Modal, Tabs, Stars, Toast…)
    layout/     public site layout and dashboard shell (sidebar + top bar)
    auth/       auth page frame, role cards, Google button, account settings
    teachers/   teacher / course cards, booking dialog, lesson items, review dialog
  pages/
    public/     landing, find teachers, teacher profile, login, register, 404/403
    student/    dashboard, lessons, profile
    teacher/    dashboard, bookings, courses & time slots, schedule, reviews, profile
    admin/      overview, teachers (validation), students, bookings, reviews, subjects
  styles/       design tokens and styles (tokens → base → components → layout → pages)
```

Roles come from the backend `Role` enum: `STUDENT` → `/student`, `TUTOR` → `/teacher`, `ADMIN` → `/admin`.
The route guards only improve navigation; every request is still authorized by Spring Security.
