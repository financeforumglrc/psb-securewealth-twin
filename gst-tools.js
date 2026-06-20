/**
 * DS Financial GST Tools V2 - World Class Calculator Engine
 * 11 Advanced GST Calculators with High Accuracy
 * FY 2025-26 Compliant
 */

// ==================== CONSTANTS & CONFIGURATION ====================

const GST_CONFIG = {
    FY: '2025-26',
    EWAY_THRESHOLD: 50000,
    COMPOSITION_LIMIT_NORMAL: 15000000,
    COMPOSITION_LIMIT_SPECIAL: 7500000,
    COMPOSITION_LIMIT_SERVICE: 5000000
};

// Composition Rates
const COMPOSITION_RATES = {
    trader: 1,
    manufacturer: 1,
    restaurant: 5,
    service: 6
};

// RCM Rates
const RCM_RATES = {
    gta: 5,
    legal: 18,
    sponsor: 18,
    director: 18,
    rent: 18,
    advocate: 18,
    import: 18,
    security: 18
};

// Late Fee Structure
const LATE_FEE = {
    gstr1: { withTax: 50, nilReturn: 20, maxWithTax: 5000, maxNil: 500 },
    gstr3b: { withTax: 50, nilReturn: 20, maxWithTax: 5000, maxNil: 500 },
    gstr4: { withTax: 50, nilReturn: 20, maxWithTax: 2000, maxNil: 500 },
    gstr9: { withTax: 200, nilReturn: 200, maxWithTax: 10000, maxNil: 10000 }
};

// HSN/SAC Database (Sample - expand as needed)
const HSN_DATABASE = [
    { code: '0101', description: 'Live horses, asses, mules', rate: 0, type: 'goods' },
    { code: '0201', description: 'Meat of bovine animals, fresh', rate: 0, type: 'goods' },
    { code: '0401', description: 'Milk and cream', rate: 0, type: 'goods' },
    { code: '0901', description: 'Coffee, tea, mate and spices', rate: 5, type: 'goods' },
    { code: '1001', description: 'Wheat and meslin', rate: 0, type: 'goods' },
    { code: '1006', description: 'Rice', rate: 5, type: 'goods' },
    { code: '1701', description: 'Sugar', rate: 5, type: 'goods' },
    { code: '2201', description: 'Waters, mineral and aerated', rate: 18, type: 'goods' },
    { code: '2202', description: 'Aerated drinks, energy drinks', rate: 28, type: 'goods' },
    { code: '3004', description: 'Medicaments for therapeutic use', rate: 12, type: 'goods' },
    { code: '3401', description: 'Soap, organic surfactants', rate: 18, type: 'goods' },
    { code: '3926', description: 'Plastic articles', rate: 18, type: 'goods' },
    { code: '6401', description: 'Footwear above ₹1000', rate: 18, type: 'goods' },
    { code: '6402', description: 'Footwear below ₹1000', rate: 5, type: 'goods' },
    { code: '7113', description: 'Gold jewellery', rate: 3, type: 'goods' },
    { code: '8471', description: 'Computers and accessories', rate: 18, type: 'goods' },
    { code: '8517', description: 'Mobile phones', rate: 12, type: 'goods' },
    { code: '8703', description: 'Motor cars, petrol above 1500cc', rate: 28, type: 'goods' },
    { code: '8528', description: 'Television sets', rate: 28, type: 'goods' },
    { code: '9401', description: 'Seats and furniture', rate: 18, type: 'goods' },
    { code: '9403', description: 'Office furniture', rate: 18, type: 'goods' },
    // Services (SAC)
    { code: '9954', description: 'Construction services', rate: 18, type: 'services' },
    { code: '9961', description: 'Transport of goods by road', rate: 5, type: 'services' },
    { code: '9963', description: 'Accommodation services (Hotels)', rate: 18, type: 'services' },
    { code: '9964', description: 'Passenger transport services', rate: 5, type: 'services' },
    { code: '9971', description: 'Financial services', rate: 18, type: 'services' },
    { code: '9972', description: 'Real estate services', rate: 18, type: 'services' },
    { code: '9973', description: 'Leasing services', rate: 18, type: 'services' },
    { code: '9982', description: 'Legal services', rate: 18, type: 'services' },
    { code: '9983', description: 'Professional services', rate: 18, type: 'services' },
    { code: '9984', description: 'Telecom services', rate: 18, type: 'services' },
    { code: '9985', description: 'Support services', rate: 18, type: 'services' },
    { code: '9987', description: 'Maintenance and repair', rate: 18, type: 'services' },
    { code: '9988', description: 'Manufacturing services', rate: 18, type: 'services' },
    { code: '9991', description: 'Education services', rate: 0, type: 'services' },
    { code: '9992', description: 'Healthcare services', rate: 0, type: 'services' },
    { code: '9995', description: 'Recreation services', rate: 18, type: 'services' },
    { code: '9996', description: 'Personal services', rate: 18, type: 'services' },
    { code: '9997', description: 'Government services', rate: 18, type: 'services' },
    { code: '9998', description: 'Domestic services', rate: 0, type: 'services' },
    { code: '9999', description: 'Other services', rate: 18, type: 'services' },
    { code: '996311', description: 'Restaurant services (without AC)', rate: 5, type: 'services' },
    { code: '996331', description: 'Restaurant services (with AC/liquor)', rate: 18, type: 'services' },
];

// GST Rate Chart Data
const GST_RATE_CHART = {
    goods: [
        { category: '0% - Exempt', items: ['Fresh fruits & vegetables', 'Milk', 'Bread', 'Salt', 'Books', 'Newspapers', 'Handloom', 'Khadi'] },
        { category: '5% - Essential', items: ['Sugar', 'Tea', 'Coffee', 'Spices', 'Coal', 'Footwear below ₹1000', 'Apparel below ₹1000', 'Skimmed milk powder'] },
        { category: '12% - Standard', items: ['Mobiles', 'Processed food', 'Butter', 'Cheese', 'Ghee', 'Sewing machines', 'Cellphones', 'Umbrella'] },
        { category: '18% - Most Goods', items: ['Computers', 'Printers', 'Cameras', 'Speakers', 'Steel products', 'Cement', 'Paints', 'Ice cream'] },
        { category: '28% - Luxury/Sin', items: ['Cars', 'Motorcycles', 'AC', 'Refrigerator', 'Washing machine', 'Tobacco', 'Aerated drinks', 'Pan masala'] }
    ],
    services: [
        { category: '0% - Exempt', items: ['Education', 'Healthcare', 'Agriculture', 'Public transport', 'Religious services'] },
        { category: '5% - Essential', items: ['Transport of goods by road', 'Passenger transport (AC bus)', 'Cab aggregator', 'Newspaper ads'] },
        { category: '12% - Standard', items: ['Air travel (economy)', 'Hotel room ₹1000-7500', 'Construction (affordable)', 'Movie tickets below ₹100'] },
        { category: '18% - Most Services', items: ['IT services', 'Telecom', 'Banking', 'Insurance', 'Restaurant with AC', 'Hotel above ₹7500', 'Professional services'] },
        { category: '28% - Luxury', items: ['5-star hotel services', 'Race club services', 'Casino', 'Betting'] }
    ],
    exempt: [
        { category: 'Essential Services', items: ['Public healthcare', 'Government education', 'Religious pilgrimage', 'Charitable activities'] },
        { category: 'Agriculture', items: ['Agricultural services', 'Renting of agro machinery', 'Loading/unloading farm produce'] },
        { category: 'Financial', items: ['Services by RBI', 'Services to RBI', 'Govt securities trading'] }
    ]
};

// ==================== UTILITY FUNCTIONS ====================

const formatCurrency = (amount, decimals = 0) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);
};

const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);

const parseAmount = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.max(0, num);
};

const getElement = (id) => document.getElementById(id);
const setText = (id, text) => {
    const el = getElement(id);
    if (el) el.textContent = text;
};

// ==================== TOOL 1: GST CALCULATOR ====================

let gstMode = 'exclusive';
let gstRate = 18;

function setGSTMode(mode) {
    gstMode = mode;
    document.querySelectorAll('#panel-gst-calc .tabs:first-of-type .tab').forEach((tab, i) => {
        tab.classList.toggle('active', (mode === 'exclusive' && i === 0) || (mode === 'inclusive' && i === 1));
    });
    calculateGST();
}

function setGSTRate(rate) {
    gstRate = rate;
    const tabs = document.querySelectorAll('#panel-gst-calc .calc-card:first-child .tabs:last-of-type .tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.textContent.includes(`${rate}%`));
    });
    calculateGST();
}

function calculateGST() {
    const amount = parseAmount(getElement('gstAmount')?.value || 0);
    const transType = getElement('gstTransType')?.value || 'intra';

    let baseAmount, gstAmount, totalAmount;

    if (gstMode === 'exclusive') {
        baseAmount = amount;
        gstAmount = amount * (gstRate / 100);
        totalAmount = amount + gstAmount;
    } else {
        totalAmount = amount;
        baseAmount = amount / (1 + gstRate / 100);
        gstAmount = totalAmount - baseAmount;
    }

    const halfGst = gstAmount / 2;
    const isIntra = transType === 'intra';

    setText('gstBase', formatCurrency(Math.round(baseAmount)));
    setText('gstTax', formatCurrency(Math.round(gstAmount)));
    setText('gstTotal', formatCurrency(Math.round(totalAmount)));

    const cgstRow = getElement('cgstRow');
    const sgstRow = getElement('sgstRow');

    if (isIntra) {
        setText('cgstAmount', formatCurrency(Math.round(halfGst)));
        setText('sgstAmount', formatCurrency(Math.round(halfGst)));
        
        const cgstLabel = cgstRow?.querySelector('.result-item-label');
        const sgstLabel = sgstRow?.querySelector('.result-item-label');
        if (cgstLabel) cgstLabel.textContent = `CGST (${gstRate/2}%)`;
        if (sgstLabel) sgstLabel.textContent = `SGST (${gstRate/2}%)`;
        
        if (sgstRow) sgstRow.style.display = 'block';
    } else {
        const cgstLabel = cgstRow?.querySelector('.result-item-label');
        if (cgstLabel) cgstLabel.textContent = `IGST (${gstRate}%)`;
        setText('cgstAmount', formatCurrency(Math.round(gstAmount)));
        if (sgstRow) sgstRow.style.display = 'none';
    }

    // Update stats
    setText('statGSTCalculated', formatCurrency(Math.round(gstAmount)));
}

// ==================== TOOL 2: HSN/SAC FINDER ====================

let hsnCategory = 'all';

function setHSNCategory(category) {
    hsnCategory = category;
    document.querySelectorAll('#panel-hsn-finder .tabs .tab').forEach((tab, i) => {
        tab.classList.toggle('active', 
            (category === 'all' && i === 0) || 
            (category === 'goods' && i === 1) || 
            (category === 'services' && i === 2)
        );
    });
    searchHSN();
}

function searchHSN() {
    const query = getElement('hsnSearchInput')?.value?.toLowerCase() || '';
    const resultsDiv = getElement('hsnResults');
    
    if (!resultsDiv) return;
    
    let filtered = HSN_DATABASE.filter(item => {
        const matchesQuery = item.code.toLowerCase().includes(query) || 
                            item.description.toLowerCase().includes(query);
        const matchesCategory = hsnCategory === 'all' || item.type === hsnCategory;
        return matchesQuery && matchesCategory;
    });

    if (query.length < 2 && hsnCategory === 'all') {
        filtered = filtered.slice(0, 10);
    }

    resultsDiv.innerHTML = filtered.map(item => `
        <div class="search-result-item">
            <div>
                <div class="hsn-code">${item.code}</div>
                <div class="hsn-description">${item.description}</div>
            </div>
            <div class="hsn-rate">${item.rate}%</div>
        </div>
    `).join('') || '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No results found. Try a different search term.</p>';
}

// ==================== TOOL 3: ITC CALCULATOR ====================

function calculateITC() {
    const cgst = parseAmount(getElement('itcCGST')?.value || 0);
    const sgst = parseAmount(getElement('itcSGST')?.value || 0);
    const igst = parseAmount(getElement('itcIGST')?.value || 0);
    const cess = parseAmount(getElement('itcCess')?.value || 0);
    
    const blocked = parseAmount(getElement('itcBlockedInput')?.value || 0);
    const rule42 = parseAmount(getElement('itcRule42')?.value || 0);
    const rule43 = parseAmount(getElement('itcRule43')?.value || 0);
    const other = parseAmount(getElement('itcOther')?.value || 0);

    const totalITC = cgst + sgst + igst + cess;
    const totalBlocked = blocked;
    const totalReversed = rule42 + rule43 + other;
    const netITC = Math.max(0, totalITC - totalBlocked - totalReversed);

    setText('itcTotal', formatCurrency(totalITC));
    setText('itcBlocked', formatCurrency(totalBlocked));
    setText('itcReversed', formatCurrency(totalReversed));
    setText('itcNet', formatCurrency(netITC));

    // Update stats
    setText('statITCAvailable', formatCurrency(netITC));

    // Show alert if significant reversal
    const alert = getElement('itcAlert');
    if (alert && (totalBlocked + totalReversed) > totalITC * 0.1) {
        alert.style.display = 'flex';
        setText('itcAlertText', `High ITC reversal detected: ${formatCurrency(totalBlocked + totalReversed)}. Verify Rule 42/43 calculations.`);
    } else if (alert) {
        alert.style.display = 'none';
    }
}

// ==================== TOOL 4: RCM CALCULATOR ====================

function updateRCMRate() {
    calculateRCM();
}

function calculateRCM() {
    const category = getElement('rcmCategory')?.value || 'gta';
    const amount = parseAmount(getElement('rcmAmount')?.value || 0);
    const transType = getElement('rcmTransType')?.value || 'intra';
    
    const rate = RCM_RATES[category];
    const gstAmount = amount * (rate / 100);
    const halfGst = gstAmount / 2;
    const isIntra = transType === 'intra';

    setText('rcmTotal', formatCurrency(Math.round(gstAmount)));
    
    if (isIntra) {
        setText('rcmLabel1', `CGST (${rate/2}%)`);
        setText('rcmLabel2', `SGST (${rate/2}%)`);
        setText('rcmCGST', formatCurrency(Math.round(halfGst)));
        setText('rcmSGST', formatCurrency(Math.round(halfGst)));
        getElement('rcmLabel2')?.parentElement && (getElement('rcmLabel2').parentElement.style.display = 'block');
    } else {
        setText('rcmLabel1', `IGST (${rate}%)`);
        setText('rcmCGST', formatCurrency(Math.round(gstAmount)));
        getElement('rcmLabel2')?.parentElement && (getElement('rcmLabel2').parentElement.style.display = 'none');
    }
}

// ==================== TOOL 5: GST REFUND CALCULATOR ====================

let refundType = 'export';

function setRefundType(type) {
    refundType = type;
    document.querySelectorAll('#panel-refund-calc .tabs .tab').forEach((tab, i) => {
        tab.classList.toggle('active', 
            (type === 'export' && i === 0) || 
            (type === 'inverted' && i === 1) || 
            (type === 'accumulate' && i === 2)
        );
    });
    
    getElement('refundExportForm').style.display = type === 'export' ? 'block' : 'none';
    getElement('refundInvertedForm').style.display = type === 'inverted' ? 'block' : 'none';
    getElement('refundAccumulateForm').style.display = type === 'accumulate' ? 'block' : 'none';
    
    if (type === 'export') calculateRefund();
    else if (type === 'inverted') calculateInvertedRefund();
}

function calculateRefund() {
    const exportTurnover = parseAmount(getElement('refundExportTurnover')?.value || 0);
    const totalTurnover = parseAmount(getElement('refundTotalTurnover')?.value || 0);
    const itc = parseAmount(getElement('refundITC')?.value || 0);
    const itcCapital = parseAmount(getElement('refundITCCapital')?.value || 0);

    // Formula: Refund = (Export Turnover / Total Turnover) × Net ITC
    const totalITC = itc + itcCapital;
    let refund = 0;
    
    if (totalTurnover > 0) {
        refund = (exportTurnover / totalTurnover) * totalITC;
    }

    setText('refundAmount', formatCurrency(Math.round(refund)));
    setText('refundFormula', '(Export / Total) × ITC');
    setText('refundForm', 'RFD-01');
    setText('statRefund', formatCurrency(Math.round(refund)));
}

function calculateInvertedRefund() {
    const turnover = parseAmount(getElement('refundInvertedTurnover')?.value || 0);
    const itc = parseAmount(getElement('refundInvertedITC')?.value || 0);
    const tax = parseAmount(getElement('refundInvertedTax')?.value || 0);

    // Formula: Max Refund = (Turnover × Net ITC / Adjusted Total Turnover) - Tax Paid
    let refund = 0;
    if (turnover > 0) {
        refund = Math.max(0, itc - (turnover * (tax / turnover)));
    }

    setText('refundAmount', formatCurrency(Math.round(refund)));
    setText('refundFormula', 'ITC - (Tax × Turnover Ratio)');
    setText('refundForm', 'RFD-01');
}

// ==================== TOOL 6: INTEREST & LATE FEE ====================

function calculateInterest() {
    const amount = parseAmount(getElement('interestAmount')?.value || 0);
    const dueDate = getElement('interestDueDate')?.value;
    const payDate = getElement('interestPayDate')?.value;
    const rate = parseFloat(getElement('interestType')?.value || 18);

    if (!dueDate || !payDate) return;

    const due = new Date(dueDate);
    const pay = new Date(payDate);
    const days = Math.max(0, Math.ceil((pay - due) / (1000 * 60 * 60 * 24)));

    const dailyRate = rate / 365 / 100;
    const dailyInterest = amount * dailyRate;
    const totalInterest = dailyInterest * days;

    setText('interestPayable', formatCurrency(Math.round(totalInterest)));
    setText('interestDays', days);
    setText('interestDaily', formatCurrency(dailyInterest, 2));
}

function calculateLateFee() {
    const returnType = getElement('lateFeeReturn')?.value || 'gstr3b';
    const hasTax = getElement('lateFeeHasTax')?.value === 'yes';
    const days = parseAmount(getElement('lateFeeDays')?.value || 0);

    const feeConfig = LATE_FEE[returnType];
    const dailyFee = hasTax ? feeConfig.withTax : feeConfig.nilReturn;
    const maxFee = hasTax ? feeConfig.maxWithTax : feeConfig.maxNil;

    const totalFee = Math.min(dailyFee * days, maxFee);
    const halfFee = totalFee / 2;

    setText('lateFeeTotal', formatCurrency(totalFee));
    setText('lateFeeCGST', formatCurrency(halfFee));
    setText('lateFeeSGST', formatCurrency(halfFee));
    setText('lateFeeCaps', `${returnType.toUpperCase()}: ₹${dailyFee}/day, Max ₹${formatNumber(maxFee)}`);
}

// ==================== TOOL 7: E-WAY BILL VALIDITY ====================

function calculateEwayValidity() {
    const mode = getElement('ewayMode')?.value || 'road';
    const type = getElement('ewayType')?.value || 'normal';
    const distance = parseAmount(getElement('ewayDistance')?.value || 0);
    const genDate = getElement('ewayGenDate')?.value;

    const kmPerDay = type === 'odc' ? 20 : 200;
    const validityDays = Math.max(1, Math.ceil(distance / kmPerDay));

    setText('ewayValidity', `${validityDays} Day${validityDays > 1 ? 's' : ''} Valid`);

    if (genDate) {
        const startDate = new Date(genDate);
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + validityDays);
        expiryDate.setHours(23, 59, 59);
        
        setText('ewayExpiryDate', `Valid until: ${expiryDate.toLocaleString('en-IN', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
        })}`);
    } else {
        setText('ewayExpiryDate', 'Enter generation date to calculate expiry');
    }
}

function checkEwayRequired() {
    const value = parseAmount(getElement('ewayValue')?.value || 0);
    const alert = getElement('ewayAlert');
    
    if (!alert) return;
    
    if (value > 0 && value < GST_CONFIG.EWAY_THRESHOLD) {
        alert.style.display = 'flex';
        alert.className = 'alert info';
        setText('ewayAlertTitle', 'E-Way Bill Not Required');
        setText('ewayAlertText', `Invoice value ₹${formatNumber(value)} is below ₹50,000 threshold. E-Way Bill not mandatory for inter-state movement.`);
    } else if (value >= GST_CONFIG.EWAY_THRESHOLD) {
        alert.style.display = 'flex';
        alert.className = 'alert warning';
        setText('ewayAlertTitle', 'E-Way Bill Required');
        setText('ewayAlertText', `Invoice value ₹${formatNumber(value)} exceeds ₹50,000 threshold. E-Way Bill is mandatory.`);
    } else {
        alert.style.display = 'none';
    }
}

// ==================== TOOL 8: COMPOSITION SCHEME ====================

function calculateComposition() {
    const businessType = getElement('compBusinessType')?.value || 'trader';
    const turnover = parseAmount(getElement('compTurnover')?.value || 0);
    const stateType = getElement('compState')?.value || 'normal';
    const purchase = parseAmount(getElement('compPurchase')?.value || 0);

    const compRate = COMPOSITION_RATES[businessType];
    const limit = stateType === 'special' ? GST_CONFIG.COMPOSITION_LIMIT_SPECIAL : GST_CONFIG.COMPOSITION_LIMIT_NORMAL;
    
    if (businessType === 'service') {
        // Service providers have lower limit
    }

    // Composition tax
    const compTax = turnover * (compRate / 100);
    
    // Regular scheme estimate (18% output - 18% input)
    const outputTax = turnover * 0.18;
    const inputTax = purchase * 0.18;
    const regularTax = Math.max(0, outputTax - inputTax);

    setText('compRate', `${compRate}%`);
    setText('compTax', formatCurrency(Math.round(compTax)));
    setText('regularTax', formatCurrency(Math.round(regularTax)));

    // Update recommendation
    const alert = getElement('compAlert');
    const isEligible = turnover <= limit;
    const isBetter = compTax < regularTax;

    const compCard = getElement('compSchemeCard');
    const regCard = getElement('regularSchemeCard');
    
    if (compCard && regCard) {
        compCard.classList.toggle('recommended', isEligible && isBetter);
        regCard.classList.toggle('recommended', !isEligible || !isBetter);
    }

    if (alert) {
        if (!isEligible) {
            alert.className = 'alert error';
            setText('compAlertTitle', 'Not Eligible');
            setText('compAlertText', `Turnover of ${formatCurrency(turnover)} exceeds composition limit of ${formatCurrency(limit)}. You must register under regular scheme.`);
        } else if (isBetter) {
            alert.className = 'alert success';
            setText('compAlertTitle', 'Composition Recommended');
            setText('compAlertText', `You can save ${formatCurrency(regularTax - compTax)} annually by opting for Composition Scheme.`);
        } else {
            alert.className = 'alert info';
            setText('compAlertTitle', 'Regular Scheme Better');
            setText('compAlertText', `Regular scheme is more beneficial due to ITC availability. Savings: ${formatCurrency(compTax - regularTax)}`);
        }
    }

    // Update net liability stat
    setText('statNetLiability', formatCurrency(Math.min(compTax, regularTax)));
}

// ==================== TOOL 9: 2A VS 3B RECONCILIATION ====================

function calculateReconciliation() {
    const itc2B = parseAmount(getElement('recon2BITC')?.value || 0);
    const cgst2B = parseAmount(getElement('recon2BCGST')?.value || 0);
    const sgst2B = parseAmount(getElement('recon2BSGST')?.value || 0);
    const igst2B = parseAmount(getElement('recon2BIGST')?.value || 0);

    const itc3B = parseAmount(getElement('recon3BITC')?.value || 0);
    const cgst3B = parseAmount(getElement('recon3BCGST')?.value || 0);
    const sgst3B = parseAmount(getElement('recon3BSGST')?.value || 0);
    const igst3B = parseAmount(getElement('recon3BIGST')?.value || 0);

    const total2B = itc2B || (cgst2B + sgst2B + igst2B);
    const total3B = itc3B || (cgst3B + sgst3B + igst3B);
    const diff = total3B - total2B;

    setText('reconTotal2B', formatCurrency(total2B));
    setText('reconTotal3B', formatCurrency(total3B));
    setText('reconDiffValue', formatCurrency(Math.abs(diff)));

    const diffDiv = getElement('reconDiff');
    if (diffDiv) {
        if (Math.abs(diff) < 1) {
            diffDiv.className = 'recon-diff match';
            setText('reconDiffText', '✓ ITC claimed matches with GSTR-2B. No action required.');
        } else if (diff > 0) {
            diffDiv.className = 'recon-diff mismatch';
            setText('reconDiffText', `⚠ Excess ITC claimed: ${formatCurrency(diff)}. Reversal may be required.`);
        } else {
            diffDiv.className = 'recon-diff mismatch';
            setText('reconDiffText', `⚠ ITC under-claimed: ${formatCurrency(Math.abs(diff))}. Additional ITC available.`);
        }
    }
}

function downloadReconReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('GSTR-2B vs GSTR-3B Reconciliation Report', 20, 22);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    const period = getElement('reconPeriod')?.value || '-';
    doc.text(`Period: ${period}`, 20, 50);
    
    doc.text(`GSTR-2B ITC: ${getElement('reconTotal2B')?.textContent || '₹0'}`, 20, 65);
    doc.text(`GSTR-3B ITC: ${getElement('reconTotal3B')?.textContent || '₹0'}`, 20, 75);
    doc.text(`Difference: ${getElement('reconDiffValue')?.textContent || '₹0'}`, 20, 85);
    
    doc.save('gst-reconciliation-report.pdf');
}

// ==================== TOOL 10: GST RATE CHART ====================

let currentRateCategory = 'goods';

function showRateCategory(category) {
    currentRateCategory = category;
    document.querySelectorAll('#panel-gst-rates .tabs .tab').forEach((tab, i) => {
        tab.classList.toggle('active', 
            (category === 'goods' && i === 0) || 
            (category === 'services' && i === 1) || 
            (category === 'exempt' && i === 2)
        );
    });
    renderRateChart();
}

function renderRateChart() {
    const content = getElement('rateChartContent');
    if (!content) return;
    
    const data = GST_RATE_CHART[currentRateCategory];
    
    content.innerHTML = data.map(group => `
        <div class="rcm-category">
            <div class="rcm-category-header">
                <h4>${group.category}</h4>
            </div>
            <div class="rcm-category-body">
                <table class="data-table">
                    <tbody>
                        ${group.items.map(item => `
                            <tr><td>${item}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('');
}

// ==================== TOOL 11: DUE DATES ====================

const DUE_DATES = {
    regular: [
        { day: 11, return: 'GSTR-1', description: 'Outward supplies for previous month' },
        { day: 13, return: 'GSTR-1 (IFF)', description: 'Invoice Furnishing Facility (QRMP)' },
        { day: 20, return: 'GSTR-3B', description: 'Monthly return and tax payment' },
        { day: 25, return: 'PMT-06', description: 'Challan payment for QRMP' }
    ],
    qrmp: [
        { day: 13, return: 'IFF', description: 'Optional invoice upload for B2B' },
        { day: 22, return: 'GSTR-3B', description: 'Quarterly return (Cat. A states)' },
        { day: 24, return: 'GSTR-3B', description: 'Quarterly return (Cat. B states)' },
        { day: 25, return: 'PMT-06', description: 'Monthly tax payment' }
    ],
    composition: [
        { day: 18, return: 'CMP-08', description: 'Quarterly statement' },
        { day: 30, return: 'GSTR-4', description: 'Annual return (April)' }
    ]
};

function showDueDates() {
    const month = getElement('dueDateMonth')?.value || '1';
    const category = getElement('dueDateCategory')?.value || 'regular';
    const timeline = getElement('dueDatesTimeline');
    
    if (!timeline) return;
    
    const dates = DUE_DATES[category];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const year = parseInt(month) <= 3 ? 2026 : 2025;
    const monthName = monthNames[parseInt(month) - 1];
    
    timeline.innerHTML = dates.map(item => {
        const dueDate = new Date(year, parseInt(month) - 1, item.day);
        const isPast = dueDate < new Date();
        
        return `
            <div class="timeline-item ${isPast ? 'pending' : ''}">
                <div class="timeline-date">${item.day} ${monthName} ${year}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${item.return}</div>
                    <div class="timeline-description">${item.description}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== NAVIGATION ====================

function initNavigation() {
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            switchTool(this.dataset.tool);
            document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            switchTool(this.dataset.tool);
            document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.sidebar-nav-link').forEach(l => {
                l.classList.toggle('active', l.dataset.tool === this.dataset.tool);
            });
        });
    });
}

function switchTool(toolId) {
    document.querySelectorAll('.tool-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = getElement(`panel-${toolId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

// ==================== THEME TOGGLE ====================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initNavigation();
    
    // Initialize all calculators
    calculateGST();
    searchHSN();
    calculateITC();
    calculateRCM();
    calculateRefund();
    calculateComposition();
    calculateReconciliation();
    renderRateChart();
    showDueDates();
    
    // Set default dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (getElement('interestDueDate')) getElement('interestDueDate').value = todayStr;
    if (getElement('interestPayDate')) getElement('interestPayDate').value = todayStr;
    if (getElement('ewayGenDate')) {
        getElement('ewayGenDate').value = today.toISOString().slice(0, 16);
    }
});
