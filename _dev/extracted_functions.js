// ====================runAnalysis====================
async function runAnalysis() {
            document.getElementById('loading').classList.add('active');

            const price = parseFloat(document.getElementById('price').value) || 85;
            
            const params = {
                companyName: document.getElementById('companyName').value || 'Reliance Industries',
                industry: 'Energy', // Default industry
                baseRevenue: parseFloat(document.getElementById('baseRev').value) || 100,
                growthRateYear1: parseFloat(document.getElementById('growth1').value) || 25,
                growthRateYear2: parseFloat(document.getElementById('growth2').value) || 18,
                ebitdaMargin: parseFloat(document.getElementById('ebitdaMargin').value) || 20,
                taxRate: parseFloat(document.getElementById('taxRate').value) || 25.17,
                currentDebt: parseFloat(document.getElementById('netDebt').value) || 10,
                cash: 5,
                costOfDebt: 8.5,
                sharesOutstanding: parseFloat(document.getElementById('shares').value) || 10,
                wacc: parseFloat(document.getElementById('wacc').value) || 10.5,
                terminalGrowthRate: parseFloat(document.getElementById('tgr').value) || 3
            };

            const localFallbackParams = {
                company: params.companyName,
                price: price,
                shares: params.sharesOutstanding,
                baseRev: params.baseRevenue,
                ebitdaMargin: params.ebitdaMargin,
                growth1: params.growthRateYear1,
                growth2: params.growthRateYear2,
                wacc: params.wacc,
                tgr: params.terminalGrowthRate,
                netDebt: params.currentDebt,
                taxRate: params.taxRate
            };

            try {
                const token = localStorage.getItem('accessToken');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch('/api/v1/financial-model/generate', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(params)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const d = result.data;
                    modelData = {
                        company: d.companyName,
                        price: price,
                        shares: params.sharesOutstanding,
                        baseRev: params.baseRevenue,
                        rev: d.projections.map(p => p.revenue),
                        ebitda: d.projections.map(p => p.ebitda),
                        ebit: d.projections.map(p => p.ebit),
                        ni: d.projections.map(p => p.netIncome),
                        fcf: d.projections.map(p => p.fcf),
                        equity: d.projections.map(p => p.equity),
                        roe: d.projections.map(p => p.roe),
                        ev: d.valuation.enterpriseValue,
                        eq: d.valuation.equityValue,
                        dcfPrice: d.valuation.fairValuePerShare,
                        upside: ((d.valuation.fairValuePerShare / price) - 1) * 100,
                        rating: d.recommendation,
                        pvFcf: d.valuation.pvFCF,
                        tv: d.valuation.pvTerminalValue / Math.pow(1 + d.valuation.wacc/100, 5), 
                        pvTv: d.valuation.pvTerminalValue,
                        wacc: d.valuation.wacc,
                        tgr: d.valuation.terminalGrowthRate,
                        target: d.valuation.fairValuePerShare * 1.15,
                        cagr: d.metrics.revenueCAGR / 100,
                        netDebt: params.currentDebt
                    };
                    // Phase 4: Build canonical model for world-class features
                    buildCanonicalModel(params, d);
                    updateAllOutputs();
                } else {
                    console.warn("API Error, falling back to local simulation:", result.error);
                    modelData = generateModel(localFallbackParams);
                    buildCanonicalModel(localFallbackParams, null);
                    updateAllOutputs();
                }
            } catch (err) {
                console.warn("Fetch failed, falling back to local simulation:", err);
                modelData = generateModel(localFallbackParams);
                buildCanonicalModel(localFallbackParams, null);
                updateAllOutputs();
            } finally {
                document.getElementById('loading').classList.remove('active');
                checkAnomalies();
            }
        }

// ====================generateDupontAnalysis====================
function generateDupontAnalysis() {
            if (!modelData) return;

            const roe = modelData.roe[4];
            const netMargin = (modelData.ni[4] / modelData.rev[4]) * 100;
            const assetTurnover = modelData.rev[4] / (modelData.rev[4] * 1.2);
            const equityMultiplier = (modelData.rev[4] * 1.2) / modelData.eq;

            document.getElementById('dupontRoe').textContent = roe.toFixed(1) + '%';
            document.getElementById('dupontNpm').textContent = netMargin.toFixed(1) + '%';
            document.getElementById('dupontAt').textContent = assetTurnover.toFixed(2) + 'x';
            document.getElementById('dupontEm').textContent = equityMultiplier.toFixed(2) + 'x';

            let body = '';
            for (let i = 0; i < 5; i++) {
                const npm = (modelData.ni[i] / modelData.rev[i]) * 100;
                const at = modelData.rev[i] / (modelData.rev[i] * 1.2);
                const em = (modelData.rev[i] * 1.2) / (modelData.eq * (0.8 + i * 0.05));
                const roeVal = npm * at * em;
                body += `<tr><td>Year ${i+1}</td><td>${npm.toFixed(1)}%</td><td>${at.toFixed(2)}x</td><td>${em.toFixed(2)}x</td><td style="font-weight: 600;">${roeVal.toFixed(1)}%</td></tr>`;
            }
            document.getElementById('dupontBody').innerHTML = body;

            const ctx = document.getElementById('dupontChart');
            if (ctx) {
                safeCreateChart('dupontChart', ctx, {
                    type: 'line',
                    data: {
                        labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
                        datasets: [
                            { label: 'Net Margin %', data: modelData.ni.map((n, i) => (n/modelData.rev[i]*100)), borderColor: '#2563EB', tension: 0.4 },
                            { label: 'Asset Turnover', data: modelData.rev.map(r => r/(r*1.2)), borderColor: '#10B981', tension: 0.4 },
                            { label: 'ROE %', data: modelData.roe, borderColor: '#F59E0B', tension: 0.4 }
                        ]
                    },
                    options: getWorldClassChartOptions()
                });
            }
        }

// ====================generateAltmanZScore====================
function generateAltmanZScore() {
            if (!modelData) return;

            const wc = modelData.rev[4] * 0.15;
            const retainedEarnings = modelData.ni[4] * 0.3;
            const ebit = modelData.ebit[4];
            const equity = modelData.eq;
            const sales = modelData.rev[4];
            const totalAssets = modelData.rev[4] * 1.2;
            const currentLiabilities = modelData.rev[4] * 0.25;

            // Z-Score formula (for manufacturing)
            const x1 = (wc / totalAssets) * 1.2;
            const x2 = (retainedEarnings / totalAssets) * 1.4;
            const x3 = (ebit / totalAssets) * 3.3;
            const x4 = (equity / totalAssets) * 0.6;
            const x5 = (sales / totalAssets) * 1.0;

            const zScore = x1 + x2 + x3 + x4 + x5;

            let zone, prob, color;
            if (zScore > 2.99) {
                zone = 'Safe Zone';
                prob = '< 5%';
                color = 'var(--accent)';
            } else if (zScore > 1.81) {
                zone = 'Grey Zone';
                prob = '5-20%';
                color = 'var(--warning)';
            } else {
                zone = 'Distress Zone';
                prob = '> 50%';
                color = 'var(--danger)';
            }

            document.getElementById('zScoreVal').textContent = zScore.toFixed(2);
            document.getElementById('zScoreVal').style.color = color;
            document.getElementById('zScoreZone').textContent = zone;
            document.getElementById('zScoreZone').style.color = color;
            document.getElementById('zScoreProb').textContent = prob;

            document.getElementById('zScoreBreakdown').innerHTML = `
                <table class="data-table">
                    <thead><tr><th>Ratio</th><th>Value</th><th>Weight</th><th>Contribution</th></tr></thead>
                    <tbody>
                        <tr><td>X1: Working Capital/TA</td><td>${(wc/totalAssets).toFixed(3)}</td><td>1.2</td><td>${x1.toFixed(2)}</td></tr>
                        <tr><td>X2: Retained Earnings/TA</td><td>${(retainedEarnings/totalAssets).toFixed(3)}</td><td>1.4</td><td>${x2.toFixed(2)}</td></tr>
                        <tr><td>X3: EBIT/TA</td><td>${(ebit/totalAssets).toFixed(3)}</td><td>3.3</td><td>${x3.toFixed(2)}</td></tr>
                        <tr><td>X4: Equity/TA</td><td>${(equity/totalAssets).toFixed(3)}</td><td>0.6</td><td>${x4.toFixed(2)}</td></tr>
                        <tr><td>X5: Sales/TA</td><td>${(sales/totalAssets).toFixed(3)}</td><td>1.0</td><td>${x5.toFixed(2)}</td></tr>
                        <tr style="font-weight: bold;"><td colspan="3">Z-Score</td><td>${zScore.toFixed(2)}</td></tr>
                    </tbody>
                </table>
            `;

            // Chart
            const ctx = document.getElementById('zScoreChart');
            if (ctx) {
                safeCreateChart('zScoreChart', ctx, {
                    type: 'bar',
                    data: {
                        labels: ['X1 (WC)', 'X2 (RE)', 'X3 (EBIT)', 'X4 (Equity)', 'X5 (Sales)'],
                        datasets: [{
                            label: 'Contribution',
                            data: [x1, x2, x3, x4, x5],
                            backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
                        }]
                    },
                    options: getWorldClassChartOptions()
                });
            }
        }

// ====================generateSensitivityAnalysis====================
function generateSensitivityAnalysis() {
            if (!modelData) return;

            // WACC Sensitivity
            const waccValues = [8, 9, 10, 11, 12, 13];
            let waccHtml = '<table class="data-table"><thead><tr><th>WACC</th><th>Fair Value</th><th>Upside</th><th>Rating</th></tr></thead><tbody>';
            waccValues.forEach(w => {
                let pvFcf = 0;
                modelData.fcf.forEach((f, i) => { pvFcf += f / Math.pow(1 + w/100, i + 1); });
                const tv = modelData.fcf[4] * (1 + modelData.tgr/100) / ((w - modelData.tgr)/100);
                const pvTv = tv / Math.pow(1 + w/100, 5);
                const ev = pvFcf + pvTv;
                const eq = ev - modelData.netDebt;
                const price = eq / modelData.shares;
                const upside = (price / modelData.price - 1) * 100;
                const rating = upside > 20 ? 'BUY' : upside > 0 ? 'HOLD' : 'SELL';
                const color = rating === 'BUY' ? 'var(--accent)' : rating === 'HOLD' ? 'var(--warning)' : 'var(--danger)';
                waccHtml += `<tr><td>${w}%</td><td style="color: var(--primary); font-weight: 600;">₹${price.toFixed(0)}</td><td style="color: ${color};">${upside > 0 ? '+' : ''}${upside.toFixed(1)}%</td><td><span class="rating-badge rating-${rating.toLowerCase()}">${rating}</span></td></tr>`;
            });
            waccHtml += '</tbody></table>';
            document.getElementById('waccSensitivity').innerHTML = waccHtml;

            // Terminal Growth Sensitivity
            const tgValues = [1, 2, 3, 4, 5, 6];
            let tgHtml = '<table class="data-table"><thead><tr><th>Terminal Growth</th><th>Fair Value</th><th>Upside</th><th>Rating</th></tr></thead><tbody>';
            tgValues.forEach(t => {
                let pvFcf = 0;
                modelData.fcf.forEach((f, i) => { pvFcf += f / Math.pow(1 + modelData.wacc/100, i + 1); });
                const tv = modelData.fcf[4] * (1 + t/100) / ((modelData.wacc - t)/100);
                const pvTv = tv / Math.pow(1 + modelData.wacc/100, 5);
                const ev = pvFcf + pvTv;
                const eq = ev - modelData.netDebt;
                const price = eq / modelData.shares;
                const upside = (price / modelData.price - 1) * 100;
                const rating = upside > 20 ? 'BUY' : upside > 0 ? 'HOLD' : 'SELL';
                const color = rating === 'BUY' ? 'var(--accent)' : rating === 'HOLD' ? 'var(--warning)' : 'var(--danger)';
                tgHtml += `<tr><td>${t}%</td><td style="color: var(--primary); font-weight: 600;">₹${price.toFixed(0)}</td><td style="color: ${color};">${upside > 0 ? '+' : ''}${upside.toFixed(1)}%</td><td><span class="rating-badge rating-${rating.toLowerCase()}">${rating}</span></td></tr>`;
            });
            tgHtml += '</tbody></table>';
            document.getElementById('tgSensitivity').innerHTML = tgHtml;
        }

// ====================renderFootballField====================
function renderFootballField(data, container, legend, summary) {
            const { ranges, weighted_average, current_price } = data;
            if (!ranges || ranges.length === 0) {
                container.innerHTML = '<div style="text-align:center;padding:40px;">No valuation data available</div>';
                return;
            }
            
            // Find min/max for scaling
            const allValues = ranges.flatMap(r => [r.low, r.high, r.midpoint]);
            const minVal = Math.min(...allValues) * 0.9;
            const maxVal = Math.max(...allValues) * 1.1;
            const range = maxVal - minVal;
            
            // Generate HTML
            let html = '<div style="position:relative;height:100%;padding:20px 40px 60px 150px;">';
            
            // Title
            html += '<div style="text-align:center;font-weight:600;font-size:1.1rem;margin-bottom:20px;">Valuation Summary (₹ per share)</div>';
            
            // Y-axis labels
            ranges.forEach((r, i) => {
                const y = (i / (ranges.length - 1 || 1)) * 280 + 20;
                html += `<div style="position:absolute;left:10px;top:${y}px;font-size:0.75rem;color:var(--text-medium);text-align:right;width:130px;">${escapeHtml(r.method)}</div>`;
            });
            
            // Bars
            ranges.forEach((r, i) => {
                const y = (i / (ranges.length - 1 || 1)) * 280 + 20;
                const left = ((r.low - minVal) / range) * 100;
                const width = ((r.high - r.low) / range) * 100;
                const midLeft = ((r.midpoint - minVal) / range) * 100;
                
                html += `<div style="position:absolute;left:${left}%;top:${y}px;width:${width}%;height:24px;background:${r.color}22;border-radius:4px;border:2px solid ${r.color};">`;
                html += `<div style="position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:3px;height:36px;background:${r.color};"></div>`;
                html += `<div style="position:absolute;left:50%;top:-22px;transform:translateX(-50%);font-size:0.7rem;font-weight:600;color:${r.color};">₹${r.midpoint.toFixed(0)}</div>`;
                html += `<div style="position:absolute;left:4px;top:4px;font-size:0.65rem;color:${r.color};">₹${r.low.toFixed(0)}</div>`;
                html += `<div style="position:absolute;right:4px;top:4px;font-size:0.65rem;color:${r.color};">₹${r.high.toFixed(0)}</div>`;
                html += '</div>';
            });
            
            // Current price line
            if (current_price) {
                const cpLeft = ((current_price - minVal) / range) * 100;
                html += `<div style="position:absolute;left:${cpLeft}%;top:0;bottom:40px;width:2px;background:var(--danger);z-index:10;">`;
                html += `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:var(--danger);color:white;padding:2px 8px;border-radius:4px;font-size:0.7rem;white-space:nowrap;">Market: ₹${current_price.toFixed(0)}</div>`;
                html += '</div>';
            }
            
            // Weighted average line
            if (weighted_average) {
                const waLeft = ((weighted_average - minVal) / range) * 100;
                html += `<div style="position:absolute;left:${waLeft}%;top:0;bottom:40px;width:2px;background:var(--purple);border-left:2px dashed var(--purple);z-index:10;">`;
                html += `<div style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);background:var(--purple);color:white;padding:2px 8px;border-radius:4px;font-size:0.7rem;white-space:nowrap;">Weighted Avg: ₹${weighted_average.toFixed(0)}</div>`;
                html += '</div>';
            }
            
            // X-axis
            html += '<div style="position:absolute;bottom:20px;left:150px;right:20px;height:1px;background:var(--border);"></div>';
            for (let v = Math.floor(minVal / 50) * 50; v <= maxVal; v += 50) {
                const pos = ((v - minVal) / range) * 100;
                html += `<div style="position:absolute;left:${pos}%;bottom:5px;font-size:0.65rem;color:var(--text-light);transform:translateX(-50%);">₹${v}</div>`;
            }
            
            html += '</div>';
            container.innerHTML = html;
            
            // Legend
            legend.innerHTML = ranges.map(r => 
                `<span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;background:${r.color};border-radius:2px;"></span>${escapeHtml(r.method)}</span>`
            ).join('');
            
            // Summary
            const upside = current_price && weighted_average ? ((weighted_average - current_price) / current_price * 100).toFixed(1) : null;
            summary.innerHTML = `<strong>Summary:</strong> Weighted average valuation is ₹${(weighted_average || 0).toFixed(0)}/share` + 
                (upside ? ` — implying ${upside > 0 ? '+' : ''}${upside}% vs current market price of ₹${current_price.toFixed(0)}.` : '.');
        }

// ====================generateFootballField====================
async function generateFootballField() {
            const container = document.getElementById('footballFieldContainer');
            const status = document.getElementById('footballFieldStatus');
            const legend = document.getElementById('footballFieldLegend');
            const summary = document.getElementById('footballFieldSummary');
            
            if (!window.__model) {
                container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger)"><i class="fas fa-exclamation-circle"></i> Please run analysis first to generate model data</div>';
                return;
            }
            
            status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            try {
                const res = await fetch(API_BASE + '/charts/football-field', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: window.__model })
                });
                const data = await res.json();
                
                if (data.success) {
                    renderFootballField(data.data, container, legend, summary);
                    status.innerHTML = '<i class="fas fa-check" style="color:var(--accent)"></i> Generated';
                } else {
                    status.innerHTML = '<span style="color:var(--danger)">Error: ' + data.error + '</span>';
                }
            } catch (e) {
                // Fallback: generate locally
                const ranges = generateFootballFieldLocal(window.__model);
                renderFootballField(ranges, container, legend, summary);
                status.innerHTML = '<i class="fas fa-check" style="color:var(--accent)"></i> Generated (local)';
            }
        }

// ====================generateFootballFieldLocal====================
function generateFootballFieldLocal(model) {
            const { assumptions, dcf } = model;
            const shares = assumptions.shares_outstanding;
            const baseValue = dcf?.intrinsic_value_per_share || 0;
            
            const ranges = [];
            if (baseValue > 0) {
                ranges.push({ method: 'DCF Analysis', low: baseValue * 0.85, high: baseValue * 1.15, midpoint: baseValue, color: '#2563EB', weight: 0.35 });
            }
            // Add mock comps if available
            const evEbitda = assumptions.ebitda_margin * 12;
            const compValue = (evEbitda * assumptions.revenue_base * assumptions.revenue_growth) / shares;
            if (compValue > 0) {
                ranges.push({ method: 'Trading Comps', low: compValue * 0.90, high: compValue * 1.10, midpoint: compValue, color: '#10B981', weight: 0.25 });
            }
            // 52-week range
            const currentPrice = parseFloat(document.getElementById('price')?.value) || baseValue;
            ranges.push({ method: 'Current Price', low: currentPrice * 0.85, high: currentPrice * 1.15, midpoint: currentPrice, color: '#F59E0B', weight: 0.10 });
            
            return { ranges, weighted_average: baseValue, current_price: currentPrice };
        }

