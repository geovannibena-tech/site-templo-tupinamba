// Navegacao mobile progressiva: utiliza os paineis existentes, sem duplicar dados.
const menuFilho=[
 ['inicio','⌂','Início',['MEU ESPAÇO','MINHA SEMANA']],
 ['gira','◉','Gira',['MINHA PRÓXIMA GIRA','PRÓXIMA GIRA']],
 ['mensalidade','R$','Mensalidade',['MENSALIDADE']],
 ['estudos','▤','Estudos',['ESTUDOS','MINHA FORMAÇÃO']],
 ['perfil','●','Perfil',['MINHA CAMINHADA','RESUMO PESSOAL']]
];
function localizarSecao(painel, termos){
 const candidatos=[...painel.querySelectorAll('article,.filho-plus-card,.filho-v2-semana,.filho-v2-boasvindas')];
 return candidatos.find(el=>termos.some(t=>(el.innerText||'').toUpperCase().includes(t))) || null;
}
function montarNavegacaoFilho(){
 const painel=document.querySelector('#filho-painel-plus');
 const nav=document.querySelector('#app-filho-nav');
 if(!painel){nav?.remove();document.body.classList.remove('app-filho-ativo');return false;}
 document.body.classList.add('app-filho-ativo');
 if(nav)return true;
 const barra=document.createElement('nav');barra.id='app-filho-nav';barra.className='app-filho-nav';
 barra.setAttribute('aria-label','Navegação do Meu Templo');
 for(const [id,simbolo,titulo,termos] of menuFilho){
  const botao=document.createElement('button');botao.type='button';botao.dataset.aba=id;
  botao.setAttribute('aria-label',titulo);
  const icone=document.createElement('b');icone.textContent=simbolo;
  const texto=document.createElement('span');texto.textContent=titulo;
  botao.append(icone,texto);
  botao.addEventListener('click',()=>{
   const destino=id==='inicio'?painel:localizarSecao(painel,termos);
   if(!destino){window.alert('Esta área ainda não está disponível para seu acesso.');return;}
   destino.scrollIntoView({behavior:'smooth',block:'start'});
   barra.querySelectorAll('button').forEach(b=>{b.classList.remove('ativo');b.removeAttribute('aria-current')});
   botao.classList.add('ativo');botao.setAttribute('aria-current','page');
  });
  barra.appendChild(botao);
 }
 document.body.appendChild(barra);
 barra.querySelector('button')?.classList.add('ativo');
 return true;
}
function iniciarAppFilhoMobile(){
 if(montarNavegacaoFilho())return;
 let tentativas=0;const timer=setInterval(()=>{if(montarNavegacaoFilho()||++tentativas>=40)clearInterval(timer)},350);
}
if(!document.querySelector('#app-filho-mobile-css')){
 const estilo=document.createElement('style');estilo.id='app-filho-mobile-css';
 estilo.textContent=`.app-filho-nav{display:none}@media(max-width:760px){body.app-filho-ativo{padding-bottom:105px}.app-filho-nav{position:fixed;z-index:9999;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));left:10px;right:10px;bottom:max(10px,env(safe-area-inset-bottom));padding:7px;background:rgba(9,12,10,.97);border:1px solid rgba(213,182,94,.4);border-radius:20px;box-shadow:0 12px 32px rgba(0,0,0,.5)}.app-filho-nav button{border:0;background:transparent;color:#c5c4bc;min-height:54px;border-radius:13px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;min-width:0}.app-filho-nav button b{font-size:20px;line-height:1.2}.app-filho-nav button span{font-size:10px;font-weight:700;white-space:nowrap}.app-filho-nav button.ativo,.app-filho-nav button:focus-visible{background:rgba(213,182,94,.18);color:#f2d681;outline:2px solid rgba(213,182,94,.45)}.area-filho-v2 .filho-plus-card,.filho-v2-semana,.filho-v2-boasvindas{scroll-margin-top:18px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}}`;
 document.head.appendChild(estilo);
}
iniciarAppFilhoMobile();
window.addEventListener('templo:auth-ready',()=>setTimeout(iniciarAppFilhoMobile,500));
