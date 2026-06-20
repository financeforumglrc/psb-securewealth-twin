const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('https://dsf-tools-hub.surge.sh/financial-modelling.html?v=19', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Fill inputs and run analysis
    await page.fill('#companyName', 'Reliance Industries');
    await page.fill('#price', '2500');
    await page.fill('#shares', '100');
    await page.fill('#baseRev', '500');
    await page.fill('#growth1', '12');
    await page.fill('#growth2', '10');
    await page.fill('#ebitdaMargin', '22');
    await page.fill('#wacc', '10');
    await page.fill('#tgr', '3');
    await page.fill('#netDebt', '500');
    await page.fill('#taxRate', '25');

    await page.click('#runBtn');
    await page.waitForTimeout(5000);

    // Check all new and existing chart canvases
    const tabs = [
        { tab: 'dividend', canvas: 'dividendChart' },
        { tab: 'management', canvas: 'mgmtChart' },
        { tab: 'industry', canvas: 'industryChart' },
        { tab: 'swot', canvas: 'swotChart' },
        { tab: 'ratio-analyzer', canvas: 'ratioChart' },
        { tab: 'wacc', canvas: 'waccSensitivityChart' },
        { tab: 'comps', canvas: 'compsBarChart' },
        { tab: 'lbo', canvas: 'lboReturnsChart' },
        { tab: 'ma', canvas: 'maAccretionChart' },
        { tab: 'risk', canvas: 'riskRadarChart' },
        { tab: 'esg', canvas: 'esgRadarChart' },
    ];

    let results = [];
    for (const t of tabs) {
        try {
            await page.click(`#sidebar a[data-tab="${t.tab}"]`);
            await page.waitForTimeout(800);
            const canvas = await page.$(`#${t.canvas}`);
            const hasChart = canvas !== null;
            const display = hasChart ? await canvas.evaluate(el => window.getComputedStyle(el).display) : 'missing';
            results.push({ tab: t.tab, canvas: t.canvas, ok: hasChart && display !== 'none', display });
        } catch (e) {
            results.push({ tab: t.tab, canvas: t.canvas, ok: false, error: e.message });
        }
    }

    console.log('=== Chart Verification ===');
    results.forEach(r => console.log(`${r.ok ? '✅' : '❌'} ${r.tab}: ${r.canvas} (display=${r.display || r.error})`));

    console.log('\n=== JS Errors ===');
    if (errors.length === 0) console.log('None');
    else errors.forEach(e => console.log('❌ ' + e.substring(0, 200)));

    await browser.close();
})();
