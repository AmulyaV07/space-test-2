# 🌍 Night-Light Economy Analyzer

A futuristic, visually stunning web application for analyzing economic growth through satellite night-light data from NASA VIIRS (2015-2024).

## ✨ Features

- **3D Rotating Earth Globe** - Realistic WebGL globe with night lights and atmospheric glow
- **Interactive Dashboard** - Real-time satellite data visualization
- **Region Comparison** - Compare economic growth between regions and time periods
- **Analysis & Reports** - Generate detailed PDF reports with insights
- **Anomaly Detection** - Identify illegal mining, disasters, and growth spikes
- **Heatmap Visualization** - Visual representation of brightness intensity
- **Before/After Slider** - Compare regions across different years

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Python 3.7+
- npm or yarn

### Installation

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Create and populate the database:**
```bash
python database/populate_database.py
```

This will create `database/nightlight_data.db` with all the sample data.

3. **Start the server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:3000`

## 📁 Project Structure

```
space/
├── index.html              # Landing page with 3D globe
├── dashboard.html          # Main dashboard
├── analysis.html           # Analysis & reports page
├── compare.html            # Region comparison page
├── server.js               # Node.js/Express backend
├── package.json            # Node.js dependencies
├── database/
│   ├── schema.sql          # Database schema
│   ├── populate_database.py  # Python script to populate DB
│   └── nightlight_data.db  # SQLite database (created after running populate script)
├── js/
│   ├── globe.js            # 3D Earth globe with Three.js
│   ├── data-fetch.js      # API data fetching utilities
│   ├── dashboard.js        # Dashboard functionality
│   ├── analysis.js         # Analysis page logic
│   ├── compare.js          # Comparison functionality
│   └── ...
└── css/
    ├── landing.css         # Landing page styles
    ├── dashboard.css       # Dashboard styles
    ├── analysis.css         # Analysis page styles
    └── ...
```

## 🗄️ Database

The application uses SQLite database with the following tables:

- **regions** - Region information (name, coordinates, country, state)
- **nightlight_data** - Yearly night-light data (brightness, area, growth rate, etc.)
- **anomalies** - Detected anomalies (mining, disasters, growth spikes)
- **comparisons** - Stored comparison results
- **analysis_reports** - Generated analysis reports

### Database Schema

See `database/schema.sql` for the complete schema.

### Populating Database

Run the Python script to populate the database:
```bash
python database/populate_database.py
```

## 🔌 API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /api/regions` - Get all regions
- `GET /api/region/:regionId/year/:year` - Get data for specific region and year
- `GET /api/region/:regionId/range/:startYear/:endYear` - Get data for year range
- `POST /api/compare` - Compare two regions
- `POST /api/analysis` - Generate analysis report
- `GET /api/heatmap/:year` - Get heatmap data for a year
- `GET /api/anomalies/:regionId?` - Get anomalies (optionally filtered by region)
- `GET /api/health` - Health check

## 🎨 Technologies Used

- **Frontend:**
  - HTML5, CSS3 (Glassmorphism, Dark Theme)
  - JavaScript (ES6+)
  - Three.js (3D Globe)
  - Chart.js (Data Visualization)
  - Leaflet (Maps)

- **Backend:**
  - Node.js
  - Express.js
  - SQLite3

- **Database:**
  - SQLite
  - Python (for data population)

## 🛠️ Development

### Adding New Regions

1. Add region data to `database/populate_database.py` in the `DATASET` dictionary
2. Run `python database/populate_database.py` to update the database

### Adding New Features

- Frontend JavaScript files are in `js/`
- Backend API routes are in `server.js`
- Styles are in `css/`

## 📝 Notes

- The 3D globe requires Three.js library (loaded via CDN)
- Database file is created automatically when you run the populate script
- All API endpoints return JSON with `{ success: true/false, data: ... }` format

## 🐛 Troubleshooting

**Database not found:**
- Make sure you've run `python database/populate_database.py` first

**3D Globe not showing:**
- Check browser console for Three.js loading errors
- Ensure you have a stable internet connection (textures loaded from CDN)

**API errors:**
- Check that the server is running on the correct port
- Verify database file exists and is accessible

## 📄 License

MIT License

## 🙏 Credits

- NASA VIIRS for satellite data
- Three.js for 3D graphics
- Chart.js for data visualization

