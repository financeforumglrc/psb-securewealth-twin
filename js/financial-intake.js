(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./statement-engine'));else root.FinancialIntake=factory(root.StatementEngine);})(typeof globalThis!=='undefined'?globalThis:this,function(engine){
 const year=/^(Mar|Jun|Sep|Dec) (20\d{2})$/;
 function blank(years){engine.parse('',years);return years.map(period=>({period,...Object.fromEntries(Object.keys(engine.metrics).map(k=>[k,null])),evidence:{}}));}
 function style(wb){for(const s of wb.worksheets){s.views=[{state:'frozen',ySplit:1}];s.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};s.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF132C47'}};s.columns=Array.from({length:Math.max(2,s.columnCount)},(_,i)=>({width:i?22:48}));}return wb;}
 function template(ExcelJS,{company='',years=['FY2026','FY2025','FY2024'],scope='consolidated',unit='crore'}={}){
  blank(years);const wb=new ExcelJS.Workbook(),setup=wb.addWorksheet('Setup');setup.addRows([['DS Financial statement template',1],['Company',company],['Scope',scope],['Currency','INR'],['Unit',unit]]);
  const s=wb.addWorksheet('Statements');s.addRow(['Metric',...years]);Object.values(engine.metrics).forEach(label=>s.addRow([label,...years.map(()=>null)]));
  for(let r=2;r<=12;r++)for(let c=2;c<=years.length+1;c++){s.getCell(r,c).numFmt='#,##0.00;[Red](#,##0.00)';s.getCell(r,c).font={color:{argb:'FF175CD3'}};}
  const note=wb.addWorksheet('Instructions');note.addRows([['Fill once, import for review'],['1','Set legal company name, scope and INR unit in Setup.'],['2','Use annual FY20xx headers in Statements. One to five years supported.'],['3','Enter financial figures only; keep unavailable cells empty, never use zero as a substitute.'],['4','Total liabilities excludes equity. Capex and depreciation are positive amounts.'],['5','Upload the XLSX. Scope, units and years are read from Setup; review all figures before forecasting.'],['6','Do not put passwords, personal IDs or confidential non-financial notes in this template.']]);return style(wb);
 }
 function readTemplate(wb){const setup=wb.getWorksheet('Setup'),sheet=wb.getWorksheet('Statements');if(!setup||!sheet)return null;
  if(setup.getCell('A1').value!=='DS Financial statement template'||setup.getCell('B1').value!==1)throw Error('Unsupported DS Financial template version.');
  const company=String(setup.getCell('B2').value||'').trim(),scope=String(setup.getCell('B3').value||''),currency=setup.getCell('B4').value,unit=String(setup.getCell('B5').value||'');
  if(!['consolidated','standalone'].includes(scope)||currency!=='INR')throw Error('Template must specify consolidated/standalone scope and INR currency.');
  const years=sheet.getRow(1).values.slice(2).map(String);engine.parse('',years,unit);const rows=blank(years);
  for(const [key,label]of Object.entries(engine.metrics)){let found=null;sheet.eachRow((r,index)=>{if(index>1&&r.getCell(1).value===label){if(found)throw Error('Duplicate template metric: '+label);found=r;}});if(!found)throw Error('Missing template row: '+label);
   rows.forEach((row,i)=>{const v=found.getCell(i+2).value;if(v!==null&&typeof v!=='number')throw Error(label+': enter a numeric value, not a formula or text.');row[key]=v===null?null:engine.parse(label+'\t'+v,[row.period],unit).candidates[0]?.value??null;});
  }return {company,scope,unit,years,rows};
 }
 function companyPack(data){
  const f=data.fundamentals;if(!f)return {rows:[],missing:['Public financial tables unavailable'],data};
  const rows=[];for(const label of (f.years.pl||[]).slice(-3).reverse()){
   const match=label.match(year);if(!match)continue;const period='FY'+match[2],p=f.years.pl.indexOf(label),b=(f.years.bs||[]).indexOf(label),c=(f.years.cf||[]).indexOf(label),value=(obj,key,index)=>index>=0&&Number.isFinite(obj?.[key]?.[index])?obj[key][index]:null;
   const row=blank([period])[0];row.revenue=value(f.pl,'revenue',p);row.ebitda=value(f.pl,'ebitda',p);row.netIncome=value(f.pl,'netProfit',p);row.depreciation=value(f.pl,'depreciation',p);row.operatingCashFlow=value(f.cf,'cfo',c);row.totalAssets=value(f.bs,'totalAssets',b);row.debt=value(f.bs,'longTermDebt',b);row.cash=value(f.bs,'cash',b);
   const capital=value(f.bs,'equity',b),reserves=value(f.bs,'reserves',b),total=value(f.bs,'totalLiab',b);
   // Screener's Total Liabilities includes equity: never map that total as debt-side liabilities.
   if(capital!==null&&reserves!==null){row.equity=capital+reserves;if(total!==null)row.totalLiabilities=total-row.equity;}
   for(const key of Object.keys(engine.metrics))if(row[key]!==null)row.evidence[key]=[{document:f.sourceUrl||'Screener public annual tables',raw:`${label}: ${key} = ${row[key]}. Equity = capital + reserves; liabilities = published total − equity. Operating profit is a provisional EBITDA proxy.`,line:p+1}];rows.push(row);
  }
  return {rows,missing:rows.flatMap(r=>Object.keys(engine.metrics).filter(k=>r[k]===null).map(k=>r.period+': '+engine.metrics[k])),data};
 }
 function packWorkbook(ExcelJS,pack){const {data,rows}=pack,wb=template(ExcelJS,{company:data.entity.name,scope:data.fundamentals?.scope||'standalone',years:rows.length?rows.map(r=>r.period):['FY2026']});
  const s=wb.getWorksheet('Statements');Object.keys(engine.metrics).forEach((key,i)=>rows.forEach((row,j)=>s.getCell(i+2,j+2).value=row[key]));
  const source=wb.addWorksheet('Sources');source.addRows([['Data pack / source register'],['Fetched at',data.accessedAt],['Scope',data.fundamentals?.scope||'standalone'],['Financial source',data.fundamentals?.sourceUrl||'Unavailable'],['Quote source',data.quote?.sourceUrl||'Unavailable'],['Market time',data.quote?.market_time||'Not supplied'],['Price / INR',data.quote?.currency==='INR'?data.quote.price:null],['Limitations','Secondary data, not independently verified. Missing cash/capex must be supplied from filings. Operating profit is a provisional EBITDA proxy; reconcile it.'],...pack.missing.map(x=>['Missing',x]),...(data.primarySources||[]).map(s=>[s.title,s.url])]);
  for(const [key,name] of [['pl','Public PL'],['bs','Public Balance Sheet'],['cf','Public Cash Flow']]){const f=data.fundamentals;if(!f)continue;const sheet=wb.addWorksheet(name);sheet.addRow(['Provider metric',...(f.years[key]||[])]);for(const [label,values]of Object.entries(f[key]||{}))sheet.addRow([label,...values]);}
  return style(wb);
 }
 return {blank,template,readTemplate,companyPack,packWorkbook};
});
