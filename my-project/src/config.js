// API base URL.
//
// Chosen automatically so a production build can never ship a localhost URL:
//   npm run dev    → http://localhost:5000/api   (local backend)
//   npm run build  → https://api.upskale.co/api  (live backend)
//
// To point somewhere else (a staging box, a Render deploy), set VITE_API_URL
// in my-project/.env.local — it overrides both of the above.
export const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
        ? "http://localhost:5000/api"
        : "https://api.upskale.co/api");

// Other backends that have been used:
// https://upskale-1.onrender.com/api
// https://upskale-bite-update.onrender.com/api
