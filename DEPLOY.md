# Go live: new MongoDB + deploy

Order matters: **1) MongoDB → 2) load data → 3) backend → 4) frontend + admin.**

## 1. New MongoDB Atlas account (free)

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (a new email works).
2. Create a free **M0** cluster (any region near your users).
3. **Database Access** → Add New Database User → username + a simple password
   (letters and numbers only; special characters must be URL-encoded). Role: *Read and write to any database*.
4. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`). Render's IPs change, so this is needed.
5. **Database** → Connect → Drivers → copy the string. Put your database name before the `?`:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/food-del?retryWrites=true&w=majority
   ```

## 2. Push the food data + images into MongoDB

On your computer, in the `backend` folder:

```bash
cd backend
npm install
# open backend/.env and replace the MONGO_URI placeholder with your string
npm run seed
```

You should see `Done. 32 new food items added ... 32 images stored.`
(Re-running is safe. `npm run seed -- --reset` wipes foods + images first.)

What it loads: `backend/seed/foods.json` (the 32 items) and `backend/seed/images/` (their pictures, stored in
MongoDB). Check in Atlas → Browse Collections → `food-del` → `foods` and `images`.

Test locally: `npm start` in `backend`, then open http://localhost:4000/api/food/list.

## 3. Deploy the backend (Render, free)

1. Push the project to a GitHub repo. (`.env` is git-ignored, so your secrets stay local.)
2. https://render.com → New → **Web Service** → pick the repo.
3. Settings: **Root Directory** `backend`, **Build** `npm install`, **Start** `npm start`.
4. Environment variables:
   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas string |
   | `JWT_SECRET` | any long random string |
   | `STRIPE_SECRET_KEY` | your Stripe key (optional; checkout is off without it) |
   | `FRONTEND_URL` | your frontend URL from step 4 (add after you have it) |
5. Deploy. Open `https://YOUR-BACKEND.onrender.com/api/food/list`. You should see JSON.

Free Render services sleep after ~15 min idle, so the first request after a pause takes about 30–50 seconds.
Images are stored in MongoDB, so they survive restarts.

## 4. Deploy frontend and admin (Vercel, free)

Do this twice, once for `frontend` and once for `admin`:

1. https://vercel.com → Add New → Project → pick the same repo.
2. **Root Directory**: `frontend` (then again with `admin`). Framework: Vite.
3. Environment variable: `VITE_API_URL` = `https://YOUR-BACKEND.onrender.com` (no trailing slash).
4. Deploy. (`vercel.json` is already included so page refresh and deep links work.)

Then go back to Render and set `FRONTEND_URL` to the frontend's Vercel URL, and redeploy the backend.

## Local development

```bash
cd backend  && npm start        # http://localhost:4000
cd frontend && npm install && npm run dev
cd admin    && npm install && npm run dev
```
Without `VITE_API_URL` both apps talk to `http://localhost:4000`.

## What was fixed

- **Admin List page**: no error handling, so a failed request left it blank. It now shows loading, empty and error
  states; delete refreshes only on success; stable keys.
- **Admin Orders page**: crashed (`index === order.items, length - 1`) and imported assets from the `frontend`
  folder, which breaks when admin is deployed alone.
- **Admin Add page**: category values (`Desert`, `pure Veg`) didn't match the menu (`Deserts`, `Pure Veg`), so new items
  never showed under their category. Also added error handling.
- **Database login was hardcoded** in `config/db.js`. It's now read from `MONGO_URI`.
- **Images** were saved on the server's disk, which Render wipes. They're now stored in MongoDB and served at `/images/<name>`.
- **API URLs** were hardcoded (`localhost`, an old Render address). They now come from `VITE_API_URL`.
- Cart "remove" never reached the server; the server crashed if Stripe wasn't configured; deleting a food that no
  longer exists crashed; the order date default was frozen at server start; the cart total crashed on deleted items;
  expired login tokens now log the user out instead of silently failing.

## Security note

The old MongoDB username/password was in your source code, and `backend/.env` holds your Stripe secret key. If either
was ever pushed to GitHub or shared, rotate it (delete the old DB user; create a new Stripe key).
