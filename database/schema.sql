-- ====================================
-- NIGHT-LIGHT ECONOMY ANALYZER DATABASE SCHEMA
-- ====================================

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    country TEXT,
    state TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Night-light data table
CREATE TABLE IF NOT EXISTS nightlight_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    brightness REAL NOT NULL,
    area_km2 REAL NOT NULL,
    growth_rate REAL DEFAULT 0,
    hotspots INTEGER DEFAULT 0,
    urban_population INTEGER,
    electrification_rate REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id),
    UNIQUE(region_id, year)
);

-- Anomalies table (for mining detection, disaster impact, etc.)
CREATE TABLE IF NOT EXISTS anomalies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    anomaly_type TEXT NOT NULL, -- 'mining', 'disaster', 'growth_spike', 'decline'
    severity REAL NOT NULL, -- 0.0 to 1.0
    latitude REAL,
    longitude REAL,
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Comparisons table (store comparison results)
CREATE TABLE IF NOT EXISTS comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_a_id TEXT NOT NULL,
    year_a INTEGER NOT NULL,
    region_b_id TEXT NOT NULL,
    year_b INTEGER NOT NULL,
    brightness_diff REAL,
    area_diff REAL,
    growth_diff REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_a_id) REFERENCES regions(id),
    FOREIGN KEY (region_b_id) REFERENCES regions(id)
);

-- Analysis reports table
CREATE TABLE IF NOT EXISTS analysis_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id TEXT NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    overall_growth REAL,
    urban_expansion REAL,
    avg_growth_rate REAL,
    hotspots_count INTEGER,
    report_data TEXT, -- JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nightlight_region_year ON nightlight_data(region_id, year);
CREATE INDEX IF NOT EXISTS idx_anomalies_region_year ON anomalies(region_id, year);
CREATE INDEX IF NOT EXISTS idx_anomalies_type ON anomalies(anomaly_type);

