const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'DS Financial';
pptx.title = 'The AI-Augmented MBA: Navigating Finance Jobs in 2026';
const BG='1A1D23',NAVY='0D1B2A',GOLD='D4A84B',BLUE='4A9EFF',TXT='F0F0F0',DIM='8899AA',DK='232830',DARK2='232830';
function addBg(s){s.background={fill:BG}}
function bg(s){s.background={fill:BG}}
function goldBar(s,y){s.addShape(pptx.shapes.RECTANGLE,{x:0,y,w:10,h:0.04,fill:{color:GOLD}})}
function gb(s,y){goldBar(s,y)}
// S1: Title
s = pptx.addSlide();
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

// S9: Alpha Generation (LINE CHART)
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('ALGORITHMIC ALPHA: SIGNAL DECAY ANALYSIS',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
s.addChart(pptx.charts.LINE,[
  {name:'Traditional Quant Signal',labels:['Day 1','Week 1','Month 1','Month 3','Month 6','Year 1'],values:[100,82,55,30,12,4]},
  {name:'AI-Augmented Signal',labels:['Day 1','Week 1','Month 1','Month 3','Month 6','Year 1'],values:[100,95,80,62,45,28]},
  {name:'Agentic Adaptive Signal',labels:['Day 1','Week 1','Month 1','Month 3','Month 6','Year 1'],values:[100,98,92,85,72,58]}
],{x:0.8,y:1.2,w:8.4,h:3.0,showLegend:true,legendPos:'b',legendColor:TXT,legendFontSize:9,
  lineSize:3,lineSmooth:true,chartColors:['FF6B6B',BLUE,GOLD],
  catAxisLabelColor:DIM,valAxisLabelColor:DIM,catAxisLabelFontSize:9,valAxisLabelFontSize:9,
  showValAxisTitle:true,valAxisTitle:'Signal Strength (%)',valAxisTitleColor:DIM,
  valAxisMinVal:0,valAxisMaxVal:100,plotArea:{fill:{color:DK}}});
s.addText('Agentic signals self-adapt via continuous RAG feedback loops — reducing alpha decay by 6×',{x:0.6,y:4.3,w:9,h:0.3,fontSize:9,color:DIM,fontFace:'Arial'});

// S10: Risk - Regulatory Filing
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('RISK & COMPLIANCE: AUTOMATED REGULATORY FILING',{x:0.6,y:0.3,w:9,h:0.6,fontSize:20,bold:true,color:GOLD,fontFace:'Arial'});
const flowSteps=['Document\nIngestion','NLP\nExtraction','Cross-Ref\nValidation','Auto\nFiling','Audit\nTrail'];
flowSteps.forEach((l,i)=>{
  const x=0.5+i*1.9;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x,y:1.5,w:1.6,h:1.0,fill:{color:DK},rectRadius:0.08,line:{color:BLUE,width:1}});
  s.addText(l,{x,y:1.6,w:1.6,h:0.8,fontSize:10,bold:true,color:TXT,align:'center',fontFace:'Arial'});
  if(i<4)s.addText('→',{x:x+1.6,y:1.7,w:0.3,h:0.5,fontSize:16,color:BLUE,align:'center',fontFace:'Arial'});
});
const regStats=[['92%','reduction in manual\ndata entry','0.8'],['99.7%','filing accuracy\nrate','3.4'],['15min','avg time per\nregulatory report','6.0']];
regStats.forEach(([n,d,x])=>{
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x:parseFloat(x),y:3.0,w:2.4,h:1.3,fill:{color:DK},rectRadius:0.08});
  s.addText(n,{x:parseFloat(x),y:3.1,w:2.4,h:0.5,fontSize:28,bold:true,color:GOLD,align:'center',fontFace:'Arial'});
  s.addText(d,{x:parseFloat(x)+0.2,y:3.6,w:2.0,h:0.5,fontSize:10,color:TXT,align:'center',fontFace:'Arial'});
});

// S11: Fraud Detection (PIE CHART)
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('REAL-TIME FRAUD DETECTION: AI VS. TRADITIONAL',{x:0.6,y:0.3,w:9,h:0.6,fontSize:20,bold:true,color:GOLD,fontFace:'Arial'});
s.addChart(pptx.charts.PIE,[{name:'Detection',labels:['AI-Detected','Rule-Based','Undetected'],values:[68,24,8]}],
  {x:0.5,y:1.2,w:4.5,h:3.2,showPercent:true,showLegend:true,legendPos:'b',legendColor:TXT,chartColors:[BLUE,GOLD,'FF6B6B'],dataLabelColor:TXT});
s.addText('KEY METRICS',{x:5.5,y:1.3,w:4,h:0.4,fontSize:14,bold:true,color:GOLD,fontFace:'Arial'});
['False positive rate: 0.3% (vs 12% traditional)','Detection latency: <200ms real-time','Synthetic data training: 50M+ scenarios','Cost savings: $340M/yr for top-10 banks','Regulatory citations reduced by 78%'].forEach((t,i)=>{
  s.addText('• '+t,{x:5.5,y:1.8+i*0.5,w:4.2,h:0.4,fontSize:11,color:TXT,fontFace:'Arial'});
});

// S12: PE Deal Sourcing
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('PRIVATE EQUITY: PREDICTIVE DEAL SOURCING',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
const funnel=[['10,000+','Companies Scanned\n(NLP on filings, news, alt data)',8.5,BLUE],['2,400','AI-Scored Targets\n(Propensity model >0.7)',6.8,BLUE],['200','Deep-Dive Pipeline\n(Agent-generated memos)',5.0,GOLD],['15','Executed Deals\n(Human-validated thesis)',3.2,'50C878']];
funnel.forEach(([n,d,w,c],i)=>{
  const x=(10-w)/2;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x,y:1.2+i*0.85,w,h:0.7,fill:{color:DK},rectRadius:0.05,line:{color:c,width:1}});
  s.addText(n,{x:x+0.2,y:1.25+i*0.85,w:1.2,h:0.6,fontSize:18,bold:true,color:c,fontFace:'Arial'});
  s.addText(d,{x:x+1.6,y:1.25+i*0.85,w:w-2,h:0.6,fontSize:10,color:TXT,fontFace:'Arial'});
});

// S13: PE Operational Improvements (TABLE)
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('PE: AI-DRIVEN OPERATIONAL IMPROVEMENTS',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
s.addTable([
  [{text:'Portfolio Co. KPI',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:11}},
   {text:'Pre-AI Baseline',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:11}},
   {text:'Post-AI (12mo)',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:11}},
   {text:'Δ Change',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:11}}],
  [{text:'Revenue Growth',options:{color:TXT}},{text:'8% YoY',options:{color:TXT}},{text:'14% YoY',options:{color:TXT}},{text:'+75%',options:{color:'50C878',bold:true}}],
  [{text:'EBITDA Margin',options:{color:TXT}},{text:'18%',options:{color:TXT}},{text:'26%',options:{color:TXT}},{text:'+8pp',options:{color:'50C878',bold:true}}],
  [{text:'Customer Churn',options:{color:TXT}},{text:'12%',options:{color:TXT}},{text:'5.2%',options:{color:TXT}},{text:'-57%',options:{color:'50C878',bold:true}}],
  [{text:'Working Capital Days',options:{color:TXT}},{text:'65 days',options:{color:TXT}},{text:'38 days',options:{color:TXT}},{text:'-42%',options:{color:'50C878',bold:true}}],
  [{text:'Sales Cycle Length',options:{color:TXT}},{text:'45 days',options:{color:TXT}},{text:'22 days',options:{color:TXT}},{text:'-51%',options:{color:'50C878',bold:true}}]
],{x:0.8,y:1.2,w:8.4,h:2.8,colW:[2.5,2,2,1.9],border:{pt:1,color:'333840'},fill:{color:DK},fontSize:11,fontFace:'Arial',align:'center',valign:'middle'});
s.addText('Data: Composite of 12 PE-backed companies with AI transformation programs (2024-2026)',{x:0.6,y:4.3,w:9,h:0.3,fontSize:8,color:DIM,fontFace:'Arial'});

// S14: New MBA Skillset
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('THE NEW MBA SKILLSET',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
s.addText('From Excel-Monkey to AI-Orchestrator',{x:0.6,y:0.75,w:9,h:0.3,fontSize:13,italic:true,color:DIM,fontFace:'Arial'});
s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x:0.6,y:1.3,w:4.2,h:3.0,fill:{color:DK},rectRadius:0.08,line:{color:'FF6B6B',width:1.5}});
s.addText('2020 MBA (DEPRECATED)',{x:0.6,y:1.4,w:4.2,h:0.4,fontSize:13,bold:true,color:'FF6B6B',align:'center',fontFace:'Arial'});
['Excel/VBA modeling','PowerPoint formatting','Manual data gathering','Pitch book assembly','Static scenario analysis'].forEach((t,i)=>{
  s.addText('✕  '+t,{x:1.0,y:1.9+i*0.45,w:3.5,h:0.35,fontSize:11,color:'888888',fontFace:'Arial'});
});
s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x:5.2,y:1.3,w:4.2,h:3.0,fill:{color:DK},rectRadius:0.08,line:{color:'50C878',width:1.5}});
s.addText('2026 MBA (REQUIRED)',{x:5.2,y:1.4,w:4.2,h:0.4,fontSize:13,bold:true,color:'50C878',align:'center',fontFace:'Arial'});
['Prompt engineering & LLM orchestration','RAG architecture design','Agent workflow composition','AI output validation & governance','Synthetic data strategy'].forEach((t,i)=>{
  s.addText('✓  '+t,{x:5.6,y:1.9+i*0.45,w:3.5,h:0.35,fontSize:11,color:TXT,fontFace:'Arial'});
});

// S15: AI-Orchestrator Toolkit
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('THE AI-ORCHESTRATOR TOOLKIT',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
const quads=[
  ['PROMPT\nENGINEERING','Chain-of-thought\nFew-shot patterns\nSystem prompts\nGuardrails design',BLUE,0.6,1.2],
  ['RAG\nARCHITECTURE','Vector databases\nChunking strategy\nHybrid search\nCitation pipelines',GOLD,5.2,1.2],
  ['AGENT\nDESIGN','Multi-step planning\nTool selection\nMemory systems\nError recovery','50C878',0.6,2.85],
  ['DATA\nGOVERNANCE','PII handling\nModel evaluation\nBias detection\nAudit logging','FF6B6B',5.2,2.85]
];
quads.forEach(([title,content,clr,x,y])=>{
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x,y,w:4.2,h:1.45,fill:{color:DK},rectRadius:0.08,line:{color:clr,width:1}});
  s.addText(title,{x:x+0.15,y:y+0.1,w:1.5,h:1.2,fontSize:12,bold:true,color:clr,fontFace:'Arial'});
  s.addText(content,{x:x+1.7,y:y+0.1,w:2.3,h:1.2,fontSize:10,color:TXT,fontFace:'Arial'});
});

// S16: Role Evolution
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('ROLE EVOLUTION: ANALYST → PORTFOLIO ARCHITECT',{x:0.6,y:0.3,w:9,h:0.6,fontSize:20,bold:true,color:GOLD,fontFace:'Arial'});
const roles=[
  ['Year 1-2','AI-Augmented\nAnalyst','Build models with AI copilot\nValidate LLM outputs\nPrompt-engineer workflows',BLUE],
  ['Year 3-4','Strategy\nArchitect','Design agentic pipelines\nOrchestrate AI + human teams\nOwn decision frameworks',GOLD],
  ['Year 5-7','Portfolio\nArchitect','Set AI governance strategy\nDefine firm-wide AI stack\nP&L responsibility','50C878'],
  ['Year 8+','AI-Native\nPartner/MD','AI as competitive moat\nBoard-level AI strategy\nIndustry thought leadership','FF6B6B']
];
roles.forEach(([yr,title,desc,clr],i)=>{
  const x=0.4+i*2.4;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x,y:1.3,w:2.1,h:3.0,fill:{color:DK},rectRadius:0.08,line:{color:clr,width:1.5}});
  s.addText(yr,{x,y:1.4,w:2.1,h:0.35,fontSize:10,color:DIM,align:'center',fontFace:'Arial'});
  s.addText(title,{x,y:1.75,w:2.1,h:0.6,fontSize:13,bold:true,color:clr,align:'center',fontFace:'Arial'});
  s.addShape(pptx.shapes.RECTANGLE,{x:x+0.3,y:2.4,w:1.5,h:0.02,fill:{color:clr}});
  s.addText(desc,{x:x+0.15,y:2.5,w:1.8,h:1.5,fontSize:9,color:TXT,fontFace:'Arial'});
  if(i<3)s.addText('→',{x:x+2.1,y:2.3,w:0.3,h:0.5,fontSize:20,color:clr,align:'center',fontFace:'Arial'});
});

// S17: Compensation Gap (BAR CHART)
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('THE COMPENSATION GAP: AI-NATIVE PREMIUM',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
s.addChart(pptx.charts.BAR,[
  {name:'Traditional MBA ($K)',labels:['IB Analyst','AM Associate','PE Associate','Risk Analyst','Consulting'],values:[175,155,190,140,165]},
  {name:'AI-Native MBA ($K)',labels:['IB Analyst','AM Associate','PE Associate','Risk Analyst','Consulting'],values:[225,210,265,195,220]}
],{x:0.8,y:1.2,w:8.4,h:2.8,barDir:'col',showLegend:true,legendPos:'b',legendColor:TXT,legendFontSize:9,
  catAxisLabelColor:DIM,valAxisLabelColor:DIM,catAxisLabelFontSize:9,valAxisLabelFontSize:9,
  showValAxisTitle:true,valAxisTitle:'Total Comp Year 1 ($K)',valAxisTitleColor:DIM,
  valAxisMinVal:0,valAxisMaxVal:300,valAxisMajorUnit:50,chartColors:[DIM,GOLD],plotArea:{fill:{color:DK}}});
s.addText('Average premium: +35% total comp  |  Signing bonus delta: +$15-25K  |  Source: H1B data + Levels.fyi (2026)',{x:0.6,y:4.2,w:9,h:0.4,fontSize:9,color:DIM,fontFace:'Arial'});

// S18: What Top Firms Want (TABLE)
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('WHAT TOP FIRMS ACTUALLY WANT',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
s.addTable([
  [{text:'Firm',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:10}},
   {text:'#1 Skill',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:10}},
   {text:'#2 Skill',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:10}},
   {text:'AI Test?',options:{fill:{color:BLUE},color:'FFFFFF',bold:true,fontSize:10}}],
  [{text:'Goldman Sachs',options:{color:TXT,bold:true}},{text:'LLM Orchestration',options:{color:TXT}},{text:'Python/SQL',options:{color:TXT}},{text:'Yes - Live Case',options:{color:'50C878'}}],
  [{text:'JP Morgan',options:{color:TXT,bold:true}},{text:'RAG Architecture',options:{color:TXT}},{text:'Risk Modeling',options:{color:TXT}},{text:'Yes - Technical',options:{color:'50C878'}}],
  [{text:'Blackstone',options:{color:TXT,bold:true}},{text:'Agent Design',options:{color:TXT}},{text:'Ops Analytics',options:{color:TXT}},{text:'Case + Demo',options:{color:'50C878'}}],
  [{text:'Citadel',options:{color:TXT,bold:true}},{text:'ML Engineering',options:{color:TXT}},{text:'Signal Research',options:{color:TXT}},{text:'Coding Test',options:{color:'50C878'}}],
  [{text:'McKinsey',options:{color:TXT,bold:true}},{text:'AI Strategy',options:{color:TXT}},{text:'Change Mgmt',options:{color:TXT}},{text:'AI Case Interview',options:{color:'50C878'}}]
],{x:0.6,y:1.1,w:8.8,h:2.8,colW:[2,2.3,2.3,2.2],border:{pt:1,color:'333840'},fill:{color:DK},fontSize:10,fontFace:'Arial',valign:'middle'});
s.addText('Insight: 100% of top-tier firms now include AI-specific assessments in MBA recruiting',{x:0.6,y:4.2,w:9,h:0.3,fontSize:10,bold:true,color:BLUE,fontFace:'Arial'});

// S19: Ethics & Hallucination
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('ETHICS & GOVERNANCE: THE HALLUCINATION PROBLEM',{x:0.6,y:0.3,w:9,h:0.6,fontSize:20,bold:true,color:GOLD,fontFace:'Arial'});
s.addText('IMPACT',{x:0.3,y:1.05,w:0.6,h:3.3,fontSize:10,color:DIM,fontFace:'Arial',rotate:270});
s.addText('PROBABILITY →',{x:4,y:4.35,w:2,h:0.3,fontSize:10,color:DIM,align:'center',fontFace:'Arial'});
// Risk matrix grid
s.addShape(pptx.shapes.RECTANGLE,{x:1.0,y:1.1,w:8.2,h:3.2,fill:{color:DK},line:{color:'333840',width:1}});
s.addShape(pptx.shapes.RECTANGLE,{x:1.0,y:1.1,w:2.73,h:1.07,fill:{color:'2D1A1A'}}); // high impact, low prob
s.addShape(pptx.shapes.RECTANGLE,{x:3.73,y:1.1,w:2.74,h:1.07,fill:{color:'3D1A1A'}}); // high, med
s.addShape(pptx.shapes.RECTANGLE,{x:6.47,y:1.1,w:2.73,h:1.07,fill:{color:'4D1A1A'}}); // high, high
s.addShape(pptx.shapes.RECTANGLE,{x:6.47,y:2.17,w:2.73,h:1.06,fill:{color:'3D1A1A'}});
// Labels
s.addText('M&A Valuation\nErrors',{x:3.9,y:1.2,w:2.4,h:0.8,fontSize:10,bold:true,color:'FF6B6B',align:'center',fontFace:'Arial'});
s.addText('Regulatory\nMis-filing',{x:6.6,y:1.2,w:2.4,h:0.8,fontSize:10,bold:true,color:'FF6B6B',align:'center',fontFace:'Arial'});
s.addText('Trading Signal\nFalse Positive',{x:6.6,y:2.3,w:2.4,h:0.8,fontSize:10,bold:true,color:GOLD,align:'center',fontFace:'Arial'});
s.addText('Client Report\nTypo/Inaccuracy',{x:3.9,y:3.2,w:2.4,h:0.8,fontSize:10,color:BLUE,align:'center',fontFace:'Arial'});
s.addText('Internal Memo\nFormatting',{x:1.2,y:3.2,w:2.4,h:0.8,fontSize:10,color:'50C878',align:'center',fontFace:'Arial'});
s.addText('Portfolio\nMisallocation',{x:1.2,y:1.2,w:2.4,h:0.8,fontSize:10,bold:true,color:GOLD,align:'center',fontFace:'Arial'});

// S20: Human-in-the-Loop
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('THE HUMAN-IN-THE-LOOP IMPERATIVE',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
// Venn diagram using circles
s.addShape(pptx.shapes.OVAL,{x:2.0,y:1.3,w:3.2,h:3.0,fill:{color:'1A2940'},line:{color:BLUE,width:2}});
s.addShape(pptx.shapes.OVAL,{x:4.8,y:1.3,w:3.2,h:3.0,fill:{color:'2A1F1A'},line:{color:GOLD,width:2}});
s.addText('AI\nCapability',{x:2.2,y:2.0,w:2.0,h:1.0,fontSize:12,bold:true,color:BLUE,align:'center',fontFace:'Arial'});
s.addText('Human\nJudgment',{x:5.8,y:2.0,w:2.0,h:1.0,fontSize:12,bold:true,color:GOLD,align:'center',fontFace:'Arial'});
s.addText('MBA\nValue Zone',{x:4.0,y:2.2,w:2.0,h:0.8,fontSize:11,bold:true,color:TXT,align:'center',fontFace:'Arial'});
s.addText('Where you sit determines your career trajectory. The intersection is not a compromise — it is a premium.',{x:0.8,y:4.3,w:8.4,h:0.3,fontSize:10,italic:true,color:DIM,fontFace:'Arial'});

// S21: Case Study
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('CASE STUDY: AI-AUGMENTED DEAL EXECUTION',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
s.addText('$2.8B Cross-Border M&A  |  Technology Sector  |  Q1 2026',{x:0.6,y:0.8,w:9,h:0.3,fontSize:11,color:BLUE,fontFace:'Arial'});
const timeline=[['Week 1','AI data room triage\n4,200 docs in 72hrs',BLUE],['Week 2-3','Agent-generated\nCIM & risk memo',BLUE],['Week 4','Human validation\n+ board presentation',GOLD],['Week 5-6','Negotiation support\nreal-time scenario AI','50C878'],['Week 7','Close & integration\nplanning agent','50C878']];
timeline.forEach(([wk,desc,clr],i)=>{
  const x=0.4+i*1.9;
  s.addShape(pptx.shapes.OVAL,{x:x+0.55,y:1.5,w:0.5,h:0.5,fill:{color:clr}});
  s.addText(wk,{x,y:2.1,w:1.7,h:0.35,fontSize:10,bold:true,color:clr,align:'center',fontFace:'Arial'});
  s.addText(desc,{x,y:2.5,w:1.7,h:0.9,fontSize:9,color:TXT,align:'center',fontFace:'Arial'});
  if(i<4)s.addShape(pptx.shapes.RECTANGLE,{x:x+1.1,y:1.72,w:1.3,h:0.03,fill:{color:'444444'}});
});
s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x:1.5,y:3.7,w:7,h:0.7,fill:{color:DK},rectRadius:0.05,line:{color:GOLD,width:1}});
s.addText('Result: 7-week close (vs 14-week avg)  |  $4.2M advisory savings  |  Zero material findings missed',{x:1.7,y:3.75,w:6.6,h:0.6,fontSize:11,bold:true,color:GOLD,align:'center',fontFace:'Arial'});

// S22: 12-Month Action Plan
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('YOUR 12-MONTH ACTION PLAN',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
const phases=[
  ['Q1: FOUNDATION','Mo 1-3',['Complete prompt engineering cert','Build first RAG prototype','Join AI finance community'],BLUE],
  ['Q2: DEPTH','Mo 4-6',['Ship agentic workflow project','Contribute to open-source AI','Network at AI+Finance events'],GOLD],
  ['Q3: PORTFOLIO','Mo 7-9',['Build 3 case studies','Start AI finance blog/newsletter','Mock AI interviews with peers'],'50C878'],
  ['Q4: LAUNCH','Mo 10-12',['Target AI-native roles','Negotiate AI premium comp','Mentor next cohort'],'FF6B6B']
];
phases.forEach(([title,period,items,clr],i)=>{
  const x=0.4+i*2.4;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x,y:1.1,w:2.15,h:3.3,fill:{color:DK},rectRadius:0.08,line:{color:clr,width:1.5}});
  s.addText(title,{x,y:1.2,w:2.15,h:0.35,fontSize:10,bold:true,color:clr,align:'center',fontFace:'Arial'});
  s.addText(period,{x,y:1.55,w:2.15,h:0.25,fontSize:9,color:DIM,align:'center',fontFace:'Arial'});
  s.addShape(pptx.shapes.RECTANGLE,{x:x+0.2,y:1.85,w:1.75,h:0.02,fill:{color:clr}});
  items.forEach((t,j)=>{s.addText('→ '+t,{x:x+0.1,y:2.0+j*0.7,w:1.95,h:0.6,fontSize:9,color:TXT,fontFace:'Arial'});});
});

// S23: Strategic Summary
s=pptx.addSlide();bg(s);gb(s,0.9);
s.addText('STRATEGIC SUMMARY: THE AI-MBA MANIFESTO',{x:0.6,y:0.3,w:9,h:0.6,fontSize:22,bold:true,color:GOLD,fontFace:'Arial'});
const manifesto=[
  ['01','AI is infrastructure, not a feature — it rewires every finance function.'],
  ['02','The new moat is orchestration — knowing which AI to deploy, when, and how to validate.'],
  ['03','Human judgment appreciates in value as AI commoditizes analysis.'],
  ['04','The compensation gap is real and widening — AI-native MBAs earn 35%+ premiums.'],
  ['05','Start building now — the 12-month window to differentiate is closing fast.']
];
manifesto.forEach(([num,text],i)=>{
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE,{x:0.8,y:1.1+i*0.65,w:8.4,h:0.55,fill:{color:DK},rectRadius:0.05});
  s.addText(num,{x:0.9,y:1.15+i*0.65,w:0.6,h:0.45,fontSize:18,bold:true,color:GOLD,fontFace:'Arial'});
  s.addText(text,{x:1.6,y:1.15+i*0.65,w:7.4,h:0.45,fontSize:12,color:TXT,fontFace:'Arial'});
});

// S24: Q&A
s=pptx.addSlide();s.background={fill:'0D1B2A'};
gb(s,2.0);
s.addText('QUESTIONS & NEXT STEPS',{x:0.8,y:1.0,w:8.4,h:0.8,fontSize:32,bold:true,color:GOLD,align:'center',fontFace:'Arial'});
s.addText('The AI-Augmented MBA',{x:0.8,y:1.7,w:8.4,h:0.5,fontSize:18,color:TXT,align:'center',fontFace:'Arial'});
s.addText('Connect  |  Collaborate  |  Build',{x:0.8,y:2.6,w:8.4,h:0.4,fontSize:14,color:BLUE,align:'center',fontFace:'Arial'});
s.addText('Resources: github.com/ai-mba-toolkit  |  ai-augmented-mba.com',{x:0.8,y:3.4,w:8.4,h:0.3,fontSize:11,color:DIM,align:'center',fontFace:'Arial'});
s.addText('"The best time to learn AI was two years ago.\nThe second best time is today."',{x:1.5,y:4.0,w:7,h:0.6,fontSize:12,italic:true,color:DIM,align:'center',fontFace:'Arial'});

pptx.writeFile({fileName:'AI-Augmented-MBA-2026.pptx'}).then(()=>console.log('FINAL 24-slide PPTX saved!')).catch(console.error);

