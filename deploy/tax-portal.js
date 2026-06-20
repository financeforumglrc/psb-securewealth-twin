/**
 * DS Financial Tax Portal V2 - World Class Calculator Engine
 * Advanced features with high accuracy calculations
 * 
 * PHASE 1: Core calculation engine with accurate tax slabs
 * PHASE 2: Advanced features - Break-even, Charts, PDF
 * PHASE 3: Optimization recommendations
 */

// ==================== SECURITY UTILITIES ====================
function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==================== CONSTANTS & CONFIGURATION ====================

const CONFIG = {
    FY: '2025-26',
    STANDARD_DEDUCTION_OLD: 50000,
    STANDARD_DEDUCTION_NEW: 75000,
    CESS_RATE: 0.04,
    SECTION_80C_LIMIT: 150000,
    SECTION_80D_LIMIT_SELF: 25000,
    SECTION_80D_LIMIT_PARENTS: 50000,
    SECTION_80D_LIMIT_SENIOR_PARENTS: 50000,
    SECTION_80CCD_1B_LIMIT: 50000,
    SECTION_24B_LIMIT: 200000,
    NEW_REGIME_REBATE_LIMIT: 1200000,
    NEW_REGIME_REBATE_AMOUNT: 60000,
    OLD_REGIME_REBATE_LIMIT: 500000,
    OLD_REGIME_REBATE_AMOUNT: 12500
};

// Tax Slabs FY 2025-26 (New Regime)
const NEW_REGIME_SLABS = [
    { min: 0, max: 300000, rate: 0, label: '₹0 - ₹3,00,000' },
    { min: 300000, max: 700000, rate: 5, label: '₹3,00,001 - ₹7,00,000' },
    { min: 700000, max: 1000000, rate: 10, label: '₹7,00,001 - ₹10,00,000' },
    { min: 1000000, max: 1200000, rate: 15, label: '₹10,00,001 - ₹12,00,000' },
    { min: 1200000, max: 1500000, rate: 20, label: '₹12,00,001 - ₹15,00,000' },
    { min: 1500000, max: Infinity, rate: 30, label: 'Above ₹15,00,000' }
];

// Tax Slabs FY 2025-26 (Old Regime - General)
const OLD_REGIME_SLABS_GENERAL = [
    { min: 0, max: 250000, rate: 0, label: '₹0 - ₹2,50,000' },
    { min: 250000, max: 500000, rate: 5, label: '₹2,50,001 - ₹5,00,000' },
    { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 - ₹10,00,000' },
    { min: 1000000, max: Infinity, rate: 30, label: 'Above ₹10,00,000' }
];

// Tax Slabs (Old Regime - Senior Citizen 60-80)
const OLD_REGIME_SLABS_SENIOR = [
    { min: 0, max: 300000, rate: 0, label: '₹0 - ₹3,00,000' },
    { min: 300000, max: 500000, rate: 5, label: '₹3,00,001 - ₹5,00,000' },
    { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 - ₹10,00,000' },
    { min: 1000000, max: Infinity, rate: 30, label: 'Above ₹10,00,000' }
];

// Tax Slabs (Old Regime - Super Senior 80+)
const OLD_REGIME_SLABS_SUPER_SENIOR = [
    { min: 0, max: 500000, rate: 0, label: '₹0 - ₹5,00,000' },
    { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 - ₹10,00,000' },
    { min: 1000000, max: Infinity, rate: 30, label: 'Above ₹10,00,000' }
];

// ==================== UTILITY FUNCTIONS ====================

const formatCurrency = (amount, decimals = 0) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

const parseAmount = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.max(0, num);
};

const getElement = (id) => document.getElementById(id);

const setText = (id, text) => {
    const el = getElement(id);
    if (el) el.textContent = text;
};

// ==================== CORE TAX CALCULATION ENGINE ====================

/**
 * Calculate tax based on income and slabs
 * Returns detailed slab-wise breakdown
 */
function calculateSlabwiseTax(taxableIncome, slabs) {
    const breakdown = [];
    let totalTax = 0;
    let remainingIncome = taxableIncome;

    for (const slab of slabs) {
        if (remainingIncome <= 0) {
            breakdown.push({
                slab: slab.label,
                income: 0,
                rate: slab.rate,
                tax: 0
            });
            continue;
        }

        const slabWidth = slab.max === Infinity ? remainingIncome : slab.max - slab.min;
        const incomeInSlab = Math.min(remainingIncome, slabWidth);
        const taxInSlab = incomeInSlab * (slab.rate / 100);

        breakdown.push({
            slab: slab.label,
            income: incomeInSlab,
            rate: slab.rate,
            tax: taxInSlab
        });

        totalTax += taxInSlab;
        remainingIncome -= incomeInSlab;
    }

    return { totalTax, breakdown };
}

/**
 * Calculate surcharge based on income
 */
function calculateSurcharge(taxableIncome, baseTax) {
    if (taxableIncome <= 5000000) return 0;
    if (taxableIncome <= 10000000) return baseTax * 0.10;
    if (taxableIncome <= 20000000) return baseTax * 0.15;
    if (taxableIncome <= 50000000) return baseTax * 0.25;
    return baseTax * 0.37;
}

/**
 * Apply marginal relief for surcharge
 */
function applyMarginalRelief(taxableIncome, taxWithSurcharge, threshold) {
    if (taxableIncome <= threshold) return taxWithSurcharge;
    
    const excessIncome = taxableIncome - threshold;
    const taxAtThreshold = calculateSlabwiseTax(threshold, NEW_REGIME_SLABS).totalTax;
    const maxTax = taxAtThreshold + excessIncome;
    
    return Math.min(taxWithSurcharge, maxTax);
}

/**
 * Get appropriate old regime slabs based on age
 */
function getOldRegimeSlabs(ageCategory) {
    switch (ageCategory) {
        case 'senior': return OLD_REGIME_SLABS_SENIOR;
        case 'super-senior': return OLD_REGIME_SLABS_SUPER_SENIOR;
        default: return OLD_REGIME_SLABS_GENERAL;
    }
}

// ==================== REGIME COMPARISON CALCULATOR ====================

function calculateRegimeComparison() {
    // Get inputs
    const grossSalary = parseAmount(getElement('grossSalary')?.value || 0);
    const otherIncome = parseAmount(getElement('otherIncome')?.value || 0);
    const rentalIncome = parseAmount(getElement('rentalIncome')?.value || 0);
    const ageCategory = getElement('ageCategory')?.value || 'general';

    // Calculate gross income
    const grossIncome = grossSalary + otherIncome + rentalIncome;

    // Get all deductions
    const ded80C_EPF = parseAmount(getElement('ded80C_EPF')?.value || 0);
    const ded80C_PPF = parseAmount(getElement('ded80C_PPF')?.value || 0);
    const ded80C_ELSS = parseAmount(getElement('ded80C_ELSS')?.value || 0);
    const ded80C_LIC = parseAmount(getElement('ded80C_LIC')?.value || 0);
    const ded80C_HomeLoan = parseAmount(getElement('ded80C_HomeLoan')?.value || 0);
    const ded80C_Tuition = parseAmount(getElement('ded80C_Tuition')?.value || 0);
    
    const total80C = Math.min(
        ded80C_EPF + ded80C_PPF + ded80C_ELSS + ded80C_LIC + ded80C_HomeLoan + ded80C_Tuition,
        CONFIG.SECTION_80C_LIMIT
    );

    const ded80D = Math.min(parseAmount(getElement('ded80D')?.value || 0), 75000);
    const dedHRA = parseAmount(getElement('dedHRA')?.value || 0);
    const ded24b = Math.min(parseAmount(getElement('ded24b')?.value || 0), CONFIG.SECTION_24B_LIMIT);
    const ded80CCD = Math.min(parseAmount(getElement('ded80CCD')?.value || 0), CONFIG.SECTION_80CCD_1B_LIMIT);
    const ded80E = parseAmount(getElement('ded80E')?.value || 0);

    const totalChapter6A = total80C + ded80D + ded80CCD + ded80E;
    const totalExemptions = dedHRA + ded24b;
    const totalDeductions = totalChapter6A + totalExemptions;

    // ==================== OLD REGIME CALCULATION ====================
    const oldStdDeduction = CONFIG.STANDARD_DEDUCTION_OLD;
    const oldTaxableIncome = Math.max(0, grossIncome - oldStdDeduction - totalDeductions);
    
    const oldSlabs = getOldRegimeSlabs(ageCategory);
    const oldResult = calculateSlabwiseTax(oldTaxableIncome, oldSlabs);
    let oldTaxBeforeCess = oldResult.totalTax;
    
    // Apply rebate u/s 87A for old regime
    if (oldTaxableIncome <= CONFIG.OLD_REGIME_REBATE_LIMIT) {
        oldTaxBeforeCess = Math.max(0, oldTaxBeforeCess - CONFIG.OLD_REGIME_REBATE_AMOUNT);
    }
    
    // Add surcharge if applicable
    const oldSurcharge = calculateSurcharge(oldTaxableIncome, oldTaxBeforeCess);
    oldTaxBeforeCess += oldSurcharge;
    
    const oldCess = oldTaxBeforeCess * CONFIG.CESS_RATE;
    const oldTotalTax = Math.round(oldTaxBeforeCess + oldCess);

    // ==================== NEW REGIME CALCULATION ====================
    const newStdDeduction = CONFIG.STANDARD_DEDUCTION_NEW;
    const newTaxableIncome = Math.max(0, grossIncome - newStdDeduction);
    
    const newResult = calculateSlabwiseTax(newTaxableIncome, NEW_REGIME_SLABS);
    let newTaxBeforeCess = newResult.totalTax;
    
    // Apply rebate u/s 87A for new regime (enhanced)
    let newRebate = 0;
    if (newTaxableIncome <= CONFIG.NEW_REGIME_REBATE_LIMIT) {
        newRebate = Math.min(newTaxBeforeCess, CONFIG.NEW_REGIME_REBATE_AMOUNT);
        newTaxBeforeCess = Math.max(0, newTaxBeforeCess - newRebate);
    }
    
    // Add surcharge if applicable
    const newSurcharge = calculateSurcharge(newTaxableIncome, newTaxBeforeCess);
    newTaxBeforeCess += newSurcharge;
    
    const newCess = newTaxBeforeCess * CONFIG.CESS_RATE;
    const newTotalTax = Math.round(newTaxBeforeCess + newCess);

    // ==================== UPDATE UI ====================
    
    // Old Regime
    setText('oldGross', formatCurrency(grossIncome));
    setText('oldChapter6', formatCurrency(totalDeductions + oldStdDeduction));
    setText('oldTaxable', formatCurrency(oldTaxableIncome));
    setText('oldTaxBeforeCess', formatCurrency(Math.round(oldResult.totalTax)));
    setText('oldCess', formatCurrency(Math.round(oldCess)));
    setText('oldRegimeTax', formatCurrency(oldTotalTax));

    // New Regime
    setText('newGross', formatCurrency(grossIncome));
    setText('newRebate', formatCurrency(newRebate));
    setText('newTaxable', formatCurrency(newTaxableIncome));
    setText('newTaxBeforeCess', formatCurrency(Math.round(newResult.totalTax)));
    setText('newCess', formatCurrency(Math.round(newCess)));
    setText('newRegimeTax', formatCurrency(newTotalTax));

    // Determine winner
    const savings = Math.abs(oldTotalTax - newTotalTax);
    const isNewBetter = newTotalTax < oldTotalTax;
    const isOldBetter = oldTotalTax < newTotalTax;
    
    const oldCard = getElement('oldRegimeCard');
    const newCard = getElement('newRegimeCard');
    
    if (oldCard && newCard) {
        oldCard.classList.toggle('winner', isOldBetter);
        newCard.classList.toggle('winner', isNewBetter);
        
        const oldBadge = oldCard.querySelector('.regime-badge');
        const newBadge = newCard.querySelector('.regime-badge');
        
        if (oldBadge) oldBadge.style.display = isOldBetter ? 'flex' : 'none';
        if (newBadge) newBadge.style.display = isNewBetter ? 'flex' : 'none';
    }

    // Savings banner
    setText('savingsAmount', formatCurrency(savings));
    setText('recommendedRegime', isNewBetter ? 'New Tax Regime' : isOldBetter ? 'Old Tax Regime' : 'Both are Equal');

    // Break-even analysis
    const breakEvenDeductions = calculateBreakEven(grossIncome);
    setText('breakEvenText', 
        `At your income of ${formatCurrency(grossIncome)}, you need deductions of ${formatCurrency(breakEvenDeductions)} or more for Old Regime to be beneficial. Your current deductions: ${formatCurrency(totalDeductions + oldStdDeduction)}.`
    );

    // Update stats dashboard
    setText('statIncome', formatCurrency(grossIncome));
    setText('statDeductions', formatCurrency(totalDeductions + oldStdDeduction));
    setText('statTax', formatCurrency(Math.min(oldTotalTax, newTotalTax)));
    setText('statSavings', formatCurrency(savings));

    // Update chart
    updateComparisonChart(oldTotalTax, newTotalTax);

    return {
        oldRegime: { taxable: oldTaxableIncome, tax: oldTotalTax },
        newRegime: { taxable: newTaxableIncome, tax: newTotalTax },
        savings,
        recommended: isNewBetter ? 'new' : 'old'
    };
}

/**
 * Calculate break-even deduction amount
 */
function calculateBreakEven(grossIncome) {
    // Binary search for break-even point
    let low = 0;
    let high = grossIncome;
    
    const newTaxableIncome = grossIncome - CONFIG.STANDARD_DEDUCTION_NEW;
    const newResult = calculateSlabwiseTax(newTaxableIncome, NEW_REGIME_SLABS);
    let newTax = newResult.totalTax;
    
    if (newTaxableIncome <= CONFIG.NEW_REGIME_REBATE_LIMIT) {
        newTax = Math.max(0, newTax - Math.min(newTax, CONFIG.NEW_REGIME_REBATE_AMOUNT));
    }
    newTax = newTax * (1 + CONFIG.CESS_RATE);
    
    while (high - low > 1000) {
        const mid = Math.floor((low + high) / 2);
        const oldTaxable = Math.max(0, grossIncome - CONFIG.STANDARD_DEDUCTION_OLD - mid);
        const oldResult = calculateSlabwiseTax(oldTaxable, OLD_REGIME_SLABS_GENERAL);
        let oldTax = oldResult.totalTax;
        
        if (oldTaxable <= CONFIG.OLD_REGIME_REBATE_LIMIT) {
            oldTax = Math.max(0, oldTax - CONFIG.OLD_REGIME_REBATE_AMOUNT);
        }
        oldTax = oldTax * (1 + CONFIG.CESS_RATE);
        
        if (oldTax < newTax) {
            high = mid;
        } else {
            low = mid;
        }
    }
    
    return Math.round(high);
}

// ==================== INCOME TAX CALCULATOR ====================

let currentIncomeTaxRegime = 'new';

function switchIncomeTaxRegime(regime) {
    currentIncomeTaxRegime = regime;
    document.querySelectorAll('#panel-income-tax .tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.regime === regime);
    });
    calculateIncomeTax();
}

function calculateIncomeTax() {
    const basic = parseAmount(getElement('itcBasic')?.value || 0);
    const hra = parseAmount(getElement('itcHRA')?.value || 0);
    const allowances = parseAmount(getElement('itcAllowances')?.value || 0);
    const rental = parseAmount(getElement('itcRental')?.value || 0);
    const homeLoanInt = parseAmount(getElement('itcHomeLoanInt')?.value || 0);
    const interest = parseAmount(getElement('itcInterest')?.value || 0);
    const capital = parseAmount(getElement('itcCapital')?.value || 0);
    const other = parseAmount(getElement('itcOther')?.value || 0);

    const salaryIncome = basic + hra + allowances;
    const houseProperty = rental - Math.min(homeLoanInt, CONFIG.SECTION_24B_LIMIT);
    const grossIncome = salaryIncome + Math.max(0, houseProperty) + interest + capital + other;

    const isNewRegime = currentIncomeTaxRegime === 'new';
    const stdDeduction = isNewRegime ? CONFIG.STANDARD_DEDUCTION_NEW : CONFIG.STANDARD_DEDUCTION_OLD;
    const taxableIncome = Math.max(0, grossIncome - stdDeduction);

    const slabs = isNewRegime ? NEW_REGIME_SLABS : OLD_REGIME_SLABS_GENERAL;
    const result = calculateSlabwiseTax(taxableIncome, slabs);
    
    let taxBeforeCess = result.totalTax;
    
    // Apply rebate
    if (isNewRegime && taxableIncome <= CONFIG.NEW_REGIME_REBATE_LIMIT) {
        taxBeforeCess = Math.max(0, taxBeforeCess - Math.min(taxBeforeCess, CONFIG.NEW_REGIME_REBATE_AMOUNT));
    } else if (!isNewRegime && taxableIncome <= CONFIG.OLD_REGIME_REBATE_LIMIT) {
        taxBeforeCess = Math.max(0, taxBeforeCess - CONFIG.OLD_REGIME_REBATE_AMOUNT);
    }
    
    const cess = taxBeforeCess * CONFIG.CESS_RATE;
    const totalTax = Math.round(taxBeforeCess + cess);

    // Update UI
    setText('itcGrossIncome', formatCurrency(grossIncome));
    setText('itcStdDed', formatCurrency(stdDeduction));
    setText('itcNetTaxable', formatCurrency(taxableIncome));
    setText('itcCess', formatCurrency(Math.round(cess)));
    setText('itcTotalTax', formatCurrency(totalTax));

    // Update slab breakdown table
    const slabBody = getElement('itcSlabBody');
    if (slabBody) {
        slabBody.innerHTML = result.breakdown
            .filter(item => item.income > 0 || item.rate === 0)
            .map(item => `
                <tr>
                    <td>${escapeHtml(item.slab)}</td>
                    <td class="amount">${formatCurrency(item.income)}</td>
                    <td class="rate">${item.rate}%</td>
                    <td class="amount">${formatCurrency(Math.round(item.tax))}</td>
                </tr>
            `).join('');
    }
}

// ==================== HRA CALCULATOR ====================

function calculateHRA() {
    const basic = parseAmount(getElement('hraBasic')?.value || 0);
    const da = parseAmount(getElement('hraDA')?.value || 0);
    const hraReceived = parseAmount(getElement('hraReceived')?.value || 0);
    const rentPaid = parseAmount(getElement('hraRent')?.value || 0);
    const cityType = getElement('hraCityType')?.value || 'metro';

    const salary = basic + da;
    const percentOfSalary = cityType === 'metro' ? 0.5 : 0.4;

    // Three conditions for HRA exemption
    const condition1 = hraReceived;
    const condition2 = salary * percentOfSalary;
    const condition3 = Math.max(0, rentPaid - (salary * 0.1));

    const hraExemption = Math.min(condition1, condition2, condition3);
    const taxableHRA = hraReceived - hraExemption;
    
    // Tax savings calculation (assuming 30% bracket)
    const taxSaved = hraExemption * 0.312; // 30% + 4% cess

    // Update UI
    setText('hraExemptionAmount', formatCurrency(Math.round(hraExemption)));
    setText('hraActual', formatCurrency(hraReceived));
    setText('hraPercent', formatCurrency(Math.round(condition2)));
    setText('hraRentCalc', formatCurrency(Math.round(condition3)));
    setText('hraTaxable', formatCurrency(Math.round(taxableHRA)));
    setText('hraTaxSavings', 
        `You can save up to ${formatCurrency(Math.round(taxSaved))} in taxes (assuming 30% + 4% cess bracket) with this HRA exemption.`
    );
}

// ==================== 80C PLANNER ====================

let planner80CChart = null;

function calculate80CPlanner() {
    const epf = parseAmount(getElement('planner80C_EPF')?.value || 0);
    const ppf = parseAmount(getElement('planner80C_PPF')?.value || 0);
    const elss = parseAmount(getElement('planner80C_ELSS')?.value || 0);
    const lic = parseAmount(getElement('planner80C_LIC')?.value || 0);
    const nsc = parseAmount(getElement('planner80C_NSC')?.value || 0);
    const tuition = parseAmount(getElement('planner80C_Tuition')?.value || 0);
    const homeLoan = parseAmount(getElement('planner80C_HomeLoan')?.value || 0);
    const ssy = parseAmount(getElement('planner80C_SSY')?.value || 0);

    const total = epf + ppf + elss + lic + nsc + tuition + homeLoan + ssy;
    const eligible = Math.min(total, CONFIG.SECTION_80C_LIMIT);
    const remaining = Math.max(0, CONFIG.SECTION_80C_LIMIT - total);
    const percentage = Math.min(100, Math.round((total / CONFIG.SECTION_80C_LIMIT) * 100));
    const taxSaved = eligible * 0.312; // 30% + 4% cess

    // Update UI
    setText('planner80CTotal', formatCurrency(total));
    setText('planner80CEligible', formatCurrency(eligible));
    setText('planner80CRemaining', formatCurrency(remaining));
    setText('planner80CTaxSaved', formatCurrency(Math.round(taxSaved)));
    setText('planner80CPercent', `${percentage}%`);

    // Update progress bar
    const bar = getElement('planner80CBar');
    if (bar) {
        bar.style.width = `${percentage}%`;
        bar.style.background = percentage >= 100 
            ? 'linear-gradient(90deg, #10B981, #34D399)' 
            : 'linear-gradient(90deg, var(--primary), var(--primary-light))';
    }

    // Update alert
    const alert = getElement('planner80CAlert');
    if (alert) {
        if (remaining > 0) {
            const additionalSavings = remaining * 0.312;
            alert.innerHTML = `
                <div class="alert-icon"><i class="fas fa-exclamation"></i></div>
                <div class="alert-content">
                    <div class="alert-title">Investment Opportunity</div>
                    <div class="alert-text">
                        You can invest ${formatCurrency(remaining)} more in ELSS or PPF to maximize your 80C benefits and save additional ${formatCurrency(Math.round(additionalSavings))} in taxes!
                    </div>
                </div>
            `;
            alert.className = 'alert warning';
        } else {
            alert.innerHTML = `
                <div class="alert-icon"><i class="fas fa-check"></i></div>
                <div class="alert-content">
                    <div class="alert-title">80C Limit Utilized</div>
                    <div class="alert-text">
                        Congratulations! You have fully utilized your Section 80C limit. Consider 80CCD(1B) for additional ₹50,000 deduction through NPS.
                    </div>
                </div>
            `;
            alert.className = 'alert success';
        }
    }

    // Update chart
    update80CChart({
        'EPF': epf,
        'PPF': ppf,
        'ELSS': elss,
        'LIC': lic,
        'NSC': nsc,
        'Tuition': tuition,
        'Home Loan': homeLoan,
        'SSY': ssy
    });
}

function update80CChart(data) {
    const ctx = getElement('planner80CChart');
    if (!ctx) return;

    const filteredData = Object.entries(data).filter(([_, value]) => value > 0);
    
    if (planner80CChart) {
        planner80CChart.destroy();
    }

    planner80CChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: filteredData.map(([label]) => label),
            datasets: [{
                data: filteredData.map(([_, value]) => value),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ==================== GST CALCULATOR ====================

let gstMode = 'exclusive';
let gstRate = 18;

function setGSTMode(mode) {
    gstMode = mode;
    document.querySelectorAll('#panel-gst .tabs:first-of-type .tab').forEach((tab, i) => {
        tab.classList.toggle('active', (mode === 'exclusive' && i === 0) || (mode === 'inclusive' && i === 1));
    });
    calculateGST();
}

function setGSTRate(rate) {
    gstRate = rate;
    document.querySelectorAll('#panel-gst .tabs:last-of-type .tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent.includes(`${rate}%`));
    });
    calculateGST();
}

function calculateGST() {
    const amount = parseAmount(getElement('gstAmount')?.value || 0);
    const transactionType = getElement('gstType')?.value || 'intra';

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
    const isIntra = transactionType === 'intra';

    // Update UI
    setText('gstBase', formatCurrency(Math.round(baseAmount)));
    setText('gstTaxAmount', formatCurrency(Math.round(gstAmount)));
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
        
        if (cgstRow) cgstRow.style.display = 'block';
        if (sgstRow) sgstRow.style.display = 'block';
    } else {
        if (cgstRow) cgstRow.style.display = 'block';
        if (sgstRow) sgstRow.style.display = 'none';
        
        const cgstLabel = cgstRow?.querySelector('.result-item-label');
        if (cgstLabel) cgstLabel.textContent = `IGST (${gstRate}%)`;
        setText('cgstAmount', formatCurrency(Math.round(gstAmount)));
    }
}

// ==================== CHARTS ====================

let comparisonChart = null;

function updateComparisonChart(oldTax, newTax) {
    const ctx = getElement('taxComparisonChart');
    if (!ctx) return;

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Old Regime', 'New Regime'],
            datasets: [{
                label: 'Tax Amount',
                data: [oldTax, newTax],
                backgroundColor: [
                    oldTax <= newTax ? '#10B981' : '#3B82F6',
                    newTax <= oldTax ? '#10B981' : '#3B82F6'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

// ==================== NAVIGATION ====================

function initNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            switchTool(this.dataset.tool);
            document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Mobile navigation
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

// ==================== ACCORDION ====================

function toggleCategory(header) {
    const category = header.parentElement;
    category.classList.toggle('open');
}

// ==================== TOTALS UPDATE ====================

function update80CTotal() {
    const epf = parseAmount(getElement('ded80C_EPF')?.value || 0);
    const ppf = parseAmount(getElement('ded80C_PPF')?.value || 0);
    const elss = parseAmount(getElement('ded80C_ELSS')?.value || 0);
    const lic = parseAmount(getElement('ded80C_LIC')?.value || 0);
    const homeLoan = parseAmount(getElement('ded80C_HomeLoan')?.value || 0);
    const tuition = parseAmount(getElement('ded80C_Tuition')?.value || 0);
    
    const total = Math.min(epf + ppf + elss + lic + homeLoan + tuition, CONFIG.SECTION_80C_LIMIT);
    setText('total80C', formatCurrency(total));
}

function updateOtherDedTotal() {
    const ded80D = parseAmount(getElement('ded80D')?.value || 0);
    const dedHRA = parseAmount(getElement('dedHRA')?.value || 0);
    const ded24b = parseAmount(getElement('ded24b')?.value || 0);
    const ded80CCD = parseAmount(getElement('ded80CCD')?.value || 0);
    const ded80E = parseAmount(getElement('ded80E')?.value || 0);
    
    const total = ded80D + dedHRA + ded24b + ded80CCD + ded80E;
    setText('totalOtherDed', formatCurrency(total));
}

// ==================== PDF EXPORT ====================

function downloadDetailedReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(26, 35, 126);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Tax Regime Comparison Report', 20, 25);
    
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | FY 2025-26`, 20, 33);
    
    // Reset color
    doc.setTextColor(0, 0, 0);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 55);
    
    const oldTax = getElement('oldRegimeTax')?.textContent || '₹0';
    const newTax = getElement('newRegimeTax')?.textContent || '₹0';
    const savings = getElement('savingsAmount')?.textContent || '₹0';
    const recommended = getElement('recommendedRegime')?.textContent || '-';
    
    doc.setFontSize(11);
    doc.text(`Old Regime Tax: ${oldTax}`, 20, 65);
    doc.text(`New Regime Tax: ${newTax}`, 20, 73);
    doc.text(`Savings: ${savings}`, 20, 81);
    doc.text(`Recommended: ${recommended}`, 20, 89);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by DS Financial Solutions | www.dsfinancialanalyst.surge.sh', 20, 280);
    
    doc.save('tax-comparison-report.pdf');
}

// ==================== SHARE ====================

function shareResults() {
    const oldTax = getElement('oldRegimeTax')?.textContent || '₹0';
    const newTax = getElement('newRegimeTax')?.textContent || '₹0';
    const savings = getElement('savingsAmount')?.textContent || '₹0';
    const recommended = getElement('recommendedRegime')?.textContent || '-';

    const text = `🧮 My Tax Comparison Results (FY 2025-26)

📊 Old Regime: ${oldTax}
📊 New Regime: ${newTax}
💰 Savings: ${savings}
✅ Recommended: ${recommended}

Calculate yours at: https://dsfinancialanalyst.surge.sh/tax-portal.html`;

    if (navigator.share) {
        navigator.share({
            title: 'Tax Regime Comparison',
            text: text,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        }).catch(console.error);
    }
}

// ==================== OPTIMIZATION TIPS ====================

function showOptimizationTips() {
    const grossIncome = parseAmount(getElement('grossSalary')?.value || 0);
    
    let tips = [];
    
    if (grossIncome > 1500000) {
        tips.push('Consider NPS contribution under 80CCD(1B) for additional ₹50,000 deduction.');
    }
    
    if (grossIncome > 1000000) {
        tips.push('Maximize health insurance under 80D for self and parents.');
    }
    
    tips.push('ELSS funds offer best returns among 80C options with only 3-year lock-in.');
    tips.push('If your deductions exceed ₹3.75L, Old Regime may be better for you.');
    
    alert('💡 Tax Optimization Tips:\n\n' + tips.map((t, i) => `${i + 1}. ${t}`).join('\n\n'));
}

// ==================== RESET ====================

function resetCalculator() {
    if (confirm('Are you sure you want to reset all values?')) {
        location.reload();
    }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    
    // Initial calculations
    calculateRegimeComparison();
    update80CTotal();
    updateOtherDedTotal();
    calculateIncomeTax();
    calculateHRA();
    calculate80CPlanner();
    calculateGST();
});
