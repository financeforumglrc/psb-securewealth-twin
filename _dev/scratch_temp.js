const fs = require('fs');
const content = fs.readFileSync('financial-modelling.html', 'utf8');

// Find all HTML elements with id that look like tab, section, sheet, or chart
const idRegex = /id=["']([^"']+)["']/g;
let match;
const ids = [];
while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    if (id.toLowerCase().includes('tab') || 
        id.toLowerCase().includes('section') || 
        id.toLowerCase().includes('sheet') ||
        id.toLowerCase().includes('view') ||
        id.toLowerCase().includes('chart') ||
        id.toLowerCase().includes('dupont') ||
        id.toLowerCase().includes('zscore')) {
        ids.push(id);
    }
}
console.log('Matching IDs:', ids);
