
// ── Financial Ratios Tab: DuPont + Altman Z-Score ──
window.__altmanModel = 'manufacturing'; // or 'non-manufacturing'

function generateRatios() {
    if (typeof modelData === 'undefined' || !modelData) return;
    renderDupontAnalysis();
    renderAltmanZScore();
    renderRatiosTable();
}

// ─────────────────────────────────────────────────────
// 1. DuPont Analysis
// ─────────────────────────────────────────────────────
function renderDupontAnalysis() {
    if (!modelData) return;

    let tableRows = '';
    for (let i = 0; i < 5; i++) {
        const netMargin   = (modelData.ni[i]  / modelData.rev[i])   * 100;
        const totalAssets = modelData.rev[i]   * 1.2; // approximate
        const assetTurnover = modelData.rev[i] / totalAssets;
        const equity      = modelData.equity   ? modelData.equity[i] : (modelData.eq * (0.8 + i * 0.05));
        const equityMultiplier = totalAssets / equity;
        const roe         = netMargin * assetTurnover * equityMultiplier;

        tableRows += `
            <tr>
                <td style="font-weight:600">Year ${i + 1}</td>
                <td style="color:var(--accent-cyan)">${netMargin.toFixed(2)}%</td>
                <td style="color:var(--accent-amber)">${assetTurnover.toFixed(3)}x</td>
                <td style="color:var(--accent-purple)">${equityMultiplier.toFixed(2)}x</td>
                <td style="font-weight:700; color:var(--accent-green)">${roe.toFixed(2)}%</td>
            </tr>`;
    }

    const el = document.getElementById('dupontTableBody');
    if (el) el.innerHTML = tableRows;

    // Summary stats (Year 5)
    const ni5  = modelData.ni[4];
    const rev5 = modelData.rev[4];
    const ta5  = rev5 * 1.2;
    const nm5  = ni5 / rev5 * 100;
    const at5  = rev5 / ta5;
    const eq5  = modelData.equity ? modelData.equity[4] : modelData.eq;
    const em5  = ta5 / eq5;
    const roe5 = nm5 * at5 * em5;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('dupontRoe', roe5.toFixed(2) + '%');
    set('dupontNpm', nm5.toFixed(2)  + '%');
    set('dupontAt',  at5.toFixed(3)  + 'x');
    set('dupontEm',  em5.toFixed(2)  + 'x');

    // DuPont Trend Chart
    const ctx = document.getElementById('dupontTrendChart');
    if (ctx && typeof safeCreateChart === 'function') {
        const labels = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];
        const npmData = modelData.ni.map((n, i) => n / modelData.rev[i] * 100);
        const atData  = modelData.rev.map((r, i) => r / (r * 1.2));
        const roeData = npmData.map((nm, i) => nm * atData[i] * ((modelData.rev[i] * 1.2) / (modelData.equity ? modelData.equity[i] : (modelData.eq * (0.8 + i * 0.05)))));

        safeCreateChart('dupontTrendChart', ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Net Margin %',     data: npmData, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)',  fill: true, tension: 0.4, pointRadius: 4 },
                    { label: 'Asset Turnover x', data: atData,  borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4, pointRadius: 4 },
                    { label: 'ROE %',            data: roeData, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',  fill: true, tension: 0.4, pointRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
}

// ─────────────────────────────────────────────────────
// 2. Altman Z-Score
// ─────────────────────────────────────────────────────
function setAltmanModel(type) {
    window.__altmanModel = type;
    document.querySelectorAll('.altman-toggle-btn').forEach(btn => {
        btn.classList.toggle('btn-active', btn.dataset.model === type);
    });
    renderAltmanZScore();
}

function renderAltmanZScore() {
    if (!modelData) return;

    const rev5   = modelData.rev[4];
    const ni5    = modelData.ni[4];
    const ebit5  = modelData.ebit ? modelData.ebit[4] : ni5 * 1.35;
    const equity = modelData.eq;
    const ta     = rev5 * 1.2;  // approximate total assets
    const wc     = rev5 * 0.12; // approximate working capital
    const re     = ni5 * 0.3;   // approximate retained earnings
    const totalLiab = ta - equity;

    let zScore, zoneHigh, zoneLow, interpretation, weights, formula;

    if (window.__altmanModel === 'manufacturing') {
        // Original 5-factor model (1968)
        const x1 = wc  / ta;
        const x2 = re  / ta;
        const x3 = ebit5 / ta;
        const x4 = equity / (totalLiab || 1);
        const x5 = rev5 / ta;

        zScore = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 0.999 * x5;
        zoneHigh = 2.99; zoneLow = 1.81;

        weights = [
            { ratio: 'X1 = Working Capital / Total Assets', raw: x1.toFixed(4), weight: '1.20', contrib: (1.2 * x1).toFixed(4) },
            { ratio: 'X2 = Retained Earnings / Total Assets', raw: x2.toFixed(4), weight: '1.40', contrib: (1.4 * x2).toFixed(4) },
            { ratio: 'X3 = EBIT / Total Assets', raw: x3.toFixed(4), weight: '3.30', contrib: (3.3 * x3).toFixed(4) },
            { ratio: 'X4 = Book Equity / Total Liabilities', raw: x4.toFixed(4), weight: '0.60', contrib: (0.6 * x4).toFixed(4) },
            { ratio: 'X5 = Revenue / Total Assets', raw: x5.toFixed(4), weight: '0.999', contrib: (0.999 * x5).toFixed(4) }
        ];
        formula = 'Z = 1.2X₁ + 1.4X₂ + 3.3X₃ + 0.6X₄ + 0.999X₅';
        interpretation = zScore > 2.99 ? ['Safe Zone', 'var(--accent-green)', '< 5%']
                       : zScore > 1.81 ? ['Grey Zone', 'var(--accent-amber)', '5–20%']
                       : ['Distress Zone', 'var(--accent-red)', '> 50%'];
    } else {
        // Non-manufacturing / emerging market model (Altman 1995)
        const x1 = wc  / ta;
        const x2 = re  / ta;
        const x3 = ebit5 / ta;
        const x4 = equity / (totalLiab || 1);

        zScore = 6.56 * x1 + 3.26 * x2 + 6.72 * x3 + 1.05 * x4;
        zoneHigh = 2.6; zoneLow = 1.1;

        weights = [
            { ratio: 'X1 = Working Capital / Total Assets', raw: x1.toFixed(4), weight: '6.56', contrib: (6.56 * x1).toFixed(4) },
            { ratio: 'X2 = Retained Earnings / Total Assets', raw: x2.toFixed(4), weight: '3.26', contrib: (3.26 * x2).toFixed(4) },
            { ratio: 'X3 = EBIT / Total Assets', raw: x3.toFixed(4), weight: '6.72', contrib: (6.72 * x3).toFixed(4) },
            { ratio: 'X4 = Book Equity / Total Liabilities', raw: x4.toFixed(4), weight: '1.05', contrib: (1.05 * x4).toFixed(4) }
        ];
        formula = "Z' = 6.56X₁ + 3.26X₂ + 6.72X₃ + 1.05X₄";
        interpretation = zScore > zoneHigh ? ['Safe Zone', 'var(--accent-green)', '< 5%']
                       : zScore > zoneLow  ? ['Grey Zone', 'var(--accent-amber)', '5–20%']
                       : ['Distress Zone', 'var(--accent-red)', '> 50%'];
    }

    const [zone, color, prob] = interpretation;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('altmanZVal',   zScore.toFixed(3));
    set('altmanZone',   zone);
    set('altmanProb',   `Default Probability: ${prob}`);
    set('altmanFormula', formula);

    const scoreEl = document.getElementById('altmanZVal');
    if (scoreEl) scoreEl.style.color = color;
    const zoneEl = document.getElementById('altmanZone');
    if (zoneEl) zoneEl.style.color = color;

    // Breakdown table
    const rows = weights.map(w => `
        <tr>
            <td>${w.ratio}</td>
            <td style="font-family:var(--font-mono,monospace); color:var(--text-secondary)">${w.raw}</td>
            <td style="font-family:var(--font-mono,monospace); color:var(--accent-amber)">${w.weight}</td>
            <td style="font-family:var(--font-mono,monospace); font-weight:600; color:var(--accent-blue)">${w.contrib}</td>
        </tr>`).join('');

    const breakdownEl = document.getElementById('altmanBreakdown');
    if (breakdownEl) breakdownEl.innerHTML = rows;

    // Gauge / Zone marker chart
    const ctx = document.getElementById('altmanGaugeChart');
    if (ctx && typeof safeCreateChart === 'function') {
        safeCreateChart('altmanGaugeChart', ctx, {
            type: 'bar',
            data: {
                labels: weights.map(w => w.ratio.split(' = ')[0]),
                datasets: [{
                    label: 'Z-Score Contribution',
                    data: weights.map(w => parseFloat(w.contrib)),
                    backgroundColor: [
                        'rgba(59,130,246,0.7)',
                        'rgba(34,197,94,0.7)',
                        'rgba(245,158,11,0.7)',
                        'rgba(168,85,247,0.7)',
                        'rgba(239,68,68,0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { ticks: { color: '#94a3b8', font: { size: 11 } } }
                }
            }
        });
    }
}

// ─────────────────────────────────────────────────────
// 3. Full Ratios Table (P/E, EV/EBITDA, etc.)
// ─────────────────────────────────────────────────────
function renderRatiosTable() {
    if (!modelData) return;

    const rows = [];
    for (let i = 0; i < 5; i++) {
        const rev    = modelData.rev[i];
        const ebitda = modelData.ebitda[i];
        const ni     = modelData.ni[i];
        const ev     = modelData.ev;
        const eq     = modelData.eq;

        const netMargin   = (ni  / rev)    * 100;
        const ebitdaMargin = (ebitda / rev) * 100;
        const evEbitda    = ev  / ebitda;
        const pe          = eq  / ni;

        rows.push(`
            <tr>
                <td style="font-weight:600">Year ${i + 1}</td>
                <td style="color:var(--accent-cyan)">${ebitdaMargin.toFixed(1)}%</td>
                <td style="color:var(--accent-green)">${netMargin.toFixed(1)}%</td>
                <td style="color:var(--accent-blue)">${evEbitda.toFixed(1)}x</td>
                <td style="color:var(--accent-purple)">${pe.toFixed(1)}x</td>
            </tr>`);
    }

    const el = document.getElementById('ratiosTableBody');
    if (el) el.innerHTML = rows.join('');
}
