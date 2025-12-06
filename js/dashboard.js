// ====================================
// DASHBOARD FUNCTIONALITY
// ====================================

let map, heatLayer, trendChart;
let currentRegion = 'india';
let currentYear = 2024;
let currentMode = 'growth';

document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeChart();
    setupEventListeners();
    loadInitialData();
});

// Initialize Leaflet Map
function initializeMap() {
    map = L.map('map', {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19
    }).addTo(map);

    // Sample heatmap data
    const heatmapData = [
        [28.7041, 77.1025, 0.9],  // Delhi
        [19.0760, 72.8777, 0.85], // Mumbai
        [13.0827, 80.2707, 0.8],  // Chennai
        [12.9716, 77.5946, 0.95], // Bengaluru
        [17.3850, 78.4867, 0.88], // Hyderabad
        [22.5726, 88.3639, 0.82], // Kolkata
        [23.0225, 72.5714, 0.75], // Ahmedabad
        [18.5204, 73.8567, 0.7],  // Pune
    ];

    heatLayer = L.heatLayer(heatmapData, {
        radius: 35,
        blur: 40,
        maxZoom: 10,
        max: 1.0,
        gradient: {
            0.0: '#1E293B',
            0.4: '#3B82F6',
            0.6: '#FBBF24',
            0.8: '#F59E0B',
            1.0: '#FF6B9D'
        }
    }).addTo(map);
}

// Initialize Chart.js [web:50][web:51]
function initializeChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 217, 255, 0.0)');

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2015', '2017', '2019', '2021', '2023', '2024'],
            datasets: [{
                label: 'Brightness Index',
                data: [45, 52, 58, 65, 72, 78],
                borderColor: '#00D9FF',
                backgroundColor: gradient,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#00D9FF',
                pointBorderColor: '#0A0E27',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748B' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748B' }
                }
            }
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Region Selector
    const regionSelect = document.getElementById('regionSelect');
    if (regionSelect) {
        regionSelect.addEventListener('change', (e) => {
            currentRegion = e.target.value;
            updateRegion(currentRegion);
        });
    }

    // Year Slider
    const yearSlider = document.getElementById('yearSlider');
    const yearDisplay = document.getElementById('yearDisplay');
    if (yearSlider && yearDisplay) {
        yearSlider.addEventListener('input', (e) => {
            currentYear = parseInt(e.target.value);
            yearDisplay.textContent = currentYear;
            updateYear(currentYear);
        });
    }

    // Mode Buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.dataset.mode;
            updateMode(currentMode);
        });
    });

    // Map Controls
    const heatmapToggle = document.getElementById('heatmapToggle');
    if (heatmapToggle) {
        heatmapToggle.addEventListener('click', () => {
            if (map.hasLayer(heatLayer)) {
                map.removeLayer(heatLayer);
                showToast('Heatmap hidden', 'info');
            } else {
                heatLayer.addTo(map);
                showToast('Heatmap visible', 'success');
            }
        });
    }

    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const mapSection = document.querySelector('.map-section');
            if (mapSection.requestFullscreen) {
                mapSection.requestFullscreen();
            }
        });
    }

    // Action Buttons
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            window.location.href = 'analysis.html';
        });
    }

    const compareRegionsBtn = document.getElementById('compareRegionsBtn');
    if (compareRegionsBtn) {
        compareRegionsBtn.addEventListener('click', () => {
            window.location.href = 'compare.html';
        });
    }

    const detectAnomaliesBtn = document.getElementById('detectAnomaliesBtn');
    if (detectAnomaliesBtn) {
        detectAnomaliesBtn.addEventListener('click', () => {
            window.location.href = 'mining.html';
        });
    }

    // Export Button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    // Refresh Insights
    const refreshInsights = document.getElementById('refreshInsights');
    if (refreshInsights) {
        refreshInsights.addEventListener('click', loadInsights);
    }
}

// Update Functions
function updateRegion(region) {
    showLoading();
    
    const regions = {
        'india': [20.5937, 78.9629, 5],
        'jharkhand': [23.6102, 85.2799, 7],
        'ranchi': [23.3441, 85.3096, 11],
        'bengaluru': [12.9716, 77.5946, 11],
        'delhi': [28.7041, 77.1025, 11],
        'mumbai': [19.0760, 72.8777, 11],
        'hyderabad': [17.3850, 78.4867, 11],
        'kolkata': [22.5726, 88.3639, 11],
        'chennai': [13.0827, 80.2707, 11]
    };
    
    if (regions[region]) {
        map.setView([regions[region][0], regions[region][1]], regions[region][2]);
    }
    
    document.getElementById('mapSubtitle').textContent = 
        `Viewing: ${region.charAt(0).toUpperCase() + region.slice(1)} - Year: ${currentYear}`;
    
    setTimeout(() => {
        hideLoading();
        showToast(`Loaded data for ${region}`, 'success');
        updateStats(region);
    }, 800);
}

function updateYear(year) {
    showToast(`Loading data for ${year}...`, 'info');
    
    // Update chart data
    const newData = generateYearData(year);
    if (trendChart) {
        trendChart.data.datasets[0].data = newData;
        trendChart.update();
    }
    
    document.getElementById('mapSubtitle').textContent = 
        `Viewing: ${currentRegion.charAt(0).toUpperCase() + currentRegion.slice(1)} - Year: ${year}`;
}

function updateMode(mode) {
    showToast(`Switched to ${mode} analysis mode`, 'info');
    loadInsights();
}

function updateStats(region) {
    // Generate random stats for demo
    document.getElementById('brightnessChange').textContent = `+${generateRandomData(20, 50)}%`;
    document.getElementById('urbanExpansion').textContent = `${generateRandomData(5, 20)}.${generateRandomData(1, 9)} km²`;
    document.getElementById('electrification').textContent = `${generateRandomData(75, 95)}%`;
}

// Load Initial Data
function loadInitialData() {
    showLoading();
    setTimeout(() => {
        loadInsights();
        hideLoading();
        showToast('Dashboard loaded successfully!', 'success');
    }, 1500);
}

// Load Insights
function loadInsights() {
    const container = document.getElementById('insightsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="padding: 0.25rem 0.75rem; background: rgba(16, 185, 129, 0.2); color: #10B981; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">POSITIVE</span>
                <span style="color: #64748B; font-size: 0.8rem;">2015-2024</span>
            </div>
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Rapid Urban Development</h3>
            <p style="color: #CBD5E1; font-size: 0.9rem; line-height: 1.6;">
                Electronic City shows <strong>+42% increase</strong> in night-light intensity, indicating major commercial expansion.
            </p>
        </div>
        
        <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #F59E0B; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="padding: 0.25rem 0.75rem; background: rgba(245, 158, 11, 0.2); color: #F59E0B; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">ALERT</span>
                <span style="color: #64748B; font-size: 0.8rem;">Detected: 2023</span>
            </div>
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Unusual Activity Pattern</h3>
            <p style="color: #CBD5E1; font-size: 0.9rem; line-height: 1.6;">
                Brightness spike in forest region. Possible <strong>illegal mining</strong> operation.
            </p>
        </div>
    `;
}

// Export Data [web:65]
function exportData() {
    const data = [
        { Year: 2015, Brightness: 45, Growth: 0, Area: 523 },
        { Year: 2017, Brightness: 52, Growth: 15.6, Area: 567 },
        { Year: 2019, Brightness: 58, Growth: 11.5, Area: 612 },
        { Year: 2021, Brightness: 65, Growth: 12.1, Area: 678 },
        { Year: 2023, Brightness: 72, Growth: 10.8, Area: 734 },
        { Year: 2024, Brightness: 78, Growth: 8.3, Area: 789 }
    ];
    
    exportToCSV(data, `nightlight-${currentRegion}-${Date.now()}.csv`);
}

// Generate Year Data (for demo)
function generateYearData(year) {
    const baseYear = 2015;
    const yearDiff = year - baseYear;
    const growth = 5 + (yearDiff * 3.5);
    
    return [45, 45 + growth * 0.3, 45 + growth * 0.5, 45 + growth * 0.7, 45 + growth * 0.9, 45 + growth];
}
