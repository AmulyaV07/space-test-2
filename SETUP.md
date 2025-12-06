# 🚀 Setup Instructions

Follow these steps to get the Night-Light Economy Analyzer running:

## Step 1: Install Node.js Dependencies

```bash
npm install
```

This will install:
- Express.js (web server)
- CORS (cross-origin resource sharing)
- SQLite3 (database)
- Other required packages

## Step 2: Create and Populate Database

Run the Python script to create the SQLite database and populate it with sample data:

```bash
python database/populate_database.py
```

**Note:** If you're on Windows and `python` doesn't work, try `python3`:
```bash
python3 database/populate_database.py
```

This will:
- Create `database/nightlight_data.db`
- Create all necessary tables
- Populate with sample data for 4 regions (Bengaluru, Delhi, Mumbai, Jharkhand)
- Add anomaly data

You should see output like:
```
🚀 Starting database population...
📁 Database location: database/nightlight_data.db
✅ Database created at database/nightlight_data.db
✅ Populated 4 regions
✅ Populated 40 nightlight data records
✅ Populated 5 anomalies

📊 Database Summary:
   Regions: 4
   Night-light Data Records: 40
   Anomalies: 5

✅ Database population completed successfully!
```

## Step 3: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Step 4: Open in Browser

Navigate to `http://localhost:3000` in your web browser.

You should see:
- Landing page with 3D rotating Earth globe
- Navigation to Dashboard, Analysis, Compare pages
- All features working with real database data

## Troubleshooting

### Database not found error
- Make sure you ran `python database/populate_database.py` first
- Check that `database/nightlight_data.db` exists

### Port already in use
- Change the PORT in `.env` file or set environment variable
- Default is port 3000

### Python not found
- Install Python 3.7+ from python.org
- Make sure Python is in your PATH

### Node modules not found
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

## Verifying Setup

1. **Check API health:**
   Visit `http://localhost:3000/api/health`
   Should return: `{"success":true,"message":"...","database":"connected"}`

2. **Check regions endpoint:**
   Visit `http://localhost:3000/api/regions`
   Should return JSON with 4 regions

3. **Test database:**
   The server logs should show: `✅ Connected to SQLite database`

## Next Steps

- Explore the Dashboard to see interactive maps
- Generate Analysis reports
- Compare different regions
- View the 3D globe on the landing page

Enjoy analyzing night-light data! 🌍✨

