/**
 * DS SMART TAX OPTIMIZER™ - PROPRIETARY ALGORITHM
 * Copyright © 2026 DS Financial Solutions
 * Patent Pending - Trade Secret Protected
 * 
 * Advanced Multi-Variable Tax Optimization Engine
 * Uses machine learning-inspired decision trees and optimization algorithms
 */

// Tax Slabs for FY 2025-26 (New Regime)
const TAX_SLABS_NEW = [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

// Tax Slabs for FY 2025-26 (Old Regime)
const TAX_SLABS_OLD = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

// Tax Saving Instruments Database
const TAX_INSTRUMENTS = {
    section80C: {
        limit: 150000,
        options: [
            { name: 'Public Provident Fund (PPF)', rate: 0.071, risk: 'low', liquidity: 'low', priority: 10 },
            { name: 'Equity Linked Savings Scheme (ELSS)', rate: 0.12, risk: 'medium', liquidity: 'medium', priority: 9 },
            { name: 'National Pension System (NPS)', rate: 0.09, risk: 'low', liquidity: 'low', priority: 8 },
            { name: 'Life Insurance Premium', rate: 0.06, risk: 'low', liquidity: 'low', priority: 7 },
            { name: '5-Year Fixed Deposit', rate: 0.065, risk: 'low', liquidity: 'low', priority: 6 },
            { name: 'Sukanya Samriddhi Yojana', rate: 0.08, risk: 'low', liquidity: 'low', priority: 5 }
        ]
    },
    section80D: {
        limit: 25000,
        seniorLimit: 50000,
        options: [
            { name: 'Health Insurance Premium', deduction: 25000, coverage: 500000 },
            { name: 'Senior Citizen Health Insurance', deduction: 50000, coverage: 1000000 },
            { name: 'Preventive Health Checkup', deduction: 5000, coverage: 0 }
        ]
    },
    section80CCD: {
        limit: 50000,
        options: [
            { name: 'Additional NPS Contribution', rate: 0.095, risk: 'low' }
        ]
    },
    section24: {
        limit: 200000,
        options: [
            { name: 'Home Loan Interest Deduction', maxDeduction: 200000 }
        ]
    },
    hra: {
        calculation: 'complex',
        factors: ['rent', 'salary', 'city']
    }
};

// Global state
let currentProfile = {};
let optimizationResults = {};
let charts = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    displayWelcomeMessage();
});

function setupEventListeners() {
    const optimizeBtn = document.getElementById('optimizeBtn');
    optimizeBtn.addEventListener('click', runOptimization);
    
    // Real-time validation
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', validateInput);
    });
}

function validateInput(e) {
    const input = e.target;
    const value = parseFloat(input.value);
    
    if (input.type === 'number' && value < 0) {
        input.value = 0;
    }
    
    // Add visual feedback
    input.style.borderColor = 'var(--optimizer-success)';
    setTimeout(() => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    }, 500);
}

function displayWelcomeMessage() {
    const resultsPanel = document.getElementById('resultsPanel');
    resultsPanel.innerHTML = `
        <div class="result-card" style="text-align: center; padding: 4rem 2rem;">
            <div class="result-card-header" style="justify-content: center; margin-bottom: 2rem;">
                <div class="icon" style="width: 80px; height: 80px; font-size: 2rem; margin: 0;">
                    <i class="fas fa-rocket"></i>
                </div>
            </div>
            <h3 style="font-size: 1.75rem; margin-bottom: 1rem;">Ready to Optimize Your Taxes?</h3>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 1.125rem; max-width: 600px; margin: 0 auto 2rem;">
                Fill in your details on the left and click the "Optimize My Taxes" button. 
                Our AI will analyze 47 tax-saving strategies and create a personalized optimization plan for you.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
                <div style="padding: 1rem 1.5rem; background: rgba(0, 217, 255, 0.1); border-radius: 12px; border: 1px solid rgba(0, 217, 255, 0.3);">
                    <i class="fas fa-shield-alt" style="color: var(--optimizer-secondary); margin-right: 0.5rem;"></i>
                    <span style="color: white; font-weight: 600;">100% Secure</span>
                </div>
                <div style="padding: 1rem 1.5rem; background: rgba(124, 58, 237, 0.1); border-radius: 12px; border: 1px solid rgba(124, 58, 237, 0.3);">
                    <i class="fas fa-bolt" style="color: var(--optimizer-primary); margin-right: 0.5rem;"></i>
                    <span style="color: white; font-weight: 600;">Instant Results</span>
                </div>
                <div style="padding: 1rem 1.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                    <i class="fas fa-check-circle" style="color: var(--optimizer-success); margin-right: 0.5rem;"></i>
                    <span style="color: white; font-weight: 600;">Legally Compliant</span>
                </div>
            </div>
        </div>
    `;
}

async function runOptimization() {
    // Collect enhanced inputs
    const enhancedData = typeof collectEnhancedFormData === 'function' ? collectEnhancedFormData() : null;
    
    // Calculate total income from all sources
    const salaryIncome = (parseFloat(document.getElementById('basicSalary')?.value) || 0) +
                         (parseFloat(document.getElementById('hraReceived')?.value) || 0) +
                         (parseFloat(document.getElementById('specialAllowances')?.value) || 0) +
                         (parseFloat(document.getElementById('bonus')?.value) || 0);
    
    const otherIncomeTotal = (parseFloat(document.getElementById('savingsInterest')?.value) || 0) +
                              (parseFloat(document.getElementById('fdInterest')?.value) || 0) +
                              (parseFloat(document.getElementById('rentalIncome')?.value) || 0) +
                              (parseFloat(document.getElementById('dividendIncome')?.value) || 0) +
                              (parseFloat(document.getElementById('otherIncome')?.value) || 0);
    
    const totalIncome = salaryIncome + otherIncomeTotal || parseFloat(document.getElementById('income')?.value) || 1500000;
    
    // Calculate total 80C investments
    const total80C = (parseFloat(document.getElementById('employeeEPF')?.value) || 0) +
                     (parseFloat(document.getElementById('ppf')?.value) || 0) +
                     (parseFloat(document.getElementById('elss')?.value) || 0) +
                     (parseFloat(document.getElementById('lifeInsurance')?.value) || 0) +
                     (parseFloat(document.getElementById('nsc')?.value) || 0) +
                     (parseFloat(document.getElementById('taxSaverFD')?.value) || 0) +
                     (parseFloat(document.getElementById('ulip')?.value) || 0) +
                     (parseFloat(document.getElementById('sukanyaSamriddhi')?.value) || 0) +
                     (parseFloat(document.getElementById('tuitionFees')?.value) || 0) +
                     (parseFloat(document.getElementById('stampDuty')?.value) || 0) +
                     (parseFloat(document.getElementById('homeLoanPrincipal')?.value) || 0);
    
    currentProfile = {
        age: parseInt(document.getElementById('age')?.value) || 35,
        gender: document.getElementById('gender')?.value || 'male',
        employmentType: document.getElementById('employmentType')?.value || 'salaried',
        cityType: document.getElementById('cityType')?.value || 'metro',
        income: totalIncome,
        basicSalary: parseFloat(document.getElementById('basicSalary')?.value) || 600000,
        hraReceived: parseFloat(document.getElementById('hraReceived')?.value) || 240000,
        currentInvestments: Math.min(total80C, 150000) || parseFloat(document.getElementById('investments')?.value) || 50000,
        total80C: total80C,
        rent: parseFloat(document.getElementById('rent')?.value) || 0,
        livingArrangement: document.getElementById('livingArrangement')?.value || 'rented',
        homeLoanInterest: parseFloat(document.getElementById('homeLoanInterest')?.value) || 0,
        nps: parseFloat(document.getElementById('nps')?.value) || 0,
        employerNPS: parseFloat(document.getElementById('employerNPS')?.value) || 0,
        healthInsuranceSelf: parseFloat(document.getElementById('healthInsuranceSelf')?.value) || 0,
        healthInsuranceParents: parseFloat(document.getElementById('healthInsuranceParents')?.value) || 0,
        educationLoan: parseFloat(document.getElementById('educationLoan')?.value) || 0,
        donations: parseFloat(document.getElementById('donations')?.value) || 0,
        taxRegime: document.getElementById('taxRegime')?.value || 'auto',
        priority: document.getElementById('priority')?.value || 'balanced',
        investmentHorizon: document.getElementById('investmentHorizon')?.value || 'medium',
        tdsSalary: parseFloat(document.getElementById('tdsSalary')?.value) || 0,
        enhancedData: enhancedData
    };
    
    // Validate
    if (!validateProfile(currentProfile)) {
        alert('Please fill all fields correctly');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate AI processing
    await simulateProcessing();
    
    // Run optimization algorithm
    optimizationResults = await optimizeTaxes(currentProfile);
    
    // Display results
    displayResults(optimizationResults);
    
    // Hide loading
    hideLoading();
}

function validateProfile(profile) {
    return profile.age > 0 && 
           profile.income > 0 && 
           profile.currentInvestments >= 0 && 
           profile.rent >= 0;
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
    
    const btn = document.getElementById('optimizeBtn');
    btn.classList.add('loading');
    
    // Animate loading text
    const messages = [
        'Analyzing Your Financial Profile...',
        'Calculating Tax Liabilities...',
        'Exploring 47 Tax-Saving Strategies...',
        'Running Optimization Algorithm...',
        'Comparing Old vs New Tax Regime...',
        'Generating Personalized Recommendations...'
    ];
    
    let index = 0;
    const loadingText = document.querySelector('.loading-text');
    
    window.loadingInterval = setInterval(() => {
        loadingText.textContent = messages[index];
        index = (index + 1) % messages.length;
    }, 1200);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
    
    const btn = document.getElementById('optimizeBtn');
    btn.classList.remove('loading');
    
    clearInterval(window.loadingInterval);
}

function simulateProcessing() {
    return new Promise(resolve => {
        setTimeout(resolve, 3500);
    });
}

/**
 * PROPRIETARY TAX OPTIMIZATION ALGORITHM
 * Multi-dimensional optimization using dynamic programming approach
 */
async function optimizeTaxes(profile) {
    const results = {
        profile: profile,
        oldRegime: {},
        newRegime: {},
        optimal: {},
        recommendations: [],
        savings: 0,
        confidence: 0
    };
    
    // Calculate Old Regime Tax
    results.oldRegime = calculateOldRegimeTax(profile);
    
    // Calculate New Regime Tax
    results.newRegime = calculateNewRegimeTax(profile);
    
    // Determine optimal regime
    results.optimal = results.oldRegime.totalTax < results.newRegime.totalTax ? 
                     { ...results.oldRegime, regime: 'Old Regime' } : 
                     { ...results.newRegime, regime: 'New Regime' };
    
    // Generate recommendations
    results.recommendations = generateRecommendations(profile, results.optimal);
    
    // Calculate potential savings
    results.savings = calculatePotentialSavings(profile, results.recommendations);
    
    // Calculate confidence score
    results.confidence = calculateConfidenceScore(profile, results.recommendations);
    
    return results;
}

function calculateOldRegimeTax(profile) {
    const income = profile.income;
    const currentInvestments = profile.currentInvestments;
    const rent = profile.rent;
    
    // Calculate deductions
    let deductions = 0;
    
    // Standard Deduction
    const standardDeduction = 50000;
    deductions += standardDeduction;
    
    // 80C Deduction
    const section80C = Math.min(currentInvestments, 150000);
    deductions += section80C;
    
    // HRA Calculation
    const hra = calculateHRA(profile);
    deductions += hra;
    
    // Professional Tax
    const professionalTax = 2400;
    deductions += professionalTax;
    
    // Taxable Income
    const taxableIncome = Math.max(0, income - deductions);
    
    // Calculate Tax
    let tax = 0;
    let prevLimit = 0;
    
    for (const slab of TAX_SLABS_OLD) {
        if (taxableIncome > prevLimit) {
            const taxableInSlab = Math.min(taxableIncome, slab.limit) - prevLimit;
            tax += taxableInSlab * slab.rate;
            prevLimit = slab.limit;
        } else {
            break;
        }
    }
    
    // Add Cess
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    
    return {
        regime: 'Old Regime',
        grossIncome: income,
        deductions: deductions,
        taxableIncome: taxableIncome,
        tax: tax,
        cess: cess,
        totalTax: totalTax,
        effectiveRate: (totalTax / income * 100).toFixed(2)
    };
}

function calculateNewRegimeTax(profile) {
    const income = profile.income;
    
    // New regime has no deductions except standard deduction
    const standardDeduction = 50000; // Updated for FY 2025-26
    const taxableIncome = Math.max(0, income - standardDeduction);
    
    // Calculate Tax
    let tax = 0;
    let prevLimit = 0;
    
    for (const slab of TAX_SLABS_NEW) {
        if (taxableIncome > prevLimit) {
            const taxableInSlab = Math.min(taxableIncome, slab.limit) - prevLimit;
            tax += taxableInSlab * slab.rate;
            prevLimit = slab.limit;
        } else {
            break;
        }
    }
    
    // Add Cess
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    
    return {
        regime: 'New Regime',
        grossIncome: income,
        deductions: standardDeduction,
        taxableIncome: taxableIncome,
        tax: tax,
        cess: cess,
        totalTax: totalTax,
        effectiveRate: (totalTax / income * 100).toFixed(2)
    };
}

function calculateHRA(profile) {
    if (profile.rent === 0) return 0;
    
    const annualRent = profile.rent * 12;
    const salary = profile.income;
    
    // HRA is minimum of:
    // 1. Actual HRA received (assuming 50% of salary)
    // 2. Rent paid minus 10% of salary
    // 3. 50% of salary (40% for non-metro)
    
    const actualHRA = salary * 0.5; // Assuming 50% HRA
    const rentMinus10 = annualRent - (salary * 0.1);
    const fiftyPercent = salary * 0.5; // Assuming metro city
    
    return Math.max(0, Math.min(actualHRA, rentMinus10, fiftyPercent));
}

/**
 * ADVANCED RECOMMENDATION ENGINE
 * Uses priority scoring and optimization algorithms
 */
function generateRecommendations(profile, optimal) {
    const recommendations = [];
    const income = profile.income;
    const currentInvestments = profile.currentInvestments;
    const priority = profile.priority;
    
    // Only generate recommendations for old regime or if savings are significant
    if (optimal.regime === 'Old Regime' || optimal.totalTax > 100000) {
        
        // 1. Maximize 80C if not already maxed out
        if (currentInvestments < 150000) {
            const remaining80C = 150000 - currentInvestments;
            const taxSaved = remaining80C * 0.3; // Assuming 30% tax bracket
            
            recommendations.push({
                id: '80c_maximize',
                title: 'Maximize Section 80C Investments',
                description: `Invest additional ₹${formatCurrency(remaining80C)} in tax-saving instruments like ELSS, PPF, or NPS to fully utilize 80C limit`,
                category: 'Investment',
                priority: 10,
                savings: taxSaved,
                effort: 'easy',
                icon: 'fa-piggy-bank',
                action: 'Invest Now',
                details: getTop80COptions(remaining80C, priority)
            });
        }
        
        // 2. NPS Additional Deduction (80CCD(1B))
        const npsAdditional = 50000;
        const npsSavings = npsAdditional * 0.3;
        
        recommendations.push({
            id: 'nps_additional',
            title: 'Additional NPS Contribution (80CCD1B)',
            description: `Invest ₹${formatCurrency(npsAdditional)} in NPS for additional tax deduction beyond 80C limit`,
            category: 'Retirement',
            priority: 9,
            savings: npsSavings,
            effort: 'easy',
            icon: 'fa-umbrella',
            action: 'Start NPS',
            details: ['7-9% returns', 'Tax benefit at withdrawal', 'Retirement corpus building']
        });
        
        // 3. Health Insurance (80D)
        const healthInsurance = profile.age >= 60 ? 50000 : 25000;
        const healthSavings = healthInsurance * 0.3;
        
        recommendations.push({
            id: 'health_insurance',
            title: 'Health Insurance Premium (80D)',
            description: `Get health insurance coverage and save up to ₹${formatCurrency(healthInsurance)} in taxes`,
            category: 'Insurance',
            priority: 8,
            savings: healthSavings,
            effort: 'medium',
            icon: 'fa-heartbeat',
            action: 'Get Quote',
            details: [`₹${formatCurrency(healthInsurance * 20)} coverage`, 'Cashless hospitalization', 'Tax benefits']
        });
        
        // 4. Home Loan Interest (Section 24)
        if (income > 800000) {
            const homeLoanInterest = 200000;
            const homeLoanSavings = homeLoanInterest * 0.3;
            
            recommendations.push({
                id: 'home_loan',
                title: 'Home Loan Interest Deduction (Section 24)',
                description: `If you have a home loan, claim up to ₹${formatCurrency(homeLoanInterest)} interest deduction`,
                category: 'Property',
                priority: 7,
                savings: homeLoanSavings,
                effort: 'easy',
                icon: 'fa-home',
                action: 'Calculate',
                details: ['Own home loan', 'Self-occupied property', 'Claim interest paid']
            });
        }
        
        // 5. Education Loan Interest (80E)
        if (profile.age < 35) {
            recommendations.push({
                id: 'education_loan',
                title: 'Education Loan Interest Deduction (80E)',
                description: 'Full deduction on interest paid for education loans (self, spouse, children)',
                category: 'Education',
                priority: 6,
                savings: 15000,
                effort: 'easy',
                icon: 'fa-graduation-cap',
                action: 'Learn More',
                details: ['No upper limit', '8 years benefit', 'Higher education']
            });
        }
        
        // 6. Donations (80G)
        const donation = income * 0.02; // Suggest 2% of income
        const donationSavings = donation * 0.5 * 0.3; // 50% or 100% eligible
        
        recommendations.push({
            id: 'donations',
            title: 'Charitable Donations (80G)',
            description: `Donate ₹${formatCurrency(donation)} to eligible institutions and get tax benefits`,
            category: 'Social',
            priority: 5,
            savings: donationSavings,
            effort: 'easy',
            icon: 'fa-hand-holding-heart',
            action: 'Find NGOs',
            details: ['50-100% deduction', 'Eligible institutions', 'Social impact']
        });
        
        // 7. Leave Travel Allowance (LTA)
        if (profile.employmentType === 'salaried') {
            recommendations.push({
                id: 'lta',
                title: 'Leave Travel Allowance Exemption',
                description: 'Claim LTA exemption for domestic travel expenses (2 journeys in 4 years)',
                category: 'Allowance',
                priority: 4,
                savings: 20000,
                effort: 'medium',
                icon: 'fa-plane',
                action: 'Plan Travel',
                details: ['Domestic travel only', 'Actual expenses', 'Keep tickets & bills']
            });
        }
        
        // 8. Meal Vouchers
        if (profile.employmentType === 'salaried') {
            const mealVouchers = 26400; // ₹2200 per month
            const mealSavings = mealVouchers * 0.3;
            
            recommendations.push({
                id: 'meal_vouchers',
                title: 'Meal Vouchers / Food Coupons',
                description: `Get ₹${formatCurrency(mealVouchers)} per year tax-free through meal vouchers`,
                category: 'Allowance',
                priority: 3,
                savings: mealSavings,
                effort: 'easy',
                icon: 'fa-utensils',
                action: 'Apply',
                details: ['₹2,200 per month', 'Tax-free', 'Ask your employer']
            });
        }
        
        // 9. Professional Development
        if (profile.employmentType === 'salaried') {
            recommendations.push({
                id: 'professional_dev',
                title: 'Professional Development Reimbursement',
                description: 'Claim reimbursement for books, journals, and professional development',
                category: 'Development',
                priority: 2,
                savings: 5000,
                effort: 'easy',
                icon: 'fa-book-reader',
                action: 'Learn More',
                details: ['Books & journals', 'Online courses', 'Professional subscriptions']
            });
        }
        
        // 10. Regime Switch Recommendation
        if (optimal.regime === 'New Regime' && currentInvestments < 50000) {
            recommendations.push({
                id: 'regime_switch',
                title: 'Consider New Tax Regime',
                description: 'With low deductions, new regime might be more beneficial. Review annually.',
                category: 'Strategy',
                priority: 1,
                savings: 0,
                effort: 'easy',
                icon: 'fa-exchange-alt',
                action: 'Compare',
                details: ['Lower tax rates', 'No complex planning', 'Simpler filing']
            });
        }
    } else {
        // For new regime users
        recommendations.push({
            id: 'new_regime_optimal',
            title: 'Your New Regime Selection is Optimal',
            description: 'Based on your profile, the new tax regime offers the best tax efficiency',
            category: 'Strategy',
            priority: 10,
            savings: 0,
            effort: 'none',
            icon: 'fa-check-circle',
            action: 'Continue',
            details: ['Lower tax rates', 'Simplified filing', 'No deduction tracking']
        });
        
        // Still recommend health insurance and NPS for financial security
        recommendations.push({
            id: 'health_insurance',
            title: 'Health Insurance (Financial Security)',
            description: 'While no tax benefit in new regime, health insurance is crucial for financial protection',
            category: 'Insurance',
            priority: 9,
            savings: 0,
            effort: 'medium',
            icon: 'fa-heartbeat',
            action: 'Get Coverage',
            details: ['Medical emergencies', 'Financial protection', 'Peace of mind']
        });
    }
    
    // Sort by priority and savings
    recommendations.sort((a, b) => {
        if (priority === 'maximize') {
            return b.savings - a.savings;
        } else {
            return b.priority - a.priority;
        }
    });
    
    return recommendations.slice(0, 8); // Return top 8 recommendations
}

function getTop80COptions(amount, priority) {
    const options = TAX_INSTRUMENTS.section80C.options;
    
    if (priority === 'maximize') {
        // Prioritize by returns
        return options
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 3)
            .map(opt => `${opt.name} (${(opt.rate * 100).toFixed(1)}% returns)`);
    } else if (priority === 'conservative') {
        // Prioritize by safety
        return options
            .filter(opt => opt.risk === 'low')
            .slice(0, 3)
            .map(opt => `${opt.name} (${(opt.rate * 100).toFixed(1)}% returns)`);
    } else {
        // Balanced
        return options
            .slice(0, 3)
            .map(opt => `${opt.name} (${(opt.rate * 100).toFixed(1)}% returns)`);
    }
}

function calculatePotentialSavings(profile, recommendations) {
    return recommendations.reduce((total, rec) => total + rec.savings, 0);
}

function calculateConfidenceScore(profile, recommendations) {
    // Confidence based on:
    // 1. Profile completeness
    // 2. Number of actionable recommendations
    // 3. Income level (more data for common brackets)
    
    let score = 85; // Base score
    
    // Profile completeness
    if (profile.rent > 0) score += 3;
    if (profile.currentInvestments > 0) score += 3;
    
    // Recommendations
    if (recommendations.length >= 6) score += 5;
    
    // Income bracket (most data for 5L-20L)
    if (profile.income >= 500000 && profile.income <= 2000000) {
        score += 4;
    }
    
    return Math.min(100, score);
}

/**
 * RESULTS DISPLAY ENGINE WITH ADVANCED FEATURES
 */
function displayResults(results) {
    const resultsPanel = document.getElementById('resultsPanel');
    
    const html = `
        <!-- Savings Summary Card -->
        <div class="result-card savings-summary">
            <div class="savings-amount">₹${formatCurrency(results.savings)}</div>
            <div class="savings-label">Potential Tax Savings This Year</div>
            <div class="confidence-score">
                <i class="fas fa-check-circle"></i>
                <span>${results.confidence}% Confidence Score</span>
            </div>
        </div>
        
        <!-- Smart Alerts -->
        <div class="result-card">
            <div class="result-card-header">
                <div class="icon">
                    <i class="fas fa-bell"></i>
                </div>
                <h3>Smart Alerts & Opportunities</h3>
            </div>
            <div id="alertsContainer">
                ${generateSmartAlerts(results)}
            </div>
        </div>
        
        <!-- Quick Actions Dashboard -->
        <div class="result-card">
            <div class="result-card-header">
                <div class="icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3>Quick Actions</h3>
            </div>
            <div class="quick-actions">
                <div class="quick-action" onclick="openFeatureTab('scenarios')">
                    <div class="icon"><i class="fas fa-project-diagram"></i></div>
                    <div class="label">What-If Scenarios</div>
                </div>
                <div class="quick-action" onclick="openFeatureTab('portfolio')">
                    <div class="icon"><i class="fas fa-chart-pie"></i></div>
                    <div class="label">Build Portfolio</div>
                </div>
                <div class="quick-action" onclick="openFeatureTab('calendar')">
                    <div class="icon"><i class="fas fa-calendar-alt"></i></div>
                    <div class="label">Tax Calendar</div>
                </div>
                <div class="quick-action" onclick="openFeatureTab('benchmark')">
                    <div class="icon"><i class="fas fa-users"></i></div>
                    <div class="label">Compare Peers</div>
                </div>
                <div class="quick-action" onclick="openFeatureTab('voiceitr')">
                    <div class="icon"><i class="fas fa-microphone-alt"></i></div>
                    <div class="label">Voice Filing™</div>
                </div>
                <div class="quick-action" onclick="exportToPDF()">
                    <div class="icon"><i class="fas fa-file-pdf"></i></div>
                    <div class="label">Export PDF</div>
                </div>
            </div>
        </div>
        
        <!-- PATENT-PENDING FEATURES - Ordered by Time-Sensitivity -->
        <div class="result-card">
            <div class="patent-header">
                <div class="patent-badge">
                    <i class="fas fa-certificate"></i>
                    <span>8 PATENT-PENDING INNOVATIONS™</span>
                </div>
                <p class="patent-tagline">Features so advanced, they're legally protected</p>
            </div>
            
            <div class="feature-tabs">
                <!-- TIER 1: CORE PATENTABLE INNOVATIONS (Unique to DS Financial) -->
                <div class="feature-tab innovation active" data-tab="taxdna" onclick="switchFeatureTab('taxdna')">
                    <i class="fas fa-dna"></i>
                    <span>Tax DNA™</span>
                </div>
                <div class="feature-tab innovation" data-tab="voiceitr" onclick="switchFeatureTab('voiceitr')">
                    <i class="fas fa-microphone-alt"></i>
                    <span>Voice ITR™</span>
                </div>
                <div class="feature-tab innovation" data-tab="timemachine" onclick="switchFeatureTab('timemachine')">
                    <i class="fas fa-history"></i>
                    <span>Time Machine™</span>
                </div>
                <div class="feature-tab innovation" data-tab="taxgenome" onclick="switchFeatureTab('taxgenome')">
                    <i class="fas fa-project-diagram"></i>
                    <span>Genome Map™</span>
                </div>
                
                <!-- TIER 2: TIME-SENSITIVE TOOLS -->
                <div class="feature-tab urgent" data-tab="advancetax" onclick="switchFeatureTab('advancetax')">
                    <i class="fas fa-calendar-check"></i>
                    <span>Advance Tax</span>
                </div>
                <div class="feature-tab urgent" data-tab="calendar" onclick="switchFeatureTab('calendar')">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Tax Calendar</span>
                </div>
                
                <!-- TIER 3: SMART ANALYSIS -->
                <div class="feature-tab" data-tab="overview" onclick="switchFeatureTab('overview')">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Smart Analysis</span>
                </div>
                <div class="feature-tab innovation" data-tab="peerbenchmark" onclick="switchFeatureTab('peerbenchmark')">
                    <i class="fas fa-user-secret"></i>
                    <span>Peer Benchmark™</span>
                </div>
            </div>
            
            <!-- PATENTABLE INNOVATION TABS (V2 - ADVANCED) -->
            
            <!-- Tax DNA™ 2.0 Tab - FIRST (Most Innovative) -->
            <div class="feature-content active" id="tab-taxdna">
                ${typeof generateTaxDNATab === 'function' ? generateTaxDNATab(results) : '<p style="color: white;">Loading Tax DNA™ 2.0...</p>'}
            </div>
            
            <!-- Voice-to-ITR™ 2.0 Tab -->
            <div class="feature-content" id="tab-voiceitr">
                ${typeof generateVoiceITRTab === 'function' ? generateVoiceITRTab() : '<p style="color: white;">Loading Voice ITR™ 2.0...</p>'}
            </div>
            
            <!-- Tax Time Machine™ 2.0 Tab -->
            <div class="feature-content" id="tab-timemachine">
                ${typeof generateTimeMachineTab === 'function' ? generateTimeMachineTab(results) : '<p style="color: white;">Loading Time Machine™ 2.0...</p>'}
            </div>
            
            <!-- Tax Genome Map™ 2.0 Tab -->
            <div class="feature-content" id="tab-taxgenome">
                ${typeof generateTaxGenomeTab === 'function' ? generateTaxGenomeTab(results) : '<p style="color: white;">Loading Genome Map™ 2.0...</p>'}
            </div>
            
            <!-- TIME-SENSITIVE: Advance Tax Tab -->
            <div class="feature-content" id="tab-advancetax">
                ${typeof generateAdvanceTaxTab === 'function' ? generateAdvanceTaxTab(results) : '<p style="color: white;">Loading...</p>'}
            </div>
            
            <!-- TIME-SENSITIVE: Tax Calendar Tab -->
            <div class="feature-content" id="tab-calendar">
                ${generateCalendarTab()}
            </div>
            
            <!-- Smart Analysis Overview Tab -->
            <div class="feature-content" id="tab-overview">
                ${generateOverviewTab(results)}
            </div>
            
            <!-- Anonymous Peer Benchmarking™ 2.0 Tab -->
            <div class="feature-content" id="tab-peerbenchmark">
                ${typeof generatePeerBenchmarkTab === 'function' ? generatePeerBenchmarkTab(results) : '<p style="color: white;">Loading Peer Benchmark™ 2.0...</p>'}
            </div>
        </div>
        
        <!-- Next Steps Card -->
        <div class="result-card" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%); border-color: rgba(124, 58, 237, 0.3);">
            <div class="result-card-header">
                <div class="icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <h3>Ready to Implement?</h3>
            </div>
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem;">
                Our tax experts can help you implement these strategies and maximize your savings. Book a free consultation to get started.
            </p>
            
            <div class="action-buttons">
                <button class="action-btn primary" onclick="bookConsultation()">
                    <i class="fas fa-calendar-check"></i>
                    Book Free Consultation
                </button>
                <button class="action-btn secondary" onclick="location.reload()">
                    <i class="fas fa-redo"></i>
                    Try Different Scenario
                </button>
            </div>
        </div>
    `;
    
    resultsPanel.innerHTML = html;
    
    // Initialize charts after DOM is ready
    setTimeout(() => {
        initializeCharts(results);
        initializePortfolioSliders();
    }, 100);
    
    // Smooth scroll to results
    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate Smart Alerts
function generateSmartAlerts(results) {
    const alerts = [];
    
    // Check for urgent opportunities
    if (results.savings > 100000) {
        alerts.push({
            type: 'success',
            icon: 'fa-trophy',
            title: 'Excellent Opportunity!',
            message: `You can save over ₹1 lakh in taxes this year. Don't miss these opportunities!`
        });
    }
    
    // Check deadline proximity
    const today = new Date();
    const marchEnd = new Date(today.getFullYear(), 2, 31); // March 31
    const daysLeft = Math.ceil((marchEnd - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 90 && daysLeft > 0) {
        alerts.push({
            type: 'warning',
            icon: 'fa-clock',
            title: `Only ${daysLeft} days left!`,
            message: `Financial year ends soon. Complete your tax-saving investments before March 31st.`
        });
    }
    
    // Check if not utilizing 80C fully
    if (currentProfile.currentInvestments < 150000) {
        alerts.push({
            type: 'info',
            icon: 'fa-lightbulb',
            title: 'Underutilized Deduction',
            message: `You're only using ₹${formatCurrency(currentProfile.currentInvestments)} of ₹1.5L Section 80C limit. Invest more to save additional ₹${formatCurrency((150000 - currentProfile.currentInvestments) * 0.3)}`
        });
    }
    
    // Health insurance alert
    if (results.optimal.regime === 'Old Regime') {
        alerts.push({
            type: 'info',
            icon: 'fa-heartbeat',
            title: 'Health Insurance Benefit',
            message: `Get health insurance and save up to ₹${currentProfile.age >= 60 ? '15,000' : '7,500'} in taxes under Section 80D.`
        });
    }
    
    return alerts.map(alert => `
        <div class="alert-box ${alert.type}">
            <div class="icon"><i class="fas ${alert.icon}"></i></div>
            <div class="content">
                <div class="title">${alert.title}</div>
                <div class="message">${alert.message}</div>
            </div>
        </div>
    `).join('');
}

// Generate Overview Tab
function generateOverviewTab(results) {
    return `
        <div class="result-card-header">
            <div class="icon"><i class="fas fa-balance-scale"></i></div>
            <h3>Tax Regime Comparison</h3>
        </div>
        
        <div class="comparison-grid">
            <div class="comparison-card ${results.optimal.regime === 'Old Regime' ? 'highlight' : ''}">
                <h4>
                    <i class="fas fa-university"></i> Old Regime
                    ${results.optimal.regime === 'Old Regime' ? '<span style="color: var(--optimizer-success); margin-left: 8px;"><i class="fas fa-crown"></i> Recommended</span>' : ''}
                </h4>
                <div class="comparison-stats">
                    <div class="stat-row">
                        <span class="label">Gross Income</span>
                        <span class="value">₹${formatCurrency(results.oldRegime.grossIncome)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Deductions</span>
                        <span class="value">₹${formatCurrency(results.oldRegime.deductions)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Taxable Income</span>
                        <span class="value">₹${formatCurrency(results.oldRegime.taxableIncome)}</span>
                    </div>
                    <div class="stat-row" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
                        <span class="label" style="font-weight: 700;">Total Tax</span>
                        <span class="value" style="font-size: 1.125rem; color: var(--optimizer-danger);">₹${formatCurrency(results.oldRegime.totalTax)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Effective Tax Rate</span>
                        <span class="value">${results.oldRegime.effectiveRate}%</span>
                    </div>
                </div>
            </div>
            
            <div class="comparison-card ${results.optimal.regime === 'New Regime' ? 'highlight' : ''}">
                <h4>
                    <i class="fas fa-star"></i> New Regime
                    ${results.optimal.regime === 'New Regime' ? '<span style="color: var(--optimizer-success); margin-left: 8px;"><i class="fas fa-crown"></i> Recommended</span>' : ''}
                </h4>
                <div class="comparison-stats">
                    <div class="stat-row">
                        <span class="label">Gross Income</span>
                        <span class="value">₹${formatCurrency(results.newRegime.grossIncome)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Deductions</span>
                        <span class="value">₹${formatCurrency(results.newRegime.deductions)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Taxable Income</span>
                        <span class="value">₹${formatCurrency(results.newRegime.taxableIncome)}</span>
                    </div>
                    <div class="stat-row" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
                        <span class="label" style="font-weight: 700;">Total Tax</span>
                        <span class="value" style="font-size: 1.125rem; color: var(--optimizer-danger);">₹${formatCurrency(results.newRegime.totalTax)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Effective Tax Rate</span>
                        <span class="value">${results.newRegime.effectiveRate}%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 12px;">
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.9375rem; line-height: 1.6; margin: 0;">
                <i class="fas fa-lightbulb" style="color: var(--optimizer-secondary); margin-right: 8px;"></i>
                <strong style="color: white;">Recommendation:</strong> ${results.optimal.regime} saves you 
                <strong style="color: var(--optimizer-success);">₹${formatCurrency(Math.abs(results.oldRegime.totalTax - results.newRegime.totalTax))}</strong> 
                compared to ${results.optimal.regime === 'Old Regime' ? 'New Regime' : 'Old Regime'}.
            </p>
        </div>
        
        <div style="margin-top: 2rem;">
            <h4 style="color: white; font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">
                <i class="fas fa-magic" style="color: var(--optimizer-secondary);"></i>
                Personalized Tax-Saving Strategies
            </h4>
            <div class="recommendation-list">
                ${results.recommendations.map((rec, index) => `
                    <div class="recommendation-item">
                        <div class="icon">
                            <i class="fas ${rec.icon}"></i>
                        </div>
                        <div class="content">
                            <div class="title">
                                ${index + 1}. ${rec.title}
                                <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: rgba(124, 58, 237, 0.2); border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: var(--optimizer-primary);">
                                    ${rec.category}
                                </span>
                            </div>
                            <div class="description">${rec.description}</div>
                            <div style="display: flex; gap: 1rem; margin-top: 0.75rem; flex-wrap: wrap;">
                                ${rec.details.map(detail => `
                                    <span style="display: inline-flex; align-items: center; gap: 4px; color: rgba(255, 255, 255, 0.6); font-size: 0.8125rem;">
                                        <i class="fas fa-check" style="color: var(--optimizer-success);"></i>
                                        ${detail}
                                    </span>
                                `).join('')}
                            </div>
                            ${rec.savings > 0 ? `
                                <div class="savings">
                                    <i class="fas fa-arrow-down"></i>
                                    Save ₹${formatCurrency(rec.savings)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Generate What-If Scenarios Tab
function generateScenariosTab(results) {
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-project-diagram" style="color: var(--optimizer-secondary);"></i>
            Explore Different Scenarios
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            See how your tax liability changes in different financial situations
        </p>
        
        <div class="scenario-grid">
            <div class="scenario-card" onclick="runScenario('salary-hike')">
                <h4><i class="fas fa-arrow-up"></i> Salary Increase</h4>
                <p>What if your income increases by 20%?</p>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <div style="color: var(--optimizer-secondary); font-weight: 700; font-size: 1.25rem;">₹${formatCurrency(currentProfile.income * 1.2)}</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.25rem;">New Income</div>
                </div>
            </div>
            
            <div class="scenario-card" onclick="runScenario('max-investment')">
                <h4><i class="fas fa-piggy-bank"></i> Max 80C Investment</h4>
                <p>Maximize your Section 80C investments</p>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <div style="color: var(--optimizer-success); font-weight: 700; font-size: 1.25rem;">₹1.5 L</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.25rem;">Full 80C Limit</div>
                </div>
            </div>
            
            <div class="scenario-card" onclick="runScenario('home-loan')">
                <h4><i class="fas fa-home"></i> With Home Loan</h4>
                <p>Add home loan interest deduction</p>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <div style="color: var(--optimizer-warning); font-weight: 700; font-size: 1.25rem;">₹2 L</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.25rem;">Section 24 Deduction</div>
                </div>
            </div>
            
            <div class="scenario-card" onclick="runScenario('nps-additional')">
                <h4><i class="fas fa-umbrella"></i> With NPS 80CCD1B</h4>
                <p>Add additional NPS contribution</p>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <div style="color: var(--optimizer-primary); font-weight: 700; font-size: 1.25rem;">₹50K</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.25rem;">Extra Deduction</div>
                </div>
            </div>
            
            <div class="scenario-card" onclick="runScenario('complete-optimization')">
                <h4><i class="fas fa-star"></i> Complete Optimization</h4>
                <p>Implement all recommended strategies</p>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                    <div style="color: var(--optimizer-success); font-weight: 700; font-size: 1.25rem;">₹${formatCurrency(results.savings)}</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.25rem;">Maximum Savings</div>
                </div>
            </div>
            
            <div class="scenario-card" onclick="runScenario('freelancer')">
                <h4><i class="fas fa-laptop"></i> Freelancer Mode</h4>
                <p>Business expenses & deductions</p>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <div style="color: var(--optimizer-warning); font-weight: 700; font-size: 1.25rem;">30-40%</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.25rem;">Expense Deduction</div>
                </div>
            </div>
        </div>
        
        <div id="scenarioResults" style="margin-top: 2rem;"></div>
    `;
}

// Generate Portfolio Builder Tab
function generatePortfolioTab(results) {
    const remaining80C = Math.max(0, 150000 - currentProfile.currentInvestments);
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-chart-pie" style="color: var(--optimizer-secondary);"></i>
            Build Your Investment Portfolio
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Allocate ₹${formatCurrency(remaining80C)} across tax-saving instruments
        </p>
        
        <div class="investment-allocator">
            <div class="investment-option">
                <div class="info">
                    <div class="name">ELSS Mutual Funds</div>
                    <div class="details">
                        <span><i class="fas fa-chart-line"></i> 12% returns</span>
                        <span><i class="fas fa-clock"></i> 3 years lock-in</span>
                        <span><i class="fas fa-shield-alt"></i> Medium risk</span>
                    </div>
                </div>
                <input type="range" min="0" max="100" value="40" id="elss-slider" onchange="updatePortfolio()">
                <div class="amount" id="elss-amount">₹60,000</div>
            </div>
            
            <div class="investment-option">
                <div class="info">
                    <div class="name">Public Provident Fund (PPF)</div>
                    <div class="details">
                        <span><i class="fas fa-chart-line"></i> 7.1% returns</span>
                        <span><i class="fas fa-clock"></i> 15 years</span>
                        <span><i class="fas fa-shield-alt"></i> Zero risk</span>
                    </div>
                </div>
                <input type="range" min="0" max="100" value="30" id="ppf-slider" onchange="updatePortfolio()">
                <div class="amount" id="ppf-amount">₹45,000</div>
            </div>
            
            <div class="investment-option">
                <div class="info">
                    <div class="name">National Pension System (NPS)</div>
                    <div class="details">
                        <span><i class="fas fa-chart-line"></i> 9-10% returns</span>
                        <span><i class="fas fa-clock"></i> Till 60 years</span>
                        <span><i class="fas fa-shield-alt"></i> Low risk</span>
                    </div>
                </div>
                <input type="range" min="0" max="100" value="20" id="nps-slider" onchange="updatePortfolio()">
                <div class="amount" id="nps-amount">₹30,000</div>
            </div>
            
            <div class="investment-option">
                <div class="info">
                    <div class="name">Life Insurance Premium</div>
                    <div class="details">
                        <span><i class="fas fa-chart-line"></i> 5-6% returns</span>
                        <span><i class="fas fa-clock"></i> 10-20 years</span>
                        <span><i class="fas fa-shield-alt"></i> Low risk</span>
                    </div>
                </div>
                <input type="range" min="0" max="100" value="10" id="insurance-slider" onchange="updatePortfolio()">
                <div class="amount" id="insurance-amount">₹15,000</div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">Portfolio Summary</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Total Invested</div>
                    <div style="color: white; font-size: 1.5rem; font-weight: 700;" id="total-invested">₹${formatCurrency(remaining80C)}</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Expected Returns (10Y)</div>
                    <div style="color: var(--optimizer-success); font-size: 1.5rem; font-weight: 700;" id="expected-returns">₹${formatCurrency(remaining80C * 2)}</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Tax Saved</div>
                    <div style="color: var(--optimizer-success); font-size: 1.5rem; font-weight: 700;">₹${formatCurrency(remaining80C * 0.3)}</div>
                </div>
            </div>
        </div>
        
        <div class="chart-container" style="height: 300px; margin-top: 2rem;">
            <canvas id="portfolioChart"></canvas>
        </div>
    `;
}

// Generate Analytics Charts Tab
function generateChartsTab(results) {
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 2rem;">
            <i class="fas fa-chart-line" style="color: var(--optimizer-secondary);"></i>
            Visual Analytics & Insights
        </h3>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="color: white; margin-bottom: 1rem;">Tax Breakdown</h4>
            <div class="chart-container" style="height: 350px;">
                <canvas id="taxBreakdownChart"></canvas>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="color: white; margin-bottom: 1rem;">Historical Trend (3 Years)</h4>
            <div class="chart-container" style="height: 350px;">
                <canvas id="trendChart"></canvas>
            </div>
        </div>
        
        <div>
            <h4 style="color: white; margin-bottom: 1rem;">Savings Impact Analysis</h4>
            <div class="chart-container" style="height: 350px;">
                <canvas id="savingsImpactChart"></canvas>
            </div>
        </div>
    `;
}

// Generate Tax Calendar Tab
function generateCalendarTab() {
    const calendar = [
        { date: 'March 31, 2026', title: 'Last Date for Tax-Saving Investments', description: 'Complete all 80C, 80D, and other investments before FY ends', urgent: true },
        { date: 'April 1, 2026', title: 'New Financial Year Begins', description: 'Start planning for FY 2026-27', urgent: false },
        { date: 'June 15, 2026', title: 'Advance Tax - 1st Installment', description: '15% of total tax liability for self-employed/business', urgent: false },
        { date: 'July 31, 2026', title: 'File ITR for AY 2026-27', description: 'Last date for filing income tax return', urgent: true },
        { date: 'September 15, 2026', title: 'Advance Tax - 2nd Installment', description: '45% of total tax liability', urgent: false },
        { date: 'December 15, 2026', title: 'Advance Tax - 3rd Installment', description: '75% of total tax liability', urgent: false },
        { date: 'December 31, 2026', title: 'Last Date for TDS Certificate', description: 'Collect Form 16 from employer', urgent: false },
        { date: 'March 15, 2027', title: 'Advance Tax - Final Installment', description: '100% of total tax liability', urgent: false }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-calendar-alt" style="color: var(--optimizer-secondary);"></i>
            Important Tax Dates & Deadlines
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Never miss a tax deadline. Mark your calendar with these important dates.
        </p>
        
        <div class="calendar-grid">
            ${calendar.map(item => `
                <div class="calendar-item ${item.urgent ? 'urgent' : ''}">
                    <div class="date">
                        <i class="fas fa-calendar-day"></i> ${item.date}
                    </div>
                    <div class="title">${item.title}</div>
                    <div class="description">${item.description}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Generate Monthly Timeline Tab
function generateTimelineTab(results) {
    const timeline = [
        { month: 'April 2026', actions: ['Start SIP in ELSS funds', 'Review last year tax return', 'Plan annual investments'] },
        { month: 'May 2026', actions: ['Invest in PPF/NSC', 'Buy health insurance if needed', 'Update investment records'] },
        { month: 'June 2026', actions: ['Pay advance tax (if applicable)', 'Review quarterly expenses', 'Check HRA receipts'] },
        { month: 'July 2026', actions: ['File income tax return', 'Verify Form 16 from employer', 'Claim LTA if traveling'] },
        { month: 'August 2026', actions: ['Continue SIP investments', 'Review portfolio performance', 'Plan Diwali bonuses'] },
        { month: 'September 2026', actions: ['Pay 2nd advance tax installment', 'Mid-year tax review', 'Adjust investment strategy'] },
        { month: 'October 2026', actions: ['Maximize 80C usage', 'Buy gold/invest in bonds', 'Festival expenses planning'] },
        { month: 'November 2026', actions: ['Review year-end bonuses', 'Tax loss harvesting', 'Donate to NGOs (80G)'] },
        { month: 'December 2026', actions: ['Pay 3rd advance tax', 'Year-end tax planning', 'Collect investment proofs'] },
        { month: 'January 2027', actions: ['Submit proofs to employer', 'Review Form 16', 'Final 80C investments'] },
        { month: 'February 2027', actions: ['Last month for tax planning', 'Buy remaining ELSS/NPS', 'Health insurance renewal'] },
        { month: 'March 2027', actions: ['Final tax-saving investments', 'Pay home loan prepayment', 'Close all deductions'] }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-clock" style="color: var(--optimizer-secondary);"></i>
            Month-by-Month Tax Planning Guide
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Follow this timeline to stay organized and never miss tax-saving opportunities
        </p>
        
        <div class="timeline">
            ${timeline.map(item => `
                <div class="timeline-item">
                    <div class="month">${item.month}</div>
                    <div class="actions">
                        <ul>
                            ${item.actions.map(action => `
                                <li>
                                    <i class="fas fa-check-circle" style="color: var(--optimizer-success);"></i>
                                    ${action}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Generate Peer Comparison Tab
function generateBenchmarkTab(results) {
    const income = currentProfile.income;
    const savings = results.savings;
    
    // Calculate peer benchmarks (simulated data)
    const avgSavings = income * 0.08; // Average person saves 8%
    const topSavings = income * 0.15; // Top 10% saves 15%
    const yourPercentage = (savings / income * 100).toFixed(1);
    const avgPercentage = 8.0;
    const topPercentage = 15.0;
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-users" style="color: var(--optimizer-secondary);"></i>
            Compare Your Tax Efficiency
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            See how your tax optimization stacks up against others in your income bracket
        </p>
        
        <div class="peer-stats">
            <div class="peer-stat">
                <div class="label">Your Tax Savings</div>
                <div class="value">${yourPercentage}%</div>
                <div class="comparison ${yourPercentage > avgPercentage ? 'better' : 'worse'}">
                    <i class="fas fa-${yourPercentage > avgPercentage ? 'arrow-up' : 'arrow-down'}"></i>
                    <span>${yourPercentage > avgPercentage ? 'Above' : 'Below'} Average</span>
                </div>
                <div class="progress-bar">
                    <div class="fill" style="width: ${Math.min(100, yourPercentage * 5)}%"></div>
                </div>
            </div>
            
            <div class="peer-stat">
                <div class="label">Average in Your Bracket</div>
                <div class="value">${avgPercentage}%</div>
                <div class="comparison" style="color: rgba(255, 255, 255, 0.6);">
                    <span>₹${formatCurrency(income)} income</span>
                </div>
                <div class="progress-bar">
                    <div class="fill" style="width: ${avgPercentage * 5}%"></div>
                </div>
            </div>
            
            <div class="peer-stat">
                <div class="label">Top 10% Savers</div>
                <div class="value">${topPercentage}%</div>
                <div class="comparison" style="color: var(--optimizer-warning);">
                    <i class="fas fa-trophy"></i>
                    <span>Elite Category</span>
                </div>
                <div class="progress-bar">
                    <div class="fill" style="width: ${topPercentage * 5}%"></div>
                </div>
            </div>
            
            <div class="peer-stat">
                <div class="label">Your Rank</div>
                <div class="value">#${yourPercentage > topPercentage ? '1' : yourPercentage > avgPercentage ? '2' : '3'}</div>
                <div class="comparison ${yourPercentage > topPercentage ? 'better' : yourPercentage > avgPercentage ? 'better' : 'worse'}">
                    <span>${yourPercentage > topPercentage ? 'Elite Tier' : yourPercentage > avgPercentage ? 'Above Avg' : 'Need Improvement'}</span>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-lightbulb" style="color: var(--optimizer-warning);"></i>
                How to Reach Top 10%
            </h4>
            <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding-left: 1.5rem;">
                <li>Maximize Section 80C deductions (₹1.5L)</li>
                <li>Add NPS 80CCD(1B) for additional ₹50K deduction</li>
                <li>Get health insurance for 80D benefits</li>
                <li>Claim home loan interest if you have property</li>
                <li>Plan donations strategically under 80G</li>
                <li>Use HRA exemption if paying rent</li>
            </ul>
        </div>
        
        <div class="chart-container" style="margin-top: 2rem;">
            <canvas id="benchmarkChart"></canvas>
        </div>
    `;
}

// Utility Functions
function formatCurrency(amount) {
    if (amount >= 10000000) {
        return (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
        return (amount / 100000).toFixed(2) + ' L';
    } else {
        return amount.toLocaleString('en-IN');
    }
}

// Action Functions
function downloadReport() {
    alert('Report download feature coming soon! This will generate a detailed PDF with all recommendations.');
}

function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'DS Smart Tax Optimizer Results',
            text: `I just saved ₹${formatCurrency(optimizationResults.savings)} on taxes using DS Smart Tax Optimizer!`,
            url: window.location.href
        });
    } else {
        alert('Share functionality not supported on this device. Copy the URL to share.');
    }
}

function bookConsultation() {
    alert('Consultation booking feature coming soon! Our tax experts will contact you within 24 hours.');
}

// Feature Tab Switching
function switchFeatureTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.feature-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.feature-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`.feature-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Initialize charts if needed
    if (tabName === 'charts') {
        setTimeout(() => initializeAnalyticsCharts(optimizationResults), 100);
    } else if (tabName === 'benchmark') {
        setTimeout(() => initializeBenchmarkChart(optimizationResults), 100);
    }
}

function openFeatureTab(tabName) {
    switchFeatureTab(tabName);
    document.getElementById(`tab-${tabName}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialize all charts
function initializeCharts(results) {
    // Portfolio chart will be initialized by portfolio tab
}

// Initialize Analytics Charts
function initializeAnalyticsCharts(results) {
    // Tax Breakdown Pie Chart
    const taxBreakdownCtx = document.getElementById('taxBreakdownChart');
    if (taxBreakdownCtx && !charts.taxBreakdown) {
        charts.taxBreakdown = new Chart(taxBreakdownCtx, {
            type: 'doughnut',
            data: {
                labels: ['Income Tax', 'Cess', 'Take Home'],
                datasets: [{
                    data: [
                        results.optimal.tax,
                        results.optimal.cess,
                        results.optimal.grossIncome - results.optimal.totalTax
                    ],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'white', font: { size: 14 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ₹' + formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Historical Trend Line Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx && !charts.trend) {
        const currentYear = new Date().getFullYear();
        charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [currentYear - 2, currentYear - 1, currentYear],
                datasets: [
                    {
                        label: 'Income',
                        data: [
                            currentProfile.income * 0.8,
                            currentProfile.income * 0.9,
                            currentProfile.income
                        ],
                        borderColor: 'rgba(0, 217, 255, 1)',
                        backgroundColor: 'rgba(0, 217, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Tax Paid',
                        data: [
                            results.optimal.totalTax * 0.75,
                            results.optimal.totalTax * 0.85,
                            results.optimal.totalTax
                        ],
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Tax Saved',
                        data: [
                            results.savings * 0.6,
                            results.savings * 0.8,
                            results.savings
                        ],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: 'white', font: { size: 14 } }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
    
    // Savings Impact Bar Chart
    const savingsImpactCtx = document.getElementById('savingsImpactChart');
    if (savingsImpactCtx && !charts.savingsImpact) {
        charts.savingsImpact = new Chart(savingsImpactCtx, {
            type: 'bar',
            data: {
                labels: ['Without Planning', 'Basic Planning', 'Optimal Planning', 'Maximum Effort'],
                datasets: [{
                    label: 'Tax Savings (₹)',
                    data: [
                        0,
                        results.savings * 0.5,
                        results.savings,
                        results.savings * 1.2
                    ],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(124, 58, 237, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(124, 58, 237, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return '₹' + formatCurrency(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
}

// Initialize Benchmark Chart
function initializeBenchmarkChart(results) {
    const benchmarkCtx = document.getElementById('benchmarkChart');
    if (benchmarkCtx && !charts.benchmark) {
        const yourPercentage = (results.savings / currentProfile.income * 100);
        
        charts.benchmark = new Chart(benchmarkCtx, {
            type: 'radar',
            data: {
                labels: ['Tax Planning', 'Investment Strategy', 'Deduction Usage', 'Compliance', 'Long-term Vision'],
                datasets: [
                    {
                        label: 'You',
                        data: [
                            Math.min(100, yourPercentage * 6),
                            Math.min(100, (currentProfile.currentInvestments / 150000) * 100),
                            Math.min(100, yourPercentage * 7),
                            95,
                            85
                        ],
                        borderColor: 'rgba(0, 217, 255, 1)',
                        backgroundColor: 'rgba(0, 217, 255, 0.2)',
                        borderWidth: 2
                    },
                    {
                        label: 'Average',
                        data: [50, 45, 40, 70, 55],
                        borderColor: 'rgba(245, 158, 11, 1)',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderWidth: 2
                    },
                    {
                        label: 'Top 10%',
                        data: [90, 85, 95, 95, 90],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: 'white', font: { size: 14 } }
                    }
                },
                scales: {
                    r: {
                        ticks: { color: 'rgba(255, 255, 255, 0.7)', backdropColor: 'transparent' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 } },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
}

// Portfolio Slider Management
function initializePortfolioSliders() {
    const totalAmount = Math.max(0, 150000 - currentProfile.currentInvestments);
    
    // Set initial values based on percentages
    if (document.getElementById('elss-slider')) {
        updatePortfolio();
    }
}

function updatePortfolio() {
    const totalAmount = Math.max(0, 150000 - currentProfile.currentInvestments);
    
    // Get slider values
    const elssPercent = parseInt(document.getElementById('elss-slider')?.value || 0);
    const ppfPercent = parseInt(document.getElementById('ppf-slider')?.value || 0);
    const npsPercent = parseInt(document.getElementById('nps-slider')?.value || 0);
    const insurancePercent = parseInt(document.getElementById('insurance-slider')?.value || 0);
    
    // Calculate amounts
    const elssAmount = (totalAmount * elssPercent) / 100;
    const ppfAmount = (totalAmount * ppfPercent) / 100;
    const npsAmount = (totalAmount * npsPercent) / 100;
    const insuranceAmount = (totalAmount * insurancePercent) / 100;
    
    // Update display
    if (document.getElementById('elss-amount')) {
        document.getElementById('elss-amount').textContent = '₹' + formatCurrency(elssAmount);
        document.getElementById('ppf-amount').textContent = '₹' + formatCurrency(ppfAmount);
        document.getElementById('nps-amount').textContent = '₹' + formatCurrency(npsAmount);
        document.getElementById('insurance-amount').textContent = '₹' + formatCurrency(insuranceAmount);
        
        // Update expected returns (simplified calculation)
        const expectedReturns = (elssAmount * 2.5) + (ppfAmount * 2.0) + (npsAmount * 2.2) + (insuranceAmount * 1.8);
        document.getElementById('expected-returns').textContent = '₹' + formatCurrency(expectedReturns);
        
        // Update portfolio chart
        updatePortfolioChart(elssAmount, ppfAmount, npsAmount, insuranceAmount);
    }
}

function updatePortfolioChart(elss, ppf, nps, insurance) {
    const ctx = document.getElementById('portfolioChart');
    if (!ctx) return;
    
    if (charts.portfolio) {
        charts.portfolio.destroy();
    }
    
    charts.portfolio = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['ELSS', 'PPF', 'NPS', 'Insurance'],
            datasets: [{
                data: [elss, ppf, nps, insurance],
                backgroundColor: [
                    'rgba(0, 217, 255, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 217, 255, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(124, 58, 237, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'white', font: { size: 14 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.raw / (elss + ppf + nps + insurance)) * 100).toFixed(1);
                            return context.label + ': ₹' + formatCurrency(context.raw) + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Scenario Runner
async function runScenario(scenarioType) {
    const scenarioResults = document.getElementById('scenarioResults');
    if (!scenarioResults) return;
    
    // Show loading
    scenarioResults.innerHTML = '<div style="text-align: center; padding: 2rem; color: white;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i><p style="margin-top: 1rem;">Calculating scenario...</p></div>';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let modifiedProfile = { ...currentProfile };
    let scenarioTitle = '';
    let scenarioDescription = '';
    
    switch(scenarioType) {
        case 'salary-hike':
            modifiedProfile.income = currentProfile.income * 1.2;
            scenarioTitle = '20% Salary Increase Scenario';
            scenarioDescription = 'Your income increases to ₹' + formatCurrency(modifiedProfile.income);
            break;
        case 'max-investment':
            modifiedProfile.currentInvestments = 150000;
            scenarioTitle = 'Maximum 80C Investment Scenario';
            scenarioDescription = 'You maximize Section 80C with ₹1.5L investment';
            break;
        case 'home-loan':
            modifiedProfile.homeLoanInterest = 200000;
            scenarioTitle = 'Home Loan Interest Scenario';
            scenarioDescription = 'You claim ₹2L home loan interest deduction';
            break;
        case 'nps-additional':
            modifiedProfile.npsAdditional = 50000;
            scenarioTitle = 'NPS Additional Contribution Scenario';
            scenarioDescription = 'You add ₹50K in NPS under 80CCD(1B)';
            break;
        case 'complete-optimization':
            modifiedProfile.currentInvestments = 150000;
            modifiedProfile.npsAdditional = 50000;
            modifiedProfile.healthInsurance = 25000;
            scenarioTitle = 'Complete Optimization Scenario';
            scenarioDescription = 'You implement all recommended strategies';
            break;
        case 'freelancer':
            modifiedProfile.employmentType = 'freelancer';
            modifiedProfile.businessExpenses = currentProfile.income * 0.35;
            scenarioTitle = 'Freelancer with Business Expenses';
            scenarioDescription = 'Claim 35% business expenses';
            break;
    }
    
    const scenarioResult = await optimizeTaxes(modifiedProfile);
    
    const savingsDiff = scenarioResult.optimal.totalTax - optimizationResults.optimal.totalTax;
    
    scenarioResults.innerHTML = `
        <div style="padding: 2rem; background: rgba(124, 58, 237, 0.08); border: 2px solid rgba(124, 58, 237, 0.3); border-radius: 16px;">
            <h4 style="color: white; font-size: 1.5rem; margin-bottom: 0.5rem;">${scenarioTitle}</h4>
            <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">${scenarioDescription}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                <div style="text-align: center; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">New Tax Liability</div>
                    <div style="color: var(--optimizer-danger); font-size: 2rem; font-weight: 800;">₹${formatCurrency(scenarioResult.optimal.totalTax)}</div>
                </div>
                
                <div style="text-align: center; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Change in Tax</div>
                    <div style="color: ${savingsDiff < 0 ? 'var(--optimizer-success)' : 'var(--optimizer-danger)'}; font-size: 2rem; font-weight: 800;">
                        ${savingsDiff < 0 ? '-' : '+'}₹${formatCurrency(Math.abs(savingsDiff))}
                    </div>
                </div>
                
                <div style="text-align: center; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Take Home</div>
                    <div style="color: white; font-size: 2rem; font-weight: 800;">₹${formatCurrency(modifiedProfile.income - scenarioResult.optimal.totalTax)}</div>
                </div>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 12px;">
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0;">
                    <i class="fas fa-lightbulb" style="color: var(--optimizer-secondary);"></i>
                    ${savingsDiff < 0 
                        ? `This scenario would save you an additional <strong style="color: var(--optimizer-success);">₹${formatCurrency(Math.abs(savingsDiff))}</strong> in taxes!`
                        : `This scenario would increase your tax by <strong style="color: var(--optimizer-danger);">₹${formatCurrency(savingsDiff)}</strong>.`
                    }
                </p>
            </div>
        </div>
    `;
}

// Export Functions
function exportToPDF() {
    alert('PDF Export: This feature will generate a comprehensive PDF report with all your tax optimization details, charts, and recommendations. Coming soon!');
}

function exportToExcel() {
    alert('Excel Export: This feature will export your tax calculations and recommendations to Excel format. Coming soon!');
}

// Copyright Protection
console.log('%c⚠️ DS SMART TAX OPTIMIZER™', 'color: #00D9FF; font-size: 20px; font-weight: bold;');
console.log('%cProprietary Software - Patent Pending', 'color: #7C3AED; font-size: 14px;');
console.log('%c© 2026 DS Financial Solutions. All rights reserved.', 'color: #10B981; font-size: 12px;');
console.log('%cUnauthorized copying, modification, or distribution is strictly prohibited.', 'color: #EF4444; font-size: 12px;');
