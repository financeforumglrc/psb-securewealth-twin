/** Ordinary resident income, FY 2025-26 / AY 2026-27.
 * Source: https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1
 * Special-rate capital gains are outside this slab calculation.
 * UMD keeps the browser calculators and API on the same calculation engine.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.IncomeTax = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const newSlabs = [[400000, 0], [800000, .05], [1200000, .10], [1600000, .15], [2000000, .20], [2400000, .25], [Infinity, .30]];
    function oldSlabs(ageCategory) {
        const exempt = ageCategory === 'super-senior' ? 500000 : ageCategory === 'senior' ? 300000 : 250000;
        return [[exempt, 0], [500000, .05], [1000000, .20], [Infinity, .30]];
    }
    function slabTax(income, slabs) {
        let tax = 0, lower = 0;
        for (const [upper, rate] of slabs) {
            tax += Math.max(0, Math.min(income, upper) - lower) * rate;
            lower = upper;
            if (income <= upper) break;
        }
        return tax;
    }
    function surchargeRate(income, regime) {
        return income > 50000000 && regime === 'old' ? .37 : income > 20000000 ? .25 : income > 10000000 ? .15 : income > 5000000 ? .10 : 0;
    }
    function calculate(taxableIncome, options = {}) {
        const income = Number(taxableIncome);
        if (!Number.isFinite(income) || income < 0) throw new RangeError('Income must be a finite, non-negative amount.');
        const regime = options.regime === 'old' ? 'old' : 'new';
        const slabs = regime === 'new' ? newSlabs : oldSlabs(options.ageCategory);
        const baseTax = slabTax(income, slabs);
        const resident = options.resident !== false;
        const rebate = resident && income <= (regime === 'new' ? 1200000 : 500000)
            ? Math.min(baseTax, regime === 'new' ? 60000 : 12500) : 0;
        let tax = baseTax - rebate;
        // Section 87A marginal relief above the new-regime rebate threshold.
        const rebateRelief = resident && regime === 'new' && income > 1200000 ? Math.max(0, tax - (income - 1200000)) : 0;
        tax -= rebateRelief;
        let surcharge = tax * surchargeRate(income, regime);
        let surchargeRelief = 0;
        for (const threshold of regime === 'old' ? [5000000, 10000000, 20000000, 50000000] : [5000000, 10000000, 20000000]) {
            if (income > threshold) {
                const limitTax = slabTax(threshold, slabs) * (1 + surchargeRate(threshold, regime));
                surchargeRelief = Math.max(surchargeRelief, tax + surcharge - limitTax - (income - threshold));
            }
        }
        surcharge = Math.max(0, surcharge - surchargeRelief);
        const cess = (tax + surcharge) * .04;
        return { baseTax, tax, rebate, marginalRelief: rebateRelief + surchargeRelief, surcharge, cess, totalTax: Math.round(tax + surcharge + cess) };
    }
    return { calculate, newSlabs, oldSlabs, financialYear: '2025-26' };
});
