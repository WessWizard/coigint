let allActivities = [];
let allCameras = [];
let currentFilters = {
    activity: null,
    camera: null
};

let dashboardData = [];
let timeDistributionChart, topActivitiesChart, topCamerasChart, trendChart;

function loadDashboardReports(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
        alert("Nenhum arquivo selecionado.");
        return;
    }

    const reports = [];
    let filesProcessed = 0;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const reportData = JSON.parse(e.target.result);
                if (reportData.reportDate && validateDateFormat(reportData.reportDate)) {
                    reports.push(reportData);
                }
            } catch (err) {
                console.error(`Erro ao processar o arquivo ${file.name}:`, err);
            }
            
            filesProcessed++;
            if (filesProcessed === files.length) {
                if (reports.length === 0) {
                    alert("Nenhum relatório válido foi carregado.");
                    return;
                }
                dashboardData = reports;
                updateDashboard();
            }
        };
        reader.readAsText(file);
    });
}

function validateDateFormat(date) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    return regex.test(date);
}

function updateDashboard() {
    if (dashboardData.length === 0) return;

    const processedData = processDashboardData(dashboardData);
    
    updateFilters(processedData);
    
    const filteredData = applyFilters(processedData);
    
    updateMetrics(filteredData);
    updateCharts(filteredData);
}

function applyFilters(data) {
    if (!currentFilters.activity && !currentFilters.camera) {
        return data; 
    }

    const filteredData = {
        totalOccurrences: 0,
        activities: {},
        cameras: {},
        timeSlots: {
            manha: 0,
            tarde: 0,
            noite: 0,
            madrugada: 0
        },
        dates: [...new Set(data.dates)],
        dailyOccurrences: {},
        allActivities: data.allActivities,
        allCameras: data.allCameras
    };

    dashboardData.forEach(report => {
        report.sections.forEach(section => {
            const matchesActivity = !currentFilters.activity || 
                                  (section.options && section.options.includes(currentFilters.activity));
            
            const matchesCamera = !currentFilters.camera || 
                                (section.cameras && section.cameras.includes(currentFilters.camera));

            if (matchesActivity && matchesCamera) {
                filteredData.totalOccurrences++;
                
                const date = report.reportDate;
                filteredData.dailyOccurrences[date] = (filteredData.dailyOccurrences[date] || 0) + 1;
                
                if (!currentFilters.activity) {
                    section.options?.forEach(activity => {
                        if (activity !== "CADASTRO DE VIATURAS") {
                            filteredData.activities[activity] = (filteredData.activities[activity] || 0) + 1;
                        }
                    });
                } else {
                    filteredData.activities[currentFilters.activity] = 
                        (filteredData.activities[currentFilters.activity] || 0) + 1;
                }
                
                if (!currentFilters.camera) {
                    section.cameras?.forEach(camera => {
                        if (camera !== "Nenhuma") {
                            filteredData.cameras[camera] = (filteredData.cameras[camera] || 0) + 1;
                        }
                    });
                } else {
                    filteredData.cameras[currentFilters.camera] = 
                        (filteredData.cameras[currentFilters.camera] || 0) + 1;
                }
                
                if (section.time) {
                    const [hours] = section.time.split(':').map(Number);
                    if (hours >= 6 && hours < 12) {
                        filteredData.timeSlots.manha++;
                    } else if (hours >= 12 && hours < 18) {
                        filteredData.timeSlots.tarde++;
                    } else if (hours >= 18 && hours < 24) {
                        filteredData.timeSlots.noite++;
                    } else {
                        filteredData.timeSlots.madrugada++;
                    }
                }
            }
        });
    });

    return filteredData;
}

function processDashboardData(reports) {
    const result = {
        totalOccurrences: 0,
        activities: {},
        cameras: {},
        timeSlots: {
            manha: 0,
            tarde: 0,
            noite: 0,
            madrugada: 0
        },
        dates: [],
        dailyOccurrences: {},
        allActivities: new Set(),
        allCameras: new Set()
    };

    reports.forEach(report => {
        const date = report.reportDate;
        result.dates.push(date);
        result.dailyOccurrences[date] = 0;

        report.sections.forEach(section => {
            result.totalOccurrences++;
            result.dailyOccurrences[date]++;
            
            section.options?.forEach(activity => {
                if (activity !== "CADASTRO DE VIATURAS") {
                    result.activities[activity] = (result.activities[activity] || 0) + 1;
                    result.allActivities.add(activity);
                }
            });
            
            section.cameras?.forEach(camera => {
                if (camera !== "Nenhuma") {
                    result.cameras[camera] = (result.cameras[camera] || 0) + 1;
                    result.allCameras.add(camera);
                }
            });
            
            if (section.time) {
                const [hours] = section.time.split(':').map(Number);
                if (hours >= 6 && hours < 12) {
                    result.timeSlots.manha++;
                } else if (hours >= 12 && hours < 18) {
                    result.timeSlots.tarde++;
                } else if (hours >= 18 && hours < 24) {
                    result.timeSlots.noite++;
                } else {
                    result.timeSlots.madrugada++;
                }
            }
        });
    });

    result.allActivities = Array.from(result.allActivities).sort();
    result.allCameras = Array.from(result.allCameras).sort();
    
    return result;
}

function updateFilters(processedData) {
    const activityFilter = document.getElementById('activity-filter');
    const cameraFilter = document.getElementById('camera-filter');
    
    activityFilter.innerHTML = '<option value="">Todas as atividades</option>';
    cameraFilter.innerHTML = '<option value="">Todas as câmeras</option>';
    
    processedData.allActivities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity;
        option.textContent = activity;
        activityFilter.appendChild(option);
    });
    
    processedData.allCameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera;
        option.textContent = camera;
        cameraFilter.appendChild(option);
    });
}

function exportDashboardToPDF() {
    if (dashboardData.length === 0) {
        alert("Nenhum relatório carregado. Por favor, carregue relatórios antes de exportar para PDF.");
        return; 
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const lineHeight = 7;
    let y = margin;
    let pageNumber = 1;

    const addHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("DASHBOARD DE MONITORAMENTO - COI", pageWidth / 2, y, { align: 'center' });
        y += lineHeight * 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const now = new Date();
        const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        doc.text(`Gerado em: ${timestamp}`, pageWidth - margin, y, { align: 'right' });
        doc.text(`Página ${pageNumber}`, margin, y);
        y += lineHeight * 2;
    };

    addHeader();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("MÉTRICAS PRINCIPAIS", margin, y);
    y += lineHeight * 1.5;

    const metrics = [
        { title: "Total de Ocorrências", value: document.getElementById('total-occurrences').textContent },
        { title: "Atividade Mais Comum", value: document.getElementById('most-common-activity').textContent },
        { title: "Câmera Mais Usada", value: document.getElementById('most-used-camera').textContent },
        { title: "Período com Mais Ocorrências", value: document.getElementById('busiest-period').textContent }
    ];

    const colWidth = (pageWidth - 3 * margin) / 2;
    metrics.forEach((metric, index) => {
        if (y + lineHeight * 3 > pageHeight - margin) {
            doc.addPage('landscape');
            pageNumber++;
            y = margin;
            addHeader();
        }

        const col = index % 2;
        const x = margin + col * (colWidth + margin);

        doc.setFont("helvetica", "bold");
        doc.text(`${metric.title}:`, x, y);
        doc.setFont("helvetica", "normal");
        
        const valueLines = doc.splitTextToSize(metric.value, colWidth - 10);
        valueLines.forEach((line, i) => {
            doc.text(line, x + 5, y + lineHeight * (i + 1));
        });

        if (col === 1 || index === metrics.length - 1) {
            y += Math.max(2, valueLines.length) * lineHeight + lineHeight;
        }
    });

    const charts = [
        { id: 'timeDistributionChart', title: 'Distribuição por Período do Dia', height: 90 },
        { id: 'topActivitiesChart', title: 'Top 5 Atividades', height: 90 },
        { id: 'topCamerasChart', title: 'Top 5 Câmeras', height: 90 },
        { id: 'trendChart', title: 'Tendência Temporal', height: 100 }
    ];
    y += lineHeight * 2;

    charts.forEach(chart => {
        const canvas = document.getElementById(chart.id);
        if (!canvas) return;

        const neededSpace = chart.height + lineHeight * 2;

        if (y + neededSpace > pageHeight - margin) {
            doc.addPage('landscape');
            pageNumber++;
            y = margin;
            addHeader();
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(chart.title, margin, y);
        y += lineHeight * 1.5;

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = chart.height;

        doc.addImage(imgData, 'JPEG', margin, y, imgWidth, imgHeight);
        y += imgHeight + lineHeight * 2;
    });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Prefeitura do Cabo de Santo Agostinho. Gerência de Inteligência - COI", 
             pageWidth / 2, pageHeight - margin, { align: 'center' });

    doc.save(`dashboard_coi_${new Date().getTime()}.pdf`);
}

function updateMetrics(data) {
    document.getElementById('total-occurrences').textContent = data.totalOccurrences;
    
    const mostCommonActivity = Object.entries(data.activities).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('most-common-activity').textContent = 
        mostCommonActivity ? `${mostCommonActivity[0]} (${mostCommonActivity[1]})` : 'Nenhuma';
    
    const mostUsedCamera = Object.entries(data.cameras).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('most-used-camera').textContent = 
        mostUsedCamera ? `${mostUsedCamera[0]} (${mostUsedCamera[1]})` : 'Nenhuma';
    
    const busiestPeriod = Object.entries(data.timeSlots).sort((a, b) => b[1] - a[1])[0];
    const periodNames = {
        manha: 'Manhã (06:00-12:00)',
        tarde: 'Tarde (12:00-18:00)',
        noite: 'Noite (18:00-00:00)',
        madrugada: 'Madrugada (00:00-06:00)'
    };
    document.getElementById('busiest-period').textContent = 
        busiestPeriod ? `${periodNames[busiestPeriod[0]]} (${busiestPeriod[1]})` : 'Nenhum';
}

function updateCharts(data) {
    [timeDistributionChart, topActivitiesChart, topCamerasChart, trendChart].forEach(chart => {
        if (chart) chart.destroy();
    });

    const theme = {
        textColor: '#ffffff',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        background: '#2d3748'
    };

    timeDistributionChart = createChart({
        canvasId: 'timeDistributionChart',
        type: 'bar',
        labels: ['Manhã (06:00-12:00)', 'Tarde (12:00-18:00)', 'Noite (18:00-00:00)', 'Madrugada (00:00-06:00)'],
        data: [
            data.timeSlots.manha,
            data.timeSlots.tarde,
            data.timeSlots.noite,
            data.timeSlots.madrugada
        ],
        label: 'Ocorrências',
        color: 'rgba(54, 162, 235, 0.6)',
        theme
    });

    const topActivities = Object.entries(data.activities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topActivitiesChart = createChart({
        canvasId: 'topActivitiesChart',
        type: 'doughnut',
        labels: topActivities.map(([activity]) => activity),
        data: topActivities.map(([_, count]) => count),
        label: 'Ocorrências',
        color: 'rgba(153, 102, 255, 0.6)',
        theme
    });

    const topCameras = Object.entries(data.cameras)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topCamerasChart = createChart({
        canvasId: 'topCamerasChart',
        type: 'doughnut',
        labels: topCameras.map(([camera]) => camera),
        data: topCameras.map(([_, count]) => count),
        label: 'Ocorrências',
        color: 'rgba(75, 192, 192, 0.6)',
        theme
    });

    const sortedDates = [...data.dates].sort((a, b) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });
    
    trendChart = createChart({
        canvasId: 'trendChart',
        type: 'line',
        labels: sortedDates,
        data: sortedDates.map(date => data.dailyOccurrences[date] || 0),
        label: 'Ocorrências por dia',
        color: 'rgba(255, 99, 132, 0.6)',
        theme
    });
}

function createChart({ canvasId, type, labels, data, label, color, theme }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: type === 'line' ? color : [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: type === 'line' ? color : theme.background,
                borderWidth: 2,
                tension: type === 'line' ? 0.1 : 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    color: theme.textColor,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    labels: {
                        color: theme.textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: theme.textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: theme.gridColor
                    }
                },
                x: {
                    ticks: {
                        color: theme.textColor
                    },
                    grid: {
                        color: theme.gridColor
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('load-dashboard-reports').addEventListener('change', loadDashboardReports);
    
    document.getElementById('apply-filters').addEventListener('click', function() {
        currentFilters.activity = document.getElementById('activity-filter').value || null;
        currentFilters.camera = document.getElementById('camera-filter').value || null;
        
        if (dashboardData.length > 0) {
            const processedData = processDashboardData(dashboardData);
            const filteredData = applyFilters(processedData);
            updateMetrics(filteredData);
            updateCharts(filteredData);
        }
    });
    
    document.getElementById('reset-filters').addEventListener('click', function() {
        document.getElementById('activity-filter').value = '';
        document.getElementById('camera-filter').value = '';
        currentFilters.activity = null;
        currentFilters.camera = null;
        
        if (dashboardData.length > 0) {
            const processedData = processDashboardData(dashboardData);
            updateMetrics(processedData);
            updateCharts(processedData);
        }
    });
});

document.getElementById('load-dashboard-reports').addEventListener('change', function(e) {
    const fileChosen = document.getElementById('file-chosen');
    if (this.files.length > 0) {
        fileChosen.textContent = `${this.files.length} arquivo(s) selecionado(s)`;
    } else {
        fileChosen.textContent = 'Nenhum arquivo selecionado';
    }
    loadDashboardReports(e); 
});

const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});