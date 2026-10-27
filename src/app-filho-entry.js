// Entrada exclusiva do app dos filhos: /app-filho
const ehAppFilho = location.pathname === '/app-filho' || location.pathname === '/app-filho/' || new URLSearchParams(location.search).get('app') === 'filho';

// Migra o link antigo para a rota estável, sem query string na identidade do app.
if (new URLSearchParams(location.search).get('app') === 'filho' && location.pathname === '/') {
  history.replaceState(null, '', '/app-filho');
}

function configurarEntradaApp(){
 if(!ehAppFilho) return;
 document.documentElement.classList.add('modo-app-filho');
 let tentativas=0;
 const timer=setInterval(()=>{
  const root=document.querySelector('#root');
  if(!root || !root.innerText) return;
  const texto=root.innerText.toLowerCase();
  const jaLogado=document.querySelector('#filho-painel-plus');
  if(jaLogado){ clearInterval(timer); return; }
  const botoes=[...document.querySelectorAll('button,a')];
  const acesso=botoes.find(el=>/área do filho|area do filho|entrar|login/.test((el.innerText||'').toLowerCase()));
  if(acesso && texto.includes('área do filho')){ acesso.click(); clearInterval(timer); }
  if(++tentativas>25) clearInterval(timer);
 },250);
}

configurarEntradaApp();
