
// ── DCF Valuation Tab ──
// State: mid-year convention toggle
window.__dcfMidYear = false;

function toggleMidYearConvention() {
    window.__dcfMidYear = !window.__dcfMidYear;
    const btn = document.getElementById('dcfMidYearBtn');
    if (btn) {
        btn.classList.toggle('btn-active', window.__dcfMidYear);
        btn.textContent = window.__dcfMidYear ? '✔ Mid-Year ON' : 'Mid-Year OFF';
    }
    if (typeof modelData !== 'undefined' && modelData) updateDCF();
}

function generateDCF() {
    if (typeof modelData === 'undefined' || !modelData) return;
    updateDCF();
}

function updateDCF() {
    if (typeof modelData === 'undefined' || !modelData) return;

    const wacc = modelData.wacc / 100;
    const tgr  = modelData.tgr  / 100;
    const fcf  = modelData.fcf;          // 5-element array (₹ Cr)
    const midYear = window.__dcfMidYear;

    // ── Discount each FCF ──
    let pvFcfTotal = 0;
    let bodyHtml = '';

    for (let t = 0; t < fcf.length; t++) {
        const year = t + 1;
        // Mid-year: exponent is (t + 0.5); Year-end: exponent is (t + 1)
        const exp = midYear ? (t + 0.5) : year;
        const df  = 1 / Math.pow(1 + wacc, exp);
        const pv  = fcf[t] * df;
        pvFcfTotal += pv;

        const revGrowth = t === 0
            ? modelData.rev[0] / modelData.baseRev - 1
            : modelData.rev[t] / modelData.rev[t - 1] - 1;

        const ebitdaMargin = modelData.ebitda[t] / modelData.rev[t] * 100;

        bodyHtml += `
            <tr>
                <td style="font-weight:600">Year ${year}</td>
                <td style="color:var(--text-secondary)">₹${modelData.rev[t].toFixed(1)} Cr</td>
                <td style="color:var(--accent-cyan)">${(revGrowth * 100).toFixed(1)}%</td>
                <td style="color:var(--text-secondary)">${ebitdaMargin.toFixed(1)}%</td>
                <td style="color:var(--accent-green)">₹${fcf[t].toFixed(1)} Cr</td>
                <td style="color:var(--text-muted)">${df.toFixed(4)}</td>
                <td style="color:var(--accent-blue); font-weight:600">₹${pv.toFixed(1)} Cr</td>
            </tr>`;
    }

    // ── Terminal Value ──
    const lastFcf = fcf[fcf.length - 1];
    const tv      = lastFcf * (1 + tgr) / (wacc - tgr);
    const tvExp   = midYear ? (fcf.length - 0.5) : fcf.length;
    const pvTv    = tv / Math.pow(1 + wacc, tvExp);

    // ── Summary Figures ──
    const ev     = pvFcfTotal + pvTv;
    const equity = ev - (modelData.netDebt || 0);
    const price  = equity / (modelData.shares || 1);
    const upside = ((price / modelData.price) - 1) * 100;

    // ── Inject into DOM ──
    const bodyEl = document.getElementById('dcfTableBody');
    if (bodyEl) bodyEl.innerHTML = bodyHtml;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('dcfPvFcf',   `₹${pvFcfTotal.toFixed(1)} Cr`);
    set('dcfTv',      `₹${tv.toFixed(1)} Cr`);
    set('dcfPvTv',    `₹${pvTv.toFixed(1)} Cr`);
    set('dcfEV',      `₹${ev.toFixed(1)} Cr`);
    set('dcfEquity',  `₹${equity.toFixed(1)} Cr`);
    set('dcfPrice',   `₹${price.toFixed(2)}`);
    set('dcfUpside',  `${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%`);
    set('dcfWacc',    `${(wacc * 100).toFixed(2)}%`);
    set('dcfTgr',     `${(tgr  * 100).toFixed(2)}%`);
    set('dcfConvention', midYear ? 'Mid-Year' : 'Year-End');

    const upsideEl = document.getElementById('dcfUpside');
    if (upsideEl) {
        upsideEl.style.color = upside > 20
            ? 'var(--accent-green)'
            : upside > 0
            ? 'var(--accent-amber)'
            : 'var(--accent-red)';
    }

    // ── FCF Bridge Chart ──
    renderDCFChart(fcf, modelData.rev, modelData.ebitda, pvFcfTotal, pvTv);
}

function renderDCFChart(fcf, rev, ebitda, pvFcfTotal, pvTv) {
    const ctx = document.getElementById('dcfBridgeChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const labels = fcf.map((_, i) => `Y${i + 1}`);
    const fcfPv  = fcf.map((f, i) => {
        const exp = window.__dcfMidYear ? (i + 0.5) : (i + 1);
        return f / Math.pow(1 + (modelData.wacc / 100), exp);
    });

    if (typeof safeCreateChart === 'function') {
        safeCreateChart('dcfBridgeChart', ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'FCF (₹ Cr)',
                        data: fcf,
                        backgroundColor: 'rgba(59,130,246,0.7)',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'PV of FCF (₹ Cr)',
                        data: fcfPv,
                        type: 'line',
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.15)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } },
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ₹${ctx.parsed.y.toFixed(1)} Cr` } }
                },
                scales: {
                    y: {
                        title: { display: true, text: '₹ Crores', color: '#64748b' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // ── Waterfall: PV FCF + PV TV = EV ──
    const waterfallCtx = document.getElementById('dcfWaterfallChart');
    if (waterfallCtx && typeof safeCreateChart === 'function') {
        safeCreateChart('dcfWaterfallChart', waterfallCtx, {
            type: 'bar',
            data: {
                labels: ['PV of FCFs', 'PV of Terminal Value', 'Enterprise Value'],
                datasets: [{
                    label: '₹ Crores',
                    data: [pvFcfTotal, pvTv, pvFcfTotal + pvTv],
                    backgroundColor: [
                        'rgba(59,130,246,0.7)',
                        'rgba(168,85,247,0.7)',
                        'rgba(34,197,94,0.7)'
                    ],
                    borderColor: ['#3b82f6', '#a855f7', '#22c55e'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => `₹${ctx.parsed.y.toFixed(1)} Cr` } }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: 'transparent' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
}
