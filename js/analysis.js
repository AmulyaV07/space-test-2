// ====================================
// ANALYSIS PAGE FUNCTIONALITY
// ====================================

let growthChart, distributionChart;

document.addEventListener('DOMContentLoaded', () => {
    setupAnalysisListeners();
});

function setupAnalysisListeners() {
    const generateBtn = document.getElementById('generateAnalysisBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateAnalysis);
    }

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadPDF);
    }

    const exportPdf = document.getElementById('exportPdf');
    if (exportPdf) {
        exportPdf.addEventListener('click', downloadPDF);
    }

    const exportCsv = document.getElementById('exportCsv');
    if (exportCsv) {
        exportCsv.addEventListener('click', exportAnalysisCSV);
    }

    const exportJson = document.getElementById('exportJson');
    if (exportJson) {
        exportJson.addEventListener('click', exportAnalysisJSON);
    }

    const shareReport = document.getElementById('shareReport');
    if (shareReport) {
        shareReport.addEventListener('click', shareReportLink);
    }
}

async function generateAnalysis() {
    const region = document.getElementById('analysisRegion').value;
    const startYear = document.getElementById('startYear').value;
    const endYear = document.getElementById('endYear').value;

    showLoading();
    
    try {
        // Fetch analysis data from API
        const analysisData = await fetchAnalysis(region, startYear, endYear);
        
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        
        // Update summary values from API
        document.getElementById('overallGrowth').textContent = analysisData.summary.overallGrowth;
        document.getElementById('urbanArea').textContent = analysisData.summary.urbanExpansion;
        document.getElementById('electRate').textContent = analysisData.summary.electrificationRate || 'N/A';
        document.getElementById('hotspots').textContent = analysisData.summary.hotspots;
        
        // Populate table with API data
        populateAnalysisTableFromData(analysisData.yearlyData);
        
        // Initialize charts with API data
        initializeChartsFromData(analysisData.yearlyData);
        
        hideLoading();
        showToast('Analysis generated successfully!', 'success');
    } catch (error) {
        console.error('Error fetching analysis:', error);
        hideLoading();
        showToast('Error generating analysis. Using fallback data.', 'warning');
        
        // Fallback to original behavior
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('overallGrowth').textContent = `+${generateRandomData(35, 50)}%`;
        document.getElementById('urbanArea').textContent = `${generateRandomData(120, 200)} km²`;
        document.getElementById('electRate').textContent = `${generateRandomData(85, 98)}%`;
        document.getElementById('hotspots').textContent = generateRandomData(15, 35);
        populateAnalysisTable(startYear, endYear);
        initializeCharts();
    }
}

function populateAnalysisTable(startYear, endYear) {
    const tbody = document.getElementById('analysisTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    
    for (let year = start; year <= end; year++) {
        const brightness = 45 + ((year - start) * 5);
        const growth = year === start ? '-' : `+${(5 + Math.random() * 3).toFixed(1)}%`;
        const area = 500 + ((year - start) * 30);
        const status = growth === '-' ? 'Baseline' : 'Growing';
        
        const row = `
            <tr>
                <td>${year}</td>
                <td>${brightness.toFixed(1)}</td>
                <td style="color: ${growth === '-' ? '#64748B' : '#10B981'}; font-weight: 600;">${growth}</td>
                <td>${area}</td>
                <td><span style="padding: 0.25rem 0.75rem; background: rgba(16, 185, 129, 0.2); color: #10B981; border-radius: 12px; font-size: 0.85rem;">${status}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    }
}

function populateAnalysisTableFromData(yearlyData) {
    const tbody = document.getElementById('analysisTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    yearlyData.forEach((data, index) => {
        const growth = index === 0 ? '-' : `+${data.growth.toFixed(1)}%`;
        const status = growth === '-' ? 'Baseline' : 'Growing';
        
        const row = `
            <tr>
                <td>${data.year}</td>
                <td>${data.brightness.toFixed(1)}</td>
                <td style="color: ${growth === '-' ? '#64748B' : '#10B981'}; font-weight: 600;">${growth}</td>
                <td>${Math.round(data.area)}</td>
                <td><span style="padding: 0.25rem 0.75rem; background: rgba(16, 185, 129, 0.2); color: #10B981; border-radius: 12px; font-size: 0.85rem;">${status}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function initializeCharts() {
    // Growth Chart [web:50]
    const growthCtx = document.getElementById('growthChart');
    if (growthCtx && !growthChart) {
        const gradient = growthCtx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        
        growthChart = new Chart(growthCtx, {
            type: 'bar',
            data: {
                labels: ['2015', '2017', '2019', '2021', '2023', '2024'],
                datasets: [{
                    label: 'Growth Rate %',
                    data: [0, 5.2, 6.8, 7.5, 8.1, 9.3],
                    backgroundColor: gradient,
                    borderColor: '#10B981',
                    borderWidth: 2,
                    borderRadius: 8
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
                        grid: { display: false },
                        ticks: { color: '#64748B' }
                    }
                }
            }
        });
    }

    // Distribution Chart
    const distCtx = document.getElementById('distributionChart');
    if (distCtx && !distributionChart) {
        distributionChart = new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: ['Urban Core', 'Suburban', 'Industrial', 'Rural', 'Other'],
                datasets: [{
                    data: [35, 28, 18, 12, 7],
                    backgroundColor: [
                        '#00D9FF',
                        '#7C3AED',
                        '#F59E0B',
                        '#10B981',
                        '#64748B'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#CBD5E1', padding: 15 }
                    }
                }
            }
        });
    }
}

function initializeChartsFromData(yearlyData) {
    // Growth Chart
    const growthCtx = document.getElementById('growthChart');
    if (growthCtx) {
        if (growthChart) {
            growthChart.destroy();
        }
        
        const gradient = growthCtx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        
        const labels = yearlyData.map(d => d.year.toString());
        const growthData = yearlyData.map(d => d.growth);
        
        growthChart = new Chart(growthCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Growth Rate %',
                    data: growthData,
                    backgroundColor: gradient,
                    borderColor: '#10B981',
                    borderWidth: 2,
                    borderRadius: 8
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
                        grid: { display: false },
                        ticks: { color: '#64748B' }
                    }
                }
            }
        });
    }

    // Distribution Chart (keep default for now)
    const distCtx = document.getElementById('distributionChart');
    if (distCtx && !distributionChart) {
        distributionChart = new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: ['Urban Core', 'Suburban', 'Industrial', 'Rural', 'Other'],
                datasets: [{
                    data: [35, 28, 18, 12, 7],
                    backgroundColor: [
                        '#00D9FF',
                        '#7C3AED',
                        '#F59E0B',
                        '#10B981',
                        '#64748B'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#CBD5E1', padding: 15 }
                    }
                }
            }
        });
    }
}

function downloadPDF() {
    showLoading();
    
    // Using jsPDF library [web:55][web:58]
    setTimeout(() => {
        if (typeof jsPDF === 'undefined') {
            showToast('PDF library not loaded. Please refresh the page.', 'error');
            hideLoading();
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(0, 217, 255);
        doc.text('NightLight Economy Analysis Report', 20, 20);
        
        // Add metadata
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
        doc.text(`Region: ${document.getElementById('analysisRegion').value}`, 20, 37);
        
        // Add summary
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary Statistics', 20, 50);
        
        doc.setFontSize(11);
        doc.text(`Overall Growth: ${document.getElementById('overallGrowth').textContent}`, 30, 60);
        doc.text(`Urban Expansion: ${document.getElementById('urbanArea').textContent}`, 30, 67);
        doc.text(`Electrification Rate: ${document.getElementById('electRate').textContent}`, 30, 74);
        doc.text(`Hotspots Detected: ${document.getElementById('hotspots').textContent}`, 30, 81);
        
        // Add conclusion
        doc.text('This analysis uses NASA VIIRS satellite data to track economic activity.', 20, 100);
        
        doc.save(`nightlight-report-${Date.now()}.pdf`);
        
        hideLoading();
        showToast('PDF downloaded successfully!', 'success');
    }, 1000);
}

function exportAnalysisCSV() {
    const data = [];
    const rows = document.querySelectorAll('#analysisTableBody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        data.push({
            Year: cells[0].textContent,
            AvgBrightness: cells[1].textContent,
            GrowthRate: cells[2].textContent,
            UrbanArea: cells[3].textContent,
            Status: cells[4].textContent.trim()
        });
    });
    
    exportToCSV(data, `analysis-${Date.now()}.csv`);
}

function exportAnalysisJSON() {
    const data = {
        region: document.getElementById('analysisRegion').value,
        generatedAt: new Date().toISOString(),
        summary: {
            overallGrowth: document.getElementById('overallGrowth').textContent,
            urbanArea: document.getElementById('urbanArea').textContent,
            electrificationRate: document.getElementById('electRate').textContent,
            hotspots: document.getElementById('hotspots').textContent
        },
        yearlyData: []
    };
    
    const rows = document.querySelectorAll('#analysisTableBody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        data.yearlyData.push({
            year: cells[0].textContent,
            brightness: cells[1].textContent,
            growth: cells[2].textContent,
            area: cells[3].textContent,
            status: cells[4].textContent.trim()
        });
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('JSON exported successfully!', 'success');
}

function shareReportLink() {
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'NightLight Economy Analysis',
            text: 'Check out this satellite-based economic analysis!',
            url: url
        }).then(() => {
            showToast('Report shared successfully!', 'success');
        }).catch(() => {
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Link copied to clipboard!', 'success');
}
