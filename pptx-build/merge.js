const fs = require('fs');
const b1 = fs.readFileSync('batch1.js','utf8');
const b2 = fs.readFileSync('batch2.js','utf8');
const b3 = fs.readFileSync('batch3.js','utf8');

const header = `const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'DS Financial';
pptx.title = 'The AI-Augmented MBA: Navigating Finance Jobs in 2026';
const BG='1A1D23',NAVY='0D1B2A',GOLD='D4A84B',BLUE='4A9EFF',TXT='F0F0F0',DIM='8899AA',DK='232830',DARK2='232830';
function addBg(s){s.background={fill:BG}}
function bg(s){s.background={fill:BG}}
function goldBar(s,y){s.addShape(pptx.shapes.RECTANGLE,{x:0,y,w:10,h:0.04,fill:{color:GOLD}})}
function gb(s,y){goldBar(s,y)}
`;

function extractSlides(code) {
  const lines = code.split('\n');
  let start = -1, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/\/\/ S\d/) && start === -1) start = i;
    if (lines[i].match(/writeFile/)) { end = i; break; }
  }
  return lines.slice(Math.max(start, 0), end).join('\n');
}

const footer = `\npptx.writeFile({fileName:'AI-Augmented-MBA-2026.pptx'}).then(()=>console.log('FINAL 24-slide PPTX saved!')).catch(console.error);\n`;
const final = header + extractSlides(b1) + '\n' + extractSlides(b2) + '\n' + extractSlides(b3) + footer;
fs.writeFileSync('build-final.js', final);
console.log('Combined script created: build-final.js');
