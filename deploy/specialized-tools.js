/**
 * DS Financial Solutions - Specialized Tools
 * Crypto/VDA Tax Calculator & TDS Calculator
 * FY 2025-26 | India-Specific Calculations
 */

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeTDSSections();
    showTDSDueDates();
    loadCryptoRules();
    loadTDSRateChart();
    loadFromStorage();
});

// ==================== NAVIGATION ====================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav-link, .mobile-nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tool = link.getAttribute('data-tool');
            switchTool(tool);
        });
    });
}

function switchTool(toolId) {
    // Update nav links
    document.querySelectorAll('.sidebar-nav-link, .mobile-nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tool') === toolId) {
            link.classList.add('active');
        }
    });
    
    // Update panels
    document.querySelectorAll('.tool-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(`panel-${toolId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

// ==================== THEME TOGGLE ====================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('ds-theme', isDark ? 'dark' : 'light');
}

// Load saved theme
if (localStorage.getItem('ds-theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// ==================== CRYPTO TAX CALCULATOR ====================
let cryptoTransType = 'sell';
let cryptoPortfolio = [];
let recentCryptoTxns = [];

function setCryptoTransType(type) {
    cryptoTransType = type;
    document.querySelectorAll('#panel-crypto-calc .tabs .tab').forEach((tab, i) => {
        tab.classList.toggle('active', ['sell', 'gift', 'mining'][i] === type);
    });
}

function updateCryptoPrice() {
    // Auto-populate approximate prices (for demo)
    const prices = {
        'BTC': 7500000,
        'ETH': 300000,
        'BNB': 45000,
        'SOL': 15000,
        'XRP': 50,
        'DOGE': 15,
        'USDT': 84,
        'OTHER': 0
    };
    
    const coin = document.getElementById('cryptoCoin').value;
    // Don't auto-fill to let user enter actual prices
}

function calculateCryptoTax() {
    const qty = parseFloat(document.getElementById('cryptoQty').value) || 0;
    const buyPrice = parseFloat(document.getElementById('cryptoBuyPrice').value) || 0;
    const sellPrice = parseFloat(document.getElementById('cryptoSellPrice').value) || 0;
    
    const investment = qty * buyPrice;
    const proceeds = qty * sellPrice;
    const gains = proceeds - investment;
    
    // Tax calculation (30% flat + 4% cess)
    let tax30 = 0;
    let surcharge = 0;
    let cess = 0;
    
    if (gains > 0) {
        tax30 = gains * 0.30;
        
        // Surcharge based on total income (simplified - assuming high income for crypto traders)
        if (gains > 10000000) { // Above 1 Cr
            surcharge = tax30 * 0.15;
        } else if (gains > 5000000) { // Above 50L
            surcharge = tax30 * 0.10;
        }
        
        cess = (tax30 + surcharge) * 0.04;
    }
    
    // TDS @ 1% on sale value (above threshold)
    const tdsThreshold = 10000; // Annual threshold
    let tds1 = proceeds > tdsThreshold ? proceeds * 0.01 : 0;
    
    const totalTax = tax30 + surcharge + cess;
    const netTax = Math.max(0, totalTax - tds1);
    
    // Update display
    document.getElementById('cryptoInvestment').textContent = formatCurrency(investment);
    document.getElementById('cryptoProceeds').textContent = formatCurrency(proceeds);
    document.getElementById('cryptoGains').textContent = formatCurrency(gains);
    document.getElementById('cryptoGains').style.color = gains >= 0 ? 'var(--success)' : 'var(--error)';
    document.getElementById('cryptoTax30').textContent = formatCurrency(tax30);
    document.getElementById('cryptoSurcharge').textContent = formatCurrency(surcharge);
    document.getElementById('cryptoCess').textContent = formatCurrency(cess);
    document.getElementById('cryptoTDS1').textContent = formatCurrency(tds1);
    document.getElementById('cryptoNetTax').textContent = formatCurrency(netTax);
    
    // Update hero stats
    document.getElementById('statTotalGains').textContent = formatCurrency(gains);
    document.getElementById('statCryptoTax').textContent = formatCurrency(totalTax);
    document.getElementById('statCryptoTDS').textContent = formatCurrency(tds1);
    document.getElementById('statNetTax').textContent = formatCurrency(netTax);
    
    return { investment, proceeds, gains, tax30, surcharge, cess, tds1, totalTax, netTax };
}

function addToPortfolio() {
    const coin = document.getElementById('cryptoCoin').value;
    const qty = parseFloat(document.getElementById('cryptoQty').value) || 0;
    const buyPrice = parseFloat(document.getElementById('cryptoBuyPrice').value) || 0;
    const sellPrice = parseFloat(document.getElementById('cryptoSellPrice').value) || 0;
    
    if (qty <= 0 || buyPrice <= 0 || sellPrice <= 0) {
        alert('Please fill in all required fields');
        return;
    }
    
    const result = calculateCryptoTax();
    
    const txn = {
        id: Date.now(),
        coin,
        qty,
        buyPrice,
        sellPrice,
        ...result,
        date: new Date().toISOString()
    };
    
    recentCryptoTxns.unshift(txn);
    if (recentCryptoTxns.length > 10) recentCryptoTxns.pop();
    
    updateRecentTxns();
    saveToStorage();
    
    // Clear form
    document.getElementById('cryptoQty').value = '';
    document.getElementById('cryptoBuyPrice').value = '';
    document.getElementById('cryptoSellPrice').value = '';
}

function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    if (typeof unsafe !== 'string') unsafe = String(unsafe);
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function updateRecentTxns() {
    const container = document.getElementById('recentCryptoTxns');
    
    if (recentCryptoTxns.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No transactions yet.</p>';
        return;
    }
    
    let html = '<table class="transaction-table"><thead><tr><th>Asset</th><th>Qty</th><th>Gain/Loss</th><th>Tax</th></tr></thead><tbody>';
    
    recentCryptoTxns.forEach(txn => {
        const safeCoin = escapeHtml(txn.coin);
        html += `
            <tr>
                <td><span class="coin-badge ${escapeHtml(txn.coin.toLowerCase())}">${safeCoin}</span></td>
                <td>${txn.qty.toFixed(4)}</td>
                <td class="${txn.gains >= 0 ? 'profit' : 'loss'}">${formatCurrency(txn.gains)}</td>
                <td>${formatCurrency(txn.totalTax)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function downloadCryptoReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(138, 43, 226);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Crypto/VDA Tax Report', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('FY 2025-26 | Section 115BBH', 105, 28, { align: 'center' });
    
    // Reset color
    doc.setTextColor(0, 0, 0);
    
    const result = calculateCryptoTax();
    const coin = document.getElementById('cryptoCoin').value;
    const qty = parseFloat(document.getElementById('cryptoQty').value) || 0;
    
    // Transaction Details
    doc.setFontSize(14);
    doc.text('Transaction Details', 14, 50);
    doc.setFontSize(10);
    
    const details = [
        ['Cryptocurrency', coin],
        ['Quantity', qty.toString()],
        ['Investment', formatCurrency(result.investment)],
        ['Sale Proceeds', formatCurrency(result.proceeds)],
        ['Capital Gains', formatCurrency(result.gains)]
    ];
    
    doc.autoTable({
        startY: 55,
        head: [['Description', 'Amount']],
        body: details,
        theme: 'grid',
        headStyles: { fillColor: [138, 43, 226] }
    });
    
    // Tax Calculation
    doc.setFontSize(14);
    doc.text('Tax Calculation', 14, doc.lastAutoTable.finalY + 15);
    
    const taxDetails = [
        ['Tax @ 30%', formatCurrency(result.tax30)],
        ['Surcharge', formatCurrency(result.surcharge)],
        ['Health & Education Cess (4%)', formatCurrency(result.cess)],
        ['TDS Deducted @ 1%', formatCurrency(result.tds1)],
        ['Net Tax Payable', formatCurrency(result.netTax)]
    ];
    
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Component', 'Amount']],
        body: taxDetails,
        theme: 'grid',
        headStyles: { fillColor: [138, 43, 226] }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by DS Financial Solutions | dsfinancialanalyst.surge.sh', 105, 285, { align: 'center' });
    doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, 105, 290, { align: 'center' });
    
    doc.save(`Crypto_Tax_Report_${coin}_${Date.now()}.pdf`);
}

// ==================== CRYPTO TDS (1%) ====================
function calculateCryptoTDS() {
    const amount = parseFloat(document.getElementById('cryptoTDSAmount').value) || 0;
    const thresholdUsed = parseFloat(document.getElementById('cryptoTDSThreshold').value) || 0;
    const annualThreshold = 10000;
    
    const remainingThreshold = Math.max(0, annualThreshold - thresholdUsed);
    const taxableAmount = Math.max(0, amount - remainingThreshold);
    const tds = taxableAmount * 0.01;
    const netAmount = amount - tds;
    
    document.getElementById('cryptoTDSResult').textContent = formatCurrency(tds);
    document.getElementById('cryptoTDSTaxable').textContent = formatCurrency(taxableAmount);
    document.getElementById('cryptoTDSNet').textContent = formatCurrency(netAmount);
    
    // Due date calculation
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 30);
    document.getElementById('cryptoTDSDue').textContent = nextMonth.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ==================== TAX-LOSS HARVESTING ====================
function analyzeHarvest() {
    const qty = parseFloat(document.getElementById('harvestQty').value) || 0;
    const avgPrice = parseFloat(document.getElementById('harvestAvgPrice').value) || 0;
    const currentPrice = parseFloat(document.getElementById('harvestCurrentPrice').value) || 0;
    
    const investment = qty * avgPrice;
    const currentValue = qty * currentPrice;
    const unrealizedLoss = currentValue - investment;
    
    document.getElementById('harvestInvestment').textContent = formatCurrency(investment);
    document.getElementById('harvestValue').textContent = formatCurrency(currentValue);
    document.getElementById('harvestLoss').textContent = formatCurrency(unrealizedLoss);
    document.getElementById('harvestLoss').style.color = unrealizedLoss >= 0 ? 'var(--success)' : 'var(--error)';
    
    if (unrealizedLoss < 0) {
        document.getElementById('harvestSavings').textContent = formatCurrency(Math.abs(unrealizedLoss));
        document.getElementById('harvestRecommendation').textContent = 'Consider booking loss for accounting (no tax benefit in India)';
    } else {
        document.getElementById('harvestSavings').textContent = '₹0';
        document.getElementById('harvestRecommendation').textContent = 'No harvesting opportunity - holding at profit';
    }
}

// ==================== WASH SALE DETECTOR ====================
function checkWashSale() {
    const saleDate = document.getElementById('washSaleDate').value;
    const buyDate = document.getElementById('washBuyDate').value;
    
    if (!saleDate || !buyDate) return;
    
    const sale = new Date(saleDate);
    const buy = new Date(buyDate);
    const diffDays = Math.abs((buy - sale) / (1000 * 60 * 60 * 24));
    
    const statusDiv = document.getElementById('washSaleStatus');
    const resultDiv = document.getElementById('washSaleResult');
    
    if (diffDays <= 30) {
        statusDiv.innerHTML = '<span class="wash-sale-badge danger"><i class="fas fa-exclamation-triangle"></i> Potential Wash Sale</span>';
        resultDiv.innerHTML = `
            <div class="alert error">
                <div class="alert-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="alert-content">
                    <div class="alert-title">Wash Sale Detected (${Math.round(diffDays)} days)</div>
                    <div class="alert-text">You repurchased within 30 days of selling. While India doesn't currently have wash sale rules for crypto, this may be considered tax avoidance if rules change.</div>
                </div>
            </div>
        `;
    } else {
        statusDiv.innerHTML = '<span class="wash-sale-badge safe"><i class="fas fa-check"></i> No Wash Sale</span>';
        resultDiv.innerHTML = `
            <div class="alert success">
                <div class="alert-icon"><i class="fas fa-check-circle"></i></div>
                <div class="alert-content">
                    <div class="alert-title">Safe Transaction (${Math.round(diffDays)} days apart)</div>
                    <div class="alert-text">The repurchase is more than 30 days after the sale. This would not be considered a wash sale.</div>
                </div>
            </div>
        `;
    }
}

// ==================== TDS CALCULATOR ====================
const tdsRates = {
    '192': { rate: 'Slab', threshold: 250000, desc: 'Salary' },
    '192A': { rate: 10, threshold: 50000, desc: 'Premature PF Withdrawal' },
    '194': { rate: 10, threshold: 5000, desc: 'Dividends' },
    '194A': { rate: 10, threshold: 40000, desc: 'Interest (Other than Securities)' },
    '194C': { rate: 1, rateCompany: 2, threshold: 30000, single: 10000, desc: 'Contractor/Sub-contractor' },
    '194H': { rate: 5, threshold: 15000, desc: 'Commission/Brokerage' },
    '194I-a': { rate: 2, threshold: 240000, desc: 'Rent (Plant & Machinery)' },
    '194I-b': { rate: 10, threshold: 240000, desc: 'Rent (Land & Building)' },
    '194IB': { rate: 5, threshold: 50000, desc: 'Rent by Individual/HUF (Monthly)' },
    '194IA': { rate: 1, threshold: 5000000, desc: 'Transfer of Property' },
    '194J': { rate: 10, threshold: 30000, desc: 'Professional/Technical Fees' },
    '194M': { rate: 5, threshold: 5000000, desc: 'Payments by Individual/HUF' },
    '194N': { rate: 2, threshold: 10000000, desc: 'Cash Withdrawal' },
    '194Q': { rate: 0.1, threshold: 5000000, desc: 'Purchase of Goods' },
    '194S': { rate: 1, threshold: 10000, desc: 'Crypto/VDA Transfer' }
};

function updateTDSRate() {
    const section = document.getElementById('tdsSection').value;
    const payeeType = document.getElementById('tdsPayeeType').value;
    
    if (!section || !tdsRates[section]) {
        document.getElementById('tdsRate').value = '';
        return;
    }
    
    let rate = tdsRates[section].rate;
    
    // Company rate for contractor
    if (section === '194C' && payeeType === 'company') {
        rate = tdsRates[section].rateCompany;
    }
    
    // No PAN penalty
    if (payeeType === 'nopan') {
        rate = Math.max(rate, 20);
    }
    
    document.getElementById('tdsRate').value = rate === 'Slab' ? '' : rate;
    
    // Update section display
    document.getElementById('statTDSSection').textContent = section;
    
    calculateTDS();
}

function selectTDSSection(section) {
    document.getElementById('tdsSection').value = section;
    updateTDSRate();
}

function calculateTDS() {
    const section = document.getElementById('tdsSection').value;
    const amount = parseFloat(document.getElementById('tdsPaymentAmount').value) || 0;
    let rate = parseFloat(document.getElementById('tdsRate').value) || 0;
    
    const lowerCert = document.getElementById('tdsLowerCert').value;
    if (lowerCert === 'yes') {
        document.getElementById('lowerCertRateGroup').style.display = 'block';
        rate = parseFloat(document.getElementById('tdsLowerRate').value) || rate;
    } else {
        document.getElementById('lowerCertRateGroup').style.display = 'none';
    }
    
    // Check threshold
    let threshold = 0;
    if (section && tdsRates[section]) {
        threshold = tdsRates[section].threshold || 0;
    }
    
    let taxableAmount = amount;
    if (amount < threshold && section !== '194S') { // Crypto TDS has different threshold logic
        taxableAmount = 0;
    }
    
    const tds = taxableAmount * (rate / 100);
    const netPayable = amount - tds;
    
    // Update display
    document.getElementById('tdsResultAmount').textContent = formatCurrency(tds);
    document.getElementById('tdsGross').textContent = formatCurrency(amount);
    document.getElementById('tdsEffectiveRate').textContent = rate + '%';
    document.getElementById('tdsNetPayee').textContent = formatCurrency(netPayable);
    
    // Update hero stats
    document.getElementById('statTDSAmount').textContent = formatCurrency(tds);
    document.getElementById('statNetPayable').textContent = formatCurrency(netPayable);
    
    // Due date
    const now = new Date();
    const dueDate = now.getMonth() === 2 ? '30th Apr' : '7th of next month';
    document.getElementById('tdsDueDate').textContent = dueDate;
    document.getElementById('statTDSDueDate').textContent = dueDate.split(' ')[0];
}

function downloadTDSReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('TDS Calculation Report', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('FY 2025-26 | Income Tax Department', 105, 28, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    
    const section = document.getElementById('tdsSection').value;
    const amount = parseFloat(document.getElementById('tdsPaymentAmount').value) || 0;
    const rate = parseFloat(document.getElementById('tdsRate').value) || 0;
    const tds = amount * (rate / 100);
    
    const details = [
        ['TDS Section', section],
        ['Nature of Payment', tdsRates[section]?.desc || '-'],
        ['Gross Amount', formatCurrency(amount)],
        ['TDS Rate', rate + '%'],
        ['TDS Amount', formatCurrency(tds)],
        ['Net to Payee', formatCurrency(amount - tds)]
    ];
    
    doc.setFontSize(14);
    doc.text('TDS Details', 14, 50);
    
    doc.autoTable({
        startY: 55,
        head: [['Description', 'Value']],
        body: details,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by DS Financial Solutions | dsfinancialanalyst.surge.sh', 105, 285, { align: 'center' });
    
    doc.save(`TDS_Report_${section}_${Date.now()}.pdf`);
}

// ==================== TDS ON SALARY ====================
function calculateSalaryTDS() {
    const gross = parseFloat(document.getElementById('salaryGross').value) || 0;
    const regime = document.getElementById('salaryRegime').value;
    const months = parseInt(document.getElementById('salaryMonths').value) || 12;
    
    // Show/hide old regime deductions
    document.getElementById('oldRegimeDeductions').style.display = regime === 'old' ? 'block' : 'none';
    
    let taxableIncome = gross;
    let standardDed = 75000; // FY 2025-26
    let otherDed = 0;
    
    if (regime === 'old') {
        const ded80C = Math.min(parseFloat(document.getElementById('salary80C').value) || 0, 150000);
        const ded80D = parseFloat(document.getElementById('salary80D').value) || 0;
        const dedHRA = parseFloat(document.getElementById('salaryHRA').value) || 0;
        const dedOther = parseFloat(document.getElementById('salaryOther').value) || 0;
        
        standardDed = 50000; // Old regime has 50k
        otherDed = ded80C + ded80D + dedHRA + dedOther;
    }
    
    taxableIncome = Math.max(0, gross - standardDed - otherDed);
    
    // Calculate tax based on regime
    let tax = 0;
    
    if (regime === 'new') {
        // New regime FY 2025-26 slabs
        if (taxableIncome > 1500000) {
            tax = 150000 + (taxableIncome - 1500000) * 0.30;
        } else if (taxableIncome > 1200000) {
            tax = 90000 + (taxableIncome - 1200000) * 0.20;
        } else if (taxableIncome > 1000000) {
            tax = 70000 + (taxableIncome - 1000000) * 0.15;
        } else if (taxableIncome > 700000) {
            tax = 40000 + (taxableIncome - 700000) * 0.10;
        } else if (taxableIncome > 400000) {
            tax = 15000 + (taxableIncome - 400000) * 0.05;
        } else if (taxableIncome > 300000) {
            tax = (taxableIncome - 300000) * 0.05;
        }
        
        // Rebate u/s 87A (up to 7L income, max 25000)
        if (taxableIncome <= 700000) {
            tax = Math.max(0, tax - 25000);
        }
    } else {
        // Old regime slabs
        if (taxableIncome > 1000000) {
            tax = 112500 + (taxableIncome - 1000000) * 0.30;
        } else if (taxableIncome > 500000) {
            tax = 12500 + (taxableIncome - 500000) * 0.20;
        } else if (taxableIncome > 250000) {
            tax = (taxableIncome - 250000) * 0.05;
        }
        
        // Rebate u/s 87A (up to 5L income)
        if (taxableIncome <= 500000) {
            tax = Math.max(0, tax - 12500);
        }
    }
    
    // Add cess
    const totalTax = tax * 1.04;
    const monthlyTDS = totalTax / months;
    
    // Update display
    document.getElementById('salaryGrossDisplay').textContent = formatCurrency(gross);
    document.getElementById('salaryStdDed').textContent = formatCurrency(standardDed);
    document.getElementById('salaryTotalDed').textContent = formatCurrency(otherDed);
    document.getElementById('salaryTaxable').textContent = formatCurrency(taxableIncome);
    document.getElementById('salaryAnnualTax').textContent = formatCurrency(totalTax);
    document.getElementById('salaryMonthlyTDS').textContent = formatCurrency(monthlyTDS);
}

// ==================== TDS INTEREST CALCULATOR ====================
function calculateTDSInterest() {
    const tdsAmount = parseFloat(document.getElementById('tdsInterestAmount').value) || 0;
    const dueDate = document.getElementById('tdsInterestDueDate').value;
    const payDate = document.getElementById('tdsInterestPayDate').value;
    const defaultType = document.getElementById('tdsDefaultType').value;
    
    if (!dueDate || !payDate) return;
    
    const due = new Date(dueDate);
    const pay = new Date(payDate);
    
    // Calculate months (part of month = 1 month)
    let months = 0;
    if (pay > due) {
        months = Math.ceil((pay - due) / (1000 * 60 * 60 * 24 * 30));
    }
    
    const rate = defaultType === 'non-deduction' ? 1.5 : 1;
    const interest = tdsAmount * (rate / 100) * months;
    
    document.getElementById('tdsInterestResult').textContent = formatCurrency(interest);
    document.getElementById('tdsDelayMonths').textContent = months;
    document.getElementById('tdsInterestRate').textContent = rate + '% p.m.';
}

// ==================== TDS SECTIONS REFERENCE ====================
const allTDSSections = [
    { section: '192', nature: 'Salary', rate: 'As per slab', threshold: '₹2,50,000', category: 'salary' },
    { section: '192A', nature: 'Premature PF Withdrawal', rate: '10%', threshold: '₹50,000', category: 'salary' },
    { section: '194', nature: 'Dividends', rate: '10%', threshold: '₹5,000', category: 'others' },
    { section: '194A', nature: 'Interest (Other than Securities)', rate: '10%', threshold: '₹40,000', category: 'others' },
    { section: '194B', nature: 'Lottery/Puzzle/Game Winnings', rate: '30%', threshold: '₹10,000', category: 'others' },
    { section: '194BB', nature: 'Horse Race Winnings', rate: '30%', threshold: '₹10,000', category: 'others' },
    { section: '194C', nature: 'Contractor (Individual)', rate: '1%', threshold: '₹30,000/year', category: 'contractor' },
    { section: '194C', nature: 'Contractor (Company)', rate: '2%', threshold: '₹30,000/year', category: 'contractor' },
    { section: '194D', nature: 'Insurance Commission', rate: '5%', threshold: '₹15,000', category: 'others' },
    { section: '194DA', nature: 'Life Insurance Payout', rate: '5%', threshold: '₹1,00,000', category: 'others' },
    { section: '194E', nature: 'Non-resident Sportsperson', rate: '20%', threshold: 'Nil', category: 'others' },
    { section: '194EE', nature: 'NSS Withdrawal', rate: '10%', threshold: '₹2,500', category: 'others' },
    { section: '194G', nature: 'Lottery Commission', rate: '5%', threshold: '₹15,000', category: 'others' },
    { section: '194H', nature: 'Commission/Brokerage', rate: '5%', threshold: '₹15,000', category: 'contractor' },
    { section: '194I(a)', nature: 'Rent - Plant & Machinery', rate: '2%', threshold: '₹2,40,000', category: 'property' },
    { section: '194I(b)', nature: 'Rent - Land & Building', rate: '10%', threshold: '₹2,40,000', category: 'property' },
    { section: '194IA', nature: 'Property Transfer', rate: '1%', threshold: '₹50,00,000', category: 'property' },
    { section: '194IB', nature: 'Rent by Individual/HUF', rate: '5%', threshold: '₹50,000/month', category: 'property' },
    { section: '194IC', nature: 'JDA Payments', rate: '10%', threshold: 'Nil', category: 'property' },
    { section: '194J', nature: 'Professional/Technical Fees', rate: '10%', threshold: '₹30,000', category: 'contractor' },
    { section: '194K', nature: 'Mutual Fund Income', rate: '10%', threshold: '₹5,000', category: 'others' },
    { section: '194LA', nature: 'Compulsory Land Acquisition', rate: '10%', threshold: '₹2,50,000', category: 'property' },
    { section: '194LBA', nature: 'REIT/InvIT Income', rate: '10%', threshold: 'Nil', category: 'others' },
    { section: '194M', nature: 'Payments by Individual/HUF', rate: '5%', threshold: '₹50,00,000', category: 'contractor' },
    { section: '194N', nature: 'Cash Withdrawal', rate: '2%', threshold: '₹1 Cr', category: 'others' },
    { section: '194O', nature: 'E-commerce Operator', rate: '1%', threshold: '₹5,00,000', category: 'others' },
    { section: '194P', nature: 'Senior Citizen (75+) Tax', rate: 'As per slab', threshold: 'Pension only', category: 'salary' },
    { section: '194Q', nature: 'Purchase of Goods', rate: '0.1%', threshold: '₹50,00,000', category: 'others' },
    { section: '194R', nature: 'Perquisites/Benefits', rate: '10%', threshold: '₹20,000', category: 'others' },
    { section: '194S', nature: 'Crypto/VDA Transfer', rate: '1%', threshold: '₹10,000', category: 'others' }
];

function initializeTDSSections() {
    showTDSCategory('all');
}

function showTDSCategory(category) {
    const container = document.getElementById('tdsSectionsContent');
    const filtered = category === 'all' ? allTDSSections : allTDSSections.filter(s => s.category === category);
    
    // Update tabs
    document.querySelectorAll('#panel-tds-sections .tabs .tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(category) || (category === 'all' && tab.textContent.includes('All'))) {
            tab.classList.add('active');
        }
    });
    
    let html = '<table class="tds-sections-table"><thead><tr><th>Section</th><th>Nature of Payment</th><th>TDS Rate</th><th>Threshold</th></tr></thead><tbody>';
    
    filtered.forEach(s => {
        html += `
            <tr onclick="selectTDSSection('${s.section.split('(')[0]}')">
                <td class="section-code">${s.section}</td>
                <td>${s.nature}</td>
                <td class="rate">${s.rate}</td>
                <td>${s.threshold}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ==================== TDS DUE DATES ====================
function showTDSDueDates() {
    const quarter = document.getElementById('tdsQuarter').value;
    const timeline = document.getElementById('tdsDueDatesTimeline');
    
    const dueDates = {
        'Q1': [
            { date: '7th May 2025', event: 'TDS Deposit for April', type: 'deposit' },
            { date: '7th Jun 2025', event: 'TDS Deposit for May', type: 'deposit' },
            { date: '7th Jul 2025', event: 'TDS Deposit for June', type: 'deposit' },
            { date: '31st Jul 2025', event: 'Form 24Q/26Q Filing (Q1)', type: 'return' }
        ],
        'Q2': [
            { date: '7th Aug 2025', event: 'TDS Deposit for July', type: 'deposit' },
            { date: '7th Sep 2025', event: 'TDS Deposit for August', type: 'deposit' },
            { date: '7th Oct 2025', event: 'TDS Deposit for September', type: 'deposit' },
            { date: '31st Oct 2025', event: 'Form 24Q/26Q Filing (Q2)', type: 'return' }
        ],
        'Q3': [
            { date: '7th Nov 2025', event: 'TDS Deposit for October', type: 'deposit' },
            { date: '7th Dec 2025', event: 'TDS Deposit for November', type: 'deposit' },
            { date: '7th Jan 2026', event: 'TDS Deposit for December', type: 'deposit' },
            { date: '31st Jan 2026', event: 'Form 24Q/26Q Filing (Q3)', type: 'return' }
        ],
        'Q4': [
            { date: '7th Feb 2026', event: 'TDS Deposit for January', type: 'deposit' },
            { date: '7th Mar 2026', event: 'TDS Deposit for February', type: 'deposit' },
            { date: '30th Apr 2026', event: 'TDS Deposit for March', type: 'deposit' },
            { date: '31st May 2026', event: 'Form 24Q/26Q Filing (Q4)', type: 'return' },
            { date: '15th Jun 2026', event: 'Form 16/16A Issuance', type: 'certificate' }
        ]
    };
    
    const dates = dueDates[quarter] || [];
    
    let html = '';
    dates.forEach((item, index) => {
        const iconClass = item.type === 'deposit' ? 'fa-money-bill-wave' : item.type === 'return' ? 'fa-file-alt' : 'fa-certificate';
        const isUpcoming = index === 0;
        
        html += `
            <div class="timeline-item ${isUpcoming ? 'upcoming' : ''}">
                <div class="timeline-marker">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-date">${item.date}</div>
                    <div class="timeline-title">${item.event}</div>
                </div>
            </div>
        `;
    });
    
    timeline.innerHTML = html;
}

// ==================== CRYPTO RULES ====================
function loadCryptoRules() {
    const container = document.getElementById('cryptoRulesContent');
    
    container.innerHTML = `
        <div class="rules-section">
            <h4><i class="fas fa-percentage"></i> Tax Rate</h4>
            <p>Flat <strong>30%</strong> tax on all gains from Virtual Digital Assets (VDA) including cryptocurrencies, NFTs, and tokens. This rate applies regardless of your income tax slab or holding period.</p>
        </div>
        
        <div class="rules-section">
            <h4><i class="fas fa-hand-holding-usd"></i> TDS Provisions</h4>
            <ul>
                <li><strong>1% TDS</strong> on transfer of VDA above ₹10,000/year (₹50,000 for specified persons)</li>
                <li>TDS is deducted by the buyer/exchange on the TOTAL consideration, not just profit</li>
                <li>No TDS if seller is the exchange itself</li>
            </ul>
        </div>
        
        <div class="rules-section">
            <h4><i class="fas fa-ban"></i> Loss Set-off Restrictions</h4>
            <ul>
                <li><strong>No set-off</strong> of crypto losses against any other income (salary, business, etc.)</li>
                <li><strong>No carry forward</strong> of crypto losses to future years</li>
                <li>Loss from one crypto CANNOT be set off against gain from another crypto</li>
            </ul>
        </div>
        
        <div class="rules-section">
            <h4><i class="fas fa-gift"></i> Gift Taxation</h4>
            <ul>
                <li>Gift from relative: No tax at time of receipt</li>
                <li>Gift from non-relative above ₹50,000: Taxable as income</li>
                <li>When you sell gifted crypto: 30% tax on (Sale Price - Donor's Cost)</li>
            </ul>
        </div>
        
        <div class="rules-section">
            <h4><i class="fas fa-calculator"></i> Cost of Acquisition</h4>
            <ul>
                <li>Only the actual purchase cost is allowed as deduction</li>
                <li>No deduction for transaction fees, gas fees, or any other expenses</li>
                <li>For staking/mining rewards: Cost of acquisition is NIL (100% is taxable)</li>
            </ul>
        </div>
        
        <div class="rules-section">
            <h4><i class="fas fa-calendar"></i> Important Dates</h4>
            <ul>
                <li>Crypto tax provisions effective from: <strong>1st April 2022</strong></li>
                <li>TDS provisions effective from: <strong>1st July 2022</strong></li>
                <li>Report crypto income in: <strong>Schedule VDA</strong> of ITR</li>
            </ul>
        </div>
    `;
}

// ==================== TDS RATE CHART ====================
function loadTDSRateChart() {
    const container = document.getElementById('tdsRateChartContent');
    
    let html = '<table class="tds-sections-table full-width">';
    html += '<thead><tr><th>Section</th><th>Nature</th><th>Individual/HUF</th><th>Company</th><th>No PAN</th><th>Threshold</th></tr></thead>';
    html += '<tbody>';
    
    const rateData = [
        { sec: '192', nature: 'Salary', ind: 'Slab', comp: '-', nopan: '20%', threshold: '₹2.5L' },
        { sec: '194A', nature: 'Interest', ind: '10%', comp: '10%', nopan: '20%', threshold: '₹40K' },
        { sec: '194C', nature: 'Contractor', ind: '1%', comp: '2%', nopan: '20%', threshold: '₹30K/yr' },
        { sec: '194H', nature: 'Commission', ind: '5%', comp: '5%', nopan: '20%', threshold: '₹15K' },
        { sec: '194I(a)', nature: 'Rent (P&M)', ind: '2%', comp: '2%', nopan: '20%', threshold: '₹2.4L' },
        { sec: '194I(b)', nature: 'Rent (L&B)', ind: '10%', comp: '10%', nopan: '20%', threshold: '₹2.4L' },
        { sec: '194IA', nature: 'Property', ind: '1%', comp: '1%', nopan: '20%', threshold: '₹50L' },
        { sec: '194J', nature: 'Professional', ind: '10%', comp: '10%', nopan: '20%', threshold: '₹30K' },
        { sec: '194Q', nature: 'Goods', ind: '0.1%', comp: '0.1%', nopan: '5%', threshold: '₹50L' },
        { sec: '194S', nature: 'Crypto/VDA', ind: '1%', comp: '1%', nopan: '5%', threshold: '₹10K' }
    ];
    
    rateData.forEach(r => {
        html += `<tr>
            <td class="section-code">${r.sec}</td>
            <td>${r.nature}</td>
            <td class="rate">${r.ind}</td>
            <td class="rate">${r.comp}</td>
            <td class="rate" style="color: var(--error);">${r.nopan}</td>
            <td>${r.threshold}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    
    html += `
        <div class="alert info" style="margin-top: 20px;">
            <div class="alert-icon"><i class="fas fa-info-circle"></i></div>
            <div class="alert-content">
                <div class="alert-title">Important Notes</div>
                <div class="alert-text">
                    • Rates are WITHOUT surcharge & cess (add 4% cess for final rate)<br>
                    • "No PAN" rate is minimum 20% or applicable rate, whichever is higher<br>
                    • Thresholds are annual unless specified otherwise
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    
    const absAmount = Math.abs(amount);
    let formatted;
    
    if (absAmount >= 10000000) {
        formatted = (absAmount / 10000000).toFixed(2) + ' Cr';
    } else if (absAmount >= 100000) {
        formatted = (absAmount / 100000).toFixed(2) + ' L';
    } else {
        formatted = absAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }
    
    return (amount < 0 ? '-₹' : '₹') + formatted;
}

function saveToStorage() {
    localStorage.setItem('ds-crypto-txns', JSON.stringify(recentCryptoTxns));
}

function loadFromStorage() {
    try {
        const txns = localStorage.getItem('ds-crypto-txns');
        if (txns) {
            recentCryptoTxns = JSON.parse(txns);
            updateRecentTxns();
        }
    } catch (e) {
        console.log('Error loading from storage:', e);
    }
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + number for quick navigation
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1': switchTool('crypto-calc'); break;
            case '2': switchTool('crypto-tds'); break;
            case '3': switchTool('tds-calc'); break;
            case '4': switchTool('tds-salary'); break;
        }
    }
});

console.log('🚀 DS Financial - Specialized Tools Loaded Successfully');
console.log('📊 Crypto/VDA Tax Calculator | TDS Calculator');
console.log('💼 FY 2025-26 | India-Specific Calculations');
