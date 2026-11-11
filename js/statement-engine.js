(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./financial-core'));else root.StatementEngine=factory(root.FinancialCore);})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 'use strict';
 const metrics={revenue:'Revenue',ebitda:'EBITDA',netIncome:'Net income',operatingCashFlow:'Operating cash flow',totalAssets:'Total assets',totalLiabilities:'Total liabilities',equity:'Total equity',cash:'Cash and cash equivalents',debt:'Total interest-bearing debt',depreciation:'Depreciation & amortisation',capex:'Capital expenditure'};
 const patterns={revenue:/^(revenue(?: from operations)?|net sales|total revenue)\s*$/i,ebitda:/^ebitda\s*$/i,netIncome:/^(net (?:income|profit)(?: after tax)?|profit (?:for the (?:year|period)|after tax))\s*$/i,operatingCashFlow:/^(?:net )?cash (?:flow (?:from|generated from)|(?:generated from|from)|(?:generated from|used in) operating)\s*(?:operat(?:ing|ions)(?: activities)?)?\s*$/i,totalAssets:/^total assets\s*$/i,totalLiabilities:/^total liabilities\s*$/i,equity:/^(total equity|total shareholders'? (?:equity|funds))\s*$/i,cash:/^cash and cash equivalents(?: at (?:the )?end(?: of (?:the )?(?:year|period))?)?\s*$/i,debt:/^(total (?:interest[- ]bearing )?debt|total borrowings)\s*$/i,depreciation:/^depreciation(?: and| &)? amorti[sz]ation(?: expense)?\s*$|^depreciation(?: expense)?\s*$/i,capex:/^(capital expenditure|capex|purchase of property,? plant and equipment|payments for (?:acquisition of )?property,? plant and equipment)\s*$/i};
 const factors={crore:1,lakh:.01,million:.1,thousand:.0001,rupees:.0000001};
 function numeric(v){let s=String(v??'').trim().replace(/[−–]/g,'-');if(!s||/^[-—]$/.test(s))return null;let negative=/^\(.*\)$/.test(s);s=s.replace(/[(),₹\s]/g,'');if(!/^-?\d+(?:\.\d+)?$/.test(s))return null;const n=Number(s);return Number.isFinite(n)?(negative?-n:n):null;}
 function parse(text,years,unit='crore',document='statement'){
  if(!Object.hasOwn(factors,unit))throw Error('Choose a supported INR unit.');
  if(!years.length||years.length>5||new Set(years).size!==years.length||years.some(y=>!/^FY20\d{2}$/.test(y)))throw Error('Provide one to five distinct fiscal years, such as 2026,2025.');
  const candidates=[],warnings=[];
  for(const [lineIndex,line] of text.split(/\r?\n/).entries()){
   let chunks=line.trim().split(/\t|\s{2,}|\s*\|\s*/).filter(Boolean),label=chunks[0]||'',values=chunks.slice(1).map(numeric);
   if(chunks.length<2){const match=line.trim().match(/^(.*?)\s+((?:\(?-?\d[\d,]*(?:\.\d+)?\)?|[-—])(?:\s+(?:\(?-?\d[\d,]*(?:\.\d+)?\)?|[-—]))*)$/);if(!match)continue;label=match[1];values=match[2].split(/\s+/).map(numeric);}
   label=label.replace(/\s*\([a-z]\)\s*$/i,'').trim();const key=Object.keys(patterns).find(key=>patterns[key].test(label));if(!key)continue;
   if(values.length<years.length){warnings.push(`${document}, line ${lineIndex+1}: ${label} has fewer columns than selected years.`);continue;}
   values=values.slice(-years.length);
   years.forEach((period,i)=>{if(values[i]!==null)candidates.push({period,key,value:values[i]*factors[unit],raw:line,document,line:lineIndex+1,unit});});
  }
  return {candidates,warnings};
 }
 function reconcile(rows){
  const errors=[];if(!rows.length)errors.push('No reviewed periods.');
  if(new Set(rows.map(r=>r.period)).size!==rows.length)errors.push('Fiscal years must be unique.');
  for(const r of rows){for(const key of Object.keys(metrics))if(!Number.isFinite(r[key]))errors.push(`${r.period}: review ${metrics[key]}.`);
   if(!/^FY20\d{2}$/.test(r.period))errors.push('Use annual FY20xx periods.');
   if(!(r.revenue>0))errors.push(`${r.period}: revenue must be positive.`);
   if([r.totalAssets,r.totalLiabilities,r.equity].every(Number.isFinite)&&Math.abs(r.totalAssets-r.totalLiabilities-r.equity)>Math.max(1,Math.abs(r.totalAssets))*1e-5)errors.push(`${r.period}: assets must equal liabilities plus equity.`);
   if(r.cash<0||r.cash>r.totalAssets||r.debt<0||r.debt>r.totalLiabilities||r.depreciation<0||r.capex<0)errors.push(`${r.period}: check cash, debt, depreciation and capex signs or totals. Capex must be a positive outflow amount.`);
  }return errors;
 }
 function seed(rows,previous){
  const errors=reconcile(rows);if(errors.length)throw Error(errors.join(' '));const sorted=[...rows].sort((a,b)=>a.period.localeCompare(b.period)),last=sorted.at(-1);
  const growth=sorted.length>=2?(Math.pow(last.revenue/sorted[0].revenue,1/(Number(last.period.slice(2))-Number(sorted[0].period.slice(2))))-1)*100:null;
  const inputs={...core.defaults,...previous,baseRev:last.revenue,ebitdaMargin:last.ebitda/last.revenue*100,daPct:last.depreciation/last.revenue*100,capexPct:last.capex/last.revenue*100,netDebt:last.debt-last.cash};
  if(growth!==null&&Number.isFinite(growth)){inputs.growth1=growth;inputs.growth2=growth;}
  const invalid=core.validate(inputs);if(invalid.length)throw Error(invalid.join(' '));
  return {inputs,base:last,growth,notes:['Historical CAGR is an editable extrapolation, not management guidance.','Shares, tax, WACC, terminal growth and working-capital intensity require your review.','Cash flow is used for historical cross-checks, not treated as EBITDA.']};
 }
 function linked(inputs,base,costOfDebt=8.5){
  if(!Number.isFinite(costOfDebt)||costOfDebt<0||costOfDebt>100)throw Error('Interest rate must be from 0 to 100%.');
  const errors=reconcile([base]);if(errors.length)throw Error(errors.join(' '));
  if(Math.abs(inputs.baseRev-base.revenue)>1e-8)throw Error('Base revenue no longer matches the reviewed opening statements. Re-import reviewed actuals before using the linked forecast.');
  const model=core.calculate(inputs);let cash=base.cash,debt=base.debt,equity=base.equity,nonCashAssets=base.totalAssets-base.cash;
  return model.forecast.map(f=>{const openingCash=cash,openingDebt=debt,interest=openingDebt*costOfDebt/100,pbt=f.ebit-interest,tax=Math.max(0,pbt)*inputs.taxRate/100,netIncome=pbt-tax,operatingCashFlow=netIncome+f.da-f.wc,investingCashFlow=-f.capex,preFunding=openingCash+operatingCashFlow+investingCashFlow,fundingDraw=Math.max(0,-preFunding);cash=preFunding+fundingDraw;debt+=fundingDraw;equity+=netIncome;nonCashAssets+=f.capex-f.da+f.wc;const assets=nonCashAssets+cash,liabilities=base.totalLiabilities+(debt-base.debt),gap=assets-liabilities-equity;return {...f,openingCash,openingDebt,interest,pbt,tax,netIncome,operatingCashFlow,investingCashFlow,financingCashFlow:fundingDraw,cash,debt,equity,assets,liabilities,gap,nonCashAssets};});
 }
 return {metrics,numeric,parse,reconcile,seed,linked};
});
