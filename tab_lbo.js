
        // ── LBO Model Tab ──
        function generateLBO() {
            if (!modelData) return;
            const p = getCurrentParams();
            // Pre-fill with current model values
            document.getElementById('lboEntryEv').value = modelData.ev.toFixed(1);
            const entryMult = modelData.ev / modelData.ebitda[0];
            document.getElementById('lboExitMultiple').value = (entryMult * (0.95 + companyRandom(0, 15, 201) / 100)).toFixed(1);
            document.getElementById('lboDebtEquity').value = Math.min(90, Math.round(60 + companyRandom(-5, 5, 202)));
            document.getElementById('lboTermLoanRate').value = (8.5 + companyRandom(-0.5, 1.5, 203)).toFixed(1);
            document.getElementById('lboHighYieldRate').value = (12.5 + companyRandom(-0.5, 2.0, 204)).toFixed(1);
            document.getElementById('lboExitYear').value = Math.min(5, Math.max(3, Math.round(4 + companyRandom(0, 1.9, 205))));
            updateLBO();
        }

        function updateLBO() {
            const entryEv = parseFloat(document.getElementById('lboEntryEv').value) || 0;
            const debtEquityPct = parseFloat(document.getElementById('lboDebtEquity').value) || 0;
            const termLoanRate = parseFloat(document.getElementById('lboTermLoanRate').value) || 0;
            const highYieldRate = parseFloat(document.getElementById('lboHighYieldRate').value) || 0;
            const exitMultiple = parseFloat(document.getElementById('lboExitMultiple').value) || 0;
            const exitYear = parseInt(document.getElementById('lboExitYear').value) || 5;

            // Update display values
            document.getElementById('lboEntryEvVal').textContent = entryEv.toFixed(1);
            document.getElementById('lboDebtEquityVal').textContent = debtEquityPct.toFixed(0);
            document.getElementById('lboTermLoanRateVal').textContent = termLoanRate.toFixed(1);
            document.getElementById('lboHighYieldRateVal').textContent = highYieldRate.toFixed(1);
            document.getElementById('lboExitMultipleVal').textContent = exitMultiple.toFixed(1);
            document.getElementById('lboExitYearVal').textContent = exitYear;

            // Sources & Uses — 60/40 Term Loan / High Yield split of total debt
            const totalDebt = entryEv * (debtEquityPct / 100);
            const equityInvested = entryEv - totalDebt;
            const termLoan = totalDebt * 0.60;
            const highYield = totalDebt * 0.40;

            const sourcesUsesBody = document.getElementById('lboSourcesUsesBody');
            if (sourcesUsesBody) {
                sourcesUsesBody.innerHTML = `
                    <tr><td><strong>Sources</strong></td><td></td></tr>
                    <tr><td>Term Loan</td><td>₹${termLoan.toFixed(1)}</td></tr>
                    <tr><td>High Yield Debt</td><td>₹${highYield.toFixed(1)}</td></tr>
                    <tr><td>Equity Contribution</td><td>₹${equityInvested.toFixed(1)}</td></tr>
                    <tr style="font-weight:700;background:var(--bg-light);"><td>Total Sources</td><td>₹${entryEv.toFixed(1)}</td></tr>
                    <tr><td style="border:none;height:8px;"></td><td style="border:none;"></td></tr>
                    <tr><td><strong>Uses</strong></td><td></td></tr>
                    <tr><td>Purchase Enterprise Value</td><td>₹${entryEv.toFixed(1)}</td></tr>
                    <tr style="font-weight:700;background:var(--bg-light);"><td>Total Uses</td><td>₹${entryEv.toFixed(1)}</td></tr>
                `;
            }

            // Debt Schedule — term loan amortizes over 5 years, high yield bullet at exit
            const debtScheduleBody = document.getElementById('lboDebtScheduleBody');
            let remainingTermLoan = termLoan;
            let remainingHighYield = highYield;
            let scheduleHtml = '';

            for (let year = 1; year <= 5; year++) {
                const tlPrincipal = termLoan / 5;
                const hyPrincipal = (year === exitYear) ? highYield : 0;

                const tlOpening = remainingTermLoan;
                const hyOpening = remainingHighYield;

                const tlInterest = tlOpening * (termLoanRate / 100);
                const hyInterest = hyOpening * (highYieldRate / 100);

                remainingTermLoan = Math.max(0, remainingTermLoan - tlPrincipal);
                if (year === exitYear) remainingHighYield = Math.max(0, remainingHighYield - hyPrincipal);

                const yearlyPrincipal = tlPrincipal + hyPrincipal;
                const yearlyInterest = tlInterest + hyInterest;
                const totalDebtEnd = remainingTermLoan + remainingHighYield;

                const rowStyle = year > exitYear ? ' style="opacity:0.5;"' : '';
                scheduleHtml += `
                    <tr${rowStyle}>
                        <td>Year ${year}</td>
                        <td>₹${tlOpening.toFixed(1)}</td>
                        <td>₹${hyOpening.toFixed(1)}</td>
                        <td>₹${yearlyPrincipal.toFixed(1)}</td>
                        <td>₹${yearlyInterest.toFixed(1)}</td>
                        <td>₹${totalDebtEnd.toFixed(1)}</td>
                    </tr>
                `;
            }

            if (debtScheduleBody) {
                debtScheduleBody.innerHTML = scheduleHtml;
            }

            // Returns
            const entryEbitda = modelData.ebitda[0];
            const exitEbitda = modelData.ebitda[exitYear - 1];
            const exitEv = exitMultiple * exitEbitda;
            const netDebtAtExit = remainingTermLoan + remainingHighYield;
            const equityValueAtExit = exitEv - netDebtAtExit;
            const moic = equityInvested > 0 ? equityValueAtExit / equityInvested : 0;
            const irr = moic > 0 ? (Math.pow(moic, 1 / exitYear) - 1) * 100 : 0;
            const entryMultiple = entryEv / entryEbitda;

            document.getElementById('lboEntryMultiple').textContent = entryMultiple.toFixed(1) + 'x';
            document.getElementById('lboExitEv').textContent = '₹' + exitEv.toFixed(1) + ' Cr';
            document.getElementById('lboNetDebtExit').textContent = '₹' + netDebtAtExit.toFixed(1) + ' Cr';
            document.getElementById('lboEquityExit').textContent = '₹' + equityValueAtExit.toFixed(1) + ' Cr';
            document.getElementById('lboMoic').textContent = moic.toFixed(2) + 'x';
            document.getElementById('lboIrr').textContent = irr.toFixed(1) + '%';

            renderLBOReturnsChart();
        }

        function renderLBOReturnsChart() {
            const ctx = document.getElementById('lboReturnsChart');
            if (!ctx) return;

            // Recalculate components for the chart
            const entryEv = parseFloat(document.getElementById('lboEntryEv').value) || 0;
            const debtEquityPct = parseFloat(document.getElementById('lboDebtEquity').value) || 0;
            const exitMultiple = parseFloat(document.getElementById('lboExitMultiple').value) || 0;
            const exitYear = parseInt(document.getElementById('lboExitYear').value) || 5;

            const totalDebt = entryEv * (debtEquityPct / 100);
            const equityInvested = entryEv - totalDebt;
            const termLoan = totalDebt * 0.60;
            const highYield = totalDebt * 0.40;

            const tlPrincipalAnnual = termLoan / 5;
            const remainingTermLoan = Math.max(0, termLoan - tlPrincipalAnnual * exitYear);
            const remainingHighYield = 0; // high yield bullet repaid at exit
            const netDebtAtExit = remainingTermLoan + remainingHighYield;

            const entryEbitda = modelData.ebitda[0];
            const exitEbitda = modelData.ebitda[exitYear - 1];
            const entryMultipleCalc = entryEv / entryEbitda;
            const exitEvCalc = exitMultiple * exitEbitda;

            const debtPaydown = totalDebt - netDebtAtExit;
            const ebitdaGrowthValue = (exitEbitda - entryEbitda) * entryMultipleCalc;
            const multipleExpansionValue = exitEbitda * (exitMultiple - entryMultipleCalc);

            safeCreateChart('lboReturnsChart', ctx, {
                type: 'bar',
                data: {
                    labels: ['Equity Value Build-Up'],
                    datasets: [
                        { label: 'Entry Equity', data: [equityInvested], backgroundColor: '#3B82F6' },
                        { label: 'Debt Paydown', data: [debtPaydown], backgroundColor: '#10B981' },
                        { label: 'EBITDA Growth', data: [ebitdaGrowthValue], backgroundColor: '#F59E0B' },
                        { label: 'Multiple Expansion', data: [multipleExpansionValue], backgroundColor: '#EF4444' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ₹' + context.raw.toFixed(1) + ' Cr';
                                },
                                footer: function(tooltipItems) {
                                    const total = tooltipItems.reduce((sum, item) => sum + item.raw, 0);
                                    return 'Total Exit Equity: ₹' + total.toFixed(1) + ' Cr';
                                }
                            }
                        }
                    },
                    scales: {
                        x: { stacked: true },
                        y: {
                            stacked: true,
                            title: { display: true, text: '₹ Cr' },
                            ticks: { callback: function(v) { return '₹' + v; } }
                        }
                    }
                }
            });
        }
