/* One frozen analysis snapshot feeds every export. Browser + Node test support. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ModelExports=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const finite=(value,label)=>{if(!Number.isFinite(value))throw new Error(label+' is missing or invalid. Run a valid analysis first.');return value;};
  function snapshot(model,params){
    if(!model)throw new Error('Run an analysis before exporting.');
    const m=JSON.parse(JSON.stringify(model)),p={...params};
    ['wacc','tgr','shares','baseRev','growth1','growth2','ebitdaMargin','taxRate','netDebt'].forEach(key=>finite(p[key],key));
    if(p.shares<=0||p.baseRev<=0||p.wacc<=p.tgr)throw new Error('Use positive revenue and shares, and WACC greater than terminal growth.');
    for(const key of ['rev','ebitda','ebit','fcf'])if(!Array.isArray(m[key])||m[key].length!==5||m[key].some(v=>!Number.isFinite(v)))throw new Error('The five-year '+key+' forecast is incomplete.');
    if(!Array.isArray(m.ni)||m.ni.length!==5||m.ni.some(value=>value!==null&&!Number.isFinite(value)))throw new Error('Net income values must be numeric or explicitly unavailable.');
    ['ev','eq','dcfPrice','pvFcf','pvTv'].forEach(key=>finite(m[key],key));
    // Assumptions may have changed since Run Analysis. Never mix new inputs
    // with old outputs in a report.
    const projected=p.baseRev*(1+p.growth1/100)**2*(1+p.growth2/100)**3;
    if(Math.abs(projected-m.rev[4])>Math.max(1,Math.abs(projected))*1e-7||Math.abs(m.wacc-p.wacc)>1e-8||Math.abs(m.tgr-p.tgr)>1e-8||Math.abs(m.shares-p.shares)>1e-8||Math.abs(m.netDebt-p.netDebt)>1e-7)throw new Error('Inputs changed after analysis. Run Analysis again before exporting.');
    const expected=valueAt(p,p.wacc,p.tgr);
    if(!Number.isFinite(expected)||Math.abs(expected-m.dcfPrice)>Math.max(1,Math.abs(expected))*1e-7)throw new Error('Model assumptions and valuation do not reconcile. Run Analysis again before exporting.');
    if(m.company!==p.company||Math.abs(m.price-p.price)>1e-8)throw new Error('Company or market price changed. Run Analysis again before exporting.');
    return {model:m,params:p,createdAt:new Date().toISOString(),units:'INR crore; shares in crore; per-share values in INR',source:model.source||'User-entered or imported model; forecasts are assumptions'};
  }
  function valueAt(p,wacc,g){
    if(wacc<=g)return null;
    let previous=p.baseRev,pv=0,last=0;
    for(let year=1;year<=5;year++){
      const revenue=previous*(1+(year<=2?p.growth1:p.growth2)/100);
      const da=revenue*(p.daPct??3)/100,ebit=revenue*p.ebitdaMargin/100-da;
      last=ebit-Math.max(0,ebit)*p.taxRate/100+da-revenue*(p.capexPct??5)/100-(revenue-previous)*(p.wcPct??3)/100;
      pv+=last/(1+wacc/100)**year;previous=revenue;
    }
    return (pv+last*(1+g/100)/((wacc-g)/100)/(1+wacc/100)**5-p.netDebt)/p.shares;
  }
  async function workbook(s,ExcelJS){
    const wb=new ExcelJS.Workbook();wb.creator='DS Financial';wb.created=new Date(s.createdAt);wb.calcProperties.fullCalcOnLoad=true;
    const {model:m,params:p}=s;
    const sheet=name=>{const ws=wb.addWorksheet(name,{views:[{state:'frozen',ySplit:3,xSplit:1}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0}});ws.columns=[{width:34},...Array.from({length:6},()=>({width:18}))];ws.addRow([name.toUpperCase()]);ws.mergeCells('A1:G1');ws.addRow([s.units]);return ws;};
    const summary=sheet('Overview'),a=sheet('Assumptions'),f=sheet('Forecast'),d=sheet('DCF'),sensitivity=sheet('Sensitivity'),notes=sheet('Sources');
    a.addRow(['Assumption','Value','Unit / explanation']);
    const assumptions=[['Base revenue',p.baseRev,'INR crore'],['Growth Y1–Y2',p.growth1/100,'Forecast assumption'],['Growth Y3–Y5',p.growth2/100,'Forecast assumption'],['EBITDA margin',p.ebitdaMargin/100,'Forecast assumption'],['Tax rate',p.taxRate/100,'Forecast assumption'],['WACC',p.wacc/100,'Discount rate'],['Terminal growth',p.tgr/100,'Must remain below WACC'],['Net debt',p.netDebt,'Debt less cash; INR crore'],['Shares',p.shares,'Crore shares'],['D&A / revenue',(p.daPct??3)/100,'Model convention'],['Capex / revenue',(p.capexPct??5)/100,'Model convention'],['Working capital / revenue change',(p.wcPct??3)/100,'Model convention']];
    assumptions.forEach((row,i)=>{a.addRow(row);a.getCell(i+4,2).font={color:{argb:'FF2563EB'}};if([1,2,3,4,5,6,9,10,11].includes(i))a.getCell(i+4,2).numFmt='0.0%';});
    a.getCell('B9').dataValidation={type:'decimal',operator:'greaterThan',formulae:['B10'],showErrorMessage:true,error:'WACC must exceed terminal growth.'};
    a.getCell('B12').dataValidation={type:'decimal',operator:'greaterThan',formulae:[0],showErrorMessage:true,error:'Shares must be positive.'};
    f.addRow(['Forecast','Y1','Y2','Y3','Y4','Y5']);
    const labels=['Revenue','EBITDA','Depreciation','EBIT','NOPAT','Capital expenditure','Change in working capital','Unlevered free cash flow','Net income (if provided)'];labels.forEach(label=>f.addRow([label]));
    const formula=(ws,cell,expression,result)=>{ws.getCell(cell).value={formula:expression,result};ws.getCell(cell).numFmt='#,##0.00;[Red](#,##0.00);"–"';};
    for(let i=0;i<5;i++){
      const col=String.fromCharCode(66+i),prev=i?String.fromCharCode(65+i)+'4':"Assumptions!B4",revenue=m.rev[i],dep=revenue*(p.daPct??3)/100,capex=revenue*(p.capexPct??5)/100,wc=(revenue-(i?m.rev[i-1]:p.baseRev))*(p.wcPct??3)/100;
      formula(f,col+'4',prev+'*(1+Assumptions!'+(i<2?'$B$5':'$B$6')+')',revenue);
      formula(f,col+'5',col+'4*Assumptions!$B$7',m.ebitda[i]);formula(f,col+'6',col+'4*Assumptions!$B$13',dep);
      formula(f,col+'7',col+'5-'+col+'6',m.ebit[i]);formula(f,col+'8',col+'7-MAX(0,'+col+'7)*Assumptions!$B$8',m.ebit[i]-Math.max(0,m.ebit[i])*p.taxRate/100);
      formula(f,col+'9',col+'4*Assumptions!$B$14',capex);formula(f,col+'10','('+col+'4-'+prev+')*Assumptions!$B$15',wc);
      formula(f,col+'11',col+'8+'+col+'6-'+col+'9-'+col+'10',m.fcf[i]);f.getCell(col+'12').value=m.ni[i];
    }
    d.addRow(['DCF bridge','Value','Method']);
    d.addRow(['PV of forecast cash flows']);formula(d,'B4','SUM('+[...Array(5)].map((_,i)=>'Forecast!'+String.fromCharCode(66+i)+'11/(1+Assumptions!B9)^'+(i+1)).join(',')+')',m.pvFcf);
    d.addRow(['Terminal value']);formula(d,'B5','Forecast!F11*(1+Assumptions!B10)/(Assumptions!B9-Assumptions!B10)',m.tv);
    d.addRow(['PV of terminal value']);formula(d,'B6','B5/(1+Assumptions!B9)^5',m.pvTv);
    d.addRow(['Enterprise value']);formula(d,'B7','B4+B6',m.ev);
    d.addRow(['Net debt']);formula(d,'B8','Assumptions!B11',p.netDebt);
    d.addRow(['Equity value']);formula(d,'B9','B7-B8',m.eq);
    d.addRow(['Fair value per share']);formula(d,'B10','B9/Assumptions!B12',m.dcfPrice);
    summary.addRow(['Company',m.company]);summary.addRow(['Generated',s.createdAt]);summary.addRow(['Market price',m.price]);summary.addRow(['DCF fair value']);formula(summary,'B6','DCF!B10',m.dcfPrice);
    summary.addRow(['Enterprise value']);formula(summary,'B7','DCF!B7',m.ev);summary.addRow(['Equity value']);formula(summary,'B8','DCF!B9',m.eq);
    summary.addRow(['How to use','Edit blue values on Assumptions. Forecast and DCF formulas recalculate in Excel.']);summary.getCell('B9').alignment={wrapText:true};summary.getRow(9).height=48;
    sensitivity.addRow(['WACC / terminal growth',...[-1,-.5,0,.5,1].map(delta=>(p.tgr+delta)/100)]);
    for(let i=0;i<5;i++){
      const w=p.wacc+(i-2)*.5,row=i+4;sensitivity.addRow([w/100]);sensitivity.getCell(row,1).numFmt='0.0%';
      for(let j=0;j<5;j++){
        const col=String.fromCharCode(66+j),g=p.tgr+(j-2)*.5,v=valueAt(p,w,g);
        const pv=[...Array(5)].map((_,k)=>'Forecast!'+String.fromCharCode(66+k)+'11/(1+$A'+row+')^'+(k+1)).join('+');
        formula(sensitivity,col+row,'IF($A'+row+'>'+col+'$3,(('+pv+')+Forecast!F11*(1+'+col+'$3)/($A'+row+'-'+col+'$3)/(1+$A'+row+')^5-Assumptions!B11)/Assumptions!B12,"n/a")',v??'n/a');
      }
    }
    for(let col=2;col<=6;col++)sensitivity.getCell(3,col).numFmt='0.0%';
    notes.addRow(['Source / convention','Details']);notes.addRow(['Data source',s.source]);notes.addRow(['Exported at',s.createdAt]);notes.addRow(['Valuation','Five-year FCFF; year-end discounting; Gordon growth terminal value.']);notes.addRow(['Forecast conventions','Editable D&A, capex and working-capital assumptions are listed on Assumptions.']);notes.addRow(['Net income','Not forecast unless separately supplied; an unlevered model does not calculate financing costs.']);notes.addRow(['Limits','Forecasts are estimates. No invented audited balance sheet or guaranteed target price.']);
    const report=typeof module==='object'&&module.exports?require('./research-report'):globalThis.ResearchReport;
    const analysis=report.analyse(s,valueAt);
    const decisions=sheet('Decision Brief'),scenarios=sheet('Scenarios'),drivers=sheet('Value Drivers'),checks=sheet('Model Checks');
    decisions.addRow(['Decision lens','Model evidence','Next action']);
    decisions.addRow(['Base value vs market',analysis.upside==null?'No market reference':analysis.upside.toFixed(1)+'% implied difference','Verify source figures before drawing a pricing conclusion']);
    decisions.addRow(['Terminal concentration',analysis.terminalShare==null?'n/a':analysis.terminalShare/100,'Challenge long-run growth and competitive durability']);decisions.getCell('B5').numFmt='0.0%';
    decisions.addRow(['Cash conversion',analysis.fcfConversion==null?'n/a':analysis.fcfConversion/100,'Test reinvestment against sector economics']);decisions.getCell('B6').numFmt='0.0%';
    decisions.addRow(['Evidence boundary','No audited balance sheet or independently verified peers supplied','Do not interpret estimates as verified company facts']);
    scenarios.addRow(['Illustrative case','Fair value / share','Growth Y1–Y2','Growth Y3–Y5','EBITDA margin','WACC','Terminal growth']);
    analysis.scenarios.forEach((item,i)=>{const row=i+4;scenarios.addRow([item.name,item.value,item.inputs.growth1/100,item.inputs.growth2/100,item.inputs.ebitdaMargin/100,item.wacc/100,p.tgr/100]);for(let col=3;col<=7;col++)scenarios.getCell(row,col).numFmt='0.0%';});
    scenarios.addRow(['Scenario outputs are frozen snapshots; use the Assumptions sheet to recalculate a different case.']);scenarios.mergeCells('A7:G7');scenarios.getCell('A7').alignment={wrapText:true};scenarios.getRow(7).height=38;
    drivers.addRow(['One-at-a-time lever','Value / share impact','Interpretation']);analysis.levers.forEach(([name,impact])=>drivers.addRow([name,impact,'Directional; non-additive; illustrative assumption change']));
    checks.addRow(['Reconciliation','Difference','Status']);
    const tests=[['EV = PV of FCF + PV of terminal','DCF!B7-DCF!B4-DCF!B6',m.ev-m.pvFcf-m.pvTv],['Equity = EV less net debt','DCF!B9-DCF!B7+DCF!B8',m.eq-m.ev+p.netDebt],['Fair value = equity / shares','DCF!B10-DCF!B9/Assumptions!B12',m.dcfPrice-m.eq/p.shares],['WACC exceeds terminal growth','Assumptions!B9-Assumptions!B10',(p.wacc-p.tgr)/100]];
    tests.forEach(([name,expression,result],i)=>{const row=i+4;checks.addRow([name]);formula(checks,'B'+row,expression,result);checks.getCell('C'+row).value={formula:i===3?'IF(B'+row+'>0,"PASS","FAIL")':'IF(ABS(B'+row+')<0.000001,"PASS","FAIL")',result:i===3?(result>0?'PASS':'FAIL'):(Math.abs(result)<1e-6?'PASS':'FAIL')};});
    for(const ws of [notes,decisions,drivers,checks]){ws.getColumn(2).width=48;ws.getColumn(3).width=63;ws.eachRow((row,index)=>{if(index>3){row.height=45;row.eachCell(cell=>cell.alignment={wrapText:true,vertical:'middle'});}});}
    for(const ws of wb.worksheets){
      ws.eachRow((row,index)=>{row.height=index===1?32:Math.max(row.height||23,23);row.eachCell(cell=>{cell.font={name:'Aptos',size:11,...cell.font};cell.alignment={vertical:'middle',...cell.alignment};if(index===1||index===3){cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:index===1?'FF142D4E':'FFE8EEF6'}};cell.font={name:'Aptos',size:index===1?16:10,bold:true,color:{argb:index===1?'FFFFFFFF':'FF142D4E'}};}else if(index>3&&index%2===0)cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF5F8FC'}};if(typeof cell.value==='number'&&cell.numFmt==='General')cell.numFmt='#,##0.00';});});
      ws.headerFooter.oddFooter='DS Financial | &A | Page &P of &N';ws.pageSetup.printTitlesRow='1:3';
    }
    sensitivity.addConditionalFormatting({ref:'B4:F8',rules:[{type:'colorScale',cfvo:[{type:'min'},{type:'percentile',value:50},{type:'max'}],color:[{argb:'FFF7E9EB'},{argb:'FFF2F6F7'},{argb:'FF8FCAC5'}]}]});
    checks.addConditionalFormatting({ref:'C4:C7',rules:[{type:'containsText',operator:'containsText',text:'FAIL',style:{font:{bold:true,color:{argb:'FFB43A42'}},fill:{type:'pattern',pattern:'solid',bgColor:{argb:'FFF7E9EB'}}}}]});
    for(const ws of wb.worksheets)ws.properties.tabColor={argb:ws.name==='Assumptions'?'FF2563EB':ws.name==='Model Checks'?'FF007B77':'FF142D4E'};
    return wb;
  }
  function pdf(s,jsPDF,autoTable){
    const report=typeof module==='object'&&module.exports?require('./research-report'):globalThis.ResearchReport;
    return report.build(s,jsPDF,autoTable,valueAt);
  }
  return {snapshot,workbook,pdf,valueAt};
});
