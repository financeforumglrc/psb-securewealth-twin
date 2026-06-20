const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
const BG='1A1D23',GOLD='D4A84B',BLUE='4A9EFF',TXT='F0F0F0',DIM='8899AA',DK='232830';
function bg(s){s.background={fill:BG}} function gb(s,y){s.addShape(pptx.shapes.RECTANGLE,{x:0,y,w:10,h:0.04,fill:{color:GOLD}})}

// S17: Compensation Gap (BAR CHART)
let s=pptx.addSlide();bg(s);gb(s,0.9);
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

pptx.writeFile({fileName:'AI-MBA-batch3.pptx'}).then(()=>console.log('Batch 3 saved!')).catch(console.error);
