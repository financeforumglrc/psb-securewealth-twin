(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./financial-core'):root.FinancialCore);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {root.DecisionLab=api;document.addEventListener('DOMContentLoaded',()=>api.mount(root));}
})(typeof globalThis!=='undefined'?globalThis:this,function(core){
  'use strict';
  const defaults={weights:[25,50,25],marginOfSafety:25,thesis:'',invalidation:''};
  function settings(raw={}){
    const s={...defaults,...raw,weights:[...(raw.weights||defaults.weights)]};
    if(s.weights.length!==3||s.weights.some(x=>!Number.isFinite(x)||x<0||x>100)||Math.abs(s.weights.reduce((a,b)=>a+b,0)-100)>1e-8)throw Error('Scenario weights must be between 0 and 100 and total 100%.');
    if(!Number.isFinite(s.marginOfSafety)||s.marginOfSafety<0||s.marginOfSafety>=100)throw Error('Margin of safety must be from 0% to less than 100%.');
    for(const key of ['thesis','invalidation'])if(typeof s[key]!=='string'||s[key].length>4000)throw Error('Thesis notes must be text, up to 4,000 characters.');
    return s;
  }
  // Scan a bounded range first: do not assume the DCF is globally monotonic.
  function reverse(p,driver){
    if(!(p.price>0))return {status:'missing-price',roots:[]};
    const bounds=driver==='margin'?[-50,80]:[-30,80];
    const value=x=>core.calculate(driver==='margin'?{...p,ebitdaMargin:x}:{...p,growth1:x,growth2:x}).dcfPrice-p.price;
    const roots=[],samples=[];
    for(let x=bounds[0];x<=bounds[1];x+=.5)samples.push([x,value(x)]);
    for(let i=0;i<samples.length;i++){
      let [a,fa]=samples[i];
      if(Math.abs(fa)<1e-9){roots.push(a);continue;}
      if(i===samples.length-1)continue;
      let [b,fb]=samples[i+1];if(fa*fb>=0)continue;
      for(let j=0;j<65;j++){const mid=(a+b)/2,fm=value(mid);if(fa*fm<=0){b=mid;fb=fm;}else{a=mid;fa=fm;}}
      roots.push((a+b)/2);
    }
    return {status:roots.length?'solved':'outside-range',roots:roots.filter((v,i,all)=>i===0||Math.abs(v-all[i-1])>1e-6),bounds};
  }
  function analyze(p,raw){
    const s=settings(raw),m=core.calculate(p),cases=core.scenarios(p),weightedValue=cases.reduce((sum,c,i)=>sum+c.model.dcfPrice*s.weights[i]/100,0);
    const drivers=[['Operating margin','ebitdaMargin'],['Discount rate','wacc'],['Capital intensity','capexPct'],['Working-capital intensity','wcPct'],['Early growth','growth1'],['Later growth','growth2']].map(([label,key])=>{
      const values=[-1,1].map(delta=>{const inputs={...p,[key]:p[key]+delta};return core.validate(inputs).length?null:core.calculate(inputs).dcfPrice;});
      return {label,key,lower:values[0],higher:values[1],swing:Math.max(...values.filter(Number.isFinite).map(v=>Math.abs(v-m.dcfPrice)),0)};
    }).sort((a,b)=>b.swing-a.swing);
    const flags=[];
    if(m.ev<=0||m.eq<=0)flags.push('Non-positive enterprise or equity value: percentage comparisons may be misleading.');
    if(m.ev>0&&m.pvTv/m.ev>.75)flags.push('More than 75% of enterprise value comes from terminal value.');
    if(p.wacc-p.tgr<2)flags.push('Less than 2 percentage points separate WACC and terminal growth.');
    if(m.fcf.some(x=>x<0))flags.push('At least one forecast year has negative free cash flow.');
    if(!s.thesis.trim())flags.push('Investment thesis has not been recorded.');
    if(!s.invalidation.trim())flags.push('No evidence or operating trigger has been recorded to invalidate the thesis.');
    return {model:m,settings:s,cases:cases.map((c,i)=>({name:c.name,value:c.model.dcfPrice,weight:s.weights[i]})),weightedValue,entryValue:Math.max(0,m.dcfPrice)*(1-s.marginOfSafety/100),growth:reverse(p,'growth'),margin:reverse(p,'margin'),drivers,flags};
  }
  let mounted=false;
  let readSettings=()=>({...defaults,weights:[...defaults.weights]}),writeSettings=()=>{},current=()=>null;
  function appendWorkbook(wb,p,raw){
    const a=analyze(p,raw),sheet=wb.addWorksheet('DecisionLab');
    const rows=[['DECISION LAB',p.company],['Method','Illustrative assumptions; weights are user opinions, not estimated probabilities.'],['Market price',p.price],['Base fair value',a.model.dcfPrice],['Margin of safety (%)',a.settings.marginOfSafety],['Entry ceiling at margin of safety',a.entryValue],['Weighted scenario value',a.weightedValue],['Investment thesis',a.settings.thesis],['Invalidation trigger',a.settings.invalidation],[],['Scenario','Fair value / share','User weight (%)'],...a.cases.map(c=>[c.name,c.value,c.weight]),[],['Market-implied constant growth (%)',a.growth.roots.join(', ')||a.growth.status],['Market-implied EBITDA margin (%)',a.margin.roots.join(', ')||a.margin.status],[],['Driver / ±1 percentage point','Lower input: fair value','Higher input: fair value'],...a.drivers.map(d=>[d.label,d.lower,d.higher]),[],['Review flags'],...a.flags.map(f=>[f])];
    rows.forEach(row=>sheet.addRow(row));sheet.columns=[{width:47},{width:70},{width:23}];sheet.eachRow(row=>{row.alignment={wrapText:true,vertical:'top'};});sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'},size:16};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF132C47'}};sheet.views=[{state:'frozen',ySplit:1}];return sheet;
  }
  function mount(win){
    const host=document.getElementById('decisionLab');if(!host)return;
    const $=id=>document.getElementById(id),node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
    const fmt=n=>Number.isFinite(n)?n.toLocaleString('en-IN',{maximumFractionDigits:2}):'Unavailable';
    let last=null;mounted=true;
    readSettings=()=>settings({weights:['Downside','Base','Upside'].map(x=>($('weight'+x).value.trim()===''?NaN:Number($('weight'+x).value))),marginOfSafety:($('safetyMargin').value.trim()===''?NaN:Number($('safetyMargin').value)),thesis:$('investmentThesis').value,invalidation:$('thesisInvalidation').value});
    writeSettings=raw=>{const s=settings(raw);['Downside','Base','Upside'].forEach((x,i)=>$('weight'+x).value=s.weights[i]);$('safetyMargin').value=s.marginOfSafety;$('investmentThesis').value=s.thesis;$('thesisInvalidation').value=s.invalidation;};
    current=()=>last;
    function render(){
      last=null;$('decisionResults').replaceChildren();$('decisionError').textContent='';
      const m=win.modelData,p=win.getCurrentParams();
      if(!m||JSON.stringify(m.assumptions)!==JSON.stringify(p)){$('decisionResults').append(node('p','Calculate the current assumptions to unlock decision analysis.','empty-state'));return;}
      try{
        const a=analyze(p,readSettings());last=a;
        const metrics=node('div',undefined,'decision-metrics');
        for(const [label,value,note] of [['Weighted scenario value','INR '+fmt(a.weightedValue),'User-assigned weights; not a probability forecast'],['Entry ceiling','INR '+fmt(a.entryValue),'Base value less your margin of safety'],['Market-implied growth',a.growth.roots.length?a.growth.roots.map(fmt).join(' / ')+'%':a.growth.status==='missing-price'?'Add market price':'No solution in range','Constant Y1–Y5 growth; search −30% to 80%'],['Market-implied margin',a.margin.roots.length?a.margin.roots.map(fmt).join(' / ')+'%':a.margin.status==='missing-price'?'Add market price':'No solution in range','EBITDA margin only; search −50% to 80%']]){const c=node('article',undefined,'metric');c.append(node('span',label,'metric-label'),node('strong',value,'metric-value'),node('span',note,'metric-note'));metrics.append(c);}
        $('decisionResults').append(metrics,node('p','Reverse DCF changes one driver at a time and holds the other assumptions fixed. Implied inputs are model solutions, not market consensus or verified company forecasts.','muted'));
        const title=node('h3','What moves the valuation most?'),list=node('div',undefined,'driver-list');
        const max=Math.max(...a.drivers.map(d=>d.swing),1e-9);
        for(const d of a.drivers){const row=node('div',undefined,'driver-row'),bar=node('div',undefined,'driver-track'),fill=node('span');fill.style.width=(d.swing/max*100)+'%';bar.append(fill);row.append(node('strong',d.label),bar,node('span',`−1pp: INR ${fmt(d.lower)} · +1pp: INR ${fmt(d.higher)}`));list.append(row);}
        const flags=node('ul');for(const text of a.flags)flags.append(node('li',text));if(!a.flags.length)flags.append(node('li','No threshold flags triggered. Source quality and business risks still need independent review.'));
        $('decisionResults').append(title,node('p','Each input moves independently by one percentage point; all other inputs stay fixed. Invalid input combinations are unavailable.','muted'),list,node('h3','Thesis review & model fragility'),flags);
      }catch(e){$('decisionError').textContent=e.message;}
    }
    writeSettings(defaults);host.addEventListener('input',()=>{if($('saveStatus'))$('saveStatus').textContent='Unsaved changes';render();});win.addEventListener('financial-model-state',render);
    // Project restoration may precede this module's DOM initialisation.
    if(win.pendingDecisionSettings){try{writeSettings(win.pendingDecisionSettings);}catch(e){$('decisionError').textContent=e.message;}delete win.pendingDecisionSettings;}
    render();
  }
  return {defaults,settings,reverse,analyze,appendWorkbook,mount,getSettings:()=>readSettings(),setSettings:s=>{if(typeof document!=='undefined'&&!mounted){globalThis.pendingDecisionSettings=settings(s);return;}writeSettings(s);if(typeof window!=='undefined')window.dispatchEvent(new Event('financial-model-state'));},getAnalysis:()=>current()};
});
