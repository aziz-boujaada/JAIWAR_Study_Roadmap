# Run and deploy your app

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Start the app in development mode:
   `npm run dev` in one terminal and `npm run dev:backend` in another terminal.
3. Set the `GEMINI_API_KEY` in `.env.local` if you use the Gemini features.

The backend stores presentations in `data/presentations.sqlite`.

## API

The backend exposes a simple SQLite-backed presentations API:

1. `GET /api/presentations`
2. `POST /api/presentations`
3. `GET /api/presentations/:id`
4. `PUT /api/presentations/:id`
5. `DELETE /api/presentations/:id`
6. `GET /api/health`

## Production Build

1. Build the production frontend and server:
   `npm run build`
2. Start the production app:
   `npm start`

This serves the frontend and API from the same Node process, which is the recommended deployment mode for a generic Node host.

## Deploy To Vercel

This project is Vercel-compatible after you connect it to a persistent libSQL database such as Turso.

1. Create a Turso database and copy its URL and auth token.
2. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the Vercel project environment variables.
3. Deploy the repository to Vercel as a Vite app.
4. Vercel will serve the frontend from `dist` and the API from the `api/` serverless functions.

If you want a local template for those values, use [`.env.example`](/home/aziz/Desktop/RoadMap_Study/.env.example) as a starting point.

