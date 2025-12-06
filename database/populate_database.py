#!/usr/bin/env python3
"""
Night-Light Economy Analyzer - Database Population Script
Populates SQLite database with initial dataset
"""

import sqlite3
import json
import os
from datetime import datetime

# Database file path
DB_PATH = os.path.join(os.path.dirname(__file__), 'nightlight_data.db')

# Dataset - extracted from server.js
DATASET = {
    'bengaluru': {
        'name': 'Bengaluru',
        'latitude': 12.9716,
        'longitude': 77.5946,
        'country': 'India',
        'state': 'Karnataka',
        'data': {
            2015: {'brightness': 42.3, 'area': 523, 'growth': 0, 'hotspots': 8, 'urban_population': 8500000, 'electrification': 92.5},
            2016: {'brightness': 45.1, 'area': 545, 'growth': 5.2, 'hotspots': 10, 'urban_population': 8800000, 'electrification': 93.2},
            2017: {'brightness': 48.7, 'area': 568, 'growth': 6.8, 'hotspots': 12, 'urban_population': 9100000, 'electrification': 94.1},
            2018: {'brightness': 52.3, 'area': 592, 'growth': 7.4, 'hotspots': 14, 'urban_population': 9400000, 'electrification': 94.8},
            2019: {'brightness': 56.1, 'area': 618, 'growth': 7.3, 'hotspots': 16, 'urban_population': 9700000, 'electrification': 95.5},
            2020: {'brightness': 58.9, 'area': 635, 'growth': 5.0, 'hotspots': 17, 'urban_population': 9900000, 'electrification': 95.8},
            2021: {'brightness': 62.4, 'area': 658, 'growth': 6.0, 'hotspots': 19, 'urban_population': 10200000, 'electrification': 96.2},
            2022: {'brightness': 66.2, 'area': 682, 'growth': 6.1, 'hotspots': 21, 'urban_population': 10500000, 'electrification': 96.8},
            2023: {'brightness': 70.1, 'area': 708, 'growth': 5.9, 'hotspots': 23, 'urban_population': 10800000, 'electrification': 97.2},
            2024: {'brightness': 73.8, 'area': 735, 'growth': 5.3, 'hotspots': 25, 'urban_population': 11100000, 'electrification': 97.8}
        }
    },
    'delhi': {
        'name': 'Delhi NCR',
        'latitude': 28.6139,
        'longitude': 77.2090,
        'country': 'India',
        'state': 'Delhi',
        'data': {
            2015: {'brightness': 58.2, 'area': 845, 'growth': 0, 'hotspots': 15, 'urban_population': 18000000, 'electrification': 98.5},
            2016: {'brightness': 61.5, 'area': 872, 'growth': 5.7, 'hotspots': 17, 'urban_population': 18500000, 'electrification': 98.7},
            2017: {'brightness': 65.3, 'area': 901, 'growth': 6.2, 'hotspots': 19, 'urban_population': 19000000, 'electrification': 98.9},
            2018: {'brightness': 69.1, 'area': 932, 'growth': 5.8, 'hotspots': 21, 'urban_population': 19500000, 'electrification': 99.0},
            2019: {'brightness': 73.2, 'area': 965, 'growth': 5.9, 'hotspots': 23, 'urban_population': 20000000, 'electrification': 99.1},
            2020: {'brightness': 75.8, 'area': 988, 'growth': 3.6, 'hotspots': 24, 'urban_population': 20200000, 'electrification': 99.2},
            2021: {'brightness': 79.4, 'area': 1015, 'growth': 4.7, 'hotspots': 26, 'urban_population': 20500000, 'electrification': 99.3},
            2022: {'brightness': 83.1, 'area': 1043, 'growth': 4.7, 'hotspots': 28, 'urban_population': 20800000, 'electrification': 99.4},
            2023: {'brightness': 87.2, 'area': 1072, 'growth': 4.9, 'hotspots': 30, 'urban_population': 21100000, 'electrification': 99.5},
            2024: {'brightness': 91.5, 'area': 1103, 'growth': 4.9, 'hotspots': 32, 'urban_population': 21400000, 'electrification': 99.6}
        }
    },
    'mumbai': {
        'name': 'Mumbai',
        'latitude': 19.0760,
        'longitude': 72.8777,
        'country': 'India',
        'state': 'Maharashtra',
        'data': {
            2015: {'brightness': 55.7, 'area': 712, 'growth': 0, 'hotspots': 12, 'urban_population': 12400000, 'electrification': 97.2},
            2016: {'brightness': 58.9, 'area': 735, 'growth': 5.7, 'hotspots': 14, 'urban_population': 12700000, 'electrification': 97.5},
            2017: {'brightness': 62.4, 'area': 759, 'growth': 5.9, 'hotspots': 16, 'urban_population': 13000000, 'electrification': 97.8},
            2018: {'brightness': 66.1, 'area': 785, 'growth': 5.9, 'hotspots': 18, 'urban_population': 13300000, 'electrification': 98.1},
            2019: {'brightness': 70.2, 'area': 812, 'growth': 6.2, 'hotspots': 20, 'urban_population': 13600000, 'electrification': 98.4},
            2020: {'brightness': 72.8, 'area': 832, 'growth': 3.7, 'hotspots': 21, 'urban_population': 13800000, 'electrification': 98.5},
            2021: {'brightness': 76.3, 'area': 856, 'growth': 4.8, 'hotspots': 23, 'urban_population': 14000000, 'electrification': 98.7},
            2022: {'brightness': 80.1, 'area': 881, 'growth': 5.0, 'hotspots': 25, 'urban_population': 14200000, 'electrification': 98.9},
            2023: {'brightness': 84.2, 'area': 908, 'growth': 5.1, 'hotspots': 27, 'urban_population': 14400000, 'electrification': 99.1},
            2024: {'brightness': 88.5, 'area': 937, 'growth': 5.1, 'hotspots': 29, 'urban_population': 14600000, 'electrification': 99.3}
        }
    },
    'jharkhand': {
        'name': 'Jharkhand',
        'latitude': 23.6102,
        'longitude': 85.2799,
        'country': 'India',
        'state': 'Jharkhand',
        'data': {
            2015: {'brightness': 28.5, 'area': 312, 'growth': 0, 'hotspots': 3, 'urban_population': 3200000, 'electrification': 78.5},
            2016: {'brightness': 30.2, 'area': 325, 'growth': 6.0, 'hotspots': 4, 'urban_population': 3350000, 'electrification': 80.2},
            2017: {'brightness': 32.1, 'area': 339, 'growth': 6.3, 'hotspots': 5, 'urban_population': 3500000, 'electrification': 82.1},
            2018: {'brightness': 34.3, 'area': 354, 'growth': 6.9, 'hotspots': 6, 'urban_population': 3650000, 'electrification': 84.3},
            2019: {'brightness': 36.8, 'area': 371, 'growth': 7.3, 'hotspots': 7, 'urban_population': 3800000, 'electrification': 86.5},
            2020: {'brightness': 38.5, 'area': 385, 'growth': 4.6, 'hotspots': 8, 'urban_population': 3900000, 'electrification': 87.2},
            2021: {'brightness': 40.9, 'area': 402, 'growth': 6.2, 'hotspots': 9, 'urban_population': 4050000, 'electrification': 89.1},
            2022: {'brightness': 43.6, 'area': 421, 'growth': 6.6, 'hotspots': 10, 'urban_population': 4200000, 'electrification': 91.2},
            2023: {'brightness': 46.8, 'area': 442, 'growth': 7.2, 'hotspots': 11, 'urban_population': 4350000, 'electrification': 93.5},
            2024: {'brightness': 50.2, 'area': 465, 'growth': 7.3, 'hotspots': 12, 'urban_population': 4500000, 'electrification': 95.8}
        }
    }
}

# Anomaly data (mining, disasters, etc.)
ANOMALIES = [
    {'region_id': 'jharkhand', 'year': 2018, 'month': 6, 'type': 'mining', 'severity': 0.85, 'lat': 23.8, 'lng': 85.4, 'description': 'Suspected illegal mining activity detected'},
    {'region_id': 'jharkhand', 'year': 2019, 'month': 3, 'type': 'mining', 'severity': 0.72, 'lat': 23.5, 'lng': 85.2, 'description': 'Unauthorized mining operation'},
    {'region_id': 'mumbai', 'year': 2020, 'month': 7, 'type': 'disaster', 'severity': 0.65, 'lat': 19.1, 'lng': 72.9, 'description': 'Flood impact - brightness drop'},
    {'region_id': 'bengaluru', 'year': 2021, 'month': 9, 'type': 'growth_spike', 'severity': 0.55, 'lat': 12.9, 'lng': 77.6, 'description': 'Rapid urbanization detected'},
    {'region_id': 'delhi', 'year': 2020, 'month': 4, 'type': 'decline', 'severity': 0.45, 'lat': 28.6, 'lng': 77.2, 'description': 'Temporary brightness decline'}
]

def create_database():
    """Create database and tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Read and execute schema
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'r') as f:
        schema = f.read()
        cursor.executescript(schema)
    
    conn.commit()
    print(f"✅ Database created at {DB_PATH}")
    return conn, cursor

def populate_regions(cursor):
    """Populate regions table"""
    for region_id, region_data in DATASET.items():
        cursor.execute("""
            INSERT OR REPLACE INTO regions (id, name, latitude, longitude, country, state)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            region_id,
            region_data['name'],
            region_data['latitude'],
            region_data['longitude'],
            region_data['country'],
            region_data['state']
        ))
    print(f"✅ Populated {len(DATASET)} regions")

def populate_nightlight_data(cursor):
    """Populate nightlight data table"""
    count = 0
    for region_id, region_data in DATASET.items():
        for year, data in region_data['data'].items():
            cursor.execute("""
                INSERT OR REPLACE INTO nightlight_data 
                (region_id, year, brightness, area_km2, growth_rate, hotspots, urban_population, electrification_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                region_id,
                year,
                data['brightness'],
                data['area'],
                data['growth'],
                data['hotspots'],
                data.get('urban_population', 0),
                data.get('electrification', 0)
            ))
            count += 1
    print(f"✅ Populated {count} nightlight data records")

def populate_anomalies(cursor):
    """Populate anomalies table"""
    for anomaly in ANOMALIES:
        cursor.execute("""
            INSERT INTO anomalies 
            (region_id, year, month, anomaly_type, severity, latitude, longitude, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            anomaly['region_id'],
            anomaly['year'],
            anomaly['month'],
            anomaly['type'],
            anomaly['severity'],
            anomaly['lat'],
            anomaly['lng'],
            anomaly['description']
        ))
    print(f"✅ Populated {len(ANOMALIES)} anomalies")

def main():
    """Main function to populate database"""
    print("🚀 Starting database population...")
    print(f"📁 Database location: {DB_PATH}")
    
    # Create database
    conn, cursor = create_database()
    
    try:
        # Populate tables
        populate_regions(cursor)
        populate_nightlight_data(cursor)
        populate_anomalies(cursor)
        
        # Commit all changes
        conn.commit()
        
        # Print summary
        cursor.execute("SELECT COUNT(*) FROM regions")
        region_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM nightlight_data")
        data_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM anomalies")
        anomaly_count = cursor.fetchone()[0]
        
        print("\n📊 Database Summary:")
        print(f"   Regions: {region_count}")
        print(f"   Night-light Data Records: {data_count}")
        print(f"   Anomalies: {anomaly_count}")
        print("\n✅ Database population completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    main()

