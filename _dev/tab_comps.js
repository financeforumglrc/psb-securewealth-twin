
        // ── Comparable Companies Tab ──
        function generateComps() {
            if (!modelData) return;
            const params = getCurrentParams();

            const target = buildTargetMetrics();
            const peers  = buildPeerMetrics(params.industry);

            populateCompsTable(target, peers);
            renderCompsScatterChart(target, peers);
            renderCompsValuationChart(target, peers);
            updateCompsSummary(target, peers, params);
        }

        function buildTargetMetrics() {
            const rev    = modelData.rev[4];
            const ebitda = modelData.ebitda[4];
            const ni     = modelData.ni[4];
            const roe    = modelData.roe[4];
            const ev     = modelData.ev;
            const eq     = modelData.eq;
            const book   = ni / (roe / 100);

            return {
                name: modelData.company,
                evRevenue: ev / rev,
                evEbitda:  ev / ebitda,
                pe:        eq / ni,
                pb:        eq / book,
                roe:       roe,
                revGrowth: (Math.pow(rev / modelData.rev[0], 0.2) - 1) * 100
            };
        }

        function buildPeerMetrics(industry) {
            const names = getPeerNamesByIndustry(industry);
            return names.map((name, i) => {
                const off = (i + 1) * 7;
                const pRev    = modelData.rev[4] * companyRandom(0.3, 2.5, off);
                const pEbitda = pRev * companyRandom(0.08, 0.35, off + 1);
                const pNi     = pEbitda * companyRandom(0.4, 0.8, off + 2);
                const pRoe    = companyRandom(8, 35, off + 3);
                const pEv     = pEbitda * companyRandom(6, 18, off + 4);
                const pEq     = pNi * companyRandom(12, 30, off + 5);
                const pBook   = pNi / (pRoe / 100);

                return {
                    name,
                    evRevenue: pEv / pRev,
                    evEbitda:  pEv / pEbitda,
                    pe:        pEq / pNi,
                    pb:        pEq / pBook,
                    roe:       pRoe,
                    revGrowth: companyRandom(-5, 25, off + 6)
                };
            });
        }

        function getPeerNamesByIndustry(industry) {
            const map = {
                'IT Services':      ['Infosys Ltd', 'Wipro Ltd', 'HCL Technologies', 'Tech Mahindra', 'LTIMindtree'],
                'Banking':          ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'IndusInd Bank'],
                'Energy':           ['ONGC', 'NTPC Ltd', 'Power Grid Corp', 'Adani Green', 'Tata Power'],
                'Automotive':       ['Maruti Suzuki', 'Mahindra & Mahindra', 'Bajaj Auto', 'Eicher Motors', 'Ashok Leyland'],
                'Pharma':           ['Sun Pharma', 'Dr Reddys Labs', 'Cipla', 'Zydus Lifesciences', 'Torrent Pharma'],
                'FMCG':             ['Hindustan Unilever', 'ITC Ltd', 'Nestle India', 'Britannia Ind', 'Dabur India'],
                'Telecom':          ['Bharti Airtel', 'Vodafone Idea', 'Indus Towers', 'Tata Comm', 'HFCL Ltd'],
                'Infrastructure':   ['Larsen & Toubro', 'DLF Ltd', 'Oberoi Realty', 'Godrej Properties', 'Sobha Ltd'],
                'Materials':        ['Tata Steel', 'JSW Steel', 'UltraTech Cement', 'Shree Cement', 'Hindalco'],
                'Conglomerate':     ['Bajaj Finserv', 'Adani Enterprises', 'Tata Motors', 'JSW Energy', 'Mahindra & Mahindra']
            };
            return map[industry] || map['Conglomerate'];
        }

        function populateCompsTable(target, peers) {
            const tbody = document.getElementById('compsTableBody');
            if (!tbody) return;

            const all = [target, ...peers];
            const med = key => {
                const arr = all.map(x => x[key]).sort((a, b) => a - b);
                const m = Math.floor(arr.length / 2);
                return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
            };

            let html = '';

            // Target row
            html += `<tr style="background: var(--bg-light); font-weight: 600;">
                <td style="color: var(--primary);">${escapeHtml(target.name)} <span style="font-size:0.75rem;opacity:0.7;">(Target)</span></td>
                <td>${target.evRevenue.toFixed(1)}x</td>
                <td>${target.evEbitda.toFixed(1)}x</td>
                <td>${target.pe.toFixed(1)}x</td>
                <td>${target.pb.toFixed(1)}x</td>
                <td>${target.roe.toFixed(1)}%</td>
                <td>${target.revGrowth.toFixed(1)}%</td>
            </tr>`;

            // Peers
            peers.forEach(p => {
                html += `<tr>
                    <td>${escapeHtml(p.name)}</td>
                    <td>${p.evRevenue.toFixed(1)}x</td>
                    <td>${p.evEbitda.toFixed(1)}x</td>
                    <td>${p.pe.toFixed(1)}x</td>
                    <td>${p.pb.toFixed(1)}x</td>
                    <td>${p.roe.toFixed(1)}%</td>
                    <td>${p.revGrowth.toFixed(1)}%</td>
                </tr>`;
            });

            // Median row
            html += `<tr style="background: var(--bg-light); font-weight: 600; border-top: 2px solid var(--border);">
                <td style="color: var(--accent);">Median</td>
                <td>${med('evRevenue').toFixed(1)}x</td>
                <td>${med('evEbitda').toFixed(1)}x</td>
                <td>${med('pe').toFixed(1)}x</td>
                <td>${med('pb').toFixed(1)}x</td>
                <td>${med('roe').toFixed(1)}%</td>
                <td>${med('revGrowth').toFixed(1)}%</td>
            </tr>`;

            tbody.innerHTML = html;
        }

        function renderCompsScatterChart(target, peers) {
            const ctx = document.getElementById('compsScatterChart');
            if (!ctx) return;

            safeCreateChart('compsScatterChart', ctx, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Peers',
                            data: peers.map(p => ({ x: p.revGrowth, y: p.evEbitda })),
                            backgroundColor: 'rgba(37, 99, 235, 0.6)',
                            borderColor: '#2563EB',
                            pointRadius: 6
                        },
                        {
                            label: target.name,
                            data: [{ x: target.revGrowth, y: target.evEbitda }],
                            backgroundColor: 'rgba(245, 158, 11, 0.9)',
                            borderColor: '#F59E0B',
                            pointRadius: 8,
                            pointStyle: 'rectRot'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                        x: { title: { display: true, text: 'Revenue Growth % (CAGR)' } },
                        y: { title: { display: true, text: 'EV / EBITDA (x)' } }
                    }
                }
            });
        }

        function renderCompsValuationChart(target, peers) {
            const ctx = document.getElementById('compsValuationChart');
            if (!ctx) return;

            const labels = peers.map(p => p.name);
            const peData      = peers.map(p => p.pe);
            const evEbitdaData = peers.map(p => p.evEbitda);
            const pbData      = peers.map(p => p.pb);

            // Insert target at index 0
            labels.unshift(target.name);
            peData.unshift(target.pe);
            evEbitdaData.unshift(target.evEbitda);
            pbData.unshift(target.pb);

            safeCreateChart('compsValuationChart', ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: 'P/E',      data: peData,       backgroundColor: 'rgba(37, 99, 235, 0.7)',  borderColor: '#2563EB', borderWidth: 1 },
                        { label: 'EV/EBITDA', data: evEbitdaData, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: '#10B981', borderWidth: 1 },
                        { label: 'P/B',      data: pbData,       backgroundColor: 'rgba(245, 158, 11, 0.7)', borderColor: '#F59E0B', borderWidth: 1 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                        y: { title: { display: true, text: 'Multiple (x)' } },
                        x: {
                            ticks: {
                                callback: function(val) {
                                    const label = this.getLabelForValue(val);
                                    return label.length > 12 ? label.substring(0, 12) + '…' : label;
                                }
                            }
                        }
                    }
                }
            });
        }

        function updateCompsSummary(target, peers, params) {
            const all = [target, ...peers];
            const median = key => {
                const arr = all.map(x => x[key]).sort((a, b) => a - b);
                const m = Math.floor(arr.length / 2);
                return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
            };

            const medEvEbitda = median('evEbitda');
            const medEvRev    = median('evRevenue');
            const medPe       = median('pe');
            const medPb       = median('pb');

            const bookValue = modelData.ni[4] / (modelData.roe[4] / 100);

            const evFromEbitda = medEvEbitda * modelData.ebitda[4];
            const evFromRev    = medEvRev    * modelData.rev[4];
            const evFromPe     = (medPe * modelData.ni[4]) + params.netDebt;
            const evFromPb     = (medPb * bookValue) + params.netDebt;

            const impliedEVs = [evFromEbitda, evFromRev, evFromPe, evFromPb]
                .filter(v => isFinite(v) && v > 0);

            const minEV = Math.min(...impliedEVs);
            const maxEV = Math.max(...impliedEVs);
            const medEV = (() => {
                const s = [...impliedEVs].sort((a, b) => a - b);
                const m = Math.floor(s.length / 2);
                return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
            })();

            const premium = ((modelData.ev / medEV) - 1) * 100;

            const rangeEl = document.getElementById('compsEvRange');
            const premEl  = document.getElementById('compsPremium');

            if (rangeEl) rangeEl.textContent = '₹' + minEV.toFixed(0) + ' – ₹' + maxEV.toFixed(0) + ' Cr';
            if (premEl) {
                premEl.textContent = (premium >= 0 ? '+' : '') + premium.toFixed(1) + '%';
                premEl.style.color = premium > 15 ? '#FCA5A5' : premium < -15 ? '#6EE7B7' : 'white';
            }
        }
