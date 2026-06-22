const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const diagramsDir = path.join(__dirname, 'diagrams');
const files = [
    { html: 'relational-schema.html', png: 'relational-schema-diagram.png' },
    { html: 'srs-diagram.html', png: 'srs-diagram.png' }
];

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (const { html, png } of files) {
        const filePath = path.join(diagramsDir, html);
        const outPath = path.join(__dirname, png);

        await page.goto('file:///' + filePath.replace(/\\/g, '/'));
        await page.waitForTimeout(3000); // wait for mermaid render

        const element = await page.$('.mermaid');
        if (!element) throw new Error('No .mermaid element found in ' + html);

        await element.screenshot({ path: outPath, type: 'png' });
        console.log('Generated', outPath);
    }

    await browser.close();
})();
