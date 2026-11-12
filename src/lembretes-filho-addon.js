import {supabase} from './supabase.js';
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const dateBR=v=>String(v||'').slice(0,10).split('-').reverse().join('/');
function days(v){return Math.round((new Date(String(v).slice(0,10)+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000)}
async function render(){
 const host=document.querySelector('#filho-painel-plus');
 if(!host)return;
 const {data:{user}}=await supabase.auth.getUser();if(!user)return;
 const [{data:perfil},{data:giras},{data:mensalidades}]=await Promise.all([
 supabase.from('perfis').select('tipo_usuario').eq('id',user.id).maybeSingle(),
 supabase.from('giras').select('id,titulo,data_gira').gte('data_gira',today()).order('data_gira',{ascending:true}).limit(1),
 supabase.from('mensalidades').select('id,valor,valor_pago,vencimento').eq('filho_id',user.id).order('vencimento',{ascending:false}).limit(12)
 ]);
 if(perfil?.tipo_usuario==='administrador')return;
 const avisos=[];
 const gira=giras?.[0];if(gira&&days(gira.data_gira)<=7)avisos.push({id:'g'+gira.id,title:'Próxima gira',body:gira.titulo+' — '+dateBR(gira.data_gira)});
 const pend=(mensalidades||[]).filter(m=>Number(m.valor||0)>Number(m.valor_pago||0)&&days(m.vencimento)<=7);
 for(const m of pend.slice(0,3))avisos.push({id:'m'+m.id,title:days(m.vencimento)<0?'Mensalidade em atraso':'Mensalidade próxima do vencimento',body:'Vencimento: '+dateBR(m.vencimento)});
 let box=host.querySelector('#templo-lembretes');if(!box){box=document.createElement('section');box.id='templo-lembretes';host.prepend(box)}
 box.replaceChildren();
 const title=document.createElement('h3');title.textContent='🔔 Meus lembretes';box.appendChild(title);
 const info=document.createElement('p');info.textContent=avisos.length?'Avisos importantes da sua semana.':'Nenhum lembrete urgente no momento.';box.appendChild(info);
 for(const aviso of avisos){const el=document.createElement('div');el.className='templo-lembrete';const strong=document.createElement('strong');strong.textContent=aviso.title;const p=document.createElement('p');p.textContent=aviso.body;el.append(strong,p);box.appendChild(el)}
}
const style=document.createElement('style');style.textContent=`#templo-lembretes{margin:12px 0 18px;padding:16px;border:1px solid #9c8247;border-radius:18px;background:#111810;color:#f5ead3}#templo-lembretes h3{margin:0 0 8px;color:#e4c46d}#templo-lembretes p{margin:4px 0 10px}.templo-lembrete{border-top:1px solid #675733;padding:10px 0}.templo-lembrete strong{color:#f1d483}`;document.head.appendChild(style);
async function start(){for(let i=0;i<30;i++){if(document.querySelector('#filho-painel-plus')){await render();return}await new Promise(r=>setTimeout(r,350))}}
start().catch(console.warn);window.addEventListener('templo:auth-ready',()=>start().catch(console.warn));
