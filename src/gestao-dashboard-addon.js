import { supabase } from './supabase.js'

const dataBR = (v) => {
  if (!v) return '—'
  const [a, m, d] = String(v).slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}
const hoje = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

async function ehAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase.from('perfis').select('tipo_usuario').eq('id', user.id).maybeSingle()
    return data?.tipo_usuario === 'administrador'
  } catch { return false }
}

async function abrirCentral() {
  const corpo = document.querySelector('#gda-box .gda-body')
  const caixa = document.querySelector('#gda-box')
  if (!corpo || !caixa) return
  caixa.style.display = 'block'
  corpo.textContent = 'Carregando...'
  try {
    const [rf, rg, rp, rfn, rmt] = await Promise.all([
      supabase.rpc('admin_listar_filhos'),
      supabase.rpc('admin_listar_giras'),
      supabase.rpc('admin_listar_presencas'),
      supabase.rpc('admin_listar_funcoes_gira'),
      supabase.rpc('admin_listar_materiais')
    ])
    if (rf.error || rg.error || rp.error || rfn.error || rmt.error) throw new Error('Não foi possível carregar a Central da Gira.')
    const filhos = (rf.data || []).filter(x => x.ativo)
    const giras = (rg.data || []).filter(x => String(x.data_gira || '') >= hoje()).sort((a,b) => String(a.data_gira).localeCompare(String(b.data_gira)))
    const gira = giras[0]
    if (!gira) { corpo.innerHTML = '<p>Nenhuma gira futura cadastrada.</p>'; return }
    const presencas = rp.data || []
    const pendentes = filhos.filter(f => !presencas.some(p => String(p.gira_id) === String(gira.id) && p.filho_id === f.id && p.confirmado))
    const funcoes = (rfn.data || []).filter(x => String(x.gira_id) === String(gira.id))
    const materiais = (rmt.data || []).filter(x => String(x.gira_id) === String(gira.id))
    corpo.innerHTML = `<div class="gda-grid"><div class="gda-card"><small>PRÓXIMA GIRA</small><b>${gira.titulo}</b><span>${dataBR(gira.data_gira)}</span></div><div class="gda-card"><small>FILHOS ATIVOS</small><b>${filhos.length}</b></div><div class="gda-card"><small>CONFIRMADOS</small><b>${filhos.length - pendentes.length}</b></div><div class="gda-card"><small>PENDENTES</small><b>${pendentes.length}</b></div><div class="gda-card wide"><h3>🔔 Pendentes de confirmação</h3>${pendentes.length ? pendentes.map(x => `<p>${x.nome} <span>${x.cargo || ''}</span></p>`).join('') : '<p>Todos confirmaram.</p>'}</div><div class="gda-card wide"><h3>👤 Escala</h3>${funcoes.length ? funcoes.map(x => `<p>${filhos.find(f => f.id === x.filho_id)?.nome || '—'} — <strong>${x.funcao}</strong></p>`).join('') : '<p>Nenhuma função cadastrada.</p>'}</div><div class="gda-card wide"><h3>🧳 Materiais</h3>${materiais.length ? materiais.map(x => `<p>${x.item} — ${x.cargo || 'Todos'}</p>`).join('') : '<p>Nenhum material específico.</p>'}</div></div>`
  } catch (e) {
    corpo.textContent = e.message || 'Erro ao carregar.'
    console.warn('[Central da Gira]', e)
  }
}

async function iniciar() {
  try {
    if (document.querySelector('#gda-open')) return
    if (!(await ehAdmin())) return
    const estilo = document.createElement('style')
    estilo.id = 'gda-style'
    estilo.textContent = `#gda-open{position:fixed;right:18px;bottom:145px;z-index:9995;background:#c6a15b;color:#07120e;border:0;border-radius:99px;padding:12px 16px;font-weight:900}#gda-box{display:none;position:fixed;inset:0;z-index:9999;background:rgba(2,8,6,.94);overflow:auto;padding:20px}.gda-shell{max-width:1100px;margin:auto;background:#08150f;color:#fff;padding:20px;border:1px solid #6b5932;border-radius:18px}.gda-head{display:flex;justify-content:space-between}.gda-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.gda-card{padding:14px;background:#102219;border:1px solid #403721;border-radius:12px}.gda-card b{display:block;font-size:23px}.gda-card.wide{grid-column:1/-1}.gda-card p{border-bottom:1px solid rgba(255,255,255,.07);padding:8px 0}.gda-card span{opacity:.75}@media(max-width:700px){.gda-grid{grid-template-columns:1fr 1fr}}`
    if (!document.querySelector('#gda-style')) document.head.appendChild(estilo)
    const botao = document.createElement('button')
    botao.id = 'gda-open'; botao.textContent = '📊 Central da Gira'; botao.onclick = abrirCentral
    const caixa = document.createElement('div')
    caixa.id = 'gda-box'; caixa.innerHTML = '<div class="gda-shell"><div class="gda-head"><h2>Central da Próxima Gira</h2><button class="gda-close">✕ Fechar</button></div><div class="gda-body"></div></div>'
    document.body.append(botao, caixa)
    caixa.querySelector('.gda-close').onclick = () => { caixa.style.display = 'none' }
  } catch (e) { console.warn('[Central da Gira iniciar]', e) }
}

function reagendarInicio() {
  setTimeout(() => iniciar().catch(console.warn), 500)
}

window.addEventListener('templo:auth-ready', reagendarInicio)
reagendarInicio()
