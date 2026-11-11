/* Decision-led, original DS Financial research design. No third-party branding. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ResearchReport=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function analyse(s,valueAt){
    const {model:m,params:p}=s,base=valueAt(p,p.wacc,p.tgr);
    const scenario=(name,growth,margin,discount)=>{const inputs={...p,growth1:Math.max(-99,p.growth1+growth),growth2:Math.max(-99,p.growth2+growth),ebitdaMargin:Math.max(-100,Math.min(100,p.ebitdaMargin+margin))};const wacc=Math.max(p.tgr+.1,p.wacc+discount);return {name,inputs,wacc,value:valueAt(inputs,wacc,p.tgr)};};
    return {base,upside:p.price>0?(base/p.price-1)*100:null,terminalShare:m.ev!==0?m.pvTv/m.ev*100:null,revenueCagr:(Math.pow(m.rev[4]/p.baseRev,.2)-1)*100,fcfConversion:m.ebitda[4]!==0?m.fcf[4]/m.ebitda[4]*100:null,scenarios:[scenario('Downside',-3,-2,1),scenario('Base',0,0,0),scenario('Upside',3,2,-1)],levers:[['EBITDA margin +1pp',valueAt({...p,ebitdaMargin:p.ebitdaMargin+1},p.wacc,p.tgr)-base],['Revenue growth +1pp',valueAt({...p,growth1:p.growth1+1,growth2:p.growth2+1},p.wacc,p.tgr)-base],['WACC -0.5pp',valueAt(p,Math.max(p.tgr+.1,p.wacc-.5),p.tgr)-base],['Net debt -10%',valueAt({...p,netDebt:p.netDebt-Math.abs(p.netDebt)*.1},p.wacc,p.tgr)-base]]};
  }
  function build(s,jsPDF,autoTable,valueAt){
    const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'}),{model:m,params:p}=s,a=analyse(s,valueAt);
    const C={ink:[17,39,61],muted:[85,105,122],teal:[0,123,119],pale:[237,244,245],line:[213,224,230],red:[180,58,66],blue:[69,107,150],paper:[250,251,250]};
    const n=(x,d=1)=>Number.isFinite(x)?x.toLocaleString('en-IN',{maximumFractionDigits:d}):'n/a';
    const pct=x=>Number.isFinite(x)?n(x)+'%':'n/a';
    let page=0;
    function text(str,x,y,width,size=10,color=C.ink,bold=false){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);const lines=doc.splitTextToSize(String(str),width);doc.text(lines,x,y);return y+lines.length*size*.42;}
    function line(x1,y1,x2,y2,color=C.line){doc.setDrawColor(...color);doc.setLineWidth(.25);doc.line(x1,y1,x2,y2);}
    function rect(x,y,w,h,color){doc.setFillColor(...color);doc.rect(x,y,w,h,'F');}
    function start(section,title,sub){if(page)doc.addPage();page++;rect(0,0,297,210,C.paper);text('DS / FINANCIAL',16,13,90,10,C.ink,true);text('VALUATION & VALUE CREATION',190,13,91,8,C.muted);line(16,18,281,18);text(section.toUpperCase(),16,27,260,8,C.teal,true);text(title,16,39,265,22,C.ink,true);if(sub)text(sub,16,53,265,9,C.muted);}
    function footer(note){line(16,193,281,193);text(note||'Source: user model and DS Financial calculations. Forecasts and scenarios are illustrative.',16,199,235,6.8,C.muted);text(String(page).padStart(2,'0'),269,199,12,8,C.muted);}
    function label(value,x,y,w=78){text(value,x,y,w,8,C.muted,true);}
    function table(head,body,x,y,width){autoTable(doc,{startY:y,margin:{left:x,right:297-x-width},tableWidth:width,head:[head],body,theme:'plain',styles:{font:'helvetica',fontSize:8,cellPadding:2.6,textColor:C.ink,lineColor:C.line,lineWidth:{bottom:.15}},headStyles:{fillColor:C.ink,textColor:[255,255,255],fontStyle:'bold'},alternateRowStyles:{fillColor:[240,245,246]},columnStyles:{0:{cellWidth:width*.33}}});return doc.lastAutoTable.finalY;}
    function bars(items,x,y,w,h,{signed=false}={}){
      const max=Math.max(...items.map(i=>Math.abs(i.value)),.001),hasNegative=items.some(item=>item.value<0),zero=hasNegative?x+w*.5:x,available=hasNegative?w*.44:w;
      items.forEach((item,i)=>{const row=y+i*h/items.length,bw=Math.abs(item.value)/max*available;label(item.name,x,row,Math.min(w,90));rect(item.value<0?zero-bw:zero,row+5,bw,7,item.value<0?C.red:C.teal);text(n(item.value),x+w+3,row+10,36,8,C.ink,true);});
    }
    function insight(num,title,body,x,y,w){text(num,x,y,12,13,C.teal,true);text(title,x+14,y,w-14,12,C.ink,true);text(body,x+14,y+9,w-14,9,C.muted);}
    // 01: Decision summary. Interpret the actual model instead of repeating KPIs.
    start('01 / Executive perspective',a.upside==null?'Establish a market reference before drawing a pricing conclusion':a.upside>=0?'The base case implies value above the market reference':'The base case does not support the market reference','Company: '+String(m.company).slice(0,95)+'  |  '+s.createdAt.slice(0,10)+'  |  INR crore unless stated');
    const cards=[['DCF VALUE / SHARE','INR '+n(a.base)],['MARKET REFERENCE','INR '+n(p.price)],['IMPLIED DIFFERENCE',pct(a.upside)],['TERMINAL VALUE / EV',pct(a.terminalShare)]];
    cards.forEach((card,i)=>{const x=16+i*67;rect(x,65,63,34,i===0?C.ink:C.pale);text(card[0],x+5,74,54,7,i===0?[210,235,235]:C.muted,true);text(card[1],x+5,89,55,22,i===0?[255,255,255]:C.ink,true);});
    insight('1','Growth must translate into cash',`Revenue rises from INR ${n(p.baseRev)} Cr to INR ${n(m.rev[4])} Cr in Y5 (${pct(a.revenueCagr)} CAGR). Y5 free cash flow is INR ${n(m.fcf[4])} Cr.`,16,116,125);
    insight('2','The terminal assumption is a key dependency',`${pct(a.terminalShare)} of enterprise value comes after the explicit forecast. Challenge the ${pct(p.tgr)} terminal growth assumption alongside ${pct(p.wacc)} WACC.`,157,116,124);
    rect(16,157,265,24,C.pale);text('DECISION GATE',21,165,36,7,C.teal,true);text('Validate source financials, then stress-test growth, margin and reinvestment before using this valuation in an investment decision.',61,165,212,10,C.ink,true);footer();
    // 02: Operating economics, with vector exhibits.
    start('02 / Operating economics','Revenue growth creates value only if cash generation follows','Exhibit 1  |  Revenue and unlevered free cash flow across the five-year explicit forecast');
    label('REVENUE / INR CR',16,68);const maxRev=Math.max(...m.rev.map(Math.abs),1);
    m.rev.forEach((v,i)=>{const x=25+i*25,height=Math.abs(v)/maxRev*59;rect(x,142-height,14,height,C.ink);text(n(v),x-3,137-height,23,8,C.ink,true);text('Y'+(i+1),x+2,150,20,8,C.muted);});line(20,142,148,142);
    label('UNLEVERED FCF / INR CR',169,68);const maxFcf=Math.max(...m.fcf.map(Math.abs),1),origin=118;
    m.fcf.forEach((v,i)=>{const x=177+i*20,height=Math.abs(v)/maxFcf*35;rect(x,v>=0?origin-height:origin,12,height,v>=0?C.teal:C.red);text(n(v),x-3,v>=0?origin-height-4:origin+height+5,25,8,C.ink,true);text('Y'+(i+1),x,162,20,8,C.muted);});line(170,origin,279,origin);
    text(`Y5 cash conversion: ${pct(a.fcfConversion)} of EBITDA`,169,177,110,10,C.teal,true);text('Growth assumption: '+pct(p.growth1)+' in Y1-Y2; '+pct(p.growth2)+' in Y3-Y5',16,177,145,9,C.muted);footer('Source: model forecast. All five columns are estimates; no historical actuals are implied.');
    // 03: Explicitly reconciling valuation bridge.
    start('03 / Value bridge','Separate operating value from financing claims','Exhibit 2  |  Enterprise value to equity value, with the terminal component visible');
    const bridge=[['PV of forecast FCF',m.pvFcf],['PV of terminal value',m.pvTv],['Enterprise value',m.ev],['Less: net debt',-p.netDebt],['Equity value',m.eq]];
    table(['Valuation bridge','INR crore'],bridge.map(([key,value])=>[key,n(value,2)]),16,66,123);
    rect(155,66,126,61,C.ink);text('EQUITY VALUE / SHARES',163,78,107,8,[190,215,224],true);text(n(m.eq)+' / '+n(p.shares),163,94,107,20,[255,255,255],true);text('= INR '+n(a.base)+' per share',163,114,108,17,[103,220,196],true);
    text('Method',155,144,120,11,C.ink,true);text('FCFF is discounted at WACC. Year-5 cash flow grows once into perpetuity, then terminal value is discounted back five years. Net debt is deducted once.',155,153,120,10,C.muted);footer();
    // 04: Sensitivity matrix with actual conditional fills.
    start('04 / Sensitivity','Discount-rate and terminal-growth assumptions reshape the valuation','Exhibit 3  |  Fair value per share (INR); operating assumptions held constant');
    const rates=[-1,-.5,0,.5,1],xs=61,ys=72,cw=39,rh=17,values=rates.flatMap(dw=>rates.map(dg=>valueAt(p,p.wacc+dw,p.tgr+dg))).filter(Number.isFinite),lo=Math.min(...values),hi=Math.max(...values);
    text('WACC / g',17,66,41,9,C.ink,true);
    rates.forEach((dg,j)=>text(pct(p.tgr+dg),xs+j*cw+12,66,30,10,C.ink,true));
    rates.forEach((dw,i)=>{text(pct(p.wacc+dw),19,ys+i*rh+10,35,10,C.ink,true);rates.forEach((dg,j)=>{const v=valueAt(p,p.wacc+dw,p.tgr+dg),t=Number.isFinite(v)&&hi!==lo?(v-lo)/(hi-lo):.5;rect(xs+j*cw,ys+i*rh,cw-1,rh-1,[Math.round(238-90*t),Math.round(244-35*t),Math.round(246-37*t)]);text(n(v),xs+j*cw+9,ys+i*rh+10,31,11,C.ink,i===2&&j===2);if(i===2&&j===2){doc.setDrawColor(...C.teal);doc.setLineWidth(.8);doc.rect(xs+j*cw,ys+i*rh,cw-1,rh-1);}});});
    text('Base case is outlined. Cells with WACC at or below terminal growth are invalid.',16,174,265,9,C.muted);footer();
    // 05: Illustrative, transparent scenarios, no manufactured probabilities.
    start('05 / Scenario discipline','Underwrite a range of outcomes rather than a single target price','Exhibit 4  |  Illustrative scenarios; input shocks are explicit and are not probabilities');
    table(['Assumption / output',...a.scenarios.map(x=>x.name)],[['Growth Y1-Y2',...a.scenarios.map(x=>pct(x.inputs.growth1))],['Growth Y3-Y5',...a.scenarios.map(x=>pct(x.inputs.growth2))],['EBITDA margin',...a.scenarios.map(x=>pct(x.inputs.ebitdaMargin))],['WACC',...a.scenarios.map(x=>pct(x.wacc))],['Terminal growth',...a.scenarios.map(()=>pct(p.tgr))],['Fair value / share',...a.scenarios.map(x=>'INR '+n(x.value))]],16,66,168);
    rect(199,66,82,91,C.pale);text('HOW TO READ',205,77,69,8,C.teal,true);text('Downside: growth -3pp, margin -2pp and WACC +1pp.\n\nUpside: growth +3pp, margin +2pp and WACC -1pp.\n\nBase: current model assumptions.',205,88,68,9,C.ink);footer('Source: DS Financial scenario calculations. Net debt, shares, tax rate and terminal growth held constant.');
    // 06: Marginal value creation, ranked without ungrounded claims.
    start('06 / Value creation agenda','Prioritise the operating levers with the largest modelled value impact','Exhibit 5  |  Change in fair value per share (INR); one assumption changed at a time');
    const levers=[...a.levers].sort((x,y)=>y[1]-x[1]);bars(levers.map(([name,value])=>({name,value})),16,69,157,101);
    text('Management questions',199,71,82,13,C.ink,true);
    text('01  What evidence supports the margin pathway?\n\n02  Can growth be funded at the assumed reinvestment rate?\n\n03  Does the discount rate match business and financing risk?',199,84,79,10,C.muted);
    text('Impacts are directional, non-additive and do not represent achievable cost savings.',16,178,265,9,C.muted);footer();
    // 07: Actionable diligence, connected to computed concentration risk.
    start('07 / Diligence priorities','Resolve the evidence gaps before treating modelled value as investable','Workplan  |  The model identifies questions; it does not replace company-specific diligence');
    table(['Priority','Evidence required','Decision implication'],[
      ['Source integrity','Audited revenue, debt, cash, diluted shares; reporting period and currency','Reconcile imported values before approving a base case'],
      ['Terminal concentration',pct(a.terminalShare)+' of EV is terminal value','Challenge long-run growth and competitive durability'],
      ['Operating assumptions',pct(p.ebitdaMargin)+' EBITDA margin; '+pct(a.revenueCagr)+' revenue CAGR','Test against company history and credible peer economics'],
      ['Reinvestment','D&A '+pct(p.daPct??3)+'; capex '+pct(p.capexPct??5)+'; WC '+pct(p.wcPct??3)+' of revenue change','Replace generic conventions with sector-specific schedules'],
      ['Discount rate',pct(p.wacc)+' WACC; '+pct(p.tgr)+' terminal growth','Document cost of equity, debt, tax and capital structure'],
      ['Missing evidence','No independent peer multiples, audited balance sheet or qualitative thesis supplied','Do not manufacture peer rankings, ROIC or factual investment recommendations']
    ],16,66,265);footer();
    // 08: Auditable appendix and provenance.
    start('08 / Technical appendix','Every conclusion should trace back to a source or an explicit assumption','Exhibit 6  |  Five-year financial forecast (INR crore)');
    table(['Metric','Y1','Y2','Y3','Y4','Y5'],[['Revenue',...m.rev.map(x=>n(x,2))],['EBITDA',...m.ebitda.map(x=>n(x,2))],['EBIT',...m.ebit.map(x=>n(x,2))],['Net income (if provided)',...m.ni.map(x=>n(x,2))],['Unlevered free cash flow',...m.fcf.map(x=>n(x,2))]],16,66,265);
    text('PROVENANCE',16,137,120,8,C.teal,true);text(String(s.source).slice(0,380),16,147,125,9,C.muted);
    text('MODEL BOUNDARY',158,137,120,8,C.teal,true);text('FCFF / five-year horizon / year-end discounting. Values are scenario estimates, not assured outcomes. INR crore and crore shares yield INR per share. Net income is not calculated by an unlevered cash-flow model. No third-party assurance is implied.',158,147,123,9,C.muted);footer('Generated '+s.createdAt+' | Original DS Financial analysis and presentation.');
    return doc;
  }
  return {build,analyse};
});
