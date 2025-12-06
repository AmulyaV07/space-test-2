// ====================================
// COMPARISON PAGE FUNCTIONALITY
// ====================================

let comparisonChart;
let isDragging = false;

document.addEventListener('DOMContentLoaded', () => {
    setupCompareListeners();
});

function setupCompareListeners() {
    const startCompareBtn = document.getElementById('startCompareBtn');
    if (startCompareBtn) {
        startCompareBtn.addEventListener('click', startComparison);
    }

    const resetCompareBtn = document.getElementById('resetCompareBtn');
    if (resetCompareBtn) {
        resetCompareBtn.addEventListener('click', resetComparison);
    }

    // Before/After Slider [web:46]
    setupBeforeAfterSlider();
}

async function startComparison() {
    const regionA = document.getElementById('regionA').value;
    const yearA = document.getElementById('yearA').value;
    const regionB = document.getElementById('regionB').value;
    const yearB = document.getElementById('yearB').value;

    showLoading();

    try {
        // Fetch comparison data from API
        const comparisonData = await fetchComparison(regionA, yearA, regionB, yearB);
        
        document.getElementById('sliderSection').style.display = 'block';
        document.getElementById('comparisonStats').style.display = 'block';
        
        // Update labels
        document.getElementById('labelA').textContent = `${comparisonData.regionA.name} (${yearA})`;
        document.getElementById('labelB').textContent = `${comparisonData.regionB.name} (${yearB})`;
        document.getElementById('headerA').textContent = `${comparisonData.regionA.name} ${yearA}`;
        document.getElementById('headerB').textContent = `${comparisonData.regionB.name} ${yearB}`;
        
        // Update stats with API data
        updateComparisonStatsFromData(comparisonData);
        
        // Initialize comparison chart with API data
        initializeComparisonChartFromData(comparisonData);
        
        hideLoading();
        showToast('Comparison generated successfully!', 'success');
        
        document.getElementById('sliderSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching comparison:', error);
        hideLoading();
        showToast('Error generating comparison. Using fallback data.', 'warning');
        
        // Fallback to original behavior
        document.getElementById('sliderSection').style.display = 'block';
        document.getElementById('comparisonStats').style.display = 'block';
        document.getElementById('labelA').textContent = `${regionA} (${yearA})`;
        document.getElementById('labelB').textContent = `${regionB} (${yearB})`;
        updateComparisonStats();
        initializeComparisonChart();
    }
}

function updateComparisonStats() {
    const brightA = generateRandomData(40, 60);
    const brightB = generateRandomData(65, 85);
    const brightDiff = ((brightB - brightA) / brightA * 100).toFixed(1);
    
    document.getElementById('brightA').textContent = brightA.toFixed(1);
    document.getElementById('brightB').textContent = brightB.toFixed(1);
    document.getElementById('brightDiff').textContent = `+${brightDiff}%`;
    
    const areaA = generateRandomData(400, 600);
    const areaB = generateRandomData(700, 900);
    const areaDiff = ((areaB - areaA) / areaA * 100).toFixed(1);
    
    document.getElementById('areaA').textContent = areaA;
    document.getElementById('areaB').textContent = areaB;
    document.getElementById('areaDiff').textContent = `+${areaDiff}%`;
    
    const growthA = (Math.random() * 5 + 3).toFixed(1);
    const growthB = (Math.random() * 5 + 6).toFixed(1);
    const growthDiff = (growthB - growthA).toFixed(1);
    
    document.getElementById('growthA').textContent = `${growthA}%`;
    document.getElementById('growthB').textContent = `${growthB}%`;
    document.getElementById('growthDiff').textContent = `+${growthDiff}%`;
    
    const hotA = generateRandomData(8, 15);
    const hotB = generateRandomData(20, 35);
    const hotDiff = ((hotB - hotA) / hotA * 100).toFixed(0);
    
    document.getElementById('hotA').textContent = hotA;
    document.getElementById('hotB').textContent = hotB;
    document.getElementById('hotDiff').textContent = `+${hotDiff}%`;
}

function updateComparisonStatsFromData(comparisonData) {
    const { regionA, regionB, differences } = comparisonData;
    
    document.getElementById('brightA').textContent = regionA.brightness.toFixed(1);
    document.getElementById('brightB').textContent = regionB.brightness.toFixed(1);
    document.getElementById('brightDiff').textContent = `+${differences.brightness}%`;
    
    document.getElementById('areaA').textContent = Math.round(regionA.area);
    document.getElementById('areaB').textContent = Math.round(regionB.area);
    document.getElementById('areaDiff').textContent = `+${differences.area}%`;
    
    document.getElementById('growthA').textContent = `${regionA.growth.toFixed(1)}%`;
    document.getElementById('growthB').textContent = `${regionB.growth.toFixed(1)}%`;
    document.getElementById('growthDiff').textContent = `+${differences.growth}%`;
    
    document.getElementById('hotA').textContent = regionA.hotspots || 0;
    document.getElementById('hotB').textContent = regionB.hotspots || 0;
    const hotDiff = regionB.hotspots && regionA.hotspots 
        ? ((regionB.hotspots - regionA.hotspots) / regionA.hotspots * 100).toFixed(0)
        : '0';
    document.getElementById('hotDiff').textContent = `+${hotDiff}%`;
}

function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    const gradient1 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient1.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
    gradient1.addColorStop(1, 'rgba(0, 217, 255, 0.0)');

    const gradient2 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient2.addColorStop(0, 'rgba(255, 107, 157, 0.4)');
    gradient2.addColorStop(1, 'rgba(255, 107, 157, 0.0)');

    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2015', '2017', '2019', '2021', '2023', '2024'],
            datasets: [
                {
                    label: 'Region A',
                    data: [42, 48, 54, 60, 66, 72],
                    borderColor: '#00D9FF',
                    backgroundColor: gradient1,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5
                },
                {
                    label: 'Region B',
                    data: [35, 45, 58, 68, 75, 80],
                    borderColor: '#FF6B9D',
                    backgroundColor: gradient2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#CBD5E1', padding: 15 }
                }
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

async function initializeComparisonChartFromData(comparisonData) {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    // Fetch historical data for both regions
    const regionA = document.getElementById('regionA').value;
    const regionB = document.getElementById('regionB').value;
    
    try {
        const [dataA, dataB] = await Promise.all([
            fetchRegionRange(regionA, 2015, 2024),
            fetchRegionRange(regionB, 2015, 2024)
        ]);

        const labels = dataA.data.map(d => d.year.toString());
        const valuesA = dataA.data.map(d => d.brightness);
        const valuesB = dataB.data.map(d => d.brightness);

        const gradient1 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient1.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
        gradient1.addColorStop(1, 'rgba(0, 217, 255, 0.0)');

        const gradient2 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient2.addColorStop(0, 'rgba(255, 107, 157, 0.4)');
        gradient2.addColorStop(1, 'rgba(255, 107, 157, 0.0)');

        comparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: comparisonData.regionA.name,
                        data: valuesA,
                        borderColor: '#00D9FF',
                        backgroundColor: gradient1,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 5
                    },
                    {
                        label: comparisonData.regionB.name,
                        data: valuesB,
                        borderColor: '#FF6B9D',
                        backgroundColor: gradient2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#CBD5E1', padding: 15 }
                    }
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
    } catch (error) {
        console.error('Error loading chart data:', error);
        // Fallback to default chart
        initializeComparisonChart();
    }
}

function setupBeforeAfterSlider() {
    const sliderHandle = document.getElementById('sliderHandle');
    const sliderContainer = document.querySelector('.slider-container');
    const afterImage = document.querySelector('.after-image');
    
    if (!sliderHandle || !sliderContainer || !afterImage) return;

    function updateSlider(clientX) {
        const rect = sliderContainer.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        
        if (percentage >= 0 && percentage <= 100) {
            sliderHandle.style.left = percentage + '%';
            afterImage.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        }
    }

    // Mouse events
    sliderHandle.addEventListener('mousedown', () => {
        isDragging = true;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSlider(e.clientX);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch events
    sliderHandle.addEventListener('touchstart', () => {
        isDragging = true;
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            updateSlider(e.touches[0].clientX);
        }
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Click on container
    sliderContainer.addEventListener('click', (e) => {
        updateSlider(e.clientX);
    });
}

function resetComparison() {
    document.getElementById('sliderSection').style.display = 'none';
    document.getElementById('comparisonStats').style.display = 'none';
    
    document.getElementById('regionA').selectedIndex = 0;
    document.getElementById('regionB').selectedIndex = 0;
    document.getElementById('yearA').selectedIndex = 0;
    document.getElementById('yearB').selectedIndex = document.getElementById('yearB').options.length - 1;
    
    showToast('Comparison reset', 'info');
}
