import { supabase } from './supabase'

const moeda = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dataBR = v => {
  if (!v) return '—'
  const p = String(v).slice(0, 10).split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : v
}
const numeroWhats = telefone => {
  let n = String(telefone || '').replace(/\D/g, '')
  if (n && !n.startsWith('55')) n = `55${n}`
  return n
}
const status = m => {
  const valor = Number(m.valor || 0)
  const pago = Number(m.valor_pago || 0)
  const hoje = new Date().toISOString().slice(0, 10)
  if (valor > 0 && pago >= valor) return 'Pago'
  if (pago > 0 && m.vencimento < hoje) return 'Parcial / Atrasado'
  if (pago > 0) return 'Parcial'
  if (m.vencimento < hoje) return 'Atrasado'
  return 'Pendente'
}

async function dados() {
  const [{ data: mensalidades }, { data: filhos }] = await Promise.all([
    supabase.rpc('admin_listar_mensalidades'),
    supabase.rpc('admin_listar_filhos')
  ])
  return { mensalidades: mensalidades || [], filhos: filhos || [] }
}

function mensagemCobranca(m) {
  const saldo = Math.max(0, Number(m.valor || 0) - Number(m.valor_pago || 0))
  return `Olá, ${m.nome || 'tudo bem'}! Axé! 🙏\n\nPassando para lembrar da mensalidade do T.U. Caboclo Tupinambá Odé Leke.\nVencimento: ${dataBR(m.vencimento)}\nValor da mensalidade: ${moeda(m.valor)}\n${Number(m.valor_pago || 0) > 0 ? `Valor já pago: ${moeda(m.valor_pago)}\n` : ''}Saldo pendente: ${moeda(saldo)}.\n\nSe o pagamento já foi realizado, por favor desconsidere esta mensagem. Axé! 🙏`
}

async function cobrar(m, filhos) {
  const filho = filhos.find(f => String(f.id) === String(m.filho_id))
  const telefone = numeroWhats(m.telefone || filho?.telefone)
  if (!telefone) return alert('Este filho não possui telefone cadastrado.')
  window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagemCobranca(m))}`, '_blank', 'noopener,noreferrer')
}

async function editar(m) {
  const valor = window.prompt('Valor da mensalidade:', Number(m.valor || 0).toFixed(2).replace('.', ','))
  if (valor === null) return
  const vencimento = window.prompt('Vencimento (AAAA-MM-DD):', String(m.vencimento || '').slice(0, 10))
  if (vencimento === null) return
  const novoValor = Number(String(valor).replace(',', '.'))
  if (!novoValor || novoValor < 0) return alert('Informe um valor válido.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimento)) return alert('Informe a data no formato AAAA-MM-DD.')
  const { error } = await supabase.from('mensalidades').update({ valor: novoValor, vencimento }).eq('id', m.id)
  if (error) return alert(`Não foi possível editar: ${error.message}`)
  alert('Mensalidade atualizada com sucesso.')
  location.reload()
}

async function marcarPago(m) {
  const saldo = Math.max(0, Number(m.valor || 0) - Number(m.valor_pago || 0))
  if (saldo <= 0) return alert('Esta mensalidade já está paga.')
  if (!window.confirm(`Confirmar pagamento do saldo de ${moeda(saldo)} de ${m.nome || 'este filho'}?`)) return
  const hoje = new Date().toISOString().slice(0, 10)
  const { error: ep } = await supabase.from('pagamentos').insert({ mensalidade_id: m.id, valor: saldo, data_pagamento: hoje, forma_pagamento: 'Manual', observacoes: 'Quitação registrada pelo administrador' })
  if (ep) return alert(`Não foi possível registrar o pagamento: ${ep.message}`)
  const { error } = await supabase.from('mensalidades').update({ valor_pago: Number(m.valor || 0), data_pagamento: hoje, forma_pagamento: 'Manual' }).eq('id', m.id)
  if (error) return alert(`Pagamento registrado, mas houve erro ao atualizar a mensalidade: ${error.message}`)
  alert('Mensalidade marcada como paga.')
  location.reload()
}

async function abrirCentral() {
  const { mensalidades, filhos } = await dados()
  const pendentes = mensalidades.filter(m => status(m) !== 'Pago')
  const linhas = pendentes.map(m => {
    const filho = filhos.find(f => String(f.id) === String(m.filho_id))
    const telefone = numeroWhats(m.telefone || filho?.telefone)
    const saldo = Math.max(0, Number(m.valor || 0) - Number(m.valor_pago || 0))
    return `<div class="fin-item"><div><strong>${m.nome || filho?.nome || 'Filho da casa'}</strong><small>${status(m)} · vence ${dataBR(m.vencimento)} · saldo ${moeda(saldo)}</small></div><div class="fin-actions">${telefone ? `<button data-fin="cobrar" data-id="${m.id}">📲 Cobrar</button>` : ''}<button data-fin="pago" data-id="${m.id}">💰 Marcar pago</button><button data-fin="editar" data-id="${m.id}">✏️ Editar</button></div></div>`
  }).join('')
  const antigo = document.querySelector('#fin-modal')
  if (antigo) antigo.remove()
  const modal = document.createElement('div')
  modal.id = 'fin-modal'
  modal.className = 'fin-overlay'
  modal.innerHTML = `<div class="fin-modal"><div class="fin-head"><div><small>FINANCEIRO</small><h3>Central de cobranças</h3><p>${pendentes.length} mensalidade(s) com saldo pendente.</p></div><button data-fin="fechar">✕</button></div><div class="fin-list">${linhas || '<p>Nenhuma mensalidade pendente. 🎉</p>'}</div></div>`
  document.body.appendChild(modal)
  modal.addEventListener('click', async e => {
    const botao = e.target.closest('[data-fin]')
    if (!botao) return
    const acao = botao.dataset.fin
    if (acao === 'fechar') return modal.remove()
    const m = mensalidades.find(x => String(x.id) === String(botao.dataset.id))
    if (!m) return
    if (acao === 'cobrar') await cobrar(m, filhos)
    if (acao === 'editar') await editar(m)
    if (acao === 'pago') await marcarPago(m)
  })
}

async function montar() {
  const titulo = [...document.querySelectorAll('.section-heading h3')].find(x => x.textContent.includes('Mensalidades e Pagamentos'))
  if (!titulo || document.querySelector('#financeiro-rapido')) return
  const { mensalidades } = await dados()
  const pendentes = mensalidades.filter(m => status(m) !== 'Pago')
  const atrasadas = mensalidades.filter(m => status(m).includes('Atrasado'))
  const box = document.createElement('div')
  box.id = 'financeiro-rapido'
  box.className = 'financeiro-rapido'
  box.innerHTML = `<div><strong>💰 Central rápida de mensalidades</strong><p><b>${pendentes.length}</b> pendente(s) · <b>${atrasadas.length}</b> atrasada(s)</p></div><button id="abrir-financeiro">📲 Cobrar / Editar mensalidades</button>`
  titulo.closest('section').prepend(box)
  box.querySelector('#abrir-financeiro').addEventListener('click', abrirCentral)
}

const css = document.createElement('style')
css.textContent = `.financeiro-rapido{margin:14px 0;padding:14px 16px;border:1px solid rgba(212,175,55,.4);border-radius:16px;display:flex;gap:14px;align-items:center;justify-content:space-between;background:rgba(212,175,55,.05)}.financeiro-rapido p{margin:5px 0 0;opacity:.8}.fin-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px}.fin-modal{width:min(900px,100%);max-height:88vh;overflow:auto;background:#0b1511;border:1px solid rgba(212,175,55,.45);border-radius:22px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,.55)}.fin-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.fin-head h3{margin:3px 0}.fin-head p{opacity:.75}.fin-list{display:grid;gap:10px;margin-top:16px}.fin-item{border:1px solid rgba(255,255,255,.1);border-radius:15px;padding:13px;display:flex;gap:12px;align-items:center;justify-content:space-between}.fin-item small{display:block;margin-top:5px;opacity:.72}.fin-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}@media(max-width:700px){.financeiro-rapido,.fin-item{align-items:stretch;flex-direction:column}.fin-actions{justify-content:flex-start}}`
document.head.appendChild(css)
new MutationObserver(montar).observe(document.body, { childList: true, subtree: true })
window.addEventListener('templo:auth-ready', montar)
montar()
