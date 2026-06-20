/**
 * PREMIUM FEATURES - DS SMART TAX OPTIMIZER™
 * Copyright © 2026 DS Financial Solutions
 * Form 16 Parser, Capital Gains, Family Planning, Retirement, and more
 */

// ============= FORM 16 ANALYZER =============
window.generateForm16Tab = function() {
    const form16Data = {
        employer: 'ABC Technologies Pvt Ltd',
        tan: 'DELA12345F',
        pan: 'ABCDE1234F',
        grossSalary: 1800000,
        standardDeduction: 50000,
        section80C: 125000,
        section80D: 25000,
        hra: 72000,
        profTax: 2400,
        taxDeducted: 185000,
        verified: true
    };
    
    const taxableIncome = form16Data.grossSalary - form16Data.standardDeduction - form16Data.section80C - form16Data.section80D - form16Data.hra - form16Data.profTax;
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-file-invoice" style="color: var(--optimizer-secondary);"></i>
            Form 16 Analyzer
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Upload and analyze your Form 16 for discrepancies and optimization opportunities
        </p>
        
        <div style="padding: 2rem; border: 2px dashed var(--optimizer-secondary); border-radius: 16px; text-align: center; margin-bottom: 2rem; cursor: pointer; transition: all 0.3s;" 
             onclick="document.getElementById('form16Upload').click()"
             onmouseover="this.style.background='rgba(0, 217, 255, 0.1)'"
             onmouseout="this.style.background='transparent'">
            <input type="file" id="form16Upload" accept=".pdf" style="display: none;" onchange="parseForm16(this)">
            <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--optimizer-secondary); margin-bottom: 1rem;"></i>
            <div style="color: white; font-weight: 700; margin-bottom: 0.5rem;">Upload Form 16 PDF</div>
            <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Click or drag & drop to upload</div>
        </div>
        
        <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                <i class="fas fa-check-circle" style="color: var(--optimizer-success); font-size: 1.5rem;"></i>
                <div>
                    <div style="color: white; font-weight: 700;">${form16Data.employer}</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">TAN: ${form16Data.tan} | PAN: ${form16Data.pan}</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; text-align: center;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Gross Salary</div>
                    <div style="color: white; font-size: 1.25rem; font-weight: 700;">₹${(form16Data.grossSalary/100000).toFixed(1)}L</div>
                </div>
                <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; text-align: center;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Total Deductions</div>
                    <div style="color: var(--optimizer-success); font-size: 1.25rem; font-weight: 700;">₹${((form16Data.standardDeduction + form16Data.section80C + form16Data.section80D + form16Data.hra + form16Data.profTax)/100000).toFixed(1)}L</div>
                </div>
                <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; text-align: center;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">Taxable Income</div>
                    <div style="color: var(--optimizer-warning); font-size: 1.25rem; font-weight: 700;">₹${(taxableIncome/100000).toFixed(1)}L</div>
                </div>
                <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; text-align: center;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.25rem;">TDS Deducted</div>
                    <div style="color: var(--optimizer-secondary); font-size: 1.25rem; font-weight: 700;">₹${(form16Data.taxDeducted/100000).toFixed(1)}L</div>
                </div>
            </div>
        </div>
        
        <h4 style="color: white; margin-bottom: 1rem;">Deduction Breakdown</h4>
        <div style="display: grid; gap: 0.75rem; margin-bottom: 2rem;">
            ${[
                { name: 'Standard Deduction', amount: form16Data.standardDeduction, limit: 50000 },
                { name: 'Section 80C', amount: form16Data.section80C, limit: 150000 },
                { name: 'Section 80D (Health)', amount: form16Data.section80D, limit: 25000 },
                { name: 'HRA Exemption', amount: form16Data.hra, limit: 100000 },
                { name: 'Professional Tax', amount: form16Data.profTax, limit: 2500 }
            ].map(d => `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: white; font-weight: 600;">${d.name}</span>
                            <span style="color: var(--optimizer-secondary); font-weight: 700;">₹${d.amount.toLocaleString()}</span>
                        </div>
                        <div style="height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${(d.amount/d.limit)*100}%; background: ${(d.amount/d.limit) >= 1 ? 'var(--optimizer-success)' : 'var(--gradient-neon)'}; border-radius: 3px;"></div>
                        </div>
                        <div style="margin-top: 0.25rem; color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">
                            ${((d.amount/d.limit)*100).toFixed(0)}% of ₹${d.limit.toLocaleString()} limit ${(d.amount/d.limit) < 1 ? `• Gap: ₹${(d.limit - d.amount).toLocaleString()}` : '• ✓ Maxed'}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 1.5rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px;">
            <h4 style="color: var(--optimizer-warning); margin-bottom: 1rem;">
                <i class="fas fa-lightbulb"></i> Missing Deductions Found!
            </h4>
            <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
                <li><strong>80C Gap:</strong> Invest ₹25,000 more to save ₹7,500 in taxes</li>
                <li><strong>NPS 80CCD1B:</strong> Missing! Invest ₹50,000 to save ₹15,000</li>
                <li><strong>Consider New Regime:</strong> May save ₹18,000 with your profile</li>
            </ul>
        </div>
    `;
};

function parseForm16(input) {
    if (input.files.length > 0) {
        alert(`Form 16 "${input.files[0].name}" uploaded!\n\nParsing PDF... This is a demo. In production, we use OCR to extract salary details, deductions, and TDS information automatically.`);
    }
}

// ============= CAPITAL GAINS CALCULATOR =============
window.generateCapitalGainsTab = function() {
    const transactions = [
        { asset: 'ELSS Mutual Fund', type: 'Equity', buyDate: '2023-04-15', sellDate: '2026-04-20', buyPrice: 100000, sellPrice: 165000, holding: 'LTCG' },
        { asset: 'Gold ETF', type: 'Gold', buyDate: '2024-06-01', sellDate: '2026-01-10', buyPrice: 50000, sellPrice: 58000, holding: 'STCG' },
        { asset: 'Property (Plot)', type: 'Real Estate', buyDate: '2020-08-15', sellDate: '2026-03-01', buyPrice: 2000000, sellPrice: 3500000, holding: 'LTCG' },
        { asset: 'Stocks (Infosys)', type: 'Equity', buyDate: '2025-09-01', sellDate: '2026-01-15', buyPrice: 80000, sellPrice: 92000, holding: 'STCG' }
    ];
    
    let totalLTCG = 0, totalSTCG = 0, totalTax = 0;
    
    transactions.forEach(t => {
        const gain = t.sellPrice - t.buyPrice;
        if (t.holding === 'LTCG') {
            if (t.type === 'Equity') {
                const taxableGain = Math.max(0, gain - 100000); // 1L exemption
                totalLTCG += gain;
                totalTax += taxableGain * 0.10;
            } else if (t.type === 'Real Estate') {
                totalLTCG += gain;
                totalTax += gain * 0.20; // With indexation benefit
            } else {
                totalLTCG += gain;
                totalTax += gain * 0.20;
            }
        } else {
            totalSTCG += gain;
            totalTax += gain * 0.15;
        }
    });
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-coins" style="color: var(--optimizer-secondary);"></i>
            Capital Gains Calculator
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Calculate LTCG & STCG on equity, mutual funds, property, and gold
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Long Term Gains (LTCG)</div>
                <div style="color: var(--optimizer-success); font-size: 2rem; font-weight: 800;">₹${(totalLTCG/100000).toFixed(2)}L</div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-top: 0.25rem;">Held > 1 year (Equity) / 2 years</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Short Term Gains (STCG)</div>
                <div style="color: var(--optimizer-warning); font-size: 2rem; font-weight: 800;">₹${(totalSTCG/100000).toFixed(2)}L</div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-top: 0.25rem;">Held < 1 year (Equity) / 2 years</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Total Tax Payable</div>
                <div style="color: var(--optimizer-danger); font-size: 2rem; font-weight: 800;">₹${(totalTax/100000).toFixed(2)}L</div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-top: 0.25rem;">LTCG 10%/20% | STCG 15%/Slab</div>
            </div>
        </div>
        
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; min-width: 700px;">
                <thead>
                    <tr style="background: rgba(124, 58, 237, 0.2);">
                        <th style="padding: 1rem; text-align: left; color: white; font-weight: 700;">Asset</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Type</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Buy Price</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Sell Price</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Gain</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Category</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Tax</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => {
                        const gain = t.sellPrice - t.buyPrice;
                        let tax = 0;
                        if (t.holding === 'LTCG') {
                            if (t.type === 'Equity') tax = Math.max(0, gain - 100000) * 0.10;
                            else tax = gain * 0.20;
                        } else {
                            tax = gain * 0.15;
                        }
                        return `
                            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <td style="padding: 1rem; color: white;">
                                    <div style="font-weight: 600;">${t.asset}</div>
                                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5);">${t.buyDate} → ${t.sellDate}</div>
                                </td>
                                <td style="padding: 1rem; text-align: center; color: rgba(255, 255, 255, 0.8);">${t.type}</td>
                                <td style="padding: 1rem; text-align: right; color: rgba(255, 255, 255, 0.8);">₹${t.buyPrice.toLocaleString()}</td>
                                <td style="padding: 1rem; text-align: right; color: rgba(255, 255, 255, 0.8);">₹${t.sellPrice.toLocaleString()}</td>
                                <td style="padding: 1rem; text-align: right; color: ${gain > 0 ? 'var(--optimizer-success)' : 'var(--optimizer-danger)'}; font-weight: 700;">
                                    ${gain > 0 ? '+' : ''}₹${gain.toLocaleString()}
                                </td>
                                <td style="padding: 1rem; text-align: center;">
                                    <span style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; ${
                                        t.holding === 'LTCG' ? 'background: rgba(16, 185, 129, 0.2); color: var(--optimizer-success);' : 'background: rgba(245, 158, 11, 0.2); color: var(--optimizer-warning);'
                                    }">${t.holding}</span>
                                </td>
                                <td style="padding: 1rem; text-align: right; color: var(--optimizer-danger); font-weight: 700;">₹${tax.toLocaleString()}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-lightbulb" style="color: var(--optimizer-secondary);"></i>
                Tax Saving Tips
            </h4>
            <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
                <li><strong>₹1L LTCG exemption:</strong> Equity LTCG up to ₹1L is tax-free annually</li>
                <li><strong>Indexation benefit:</strong> Apply to property/gold for lower LTCG</li>
                <li><strong>Section 54:</strong> Reinvest property gains to save entire tax</li>
                <li><strong>Harvest losses:</strong> Book losses to offset gains before March 31</li>
            </ul>
        </div>
    `;
};

// ============= FAMILY TAX PLANNING =============
window.generateFamilyTaxTab = function() {
    const familyMembers = [
        { name: 'You (Self)', age: 35, income: 1500000, tax: 234000, optimized: 156000, savings: 78000, status: 'primary' },
        { name: 'Spouse', age: 32, income: 800000, tax: 52000, optimized: 31000, savings: 21000, status: 'spouse' },
        { name: 'Father (Senior)', age: 65, income: 400000, tax: 0, optimized: 0, savings: 0, status: 'senior' },
        { name: 'Mother (Senior)', age: 62, income: 300000, tax: 0, optimized: 0, savings: 0, status: 'senior' }
    ];
    
    const totalFamilyIncome = familyMembers.reduce((sum, m) => sum + m.income, 0);
    const totalCurrentTax = familyMembers.reduce((sum, m) => sum + m.tax, 0);
    const totalOptimizedTax = familyMembers.reduce((sum, m) => sum + m.optimized, 0);
    const totalSavings = totalCurrentTax - totalOptimizedTax;
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-users" style="color: var(--optimizer-secondary);"></i>
            Family Tax Planning
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Optimize taxes for your entire family with income splitting and gift strategies
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Total Family Income</div>
                <div style="color: var(--optimizer-secondary); font-size: 2rem; font-weight: 800;">₹${(totalFamilyIncome/100000).toFixed(1)}L</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Current Family Tax</div>
                <div style="color: var(--optimizer-danger); font-size: 2rem; font-weight: 800;">₹${(totalCurrentTax/100000).toFixed(1)}L</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Potential Savings</div>
                <div style="color: var(--optimizer-success); font-size: 2rem; font-weight: 800;">₹${(totalSavings/100000).toFixed(1)}L</div>
            </div>
        </div>
        
        <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
            ${familyMembers.map(m => `
                <div style="padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 16px; ${m.status === 'primary' ? 'border: 2px solid var(--optimizer-secondary);' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: ${
                                m.status === 'primary' ? 'var(--gradient-neon)' : 
                                m.status === 'spouse' ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' :
                                'linear-gradient(135deg, #F59E0B, #EF4444)'
                            }; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                                ${m.name.charAt(0)}
                            </div>
                            <div>
                                <div style="color: white; font-weight: 700;">${m.name}</div>
                                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.875rem;">Age: ${m.age} years</div>
                            </div>
                        </div>
                        ${m.status === 'senior' ? '<span style="padding: 0.25rem 0.75rem; background: rgba(245, 158, 11, 0.2); color: var(--optimizer-warning); border-radius: 20px; font-size: 0.75rem; font-weight: 700;">SENIOR CITIZEN</span>' : ''}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">Income</div>
                            <div style="color: white; font-weight: 700;">₹${(m.income/100000).toFixed(1)}L</div>
                        </div>
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">Current Tax</div>
                            <div style="color: var(--optimizer-danger); font-weight: 700;">₹${(m.tax/1000).toFixed(0)}K</div>
                        </div>
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">Optimized</div>
                            <div style="color: var(--optimizer-success); font-weight: 700;">₹${(m.optimized/1000).toFixed(0)}K</div>
                        </div>
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">You Save</div>
                            <div style="color: var(--optimizer-secondary); font-weight: 700;">₹${(m.savings/1000).toFixed(0)}K</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 1.5rem; background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-magic" style="color: var(--optimizer-primary);"></i>
                Family Tax Optimization Strategies
            </h4>
            <div style="display: grid; gap: 1rem;">
                <div style="display: flex; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <i class="fas fa-gift" style="color: var(--optimizer-secondary); font-size: 1.5rem;"></i>
                    <div>
                        <div style="color: white; font-weight: 600;">Gift to Parents</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">Transfer funds to senior citizen parents - they get higher exemption limits and no clubbing</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <i class="fas fa-heartbeat" style="color: var(--optimizer-success); font-size: 1.5rem;"></i>
                    <div>
                        <div style="color: white; font-weight: 600;">Family Health Insurance</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">Get 80D for self (₹25K) + parents (₹50K senior) = ₹75K total deduction</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <i class="fas fa-home" style="color: var(--optimizer-warning); font-size: 1.5rem;"></i>
                    <div>
                        <div style="color: white; font-weight: 600;">Joint Home Loan</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">Both spouses claim ₹2L interest deduction each = ₹4L total family deduction</div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// ============= RETIREMENT CALCULATOR =============
window.generateRetirementTab = function() {
    const currentAge = 35;
    const retirementAge = 60;
    const currentSavings = 2000000;
    const monthlyContribution = 25000;
    const expectedReturn = 12;
    const yearsToRetire = retirementAge - currentAge;
    
    // Calculate future value
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToRetire * 12;
    const futureValue = currentSavings * Math.pow(1 + expectedReturn/100, yearsToRetire) + 
                        monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    const monthlyPension = futureValue * 0.04 / 12; // 4% withdrawal rule
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-umbrella-beach" style="color: var(--optimizer-secondary);"></i>
            Retirement Planning Calculator
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Plan your retirement with tax-efficient NPS, PPF, and ELSS investments
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div style="padding: 2rem; background: rgba(255, 255, 255, 0.05); border-radius: 16px;">
                <h4 style="color: white; margin-bottom: 1.5rem;">Your Inputs</h4>
                <div style="display: grid; gap: 1rem;">
                    <div>
                        <label style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Current Age</label>
                        <div style="color: white; font-size: 1.5rem; font-weight: 700;">${currentAge} years</div>
                    </div>
                    <div>
                        <label style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Retirement Age</label>
                        <div style="color: white; font-size: 1.5rem; font-weight: 700;">${retirementAge} years</div>
                    </div>
                    <div>
                        <label style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Current Retirement Savings</label>
                        <div style="color: var(--optimizer-secondary); font-size: 1.5rem; font-weight: 700;">₹${(currentSavings/100000).toFixed(1)}L</div>
                    </div>
                    <div>
                        <label style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Monthly Investment</label>
                        <div style="color: var(--optimizer-success); font-size: 1.5rem; font-weight: 700;">₹${monthlyContribution.toLocaleString()}</div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 2rem; background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(124, 58, 237, 0.1)); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 16px;">
                <h4 style="color: white; margin-bottom: 1.5rem;">Your Retirement Corpus</h4>
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="color: rgba(255, 255, 255, 0.6); margin-bottom: 0.5rem;">At Age ${retirementAge}</div>
                    <div style="font-size: 3rem; font-weight: 900; background: var(--gradient-neon); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        ₹${(futureValue/10000000).toFixed(2)} Cr
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center;">
                    <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">Monthly Pension</div>
                        <div style="color: var(--optimizer-success); font-size: 1.25rem; font-weight: 700;">₹${Math.round(monthlyPension).toLocaleString()}</div>
                    </div>
                    <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">Years to Retire</div>
                        <div style="color: var(--optimizer-warning); font-size: 1.25rem; font-weight: 700;">${yearsToRetire} years</div>
                    </div>
                </div>
            </div>
        </div>
        
        <h4 style="color: white; margin-bottom: 1rem;">Tax-Efficient Retirement Allocation</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            ${[
                { name: 'NPS (80CCD1B)', allocation: 50000, taxSaving: 15000, returns: '10-12%', icon: 'fa-piggy-bank', color: 'var(--optimizer-secondary)' },
                { name: 'PPF (80C)', allocation: 150000, taxSaving: 46800, returns: '7.1%', icon: 'fa-lock', color: 'var(--optimizer-success)' },
                { name: 'ELSS (80C)', allocation: 100000, taxSaving: 31200, returns: '12-15%', icon: 'fa-chart-line', color: 'var(--optimizer-warning)' },
                { name: 'EPF (80C)', allocation: 100000, taxSaving: 31200, returns: '8.1%', icon: 'fa-building', color: 'var(--optimizer-primary)' }
            ].map(inv => `
                <div style="padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 16px; border-left: 4px solid ${inv.color};">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                        <i class="fas ${inv.icon}" style="color: ${inv.color}; font-size: 1.25rem;"></i>
                        <div style="color: white; font-weight: 700;">${inv.name}</div>
                    </div>
                    <div style="display: grid; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Annual</span>
                            <span style="color: white; font-weight: 600;">₹${(inv.allocation/1000).toFixed(0)}K</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Tax Save</span>
                            <span style="color: var(--optimizer-success); font-weight: 600;">₹${(inv.taxSaving/1000).toFixed(0)}K</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Returns</span>
                            <span style="color: ${inv.color}; font-weight: 600;">${inv.returns}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-calculator" style="color: var(--optimizer-success);"></i>
                Total Tax Savings on Retirement Investments
            </h4>
            <div style="font-size: 2.5rem; font-weight: 900; color: var(--optimizer-success); margin-bottom: 0.5rem;">
                ₹1,24,200/year
            </div>
            <div style="color: rgba(255, 255, 255, 0.7);">
                80C (₹1.5L) + 80CCD1B (₹50K) = ₹2L deductions at 30% bracket + 4% cess
            </div>
        </div>
    `;
};

// ============= TAX AUDIT RISK ANALYZER =============
window.generateAuditRiskTab = function() {
    const riskFactors = [
        { factor: 'Income vs Expenses Ratio', status: 'low', score: 15, description: 'Your expenses are proportional to income' },
        { factor: 'Cash Transactions', status: 'low', score: 10, description: 'No large cash transactions detected' },
        { factor: 'Deductions Claimed', status: 'medium', score: 45, description: 'High deductions relative to income - keep documents ready' },
        { factor: 'ITR Filing History', status: 'low', score: 5, description: 'Consistent filing for past 5 years' },
        { factor: 'TDS Mismatch', status: 'low', score: 8, description: 'Form 26AS matches with claimed TDS' },
        { factor: 'High Value Transactions', status: 'low', score: 12, description: 'No SFT triggers from banks/registrar' }
    ];
    
    const totalRiskScore = riskFactors.reduce((sum, f) => sum + f.score, 0);
    const riskLevel = totalRiskScore < 50 ? 'Low' : totalRiskScore < 80 ? 'Medium' : 'High';
    const riskColor = totalRiskScore < 50 ? 'var(--optimizer-success)' : totalRiskScore < 80 ? 'var(--optimizer-warning)' : 'var(--optimizer-danger)';
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-shield-alt" style="color: var(--optimizer-secondary);"></i>
            Tax Audit Risk Analyzer
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            AI-powered analysis of your audit risk based on ITR patterns
        </p>
        
        <div style="text-align: center; padding: 3rem 2rem; background: rgba(255, 255, 255, 0.05); border-radius: 24px; margin-bottom: 2rem;">
            <div style="width: 180px; height: 180px; margin: 0 auto 1.5rem; position: relative;">
                <svg width="180" height="180" style="transform: rotate(-90deg);">
                    <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="16"/>
                    <circle cx="90" cy="90" r="80" fill="none" stroke="${riskColor}" stroke-width="16" 
                        stroke-dasharray="${(totalRiskScore / 100) * 502} 502" 
                        stroke-linecap="round"/>
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                    <div style="font-size: 3rem; font-weight: 900; color: ${riskColor};">${totalRiskScore}</div>
                    <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.6);">Risk Score</div>
                </div>
            </div>
            
            <div style="font-size: 1.75rem; font-weight: 800; color: ${riskColor}; margin-bottom: 0.5rem;">
                ${riskLevel} Risk
            </div>
            <div style="color: rgba(255, 255, 255, 0.7);">
                ${riskLevel === 'Low' ? 'Great! Your tax profile has minimal audit triggers.' :
                  riskLevel === 'Medium' ? 'Caution advised. Keep all documents ready for verification.' :
                  'High scrutiny expected. Consider professional consultation.'}
            </div>
        </div>
        
        <h4 style="color: white; margin-bottom: 1rem;">Risk Factor Breakdown</h4>
        <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
            ${riskFactors.map(f => `
                <div style="padding: 1.25rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid ${
                    f.status === 'low' ? 'var(--optimizer-success)' : 
                    f.status === 'medium' ? 'var(--optimizer-warning)' : 'var(--optimizer-danger)'
                };">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fas ${
                                f.status === 'low' ? 'fa-check-circle' : 
                                f.status === 'medium' ? 'fa-exclamation-circle' : 'fa-times-circle'
                            }" style="color: ${
                                f.status === 'low' ? 'var(--optimizer-success)' : 
                                f.status === 'medium' ? 'var(--optimizer-warning)' : 'var(--optimizer-danger)'
                            };"></i>
                            <span style="color: white; font-weight: 600;">${f.factor}</span>
                        </div>
                        <span style="color: ${
                            f.status === 'low' ? 'var(--optimizer-success)' : 
                            f.status === 'medium' ? 'var(--optimizer-warning)' : 'var(--optimizer-danger)'
                        }; font-weight: 700; text-transform: uppercase; font-size: 0.75rem;">${f.status} RISK</span>
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; padding-left: 2rem;">
                        ${f.description}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-shield-check" style="color: var(--optimizer-secondary);"></i>
                How to Reduce Audit Risk
            </h4>
            <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
                <li><strong>Maintain documentation</strong> for all deductions claimed</li>
                <li><strong>Match TDS</strong> with Form 26AS before filing</li>
                <li><strong>Avoid round figures</strong> in deductions - use actual amounts</li>
                <li><strong>Report all income</strong> including interest, dividends, capital gains</li>
                <li><strong>File on time</strong> - late filing increases scrutiny</li>
            </ul>
        </div>
    `;
};

// ============= MULTI-YEAR COMPARISON =============
window.generateMultiYearTab = function() {
    const yearData = [
        { year: 'FY 2022-23', income: 1200000, deductions: 180000, tax: 142000, refund: 0 },
        { year: 'FY 2023-24', income: 1350000, deductions: 195000, tax: 168000, refund: 12000 },
        { year: 'FY 2024-25', income: 1500000, deductions: 220000, tax: 198000, refund: 25000 },
        { year: 'FY 2025-26', income: 1650000, deductions: 250000, tax: 215000, refund: 0, current: true }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-chart-bar" style="color: var(--optimizer-secondary);"></i>
            Multi-Year Tax Comparison
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Track your tax efficiency trend over multiple financial years
        </p>
        
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                <thead>
                    <tr style="background: rgba(124, 58, 237, 0.2);">
                        <th style="padding: 1rem; text-align: left; color: white; font-weight: 700;">Financial Year</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Gross Income</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Deductions</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Tax Paid</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Effective Rate</th>
                        <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Refund</th>
                    </tr>
                </thead>
                <tbody>
                    ${yearData.map(y => `
                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); ${y.current ? 'background: rgba(0, 217, 255, 0.1);' : ''}">
                            <td style="padding: 1rem; color: white; font-weight: 600;">
                                ${y.year}
                                ${y.current ? '<span style="margin-left: 0.5rem; padding: 0.125rem 0.5rem; background: var(--optimizer-secondary); color: white; border-radius: 4px; font-size: 0.625rem;">CURRENT</span>' : ''}
                            </td>
                            <td style="padding: 1rem; text-align: right; color: rgba(255, 255, 255, 0.8);">₹${(y.income/100000).toFixed(1)}L</td>
                            <td style="padding: 1rem; text-align: right; color: var(--optimizer-success);">₹${(y.deductions/100000).toFixed(1)}L</td>
                            <td style="padding: 1rem; text-align: right; color: var(--optimizer-danger);">₹${(y.tax/100000).toFixed(1)}L</td>
                            <td style="padding: 1rem; text-align: right; color: var(--optimizer-warning);">${((y.tax/y.income)*100).toFixed(1)}%</td>
                            <td style="padding: 1rem; text-align: right; color: ${y.refund > 0 ? 'var(--optimizer-secondary)' : 'rgba(255, 255, 255, 0.5)'};">
                                ${y.refund > 0 ? '₹' + y.refund.toLocaleString() : '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Income Growth (3Y)</div>
                <div style="color: var(--optimizer-success); font-size: 2rem; font-weight: 800;">+37.5%</div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">₹12L → ₹16.5L</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Deductions Growth</div>
                <div style="color: var(--optimizer-secondary); font-size: 2rem; font-weight: 800;">+38.9%</div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">₹1.8L → ₹2.5L</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Effective Rate Trend</div>
                <div style="color: var(--optimizer-warning); font-size: 2rem; font-weight: 800;">-1.8%</div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">Better optimization!</div>
            </div>
        </div>
        
        <div style="padding: 1.5rem; background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-trophy" style="color: var(--optimizer-primary);"></i>
                Your Tax Efficiency Journey
            </h4>
            <div style="color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
                <p>🎯 <strong>Great Progress!</strong> Your effective tax rate has decreased from 11.8% to 13% despite income growth.</p>
                <p>💡 <strong>Insight:</strong> Deductions are growing faster than income - you're optimizing well!</p>
                <p>🚀 <strong>Next Goal:</strong> Increase 80C to full ₹1.5L to push effective rate below 12%.</p>
            </div>
        </div>
    `;
};

// ============= INVESTMENT COMPARISON =============
window.generateInvestmentCompareTab = function() {
    const investments = [
        { name: 'ELSS Mutual Funds', section: '80C', returns: 15, risk: 'High', liquidity: '3Y Lock-in', taxOnReturns: '10% LTCG', rating: 4.5 },
        { name: 'PPF', section: '80C', returns: 7.1, risk: 'Zero', liquidity: '15Y (Partial 7Y)', taxOnReturns: 'Tax-Free', rating: 4.8 },
        { name: 'NPS', section: '80CCD', returns: 10, risk: 'Medium', liquidity: 'Till 60', taxOnReturns: '60% Tax-Free', rating: 4.2 },
        { name: 'Tax Saver FD', section: '80C', returns: 6.5, risk: 'Zero', liquidity: '5Y Lock-in', taxOnReturns: 'Fully Taxable', rating: 3.5 },
        { name: 'ULIP', section: '80C', returns: 8, risk: 'Medium', liquidity: '5Y Lock-in', taxOnReturns: 'Tax-Free <2.5L', rating: 3.0 },
        { name: 'NSC', section: '80C', returns: 7.7, risk: 'Zero', liquidity: '5Y Lock-in', taxOnReturns: 'Taxable', rating: 3.8 }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-balance-scale" style="color: var(--optimizer-secondary);"></i>
            Investment Comparison Tool
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Compare all tax-saving investments by returns, risk, and tax treatment
        </p>
        
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                <thead>
                    <tr style="background: rgba(124, 58, 237, 0.2);">
                        <th style="padding: 1rem; text-align: left; color: white; font-weight: 700;">Investment</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Section</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Returns</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Risk</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Liquidity</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Tax on Returns</th>
                        <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Rating</th>
                    </tr>
                </thead>
                <tbody>
                    ${investments.map(inv => `
                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                            <td style="padding: 1rem; color: white; font-weight: 600;">${inv.name}</td>
                            <td style="padding: 1rem; text-align: center;">
                                <span style="padding: 0.25rem 0.75rem; background: rgba(0, 217, 255, 0.2); color: var(--optimizer-secondary); border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${inv.section}</span>
                            </td>
                            <td style="padding: 1rem; text-align: center; color: var(--optimizer-success); font-weight: 700;">${inv.returns}%</td>
                            <td style="padding: 1rem; text-align: center;">
                                <span style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; ${
                                    inv.risk === 'Zero' ? 'background: rgba(16, 185, 129, 0.2); color: var(--optimizer-success);' :
                                    inv.risk === 'Medium' ? 'background: rgba(245, 158, 11, 0.2); color: var(--optimizer-warning);' :
                                    'background: rgba(239, 68, 68, 0.2); color: var(--optimizer-danger);'
                                }">${inv.risk}</span>
                            </td>
                            <td style="padding: 1rem; text-align: center; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${inv.liquidity}</td>
                            <td style="padding: 1rem; text-align: center; color: ${inv.taxOnReturns.includes('Free') ? 'var(--optimizer-success)' : 'var(--optimizer-warning)'}; font-size: 0.875rem;">${inv.taxOnReturns}</td>
                            <td style="padding: 1rem; text-align: center;">
                                <div style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                                    ${Array.from({length: 5}, (_, i) => `
                                        <i class="fas fa-star" style="color: ${i < Math.floor(inv.rating) ? 'var(--optimizer-warning)' : 'rgba(255, 255, 255, 0.2)'}; font-size: 0.875rem;"></i>
                                    `).join('')}
                                    <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-left: 0.5rem;">${inv.rating}</span>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px;">
                <h4 style="color: var(--optimizer-success); margin-bottom: 1rem;">
                    <i class="fas fa-crown"></i> Best for Returns
                </h4>
                <div style="color: white; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">ELSS Mutual Funds</div>
                <div style="color: rgba(255, 255, 255, 0.7);">15% historical returns with shortest 3-year lock-in among 80C options</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.08); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 16px;">
                <h4 style="color: var(--optimizer-secondary); margin-bottom: 1rem;">
                    <i class="fas fa-shield-alt"></i> Best for Safety
                </h4>
                <div style="color: white; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">PPF</div>
                <div style="color: rgba(255, 255, 255, 0.7);">Government-backed, EEE tax status, and guaranteed 7.1% returns</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px;">
                <h4 style="color: var(--optimizer-primary); margin-bottom: 1rem;">
                    <i class="fas fa-star"></i> Best Overall
                </h4>
                <div style="color: white; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">NPS + ELSS Combo</div>
                <div style="color: rgba(255, 255, 255, 0.7);">Extra ₹50K deduction under 80CCD1B plus market-linked returns</div>
            </div>
        </div>
    `;
};

// ============= REMINDER SYSTEM =============
window.generateRemindersTab = function() {
    const reminders = [
        { title: 'Advance Tax - Q4', date: 'March 15, 2026', days: 48, type: 'tax', urgent: true },
        { title: 'Last Date for Tax Investments', date: 'March 31, 2026', days: 64, type: 'investment', urgent: true },
        { title: 'ITR Filing Deadline', date: 'July 31, 2026', days: 186, type: 'filing', urgent: false },
        { title: 'Link PAN-Aadhaar', date: 'June 30, 2026', days: 155, type: 'compliance', urgent: false },
        { title: 'Renew Health Insurance', date: 'April 15, 2026', days: 79, type: 'insurance', urgent: false }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-bell" style="color: var(--optimizer-secondary);"></i>
            Smart Tax Reminders
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Never miss a tax deadline with WhatsApp, Email, and Browser notifications
        </p>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
            <button onclick="enableWhatsAppReminders()" style="flex: 1; min-width: 200px; padding: 1rem 1.5rem; background: linear-gradient(135deg, #25D366, #128C7E); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
                <i class="fab fa-whatsapp" style="font-size: 1.25rem;"></i>
                Enable WhatsApp Alerts
            </button>
            <button onclick="enableEmailReminders()" style="flex: 1; min-width: 200px; padding: 1rem 1.5rem; background: linear-gradient(135deg, #EA4335, #FBBC04); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
                <i class="fas fa-envelope" style="font-size: 1.25rem;"></i>
                Enable Email Alerts
            </button>
            <button onclick="enableBrowserNotifications()" style="flex: 1; min-width: 200px; padding: 1rem 1.5rem; background: var(--gradient-neon); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
                <i class="fas fa-bell" style="font-size: 1.25rem;"></i>
                Enable Push Notifications
            </button>
        </div>
        
        <h4 style="color: white; margin-bottom: 1rem;">Upcoming Deadlines</h4>
        <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
            ${reminders.map(r => `
                <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; ${r.urgent ? 'border-left: 4px solid var(--optimizer-danger);' : 'border-left: 4px solid var(--optimizer-secondary);'}">
                    <div style="width: 56px; height: 56px; border-radius: 12px; background: ${
                        r.type === 'tax' ? 'linear-gradient(135deg, #EF4444, #DC2626)' :
                        r.type === 'investment' ? 'linear-gradient(135deg, #10B981, #059669)' :
                        r.type === 'filing' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' :
                        r.type === 'compliance' ? 'linear-gradient(135deg, #F59E0B, #D97706)' :
                        'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                    }; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem;">
                        <i class="fas ${
                            r.type === 'tax' ? 'fa-rupee-sign' :
                            r.type === 'investment' ? 'fa-piggy-bank' :
                            r.type === 'filing' ? 'fa-file-alt' :
                            r.type === 'compliance' ? 'fa-link' :
                            'fa-heartbeat'
                        }"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="color: white; font-weight: 700; margin-bottom: 0.25rem;">${r.title}</div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                            <i class="fas fa-calendar"></i> ${r.date}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: ${r.days < 60 ? 'var(--optimizer-danger)' : 'var(--optimizer-secondary)'}; font-size: 1.5rem; font-weight: 800;">${r.days}</div>
                        <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">days left</div>
                    </div>
                    ${r.urgent ? '<span style="padding: 0.25rem 0.75rem; background: rgba(239, 68, 68, 0.2); color: var(--optimizer-danger); border-radius: 20px; font-size: 0.75rem; font-weight: 700;">URGENT</span>' : ''}
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-plus-circle" style="color: var(--optimizer-secondary);"></i>
                Add Custom Reminder
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end;">
                <div>
                    <label style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Reminder Title</label>
                    <input type="text" placeholder="e.g., Invest in ELSS" style="width: 100%; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white;">
                </div>
                <div>
                    <label style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Due Date</label>
                    <input type="date" style="width: 100%; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white;">
                </div>
                <button onclick="addCustomReminder()" style="padding: 0.75rem 1.5rem; background: var(--gradient-neon); border: none; border-radius: 8px; color: white; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
    `;
};

function enableWhatsAppReminders() {
    alert('WhatsApp Reminders:\n\nYou will receive tax deadline reminders on WhatsApp!\n\nFeatures:\n• 7 days, 3 days, and 1 day before deadline\n• Monthly tax tips\n• Important tax law changes\n\nThis is a demo - integrate with WhatsApp Business API.');
}

function enableEmailReminders() {
    alert('Email Reminders Enabled!\n\nYou will receive:\n• Weekly tax planning digest\n• Deadline reminders\n• Personalized saving tips\n\nThis is a demo feature.');
}

function enableBrowserNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('DS Tax Optimizer', {
                    body: 'Push notifications enabled! You\'ll never miss a tax deadline.',
                    icon: '/favicon.ico'
                });
            }
        });
    }
}

function addCustomReminder() {
    alert('Custom reminder added!\n\nYou will be notified via your preferred channels.\n\nThis is a demo feature.');
}

console.log('%c💎 PREMIUM FEATURES LOADED', 'color: #FFB800; font-size: 18px; font-weight: bold;');
console.log('%c📊 Form 16 | Capital Gains | Family Tax | Retirement | Audit Risk | Multi-Year | Investments | Reminders', 'color: #00D9FF; font-size: 12px;');
