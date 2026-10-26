function iniciarAreaFilhoV2(){
  const aplicar=()=>{
    const painel=document.querySelector('#filho-painel-plus');
    if(!painel)return false;
    painel.classList.add('area-filho-v2');
    if(!painel.querySelector('.filho-v2-boasvindas')){
      const topo=document.createElement('div');
      topo.className='filho-v2-boasvindas';
      topo.innerHTML='<span>✨ MEU ESPAÇO NO TEMPLO</span><strong>Minha semana, meus compromissos e minha caminhada em um só lugar.</strong><small>Confira sua próxima gira, mensalidade, presença e preparação.</small>';
      painel.prepend(topo);
    }
    const cards=[...painel.querySelectorAll('.filho-plus-card')];
    cards.forEach((card,i)=>{card.style.animationDelay=`${i*45}ms`});
    if(!painel.querySelector('.filho-v2-atalhos')){
      const atalhos=document.createElement('div');
      atalhos.className='filho-v2-atalhos';
      atalhos.innerHTML='<button data-alvo="📅">📅 Próxima gira</button><button data-alvo="🧳">🧳 O que levar</button><button data-alvo="💰">💰 Mensalidade</button><button data-alvo="✅">✅ Presenças</button>';
      const boas=painel.querySelector('.filho-v2-boasvindas');boas.after(atalhos);
      atalhos.querySelectorAll('button').forEach(b=>b.onclick=()=>{const c=cards.find(x=>(x.innerText||'').includes(b.dataset.alvo));c?.scrollIntoView({behavior:'smooth',block:'center'})});
    }
    const gira=cards.find(x=>(x.innerText||'').includes('MINHA PRÓXIMA GIRA'));
    const kit=cards.find(x=>(x.innerText||'').includes('MEU KIT'));
    if(gira&&!painel.querySelector('.filho-v2-semana')){
      const semana=document.createElement('article');semana.className='filho-v2-semana';
      semana.innerHTML='<span>⭐ MINHA SEMANA NO TEMPLO</span><h3>Prepare-se para a próxima gira</h3><p>'+((gira.innerText||'').replace('📅 MINHA PRÓXIMA GIRA','').trim()||'A próxima gira aparecerá aqui assim que for cadastrada.')+'</p><div class="filho-v2-dica">💡 Separe seu material com antecedência e confira as orientações da casa.</div>';
      const atalhos=painel.querySelector('.filho-v2-atalhos');atalhos.after(semana);
    }
    if(kit&&!kit.dataset.checklist){
      kit.dataset.checklist='1';
      const lis=[...kit.querySelectorAll('li')];
      if(lis.length){
        lis.forEach((li,i)=>{const texto=li.textContent.replace(/^[✓○]\s*/,'');li.innerHTML=`<label class="filho-v2-check"><input type="checkbox" data-check="${i}"><span>${texto}</span></label>`});
        const key='templo-kit-'+new Date().toISOString().slice(0,10);
        let salvo={};try{salvo=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
        kit.querySelectorAll('input[data-check]').forEach(inp=>{inp.checked=!!salvo[inp.dataset.check];inp.onchange=()=>{salvo[inp.dataset.check]=inp.checked;localStorage.setItem(key,JSON.stringify(salvo));atualizarProgresso()}});
        const prog=document.createElement('div');prog.className='filho-v2-progresso';prog.innerHTML='<div><b>Preparação</b><span>0%</span></div><i><em></em></i>';kit.appendChild(prog);
        function atualizarProgresso(){const all=[...kit.querySelectorAll('input[data-check]')],ok=all.filter(x=>x.checked).length,pct=all.length?Math.round(ok/all.length*100):0;prog.querySelector('span').textContent=pct+'%';prog.querySelector('em').style.width=pct+'%'} atualizarProgresso();
      }
    }
    return true;
  };
  if(aplicar())return;let tentativas=0;const timer=setInterval(()=>{if(aplicar()||++tentativas>30)clearInterval(timer)},400);
}
function cssAreaFilhoV2(){
  if(document.querySelector('#area-filho-v2-css'))return;const s=document.createElement('style');s.id='area-filho-v2-css';
  s.textContent=`.area-filho-v2{position:relative}.filho-v2-boasvindas{background:linear-gradient(135deg,#191b18,#0c0e0c);border:1px solid rgba(213,182,94,.45);border-radius:22px;padding:20px 22px;margin-bottom:12px;box-shadow:0 18px 38px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:5px}.filho-v2-boasvindas span,.filho-v2-semana>span{font-size:11px;letter-spacing:.14em;font-weight:900;color:#d5b65e}.filho-v2-boasvindas strong{font-size:18px;color:#f7f0df}.filho-v2-boasvindas small{opacity:.7}.filho-v2-atalhos{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 14px}.filho-v2-atalhos button{cursor:pointer;background:rgba(213,182,94,.07);color:#f5ecd6;border:1px solid rgba(213,182,94,.28);border-radius:14px;padding:11px 8px;font-weight:700}.filho-v2-atalhos button:hover{border-color:#d5b65e;background:rgba(213,182,94,.13)}.filho-v2-semana{background:linear-gradient(145deg,rgba(38,31,14,.72),rgba(11,15,12,.98));border:1px solid rgba(213,182,94,.42);border-radius:20px;padding:18px 20px;margin-bottom:14px}.filho-v2-semana h3{margin:7px 0}.filho-v2-semana p{white-space:pre-line;line-height:1.55}.filho-v2-dica{margin-top:12px;padding:10px 12px;border-radius:12px;background:rgba(213,182,94,.08);font-size:13px}.area-filho-v2 .filho-plus-card{transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;animation:filhoV2In .35s ease both}.area-filho-v2 .filho-plus-card:hover{transform:translateY(-2px);border-color:rgba(213,182,94,.55);box-shadow:0 16px 32px rgba(0,0,0,.3)}.area-filho-v2 .filho-plus-big{color:#f4df9a}.filho-v2-check{display:flex;align-items:center;gap:10px;cursor:pointer}.filho-v2-check input{width:18px;height:18px;accent-color:#d5b65e}.filho-v2-check input:checked+span{text-decoration:line-through;opacity:.55}.filho-v2-progresso{margin-top:14px}.filho-v2-progresso>div{display:flex;justify-content:space-between;font-size:12px;margin-bottom:7px}.filho-v2-progresso i{display:block;height:7px;background:rgba(255,255,255,.08);border-radius:10px;overflow:hidden}.filho-v2-progresso em{display:block;height:100%;width:0;background:#d5b65e;transition:width .25s;border-radius:10px}@keyframes filhoV2In{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media(max-width:600px){.filho-v2-boasvindas{padding:16px;border-radius:18px}.filho-v2-boasvindas strong{font-size:15px}.filho-v2-atalhos{grid-template-columns:repeat(2,1fr)}.area-filho-v2 .filho-plus-card:hover{transform:none}.filho-v2-semana{padding:16px}}`;
  document.head.appendChild(s);
}
cssAreaFilhoV2();iniciarAreaFilhoV2();window.addEventListener('templo:auth-ready',()=>setTimeout(iniciarAreaFilhoV2,500));
