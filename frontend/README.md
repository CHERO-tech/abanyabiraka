# Abanyabiraka Frontend

The frontend uses Next.js App Router, Tailwind CSS, and a white/orange visual
system for the Abanyabiraka marketplace.

## Scripts

- `npm install`
- `npm run dev` - starts the app at http://localhost:3000
- `npm run build` - creates the production build
- `npm run start` - serves the production build

## Current foundation

- `app/layout.js` defines metadata, Geist typography, and the global shell.
- `app/globals.css` defines Tailwind layers and shared layout utilities.
- `app/page.js` contains the first landing page: discovery search, service
	categories, verified professionals, and the worker call-to-action.
- Brand tokens live in `tailwind.config.js`: orange `500` is `#F97316`, with
	white, warm canvas, and ink neutrals supporting it.

The previous React Router implementation remains under `src/` while the
feature pages are migrated into App Router routes milestone by milestone.
