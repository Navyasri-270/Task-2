// App Javascript for Superstore Analytics Dashboard

// Global State
let rawData = [];
let filteredData = [];

// Chart References (for cleaning up/destroying chart instances before re-render)
let charts = {
    salesTrend: null,
    regionDonut: null,
    categoryBar: null,
    subcategoryProfit: null,
    salesProfitScatter: null
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    setupTabSwitching();
    loadDashboardData();
    setupFilters();
});

// Load the JSON data
function loadDashboardData() {
    try {
        if (typeof superstoreData === 'undefined') {
            throw new Error("superstoreData is not defined. Make sure data.js is loaded correctly.");
        }
        rawData = superstoreData;
        
        // Initial setup
        filteredData = [...rawData];
        
        // Render Dashboard Metrics & Charts
        updateDashboard();
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
    }
}

// Tab Switching (Dashboard vs Storyboard)
function setupTabSwitching() {
    const btnDashboard = document.getElementById('btn-dashboard');
    const btnStory = document.getElementById('btn-story');
    const tabDashboardContent = document.getElementById('tab-dashboard-content');
    const tabStoryContent = document.getElementById('tab-story-content');

    btnDashboard.addEventListener('click', () => {
        btnDashboard.classList.add('active', 'text-white');
        btnDashboard.classList.remove('text-slate-400');
        btnStory.classList.remove('active', 'text-white');
        btnStory.classList.add('text-slate-400');
        
        tabDashboardContent.classList.remove('hidden');
        tabStoryContent.classList.add('hidden');
        
        // Re-render plotly charts to ensure correct dimensions
        setTimeout(renderPlotlyCharts, 100);
    });

    btnStory.addEventListener('click', () => {
        btnStory.classList.add('active', 'text-white');
        btnStory.classList.remove('text-slate-400');
        btnDashboard.classList.remove('active', 'text-white');
        btnDashboard.classList.add('text-slate-400');
        
        tabStoryContent.classList.remove('hidden');
        tabDashboardContent.classList.add('hidden');
        
        updateStoryboardMetrics();
    });
}

// Filter Event Listeners
function setupFilters() {
    const filters = ['region', 'category', 'segment', 'year'];
    
    filters.forEach(filterId => {
        document.getElementById(`filter-${filterId}`).addEventListener('change', () => {
            applyFilters();
        });
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        filters.forEach(filterId => {
            document.getElementById(`filter-${filterId}`).value = 'All';
        });
        applyFilters();
    });
}

// Filter Logic
function applyFilters() {
    const regionVal = document.getElementById('filter-region').value;
    const categoryVal = document.getElementById('filter-category').value;
    const segmentVal = document.getElementById('filter-segment').value;
    const yearVal = document.getElementById('filter-year').value;

    filteredData = rawData.filter(item => {
        const matchRegion = regionVal === 'All' || item.Region === regionVal;
        const matchCategory = categoryVal === 'All' || item.Category === categoryVal;
        const matchSegment = segmentVal === 'All' || item.Segment === segmentVal;
        const matchYear = yearVal === 'All' || String(item.Year) === yearVal;
        
        return matchRegion && matchCategory && matchSegment && matchYear;
    });

    updateDashboard();
}

// Main Dashboard Update
function updateDashboard() {
    renderKPIs();
    renderChartSalesTrend();
    renderChartRegionDonut();
    renderChartCategoryBar();
    renderChartSubcategoryProfit();
    renderChartSalesProfitScatter();
    renderPlotlyCharts(); // Map and Treemap
    updateCalloutCards();
}

// 1. KPI Cards Rendering
function renderKPIs() {
    const totalSales = filteredData.reduce((sum, item) => sum + item.Sales, 0);
    const totalProfit = filteredData.reduce((sum, item) => sum + item.Profit, 0);
    const uniqueOrders = new Set(filteredData.map(item => item['Order ID'])).size;
    
    // Average Discount calculation
    let avgDiscount = 0;
    if (filteredData.length > 0) {
        avgDiscount = filteredData.reduce((sum, item) => sum + item.Discount, 0) / filteredData.length;
    }
    
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
    const avgOrderValue = uniqueOrders > 0 ? totalSales / uniqueOrders : 0;

    // Set UI Values
    document.getElementById('kpi-sales').innerText = formatCurrency(totalSales);
    document.getElementById('kpi-profit').innerText = formatCurrency(totalProfit);
    document.getElementById('kpi-orders').innerText = formatNumber(uniqueOrders);
    document.getElementById('kpi-discount').innerText = formatPercentage(avgDiscount);
    document.getElementById('kpi-avg-order').innerText = formatCurrency(avgOrderValue);
    
    // Margin Badge
    const marginBadge = document.getElementById('kpi-margin');
    marginBadge.innerText = `${profitMargin.toFixed(1)}%`;
    if (profitMargin < 5) {
        marginBadge.className = 'font-bold text-rose-600';
    } else if (profitMargin < 12) {
        marginBadge.className = 'font-bold text-amber-600';
    } else {
        marginBadge.className = 'font-bold text-emerald-600';
    }
}

// Helper: Format Currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Helper: Format Number
function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

// Helper: Format Percentage
function formatPercentage(value) {
    // Check if value is already a decimal (e.g. 0.15 for 15%) or percentage (e.g. 15 for 15%)
    // The csv discount column is typically 0 to 0.8
    return `${(value * 100).toFixed(1)}%`;
}

// 2. Line Chart: Monthly Sales Trend
function renderChartSalesTrend() {
    const ctx = document.getElementById('chart-sales-trend').getContext('2d');
    
    // Aggregate by Year-Month
    const monthlyAgg = {};
    filteredData.forEach(item => {
        const monthKey = item.Month; // e.g. "2017-11"
        if (!monthlyAgg[monthKey]) {
            monthlyAgg[monthKey] = { sales: 0, profit: 0 };
        }
        monthlyAgg[monthKey].sales += item.Sales;
        monthlyAgg[monthKey].profit += item.Profit;
    });

    // Sort Month Keys
    const sortedMonths = Object.keys(monthlyAgg).sort();
    const salesData = sortedMonths.map(m => monthlyAgg[m].sales);
    const profitData = sortedMonths.map(m => monthlyAgg[m].profit);

    if (charts.salesTrend) {
        charts.salesTrend.destroy();
    }

    charts.salesTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths.map(m => {
                const parts = m.split('-');
                const d = new Date(parts[0], parts[1] - 1);
                return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }),
            datasets: [
                {
                    label: 'Monthly Sales',
                    data: salesData,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#2563eb',
                    pointRadius: 1.5,
                    pointHoverRadius: 5
                },
                {
                    label: 'Monthly Profit',
                    data: profitData,
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 1,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: 'Outfit', size: 11, weight: '500' },
                        boxWidth: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit', size: 10 } }
                },
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        font: { family: 'Outfit', size: 10 },
                        callback: function(value) {
                            return value >= 1000 ? '$' + (value/1000) + 'k' : '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// 3. Donut Chart: Sales by Region
function renderChartRegionDonut() {
    const ctx = document.getElementById('chart-region-donut').getContext('2d');
    
    // Aggregate by Region
    const regionAgg = {};
    filteredData.forEach(item => {
        if (!regionAgg[item.Region]) {
            regionAgg[item.Region] = 0;
        }
        regionAgg[item.Region] += item.Sales;
    });

    const regions = Object.keys(regionAgg);
    const sales = Object.values(regionAgg);

    if (charts.regionDonut) {
        charts.regionDonut.destroy();
    }

    const palette = ['#1e3a8a', '#2563eb', '#60a5fa', '#93c5fd'];

    charts.regionDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: regions,
            datasets: [{
                data: sales,
                backgroundColor: palette,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Outfit', size: 10, weight: '500' },
                        boxWidth: 10,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((val / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(val)} (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// 4. Bar Chart: Sales by Category
function renderChartCategoryBar() {
    const ctx = document.getElementById('chart-category-bar').getContext('2d');
    
    // Aggregate by Category
    const catSales = {};
    const catProfit = {};
    filteredData.forEach(item => {
        if (!catSales[item.Category]) {
            catSales[item.Category] = 0;
            catProfit[item.Category] = 0;
        }
        catSales[item.Category] += item.Sales;
        catProfit[item.Category] += item.Profit;
    });

    const categories = Object.keys(catSales);
    const sales = Object.values(catSales);
    const profits = Object.values(catProfit);

    // Update Category Badge
    let topCat = "Technology";
    let topSalesVal = 0;
    categories.forEach(c => {
        if (catSales[c] > topSalesVal) {
            topSalesVal = catSales[c];
            topCat = c;
        }
    });
    document.getElementById('top-cat-badge').innerText = `Top: ${topCat}`;

    if (charts.categoryBar) {
        charts.categoryBar.destroy();
    }

    charts.categoryBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Sales ($)',
                    data: sales,
                    backgroundColor: '#1e3a8a',
                    borderRadius: 6
                },
                {
                    label: 'Profit ($)',
                    data: profits,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { family: 'Outfit', size: 11, weight: '500' } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit', size: 11 } }
                },
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        font: { family: 'Outfit', size: 10 },
                        callback: function(value) {
                            return value >= 1000 ? '$' + (value/1000) + 'k' : '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// 5. Profit by Sub-Category Bar Chart
function renderChartSubcategoryProfit() {
    const ctx = document.getElementById('chart-subcategory-profit').getContext('2d');
    
    // Aggregate by Sub-Category
    const subcatAgg = {};
    filteredData.forEach(item => {
        if (!subcatAgg[item['Sub-Category']]) {
            subcatAgg[item['Sub-Category']] = { sales: 0, profit: 0 };
        }
        subcatAgg[item['Sub-Category']].sales += item.Sales;
        subcatAgg[item['Sub-Category']].profit += item.Profit;
    });

    const subcategories = Object.keys(subcatAgg);
    // Sort by profit descending
    subcategories.sort((a, b) => subcatAgg[b].profit - subcatAgg[a].profit);

    const profits = subcategories.map(s => subcatAgg[s].profit);

    if (charts.subcategoryProfit) {
        charts.subcategoryProfit.destroy();
    }

    charts.subcategoryProfit = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subcategories,
            datasets: [{
                label: 'Profit ($)',
                data: profits,
                backgroundColor: profits.map(p => p >= 0 ? '#10b981' : '#ef4444'),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Profit: ${formatCurrency(context.parsed.x)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        font: { family: 'Outfit', size: 9 },
                        callback: function(value) {
                            return value >= 0 ? '$' + value : '-$' + Math.abs(value);
                        }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit', size: 9 } }
                }
            }
        }
    });
}

// 6. Scatter Plot: Sales vs Profit
function renderChartSalesProfitScatter() {
    const ctx = document.getElementById('chart-sales-profit-scatter').getContext('2d');
    
    // To avoid lag, we sample or bin transaction data. Let's aggregate by Customer/Product or pick a clean sample.
    // Let's sample 150 points for clean visualization
    let sampledPoints = [...filteredData];
    if (sampledPoints.length > 250) {
        // Simple systematic sample
        const step = Math.floor(sampledPoints.length / 250);
        sampledPoints = sampledPoints.filter((_, idx) => idx % step === 0);
    }

    const scatterData = sampledPoints.map(item => ({
        x: item.Sales,
        y: item.Profit,
        profit: item.Profit,
        subcat: item['Sub-Category']
    }));

    if (charts.salesProfitScatter) {
        charts.salesProfitScatter.destroy();
    }

    charts.salesProfitScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Transactions',
                data: scatterData,
                backgroundColor: scatterData.map(d => d.y >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
                borderColor: scatterData.map(d => d.y >= 0 ? '#10b981' : '#ef4444'),
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const p = context.raw;
                            return `Sub-Cat: ${p.subcat} | Sales: ${formatCurrency(p.x)} | Profit: ${formatCurrency(p.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Sales ($)', font: { family: 'Outfit', size: 11, weight: 'bold' } },
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Outfit', size: 10 } }
                },
                y: {
                    title: { display: true, text: 'Profit ($)', font: { family: 'Outfit', size: 11, weight: 'bold' } },
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Outfit', size: 10 } }
                }
            }
        }
    });
}

// 7. Render Plotly Charts (Map & Treemap)
function renderPlotlyCharts() {
    renderUSMap();
    renderSegmentTreemap();
}

// 7.1 Sales by State Map using Plotly
function renderUSMap() {
    // State abbreviation mapping
    const stateAbbrs = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };

    // Aggregate Sales & Profit by State
    const stateAgg = {};
    filteredData.forEach(item => {
        const stateName = item.State;
        if (!stateAgg[stateName]) {
            stateAgg[stateName] = { sales: 0, profit: 0 };
        }
        stateAgg[stateName].sales += item.Sales;
        stateAgg[stateName].profit += item.Profit;
    });

    const locations = [];
    const salesValues = [];
    const hoverTexts = [];

    Object.keys(stateAgg).forEach(state => {
        const code = stateAbbrs[state];
        if (code) {
            locations.push(code);
            salesValues.push(stateAgg[state].sales);
            hoverTexts.push(`${state}<br>Sales: ${formatCurrency(stateAgg[state].sales)}<br>Profit: ${formatCurrency(stateAgg[state].profit)}`);
        }
    });

    const data = [{
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: locations,
        z: salesValues,
        text: hoverTexts,
        hoverinfo: 'text',
        colorscale: 'Blues',
        autocolorscale: false,
        reversescale: false,
        marker: {
            line: {
                color: 'rgb(255,255,255)',
                width: 1
            }
        },
        colorbar: {
            title: 'Sales ($)',
            thickness: 15,
            x: 0.9,
            tickfont: { family: 'Outfit', size: 9 }
        }
    }];

    const layout = {
        title: {
            text: '',
        },
        geo: {
            scope: 'usa',
            projection: {
                type: 'albers usa'
            },
            showlakes: true,
            lakecolor: 'rgb(255, 255, 255)',
            bgcolor: 'rgba(0,0,0,0)'
        },
        margin: { l: 0, r: 0, t: 0, b: 0 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    const config = { responsive: true, displayModeBar: false };

    Plotly.newPlot('chart-state-map', data, layout, config);
}

// 7.2 Segment Treemap using Plotly
function renderSegmentTreemap() {
    // Aggregate Sales by Segment
    const segAgg = {};
    filteredData.forEach(item => {
        if (!segAgg[item.Segment]) {
            segAgg[item.Segment] = 0;
        }
        segAgg[item.Segment] += item.Sales;
    });

    const labels = Object.keys(segAgg);
    const parents = labels.map(() => "");
    const values = Object.values(segAgg);

    const data = [{
        type: "treemap",
        labels: labels,
        parents: parents,
        values: values,
        textinfo: "label+value+percent parent",
        textfont: { family: "Outfit", size: 12 },
        marker: {
            colors: ['#1e3a8a', '#2563eb', '#60a5fa']
        },
        hoverinfo: "label+value+percent parent"
    }];

    const layout = {
        margin: { l: 0, r: 0, t: 0, b: 0 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    const config = { responsive: true, displayModeBar: false };

    Plotly.newPlot('chart-segment-treemap', data, layout, config);
}

// 8. Update Callouts/Insights Banner based on filter state
function updateCalloutCards() {
    const totalSales = filteredData.reduce((sum, item) => sum + item.Sales, 0);
    const totalProfit = filteredData.reduce((sum, item) => sum + item.Profit, 0);
    const margin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
    
    let topPerformer = "Technology generates the highest sales volume and keeps the strongest profits.";
    let profitLeak = "Furniture generates high sales but extremely low profits (2.5% margin) due to excessive discount rates on Tables.";
    let regionalChampion = "West region leads all geographies, generating the highest total profit.";

    // If specific filters are applied, tailor the banner recommendations
    const selectedRegion = document.getElementById('filter-region').value;
    const selectedCategory = document.getElementById('filter-category').value;
    
    if (selectedRegion !== 'All') {
        regionalChampion = `${selectedRegion} region currently analyzed: Profit margin stands at ${margin.toFixed(1)}%.`;
    }
    if (selectedCategory !== 'All') {
        topPerformer = `${selectedCategory} category currently active: Total Category Sales are ${formatCurrency(totalSales)}.`;
    }

    document.getElementById('callout-top-performer').innerText = topPerformer;
    document.getElementById('callout-profit-leak').innerText = profitLeak;
    document.getElementById('callout-regional').innerText = regionalChampion;
}

// 9. Update Storyboard Metrics & Margins Dynamically
function updateStoryboardMetrics() {
    const totalSales = filteredData.reduce((sum, item) => sum + item.Sales, 0);
    const totalProfit = filteredData.reduce((sum, item) => sum + item.Profit, 0);
    const uniqueOrders = new Set(filteredData.map(item => item['Order ID'])).size;
    const margin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    document.getElementById('story-sales').innerText = formatCurrency(totalSales);
    document.getElementById('story-profit').innerText = formatCurrency(totalProfit);
    document.getElementById('story-orders').innerText = formatNumber(uniqueOrders);
    document.getElementById('story-margin').innerText = `${margin.toFixed(1)}%`;

    // Category Specific Margins
    const catSales = { 'Technology': 0, 'Office Supplies': 0, 'Furniture': 0 };
    const catProfit = { 'Technology': 0, 'Office Supplies': 0, 'Furniture': 0 };

    filteredData.forEach(item => {
        if (catSales[item.Category] !== undefined) {
            catSales[item.Category] += item.Sales;
            catProfit[item.Category] += item.Profit;
        }
    });

    const techMargin = catSales['Technology'] > 0 ? (catProfit['Technology'] / catSales['Technology']) * 100 : 0;
    const officeMargin = catSales['Office Supplies'] > 0 ? (catProfit['Office Supplies'] / catSales['Office Supplies']) * 100 : 0;
    const furnMargin = catSales['Furniture'] > 0 ? (catProfit['Furniture'] / catSales['Furniture']) * 100 : 0;

    document.getElementById('story-margin-tech').innerText = `${techMargin.toFixed(1)}%`;
    document.getElementById('story-margin-office').innerText = `${officeMargin.toFixed(1)}%`;
    document.getElementById('story-margin-furniture').innerText = `${furnMargin.toFixed(1)}%`;

    // Region Specific Margins
    const regSales = { 'West': 0, 'East': 0, 'South': 0, 'Central': 0 };
    const regProfit = { 'West': 0, 'East': 0, 'South': 0, 'Central': 0 };

    filteredData.forEach(item => {
        if (regSales[item.Region] !== undefined) {
            regSales[item.Region] += item.Sales;
            regProfit[item.Region] += item.Profit;
        }
    });

    Object.keys(regSales).forEach(reg => {
        const m = regSales[reg] > 0 ? (regProfit[reg] / regSales[reg]) * 100 : 0;
        const lowercaseReg = reg.toLowerCase();
        const el = document.getElementById(`story-region-${lowercaseReg}-margin`);
        if (el) {
            el.innerText = `${m.toFixed(1)}%`;
        }
    });
}
