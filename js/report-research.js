/* Research metadata travels with the model, independently of presentation. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ReportResearch=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const chapters=[
    {id:'executive',title:'Executive conclusions',pages:2,requires:['mandate','business','history','forecast','valuation','risks'],question:'What does the evidence imply for the stated decision?'},
    {id:'business',title:'Company and business model',pages:3,requires:['business','segments'],question:'How does the company earn money, and which segments drive its economics?'},
    {id:'industry',title:'Industry and competitive position',pages:3,requires:['industry','competition'],question:'Which external forces and competitive advantages affect the forecast?'},
    {id:'history',title:'Historical financial performance',pages:4,requires:['history'],question:'What explains historical growth, profitability and cash conversion?'},
    {id:'forecast',title:'Forecast and reinvestment',pages:3,requires:['forecast'],question:'Which operating assumptions drive revenue, margins and cash requirements?'},
    {id:'valuation',title:'Valuation and market cross-checks',pages:4,requires:['valuation','capital','peers'],question:'What is the value range, and how is it supported?'},
    {id:'risk',title:'Scenarios, sensitivities and risks',pages:3,requires:['forecast','risks'],question:'What breaks the investment case and what evidence would change the conclusion?'},
    {id:'actions',title:'Value creation and diligence',pages:2,requires:['business','risks'],question:'Which actions and evidence gaps matter most to the decision?'},
    {id:'appendix',title:'Detailed schedules, methodology and sources',pages:4,requires:['history','sources'],question:'Can a reviewer trace the report to the source and reproduce the calculations?'}
  ];
  const categories=new Set(['mandate','business','segments','industry','competition','history','forecast','valuation','capital','peers','risks','sources']);
  const kinds=new Set(['actual','assumption','calculation','interpretation']);
  function empty(company=''){
    return {version:1,company,audience:'investment-committee',asOf:null,scope:'consolidated',currency:'INR',unit:'crore',mandate:'',sources:[],claims:[],historical:[],notes:[]};
  }
  function validate(research){
    const errors=[];
    if(!research||research.version!==1)return ['Unsupported research record version.'];
    const sources=new Map();
    for(const source of research.sources||[]){
      if(!source.id||sources.has(source.id)){errors.push('Source IDs must be present and unique.');continue;}
      sources.set(source.id,source);
      if(!source.title?.trim())errors.push('Source '+source.id+' needs a title.');
      if(!source.url&&!source.document)errors.push('Source '+source.id+' needs a URL or document reference.');
      if(source.url){try{if(!['https:','http:'].includes(new URL(source.url).protocol))throw Error();}catch{errors.push('Source '+source.id+' has an invalid URL.');}}
      if(!source.accessedAt||!Number.isFinite(Date.parse(source.accessedAt)))errors.push('Source '+source.id+' needs a valid access date.');
    }
    const ids=new Set();
    for(const claim of research.claims||[]){
      if(!claim.id||ids.has(claim.id))errors.push('Claim IDs must be present and unique.');ids.add(claim.id);
      if(!categories.has(claim.category))errors.push('Claim '+claim.id+' has an unknown category.');
      if(!kinds.has(claim.kind))errors.push('Claim '+claim.id+' has an unknown evidence kind.');
      if(!claim.text?.trim())errors.push('Claim '+claim.id+' needs content.');
      for(const id of claim.sourceIds||[])if(!sources.has(id))errors.push('Claim '+claim.id+' references missing source '+id+'.');
      if(claim.kind==='actual'&&(!claim.sourceIds?.length||!claim.locator?.trim()))errors.push('Factual claim '+claim.id+' needs a source and page/table locator.');
      if(['assumption','calculation'].includes(claim.kind)&&!claim.method?.trim())errors.push('Claim '+claim.id+' needs an assumption rationale or calculation method.');
    }
    const periods=new Set();
    for(const year of research.historical||[]){
      if(!year.period||periods.has(year.period))errors.push('Historical periods must be present and unique.');periods.add(year.period);
      if(year.kind!=='actual')errors.push('Historical records must explicitly be labelled actual.');
      if(!year.sourceIds?.length||year.sourceIds.some(id=>!sources.has(id)))errors.push('Historical period '+year.period+' needs valid sources.');
      if(year.scope!==research.scope||year.currency!==research.currency||year.unit!==research.unit)errors.push('Historical period '+year.period+' has inconsistent scope, currency or units.');
      for(const key of ['revenue','ebitda','netIncome','operatingCashFlow','totalAssets','totalLiabilities','equity'])if(!Number.isFinite(year[key]))errors.push('Historical period '+year.period+' needs '+key+'.');
      if([year.totalAssets,year.totalLiabilities,year.equity].every(Number.isFinite)&&Math.abs(year.totalAssets-year.totalLiabilities-year.equity)>Math.max(1,Math.abs(year.totalAssets))*1e-5)errors.push('Historical balance sheet does not reconcile for '+year.period+'.');
    }
    return errors;
  }
  function assess(research){
    const errors=validate(research),present=new Set((research?.claims||[]).filter(claim=>claim.text?.trim()).map(claim=>claim.category));
    if(research?.mandate?.trim())present.add('mandate');if(research?.sources?.length)present.add('sources');
    if((research?.historical||[]).length<3)present.delete('history');
    const sections=chapters.map(chapter=>({...chapter,missing:chapter.requires.filter(category=>!present.has(category))}));
    const missing=[...new Set(sections.flatMap(section=>section.missing))];
    if(!research?.company?.trim())missing.push('company');
    return {errors,missing,sections,ready:errors.length===0&&missing.length===0,workingPageRange:[25,35],plannedPages:2+chapters.reduce((sum,chapter)=>sum+chapter.pages,0),label:'Research completeness, not a measure of investment confidence'};
  }
  return {empty,validate,assess,chapters};
});
