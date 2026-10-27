// Entrada exclusiva do PWA dos filhos: /?app=filho
const ehAppFilho = new URLSearchParams(location.search).get('app') === 'filho';

function configurarEntradaApp(){
 if(!ehAppFilho) return;
 document.documentElement.classList.add('modo-app-filho');
 // Mantem o link exclusivo focado no acesso do filho quando ainda nao ha sessao.
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

function instalarPWA(){
 if(!ehAppFilho) return;
 let promptInstalacao=null;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptInstalacao=e;mostrar();});
 const mostrar=()=>{
  if(document.querySelector('#instalar-meu-templo')) return;
  const b=document.createElement('button');
  b.id='instalar-meu-templo'; b.type='button'; b.textContent='📲 Instalar Meu Templo';
  b.onclick=async()=>{
   if(promptInstalacao){promptInstalacao.prompt();await promptInstalacao.userChoice;promptInstalacao=null;b.remove();return;}
   const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
   alert(ios?'No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.':'No menu do navegador, escolha “Instalar app” ou “Adicionar à tela inicial”.');
  };
  document.body.appendChild(b);
 };
 // O link exclusivo sempre mostra uma forma clara de instalar.
 setTimeout(mostrar,900);
 window.addEventListener('appinstalled',()=>document.querySelector('#instalar-meu-templo')?.remove());
}

function css(){
 if(!ehAppFilho) return;
 const s=document.createElement('style');
 s.textContent=`#instalar-meu-templo{position:fixed;z-index:10050;right:16px;bottom:18px;border:1px solid rgba(228,200,111,.55);border-radius:16px;padding:13px 16px;background:#07120e;color:#e4c86f;font-weight:900;box-shadow:0 14px 38px rgba(0,0,0,.45);cursor:pointer}.app-filho-nav~#instalar-meu-templo{bottom:92px}@media(max-width:760px){#instalar-meu-templo{left:16px;right:16px;width:calc(100% - 32px)}}`;
 document.head.appendChild(s);
}
css();configurarEntradaApp();instalarPWA();
