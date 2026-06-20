
// ── Football Field Valuation Tab ──
// Interactive midpoint override: clicking a bar updates DCF assumption & reruns

window.__footballChart = null;

function renderFootballFieldTab() {
    if (typeof modelData === 'undefined' || !modelData) return;
    if (typeof window.__model === 'undefined' || !window.__model) return;

    buildFootballFieldChart();
}

function buildFootballFieldChart() {
    const { assumptions, dcf } = window.__model;
    const shares = assumptions?.shares_outstanding || modelData.shares || 1;
    const netDebt = assumptions?.net_debt ?? modelData.netDebt ?? 0;
    const basePrice = modelData.dcfPrice || dcf?.intrinsic_value_per_share || 0;
    const currentPrice = modelData.price || 0;

    // ── Build valuation ranges ──
    const ranges = [];

    // 1. DCF Valuation
    if (basePrice > 0) {
        ranges.push({
            method: 'DCF (Base)',
            low:    basePrice * 0.82,
            high:   basePrice * 1.18,
            midpoint: basePrice,
            color:  '#3b82f6',
            weight: 0.35,
            onClickWacc: modelData.wacc,
            onClickTgr:  modelData.tgr
        });

        // Bear/Bull DCF
        ranges.push({
            method: 'DCF (Bear)',
            low:    basePrice * 0.65,
            high:   basePrice * 0.85,
            midpoint: basePrice * 0.75,
            color:  '#ef4444',
            weight: 0.15,
            onClickWacc: modelData.wacc + 1.5,
            onClickTgr:  Math.max(1, modelData.tgr - 1)
        });

        ranges.push({
            method: 'DCF (Bull)',
            low:    basePrice * 1.10,
            high:   basePrice * 1.40,
            midpoint: basePrice * 1.25,
            color:  '#22c55e',
            weight: 0.15,
            onClickWacc: modelData.wacc - 1.5,
            onClickTgr:  modelData.tgr + 1
        });
    }

    // 2. Trading Comps (EV/EBITDA)
    if (modelData.ebitda?.length) {
        const evEbitdaComp = modelData.ebitda[4] * 11;     // median ~11x
        const eqComp = evEbitdaComp - netDebt;
        const priceComp = eqComp / shares;
        if (priceComp > 0) {
            ranges.push({
                method: 'Trading Comps (EV/EBITDA)',
                low:    priceComp * 0.88,
                high:   priceComp * 1.12,
                midpoint: priceComp,
                color:  '#06b6d4',
                weight: 0.20
            });
        }
    }

    // 3. Revenue comps (EV/Rev)
    if (modelData.rev?.length) {
        const evRevComp = modelData.rev[4] * 2.5;         // median ~2.5x
        const eqRevComp = evRevComp - netDebt;
        const priceRevComp = eqRevComp / shares;
        if (priceRevComp > 0) {
            ranges.push({
                method: 'Trading Comps (EV/Rev)',
                low:    priceRevComp * 0.85,
                high:   priceRevComp * 1.15,
                midpoint: priceRevComp,
                color:  '#a855f7',
                weight: 0.10
            });
        }
    }

    // 4. 52-Week Range
    if (currentPrice > 0) {
        ranges.push({
            method: '52-Week Range (±15%)',
            low:    currentPrice * 0.85,
            high:   currentPrice * 1.15,
            midpoint: currentPrice,
            color:  '#f59e0b',
            weight: 0.05
        });
    }

    if (ranges.length === 0) {
        const container = document.getElementById('footballFieldContainer');
        if (container) container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">No data. Run analysis first.</p>';
        return;
    }

    // ── Weighted average ──
    const totalWeight = ranges.reduce((s, r) => s + (r.weight || 0), 0);
    const weightedAvg = ranges.reduce((s, r) => s + r.midpoint * (r.weight || 0), 0) / (totalWeight || 1);

    // ── Render with Chart.js horizontal bar ──
    const allVals = ranges.flatMap(r => [r.low, r.high]);
    const globalMin = Math.min(...allVals) * 0.93;
    const globalMax = Math.max(...allVals) * 1.07;

    const ctx = document.getElementById('footballFieldCanvas');
    if (!ctx) {
        // Fallback to HTML-only render
        renderFootballFieldHTML({ ranges, weighted_average: weightedAvg, current_price: currentPrice });
        return;
    }

    // Destroy previous chart
    if (window.__footballChart) {
        window.__footballChart.destroy();
        window.__footballChart = null;
    }

    const labels   = ranges.map(r => r.method);
    const lowData  = ranges.map(r => r.low - globalMin);
    const spanData = ranges.map(r => r.high - r.low);
    const midData  = ranges.map(r => r.midpoint);

    window.__footballChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    // invisible offset
                    label: 'offset',
                    data: lowData,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    barThickness: 24
                },
                {
                    label: 'Valuation Range',
                    data: spanData,
                    backgroundColor: ranges.map(r => r.color + '55'),
                    borderColor:     ranges.map(r => r.color),
                    borderWidth: 2,
                    barThickness: 24
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: items => labels[items[0].dataIndex],
                        label: items => {
                            const r = ranges[items.dataIndex];
                            if (items.datasetIndex === 0) return null;
                            return [`Low: ₹${r.low.toFixed(0)}`, `Mid: ₹${r.midpoint.toFixed(0)}`, `High: ₹${r.high.toFixed(0)}`];
                        }
                    }
                },
                annotation: {}
            },
            scales: {
                x: {
                    stacked: true,
                    min: 0,
                    max: globalMax - globalMin,
                    ticks: {
                        color: '#94a3b8',
                        callback: val => `₹${(val + globalMin).toFixed(0)}`
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    stacked: true,
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                }
            },
            onClick: (evt, elements) => {
                if (!elements.length) return;
                const idx = elements[0].index;
                overrideFromFootballField(ranges[idx]);
            }
        },
        plugins: [{
            id: 'midpointLines',
            afterDraw(chart) {
                const { ctx, scales } = chart;
                ranges.forEach((r, i) => {
                    const x  = scales.x.getPixelForValue(r.midpoint - globalMin);
                    const y  = scales.y.getPixelForValue(i);
                    const bh = chart._metasets[1]?.data[i]?.height || 24;

                    ctx.save();
                    ctx.strokeStyle = r.color;
                    ctx.lineWidth   = 2;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(x, y - bh / 2 - 4);
                    ctx.lineTo(x, y + bh / 2 + 4);
                    ctx.stroke();

                    ctx.fillStyle = r.color;
                    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`₹${r.midpoint.toFixed(0)}`, x, y - bh / 2 - 8);
                    ctx.restore();
                });

                // Weighted average line
                if (weightedAvg > 0) {
                    const wx = scales.x.getPixelForValue(weightedAvg - globalMin);
                    ctx.save();
                    ctx.strokeStyle = '#a855f7';
                    ctx.lineWidth   = 2;
                    ctx.setLineDash([6, 3]);
                    ctx.beginPath();
                    ctx.moveTo(wx, scales.y.top);
                    ctx.lineTo(wx, scales.y.bottom);
                    ctx.stroke();
                    ctx.restore();
                }

                // Current price line
                if (currentPrice > 0) {
                    const cp = scales.x.getPixelForValue(currentPrice - globalMin);
                    ctx.save();
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth   = 2;
                    ctx.setLineDash([4, 2]);
                    ctx.beginPath();
                    ctx.moveTo(cp, scales.y.top);
                    ctx.lineTo(cp, scales.y.bottom);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }]
    });

    // ── Update summary ──
    const upside = currentPrice > 0 ? ((weightedAvg - currentPrice) / currentPrice * 100).toFixed(1) : null;
    const sumEl = document.getElementById('footballFieldSummary');
    if (sumEl) {
        sumEl.innerHTML = `
            <div style="display:flex; gap:24px; flex-wrap:wrap; align-items:center;">
                <div><span style="color:var(--text-muted); font-size:11px">WEIGHTED AVG</span>
                     <div style="font-size:1.4rem; font-weight:700; color:var(--accent-purple)">₹${weightedAvg.toFixed(0)}</div></div>
                <div><span style="color:var(--text-muted); font-size:11px">CURRENT PRICE</span>
                     <div style="font-size:1.4rem; font-weight:700; color:var(--accent-amber)">₹${currentPrice.toFixed(0)}</div></div>
                ${upside !== null ? `<div><span style="color:var(--text-muted); font-size:11px">UPSIDE vs MARKET</span>
                     <div style="font-size:1.4rem; font-weight:700; color:${parseFloat(upside) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${parseFloat(upside) >= 0 ? '+' : ''}${upside}%</div></div>` : ''}
            </div>
            <p style="margin-top:10px; color:var(--text-muted); font-size:11px">
                <i class="fas fa-mouse-pointer"></i> Click any bar to apply that valuation's implied WACC/TGR assumptions to the DCF model.
            </p>`;
    }
}

// ── Midpoint override: clicking a football field bar recalibrates DCF inputs ──
function overrideFromFootballField(range) {
    if (!range) return;

    // Apply WACC and TGR overrides if defined on the range
    const newWacc = range.onClickWacc;
    const newTgr  = range.onClickTgr;

    let changed = false;

    if (newWacc !== undefined) {
        const waccEl = document.getElementById('wacc');
        if (waccEl) { waccEl.value = newWacc.toFixed(2); changed = true; }
        if (modelData) modelData.wacc = newWacc;
    }
    if (newTgr !== undefined) {
        const tgrEl = document.getElementById('tgr');
        if (tgrEl) { tgrEl.value = newTgr.toFixed(2); changed = true; }
        if (modelData) modelData.tgr = newTgr;
    }

    if (changed) {
        if (typeof showToast === 'function') {
            showToast(`Applied ${range.method} assumptions: WACC=${newWacc?.toFixed(1) ?? '?'}%, TGR=${newTgr?.toFixed(1) ?? '?'}%`, 'info');
        }
        // Re-run analysis for full model update
        if (typeof runAnalysis === 'function') {
            runAnalysis();
        } else if (typeof updateDCF === 'function') {
            updateDCF();
        }
    }
}

// Fallback HTML renderer when no canvas present
function renderFootballFieldHTML(data) {
    const container = document.getElementById('footballFieldContainer');
    const legend    = document.getElementById('footballFieldLegend');
    const summary   = document.getElementById('footballFieldSummary');
    if (typeof renderFootballField === 'function') {
        renderFootballField(data, container, legend || document.createElement('div'), summary || document.createElement('div'));
    }
}
