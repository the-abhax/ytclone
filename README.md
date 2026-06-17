# Reel Archive

A video library built with React, Vite, and React Router, backed by live
data from the YouTube Data API v3. Browse by category, search across real
YouTube videos, and watch on a dedicated detail page with an embedded
YouTube player and a related-videos rail.

## Setup

1. Get a YouTube Data API v3 key from the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   create a project (or use an existing one), enable the "YouTube Data API
   v3" under APIs & Services, then create an API key under Credentials.
2. Restrict the key. Under the key's settings, restrict it by HTTP referrer
   to the domain(s) you'll run this on (`http://localhost:5173/*` for local
   dev), and restrict its API access to just the YouTube Data API v3. An
   unrestricted key embedded in frontend code is visible to anyone who
   opens the browser's dev tools, so this step matters.
3. Copy `.env.example` to `.env` in the project root and paste your key in:
   ```
   VITE_YOUTUBE_API_KEY=your-real-key-here
   ```
   `.env` is gitignored — it will never be committed.
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   Open the printed local URL (typically `http://localhost:5173`).

To build for production: `npm run build`, then `npm run preview`.

**Never paste a real API key into a chat, commit it to a public repo, or
hardcode it in a `.jsx` file.** If a key has ever been shared somewhere
public, revoke it in Google Cloud Console and generate a new one.

## About API quota

The Data API gives every project a daily quota (10,000 units by default).
A single `search.list` call costs 100 units, and a `videos.list` call
costs 1 unit per video requested. This app batches detail lookups into one
`videos.list` call per search (up to 50 video IDs at a time) rather than
calling it once per video, and debounces search input by 500ms so typing
doesn't fire a request per keystroke. Even so, search is the expensive
operation — roughly 100 searches will exhaust the default daily quota, so
this is better suited to personal or small-scale use than a high-traffic
public deployment unless you request a quota increase.

## Features

- Live search across real YouTube videos by title, creator, and tags
- Sidebar navigation across six curated topic categories (the Data API
  doesn't support listing videos by category directly, so each sidebar
  item maps to a curated search query instead)
- Real YouTube thumbnails, with a deterministic generative SVG fallback
  if a thumbnail is missing or fails to load
- Video detail page with the actual embedded YouTube player (click to
  load, so the embed script doesn't load until someone wants to watch),
  full metadata, expandable description, tags, and a related-videos rail
- Loading skeletons and explicit error states (missing key, quota
  exceeded, network failure) rather than silent failures
- Dark and light theme toggle
- Fully responsive layout, including a collapsible sidebar on mobile
- Visible keyboard focus states and `prefers-reduced-motion` support

## Project structure

```
src/
  api/
    youtube.js      YouTube Data API v3 client: search, video details,
                     related videos, duration/view formatting
  components/        Reusable UI (Sidebar, Topbar, SearchBar, VideoCard,
                      VideoGrid, VideoThumb, Player) each with a
                      co-located CSS file
  pages/              Route-level views (Home, Watch) and shared styles
  data/
    categories.js     Sidebar categories mapped to search queries
  ThemeContext.jsx    Dark/light theme provider and hook
  App.jsx             Layout shell, routes, and search state
  main.jsx            App entry point, mounts the router
```

## Verification

Vite's dev server could not be run in the sandbox that produced this
project because outbound network access was disabled there, which blocks
both `npm install` and any real call to the YouTube API. Every `.jsx`/`.js`
file was individually syntax-checked, and the full app was bundled
end-to-end (with temporary local stand-ins for `react-router-dom` and
`import.meta.env`, since only `react` and `react-dom` were available
offline) to confirm all imports resolve and the component tree mounts
without errors up to the point where it tries to attach to a real browser
DOM. That verification scaffolding was removed before packaging — running
`npm install` will fetch the real `react-router-dom` package, and you'll
need your own API key to see live results, per the setup steps above.
