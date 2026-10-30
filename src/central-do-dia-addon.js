import { supabase } from './supabase.js'

const hojeISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,10)
const moeda = v => Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const dataBR = v => v ? String(v).slice(0,10).split('-').reverse().join('/') : '—'

async function ehAdmin(){
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) return false
  const { data } = await supabase.from('perfis').select('tipo_usuario').eq('id',user.id).maybeSingle()
  return data?.tipo_usuario === 'administrador'
}

async function abrir(){
  const box=document.querySelector('#cdd-box'), body=document.querySelector('#cdd-body')
  if(!box||!body)return
  box.style.display='block'; body.innerHTML='<p>Carregando resumo...</p>'
  try{
    const [rm,rf,rg,rp]=await Promise.all([
      supabase.rpc('admin_listar_mensalidades'),
      supabase.rpc('admin_listar_filhos'),
      supabase.rpc('admin_listar_giras'),
      supabase.rpc('admin_listar_presencas')
    ])
    const filhos=(rf.data||[]).filter(x=>x.ativo)
    const mensalidades=rm.data||[]
    const abertas=mensalidades.filter(x=>Number(x.saldo ?? (Number(x.valor||0)-Number(x.valor_pago||0)))>0)
    const atrasadas=abertas.filter(x=>String(x.vencimento||'')<hojeISO())
    const saldo=abertas.reduce((s,x)=>s+Number(x.saldo ?? (Number(x.valor||0)-Number(x.valor_pago||0))),0)
    const giras=(rg.data||[]).filter(x=>String(x.data_gira||'')>=hojeISO()).sort((a,b)=>String(a.data_gira).localeCompare(String(b.data_gira)))
    const gira=giras[0]
    const pres=rp.data||[]
    const respondidos=gira ? pres.filter(p=>String(p.gira_id)===String(gira.id)&&(p.confirmado===true || /não vai|nao vai/i.test(p.observacoes||''))) : []
    const semResposta=gira ? filhos.filter(f=>!respondidos.some(p=>p.filho_id===f.id)) : []
    body.innerHTML=`<div class="cdd-grid">
      <div class="cdd-card"><small>MENSALIDADES EM ABERTO</small><b>${abertas.length}</b><span>${moeda(saldo)}</span></div>
      <div class="cdd-card"><small>ATRASADAS</small><b>${atrasadas.length}</b><span>precisam de atenção</span></div>
      <div class="cdd-card"><small>PRÓXIMA GIRA</small><b class="cdd-title">${gira?.titulo||'Sem gira'}</b><span>${dataBR(gira?.data_gira)}</span></div>
      <div class="cdd-card"><small>SEM RESPOSTA</small><b>${semResposta.length}</b><span>da próxima gira</span></div>
      <div class="cdd-wide"><h3>💰 Financeiro que precisa de atenção</h3>${atrasadas.length?atrasadas.slice(0,8).map(m=>`<p><strong>${m.nome||m.filho_nome||'Filho'}</strong><span>Venceu ${dataBR(m.vencimento)} · ${moeda(m.saldo ?? (Number(m.valor||0)-Number(m.valor_pago||0)))}</span></p>`).join(''):'<p>✅ Nenhuma mensalidade atrasada.</p>'}</div>
      <div class="cdd-wide"><h3>🕯️ Próxima gira</h3>${gira?`<p><strong>${gira.titulo}</strong><span>${dataBR(gira.data_gira)} · ${semResposta.length} aguardando resposta</span></p>${semResposta.slice(0,10).map(f=>`<p><strong>${f.nome}</strong><span>${f.cargo||'Sem cargo informado'}</span></p>`).join('')}`:'<p>Nenhuma gira futura cadastrada.</p>'}</div>
    </div>`
  }catch(e){ body.innerHTML='<p>Não foi possível carregar a Central do Dia.</p>'; console.warn('[Central do Dia]',e) }
}

async function iniciar(){
  if(document.querySelector('#cdd-open') || !(await ehAdmin())) return
  const style=document.createElement('style'); style.id='cdd-style'; style.textContent=`#cdd-open{position:fixed;right:18px;bottom:200px;z-index:9995;background:#d1b15f;color:#07120e;border:0;border-radius:99px;padding:12px 16px;font-weight:900;box-shadow:0 8px 28px #0008}#cdd-box{display:none;position:fixed;inset:0;z-index:10001;background:rgba(2,7,5,.95);overflow:auto;padding:20px}.cdd-shell{max-width:1050px;margin:auto;background:#08150f;color:#fff;padding:22px;border:1px solid #786536;border-radius:20px}.cdd-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.cdd-head button{background:transparent;color:#fff;border:1px solid #665b3b;border-radius:10px;padding:8px 12px}.cdd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.cdd-card,.cdd-wide{background:#102219;border:1px solid #403721;border-radius:14px;padding:15px}.cdd-card small{opacity:.7}.cdd-card b{display:block;font-size:26px;margin:5px 0}.cdd-card .cdd-title{font-size:17px}.cdd-card span,.cdd-wide span{display:block;opacity:.72;font-size:13px}.cdd-wide{grid-column:span 2}.cdd-wide p{padding:8px 0;border-bottom:1px solid #ffffff12;margin:0}.cdd-wide h3{margin-top:0}@media(max-width:760px){.cdd-grid{grid-template-columns:1fr 1fr}.cdd-wide{grid-column:1/-1}}@media(max-width:480px){.cdd-grid{grid-template-columns:1fr}.cdd-wide{grid-column:1}#cdd-open{bottom:200px;right:10px}}`; document.head.appendChild(style)
  const btn=document.createElement('button'); btn.id='cdd-open'; btn.textContent='🔔 Central do Dia'; btn.onclick=abrir
  const box=document.createElement('div'); box.id='cdd-box'; box.innerHTML='<div class="cdd-shell"><div class="cdd-head"><div><small>PAINEL ADMINISTRATIVO</small><h2>Central do Dia</h2></div><button id="cdd-close">✕ Fechar</button></div><div id="cdd-body"></div></div>'
  document.body.append(btn,box); box.querySelector('#cdd-close').onclick=()=>box.style.display='none'
}

const iniciarDepois=()=>setTimeout(()=>iniciar().catch(console.warn),550)
window.addEventListener('templo:auth-ready',iniciarDepois)
iniciarDepois()
