// ====================================
// NIGHT-LIGHT ECONOMY ANALYZER - BACKEND SERVER
// ====================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database path
const DB_PATH = path.join(__dirname, 'database', 'nightlight_data.db');

// Initialize database connection
let db;
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Database connection error:', err.message);
                reject(err);
            } else {
                console.log('✅ Connected to SQLite database');
                resolve();
            }
        });
    });
}

// Database query helper
function dbQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ====================================
// API ROUTES
// ====================================

// Get all regions
app.get('/api/regions', async (req, res) => {
    try {
        const regions = await dbQuery(`
            SELECT id, name, latitude, longitude, country, state 
            FROM regions 
            ORDER BY name
        `);
        
        const formattedRegions = regions.map(region => ({
            id: region.id,
            name: region.name,
            coordinates: {
                lat: region.latitude,
                lng: region.longitude
            },
            country: region.country,
            state: region.state
        }));
        
        res.json({ success: true, data: formattedRegions });
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get region data for specific year
app.get('/api/region/:regionId/year/:year', async (req, res) => {
    try {
        const { regionId, year } = req.params;
        const yearInt = parseInt(year);
        
        // Get region info
        const region = await dbGet('SELECT * FROM regions WHERE id = ?', [regionId]);
        if (!region) {
            return res.status(404).json({ success: false, error: 'Region not found' });
        }
        
        // Get year data
        const yearData = await dbGet(`
            SELECT * FROM nightlight_data 
            WHERE region_id = ? AND year = ?
        `, [regionId, yearInt]);
        
        if (!yearData) {
            return res.status(404).json({ success: false, error: 'Year data not found' });
        }
        
        res.json({
            success: true,
            data: {
                region: region.name,
                year: yearInt,
                brightness: yearData.brightness,
                area: yearData.area_km2,
                growth: yearData.growth_rate,
                hotspots: yearData.hotspots,
                urbanPopulation: yearData.urban_population,
                electrificationRate: yearData.electrification_rate
            }
        });
    } catch (error) {
        console.error('Error fetching region data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get region data for year range
app.get('/api/region/:regionId/range/:startYear/:endYear', async (req, res) => {
    try {
        const { regionId, startYear, endYear } = req.params;
        const start = parseInt(startYear);
        const end = parseInt(endYear);
        
        // Get region info
        const region = await dbGet('SELECT * FROM regions WHERE id = ?', [regionId]);
        if (!region) {
            return res.status(404).json({ success: false, error: 'Region not found' });
        }
        
        // Get range data
        const rangeData = await dbQuery(`
            SELECT * FROM nightlight_data 
            WHERE region_id = ? AND year >= ? AND year <= ?
            ORDER BY year ASC
        `, [regionId, start, end]);
        
        const formattedData = rangeData.map(row => ({
            year: row.year,
            brightness: row.brightness,
            area: row.area_km2,
            growth: row.growth_rate,
            hotspots: row.hotspots,
            urbanPopulation: row.urban_population,
            electrificationRate: row.electrification_rate
        }));
        
        res.json({
            success: true,
            data: {
                region: region.name,
                range: { start, end },
                data: formattedData
            }
        });
    } catch (error) {
        console.error('Error fetching range data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Compare two regions
app.post('/api/compare', async (req, res) => {
    try {
        const { regionA, yearA, regionB, yearB } = req.body;
        const yearAInt = parseInt(yearA);
        const yearBInt = parseInt(yearB);
        
        // Get both regions
        const regionAData = await dbGet('SELECT * FROM regions WHERE id = ?', [regionA]);
        const regionBData = await dbGet('SELECT * FROM regions WHERE id = ?', [regionB]);
        
        if (!regionAData || !regionBData) {
            return res.status(404).json({ success: false, error: 'Region not found' });
        }
        
        // Get year data for both regions
        const dataA = await dbGet(`
            SELECT * FROM nightlight_data 
            WHERE region_id = ? AND year = ?
        `, [regionA, yearAInt]);
        
        const dataB = await dbGet(`
            SELECT * FROM nightlight_data 
            WHERE region_id = ? AND year = ?
        `, [regionB, yearBInt]);
        
        if (!dataA || !dataB) {
            return res.status(404).json({ success: false, error: 'Year data not found' });
        }
        
        const comparison = {
            regionA: {
                name: regionAData.name,
                year: yearAInt,
                brightness: dataA.brightness,
                area: dataA.area_km2,
                growth: dataA.growth_rate,
                hotspots: dataA.hotspots
            },
            regionB: {
                name: regionBData.name,
                year: yearBInt,
                brightness: dataB.brightness,
                area: dataB.area_km2,
                growth: dataB.growth_rate,
                hotspots: dataB.hotspots
            },
            differences: {
                brightness: ((dataB.brightness - dataA.brightness) / dataA.brightness * 100).toFixed(1),
                area: ((dataB.area_km2 - dataA.area_km2) / dataA.area_km2 * 100).toFixed(1),
                growth: (dataB.growth_rate - dataA.growth_rate).toFixed(1)
            }
        };
        
        // Store comparison in database
        await dbQuery(`
            INSERT INTO comparisons 
            (region_a_id, year_a, region_b_id, year_b, brightness_diff, area_diff, growth_diff)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            regionA, yearAInt, regionB, yearBInt,
            comparison.differences.brightness,
            comparison.differences.area,
            comparison.differences.growth
        ]);
        
        res.json({ success: true, data: comparison });
    } catch (error) {
        console.error('Error comparing regions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get analysis for region
app.post('/api/analysis', async (req, res) => {
    try {
        const { regionId, startYear, endYear } = req.body;
        const start = parseInt(startYear);
        const end = parseInt(endYear);
        
        // Get region info
        const region = await dbGet('SELECT * FROM regions WHERE id = ?', [regionId]);
        if (!region) {
            return res.status(404).json({ success: false, error: 'Region not found' });
        }
        
        // Get range data
        const rangeData = await dbQuery(`
            SELECT * FROM nightlight_data 
            WHERE region_id = ? AND year >= ? AND year <= ?
            ORDER BY year ASC
        `, [regionId, start, end]);
        
        if (rangeData.length === 0) {
            return res.status(404).json({ success: false, error: 'No data found for specified range' });
        }
        
        // Calculate summary statistics
        const firstYear = rangeData[0];
        const lastYear = rangeData[rangeData.length - 1];
        const overallGrowth = ((lastYear.brightness - firstYear.brightness) / firstYear.brightness * 100).toFixed(1);
        const urbanExpansion = (lastYear.area_km2 - firstYear.area_km2).toFixed(0);
        const avgGrowth = (rangeData.reduce((sum, d) => sum + d.growth_rate, 0) / rangeData.length).toFixed(1);
        const maxHotspots = Math.max(...rangeData.map(d => d.hotspots));
        
        const summary = {
            overallGrowth: `+${overallGrowth}%`,
            urbanExpansion: `${urbanExpansion} km²`,
            avgGrowthRate: `${avgGrowth}%`,
            hotspots: maxHotspots
        };
        
        const yearlyData = rangeData.map(row => ({
            year: row.year,
            brightness: row.brightness,
            growth: row.growth_rate,
            area: row.area_km2,
            hotspots: row.hotspots,
            status: row.growth_rate > 0 ? 'Growing' : 'Baseline'
        }));
        
        // Store analysis report
        await dbQuery(`
            INSERT INTO analysis_reports 
            (region_id, start_year, end_year, overall_growth, urban_expansion, avg_growth_rate, hotspots_count, report_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            regionId, start, end,
            overallGrowth, urbanExpansion, avgGrowth, maxHotspots,
            JSON.stringify({ summary, yearlyData })
        ]);
        
        res.json({
            success: true,
            data: {
                region: region.name,
                summary,
                yearlyData
            }
        });
    } catch (error) {
        console.error('Error fetching analysis:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get heatmap data
app.get('/api/heatmap/:year', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        
        const heatmapData = await dbQuery(`
            SELECT 
                r.latitude as lat,
                r.longitude as lng,
                n.brightness as intensity,
                r.name as region
            FROM nightlight_data n
            JOIN regions r ON n.region_id = r.id
            WHERE n.year = ?
        `, [year]);
        
        res.json({ success: true, data: heatmapData });
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get anomalies
app.get('/api/anomalies/:regionId?', async (req, res) => {
    try {
        const { regionId } = req.params;
        let anomalies;
        
        if (regionId) {
            anomalies = await dbQuery(`
                SELECT * FROM anomalies 
                WHERE region_id = ?
                ORDER BY year DESC, month DESC
            `, [regionId]);
        } else {
            anomalies = await dbQuery(`
                SELECT * FROM anomalies 
                ORDER BY year DESC, month DESC
            `);
        }
        
        res.json({ success: true, data: anomalies });
    } catch (error) {
        console.error('Error fetching anomalies:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        await dbGet('SELECT 1');
        
        res.json({ 
            success: true, 
            message: 'Night-Light Economy Analyzer API is running',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'API is running but database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Night-Light Economy Analyzer Server running on http://localhost:${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`💾 Database: ${DB_PATH}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to initialize database:', err);
        console.log('💡 Make sure to run: python database/populate_database.py first');
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('✅ Database connection closed');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});
