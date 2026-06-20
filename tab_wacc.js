
        // ── WACC Calculator Tab ──
        function generateWACC() {
            if (!modelData) return;
            const p = getCurrentParams();
            // Pre-fill with current model values where applicable
            document.getElementById('waccTax').value = p.taxRate;
            document.getElementById('waccDe').value = Math.min(80, Math.round(p.netDebt / (p.netDebt + modelData.eq) * 100));
            updateWACC();
        }
        function updateWACC() {
            const rf = parseFloat(document.getElementById('waccRf').value);
            const erp = parseFloat(document.getElementById('waccErp').value);
            const beta = parseFloat(document.getElementById('waccBeta').value);
            const cod = parseFloat(document.getElementById('waccCod').value);
            const tax = parseFloat(document.getElementById('waccTax').value);
            const de = parseFloat(document.getElementById('waccDe').value);

            const coe = rf + beta * erp;
            const codAt = cod * (1 - tax / 100);
            const wd = de / 100;
            const we = 1 - wd;
            const wacc = we * coe + wd * codAt;

            document.getElementById('waccRfVal').textContent = rf.toFixed(1);
            document.getElementById('waccErpVal').textContent = erp.toFixed(1);
            document.getElementById('waccBetaVal').textContent = beta.toFixed(2);
            document.getElementById('waccCodVal').textContent = cod.toFixed(1);
            document.getElementById('waccTaxVal').textContent = tax.toFixed(2);
            document.getElementById('waccDeVal').textContent = de;
            document.getElementById('waccCoe').textContent = coe.toFixed(2) + '%';
            document.getElementById('waccCodAt').textContent = codAt.toFixed(2) + '%';
            document.getElementById('waccWe').textContent = (we * 100).toFixed(0) + '%';
            document.getElementById('waccWd').textContent = (wd * 100).toFixed(0) + '%';
            document.getElementById('waccResult').textContent = wacc.toFixed(2) + '%';

            renderWACCSensitivityChart(rf, erp, cod, tax);
        }
        function applyWACCtoDCF() {
            const wacc = parseFloat(document.getElementById('waccResult').textContent);
            document.getElementById('wacc').value = wacc.toFixed(2);
            showToast('WACC of ' + wacc.toFixed(2) + '% applied to DCF inputs');
        }
        function renderWACCSensitivityChart(rf, erp, cod, tax) {
            const ctx = document.getElementById('waccSensitivityChart');
            if (!ctx) return;
            const betas = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];
            const deRatios = [0, 10, 20, 30, 40, 50, 60];
            const datasets = deRatios.map((de, i) => {
                const wd = de / 100;
                const we = 1 - wd;
                const codAt = cod * (1 - tax / 100);
                const data = betas.map(b => we * (rf + b * erp) + wd * codAt);
                const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#F59E0B', '#EF4444', '#DC2626'];
                return { label: de + '% Debt', data, borderColor: colors[i], backgroundColor: colors[i], tension: 0.3, pointRadius: 3 };
            });
            safeCreateChart('waccSensitivityChart', ctx, {
                type: 'line',
                data: { labels: betas.map(b => 'β=' + b), datasets },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { title: { display: true, text: 'WACC %' } }, x: { title: { display: true, text: 'Beta' } } } }
            });
        }
