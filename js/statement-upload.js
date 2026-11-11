(function(){
 'use strict';
 const $=id=>document.getElementById(id),E=()=>window.StatementEngine;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 let draft=[],sources=[],busy=false,base=null,draftScope=null,loadPromises=new Map();
 const fmt=n=>Number.isFinite(n)?(Math.abs(n)<1e-8?0:n).toLocaleString('en-IN',{maximumFractionDigits:2}):'—';
 function status(text){$('statementStatus').textContent=text;}
 function load(src){if(!loadPromises.has(src))loadPromises.set(src,new Promise((resolve,reject)=>{const s=el('script');s.src=src;s.onload=resolve;s.onerror=()=>{loadPromises.delete(src);reject(Error('Could not load document reader. Check your connection and retry.'));};document.head.append(s);}));return loadPromises.get(src);}
 function years(){return $('statementYears').value.split(',').map(x=>'FY'+x.trim().replace(/^FY/i,''));}
 function pages(text,total){if(!text.trim()){if(total>20)throw Error('Select up to 20 statement pages from this longer PDF.');return Array.from({length:total},(_,i)=>i+1);}const result=new Set();for(const chunk of text.split(',')){if(!/^\d+(?:-\d+)?$/.test(chunk.trim()))throw Error('Use page ranges such as 1-3,5.');const [a,b=a]=chunk.trim().split('-').map(Number);if(a<1||b<a||b>total||b-a>19)throw Error('Check PDF page range; read up to 20 selected pages.');for(let i=a;i<=b;i++)result.add(i);}if(result.size>20)throw Error('Read up to 20 pages at a time.');return [...result].sort((a,b)=>a-b);}
 function csv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<=text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if((c===','||c==='\n'||c===undefined)&&!quoted){row.push(cell.replace(/\r$/,''));cell='';if(c!==','){rows.push(row);row=[];}}else cell+=c||'';}if(quoted)throw Error('CSV contains an unclosed quoted field.');return rows.map(r=>r.join('\t')).join('\n');}
 async function readFiles(){
  if(busy)return;const files=[...$('statementFiles').files];if(!files.length){status('Select statement files first.');return;}
  busy=true;draftScope=null;$('readStatements').disabled=true;$('applyStatements').disabled=true;$('statementResults').replaceChildren();base=null;
  let worker=null,pdfDoc=null,pdfTask=null;const found=[],docs=[],warnings=[];
  try{
   const selectedUnit=$('statementUnit').value;let unit=selectedUnit;
   if(!unit&&!files.every(f=>/\.xlsx$/i.test(f.name)))throw Error('Confirm the original reporting unit before extraction.');
   if(!unit)unit='crore';
   const fiscalYears=years();E().parse('',fiscalYears,unit);
   if(files.length>6||files.some(f=>f.size>25*1024*1024))throw Error('Use up to six files, each no larger than 25 MB.');
   const ocr=async image=>{if(!worker){await load('vendor/tesseract.min.js');worker=await Tesseract.createWorker('eng',1,{workerPath:new URL('vendor/tesseract-worker.min.js',location.href).href,corePath:new URL('vendor/ocr-core',location.href).href,langPath:new URL('vendor/ocr-lang',location.href).href,logger:m=>status(`OCR: ${m.status} ${Math.round((m.progress||0)*100)}%`)});}const {data}=await worker.recognize(image);warnings.push(`OCR text quality score ${Math.round(data.confidence)} is not a financial accuracy score; inspect every mapped value.`);return data.text;};
   const collect=(text,name)=>{const parsed=E().parse(text,fiscalYears,unit,name);found.push(...parsed.candidates);warnings.push(...parsed.warnings);};
   for(const file of files){
    status('Reading '+file.name+'…');const bytes=await file.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
    docs.push({id:'upload-'+hash,title:file.name,document:file.name,sha256:hash,accessedAt:new Date().toISOString(),verificationStatus:'user-reviewed extraction; not independently audited'});
    if(/\.csv$/i.test(file.name))collect(csv(new TextDecoder().decode(bytes)),file.name);
    else if(/\.txt$/i.test(file.name))collect(new TextDecoder().decode(bytes),file.name);
    else if(/\.xlsx$/i.test(file.name)){
     await load('vendor/exceljs.min.js');const book=new ExcelJS.Workbook();await book.xlsx.load(bytes);let count=0;
     const template=window.FinancialIntake?.readTemplate(book);
     if(template){if(files.length!==1)throw Error('Import a DS Financial template by itself.');
      if(template.company&&template.company!==$('companyName').value.trim())throw Error('Set Company / legal entity to '+template.company+' before importing this template.');
      draftScope=template.scope;$('statementYears').value=template.years.map(y=>y.slice(2)).join(',');$('statementUnit').value=template.unit;
      draft=template.rows;sources=docs;renderGrid();status('Template loaded with its year columns, scope and normalised INR crore values. Review and complete blank figures before forecasting.');return;}
     if(!selectedUnit)throw Error('Select the reporting unit for a non-template workbook.');for(const sheet of book.worksheets){const rows=[];sheet.eachRow(row=>{if(++count>10000)throw Error('Workbook exceeds the 10,000-row reading limit.');rows.push(row.values.slice(1).map(v=>typeof v==='object'&&v!==null?(v.result??v.text??''):v??'').join('\t'));});collect(rows.join('\n'),file.name+' / '+sheet.name);}
    }else if(/\.pdf$/i.test(file.name)){
     const pdfjs=await import(new URL('vendor/pdf.min.mjs',location.href).href);pdfjs.GlobalWorkerOptions.workerSrc=new URL('vendor/pdf.worker.min.mjs',location.href).href;
     pdfTask=pdfjs.getDocument({data:bytes,isEvalSupported:false});pdfDoc=await pdfTask.promise;
     for(const number of pages($('statementPages').value,pdfDoc.numPages)){
      status(file.name+' · page '+number);const page=await pdfDoc.getPage(number),content=await page.getTextContent(),lines=[];
      for(const item of content.items.filter(x=>x.str).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])){let line=lines.find(l=>Math.abs(l.y-item.transform[5])<3);if(!line){line={y:item.transform[5],items:[]};lines.push(line);}line.items.push(item);}
      let text=lines.map(l=>l.items.sort((a,b)=>a.transform[4]-b.transform[4]).map(x=>x.str).join(' ')).join('\n');
      if($('forceStatementOCR').checked||text.replace(/\s/g,'').length<40){const viewport=page.getViewport({scale:1.8});if(viewport.width*viewport.height>12000000)throw Error('Page resolution is too large for this reader.');const canvas=el('canvas');canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;text=await ocr(canvas);canvas.width=canvas.height=0;}
      collect(text,file.name+' / page '+number);page.cleanup();
     }await pdfTask.destroy();pdfTask=null;pdfDoc=null;
    }else if(/\.(png|jpe?g|webp)$/i.test(file.name)){
     const image=await createImageBitmap(file);try{if(image.width*image.height>12000000)throw Error('Use an image under 12 megapixels.');const canvas=el('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').drawImage(image,0,0);collect(await ocr(canvas),file.name);canvas.width=canvas.height=0;}finally{image.close();}
    }else throw Error('Use PDF, PNG, JPG, WebP, XLSX, CSV or TXT files.');
   }
   const periods=new Map(fiscalYears.map(period=>[period,{period}]));
   for(const c of found){const row=periods.get(c.period);if(!row.evidence)row.evidence={};(row.evidence[c.key]??=[]).push(c);}
   for(const row of periods.values())for(const key of Object.keys(E().metrics)){const list=row.evidence?.[key]||[],unique=[...new Set(list.map(c=>c.value))];row[key]=unique.length===1?(key==='capex'?Math.abs(unique[0]):unique[0]):null;if(unique.length>1)warnings.push(`${row.period} ${E().metrics[key]}: conflicting values; choose the correct source manually.`);}
   draft=[...periods.values()];sources=docs;renderGrid();$('statementWarnings').textContent=[...new Set(warnings)].join(' ');status(`${found.length} candidate figures mapped. All values are provisional. Review every cell and source before applying.`);
  }catch(error){status(error.message);draft=[];sources=[];$('statementReview').replaceChildren();}
  finally{if(worker)await worker.terminate();if(pdfTask)await pdfTask.destroy();busy=false;$('readStatements').disabled=false;$('applyStatements').disabled=!draft.length;}
 }
 function renderGrid(){const table=el('table'),header=el('tr');header.append(el('th','INR crore · review all figures'));for(const r of draft)header.append(el('th',r.period));const head=el('thead');head.append(header);table.append(head);const body=el('tbody');
  for(const [key,label] of Object.entries(E().metrics)){const row=el('tr');row.append(el('th',label));for(const data of draft){const cell=el('td'),input=el('input');input.type='number';input.step='any';input.value=Number.isFinite(data[key])?data[key]:'';input.setAttribute('aria-label',label+' '+data.period);input.title=(data.evidence?.[key]||[]).map(c=>c.document+', line '+c.line+': '+c.raw).join('\n')||'Not extracted: enter a sourced value manually';input.oninput=()=>{data[key]=input.value.trim()===''?null:Number(input.value);base=null;$('statementResults').replaceChildren();};const detail=el('details'),summary=el('summary','Source');detail.append(summary,el('small',input.title));cell.append(input,detail);row.append(cell);}body.append(row);}table.append(body);$('statementReview').replaceChildren(table);$('statementConfirmed').checked=false;
 }
 function renderForecast(){const host=$('statementResults');host.replaceChildren();if(!base)return;const m=window.modelData,p=window.getCurrentParams();if(base.company!==p.company){host.append(el('p','Uploaded statements belong to another company. Import the correct statements before forecasting.'));return;}if(!m||JSON.stringify(m.assumptions)!==JSON.stringify(p)){host.append(el('p','Recalculate current assumptions to update the linked statements.'));return;}
  try{const rows=E().linked(p,base,($('statementInterest').value.trim()===''?NaN:Number($('statementInterest').value))),table=el('table'),header=el('tr');header.append(el('th','Forecast · INR crore'));rows.forEach(r=>header.append(el('th','Y'+r.year)));const head=el('thead');head.append(header);table.append(head);const body=el('tbody');
   for(const [key,label] of [['revenue','Revenue'],['ebitda','EBITDA'],['interest','Interest on opening debt'],['netIncome','Net income'],['operatingCashFlow','Cash from operations'],['investingCashFlow','Investing cash flow'],['financingCashFlow','Funding draw / financing cash flow'],['cash','Closing cash'],['debt','Closing debt'],['assets','Total assets'],['liabilities','Total liabilities'],['equity','Total equity'],['gap','Balance sheet check (zero = reconciled)']]){const tr=el('tr');tr.append(el('th',label));rows.forEach(r=>tr.append(el('td',fmt(r[key]))));body.append(tr);}table.append(body);host.append(el('h3','Linked three-statement forecast'),el('p','Simplified aggregate model: net working-capital changes increase net non-cash assets; other liabilities stay fixed. No dividends, debt repayments, new equity or asset disposals. Cash shortfalls draw new debt; next-year interest reflects that debt. These are explicit scenario assumptions, not a complete statutory forecast.'),table);
  }catch(e){host.append(el('p',e.message));}
 }
 function apply(){try{
  if(!$('statementConfirmed').checked)throw Error('Confirm the company, scope, units, year columns and every reviewed figure first.');
  const p=window.getCurrentParams();if(p.company==='Untitled company')throw Error('Set the legal company name in Company & sources first.');
  const seeded=E().seed(draft,p),record=window.getModelResearch();if(draftScope&&record.scope!==draftScope)throw Error('This draft is '+draftScope+'. Set the matching reporting scope in Company & sources before applying.');const conflicts=record.historical.filter(r=>draft.some(d=>d.period===r.period));if(conflicts.length)throw Error('These periods already exist in the research record. Remove/replace them explicitly in Research brief before importing.');
  const sourceIds=sources.map(s=>s.id);record.sources=[...new Map([...record.sources,...sources].map(s=>[s.id,s])).values()];
  record.historical.push(...draft.map(r=>({...r,evidence:r.evidence,kind:'actual',scope:record.scope,currency:'INR',unit:'crore',sourceIds,locator:'Uploaded statements; see cell-level document/line evidence. Manual corrections reviewed by user.'})));
  const errors=ReportResearch.validate(record);if(errors.length)throw Error(errors.join(' '));localStorage.setItem('ds-research-v1:'+p.company.toLowerCase(),JSON.stringify(record));
  window.StatementUploads.base=base={...seeded.base,company:p.company};for(const key of ['baseRev','ebitdaMargin','daPct','capexPct','netDebt','growth1','growth2'])$(key).value=seeded.inputs[key];$('baseRev').dispatchEvent(new Event('input',{bubbles:true}));window.runAnalysis();renderForecast();status('Reviewed periods imported. '+seeded.notes.join(' '));
 }catch(e){status(e.message);}}
 window.StatementUploads={base:null,loadDraft:(rows,refs,scope)=>{if(busy)throw Error('Wait for document reading to finish.');draft=rows.map(r=>({...r}));sources=refs;draftScope=scope;base=null;renderGrid();$('applyStatements').disabled=false;status('Draft ready. Complete missing figures and confirm the sources before forecasting.');},exportRows:()=>{if(!base)return null;const p=window.getCurrentParams();if(base.company!==p.company)throw Error('Linked statements belong to another company.');return E().linked(p,base,Number($('statementInterest').value));},getState:()=>base?{base,interest:Number($('statementInterest').value)}:null,restore:s=>{if(s?.base){const errors=E().reconcile([s.base]);if(errors.length)throw Error(errors.join(' '));base=s.base;window.StatementUploads.base=base;if($('statementInterest'))$('statementInterest').value=s.interest??8.5;}else base=null;}};
 document.addEventListener('DOMContentLoaded',()=>{$('readStatements').onclick=readFiles;$('applyStatements').onclick=apply;$('statementInterest').oninput=renderForecast;window.addEventListener('financial-model-state',renderForecast);renderForecast();});
})();
