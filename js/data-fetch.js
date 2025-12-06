// ====================================
// DATA FETCHING UTILITIES
// ====================================

const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : '/api';

// Fetch region data for a specific year
async function fetchRegionData(regionId, year) {
    try {
        const response = await fetch(`${API_BASE_URL}/region/${regionId}/year/${year}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch region data');
        }
    } catch (error) {
        console.error('Error fetching region data:', error);
        // Return fallback data
        return getFallbackData(regionId, year);
    }
}

// Fetch region data for a year range
async function fetchRegionRange(regionId, startYear, endYear) {
    try {
        const response = await fetch(`${API_BASE_URL}/region/${regionId}/range/${startYear}/${endYear}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch range data');
        }
    } catch (error) {
        console.error('Error fetching range data:', error);
        return getFallbackRangeData(regionId, startYear, endYear);
    }
}

// Fetch comparison data
async function fetchComparison(regionA, yearA, regionB, yearB) {
    try {
        const response = await fetch(`${API_BASE_URL}/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ regionA, yearA, regionB, yearB })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch comparison data');
        }
    } catch (error) {
        console.error('Error fetching comparison data:', error);
        return getFallbackComparison(regionA, yearA, regionB, yearB);
    }
}

// Fetch analysis data
async function fetchAnalysis(regionId, startYear, endYear) {
    try {
        const response = await fetch(`${API_BASE_URL}/analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ regionId, startYear, endYear })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch analysis data');
        }
    } catch (error) {
        console.error('Error fetching analysis data:', error);
        return getFallbackAnalysis(regionId, startYear, endYear);
    }
}

// Fetch heatmap data
async function fetchHeatmapData(year) {
    try {
        const response = await fetch(`${API_BASE_URL}/heatmap/${year}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch heatmap data');
        }
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        return [];
    }
}

// Fallback data functions (used when API is unavailable)
function getFallbackData(regionId, year) {
    const baseData = {
        bengaluru: { brightness: 42, area: 523 },
        delhi: { brightness: 58, area: 845 },
        mumbai: { brightness: 56, area: 712 },
        jharkhand: { brightness: 29, area: 312 }
    };
    
    const base = baseData[regionId] || { brightness: 40, area: 500 };
    const yearOffset = parseInt(year) - 2015;
    
    return {
        region: regionId,
        year: parseInt(year),
        brightness: base.brightness + (yearOffset * 3.5),
        area: base.area + (yearOffset * 25),
        growth: yearOffset > 0 ? (5 + Math.random() * 3).toFixed(1) : 0
    };
}

function getFallbackRangeData(regionId, startYear, endYear) {
    const data = [];
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
        data.push(getFallbackData(regionId, year));
    }
    return {
        region: regionId,
        range: { start: parseInt(startYear), end: parseInt(endYear) },
        data
    };
}

function getFallbackComparison(regionA, yearA, regionB, yearB) {
    const dataA = getFallbackData(regionA, yearA);
    const dataB = getFallbackData(regionB, yearB);
    
    return {
        regionA: { name: regionA, year: parseInt(yearA), ...dataA },
        regionB: { name: regionB, year: parseInt(yearB), ...dataB },
        differences: {
            brightness: ((dataB.brightness - dataA.brightness) / dataA.brightness * 100).toFixed(1),
            area: ((dataB.area - dataA.area) / dataA.area * 100).toFixed(1),
            growth: (dataB.growth - dataA.growth).toFixed(1)
        }
    };
}

function getFallbackAnalysis(regionId, startYear, endYear) {
    const rangeData = getFallbackRangeData(regionId, startYear, endYear);
    const firstYear = rangeData.data[0];
    const lastYear = rangeData.data[rangeData.data.length - 1];
    const overallGrowth = ((lastYear.brightness - firstYear.brightness) / firstYear.brightness * 100).toFixed(1);
    
    return {
        region: regionId,
        summary: {
            overallGrowth: `+${overallGrowth}%`,
            urbanExpansion: `${lastYear.area - firstYear.area} km²`,
            avgGrowthRate: '6.5%',
            hotspots: Math.floor(Math.random() * 20 + 15)
        },
        yearlyData: rangeData.data
    };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchRegionData,
        fetchRegionRange,
        fetchComparison,
        fetchAnalysis,
        fetchHeatmapData
    };
}
