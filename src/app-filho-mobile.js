function iniciarAppFilhoMobile(){
 const aplicar=()=>{
  const painel=document.querySelector('#filho-painel-plus');
  if(!painel)return false;
  document.body.classList.add('app-filho-ativo');
  if(!document.querySelector('#app-filho-nav')){
   const nav=document.createElement('nav');nav.id='app-filho-nav';nav.className='app-filho-nav';
   nav.innerHTML='<button data-alvo="MEU ESPAÇO">⌂<span>Início</span></button><button data-alvo="PRÓXIMA GIRA">◉<span>Gira</span></button><button data-alvo="MENSALIDADE">$<span>Mensalidade</span></button><button data-alvo="ESTUDOS">▤<span>Estudos</span></button><button data-alvo="MINHA CAMINHADA">●<span>Perfil</span></button>';
   document.body.appendChild(nav);
   nav.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
    const alvo=btn.dataset.alvo;
    let el;
    if(alvo==='MEU ESPAÇO')el=painel;
    else el=[...painel.querySelectorAll('article,.filho-plus-card,div')].find(x=>(x.innerText||'').toUpperCase().includes(alvo));
    el?.scrollIntoView({behavior:'smooth',block:'start'});
    nav.querySelectorAll('button').forEach(x=>x.classList.remove('ativo'));btn.classList.add('ativo');
   });
   nav.querySelector('button')?.classList.add('ativo');
  }
  return true;
 };
 if(aplicar())return;let n=0;const t=setInterval(()=>{if(aplicar()||++n>35)clearInterval(t)},350);
}
function cssAppFilhoMobile(){if(document.querySelector('#app-filho-mobile-css'))return;const s=document.createElement('style');s.id='app-filho-mobile-css';s.textContent=`.app-filho-nav{display:none}@media(max-width:760px){body.app-filho-ativo{padding-bottom:86px}.app-filho-nav{position:fixed;z-index:9999;display:grid;grid-template-columns:repeat(5,1fr);left:10px;right:10px;bottom:max(10px,env(safe-area-inset-bottom));padding:7px;background:rgba(7,18,14,.96);border:1px solid rgba(213,182,94,.35);border-radius:22px;box-shadow:0 15px 40px rgba(0,0,0,.48);backdrop-filter:blur(16px)}.app-filho-nav button{border:0;background:transparent;color:rgba(255,255,255,.62);min-height:54px;border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:18px}.app-filho-nav button span{font-size:9px;font-weight:800}.app-filho-nav button.ativo{background:rgba(213,182,94,.12);color:#e4c86f}.area-filho-v2{padding-bottom:18px}.area-filho-v2 .filho-plus-card,.filho-v2-semana,.filho-v2-boasvindas{scroll-margin-top:14px}}`;document.head.appendChild(s)}
cssAppFilhoMobile();iniciarAppFilhoMobile();window.addEventListener('templo:auth-ready',()=>setTimeout(iniciarAppFilhoMobile,550));
