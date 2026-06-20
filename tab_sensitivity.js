
// ── Sensitivity Analysis Tab ──
// Renders 2-way sensitivity heat-tables: WACC × TGR and custom axes

window.__sensitivityXAxis = 'wacc';
window.__sensitivityYAxis = 'tgr';

const SENSITIVITY_AXES = {
    wacc:         { label: 'WACC (%)',               fn: v => ({ wacc: v }) },
    tgr:          { label: 'Terminal Growth (%)',     fn: v => ({ tgr: v }) },
    ebitdaMargin: { label: 'EBITDA Margin (%)',       fn: v => ({ ebitdaMargin: v }) },
    revenueGrowth:{ label: 'Revenue Growth Yr1 (%)', fn: v => ({ revenueGrowthY1: v }) },
    taxRate:      { label: 'Tax Rate (%)',            fn: v => ({ taxRate: v }) }
};

const DEFAULT_RANGES = {
    wacc:          [7, 8, 9, 10, 11, 12, 13],
    tgr:           [1, 2, 3, 4, 5, 6],
    ebitdaMargin:  [14, 16, 18, 20, 22, 24],
    revenueGrowth: [10, 15, 20, 25, 30],
    taxRate:       [20, 22.5, 25.17, 27.5, 30]
};

function setSensitivityAxis(which, axis) {
    window[`__sensitivity${which === 'x' ? 'X' : 'Y'}Axis`] = axis;
    generateSensitivityAnalysis();
}

function generateSensitivityAnalysis() {
    if (typeof modelData === 'undefined' || !modelData) return;

    const xAxis = window.__sensitivityXAxis;
    const yAxis = window.__sensitivityYAxis;

    // Render WACC × TGR fixed table first (always shown)
    renderWACCxTGRTable();

    // Render custom table
    renderCustomSensitivityTable(xAxis, yAxis);
}

// ── Core DCF valuation given override params ──
function calcDCFPrice(overrides = {}) {
    const wacc    = (overrides.wacc    ?? modelData.wacc)    / 100;
    const tgr     = (overrides.tgr     ?? modelData.tgr)     / 100;
    const netDebt = modelData.netDebt || 0;
    const shares  = modelData.shares  || 1;
    const price   = modelData.price   || 1;

    let fcf = [...modelData.fcf];

    // Apply EBITDA margin override (approximate)
    if (overrides.ebitdaMargin !== undefined) {
        const ratio = overrides.ebitdaMargin / ((modelData.ebitda[4] / modelData.rev[4]) * 100);
        fcf = fcf.map(f => f * ratio);
    }
    // Apply revenue growth override (scale all FCFs proportionally)
    if (overrides.revenueGrowthY1 !== undefined) {
        const base = modelData.rev[0] / modelData.baseRev - 1;
        const ratio = overrides.revenueGrowthY1 / (base * 100 || 20);
        fcf = fcf.map(f => f * ratio);
    }

    let pvFcf = 0;
    fcf.forEach((f, i) => { pvFcf += f / Math.pow(1 + wacc, i + 1); });

    const tv   = fcf[4] * (1 + tgr) / (wacc - tgr);
    const pvTv = tv / Math.pow(1 + wacc, 5);
    const ev   = pvFcf + pvTv;
    const eq   = ev - netDebt;
    return eq / shares;
}

function heatColor(value, base, min, max) {
    // Red → White → Green gradient centered on base
    const norm = max === min ? 0.5 : (value - min) / (max - min);
    if (norm >= 0.5) {
        const t = (norm - 0.5) * 2;
        return `rgba(34,197,94,${0.15 + t * 0.55})`;
    } else {
        const t = (0.5 - norm) * 2;
        return `rgba(239,68,68,${0.15 + t * 0.55})`;
    }
}

function renderWACCxTGRTable() {
    const waccVals = [7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5];
    const tgrVals  = [1, 2, 3, 4, 5, 6];
    const basePrice = modelData.price;

    // Pre-compute all prices to find min/max
    const allPrices = [];
    waccVals.forEach(w => tgrVals.forEach(t => allPrices.push(calcDCFPrice({ wacc: w, tgr: t }))));
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);

    let html = `
        <table class="sensitivity-table">
            <thead>
                <tr>
                    <th style="background:var(--bg-tertiary)">WACC → / TGR ↓</th>
                    ${waccVals.map(w => `<th>${w}%</th>`).join('')}
                </tr>
            </thead>
            <tbody>`;

    tgrVals.forEach(t => {
        html += `<tr><td style="font-weight:600; color:var(--text-secondary)">${t}%</td>`;
        waccVals.forEach(w => {
            const p = calcDCFPrice({ wacc: w, tgr: t });
            const upside = ((p / basePrice) - 1) * 100;
            const bg = heatColor(p, basePrice, minP, maxP);
            html += `<td style="background:${bg}; text-align:center; font-family:var(--font-mono,monospace); font-size:12px;">
                        <div style="font-weight:600">₹${p.toFixed(0)}</div>
                        <div style="font-size:10px; color:${upside >= 0 ? '#22c55e' : '#ef4444'}">${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%</div>
                     </td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    const el = document.getElementById('waccTgrSensTable');
    if (el) el.innerHTML = html;
}

function renderCustomSensitivityTable(xAxis, yAxis) {
    if (xAxis === yAxis) {
        const el = document.getElementById('customSensTable');
        if (el) el.innerHTML = '<p style="color:var(--accent-amber); padding:20px">Please select different axes.</p>';
        return;
    }

    const xVals = DEFAULT_RANGES[xAxis] || [];
    const yVals = DEFAULT_RANGES[yAxis] || [];
    const xLabel = SENSITIVITY_AXES[xAxis]?.label || xAxis;
    const yLabel = SENSITIVITY_AXES[yAxis]?.label || yAxis;
    const basePrice = modelData.price;

    const allPrices = [];
    xVals.forEach(x => yVals.forEach(y => {
        const ov = { ...(SENSITIVITY_AXES[xAxis]?.fn(x) || {}), ...(SENSITIVITY_AXES[yAxis]?.fn(y) || {}) };
        allPrices.push(calcDCFPrice(ov));
    }));
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);

    let html = `
        <table class="sensitivity-table">
            <thead>
                <tr>
                    <th style="background:var(--bg-tertiary)">${xLabel} → / ${yLabel} ↓</th>
                    ${xVals.map(x => `<th>${x}</th>`).join('')}
                </tr>
            </thead>
            <tbody>`;

    yVals.forEach(y => {
        html += `<tr><td style="font-weight:600; color:var(--text-secondary)">${y}</td>`;
        xVals.forEach(x => {
            const ov = { ...(SENSITIVITY_AXES[xAxis]?.fn(x) || {}), ...(SENSITIVITY_AXES[yAxis]?.fn(y) || {}) };
            const p = calcDCFPrice(ov);
            const upside = ((p / basePrice) - 1) * 100;
            const bg = heatColor(p, basePrice, minP, maxP);
            html += `<td style="background:${bg}; text-align:center; font-family:var(--font-mono,monospace); font-size:12px;">
                        <div style="font-weight:600">₹${p.toFixed(0)}</div>
                        <div style="font-size:10px; color:${upside >= 0 ? '#22c55e' : '#ef4444'}">${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%</div>
                     </td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    const el = document.getElementById('customSensTable');
    if (el) el.innerHTML = html;

    // Update axis labels in UI
    const xl = document.getElementById('sensXLabel');
    const yl = document.getElementById('sensYLabel');
    if (xl) xl.textContent = xLabel;
    if (yl) yl.textContent = yLabel;
}
