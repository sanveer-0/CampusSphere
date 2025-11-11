# CampusSphere — College Events Management (Client-only)

## What this is

A simple responsive front-end project for creating, listing, registering and deleting college events. Data is stored in `localStorage` (no backend).

## Run locally

1. Clone or copy the folder `college-events/`.
2. Open `index.html` in your browser.
3. Create events on `Create Event`, view them on `Events`, and manage registrations in `Profile`.

## Files

- `index.html` — home + event preview
- `events.html` — events list
- `create.html` — create event form
- `profile.html` — created & joined events
- `assets/styles.css` — styling, responsive + dark mode
- `assets/app.js` — JS logic

## Notes / Tips

- Uses `localStorage` keys: `ce_events_v1` (events) and `ce_regs_v1` (registrations).
- Dark mode preference saved to `ce_dark_v1`.
- To reset demo data, open devtools → Application → Local Storage → remove those keys.

## Optional next steps

- Add authentication (e.g., Firebase Auth) and store events in a DB (Firestore).
- Add server-side validation and email ticketing.
- Add Google Maps / weather integration for events.

## Deployment

- Push to GitHub and deploy to Netlify or Vercel (drop in as a static site).
