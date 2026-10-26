import { supabase } from './supabase.js'

const br = v => { if (!v) return '—'; const [a,m,d]=String(v).slice(0,10).split('-'); return `${d}/${m}/${a}` }
const hoje = () => new Date().toISOString().slice(0,10)

async function dadosFilho(){
  const {data:{session}}=await supabase.auth.getSession(); if(!session) return null
  const uid=session.user.id
  const [p,g,pr,m,fg,mat]=await Promise.all([
    supabase.from('perfis').select('*').eq('id',uid).maybeSingle(),
    supabase.from('giras').select('*').order('data_gira',{ascending:true}),
    supabase.from('presencas_gira').select('*').eq('filho_id',uid),
    supabase.from('mensalidades').select('*').eq('filho_id',uid).order('competencia',{ascending:false}),
    supabase.from('funcoes_gira').select('*').eq('filho_id',uid),
    supabase.from('materiais_gira').select('*')
  ])
  return {uid,perfil:p.data,giras:g.data||[],presencas:pr.data||[],mensalidades:m.data||[],funcoes:fg.data||[],materiais:mat.data||[]}
}

function css(){ if(document.getElementById('filho-addon-css'))return; const s=document.createElement('style');s.id='filho-addon-css';s.textContent=`
#filho-painel-plus{margin:22px 0}.filho-plus-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.filho-plus-card{background:linear-gradient(145deg,rgba(19,28,24,.98),rgba(8,15,12,.98));border:1px solid rgba(203,164,73,.28);border-radius:18px;padding:18px;box-shadow:0 12px 28px rgba(0,0,0,.18)}.filho-plus-card h3{margin:7px 0 10px}.filho-plus-tag{font-size:11px;letter-spacing:.12em;color:#d5b65e;font-weight:800}.filho-plus-big{font-size:26px;font-weight:800;margin:4px 0}.filho-plus-muted{opacity:.75;font-size:13px}.filho-plus-status{display:inline-block;border:1px solid rgba(203,164,73,.35);border-radius:999px;padding:5px 9px;margin:3px;font-size:12px}.filho-plus-list{margin:10px 0;padding:0;list-style:none}.filho-plus-list li{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07)}
`;document.head.appendChild(s)}

function montar(d){
  const p=d.perfil;if(!p||p.tipo_usuario==='administrador')return
  const root=document.querySelector('#root');if(!root||document.getElementById('filho-painel-plus'))return
  const texto=root.innerText.toLowerCase(); if(!texto.includes('área do filho')&&!texto.includes('area do filho'))return
  const futuras=d.giras.filter(x=>x.data_gira>=hoje()); const prox=futuras[0]
  const historico=d.presencas.filter(x=>{const g=d.giras.find(y=>String(y.id)===String(x.gira_id));return g&&g.data_gira<hoje()})
  const presentes=historico.filter(x=>x.presente===true).length; const faltas=historico.filter(x=>x.presente===false).length; const total=presentes+faltas; const freq=total?Math.round(presentes/total*100):0
  const presProx=prox&&d.presencas.find(x=>String(x.gira_id)===String(prox.id)); const func=prox&&d.funcoes.find(x=>String(x.gira_id)===String(prox.id))
  const cargo=(p.cargo||'').toLowerCase(); const itens=prox?d.materiais.filter(x=>String(x.gira_id)===String(prox.id)&&(!x.cargo||cargo.includes(String(x.cargo).toLowerCase())||String(x.cargo).toLowerCase().includes(cargo))):[]
  const mens=d.mensalidades[0]; let st='Sem lançamento'; if(mens){const v=Number(mens.valor||0),pg=Number(mens.valor_pago||0);st=pg>=v&&v>0?'Pago':mens.vencimento<hoje()?'Atrasado':'Pendente'}
  const box=document.createElement('section');box.id='filho-painel-plus';box.innerHTML=`<div class="filho-plus-grid">
  <article class="filho-plus-card"><span class="filho-plus-tag">🏠 MEU PAINEL</span><h3>Olá, ${p.nome||'filho(a)'}!</h3><div class="filho-plus-muted">${p.cargo||'Filho da casa'}</div>${prox?`<p>Próxima gira</p><div class="filho-plus-big">${br(prox.data_gira)}</div><b>${prox.titulo}</b><p><span class="filho-plus-status">${presProx?.confirmado?'✓ Presença confirmada':'⏳ Aguardando confirmação'}</span></p>`:'<p>Nenhuma próxima gira cadastrada.</p>'}</article>
  <article class="filho-plus-card"><span class="filho-plus-tag">✅ MINHA PRESENÇA</span><h3>${freq}% de frequência</h3><p><span class="filho-plus-status">${presentes} presente(s)</span><span class="filho-plus-status">${faltas} falta(s)</span></p><div class="filho-plus-muted">Histórico calculado pelas giras já realizadas.</div></article>
  <article class="filho-plus-card"><span class="filho-plus-tag">📅 MINHA PRÓXIMA GIRA</span>${prox?`<h3>${prox.titulo}</h3><p>${br(prox.data_gira)} ${prox.horario?'• '+String(prox.horario).slice(0,5):''}</p><p><b>Minha função:</b> ${func?.funcao||'Ainda não definida'}</p><div class="filho-plus-muted">${prox.orientacoes||'Confira as orientações da casa antes da gira.'}</div>`:'<h3>Sem gira agendada</h3>'}</article>
  <article class="filho-plus-card"><span class="filho-plus-tag">🧳 MEU KIT</span><h3>${p.cargo||'Materiais da gira'}</h3>${itens.length?`<ul class="filho-plus-list">${itens.map(x=>`<li>${x.obrigatorio?'✓':'○'} ${x.item}</li>`).join('')}</ul>`:'<p class="filho-plus-muted">Os materiais específicos aparecerão aqui quando forem cadastrados para a próxima gira.</p>'}</article>
  <article class="filho-plus-card"><span class="filho-plus-tag">💰 MINHA MENSALIDADE</span><h3>${st}</h3>${mens?`<p>Vencimento: ${br(mens.vencimento)}</p><p><b>R$ ${Number(mens.valor||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></p>`:`<p class="filho-plus-muted">Nenhuma mensalidade lançada.</p>`}</article>
  <article class="filho-plus-card"><span class="filho-plus-tag">🌿 MINHA CAMINHADA</span><h3>${p.cargo||'Filho da casa'}</h3><p>Entrada na casa: <b>${br(p.data_entrada)}</b></p><p class="filho-plus-muted">Sua trajetória no templo fica organizada aqui.</p></article>
  </div>`
  const main=root.querySelector('main')||root; main.prepend(box)
}

async function iniciar(){css();const d=await dadosFilho();if(!d)return;let n=0;const t=setInterval(()=>{montar(d);if(document.getElementById('filho-painel-plus')||++n>20)clearInterval(t)},400)}

supabase?.auth?.onAuthStateChange(()=>setTimeout(iniciar,300)); iniciar()
