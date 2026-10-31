const { getQuote } = require('./market-data');
const { scrapeCompany } = require('./screener-service');

const entities = {
    TMCV: {
        ticker: 'TMCV', yahooTicker: 'TMCV.NS', name: 'Tata Motors Limited — commercial vehicles',
        scope: 'Commercial vehicles and related consolidated operations',
        corporateAction: 'Commercial vehicle demerger effective 2025-10-01; listed separately on 2025-11-12. Legacy Tata Motors group history is not automatically comparable.',
        sources: [
            { id: 'tmcv-ar26', title: 'Tata Motors CV integrated annual report FY2025–26', publisher: 'Tata Motors Limited', kind: 'company-filing', url: 'https://cv.tatamotors.com/assets/cv/files/AnnualReportFY26.pdf', period: 'FY2026' },
            { id: 'tmcv-demerger', title: 'Q2 FY26 results and separate listing disclosure', publisher: 'Tata Motors Limited', kind: 'company-disclosure', url: 'https://cv.tatamotors.com/news/tata-motors-limited-formerly-tml-commercial-vehicles-ltd-Q2-FY26-results-commercial-vehicles-segment-financials' }
        ]
    },
    TMPV: {
        ticker: 'TMPV', yahooTicker: 'TMPV.NS', name: 'Tata Motors Passenger Vehicles Limited',
        scope: 'Passenger vehicles, electric vehicles and JLR consolidated operations',
        corporateAction: 'Legacy Tata Motors was renamed after the 2025 commercial vehicle demerger. Use restated continuing-operation comparatives from the selected filing.',
        sources: [
            { id: 'tmpv-ar26', title: 'Tata Motors Passenger Vehicles annual report FY2025–26', publisher: 'NSE corporate filing', kind: 'exchange-filing', url: 'https://nsearchives.nseindia.com/annual_reports/AR_29395_TMPV_2025_2026_A_21445169_15062026215933.pdf', period: 'FY2026' },
            { id: 'tmpv-announcements', title: 'NSE issuer announcements — TMPV', publisher: 'National Stock Exchange of India', kind: 'exchange-disclosures', url: 'https://www.nseindia.com/companies-listing/corporate-filings-announcements?symbol=TMPV&tabIndex=equity' }
        ]
    }
};

function normalize(symbol) {
    const ticker = String(symbol || '').trim().toUpperCase().replace(/^TATA MOTORS$/, 'TATAMOTORS').replace(/\.(NS|BO)$/, '');
    if (!/^[A-Z0-9][A-Z0-9&-]{0,29}$/.test(ticker)) throw new Error('Use a listed-company ticker without URL characters.');
    return ticker;
}

function resolveEntity(symbol) {
    const ticker = normalize(symbol);
    if (['TATAMOTORS', 'TATA MOTORS'].includes(ticker)) return { needsEntitySelection: true, candidates: Object.values(entities), message: 'Select commercial vehicles (TMCV) or passenger vehicles / JLR (TMPV). Do not combine a post-demerger share price with the legacy group financials.' };
    return { needsEntitySelection: false, entity: entities[ticker] || { ticker, yahooTicker: String(symbol).trim().toUpperCase().endsWith('.BO') ? ticker + '.BO' : ticker + '.NS', name: ticker, scope: 'Confirm reporting scope against primary filings', sources: [] } };
}

async function companyResearch(symbol, options = {}) {
    const identity = resolveEntity(symbol);
    if (identity.needsEntitySelection) return identity;
    const entity = identity.entity;
    const outcomes = await Promise.allSettled([
        getQuote(entity.yahooTicker),
        options.includeFundamentals ? scrapeCompany(entity.ticker) : Promise.resolve(null)
    ]);
    const quote = outcomes[0].status === 'fulfilled' ? outcomes[0].value : null;
    const fundamentals = outcomes[1].status === 'fulfilled' ? outcomes[1].value : null;
    const accessedAt = new Date().toISOString();
    return {
        entity, accessedAt, needsEntitySelection: false,
        quote: quote ? { ...quote, role: 'market-reference', sourceUrl: 'https://finance.yahoo.com/quote/' + encodeURIComponent(entity.yahooTicker), independentlyVerified: false } : null,
        fundamentals: fundamentals ? { ...fundamentals, role: 'secondary-financial-data', independentlyVerified: false, warning: 'Cross-check every material input against the company filing; secondary data is not a substitute for audited statements.' } : null,
        primarySources: entity.sources.map(source => ({ ...source, accessedAt, financialValuesExtracted: false })),
        availability: { quote: quote ? 'available' : 'unavailable', fundamentals: fundamentals ? 'available' : options.includeFundamentals ? 'unavailable' : 'not-requested', primaryFinancials: 'requires-extraction-and-reconciliation' },
        warnings: [entity.corporateAction, !quote ? 'No quote was returned; enter a dated market reference manually.' : null, !entity.sources.length ? 'No curated primary filings are attached to this issuer yet. Add official company or exchange filings to the research record.' : null].filter(Boolean)
    };
}

const providerDirectory = [
    { id: 'company-filings', role: 'Primary financial statements and disclosures', access: 'Public documents where the issuer publishes them', reliability: 'Primary evidence; still reconcile scope, periods, units and corporate actions' },
    { id: 'nse-bse', role: 'Listed Indian issuer filings and corporate actions', access: 'Public disclosure portals; automated access may be restricted', reliability: 'Primary exchange disclosures; no guarantee of unlimited API access' },
    { id: 'yahoo', role: 'Market prices and price history', access: 'Best-effort public endpoints; no guaranteed service or redistribution right', reliability: 'Show currency, exchange and market timestamp; may be delayed or unavailable' },
    { id: 'screener', role: 'Indian company discovery and secondary financial tables', access: 'Public pages subject to Screener terms', reliability: 'Cross-check against filings; never silently treat as independently verified' },
    { id: 'mca', role: 'Indian unlisted-company statutory filings and master data', access: 'Availability varies; document access may require an account or fees', reliability: 'No complete free coverage of all unlisted companies' },
    { id: 'user-filings', role: 'Private or unlisted-company financial statements', access: 'User-supplied documents', reliability: 'Record document provenance and reconcile before using in a report' }
];
module.exports = { normalize, resolveEntity, companyResearch, providerDirectory };
