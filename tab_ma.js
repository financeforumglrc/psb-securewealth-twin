
        // ── M&A Accretion / Dilution Tab ──
        function generateMA() {
            if (!modelData) return;
            document.getElementById('maTargetName').textContent = modelData.company || 'Target Co.';
            document.getElementById('maTargetRev').textContent = '₹' + (modelData.rev[4] || 0).toFixed(1) + ' Cr';
            document.getElementById('maTargetNi').textContent = '₹' + (modelData.ni[4] || 0).toFixed(1) + ' Cr';
            document.getElementById('maTargetEps').textContent = '₹' + ((modelData.ni[4] || 0) / (modelData.shares || 1)).toFixed(2);
            updateMA();
        }

        function updateMA() {
            if (!modelData) return;

            const premium = parseFloat(document.getElementById('maPremium').value);
            const cashPct = parseFloat(document.getElementById('maCashPct').value);
            const stockPct = 100 - cashPct;
            const synergyRate = parseFloat(document.getElementById('maSynergyRate').value) / 100;
            const financingCostPct = parseFloat(document.getElementById('maFinancingCost').value) / 100;

            // Update display values
            document.getElementById('maPremiumVal').textContent = premium.toFixed(1) + '%';
            document.getElementById('maCashPctVal').textContent = cashPct.toFixed(0) + '%';
            document.getElementById('maStockPctVal').textContent = stockPct.toFixed(0) + '%';
            document.getElementById('maSynergyRateVal').textContent = (synergyRate * 100).toFixed(1) + '%';
            document.getElementById('maFinancingCostVal').textContent = (financingCostPct * 100).toFixed(2) + '%';

            // Target metrics
            const targetRev = modelData.rev[4];
            const targetNi = modelData.ni[4];
            const targetShares = modelData.shares || 1;
            const targetEq = modelData.eq || 0;
            const targetEps = targetNi / targetShares;
            const targetPe = targetEq / (targetNi || 1);

            // Acquisition price
            const acquisitionPrice = targetEq * (1 + premium / 100);
            document.getElementById('maAcquisitionPrice').textContent = '₹' + acquisitionPrice.toFixed(1) + ' Cr';

            // Acquirer simulation: 3x target, same P/E
            const acquirerNi = targetNi * 3;
            const acquirerRev = targetRev * 3;
            const acquirerPe = targetPe;
            const acquirerMarketCap = acquirerNi * acquirerPe; // = 3 * targetEq
            const acquirerPricePerShare = modelData.price * (1.2 + companyRandom(0, 0.6, 200));
            const acquirerShares = acquirerMarketCap / (acquirerPricePerShare || 1);
            const acquirerEps = acquirerNi / acquirerShares;

            // Consideration mix
            const cashPortion = acquisitionPrice * (cashPct / 100);
            const stockConsideration = acquisitionPrice * (stockPct / 100);
            const newSharesIssued = stockConsideration / (acquirerPricePerShare || 1);

            // Tax & financing
            const p = getCurrentParams();
            const taxRate = (p.taxRate || 25.17) / 100;
            const synergies = targetRev * synergyRate;
            const financingCost = cashPortion * financingCostPct;

            // Pro forma
            const proFormaNi = acquirerNi + targetNi + synergies * (1 - taxRate) - financingCost;
            const proFormaShares = acquirerShares + newSharesIssued;
            const proFormaEps = proFormaNi / proFormaShares;
            const accretionPct = (proFormaEps / acquirerEps - 1) * 100;

            // Break-even synergies
            const breakEvenSynergies = Math.max(0, ((acquirerEps * proFormaShares - acquirerNi - targetNi + financingCost) / (1 - taxRate)));

            // Update summary table
            const summaryBody = document.getElementById('maSummaryBody');
            summaryBody.innerHTML = `
                <tr>
                    <td><strong>Revenue (₹ Cr)</strong></td>
                    <td style="text-align: right;">₹${acquirerRev.toFixed(1)}</td>
                    <td style="text-align: right;">₹${targetRev.toFixed(1)}</td>
                    <td style="text-align: right;">₹${(acquirerRev + targetRev + synergies).toFixed(1)}</td>
                    <td style="text-align: right;">—</td>
                </tr>
                <tr>
                    <td><strong>Net Income (₹ Cr)</strong></td>
                    <td style="text-align: right;">₹${acquirerNi.toFixed(1)}</td>
                    <td style="text-align: right;">₹${targetNi.toFixed(1)}</td>
                    <td style="text-align: right;">₹${proFormaNi.toFixed(1)}</td>
                    <td style="text-align: right;">—</td>
                </tr>
                <tr>
                    <td><strong>Shares Outstanding (Cr)</strong></td>
                    <td style="text-align: right;">${acquirerShares.toFixed(2)}</td>
                    <td style="text-align: right;">${targetShares.toFixed(2)}</td>
                    <td style="text-align: right;">${proFormaShares.toFixed(2)}</td>
                    <td style="text-align: right;">+${newSharesIssued.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>EPS (₹)</strong></td>
                    <td style="text-align: right;">₹${acquirerEps.toFixed(2)}</td>
                    <td style="text-align: right;">₹${targetEps.toFixed(2)}</td>
                    <td style="text-align: right;">₹${proFormaEps.toFixed(2)}</td>
                    <td style="text-align: right; font-weight: 600; color: ${accretionPct >= 0 ? 'var(--accent)' : 'var(--danger)'};">${accretionPct >= 0 ? '+' : ''}${accretionPct.toFixed(2)}%</td>
                </tr>
            `;

            // Update key metrics
            document.getElementById('maPfEps').textContent = '₹' + proFormaEps.toFixed(2);
            document.getElementById('maAccretion').textContent = (accretionPct >= 0 ? '+' : '') + accretionPct.toFixed(2) + '%';
            document.getElementById('maBreakEven').textContent = '₹' + breakEvenSynergies.toFixed(1) + ' Cr';

            renderMAAccretionChart();
        }

        function renderMAAccretionChart() {
            const ctx = document.getElementById('maAccretionChart');
            if (!ctx || !modelData) return;

            const premium = parseFloat(document.getElementById('maPremium').value);
            const cashPct = parseFloat(document.getElementById('maCashPct').value);
            const stockPct = 100 - cashPct;
            const synergyRate = parseFloat(document.getElementById('maSynergyRate').value) / 100;
            const financingCostPct = parseFloat(document.getElementById('maFinancingCost').value) / 100;

            const targetEq = modelData.eq || 0;
            const targetPrice = modelData.price || 0;

            const acquisitionPrice = targetEq * (1 + premium / 100);
            const acquirerMarketCap = 3 * targetEq;
            const acquirerPricePerShare = targetPrice * (1.2 + companyRandom(0, 0.6, 200));
            const acquirerShares = acquirerMarketCap / (acquirerPricePerShare || 1);

            const cashPortion = acquisitionPrice * (cashPct / 100);
            const stockConsideration = acquisitionPrice * (stockPct / 100);
            const newSharesIssued = stockConsideration / (acquirerPricePerShare || 1);
            const financingCost = cashPortion * financingCostPct;
            const proFormaShares = acquirerShares + newSharesIssued;

            const p = getCurrentParams();
            const taxRate = (p.taxRate || 25.17) / 100;

            const years = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];
            const standaloneEps = [];
            const proFormaEps = [];

            for (let i = 0; i < 5; i++) {
                const targetNi = modelData.ni[i];
                const targetRev = modelData.rev[i];
                const acquirerNi = targetNi * 3;
                const synergies = targetRev * synergyRate;
                const pfNi = acquirerNi + targetNi + synergies * (1 - taxRate) - financingCost;

                standaloneEps.push(acquirerNi / acquirerShares);
                proFormaEps.push(pfNi / proFormaShares);
            }

            safeCreateChart('maAccretionChart', ctx, {
                type: 'bar',
                data: {
                    labels: years,
                    datasets: [
                        {
                            label: 'Standalone Acquirer EPS',
                            data: standaloneEps,
                            backgroundColor: 'var(--primary)',
                            borderRadius: 4,
                            barPercentage: 0.7
                        },
                        {
                            label: 'Pro Forma EPS',
                            data: proFormaEps,
                            backgroundColor: 'var(--accent)',
                            borderRadius: 4,
                            barPercentage: 0.7
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 700, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ₹' + context.raw.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'EPS (₹)' },
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                            title: { display: true, text: 'Projection Year' },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
