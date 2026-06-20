const pptxgen = require('pptxgenjs');
const fs = require('fs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'DS Financial';
pptx.title = 'The AI-Augmented MBA: Navigating Finance Jobs in 2026';

const BG = '1A1D23', NAVY = '0D1B2A', GOLD = 'D4A84B', BLUE = '4A9EFF', TXT = 'F0F0F0', DIM = '8899AA', DARK2 = '232830';

function addBg(s) { s.background = { fill: BG }; }
function goldBar(s, y) { s.addShape(pptx.shapes.RECTANGLE, { x:0, y, w:10, h:0.04, fill:{color:GOLD} }); }

// S1: Title
let s = pptx.addSlide();
s.background = { fill: NAVY };
goldBar(s, 2.2);
s.addText('THE AI-AUGMENTED MBA', { x:0.8, y:1.0, w:8.4, h:1.0, fontSize:36, bold:true, color:GOLD, fontFace:'Arial' });
s.addText('Navigating Finance Jobs in 2026', { x:0.8, y:1.7, w:8.4, h:0.5, fontSize:20, color:TXT, fontFace:'Arial' });
s.addText('"AI won\'t replace the MBA, but the MBA who uses AI\nwill replace the one who doesn\'t."', { x:0.8, y:2.8, w:8.4, h:0.8, fontSize:14, italic:true, color:DIM, fontFace:'Arial' });
s.addText('May 2026  |  Executive Briefing', { x:0.8, y:4.5, w:8.4, h:0.4, fontSize:11, color:DIM, fontFace:'Arial' });

// S2: Reality Check
s = pptx.addSlide(); addBg(s); goldBar(s, 0.9);
s.addText('THE 2026 REALITY CHECK', { x:0.6, y:0.3, w:9, h:0.6, fontSize:24, bold:true, color:GOLD, fontFace:'Arial' });
const stats = [
  ['73%', 'of finance tasks now\nautomatable by AI', '0.6'],
  ['$4.4T', 'projected AI market\nvalue by 2027', '3.6'],
  ['2.1×', 'hiring premium for\nAI-native MBA grads', '6.6']
];
stats.forEach(([num, desc, x]) => {
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:parseFloat(x), y:1.4, w:2.6, h:2.2, fill:{color:DARK2}, rectRadius:0.1, line:{color:'333840', width:1} });
  s.addText(num, { x:parseFloat(x), y:1.6, w:2.6, h:0.8, fontSize:40, bold:true, color:BLUE, align:'center', fontFace:'Arial' });
  s.addText(desc, { x:parseFloat(x)+0.2, y:2.4, w:2.2, h:0.8, fontSize:12, color:TXT, align:'center', fontFace:'Arial' });
});
s.addText('Sources: McKinsey Global Institute, Gartner, Burning Glass Technologies (2026)', { x:0.6, y:4.3, w:9, h:0.3, fontSize:8, color:DIM, fontFace:'Arial' });

// S3: Acceleration Curve (LINE CHART)
s = pptx.addSlide(); addBg(s); goldBar(s, 0.9);
s.addText('AI IN FINANCE: THE ACCELERATION CURVE', { x:0.6, y:0.3, w:9, h:0.6, fontSize:22, bold:true, color:GOLD, fontFace:'Arial' });
s.addChart(pptx.charts.LINE, [
  { name:'Investment Banking', labels:['2020','2021','2022','2023','2024','2025','2026'], values:[12,18,28,42,58,72,85] },
  { name:'Asset Management', labels:['2020','2021','2022','2023','2024','2025','2026'], values:[15,22,35,48,62,75,88] },
  { name:'Private Equity', labels:['2020','2021','2022','2023','2024','2025','2026'], values:[8,12,20,32,45,60,74] },
  { name:'Risk/Compliance', labels:['2020','2021','2022','2023','2024','2025','2026'], values:[20,28,38,52,65,78,90] }
], { x:0.8, y:1.2, w:8.4, h:3.3, showTitle:false, showLegend:true, legendPos:'b', legendFontSize:9, legendColor:TXT,
  lineSize:3, lineSmooth:true, chartColors:[GOLD,BLUE,'50C878','FF6B6B'],
  catAxisLabelColor:DIM, catAxisLabelFontSize:9, valAxisLabelColor:DIM, valAxisLabelFontSize:9,
  showCatAxisTitle:true, catAxisTitle:'Year', catAxisTitleColor:DIM,
  showValAxisTitle:true, valAxisTitle:'AI Adoption Index (%)', valAxisTitleColor:DIM,
  valAxisMinVal:0, valAxisMaxVal:100, valAxisMajorUnit:20,
  plotArea:{ fill:{ color:DARK2 } }
});

// S4: Tech Stack
s = pptx.addSlide(); addBg(s); goldBar(s, 0.9);
s.addText('THE FINANCE AI TECH STACK', { x:0.6, y:0.3, w:9, h:0.6, fontSize:22, bold:true, color:GOLD, fontFace:'Arial' });
const techCols = [
  ['LLMs & Foundation\nModels', ['GPT-5/Gemini 2.5 for\nfinancial analysis','Fine-tuned models on\nSEC filings & 10-Ks','Multi-modal: text +\ntables + charts'], BLUE],
  ['Autonomous\nAgents', ['Agentic workflows for\nend-to-end deal flow','RAG architectures on\nproprietary data','Tool-use: Bloomberg,\nCapIQ, FactSet APIs'], GOLD],
  ['Quantum\nComputing', ['Portfolio optimization\nat scale','Monte Carlo on\nquantum hardware','Cryptographic risk\nmodeling'], '50C878']
];
techCols.forEach(([title, bullets, clr], i) => {
  const x = 0.6 + i * 3.1;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y:1.2, w:2.8, h:3.3, fill:{color:DARK2}, rectRadius:0.1, line:{color:clr, width:1.5} });
  s.addText(title, { x, y:1.35, w:2.8, h:0.65, fontSize:13, bold:true, color:clr, align:'center', fontFace:'Arial' });
  s.addShape(pptx.shapes.RECTANGLE, { x:x+0.3, y:2.0, w:2.2, h:0.02, fill:{color:clr} });
  bullets.forEach((b, j) => {
    s.addText(b, { x:x+0.25, y:2.2+j*0.85, w:2.3, h:0.75, fontSize:10, color:TXT, fontFace:'Arial' });
  });
});

// S5: Agentic Workflows
s = pptx.addSlide(); addBg(s); goldBar(s, 0.9);
s.addText('AGENTIC WORKFLOWS: THE NEW OPERATING SYSTEM', { x:0.6, y:0.3, w:9, h:0.6, fontSize:20, bold:true, color:GOLD, fontFace:'Arial' });
const steps = ['User\nPrompt','RAG\nRetrieval','Agent\nReasoning','Tool\nExecution','Human\nReview','Final\nOutput'];
steps.forEach((label, i) => {
  const x = 0.4 + i * 1.55;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y:1.6, w:1.3, h:1.1, fill:{color: i===4?GOLD:DARK2}, rectRadius:0.08, line:{color: i===4?GOLD:BLUE, width:1} });
  s.addText(label, { x, y:1.7, w:1.3, h:0.9, fontSize:10, bold:true, color: i===4?NAVY:TXT, align:'center', fontFace:'Arial' });
  if(i < 5) s.addText('→', { x:x+1.3, y:1.85, w:0.25, h:0.5, fontSize:18, color:BLUE, align:'center', fontFace:'Arial' });
});
s.addText('Key Insight: The "Human Review" node is where MBA judgment creates irreplaceable value.\nThis is not optional — it is the competitive moat.', { x:0.6, y:3.2, w:8.8, h:0.8, fontSize:12, color:DIM, italic:true, fontFace:'Arial' });

// S6: IB - M&A Due Diligence
s = pptx.addSlide(); addBg(s); goldBar(s, 0.9);
s.addText('IB: AI-LED M&A DUE DILIGENCE', { x:0.6, y:0.3, w:9, h:0.6, fontSize:22, bold:true, color:GOLD, fontFace:'Arial' });
s.addText('TRADITIONAL', { x:0.8, y:1.2, w:4, h:0.4, fontSize:13, bold:true, color:'FF6B6B', fontFace:'Arial' });
s.addText('AI-AUGMENTED', { x:5.2, y:1.2, w:4, h:0.4, fontSize:13, bold:true, color:'50C878', fontFace:'Arial' });
s.addShape(pptx.shapes.RECTANGLE, { x:4.95, y:1.2, w:0.03, h:3.2, fill:{color:'444444'} });
const tradItems = ['Data room review: 4-6 weeks','Manual contract analysis','3 analysts, 80hr weeks','$2.5M+ advisory fees','Risk: human error in Vol. III'];
const aiItems = ['AI triage: 48-72 hours','NLP contract extraction','1 analyst + AI copilot','40-60% cost reduction','Risk: hallucination in edge cases'];
tradItems.forEach((t,i) => { s.addText('• '+t, { x:0.8, y:1.65+i*0.55, w:4, h:0.45, fontSize:11, color:TXT, fontFace:'Arial' }); });
aiItems.forEach((t,i) => { s.addText('• '+t, { x:5.2, y:1.65+i*0.55, w:4.2, h:0.45, fontSize:11, color:TXT, fontFace:'Arial' }); });
s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:2.5, y:4.05, w:5, h:0.45, fill:{color:DARK2}, rectRadius:0.05 });
s.addText('⚡ Net result: 85% faster CIM analysis with 94% accuracy on key terms', { x:2.5, y:4.05, w:5, h:0.45, fontSize:11, bold:true, color:BLUE, align:'center', fontFace:'Arial' });

// S7: IB - Valuation Models (BAR CHART)
s = pptx.addSlide(); addBg(s); goldBar(s, 0.9);
s.addText('IB: AI-POWERED VALUATION MODELS', { x:0.6, y:0.3, w:9, h:0.6, fontSize:22, bold:true, color:GOLD, fontFace:'Arial' });
s.addChart(pptx.charts.BAR, [
  { name:'Traditional (hours)', labels:['DCF Model','LBO Analysis','Comparable Cos','Precedent Txns','Accretion/Dilution'], values:[40,35,25,20,15] },
  { name:'AI-Augmented (hours)', labels:['DCF Model','LBO Analysis','Comparable Cos','Precedent Txns','Accretion/Dilution'], values:[8,10,4,5,3] }
], { x:0.8, y:1.2, w:8.4, h:3.0, barDir:'bar', showTitle:false, showLegend:true, legendPos:'b', legendColor:TXT, legendFontSize:9,
  catAxisLabelColor:DIM, catAxisLabelFontSize:9, valAxisLabelColor:DIM, valAxisLabelFontSize:9,
  showValAxisTitle:true, valAxisTitle:'Hours to Complete', valAxisTitleColor:DIM,
  chartColors:[BLUE, GOLD], plotArea:{fill:{color:DARK2}}
});
s.addText('Average time reduction: 72%  |  Error rate reduction: 45%  |  Scenario coverage: 4× increase', { x:0.6, y:4.3, w:9, h:0.3, fontSize:9, color:DIM, fontFace:'Arial' });

// S8: Asset Management - Portfolios
s = pptx.addSlide(); addBg(s); goldBar(s, 0.9);
s.addText('ASSET MANAGEMENT: HYPER-PERSONALIZED PORTFOLIOS', { x:0.6, y:0.3, w:9, h:0.6, fontSize:20, bold:true, color:GOLD, fontFace:'Arial' });
// Quadrant matrix
s.addShape(pptx.shapes.RECTANGLE, { x:1.5, y:1.2, w:7, h:3.3, fill:{color:DARK2}, line:{color:'333840', width:1} });
s.addShape(pptx.shapes.RECTANGLE, { x:5.0, y:1.2, w:0.02, h:3.3, fill:{color:'444444'} });
s.addShape(pptx.shapes.RECTANGLE, { x:1.5, y:2.85, w:7, h:0.02, fill:{color:'444444'} });
s.addText('HIGH PERSONALIZATION', { x:1.5, y:0.95, w:7, h:0.25, fontSize:8, color:DIM, align:'center', fontFace:'Arial' });
s.addText('HIGH SCALE →', { x:7.5, y:2.7, w:1.2, h:0.3, fontSize:8, color:DIM, fontFace:'Arial' });
// Quadrant labels
s.addText('Boutique Wealth\nManagers', { x:1.8, y:1.4, w:2.8, h:0.6, fontSize:12, bold:true, color:GOLD, fontFace:'Arial' });
s.addText('Low AUM, bespoke\nportfolios, high touch', { x:1.8, y:2.0, w:2.8, h:0.5, fontSize:9, color:DIM, fontFace:'Arial' });
s.addText('AI-NATIVE FIRMS\n(The Future)', { x:5.3, y:1.4, w:2.8, h:0.6, fontSize:12, bold:true, color:BLUE, fontFace:'Arial' });
s.addText('Mass personalization\nvia agentic portfolios', { x:5.3, y:2.0, w:2.8, h:0.5, fontSize:9, color:DIM, fontFace:'Arial' });
s.addText('Traditional\nPassive Funds', { x:1.8, y:3.1, w:2.8, h:0.5, fontSize:12, color:'666666', fontFace:'Arial' });
s.addText('Index funds, ETFs\nminimal customization', { x:1.8, y:3.55, w:2.8, h:0.5, fontSize:9, color:DIM, fontFace:'Arial' });
s.addText('Robo-Advisors\n(Gen 1)', { x:5.3, y:3.1, w:2.8, h:0.5, fontSize:12, color:'50C878', fontFace:'Arial' });
s.addText('Rule-based allocation\nlimited personalization', { x:5.3, y:3.55, w:2.8, h:0.5, fontSize:9, color:DIM, fontFace:'Arial' });

pptx.writeFile({ fileName: 'AI-MBA-batch1.pptx' }).then(() => console.log('Batch 1 saved!')).catch(console.error);
