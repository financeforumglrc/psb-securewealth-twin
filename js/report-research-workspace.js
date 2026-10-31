(function(){
  const key=company=>'ds-research-v1:'+company.trim().toLowerCase();
  function read(company){try{const record=JSON.parse(localStorage.getItem(key(company))||'null');return record?.company===company?record:ReportResearch.empty(company);}catch{return ReportResearch.empty(company);}}
  window.getModelResearch=()=>read(getCurrentParams().company);
  function open(){
    const company=getCurrentParams().company;let research=read(company);
    const dialog=document.createElement('dialog');dialog.className='model-research-editor';
    const title=document.createElement('h2');title.textContent='Professional report / research brief';
    const intro=document.createElement('p');intro.textContent='A 25–35-page working structure supported by company-specific evidence. The existing valuation brief remains available while research is developed.';
    const name=document.createElement('p');name.textContent='Company: '+company;
    const audience=document.createElement('select');audience.setAttribute('aria-label','Primary audience');
    for(const [value,label]of [['investment-committee','Investment committee / equity investor'],['management','Management / strategy team'],['credit-committee','Lender / credit committee']]){const option=document.createElement('option');option.value=value;option.textContent=label;audience.appendChild(option);}audience.value=research.audience;
    const mandate=document.createElement('textarea');mandate.rows=3;mandate.placeholder='What decision should this report support?';mandate.setAttribute('aria-label','Report mandate');mandate.value=research.mandate;
    const status=document.createElement('div');status.setAttribute('role','status');
    const sections=document.createElement('div');sections.className='research-chapter-list';
    function render(){
      const assessment=ReportResearch.assess(research);status.textContent=assessment.ready?'Research fields complete. Analytical and editorial review still required.':'Research still needed: '+assessment.missing.join(', ')+'.';sections.replaceChildren();
      for(const chapter of assessment.sections){const section=document.createElement('section'),heading=document.createElement('h3'),question=document.createElement('p'),state=document.createElement('p');heading.textContent=chapter.title+' · '+chapter.pages+' working pages';question.textContent=chapter.question;state.textContent=chapter.missing.length?'Evidence needed: '+chapter.missing.join(', '):'Evidence categories supplied; review required';section.append(heading,question,state);sections.appendChild(section);}
    }
    const controls=document.createElement('div');controls.className='research-controls';
    const save=document.createElement('button');save.textContent='Save brief';save.onclick=()=>{research={...research,audience:audience.value,mandate:mandate.value.trim()};try{localStorage.setItem(key(company),JSON.stringify(research));render();}catch{status.textContent='Could not save this research record on the device.';}};
    const upload=document.createElement('input');upload.type='file';upload.accept='.json,application/json';upload.setAttribute('aria-label','Import research evidence JSON');
    upload.onchange=async()=>{try{const file=upload.files[0];if(!file)return;if(file.size>2*1024*1024)throw new Error('Use an evidence record smaller than 2 MB.');const candidate=JSON.parse(await file.text());if(candidate.company!==company)throw new Error('The imported company does not match the selected model.');const errors=ReportResearch.validate(candidate);if(errors.length)throw new Error(errors.slice(0,4).join(' '));research=candidate;localStorage.setItem(key(company),JSON.stringify(research));audience.value=research.audience;mandate.value=research.mandate;render();}catch(error){status.textContent=error.message;}finally{upload.value='';}};
    const download=document.createElement('button');download.textContent='Export research record';download.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(research,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=company.replace(/[^a-z0-9_-]/gi,'_')+'.research.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    const close=document.createElement('button');close.textContent='Close';close.onclick=()=>dialog.close();
    controls.append(save,download,upload,close);dialog.append(title,intro,name,audience,mandate,status,sections,controls);dialog.addEventListener('close',()=>dialog.remove());document.body.appendChild(dialog);render();dialog.showModal();
  }
  document.addEventListener('DOMContentLoaded',()=>{const actions=document.querySelector('.workspace-export-actions');if(!actions)return;const button=document.createElement('button');button.type='button';button.textContent='Research brief';button.addEventListener('click',open);actions.appendChild(button);});
})();
