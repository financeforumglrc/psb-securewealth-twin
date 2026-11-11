(function(){
  const loads=new Map();
  function load(src){if(!loads.has(src))loads.set(src,new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>{loads.delete(src);script.remove();reject(new Error('Export library could not load. Refresh and try again.'));};document.head.appendChild(script);}));return loads.get(src);}
  function current(){
    const snapshot=ModelExports.snapshot(typeof modelData==='undefined'?null:modelData,getCurrentParams());
    if(typeof _scrMonoData!=='undefined'&&_scrMonoData?.inputs?.company===snapshot.model.company)snapshot.source='Screener.in fundamentals imported '+(_scrMonoData.meta?.fetchedAt||'date unavailable')+'; forecasts and discount rates are user assumptions';
    if(typeof getModelResearch==='function')snapshot.research=getModelResearch();
    return snapshot;
  }
  function save(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  let exporting=false;
  async function exportFile(format){
    if(exporting)return;
    try{
      const s=current();exporting=true;setExportProgress(10,'Preparing '+format.toUpperCase()+' report','Using the last calculated model');
      const filename=(s.model.company||'Company').replace(/[^a-z0-9_-]/gi,'_')+'_valuation_'+s.createdAt.slice(0,10);
      if(format==='xlsx'){
        await load('vendor/exceljs.min.js');setExportProgress(45,'Building linked Excel formulas','Overview, assumptions, forecast, DCF and sensitivity');
        const wb=await ModelExports.workbook(s,ExcelJS);save(new Blob([await wb.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),filename+'.xlsx');
      }else if(format==='pdf'){
        await load('vendor/jspdf.umd.min.js');await load('vendor/jspdf.plugin.autotable.min.js');
        const doc=ModelExports.pdf(s,window.jspdf.jsPDF,(doc,options)=>doc.autoTable(options));save(doc.output('blob'),filename+'.pdf');
      }else if(format==='json')save(new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),filename+'.json');
      else {
        const rows=[['Metric','Y1','Y2','Y3','Y4','Y5'],...['rev','ebitda','ebit','ni','fcf'].map((key,i)=>[['Revenue','EBITDA','EBIT','Net income','Unlevered FCF'][i],...s.model[key]])];
        const escape=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
        save(new Blob(['\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),filename+'.csv');
      }
      setExportProgress(100,'Report ready','Download created');showToast(format.toUpperCase()+' report downloaded');
    }catch(error){document.getElementById('exportProgressOverlay')?.classList.remove('active');showToast(error.message,'error');}
    finally{exporting=false;document.getElementById('exportDropdown')?.classList.remove('open');}
  }
  window.exportProfessionalExcel=()=>exportFile('xlsx');window.exportProfessionalPDF=()=>exportFile('pdf');window.exportExcel=()=>exportFile('xlsx');window.exportReport=exportFile;
  const originalAnalysis=window.runAnalysis;
  let calculating=false;
  function setState(text){const state=document.getElementById('workspaceModelState');if(state)state.textContent=text;}
  window.runAnalysis=async function(){
    if(calculating)return;
    const fields=['baseRev','shares','price','growth1','growth2','ebitdaMargin','taxRate','wacc','tgr','netDebt'];
    if(fields.some(id=>{const el=document.getElementById(id);return el&&(!el.value.trim()||!Number.isFinite(Number(el.value)));})){showToast('Complete all numeric model assumptions before running analysis.','error');return;}
    const p=getCurrentParams();
    if(![p.baseRev,p.shares,p.price,p.growth1,p.growth2,p.ebitdaMargin,p.taxRate,p.wacc,p.tgr,p.netDebt].every(Number.isFinite)||p.baseRev<=0||p.shares<=0||p.price<0||p.growth1<=-100||p.growth2<=-100||p.taxRate<0||p.taxRate>100||p.wacc<=p.tgr||p.wacc<=0){showToast('Check inputs: positive revenue and shares, growth above -100%, tax 0–100%, and WACC above terminal growth.','error');return;}
    calculating=true;setState('Calculating…');const buttons=document.querySelectorAll('[data-click="runAnalysis()"]');buttons.forEach(button=>button.disabled=true);
    try{await originalAnalysis();current();setState('Calculated · ready to export');const confidence=document.getElementById('confidenceText');if(confidence)confidence.textContent='Assumption-driven valuation';}
    catch(error){setState('Review assumptions');showToast(error.message,'error');}
    finally{calculating=false;buttons.forEach(button=>button.disabled=false);}
  };
  function readCases(){try{const cases=JSON.parse(localStorage.getItem('ds-model-cases-v1')||'[]');return Array.isArray(cases)?cases.slice(-6):[];}catch{return [];}}
  function showCases(){
    const dialog=document.createElement('dialog');dialog.className='model-cases';
    const title=document.createElement('h2');title.textContent='Saved valuation cases';dialog.appendChild(title);
    const subtitle=document.createElement('p');subtitle.textContent='Saved on this device. Compare assumptions and calculated value before restoring a case.';dialog.appendChild(subtitle);
    const cases=readCases(),wrap=document.createElement('div');wrap.className='model-case-table';dialog.appendChild(wrap);
    if(!cases.length){const empty=document.createElement('p');empty.textContent='No cases yet. Run an analysis, then choose Save case.';wrap.appendChild(empty);}
    else{
      const table=document.createElement('table'),head=document.createElement('tr');
      ['Case','Fair value / share','WACC','Growth Y1–Y2','Terminal growth',''].forEach(label=>{const th=document.createElement('th');th.textContent=label;head.appendChild(th);});table.appendChild(head);
      cases.forEach(saved=>{
        const row=document.createElement('tr');
        [saved.name,Number(saved.snapshot?.model?.dcfPrice).toFixed(2),saved.snapshot?.params?.wacc+'%',saved.snapshot?.params?.growth1+'%',saved.snapshot?.params?.tgr+'%'].forEach(value=>{const td=document.createElement('td');td.textContent=value;row.appendChild(td);});
        const td=document.createElement('td'),restore=document.createElement('button');restore.textContent='Restore inputs';
        restore.onclick=()=>{const p=saved.snapshot?.params;if(!p)return;for(const [key,value] of Object.entries(p)){const el=document.getElementById(key==='company'?'companyName':key);if(el&&typeof value!=='object')el.value=value;}dialog.close();showToast('Case inputs restored. Run Analysis to recalculate.');};td.appendChild(restore);row.appendChild(td);table.appendChild(row);
      });wrap.appendChild(table);
    }
    const close=document.createElement('button');close.textContent='Close';close.onclick=()=>dialog.close();dialog.appendChild(close);dialog.addEventListener('close',()=>dialog.remove());document.body.appendChild(dialog);dialog.showModal();
  }
  function saveCase(){
    try{const snapshot=current(),name=prompt('Name this valuation case:',snapshot.model.company+' · Base case');if(!name?.trim())return;const cases=readCases();cases.push({name:name.trim().slice(0,100),snapshot});localStorage.setItem('ds-model-cases-v1',JSON.stringify(cases.slice(-6)));showToast('Case saved on this device.');}catch(error){showToast(error.message,'error');}
  }
  async function previewReport(){
    try{
      const s=current();await load('vendor/jspdf.umd.min.js');await load('vendor/jspdf.plugin.autotable.min.js');
      const report=ModelExports.pdf(s,window.jspdf.jsPDF,(doc,options)=>doc.autoTable(options));
      const url=URL.createObjectURL(report.output('blob')),dialog=document.createElement('dialog');dialog.className='model-report-preview';
      const head=document.createElement('div');head.className='report-preview-toolbar';
      const title=document.createElement('strong');title.textContent='Valuation & value creation / '+s.model.company;
      const download=document.createElement('a');download.href=url;download.download='valuation-research.pdf';download.textContent='Download PDF';
      const close=document.createElement('button');close.type='button';close.textContent='Close';close.onclick=()=>dialog.close();head.append(title,download,close);
      const frame=document.createElement('iframe');frame.title='Valuation research report preview';frame.src=url;
      dialog.append(head,frame);dialog.addEventListener('close',()=>{URL.revokeObjectURL(url);dialog.remove();});document.body.appendChild(dialog);dialog.showModal();
    }catch(error){showToast(error.message,'error');}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    // Keep existing model controls, but offer immediate, unambiguous exports.
    const header=document.querySelector('.header');
    if(header){const bar=document.createElement('div');bar.className='workspace-actions';bar.innerHTML='<div><span class="workspace-eyebrow">RESEARCH WORKSPACE</span><p>Build assumptions. Review value. Export the model.</p></div><div class="workspace-export-actions"><button type="button" data-format="xlsx">Excel model ↗</button><button type="button" data-format="pdf">PDF report ↗</button><span>INR crore · 5-year forecast</span></div>';header.after(bar);bar.addEventListener('click',event=>{const button=event.target.closest('[data-format]');if(button)exportFile(button.dataset.format);});}
    const actions=document.querySelector('.workspace-export-actions');
    if(actions){for(const [label,handler]of [['Preview report',previewReport],['Save case',saveCase],['Compare cases',showCases]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',handler);actions.appendChild(button);}}
    if(header){const state=document.createElement('div');state.id='workspaceModelState';state.className='workspace-model-state';state.setAttribute('role','status');state.textContent='Set assumptions, then Run Analysis';document.querySelector('.workspace-actions')?.appendChild(state);}
    document.addEventListener('input',event=>{if(['companyName','baseRev','shares','price','growth1','growth2','ebitdaMargin','taxRate','wacc','tgr','netDebt'].includes(event.target.id))setState('Inputs changed · run analysis to update');});
    const confidence=document.getElementById('confidenceText');if(confidence)confidence.textContent='Assumption-driven valuation';
    // Div-based navigation also works with keyboard and assistive technology.
    document.querySelectorAll('.nav-item[data-click]').forEach(item=>{item.tabIndex=0;item.setAttribute('role','button');item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();item.click();}});});
  });
})();
