function iniciarAreaFilhoV2(){
  const aplicar=()=>{
    const painel=document.querySelector('#filho-painel-plus');
    if(!painel||painel.dataset.v2==='1')return false;
    painel.dataset.v2='1';
    painel.classList.add('area-filho-v2');
    const titulo=painel.querySelector('.filho-plus-card h3');
    if(titulo){
      const topo=document.createElement('div');
      topo.className='filho-v2-boasvindas';
      topo.innerHTML='<span>✨ MEU ESPAÇO NO TEMPLO</span><strong>Minha semana, meus compromissos e minha caminhada em um só lugar.</strong>';
      painel.prepend(topo);
    }
    const cards=[...painel.querySelectorAll('.filho-plus-card')];
    cards.forEach((card,i)=>{card.style.animationDelay=`${i*45}ms`});
    return true;
  };
  if(aplicar())return;
  let tentativas=0;
  const timer=setInterval(()=>{if(aplicar()||++tentativas>30)clearInterval(timer)},400);
}
function cssAreaFilhoV2(){
  if(document.querySelector('#area-filho-v2-css'))return;
  const s=document.createElement('style');
  s.id='area-filho-v2-css';
  s.textContent=`.area-filho-v2{position:relative}.filho-v2-boasvindas{background:linear-gradient(135deg,#191b18,#0c0e0c);border:1px solid rgba(213,182,94,.45);border-radius:22px;padding:20px 22px;margin-bottom:15px;box-shadow:0 18px 38px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:5px}.filho-v2-boasvindas span{font-size:11px;letter-spacing:.14em;font-weight:900;color:#d5b65e}.filho-v2-boasvindas strong{font-size:17px;color:#f7f0df}.area-filho-v2 .filho-plus-card{transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;animation:filhoV2In .35s ease both}.area-filho-v2 .filho-plus-card:hover{transform:translateY(-2px);border-color:rgba(213,182,94,.55);box-shadow:0 16px 32px rgba(0,0,0,.3)}.area-filho-v2 .filho-plus-big{color:#f4df9a}.area-filho-v2 .filho-plus-status{background:rgba(213,182,94,.06)}@keyframes filhoV2In{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media(max-width:600px){.filho-v2-boasvindas{padding:16px;border-radius:18px}.filho-v2-boasvindas strong{font-size:15px}.area-filho-v2 .filho-plus-card:hover{transform:none}}`;
  document.head.appendChild(s);
}
cssAreaFilhoV2();
iniciarAreaFilhoV2();
window.addEventListener('templo:auth-ready',()=>setTimeout(iniciarAreaFilhoV2,500));
