const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.title = 'AI-MBA Batch 2';
const BG='1A1D23',NAVY='0D1B2A',GOLD='D4A84B',BLUE='4A9EFF',TXT='F0F0F0',DIM='8899AA',DK='232830';
function bg(s){s.background={fill:BG}} function gb(s,y){s.addShape(pptx.shapes.RECTANGLE,{x:0,y,w:10,h:0.04,fill:{color:GOLD}})}

// S9: Alpha Generation (LINE CHART)
let s=pptx.addSlide();bg(s);gb(s,0.9);
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

pptx.writeFile({fileName:'AI-MBA-batch2.pptx'}).then(()=>console.log('Batch 2 saved!')).catch(console.error);
