        // ═══════════════════════════════════════════════════════════════
        //  DASHBOARD & MODEL GRID ENGINE
        // ═══════════════════════════════════════════════════════════════

        // ── Dark Mode ──
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const toggle = document.getElementById('darkModeToggle');
            const icon = document.getElementById('darkModeIcon');
            const isDark = document.body.classList.contains('dark-mode');
            toggle.classList.toggle('active', isDark);
            icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
            localStorage.setItem('dsf_darkMode', isDark ? '1' : '0');
            // Re-render charts with updated colors
            if (modelData) {
                setTimeout(() => {
                    renderDashboardCharts();
                    renderDashboardGauge();
                }, 100);
            }
        }
        function initDarkMode() {
            if (localStorage.getItem('dsf_darkMode') === '1') {
                document.body.classList.add('dark-mode');
                const toggle = document.getElementById('darkModeToggle');
                const icon = document.getElementById('darkModeIcon');
                if (toggle) toggle.classList.add('active');
                if (icon) icon.className = 'fas fa-moon';
            }
        }

        // ── Dashboard Renderer ──
        function renderDashboard() {
            if (!modelData) return;
            renderDashboardKPIs();
            renderDashboardCharts();
            renderDashboardGauge();
            renderDashboardHeatmap();
            renderDashboardPeers();
            renderDashboardRiskRings();
        }

        function renderDashboardKPIs() {
            const p = getCurrentParams();
            const fmt = (n, prefix) => (prefix || '₹') + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
            const fmtPct = (n) => (n > 0 ? '+' : '') + n.toFixed(1) + '%';

            document.getElementById('dashPrice').textContent = fmt(modelData.price);
            document.getElementById('dashFairValue').textContent = fmt(modelData.dcfPrice);
            document.getElementById('dashUpside').textContent = fmtPct(modelData.upside);
            document.getElementById('dashUpside').className = 'kpi-value ' + (modelData.upside > 0 ? 'positive' : 'negative');
            document.getElementById('dashRating').textContent = modelData.rating;
            document.getElementById('dashEV').textContent = fmt(modelData.ev);
            document.getElementById('dashEqValue').textContent = fmt(modelData.eq);

            const badge = document.getElementById('dashRatingBadge');
            if (badge) {
                badge.textContent = modelData.rating;
                badge.className = 'kpi-badge ' + modelData.rating.toLowerCase();
            }

            // Sparklines
            renderSparkline('dashPriceSpark', [modelData.price * 0.7, modelData.price * 0.85, modelData.price * 0.92, modelData.price * 0.98, modelData.price], '#2563EB');
            renderSparkline('dashFairValueSpark', [modelData.dcfPrice * 0.6, modelData.dcfPrice * 0.75, modelData.dcfPrice * 0.88, modelData.dcfPrice * 0.95, modelData.dcfPrice], '#8B5CF6');
            renderSparkline('dashUpsideSpark', modelData.upside > 0 ? [5, 10, 15, modelData.upside * 0.7, modelData.upside] : [modelData.upside * 0.7, modelData.upside * 0.85, modelData.upside * 0.95, modelData.upside, modelData.upside * 1.05], modelData.upside > 0 ? '#10B981' : '#EF4444');
            renderSparkline('dashEVSpark', [modelData.ev * 0.5, modelData.ev * 0.65, modelData.ev * 0.78, modelData.ev * 0.9, modelData.ev], '#3B82F6');
            renderSparkline('dashEqSpark', [modelData.eq * 0.5, modelData.eq * 0.65, modelData.eq * 0.78, modelData.eq * 0.9, modelData.eq], '#EF4444');
        }

        function renderSparkline(canvasId, data, color) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = (rect.width || 120) * dpr;
            canvas.height = (rect.height || 40) * dpr;
            ctx.scale(dpr, dpr);
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            ctx.clearRect(0, 0, w, h);

            const min = Math.min(...data);
            const max = Math.max(...data);
            const range = max - min || 1;
            const pad = 4;

            // Area fill
            ctx.beginPath();
            ctx.moveTo(0, h - pad);
            data.forEach((v, i) => {
                const x = (i / (data.length - 1)) * w;
                const y = h - pad - ((v - min) / range) * (h - pad * 2);
                ctx.lineTo(x, y);
            });
            ctx.lineTo(w, h - pad);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, color + '40');
            grad.addColorStop(1, color + '05');
            ctx.fillStyle = grad;
            ctx.fill();

            // Line
            ctx.beginPath();
            data.forEach((v, i) => {
                const x = (i / (data.length - 1)) * w;
                const y = h - pad - ((v - min) / range) * (h - pad * 2);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        function renderDashboardCharts() {
            if (!modelData) return;
            const isDark = document.body.classList.contains('dark-mode');
            const textColor = isDark ? '#cbd5e1' : '#4B5563';
            const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

            // Revenue & EBITDA Chart
            const revCtx = document.getElementById('dashRevenueEbitdaChart');
            if (revCtx) {
                safeCreateChart('dashRevenueEbitdaChart', revCtx, {
                    type: 'line',
                    data: {
                        labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
                        datasets: [
                            {
                                label: 'Revenue',
                                data: modelData.rev,
                                borderColor: '#2563EB',
                                backgroundColor: 'rgba(37,99,235,0.1)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#2563EB'
                            },
                            {
                                label: 'EBITDA',
                                data: modelData.ebitda,
                                borderColor: '#10B981',
                                backgroundColor: 'rgba(16,185,129,0.1)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#10B981'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, boxWidth: 8 } }
                        },
                        scales: {
                            x: { ticks: { color: textColor }, grid: { color: gridColor } },
                            y: { ticks: { color: textColor, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(1) + 'K' : v.toFixed(0)) }, grid: { color: gridColor } }
                        }
                    }
                });
            }

            // FCF Chart
            const fcfCtx = document.getElementById('dashFcfChart');
            if (fcfCtx) {
                safeCreateChart('dashFcfChart', fcfCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
                        datasets: [{
                            label: 'Free Cash Flow',
                            data: modelData.fcf,
                            backgroundColor: modelData.fcf.map(f => f >= 0 ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)'),
                            borderColor: modelData.fcf.map(f => f >= 0 ? '#10B981' : '#EF4444'),
                            borderWidth: 1,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { ticks: { color: textColor }, grid: { display: false } },
                            y: { ticks: { color: textColor, callback: v => '₹' + v.toFixed(0) }, grid: { color: gridColor } }
                        }
                    }
                });
            }
        }

        function renderDashboardGauge() {
            const container = document.getElementById('dashGaugeContainer');
            if (!container || !modelData) return;
            const minPrice = Math.min(modelData.price, modelData.dcfPrice) * 0.5;
            const maxPrice = Math.max(modelData.price, modelData.dcfPrice) * 1.5;
            const range = maxPrice - minPrice;
            const currentAngle = 180 + ((modelData.price - minPrice) / range) * 180;
            const fairAngle = 180 + ((modelData.dcfPrice - minPrice) / range) * 180;

            const isDark = document.body.classList.contains('dark-mode');
            const bgColor = isDark ? '#1e293b' : '#f3f4f6';
            const textColor = isDark ? '#e2e8f0' : '#1f2937';

            container.innerHTML = `
                <svg class="dashboard-gauge-svg" viewBox="0 0 220 130">
                    <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#EF4444"/>
                            <stop offset="50%" stop-color="#F59E0B"/>
                            <stop offset="100%" stop-color="#10B981"/>
                        </linearGradient>
                    </defs>
                    <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="${bgColor}" stroke-width="20" stroke-linecap="round"/>
                    <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="url(#gaugeGrad)" stroke-width="20" stroke-linecap="round" stroke-dasharray="283" stroke-dashoffset="0"/>
                    <!-- Fair value marker -->
                    <line x1="110" y1="110" x2="${110 + 80 * Math.cos((fairAngle - 90) * Math.PI / 180)}" y2="${110 + 80 * Math.sin((fairAngle - 90) * Math.PI / 180)}" stroke="#8B5CF6" stroke-width="3" stroke-dasharray="4,2"/>
                    <!-- Current price needle -->
                    <g transform="rotate(${currentAngle - 180} 110 110)">
                        <line x1="110" y1="110" x2="110" y2="35" stroke="${textColor}" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="110" cy="110" r="8" fill="${textColor}"/>
                    </g>
                    <text x="30" y="125" fill="#EF4444" font-size="10" font-weight="600">SELL</text>
                    <text x="97" y="125" fill="#F59E0B" font-size="10" font-weight="600">HOLD</text>
                    <text x="165" y="125" fill="#10B981" font-size="10" font-weight="600">BUY</text>
                </svg>
            `;
            document.getElementById('dashGaugeCurrent').textContent = '₹' + modelData.price.toFixed(0);
            document.getElementById('dashGaugeFair').textContent = '₹' + modelData.dcfPrice.toFixed(0);
        }

        function renderDashboardHeatmap() {
            const container = document.getElementById('dashHeatmap');
            if (!container || !modelData) return;
            const p = getCurrentParams();
            const sensWacc = [p.wacc - 2, p.wacc - 1, p.wacc, p.wacc + 1, p.wacc + 2];
            const sensTgr = [p.tgr - 1, p.tgr - 0.5, p.tgr, p.tgr + 0.5, p.tgr + 1];

            let html = '<div class="dashboard-heatmap-cell heatmap-header"></div>';
            sensTgr.forEach(t => {
                html += `<div class="dashboard-heatmap-cell heatmap-header">${t.toFixed(1)}%</div>`;
            });

            const allValues = [];
            sensWacc.forEach(w => {
                sensTgr.forEach(t => {
                    const tv = modelData.fcf[4] * (1 + t / 100) / ((w - t) / 100);
                    const pvTv = tv / Math.pow(1 + w / 100, 5);
                    const ev = modelData.pvFcf + pvTv;
                    const eq = ev - p.netDebt;
                    allValues.push(eq / p.shares);
                });
            });
            const minVal = Math.min(...allValues);
            const maxVal = Math.max(...allValues);

            sensWacc.forEach((w, wi) => {
                html += `<div class="dashboard-heatmap-cell heatmap-label">${w.toFixed(1)}%</div>`;
                sensTgr.forEach((t, ti) => {
                    const tv = modelData.fcf[4] * (1 + t / 100) / ((w - t) / 100);
                    const pvTv = tv / Math.pow(1 + w / 100, 5);
                    const ev = modelData.pvFcf + pvTv;
                    const eq = ev - p.netDebt;
                    const val = eq / p.shares;
                    const pct = (val - minVal) / (maxVal - minVal);
                    let cls = 'heatmap-low';
                    if (pct > 0.75) cls = 'heatmap-high';
                    else if (pct > 0.5) cls = 'heatmap-med-high';
                    else if (pct > 0.25) cls = 'heatmap-neutral';
                    else if (pct > 0.1) cls = 'heatmap-med-low';
                    const isBase = wi === 2 && ti === 2;
                    html += `<div class="dashboard-heatmap-cell ${cls} ${isBase ? 'base-case' : ''}">₹${val.toFixed(0)}</div>`;
                });
            });
            container.innerHTML = html;
        }

        function renderDashboardPeers() {
            const ctx = document.getElementById('dashPeerChart');
            if (!ctx || !modelData) return;
            const isDark = document.body.classList.contains('dark-mode');
            const textColor = isDark ? '#cbd5e1' : '#4B5563';
            const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

            safeCreateChart('dashPeerChart', ctx, {
                type: 'bar',
                data: {
                    labels: ['P/E', 'EV/EBITDA', 'ROE %', 'Net Margin %'],
                    datasets: [
                        {
                            label: modelData.company,
                            data: [
                                modelData.eq / modelData.ni[4],
                                modelData.ev / modelData.ebitda[4],
                                modelData.roe[4],
                                (modelData.ni[4] / modelData.rev[4] * 100)
                            ],
                            backgroundColor: '#2563EB',
                            borderRadius: 4
                        },
                        {
                            label: 'Industry Avg',
                            data: [18, 12, 16, 10],
                            backgroundColor: '#9CA3AF',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, boxWidth: 8 } }
                    },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor }, grid: { display: false } }
                    }
                }
            });
        }

        function renderDashboardRiskRings() {
            const container = document.getElementById('dashRiskRings');
            if (!container || !modelData) return;
            const risks = [
                { label: 'Business', value: 65, color: '#2563EB' },
                { label: 'Market', value: 45, color: '#F59E0B' },
                { label: 'Financial', value: 30, color: '#10B981' }
            ];
            const isDark = document.body.classList.contains('dark-mode');
            const bgTrack = isDark ? '#334155' : '#e5e7eb';

            container.innerHTML = risks.map(r => {
                const circumference = 2 * Math.PI * 36;
                const offset = circumference - (r.value / 100) * circumference;
                return `
                    <div class="dashboard-risk-ring-item">
                        <svg viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="36" fill="none" stroke="${bgTrack}" stroke-width="8"/>
                            <circle cx="40" cy="40" r="36" fill="none" stroke="${r.color}" stroke-width="8"
                                stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                                transform="rotate(-90 40 40)" style="transition: stroke-dashoffset 1s ease;"/>
                            <text x="40" y="44" text-anchor="middle" fill="${isDark ? '#e2e8f0' : '#1f2937'}" font-size="14" font-weight="700">${r.value}</text>
                        </svg>
                        <div class="ring-label">${r.label}</div>
                        <div class="ring-value" style="color:${r.color}">${r.value > 50 ? 'High' : r.value > 30 ? 'Medium' : 'Low'}</div>
                    </div>
                `;
            }).join('');
        }

        // ── Model Grid (Excel-like) ──
        let gridSelectedCell = null;
        let gridCurrentSheet = 'model';

        function renderModelGrid() {
            if (!modelData) return;
            const container = document.getElementById('modelGridContainer');
            if (!container) return;
            if (gridCurrentSheet === 'model') renderModelGridSheet(container);
            else if (gridCurrentSheet === 'assumptions') renderAssumptionsGrid(container);
            else if (gridCurrentSheet === 'sensitivities') renderSensitivitiesGrid(container);
        }

        function renderModelGridSheet(container) {
            const p = getCurrentParams();
            const years = ['Base', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5'];
            const cols = ['', ...years];
            const fmt = n => '₹' + (n >= 1000 ? (n/1000).toFixed(1) + 'K' : n.toFixed(1));
            const fmtPct = n => n.toFixed(1) + '%';

            const rows = [
                { type: 'section', label: 'INCOME STATEMENT (Rs Cr)' },
                { type: 'header', cells: cols },
                { type: 'calc', label: 'Revenue', values: [p.baseRev, ...modelData.rev], fmt: fmt },
                { type: 'calc', label: 'YoY Growth %', values: ['-', ...modelData.rev.slice(1).map((r, i) => ((r / modelData.rev[i] - 1) * 100))], fmt: fmtPct },
                { type: 'calc', label: 'COGS', values: ['-', ...modelData.rev.map(r => r * 0.55)], fmt: fmt },
                { type: 'calc', label: 'Gross Profit', values: ['-', ...modelData.rev.map((r, i) => r - r * 0.55)], fmt: fmt, bold: true },
                { type: 'calc', label: 'Operating Expenses', values: ['-', ...modelData.rev.map(r => r * 0.25)], fmt: fmt },
                { type: 'calc', label: 'EBITDA', values: ['-', ...modelData.ebitda], fmt: fmt, bold: true },
                { type: 'calc', label: 'EBITDA Margin %', values: ['-', ...modelData.ebitda.map((e, i) => e / modelData.rev[i] * 100)], fmt: fmtPct },
                { type: 'calc', label: 'D&A', values: ['-', ...modelData.rev.map(r => r * 0.03)], fmt: fmt },
                { type: 'calc', label: 'EBIT', values: ['-', ...modelData.ebit], fmt: fmt, bold: true },
                { type: 'calc', label: 'EBIT Margin %', values: ['-', ...modelData.ebit.map((e, i) => e / modelData.rev[i] * 100)], fmt: fmtPct },
                { type: 'calc', label: 'Interest Expense', values: ['-', ...modelData.rev.map(() => p.netDebt * 0.08)], fmt: fmt },
                { type: 'calc', label: 'EBT', values: ['-', ...modelData.ebit.map((e, i) => e - p.netDebt * 0.08)], fmt: fmt, bold: true },
                { type: 'calc', label: 'Taxes', values: ['-', ...modelData.ebit.map((e, i) => Math.max(0, (e - p.netDebt * 0.08) * (p.taxRate / 100)))], fmt: fmt },
                { type: 'calc', label: 'Tax Rate %', values: ['-', ...modelData.ebit.map(() => p.taxRate)], fmt: fmtPct },
                { type: 'calc', label: 'Net Income', values: ['-', ...modelData.ni], fmt: fmt, bold: true, highlight: true },
                { type: 'calc', label: 'Net Margin %', values: ['-', ...modelData.ni.map((n, i) => n / modelData.rev[i] * 100)], fmt: fmtPct },
                { type: 'blank' },
                { type: 'section', label: 'CASH FLOW STATEMENT (Rs Cr)' },
                { type: 'calc', label: 'CFO', values: ['-', ...modelData.ni.map((n, i) => n + modelData.rev[i] * 0.03 - modelData.rev[i] * 0.02)], fmt: fmt, bold: true },
                { type: 'calc', label: 'CFI', values: ['-', ...modelData.rev.map(r => -(r * 0.05))], fmt: fmt, bold: true },
                { type: 'calc', label: 'CFF', values: ['-', ...modelData.ni.map(n => -n * 0.3)], fmt: fmt, bold: true },
                { type: 'calc', label: 'Net Change in Cash', values: ['-', ...modelData.ni.map((n, i) => n + modelData.rev[i] * 0.03 - modelData.rev[i] * 0.02 - modelData.rev[i] * 0.05 - n * 0.3)], fmt: fmt, bold: true, highlight: true },
                { type: 'blank' },
                { type: 'section', label: 'DCF VALUATION (Rs Cr)' },
                { type: 'calc', label: 'Free Cash Flow', values: ['-', ...modelData.fcf], fmt: fmt },
                { type: 'calc', label: 'Discount Factor', values: ['-', ...modelData.fcf.map((_, i) => 1 / Math.pow(1 + p.wacc / 100, i + 1))], fmt: n => n.toFixed(4) },
                { type: 'calc', label: 'PV of FCF', values: ['-', ...modelData.fcf.map((f, i) => f / Math.pow(1 + p.wacc / 100, i + 1))], fmt: fmt },
                { type: 'calc', label: 'Sum PV FCF', values: [modelData.pvFcf, '-', '-', '-', '-', '-'], fmt: fmt, bold: true },
                { type: 'calc', label: 'Terminal Value', values: [modelData.tv, '-', '-', '-', '-', '-'], fmt: fmt },
                { type: 'calc', label: 'PV of Terminal Value', values: [modelData.pvTv, '-', '-', '-', '-', '-'], fmt: fmt },
                { type: 'calc', label: 'Enterprise Value', values: [modelData.ev, '-', '-', '-', '-', '-'], fmt: fmt, bold: true, highlight: true },
                { type: 'calc', label: '(-) Net Debt', values: [-p.netDebt, '-', '-', '-', '-', '-'], fmt: fmt },
                { type: 'calc', label: 'Equity Value', values: [modelData.eq, '-', '-', '-', '-', '-'], fmt: fmt, bold: true, highlight: true },
                { type: 'calc', label: 'Shares Outstanding (Cr)', values: [p.shares, '-', '-', '-', '-', '-'], fmt: n => n.toFixed(1) },
                { type: 'calc', label: 'Fair Value / Share', values: [modelData.dcfPrice, '-', '-', '-', '-', '-'], fmt: n => '₹' + n.toFixed(2), bold: true, highlight: true },
            ];

            buildGridHTML(container, cols, rows);
        }

        function buildGridHTML(container, cols, rows) {
            let html = '<div class="model-grid-sheet">';
            // Column headers
            cols.forEach((c, i) => {
                const cls = i === 0 ? 'model-grid-row-header' : 'model-grid-col-header';
                html += `<div class="${cls}">${i === 0 ? '' : c}</div>`;
            });
            // Row headers (A, B, C...)
            const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

            rows.forEach((row, ri) => {
                if (row.type === 'blank') {
                    html += `<div class="model-grid-row-header" style="grid-column:1"></div>`;
                    html += `<div class="model-grid-cell" style="grid-column:2/-1;min-height:8px;background:transparent;border:none;"></div>`;
                    return;
                }
                if (row.type === 'section') {
                    html += `<div class="model-grid-cell section-header">${row.label}</div>`;
                    return;
                }
                if (row.type === 'header') {
                    row.cells.forEach((c, ci) => {
                        const cls = ci === 0 ? 'model-grid-row-header' : 'model-grid-col-header';
                        html += `<div class="${cls}">${c}</div>`;
                    });
                    return;
                }
                // Data row
                html += `<div class="model-grid-row-header">${ri + 1}</div>`;
                html += `<div class="model-grid-cell calc-cell" style="font-weight:600;">${row.label}</div>`;
                row.values.forEach((v, vi) => {
                    const val = v === '-' ? '-' : (row.fmt ? row.fmt(v) : v);
                    const boldCls = row.bold ? 'font-weight:700;' : '';
                    const highlightCls = row.highlight ? 'color:var(--primary);' : '';
                    html += `<div class="model-grid-cell calc-cell" style="${boldCls}${highlightCls}">${val}</div>`;
                });
            });
            html += '</div>';
            container.innerHTML = html;
        }

        function renderAssumptionsGrid(container) {
            const p = getCurrentParams();
            const cols = ['', 'Value', 'Unit', 'Notes'];
            const rows = [
                { type: 'section', label: 'MODEL ASSUMPTIONS' },
                { type: 'header', cells: cols },
                { type: 'calc', label: 'Company', values: [p.company, '', ''], fmt: String },
                { type: 'calc', label: 'Current Price', values: [p.price, 'Rs', ''], fmt: n => '₹' + n },
                { type: 'calc', label: 'Shares Outstanding', values: [p.shares, 'Cr', ''], fmt: String },
                { type: 'calc', label: 'Base Revenue', values: [p.baseRev, 'Rs Cr', ''], fmt: String },
                { type: 'calc', label: 'Revenue Growth Y1-Y2', values: [p.growth1, '%', ''], fmt: n => n + '%' },
                { type: 'calc', label: 'Revenue Growth Y3-Y5', values: [p.growth2, '%', ''], fmt: n => n + '%' },
                { type: 'calc', label: 'EBITDA Margin', values: [p.ebitdaMargin, '%', ''], fmt: n => n + '%' },
                { type: 'calc', label: 'Tax Rate', values: [p.taxRate, '%', ''], fmt: n => n + '%' },
                { type: 'calc', label: 'WACC', values: [p.wacc, '%', 'Discount rate'], fmt: n => n + '%' },
                { type: 'calc', label: 'Terminal Growth', values: [p.tgr, '%', ''], fmt: n => n + '%' },
                { type: 'calc', label: 'Net Debt', values: [p.netDebt, 'Rs Cr', ''], fmt: String },
                { type: 'calc', label: 'D&A / Revenue', values: ['3.0', '%', 'Fixed'], fmt: String },
                { type: 'calc', label: 'CapEx / Revenue', values: ['5.0', '%', 'Fixed'], fmt: String },
                { type: 'calc', label: 'WC Change / Revenue', values: ['-2.0', '%', 'Fixed'], fmt: String },
            ];
            buildGridHTML(container, cols, rows);
        }

        function renderSensitivitiesGrid(container) {
            const p = getCurrentParams();
            const sensWacc = [p.wacc - 2, p.wacc - 1, p.wacc, p.wacc + 1, p.wacc + 2];
            const sensTgr = [p.tgr - 1, p.tgr - 0.5, p.tgr, p.tgr + 0.5, p.tgr + 1];
            const allValues = [];
            sensWacc.forEach(w => {
                sensTgr.forEach(t => {
                    const tv = modelData.fcf[4] * (1 + t / 100) / ((w - t) / 100);
                    const pvTv = tv / Math.pow(1 + w / 100, 5);
                    const ev = modelData.pvFcf + pvTv;
                    const eq = ev - p.netDebt;
                    allValues.push(eq / p.shares);
                });
            });
            const minVal = Math.min(...allValues);
            const maxVal = Math.max(...allValues);

            let html = '<div class="model-grid-sheet">';
            html += '<div class="model-grid-row-header"></div>';
            html += '<div class="model-grid-col-header" style="grid-column:2/-1">DCF FAIR VALUE SENSITIVITY (Rs)</div>';
            html += '<div class="model-grid-row-header">WACC \\ TGR</div>';
            sensTgr.forEach(t => html += `<div class="model-grid-col-header">${t.toFixed(1)}%</div>`);

            sensWacc.forEach((w, wi) => {
                html += `<div class="model-grid-row-header">${w.toFixed(1)}%</div>`;
                sensTgr.forEach((t, ti) => {
                    const tv = modelData.fcf[4] * (1 + t / 100) / ((w - t) / 100);
                    const pvTv = tv / Math.pow(1 + w / 100, 5);
                    const ev = modelData.pvFcf + pvTv;
                    const eq = ev - p.netDebt;
                    const val = eq / p.shares;
                    const pct = (val - minVal) / (maxVal - minVal);
                    const isBase = wi === 2 && ti === 2;
                    let bg = '#FEE2E2';
                    if (pct > 0.75) bg = '#D1FAE5';
                    else if (pct > 0.5) bg = '#DBEAFE';
                    else if (pct > 0.25) bg = '#F3F4F6';
                    else if (pct > 0.1) bg = '#FEF3C7';
                    html += `<div class="model-grid-cell calc-cell" style="background:${bg};${isBase ? 'box-shadow:inset 0 0 0 2px #2563EB;font-weight:700;' : ''}">₹${val.toFixed(0)}</div>`;
                });
            });
            html += '</div>';
            container.innerHTML = html;
        }

        function switchGridSheet(sheet, btn) {
            gridCurrentSheet = sheet;
            document.querySelectorAll('.model-grid-sheet-tab').forEach(t => t.classList.remove('active'));
            if (btn) btn.classList.add('active');
            renderModelGrid();
        }

        // ── Enhance updateAllOutputs to call dashboard ──
        const _originalUpdateAllOutputs = updateAllOutputs;
        updateAllOutputs = function() {
            _originalUpdateAllOutputs();
            renderDashboard();
            renderModelGrid();
        };
