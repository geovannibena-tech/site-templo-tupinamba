import {supabase} from './supabase.js';
const css=document.createElement('style');css.textContent=`@media(max-width:760px){#templo-admin-mobile{position:fixed;right:12px;bottom:max(14px,env(safe-area-inset-bottom));z-index:9998}#templo-admin-mobile>button{border:1px solid #cbaa54;border-radius:30px;background:#11130f;color:#f4d77e;padding:13px 17px;box-shadow:0 8px 28px #0009;font-weight:800}#templo-admin-mobile .atalhos{display:none;position:absolute;bottom:58px;right:0;width:min(270px,85vw);background:#101410;border:1px solid #cbaa54;border-radius:16px;padding:12px;box-shadow:0 12px 35px #000b}#templo-admin-mobile.aberto .atalhos{display:grid;gap:8px}#templo-admin-mobile .atalhos button{background:#25251d;border:1px solid #6d5a32;color:#f8e9bd;padding:12px;text-align:left;border-radius:10px}}`;document.head.appendChild(css);
let ativo=false;
async function montar(){
 const {data:{user}}=await supabase.auth.getUser();if(!user){document.querySelector('#templo-admin-mobile')?.remove();return}
 const {data}=await supabase.from('perfis').select('tipo_usuario').eq('id',user.id).maybeSingle();
 if(data?.tipo_usuario!=='administrador'){document.querySelector('#templo-admin-mobile')?.remove();return}
 if(document.querySelector('#templo-admin-mobile'))return;
 const root=document.createElement('aside');root.id='templo-admin-mobile';
 const toggle=document.createElement('button');toggle.textContent='☰ Administração';toggle.setAttribute('aria-expanded','false');
 const links=document.createElement('div');links.className='atalhos';
 const itens=[['Central do Dia','#cdd-box'],['Central da Gira','#gda-box'],['Presenças','#admin-presencas-box']];
 for(const [titulo,selector] of itens){const b=document.createElement('button');b.textContent=titulo;b.onclick=()=>{const alvo=document.querySelector(selector);if(!alvo){alert('Abra esta área pelo painel administrativo para consultar os dados.');return}const botao=alvo.querySelector('button');if(getComputedStyle(alvo).display==='none')botao?.click();alvo.scrollIntoView({behavior:'smooth',block:'start'});root.classList.remove('aberto');toggle.setAttribute('aria-expanded','false')};links.appendChild(b)}
 toggle.onclick=()=>{ativo=!root.classList.contains('aberto');root.classList.toggle('aberto',ativo);toggle.setAttribute('aria-expanded',String(ativo))};
 root.append(toggle,links);document.body.appendChild(root);
}
setTimeout(()=>montar().catch(console.warn),1000);
window.addEventListener('templo:auth-ready',()=>setTimeout(()=>montar().catch(console.warn),500));
supabase.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT')document.querySelector('#templo-admin-mobile')?.remove()});
