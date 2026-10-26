import { supabase } from './supabase.js'

let dados = { filhos: [], giras: [], presencas: [] }
let giraId = ''

const dataBR = v => {
  if (!v) return '—'
  const [a,m,d] = String(v).slice(0,10).split('-')
  return `${d}/${m}/${a}`
}

function wa(tel, msg) {
  let n = String(tel || '').replace(/\D/g, '')
  if (!n) return '#'
  if (!n.startsWith('55')) n = `55${n}`
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`
}

async function adminAtivo() {
  const { data } = await supabase.auth.getSession()
  const uid = data?.session?.user?.id
  if (!uid) return false
  const r = await supabase.from('perfis').select('tipo_usuario').eq('id', uid).maybeSingle()
  return r.data?.tipo_usuario === 'administrador'
}

async function carregar() {
  if (!(await adminAtivo())) return false
  const [f,g,p] = await Promise.all([
    supabase.rpc('admin_listar_filhos'),
    supabase.rpc('admin_listar_giras'),
    supabase.rpc('admin_listar_presencas')
  ])
  if (f.error || g.error || p.error) return false
  dados = {
    filhos: (f.data || []).filter(x => x.ativo),
    giras: g.data || [],
    presencas: p.data || []
  }
  if (!giraId) {
    const hoje = new Date().toISOString().slice(0,10)
    const prox = [...dados.giras].filter(x => String(x.data_gira || '') >= hoje).sort((a,b) => String(a.data_gira).localeCompare(String(b.data_gira)))[0]
    giraId = prox ? String(prox.id) : String(dados.giras[0]?.id || '')
  }
  return true
}

function reg(filhoId, id = giraId) {
  return dados.presencas.find(p => String(p.gira_id) === String(id) && p.filho_id === filhoId)
}

async function salvar(filhoId, acao) {
  const atual = reg(filhoId)
  const payload = {
    gira_id: Number(giraId), filho_id: filhoId,
    confirmado: atual?.confirmado || false,
    presente: atual?.presente ?? null,
    observacoes: atual?.observacoes || null
  }
  if (acao === 'confirmou') payload.confirmado = true
  if (acao === 'presente') { payload.confirmado = true; payload.presente = true; payload.observacoes = null }
  if (acao === 'faltou') { payload.presente = false; payload.observacoes = null }
  if (acao === 'justificou') { payload.presente = false; payload.observacoes = 'Falta justificada' }
  const { error } = await supabase.from('presencas_gira').upsert(payload, { onConflict: 'gira_id,filho_id' })
  if (error) return alert(error.message)
  await carregar(); montarModal(); montarCentrais()
}

function situacao(p) {
  if (p?.presente === true) return 'Presente'
  if (p?.presente === false && String(p.observacoes || '').includes('justificada')) return 'Justificou'
  if (p?.presente === false) return 'Faltou'
  if (p?.confirmado) return 'Confirmou'
  return 'Sem confirmação'
}

function montarModal() {
  const modal = document.querySelector('#presencas-admin-modal')
  if (!modal) return
  const gira = dados.giras.find(g => String(g.id) === String(giraId))
  const linhas = dados.filhos.map(f => {
    const p = reg(f.id)
    const msg = gira ? `Olá, ${f.nome}! Você confirma sua presença na ${gira.titulo} do dia ${dataBR(gira.data_gira)}? Axé!` : ''
    return `<tr><td><b>${f.nome}</b><br><small>${f.cargo || ''}</small></td><td>${p?.confirmado ? 'Sim' : 'Não'}</td><td>${situacao(p)}</td><td class="pa-acoes">${f.telefone && gira ? `<a target="_blank" rel="noreferrer" href="${wa(f.telefone,msg)}">WhatsApp</a>` : ''}<button data-pa="confirmou" data-filho="${f.id}">Confirmou</button><button data-pa="presente" data-filho="${f.id}">Presente</button><button data-pa="faltou" data-filho="${f.id}">Faltou</button><button data-pa="justificou" data-filho="${f.id}">Justificou</button></td></tr>`
  }).join('')
  const registros = dados.filhos.map(f => reg(f.id)).filter(Boolean)
  modal.innerHTML = `<div class="pa-box"><div class="pa-head"><div><span>👥 PRESENÇAS</span><h2>Presença dos filhos</h2><p>Confirmação antes da gira e presença real no dia.</p></div><button id="pa-fechar">×</button></div><select id="pa-gira">${dados.giras.map(g => `<option value="${g.id}" ${String(g.id)===String(giraId)?'selected':''}>${g.titulo} — ${dataBR(g.data_gira)} — ${g.aberta_publico?'Aberta':'Desenvolvimento / Interna'}</option>`).join('')}</select><div class="pa-stats"><div>Filhos ativos<b>${dados.filhos.length}</b></div><div>Confirmados<b>${registros.filter(x=>x.confirmado).length}</b></div><div>Presentes<b>${registros.filter(x=>x.presente===true).length}</b></div><div>Faltas<b>${registros.filter(x=>x.presente===false).length}</b></div></div><div class="pa-table"><table><thead><tr><th>Filho</th><th>Confirmou</th><th>Situação</th><th>Ações</th></tr></thead><tbody>${linhas}</tbody></table></div></div>`
  modal.querySelector('#pa-fechar').onclick = () => modal.style.display='none'
  modal.querySelector('#pa-gira').onchange = e => { giraId=e.target.value; montarModal() }
  modal.querySelectorAll('[data-pa]').forEach(b => b.onclick = () => salvar(b.dataset.filho,b.dataset.pa))
}

async function abrir() {
  if (!(await carregar())) return alert('Não foi possível carregar as presenças.')
  const m = document.querySelector('#presencas-admin-modal')
  m.style.display='flex'; montarModal()
}

function cardCentral(rotulo,gira) {
  if (!gira) return `<article class="card"><span class="tag">🔔 ${rotulo}</span><h3>Nenhuma próxima gira</h3></article>`
  const pend = dados.filhos.filter(f => !reg(f.id,gira.id)?.confirmado)
  return `<article class="card"><span class="tag">🔔 ${rotulo}</span><h3>${gira.titulo}</h3><p><b>${dataBR(gira.data_gira)}</b></p><p>${pend.length} filho(s) sem confirmação.</p><div class="mini-list">${pend.map(f => `<div class="mini-row"><b>${f.nome}</b>${f.telefone?`<a class="button-link small" target="_blank" rel="noreferrer" href="${wa(f.telefone,`Olá, ${f.nome}! Você confirma sua presença na ${gira.titulo} do dia ${dataBR(gira.data_gira)}? Axé!`)}">Lembrar</a>`:''}</div>`).join('') || '<p>Todos confirmaram.</p>'}</div></article>`
}

async function montarCentrais() {
  const antiga = [...document.querySelectorAll('article.card')].find(x => x.textContent?.includes('CENTRAL DE PENDÊNCIAS'))
  if (!antiga || !(await carregar())) return
  antiga.style.display='none'
  let area=document.querySelector('#pa-centrais')
  if(!area){ area=document.createElement('div'); area.id='pa-centrais'; area.className='pa-centrais'; antiga.after(area) }
  const hoje=new Date().toISOString().slice(0,10)
  const futuras=[...dados.giras].filter(g=>String(g.data_gira||'')>=hoje).sort((a,b)=>String(a.data_gira).localeCompare(String(b.data_gira)))
  area.innerHTML=cardCentral('GIRA DE DESENVOLVIMENTO',futuras.find(g=>!g.aberta_publico))+cardCentral('GIRA ABERTA',futuras.find(g=>g.aberta_publico))
}

function instalar() {
  if(!document.querySelector('#pa-style')){
    const s=document.createElement('style');s.id='pa-style';s.textContent=`.pa-modal{display:none;position:fixed;inset:0;z-index:99999;background:#000b;align-items:center;justify-content:center;padding:16px}.pa-box{width:min(1150px,96vw);max-height:92vh;overflow:auto;background:#0b1713;color:#f7f3e8;border:1px solid #d4af3760;border-radius:18px;padding:22px}.pa-head{display:flex;justify-content:space-between}.pa-head span{color:#d4af37}.pa-head button{font-size:28px;background:transparent!important}.pa-box select{width:100%;padding:11px;margin:15px 0;background:#10231c;color:white;border:1px solid #d4af3750;border-radius:9px}.pa-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:15px 0}.pa-stats div{background:#10231c;padding:13px;border-radius:10px}.pa-stats b{display:block;font-size:24px;color:#d4af37}.pa-table{overflow:auto}.pa-table table{width:100%;border-collapse:collapse;min-width:800px}.pa-table th,.pa-table td{padding:10px;border-bottom:1px solid #ffffff18;text-align:left}.pa-acoes{display:flex;gap:6px;flex-wrap:wrap}.pa-acoes a,.pa-acoes button{padding:7px 9px!important;font-size:12px!important;border-radius:7px;text-decoration:none}.pa-acoes a{background:#25d366;color:#06140b;font-weight:700}.pa-centrais{display:grid;grid-template-columns:1fr 1fr;gap:18px}.pa-centrais .mini-list{max-height:340px;overflow:auto}@media(max-width:760px){.pa-stats,.pa-centrais{grid-template-columns:1fr 1fr}.pa-centrais{grid-template-columns:1fr}}`;document.head.appendChild(s)
    const m=document.createElement('div');m.id='presencas-admin-modal';m.className='pa-modal';document.body.appendChild(m)
  }
  const menu=document.querySelector('nav.menu')
  if(menu&&!document.querySelector('#pa-menu')){const b=document.createElement('button');b.id='pa-menu';b.textContent='✅ Presenças';b.onclick=abrir;const gb=[...menu.querySelectorAll('button')].find(x=>x.textContent?.includes('Giras'));gb?gb.after(b):menu.appendChild(b)}
  montarCentrais()
}

let t
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(instalar,300)}).observe(document.body,{childList:true,subtree:true})
setTimeout(instalar,800)
