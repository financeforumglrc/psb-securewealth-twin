/**
 * ULTRA-ADVANCED FEATURES - DS SMART TAX OPTIMIZER™
 * Copyright © 2026 DS Financial Solutions
 * Advance Tax, Tax Loss Harvesting, Refund Tracker, Salary Optimizer, and more
 */

// ============= ADVANCE TAX CALCULATOR =============
window.generateAdvanceTaxTab = function(results) {
    const totalTax = results.optimal.totalTax;
    const installments = [
        { date: 'June 15, 2026', percentage: 15, amount: totalTax * 0.15, status: 'upcoming' },
        { date: 'September 15, 2026', percentage: 45, amount: totalTax * 0.45, status: 'upcoming' },
        { date: 'December 15, 2026', percentage: 75, amount: totalTax * 0.75, status: 'upcoming' },
        { date: 'March 15, 2027', percentage: 100, amount: totalTax, status: 'upcoming' }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-calendar-check" style="color: var(--optimizer-secondary);"></i>
            Advance Tax Payment Schedule
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Quarterly advance tax installments for self-employed and business income
        </p>
        
        <div style="display: grid; gap: 1.5rem; margin-bottom: 2rem;">
            ${installments.map((inst, index) => `
                <div style="padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-left: 4px solid var(--optimizer-secondary); border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <div style="color: white; font-weight: 700; font-size: 1.125rem; margin-bottom: 0.25rem;">
                                Installment ${index + 1} - ${inst.percentage}%
                            </div>
                            <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                                <i class="fas fa-calendar"></i> Due: ${inst.date}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: var(--optimizer-warning); font-size: 1.75rem; font-weight: 800;">
                                ₹${formatCurrency(inst.amount)}
                            </div>
                            <button onclick="markAdvanceTaxPaid(${index})" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: var(--gradient-neon); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.875rem;">
                                <i class="fas fa-check"></i> Mark as Paid
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.875rem;">
                        <span style="color: rgba(255, 255, 255, 0.7);">
                            <i class="fas fa-percent"></i> Cumulative: ${inst.percentage}%
                        </span>
                        <span style="color: rgba(255, 255, 255, 0.7);">
                            <i class="fas fa-coins"></i> Total: ₹${formatCurrency(inst.amount)}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 1.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px;">
            <h4 style="color: var(--optimizer-danger); margin-bottom: 1rem;">
                <i class="fas fa-exclamation-triangle"></i> Important Notes
            </h4>
            <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
                <li>Interest @1% per month charged on delayed payments</li>
                <li>Advance tax mandatory if liability exceeds ₹10,000</li>
                <li>TDS/TCS can be adjusted against advance tax</li>
                <li>No advance tax needed for salaried if TDS is adequate</li>
            </ul>
        </div>
    `;
};

function markAdvanceTaxPaid(index) {
    alert(`Installment ${index + 1} marked as paid! This is a demo - integrate with payment gateway for actual payments.`);
}

// ============= TAX LOSS HARVESTING TRACKER =============
window.generateTaxLossTab = function() {
    const holdings = [
        { stock: 'Reliance Industries', buyPrice: 2500, currentPrice: 2300, quantity: 10, loss: 2000, type: 'LTCG' },
        { stock: 'Infosys', buyPrice: 1600, currentPrice: 1750, quantity: 5, loss: -750, type: 'STCG' },
        { stock: 'TCS', buyPrice: 3800, currentPrice: 3600, quantity: 8, loss: 1600, type: 'LTCG' },
        { stock: 'HDFC Bank', buyPrice: 1700, currentPrice: 1650, quantity: 12, loss: 600, type: 'STCG' }
    ];
    
    const totalLoss = holdings.filter(h => h.loss > 0).reduce((sum, h) => sum + h.loss, 0);
    const taxSaved = totalLoss * 0.10; // Assuming 10% LTCG tax
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-chart-line" style="color: var(--optimizer-secondary);"></i>
            Tax Loss Harvesting Opportunities
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Optimize capital gains tax by harvesting losses on underperforming stocks
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="padding: 1.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Total Unrealized Loss</div>
                <div style="color: var(--optimizer-danger); font-size: 2rem; font-weight: 800;">₹${formatCurrency(totalLoss)}</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Potential Tax Savings</div>
                <div style="color: var(--optimizer-success); font-size: 2rem; font-weight: 800;">₹${formatCurrency(taxSaved)}</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Holdings to Review</div>
                <div style="color: var(--optimizer-secondary); font-size: 2rem; font-weight: 800;">${holdings.filter(h => h.loss > 0).length}</div>
            </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: rgba(124, 58, 237, 0.2);">
                    <th style="padding: 1rem; text-align: left; color: white; font-weight: 700;">Stock</th>
                    <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Buy Price</th>
                    <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">Current</th>
                    <th style="padding: 1rem; text-align: right; color: white; font-weight: 700;">P&L</th>
                    <th style="padding: 1rem; text-align: center; color: white; font-weight: 700;">Action</th>
                </tr>
            </thead>
            <tbody>
                ${holdings.map(stock => `
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <td style="padding: 1rem; color: white;">
                            <div style="font-weight: 600;">${stock.stock}</div>
                            <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">${stock.type} • ${stock.quantity} shares</div>
                        </td>
                        <td style="padding: 1rem; text-align: right; color: rgba(255, 255, 255, 0.8);">₹${stock.buyPrice}</td>
                        <td style="padding: 1rem; text-align: right; color: rgba(255, 255, 255, 0.8);">₹${stock.currentPrice}</td>
                        <td style="padding: 1rem; text-align: right; color: ${stock.loss > 0 ? 'var(--optimizer-danger)' : 'var(--optimizer-success)'}; font-weight: 700;">
                            ${stock.loss > 0 ? '-' : '+'}₹${formatCurrency(Math.abs(stock.loss))}
                        </td>
                        <td style="padding: 1rem; text-align: center;">
                            ${stock.loss > 0 ? `
                                <button onclick="harvestLoss('${stock.stock}')" style="padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.2); border: 1px solid var(--optimizer-danger); border-radius: 8px; color: var(--optimizer-danger); cursor: pointer; font-size: 0.875rem;">
                                    <i class="fas fa-cut"></i> Harvest
                                </button>
                            ` : `
                                <span style="color: var(--optimizer-success); font-size: 0.875rem;">
                                    <i class="fas fa-check-circle"></i> Profitable
                                </span>
                            `}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-lightbulb" style="color: var(--optimizer-secondary);"></i>
                Tax Loss Harvesting Strategy
            </h4>
            <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
                <li><strong>Book losses before March 31</strong> to offset capital gains</li>
                <li><strong>Rebuy after 24 hours</strong> to maintain position (wash sale rule)</li>
                <li><strong>LTCG losses</strong> can only offset LTCG, not STCG</li>
                <li><strong>Carry forward losses</strong> for 8 years if not utilized</li>
            </ul>
        </div>
    `;
};

function harvestLoss(stock) {
    alert(`Tax Loss Harvesting for ${stock}:\n\n1. Sell current holdings to book loss\n2. Wait 24 hours to avoid wash sale\n3. Rebuy at current price to maintain position\n4. Use loss to offset capital gains\n\nThis is a demo - consult your broker for actual transactions.`);
}

// ============= REFUND STATUS TRACKER =============
window.generateRefundTab = function() {
    const refundStatus = {
        year: '2025-26',
        filingDate: 'July 15, 2026',
        refundAmount: 45800,
        status: 'Processing',
        stage: 2,
        stages: [
            { name: 'ITR Filed', status: 'completed', date: 'July 15, 2026' },
            { name: 'ITR Processed', status: 'completed', date: 'July 20, 2026' },
            { name: 'Refund Determined', status: 'current', date: 'Pending' },
            { name: 'Refund Sent to Bank', status: 'pending', date: 'Pending' },
            { name: 'Refund Credited', status: 'pending', date: 'Pending' }
        ]
    };
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-money-check-alt" style="color: var(--optimizer-secondary);"></i>
            ITR Refund Status Tracker
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Track your income tax refund status in real-time
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
            <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Expected Refund</div>
                <div style="color: var(--optimizer-success); font-size: 2.5rem; font-weight: 900;">₹${formatCurrency(refundStatus.refundAmount)}</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Current Status</div>
                <div style="color: var(--optimizer-secondary); font-size: 1.25rem; font-weight: 700;">${refundStatus.status}</div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.5rem;">AY ${refundStatus.year}</div>
            </div>
            <div style="padding: 1.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-bottom: 0.5rem;">Filing Date</div>
                <div style="color: var(--optimizer-warning); font-size: 1.125rem; font-weight: 700;">${refundStatus.filingDate}</div>
            </div>
        </div>
        
        <div style="position: relative; padding: 2rem 0;">
            ${refundStatus.stages.map((stage, index) => `
                <div style="display: flex; align-items: start; gap: 1.5rem; margin-bottom: 2rem; position: relative;">
                    <div style="position: relative; z-index: 1;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; ${
                            stage.status === 'completed' ? 'background: var(--gradient-neon); color: white;' :
                            stage.status === 'current' ? 'background: rgba(245, 158, 11, 0.2); border: 3px solid var(--optimizer-warning); color: var(--optimizer-warning);' :
                            'background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.5);'
                        }">
                            <i class="fas ${
                                stage.status === 'completed' ? 'fa-check' :
                                stage.status === 'current' ? 'fa-spinner fa-spin' :
                                'fa-clock'
                            }"></i>
                        </div>
                        ${index < refundStatus.stages.length - 1 ? `
                            <div style="position: absolute; left: 50%; top: 48px; width: 2px; height: 40px; background: ${stage.status === 'completed' ? 'var(--optimizer-secondary)' : 'rgba(255, 255, 255, 0.1)'}; transform: translateX(-50%);"></div>
                        ` : ''}
                    </div>
                    <div style="flex: 1; padding-top: 0.5rem;">
                        <div style="color: white; font-weight: 700; font-size: 1.125rem; margin-bottom: 0.25rem;">${stage.name}</div>
                        <div style="color: ${stage.status === 'completed' ? 'var(--optimizer-success)' : 'rgba(255, 255, 255, 0.6)'}; font-size: 0.875rem;">
                            ${stage.date}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button onclick="checkRefundStatus()" style="flex: 1; padding: 1rem; background: var(--gradient-neon); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer;">
                <i class="fas fa-sync"></i> Refresh Status
            </button>
            <button onclick="downloadRefundReceipt()" style="flex: 1; padding: 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-weight: 700; cursor: pointer;">
                <i class="fas fa-download"></i> Download Receipt
            </button>
        </div>
    `;
};

function checkRefundStatus() {
    alert('Refund Status: Processing\n\nYour refund of ₹45,800 is being processed. Estimated credit date: February 5, 2026.\n\nThis is a demo - integrate with Income Tax API for real-time status.');
}

function downloadRefundReceipt() {
    alert('Downloading refund acknowledgment receipt...\n\nThis is a demo feature.');
}

// ============= SALARY STRUCTURE OPTIMIZER =============
window.generateSalaryOptimizerTab = function() {
    const ctc = 1500000;
    
    const currentStructure = {
        basic: ctc * 0.40,
        hra: ctc * 0.30,
        special: ctc * 0.20,
        pf: ctc * 0.10
    };
    
    const optimizedStructure = {
        basic: ctc * 0.40,
        hra: ctc * 0.30,
        lta: 30000,
        mealVouchers: 26400,
        phoneReimbursement: 36000,
        nps: 50000,
        special: ctc * 0.20 - 142400
    };
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-calculator" style="color: var(--optimizer-secondary);"></i>
            Salary Structure Optimizer
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Restructure your CTC components to maximize tax savings
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div style="padding: 1.5rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px;">
                <h4 style="color: white; margin-bottom: 1.5rem;">
                    <i class="fas fa-times-circle" style="color: var(--optimizer-danger);"></i>
                    Current Structure
                </h4>
                <div style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">Basic Salary</span>
                        <span style="color: white; font-weight: 700;">₹${formatCurrency(currentStructure.basic)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">HRA</span>
                        <span style="color: white; font-weight: 700;">₹${formatCurrency(currentStructure.hra)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">Special Allowance</span>
                        <span style="color: white; font-weight: 700;">₹${formatCurrency(currentStructure.special)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">PF Contribution</span>
                        <span style="color: white; font-weight: 700;">₹${formatCurrency(currentStructure.pf)}</span>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; text-align: center;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Taxable Income</div>
                    <div style="color: var(--optimizer-danger); font-size: 1.5rem; font-weight: 800;">₹${formatCurrency(ctc * 0.9)}</div>
                </div>
            </div>
            
            <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px;">
                <h4 style="color: white; margin-bottom: 1.5rem;">
                    <i class="fas fa-check-circle" style="color: var(--optimizer-success);"></i>
                    Optimized Structure
                </h4>
                <div style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">Basic Salary</span>
                        <span style="color: white; font-weight: 700;">₹${formatCurrency(optimizedStructure.basic)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">HRA</span>
                        <span style="color: white; font-weight: 700;">₹${formatCurrency(optimizedStructure.hra)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">LTA (Tax-free)</span>
                        <span style="color: var(--optimizer-success); font-weight: 700;">₹${formatCurrency(optimizedStructure.lta)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">Meal Vouchers (Tax-free)</span>
                        <span style="color: var(--optimizer-success); font-weight: 700;">₹${formatCurrency(optimizedStructure.mealVouchers)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">Phone (Tax-free)</span>
                        <span style="color: var(--optimizer-success); font-weight: 700;">₹${formatCurrency(optimizedStructure.phoneReimbursement)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">NPS Contribution</span>
                        <span style="color: var(--optimizer-success); font-weight: 700;">₹${formatCurrency(optimizedStructure.nps)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <span style="color: rgba(255, 255, 255, 0.8);">Special Allowance</span>
                        <span style="color: white; font-weight: 700;">₹${formatCurrency(optimizedStructure.special)}</span>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(16, 185, 129, 0.15); border-radius: 8px; text-align: center;">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Taxable Income</div>
                    <div style="color: var(--optimizer-success); font-size: 1.5rem; font-weight: 800;">₹${formatCurrency(ctc * 0.9 - 142400)}</div>
                    <div style="color: var(--optimizer-success); font-size: 0.875rem; margin-top: 0.5rem;">
                        <i class="fas fa-arrow-down"></i> Save ₹42,720 in taxes!
                    </div>
                </div>
            </div>
        </div>
        
        <div style="padding: 1.5rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-lightbulb" style="color: var(--optimizer-secondary);"></i>
                Request Salary Restructuring
            </h4>
            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">
                Share this optimized structure with your HR to reduce your tax burden. No change in CTC, only reallocation!
            </p>
            <button onclick="downloadSalaryStructure()" style="padding: 1rem 1.5rem; background: var(--gradient-neon); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer;">
                <i class="fas fa-file-download"></i> Download Proposal for HR
            </button>
        </div>
    `;
};

function downloadSalaryStructure() {
    alert('Salary restructuring proposal downloaded!\n\nShare this document with your HR department to optimize your CTC structure and save ₹42,720 annually.\n\nThis is a demo feature.');
}

// ============= TAX EFFICIENCY SCORE =============
window.generateTaxScoreTab = function(results) {
    // Calculate score based on multiple factors
    let score = 0;
    const factors = [];
    
    // 80C utilization (max 25 points)
    const c80Utilization = (currentProfile.currentInvestments / 150000) * 100;
    const c80Score = Math.min(25, (c80Utilization / 100) * 25);
    score += c80Score;
    factors.push({ name: '80C Utilization', score: c80Score, max: 25, percentage: c80Utilization.toFixed(0) });
    
    // Tax regime selection (max 15 points)
    const regimeScore = results.optimal.regime === 'Old Regime' && currentProfile.currentInvestments > 50000 ? 15 : 10;
    score += regimeScore;
    factors.push({ name: 'Regime Selection', score: regimeScore, max: 15, percentage: (regimeScore / 15 * 100).toFixed(0) });
    
    // Savings percentage (max 25 points)
    const savingsPercent = (results.savings / currentProfile.income) * 100;
    const savingsScore = Math.min(25, (savingsPercent / 15) * 25);
    score += savingsScore;
    factors.push({ name: 'Tax Savings %', score: savingsScore, max: 25, percentage: savingsPercent.toFixed(1) });
    
    // Planning ahead (max 15 points)
    const planningScore = 12;
    score += planningScore;
    factors.push({ name: 'Planning Ahead', score: planningScore, max: 15, percentage: 80 });
    
    // Compliance (max 10 points)
    const complianceScore = 10;
    score += complianceScore;
    factors.push({ name: 'Tax Compliance', score: complianceScore, max: 10, percentage: 100 });
    
    // Diversification (max 10 points)
    const diversificationScore = 7;
    score += diversificationScore;
    factors.push({ name: 'Investment Diversification', score: diversificationScore, max: 10, percentage: 70 });
    
    const totalScore = Math.round(score);
    const grade = totalScore >= 85 ? 'A+' : totalScore >= 75 ? 'A' : totalScore >= 65 ? 'B+' : totalScore >= 55 ? 'B' : 'C';
    const color = totalScore >= 85 ? 'var(--optimizer-success)' : totalScore >= 65 ? 'var(--optimizer-secondary)' : 'var(--optimizer-warning)';
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-trophy" style="color: var(--optimizer-secondary);"></i>
            Your Tax Efficiency Score
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Gamified scoring system to track your tax optimization performance
        </p>
        
        <div style="text-align: center; padding: 3rem 2rem; background: rgba(255, 255, 255, 0.05); border-radius: 24px; margin-bottom: 2rem;">
            <div style="width: 200px; height: 200px; margin: 0 auto 2rem; position: relative;">
                <svg width="200" height="200" style="transform: rotate(-90deg);">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="20"/>
                    <circle cx="100" cy="100" r="90" fill="none" stroke="${color}" stroke-width="20" 
                        stroke-dasharray="${(totalScore / 100) * 565} 565" 
                        stroke-linecap="round"
                        style="transition: stroke-dasharray 1s ease;"/>
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                    <div style="font-size: 4rem; font-weight: 900; color: ${color};">${totalScore}</div>
                    <div style="font-size: 1.25rem; color: rgba(255, 255, 255, 0.6);">out of 100</div>
                </div>
            </div>
            
            <div style="font-size: 3rem; font-weight: 900; color: ${color}; margin-bottom: 0.5rem;">Grade ${grade}</div>
            <div style="font-size: 1.125rem; color: rgba(255, 255, 255, 0.8);">
                ${totalScore >= 85 ? 'Excellent! You\'re a tax optimization expert!' :
                  totalScore >= 75 ? 'Great job! Minor improvements possible.' :
                  totalScore >= 65 ? 'Good! You can save more with better planning.' :
                  totalScore >= 55 ? 'Average. Significant room for improvement.' :
                  'Needs work. Follow our recommendations to improve.'}
            </div>
        </div>
        
        <h4 style="color: white; font-size: 1.25rem; margin-bottom: 1.5rem;">Score Breakdown</h4>
        <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
            ${factors.map(factor => `
                <div style="padding: 1.25rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="color: white; font-weight: 600;">${factor.name}</span>
                        <span style="color: var(--optimizer-secondary); font-weight: 700;">${Math.round(factor.score)}/${factor.max}</span>
                    </div>
                    <div style="height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${factor.percentage}%; background: var(--gradient-neon); border-radius: 4px; transition: width 1s ease;"></div>
                    </div>
                    <div style="margin-top: 0.5rem; color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                        ${factor.percentage}% optimized
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 1.5rem; background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-rocket" style="color: var(--optimizer-primary);"></i>
                How to Reach 100 Points
            </h4>
            <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
                ${c80Utilization < 100 ? '<li><strong>Max out 80C:</strong> Invest full ₹1.5L to gain ' + Math.round(25 - c80Score) + ' points</li>' : ''}
                ${savingsPercent < 15 ? '<li><strong>Increase savings:</strong> Target 15% tax savings rate for maximum points</li>' : ''}
                ${diversificationScore < 10 ? '<li><strong>Diversify investments:</strong> Spread across ELSS, PPF, NPS, insurance</li>' : ''}
                <li><strong>Follow all recommendations:</strong> Implement strategies from Overview tab</li>
                <li><strong>Plan early:</strong> Start tax planning in April, not March</li>
            </ul>
        </div>
    `;
};

// Helper functions
function formatCurrency(amount) {
    if (amount >= 10000000) {
        return (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
        return (amount / 100000).toFixed(2) + ' L';
    } else {
        return amount.toLocaleString('en-IN');
    }
}

console.log('%c🔥 ULTRA-ADVANCED FEATURES LOADED', 'color: #FF6B00; font-size: 18px; font-weight: bold;');
console.log('%c💎 Advance Tax | Tax Loss | Refund Tracker | Salary Optimizer | Tax Score', 'color: #FFB800; font-size: 12px;');
