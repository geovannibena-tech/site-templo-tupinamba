let deferredInstallPrompt = null;

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

function showInstallHelp(){
  const existing=document.querySelector('#templo-pwa-help');
  if(existing){existing.remove();return;}
  const box=document.createElement('div');
  box.id='templo-pwa-help';
  const ios=isIOS();
  box.innerHTML=`<div class="pwa-help-card"><button class="pwa-help-close" aria-label="Fechar">×</button><div class="pwa-help-icon">📲</div><h3>Instalar Meu Templo</h3><p>${ios?'No iPhone, toque em <b>Compartilhar</b> no Safari e depois em <b>Adicionar à Tela de Início</b>.':'No navegador, abra o menu e escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.'}</p><small>Depois de instalado, abra pelo ícone <b>Meu Templo</b>. Ele abrirá em tela cheia, como aplicativo.</small></div>`;
  document.body.appendChild(box);
  box.querySelector('.pwa-help-close').onclick=()=>box.remove();
  box.onclick=e=>{if(e.target===box)box.remove()};
}

async function installApp(){
  if(isStandalone()) return;
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    try{await deferredInstallPrompt.userChoice}catch{}
    deferredInstallPrompt=null;
    refreshInstallButtons();
    return;
  }
  showInstallHelp();
}

function refreshInstallButtons(){
  const installed=isStandalone();
  document.querySelectorAll('[data-templo-install]').forEach(btn=>{
    btn.textContent=installed?'✓ App instalado':'📲 Instalar App';
    btn.disabled=installed;
  });
}

function addInstallButton(){
  if(isStandalone()) return;
  const painel=document.querySelector('#filho-painel-plus');
  if(!painel || painel.querySelector('[data-templo-install]')) return;
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='templo-pwa-install';
  btn.dataset.temploInstall='1';
  btn.textContent='📲 Instalar App';
  btn.onclick=installApp;
  const welcome=painel.querySelector('.filho-v2-boasvindas');
  (welcome||painel).appendChild(btn);
  refreshInstallButtons();
}

function addStyles(){
  if(document.querySelector('#templo-pwa-css'))return;
  const style=document.createElement('style');
  style.id='templo-pwa-css';
  style.textContent=`.templo-pwa-install{margin-top:12px;align-self:flex-start;border:1px solid #d5b65e;background:linear-gradient(135deg,#d5b65e,#9b792d);color:#11150f;border-radius:14px;padding:11px 16px;font-weight:900;cursor:pointer;box-shadow:0 8px 24px rgba(213,182,94,.18)}.templo-pwa-install:disabled{opacity:.7;cursor:default}#templo-pwa-help{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:20px}.pwa-help-card{position:relative;width:min(420px,100%);background:linear-gradient(145deg,#151a16,#080d0a);border:1px solid rgba(213,182,94,.6);border-radius:22px;padding:26px 22px;color:#f7f0df;box-shadow:0 24px 70px rgba(0,0,0,.55);text-align:center}.pwa-help-icon{font-size:42px}.pwa-help-card h3{color:#d5b65e;margin:10px 0}.pwa-help-card p{line-height:1.55}.pwa-help-card small{display:block;opacity:.72;line-height:1.45}.pwa-help-close{position:absolute;right:12px;top:8px;border:0;background:transparent;color:#f7f0df;font-size:28px;cursor:pointer}`;
  document.head.appendChild(style);
}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;addInstallButton();refreshInstallButtons()});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;refreshInstallButtons()});
window.addEventListener('templo:auth-ready',()=>setTimeout(addInstallButton,700));
window.addEventListener('DOMContentLoaded',()=>{addStyles();let tries=0;const t=setInterval(()=>{addInstallButton();if(document.querySelector('[data-templo-install]')||++tries>40)clearInterval(t)},400)});
