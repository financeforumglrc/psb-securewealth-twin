/**
 * DCF engine — single source of truth for DCF valuation.
 * FCFF methodology with Gordon Growth terminal value.
 *
 * computeDCFFromParams() is the pure core; computeDCF() adapts a full model
 * JSON to it, and routes/services delegate here rather than duplicating math.
 */

/**
 * Compound annual growth rate.
 * @param {number} end — ending value
 * @param {number} start — starting value
 * @param {number} years — number of years spanned (e.g. proj[0]→proj[4] is 4)
 */
function cagr(end, start, years) {
    if (!(start > 0) || !(end > 0) || !(years > 0)) return 0;
    return Math.pow(end / start, 1 / years) - 1;
}

/**
 * Core DCF: FCFF forecast + Gordon growth terminal value, discounted at WACC,
 * then bridged from enterprise value to equity value and per-share value.
 *
 * FCFF = NOPAT + D&A − CapEx − ΔWorkingCapital
 *   NOPAT = (EBITDA − D&A) × (1 − taxRate)
 *   D&A, CapEx are % of revenue; ΔWC is % of the revenue change.
 * TV = FCFF_last × (1 + g) / (wacc − g), discounted back `horizon` years.
 *
 * @param {Object} p
 *   baseRevenue   — year-0 revenue
 *   growthRates   — array of per-year revenue growth decimals (length >= horizon)
 *   ebitdaMargin  — decimal
 *   taxRate       — decimal
 *   daPct         — D&A as % of revenue (default 0.03)
 *   capexPct      — CapEx as % of revenue (default 0.05)
 *   wcPct         — ΔWC as % of Δrevenue (default 0.03)
 *   wacc          — decimal
 *   terminalGrowth— decimal (must be < wacc)
 *   horizon       — forecast years (default 5)
 *   netDebt       — total debt − cash (same currency units as revenue)
 *   shares        — shares outstanding (per-share = equity / shares)
 * @returns {Object} { valid, error?, forecast, pvFcff, terminalValue,
 *   pvTerminal, enterpriseValue, equityValue, perShareValue }
 */
function computeDCFFromParams(p) {
    const horizon = p.horizon || 5;
    const daPct = p.daPct !== undefined ? p.daPct : 0.03;
    const capexPct = p.capexPct !== undefined ? p.capexPct : 0.05;
    const wcPct = p.wcPct !== undefined ? p.wcPct : 0.03;
    const netDebt = p.netDebt || 0;
    const shares = p.shares || 1;
    const growthRates = p.growthRates || [];

    const invalid = (error) => ({
        valid: false,
        error,
        forecast: [],
        pvFcff: NaN,
        terminalValue: NaN,
        pvTerminal: NaN,
        enterpriseValue: NaN,
        equityValue: NaN,
        perShareValue: NaN,
    });

    if (!Number.isFinite(p.baseRevenue) || !Number.isFinite(p.ebitdaMargin)) {
        return invalid('Missing base revenue or EBITDA margin');
    }
    if (!Number.isFinite(p.wacc) || !Number.isFinite(p.terminalGrowth) || !(p.wacc > p.terminalGrowth)) {
        return invalid('WACC must be greater than terminal growth rate');
    }

    // ---- Build FCFF forecast ----
    const forecast = [];
    let revenue = p.baseRevenue;
    let pvFcff = 0;
    for (let year = 1; year <= horizon; year++) {
        const prevRevenue = revenue;
        const growth = Number.isFinite(growthRates[year - 1]) ? growthRates[year - 1] : 0;
        revenue = revenue * (1 + growth);
        const ebitda = revenue * p.ebitdaMargin;
        const da = revenue * daPct;
        const ebit = ebitda - da;
        const nopat = ebit * (1 - (p.taxRate || 0));
        const capex = revenue * capexPct;
        const wcChange = (revenue - prevRevenue) * wcPct;
        const fcff = nopat + da - capex - wcChange;
        pvFcff += fcff / Math.pow(1 + p.wacc, year);
        forecast.push({ year, revenue, ebitda, ebit, nopat, depreciation: da, capex, wc_change: wcChange, fcff });
    }

    // ---- Terminal Value (Gordon Growth, grown exactly once) ----
    const terminalFcff = forecast[horizon - 1].fcff * (1 + p.terminalGrowth);
    const terminalValue = terminalFcff / (p.wacc - p.terminalGrowth);
    const pvTerminal = terminalValue / Math.pow(1 + p.wacc, horizon);

    // ---- Enterprise value → equity bridge ----
    const enterpriseValue = pvFcff + pvTerminal;
    const equityValue = enterpriseValue - netDebt;
    const perShareValue = equityValue / shares;

    return {
        valid: true,
        forecast,
        pvFcff,
        terminalValue,
        pvTerminal,
        enterpriseValue,
        equityValue,
        perShareValue,
    };
}

/**
 * @param {Object} model — the full model JSON
 * @returns {Object} { enterprise_value, equity_value, per_share_value, _computed: true, _details: {} }
 */
function computeDCF(model) {
    const dcf = model.dcf || {};
    const settings = model.settings || {};
    const isData = model.statements?.income_statement || {};
    const bsData = model.statements?.balance_sheet?.FY24 || {};
    const estimates = model.estimates || {};

    // ---- Base-year (FY24) financials ----
    const fy24 = isData.FY24 || [];
    const getVal = (idPart) => fy24.find(i => i.id && i.id.includes(idPart))?.value || 0;

    const revenue = getVal('revenue');
    const ebitda = getVal('ebitda') || getVal('operating_profit');
    const depreciation = getVal('depreciation');
    const pat = getVal('pat');

    if (!revenue || !ebitda) {
        return {
            enterprise_value: { value: 0, unit: 'INR_CR' },
            equity_value: { value: 0, unit: 'INR_CR' },
            per_share_value: { value: 0, unit: 'INR' },
            _computed: true,
            _error: 'Missing base-year revenue or EBITDA',
        };
    }

    const ebit = ebitda - depreciation;
    const taxRate = (settings.tax_rate?.value || 25.17) / 100;
    const nopat = ebit * (1 - taxRate);

    // ---- Assumptions ----
    const wacc = (dcf.wacc?.value || 10.5) / 100;
    const g = (dcf.terminal_growth?.value || 3.5) / 100;
    const horizon = dcf.horizon_years || 5;

    // ---- Balance sheet bridge ----
    const totalDebt = bsData.total_debt || 0;
    const cash = bsData.cash_and_investments || 0;
    const shares = bsData.shares_outstanding || 1;
    const netDebt = totalDebt - cash;

    // ---- Forecast assumptions (estimates) ----
    const revenueGrowth = estimates.revenue_growth || 0.08;
    const capexPct = estimates.capex_pct || 0.05;
    const wcPct = estimates.working_capital_pct || 0.03;

    const core = computeDCFFromParams({
        baseRevenue: revenue,
        growthRates: Array(horizon).fill(revenueGrowth),
        ebitdaMargin: ebitda / revenue,
        taxRate,
        daPct: depreciation / revenue,
        capexPct,
        wcPct,
        wacc,
        terminalGrowth: g,
        horizon,
        netDebt,
        shares,
    });

    if (!core.valid) {
        return {
            enterprise_value: { value: 0, unit: 'INR_CR' },
            equity_value: { value: 0, unit: 'INR_CR' },
            per_share_value: { value: 0, unit: 'INR' },
            _computed: true,
            _error: core.error,
        };
    }

    const fcffs = core.forecast.map(f => ({
        year: f.year,
        revenue: Math.round(f.revenue),
        ebitda: Math.round(f.ebitda),
        nopat: Math.round(f.nopat),
        depreciation: Math.round(f.depreciation),
        capex: Math.round(f.capex),
        wc_change: Math.round(f.wc_change),
        fcff: Math.round(f.fcff),
    }));

    return {
        enterprise_value: { value: Math.round(core.enterpriseValue), unit: 'INR_CR' },
        equity_value: { value: Math.round(core.equityValue), unit: 'INR_CR' },
        per_share_value: { value: Math.round(core.perShareValue), unit: 'INR' },
        _computed: true,
        _method: 'simplified_fcff',
        _details: {
            base_year: { revenue, ebitda, depreciation, ebit, nopat: Math.round(nopat) },
            assumptions: { wacc: wacc * 100, g: g * 100, tax_rate: taxRate * 100, horizon },
            estimates: { revenue_growth: revenueGrowth, capex_pct: capexPct, wc_pct: wcPct },
            forecast: fcffs,
            terminal_value: Math.round(core.terminalValue),
            pv_fcff: Math.round(core.pvFcff),
            pv_terminal: Math.round(core.pvTerminal),
            net_debt: Math.round(netDebt),
            shares_outstanding: shares,
        },
    };
}

module.exports = { computeDCF, computeDCFFromParams, cagr };
