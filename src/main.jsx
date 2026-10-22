import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import './style.css'

const dinheiro = (v) =>
  Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

const dataBR = (v) => {
  if (!v) return '—'
  const d = String(v).slice(0, 10).split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : v
}

const mesBR = (v) => {
  if (!v) return '—'
  const d = new Date(`${String(v).slice(0, 10)}T12:00:00`)
  return d.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  })
}

const hojeISO = () => {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10)
}

const statusMensalidade = (m) => {
  if (!m) return 'Sem lançamento'

  const valor = Number(m.valor || 0)
  const pago = Number(m.valor_pago || 0)

  if (pago >= valor && valor > 0) return 'Pago'
  if (pago > 0 && m.vencimento < hojeISO()) return 'Parcial / Atrasado'
  if (pago > 0) return 'Parcial'
  if (m.vencimento < hojeISO()) return 'Atrasado'
  return 'Pendente'
}

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const [perfil, setPerfil] = useState(null)
  const [pagina, setPagina] = useState('dashboard')

  const [filhos, setFilhos] = useState([])
  const [giras, setGiras] = useState([])
  const [materiais, setMateriais] = useState([])
  const [mensalidades, setMensalidades] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [avisos, setAvisos] = useState([])
  const [estudos, setEstudos] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [presencas, setPresencas] = useState([])

  const [editFilho, setEditFilho] = useState(null)
  const [novaGira, setNovaGira] = useState({})
  const [novoMaterial, setNovoMaterial] = useState({})
  const [novoAviso, setNovoAviso] = useState({})
  const [novoEstudo, setNovoEstudo] = useState({})
  const [novaSugestao, setNovaSugestao] = useState({
    assunto: '',
    mensagem: '',
    anonima: false
  })

  const admin = perfil?.tipo_usuario === 'administrador'

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s)
        if (!s) {
          setPerfil(null)
          setLoading(false)
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    carregarTudo()
  }, [session])

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setErro(error.message)
      setLoading(false)
    }
  }

  async function sair() {
    await supabase.auth.signOut()
    setPagina('dashboard')
  }

  async function carregarTudo() {
    setLoading(true)
    setErro('')

    try {
      const uid = session.user.id

      const { data: p, error: ep } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', uid)
        .single()

      if (ep) throw ep

      setPerfil(p)

      if (p.tipo_usuario === 'administrador') {
        await carregarAdmin()
      } else {
        await carregarFilho(p)
      }
    } catch (e) {
      console.error(e)
      setErro(e.message || 'Erro ao carregar o sistema.')
    }

    setLoading(false)
  }

  async function carregarAdmin() {
    const [
      rf,
      rg,
      rm,
      rmen,
      rp,
      ra,
      re,
      rs,
      rpre
    ] = await Promise.all([
      supabase.rpc('admin_listar_filhos'),
      supabase.rpc('admin_listar_giras'),
      supabase.rpc('admin_listar_materiais'),
      supabase.rpc('admin_listar_mensalidades'),
      supabase.rpc('admin_listar_pagamentos'),
      supabase.rpc('admin_listar_avisos'),
      supabase.rpc('admin_listar_estudos'),
      supabase.rpc('admin_listar_sugestoes'),
      supabase.rpc('admin_listar_presencas')
    ])

    const respostas = [rf, rg, rm, rmen, rp, ra, re, rs, rpre]
    const falha = respostas.find(x => x.error)

    if (falha?.error) throw falha.error

    setFilhos(rf.data || [])
    setGiras(rg.data || [])
    setMateriais(rm.data || [])
    setMensalidades(rmen.data || [])
    setPagamentos(rp.data || [])
    setAvisos(ra.data || [])
    setEstudos(re.data || [])
    setSugestoes(rs.data || [])
    setPresencas(rpre.data || [])
  }

  async function carregarFilho(p) {
    const hoje = hojeISO()

    const [
      rg,
      rmen,
      ra,
      re,
      rs
    ] = await Promise.all([
      supabase
        .from('giras')
        .select('*')
        .gte('data_gira', hoje)
        .order('data_gira')
        .limit(20),

      supabase.rpc('minhas_mensalidades'),

      supabase
        .from('avisos')
        .select('*')
        .eq('publicado', true)
        .order('data_publicacao', { ascending: false }),

      supabase
        .from('estudos')
        .select('*')
        .eq('publicado', true)
        .order('ordem'),

      supabase
        .from('sugestoes')
        .select('*')
        .eq('filho_id', session.user.id)
        .order('id', { ascending: false })
    ])

    setGiras(rg.data || [])
    setMensalidades(rmen.data || [])
    setAvisos(ra.data || [])
    setEstudos(re.data || [])
    setSugestoes(rs.data || [])

    const primeiraGira = (rg.data || [])[0]

    if (primeiraGira && p?.cargo) {
      const { data: mat } = await supabase
        .from('materiais_gira')
        .select('*')
        .eq('gira_id', primeiraGira.id)
        .eq('cargo', p.cargo)
        .order('id')

      setMateriais(mat || [])
    } else {
      setMateriais([])
    }
  }

  const resumo = useMemo(() => {
    const mesAtual = hojeISO().slice(0, 7)

    const mes = mensalidades.filter(
      m => String(m.competencia || '').slice(0, 7) === mesAtual
    )

    return {
      filhos: filhos.filter(f => f.ativo).length,
      pendencias: mes.filter(m =>
        ['Atrasado', 'Parcial / Atrasado'].includes(
          m.situacao || statusMensalidade(m)
        )
      ).length,
      previsto: mes.reduce((s, m) => s + Number(m.valor || 0), 0),
      recebido: mes.reduce((s, m) => s + Number(m.valor_pago || 0), 0)
    }
  }, [filhos, mensalidades])

  async function salvarFilho(e) {
    e.preventDefault()
    if (!editFilho?.id) return

    setMsg('')

    const payload = {
      nome: editFilho.nome,
      telefone: editFilho.telefone || null,
      data_nascimento: editFilho.data_nascimento || null,
      cargo: editFilho.cargo || null,
      ativo: editFilho.ativo,
      dia_vencimento: Number(editFilho.dia_vencimento) || null,
      valor_mensalidade: Number(editFilho.valor_mensalidade) || 0,
      data_entrada: editFilho.data_entrada || null,
      observacoes: editFilho.observacoes || null
    }

    const { error } = await supabase
      .from('perfis')
      .update(payload)
      .eq('id', editFilho.id)

    if (error) return setMsg(`Erro: ${error.message}`)

    setMsg('Cadastro atualizado com sucesso.')
    setEditFilho(null)
    await carregarAdmin()
  }

  async function registrarPagamento(m) {
    const restante = Math.max(
      0,
      Number(m.valor || 0) - Number(m.valor_pago || 0)
    )

    const entrada = window.prompt(
      `Valor a receber de ${m.nome}\nSaldo: ${dinheiro(restante)}`,
      restante.toFixed(2)
    )

    if (entrada === null) return

    const valorNovo = Number(String(entrada).replace(',', '.'))

    if (!valorNovo || valorNovo <= 0) {
      alert('Informe um valor válido.')
      return
    }

    const forma = window.prompt(
      'Forma de pagamento: Pix, Dinheiro, Cartão...',
      'Pix'
    )

    if (forma === null) return

    const totalPago = Math.min(
      Number(m.valor || 0),
      Number(m.valor_pago || 0) + valorNovo
    )

    const { error: e1 } = await supabase
      .from('pagamentos')
      .insert({
        mensalidade_id: m.id,
        valor: valorNovo,
        data_pagamento: hojeISO(),
        forma_pagamento: forma,
        observacoes: null
      })

    if (e1) {
      alert(e1.message)
      return
    }

    const { error: e2 } = await supabase
      .from('mensalidades')
      .update({
        valor_pago: totalPago,
        data_pagamento:
          totalPago >= Number(m.valor || 0) ? hojeISO() : null,
        forma_pagamento: forma
      })
      .eq('id', m.id)

    if (e2) {
      alert(e2.message)
      return
    }

    alert('Pagamento registrado com sucesso.')
    await carregarAdmin()
  }

  async function criarGira(e) {
    e.preventDefault()

    const { error } = await supabase.from('giras').insert({
      titulo: novaGira.titulo,
      linha: novaGira.linha || null,
      descricao: novaGira.descricao || null,
      data_gira: novaGira.data_gira,
      horario: novaGira.horario,
      local: novaGira.local || null,
      aberta_publico: !!novaGira.aberta_publico,
      destaque: !!novaGira.destaque,
      orientacoes: novaGira.orientacoes || null
    })

    if (error) return alert(error.message)

    setNovaGira({})
    await carregarAdmin()
    alert('Gira cadastrada.')
  }

  async function excluirGira(id) {
    if (!window.confirm('Deseja realmente excluir esta gira?')) return

    const { error } = await supabase
      .from('giras')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function criarMaterial(e) {
    e.preventDefault()

    const { error } = await supabase.from('materiais_gira').insert({
      gira_id: Number(novoMaterial.gira_id),
      cargo: novoMaterial.cargo,
      item: novoMaterial.item,
      obrigatorio: novoMaterial.obrigatorio !== false,
      observacoes: novoMaterial.observacoes || null
    })

    if (error) return alert(error.message)

    setNovoMaterial({})
    await carregarAdmin()
    alert('Material cadastrado.')
  }

  async function excluirMaterial(id) {
    if (!window.confirm('Excluir este material?')) return

    const { error } = await supabase
      .from('materiais_gira')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function criarAviso(e) {
    e.preventDefault()

    const { error } = await supabase.from('avisos').insert({
      titulo: novoAviso.titulo,
      mensagem: novoAviso.mensagem,
      publico: novoAviso.publico || 'filhos',
      importante: !!novoAviso.importante,
      publicado: true,
      data_publicacao: new Date().toISOString()
    })

    if (error) return alert(error.message)

    setNovoAviso({})
    await carregarAdmin()
    alert('Aviso publicado.')
  }

  async function excluirAviso(id) {
    if (!window.confirm('Excluir este aviso?')) return

    const { error } = await supabase
      .from('avisos')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function criarEstudo(e) {
    e.preventDefault()

    const { error } = await supabase.from('estudos').insert({
      titulo: novoEstudo.titulo,
      descricao: novoEstudo.descricao || null,
      categoria: novoEstudo.categoria || 'Geral',
      arquivo_url: novoEstudo.arquivo_url || null,
      link_externo: novoEstudo.link_externo || null,
      somente_filhos: true,
      publicado: true,
      ordem: Number(novoEstudo.ordem) || 0
    })

    if (error) return alert(error.message)

    setNovoEstudo({})
    await carregarAdmin()
    alert('Estudo publicado.')
  }

  async function excluirEstudo(id) {
    if (!window.confirm('Excluir este estudo?')) return

    const { error } = await supabase
      .from('estudos')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function responderSugestao(s) {
    const resposta = window.prompt(
      `Resposta para: ${s.assunto}`,
      s.resposta || ''
    )

    if (resposta === null) return

    const { error } = await supabase
      .from('sugestoes')
      .update({
        resposta,
        status: 'respondida'
      })
      .eq('id', s.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function enviarSugestao(e) {
    e.preventDefault()

    const { error } = await supabase.from('sugestoes').insert({
      filho_id: session.user.id,
      assunto: novaSugestao.assunto,
      mensagem: novaSugestao.mensagem,
      anonima: !!novaSugestao.anonima,
      status: 'nova'
    })

    if (error) return alert(error.message)

    setNovaSugestao({
      assunto: '',
      mensagem: '',
      anonima: false
    })

    await carregarFilho(perfil)
    alert('Sugestão enviada.')
  }

  async function confirmarPresenca(gira) {
    const { data: existente } = await supabase
      .from('presencas_gira')
      .select('*')
      .eq('gira_id', gira.id)
      .eq('filho_id', session.user.id)
      .maybeSingle()

    if (existente) {
      const { error } = await supabase
        .from('presencas_gira')
        .update({ confirmado: true })
        .eq('id', existente.id)

      if (error) return alert(error.message)
    } else {
      const { error } = await supabase
        .from('presencas_gira')
        .insert({
          gira_id: gira.id,
          filho_id: session.user.id,
          confirmado: true,
          presente: false
        })

      if (error) return alert(error.message)
    }

    alert('Presença confirmada.')
  }

  if (!session) {
    return (
      <main className="login-wrap">
        <section className="login-card">
          <div className="mark">TU</div>

          <p className="eyebrow">TEMPLO DE UMBANDA</p>

          <h1>
            Caboclo Tupinambá
            <br />
            Ode Leke
          </h1>

          <p className="muted">
            Área reservada aos filhos da casa
          </p>

          <form onSubmit={entrar}>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>

            {erro && <p className="error">{erro}</p>}

            <button disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na Área do Filho'}
            </button>
          </form>

          <p className="footer-note">
            Fé • Disciplina • Caridade • Ancestralidade
          </p>
        </section>
      </main>
    )
  }

  if (loading || !perfil) {
    return (
      <main className="app">
        <div className="loading-box">
          Carregando sistema...
        </div>
      </main>
    )
  }

  if (admin) {
    return (
      <main className="app">
        <header>
          <div>
            <p className="eyebrow">
              TEMPLO T.U CABOCLO TUPINAMBÁ ODE LEKE
            </p>
            <h2>Olá, {perfil.nome || 'Geovanni'} 👋</h2>
            <p>Painel Administrativo</p>
          </div>

          <button className="ghost" onClick={sair}>
            Sair
          </button>
        </header>

        <nav className="menu">
          <button onClick={() => setPagina('dashboard')}>
            🏠 Dashboard
          </button>
          <button onClick={() => setPagina('filhos')}>
            👥 Filhos
          </button>
          <button onClick={() => setPagina('mensalidades')}>
            💰 Mensalidades
          </button>
          <button onClick={() => setPagina('giras')}>
            📅 Giras
          </button>
          <button onClick={() => setPagina('materiais')}>
            🧳 Materiais
          </button>
          <button onClick={() => setPagina('avisos')}>
            📢 Avisos
          </button>
          <button onClick={() => setPagina('estudos')}>
            📚 Estudos
          </button>
          <button onClick={() => setPagina('sugestoes')}>
            💡 Sugestões
          </button>
        </nav>

        {erro && <div className="alert error">{erro}</div>}
        {msg && <div className="alert">{msg}</div>}

        {pagina === 'dashboard' && (
          <>
            <section className="grid">
              <article className="card hero">
                <span className="tag">FILHOS DA CASA</span>
                <h3 className="big-number">{resumo.filhos}</h3>
                <p>Filhos ativos cadastrados</p>
              </article>

              <article className="card">
                <span className="tag">PENDÊNCIAS</span>
                <h3 className="big-number">{resumo.pendencias}</h3>
                <p>Mensalidades atrasadas</p>
              </article>

              <article className="card">
                <span className="tag">PREVISTO NO MÊS</span>
                <h3>{dinheiro(resumo.previsto)}</h3>
                <p>Total previsto em mensalidades</p>
              </article>

              <article className="card">
                <span className="tag">RECEBIDO NO MÊS</span>
                <h3>{dinheiro(resumo.recebido)}</h3>
                <p>Total recebido</p>
              </article>
            </section>

            <section className="card wide">
              <span className="tag">GESTÃO DO TEMPLO</span>
              <h3>Painel de Administração</h3>

              <div className="admin-shortcuts">
                <button onClick={() => setPagina('filhos')}>
                  👥 Gerenciar filhos
                </button>
                <button onClick={() => setPagina('mensalidades')}>
                  💰 Financeiro
                </button>
                <button onClick={() => setPagina('giras')}>
                  📅 Calendário de giras
                </button>
                <button onClick={() => setPagina('materiais')}>
                  🧳 Materiais
                </button>
                <button onClick={() => setPagina('avisos')}>
                  📢 Avisos
                </button>
                <button onClick={() => setPagina('estudos')}>
                  📚 Estudos
                </button>
                <button onClick={() => setPagina('sugestoes')}>
                  💡 Sugestões
                </button>
              </div>
            </section>
          </>
        )}

        {pagina === 'filhos' && (
          <section className="card wide">
            <span className="tag">CADASTRO</span>
            <h3>Filhos da Casa</h3>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Venc.</th>
                    <th>Mensalidade</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filhos.map(f => (
                    <tr key={f.id}>
                      <td>{f.nome}</td>
                      <td>{f.cargo || '—'}</td>
                      <td>Dia {f.dia_vencimento || '—'}</td>
                      <td>{dinheiro(f.valor_mensalidade)}</td>
                      <td>{f.ativo ? 'Ativo' : 'Inativo'}</td>
                      <td>
                        <button
                          className="small"
                          onClick={() => setEditFilho({ ...f })}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editFilho && (
              <form className="form-grid" onSubmit={salvarFilho}>
                <h3 className="form-title">
                  Editar {editFilho.nome}
                </h3>

                <label>
                  Nome
                  <input
                    value={editFilho.nome || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        nome: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Telefone
                  <input
                    value={editFilho.telefone || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        telefone: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Cargo
                  <input
                    value={editFilho.cargo || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        cargo: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Dia do vencimento
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editFilho.dia_vencimento || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        dia_vencimento: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Valor mensalidade
                  <input
                    type="number"
                    step="0.01"
                    value={editFilho.valor_mensalidade || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        valor_mensalidade: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Data de entrada
                  <input
                    type="date"
                    value={editFilho.data_entrada || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        data_entrada: e.target.value
                      })
                    }
                  />
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!editFilho.ativo}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        ativo: e.target.checked
                      })
                    }
                  />
                  Filho ativo
                </label>

                <label className="full">
                  Observações
                  <textarea
                    value={editFilho.observacoes || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        observacoes: e.target.value
                      })
                    }
                  />
                </label>

                <div className="actions full">
                  <button type="submit">Salvar alterações</button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setEditFilho(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {pagina === 'mensalidades' && (
          <section className="card wide">
            <span className="tag">FINANCEIRO</span>
            <h3>Mensalidades e Pagamentos</h3>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Filho</th>
                    <th>Competência</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Pago</th>
                    <th>Situação</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {mensalidades.map(m => {
                    const st = m.situacao || statusMensalidade(m)

                    return (
                      <tr key={m.id}>
                        <td>{m.nome || '—'}</td>
                        <td>{mesBR(m.competencia)}</td>
                        <td>{dataBR(m.vencimento)}</td>
                        <td>{dinheiro(m.valor)}</td>
                        <td>{dinheiro(m.valor_pago)}</td>
                        <td>
                          <strong
                            className={
                              'status ' +
                              st.toLowerCase().replaceAll(' ', '-')
                            }
                          >
                            {st}
                          </strong>
                        </td>
                        <td>
                          {Number(m.valor_pago || 0) <
                            Number(m.valor || 0) && (
                            <button
                              className="small"
                              onClick={() => registrarPagamento(m)}
                            >
                              Receber
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {pagina === 'giras' && (
          <section className="card wide">
            <span className="tag">CALENDÁRIO</span>
            <h3>Giras</h3>

            <form className="form-grid" onSubmit={criarGira}>
              <label>
                Título
                <input
                  value={novaGira.titulo || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      titulo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Linha
                <input
                  value={novaGira.linha || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      linha: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Data
                <input
                  type="date"
                  value={novaGira.data_gira || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      data_gira: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Horário
                <input
                  type="time"
                  value={novaGira.horario || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      horario: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Local
                <input
                  value={novaGira.local || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      local: e.target.value
                    })
                  }
                />
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={!!novaGira.aberta_publico}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      aberta_publico: e.target.checked
                    })
                  }
                />
                Aberta ao público
              </label>

              <label className="full">
                Orientações
                <textarea
                  value={novaGira.orientacoes || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      orientacoes: e.target.value
                    })
                  }
                />
              </label>

              <button type="submit">Cadastrar gira</button>
            </form>

            <div className="list">
              {giras.map(g => (
                <div className="list-item" key={g.id}>
                  <div>
                    <strong>{g.titulo}</strong>
                    <p>
                      {dataBR(g.data_gira)} •{' '}
                      {String(g.horario || '').slice(0, 5)}
                    </p>
                    <small>{g.orientacoes}</small>
                  </div>

                  <button
                    className="danger small"
                    onClick={() => excluirGira(g.id)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {pagina === 'materiais' && (
          <section className="card wide">
            <span className="tag">ORGANIZAÇÃO</span>
            <h3>Materiais das Giras</h3>

            <form className="form-grid" onSubmit={criarMaterial}>
              <label>
                Gira
                <select
                  value={novoMaterial.gira_id || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      gira_id: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Selecione</option>
                  {giras.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.titulo} - {dataBR(g.data_gira)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Cargo
                <input
                  placeholder="Ex.: Médium em Desenvolvimento"
                  value={novoMaterial.cargo || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      cargo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Material
                <input
                  placeholder="Ex.: Pemba branca"
                  value={novoMaterial.item || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      item: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label className="full">
                Observações
                <textarea
                  value={novoMaterial.observacoes || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      observacoes: e.target.value
                    })
                  }
                />
              </label>

              <button type="submit">Adicionar material</button>
            </form>

            <div className="list">
              {materiais.map(m => (
                <div className="list-item" key={m.id}>
                  <div>
                    <strong>✓ {m.item}</strong>
                    <p>{m.cargo}</p>
                  </div>

                  <button
                    className="danger small"
                    onClick={() => excluirMaterial(m.id)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {pagina === 'avisos' && (
          <section className="card wide">
            <span className="tag">COMUNICAÇÃO</span>
            <h3>Avisos</h3>

            <form className="form-grid" onSubmit={criarAviso}>
              <label>
                Título
                <input
                  value={novoAviso.titulo || ''}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      titulo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Público
                <select
                  value={novoAviso.publico || 'filhos'}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      publico: e.target.value
                    })
                  }
                >
                  <option value="filhos">Filhos da casa</option>
                  <option value="todos">Todos</option>
                </select>
              </label>

              <label className="full">
                Mensagem
                <textarea
                  value={novoAviso.mensagem || ''}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      mensagem: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={!!novoAviso.importante}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      importante: e.target.checked
                    })
                  }
                />
                Aviso importante
              </label>

              <button type="submit">Publicar aviso</button>
            </form>

            <div className="list">
              {avisos.map(a => (
                <div className="list-item" key={a.id}>
                  <div>
                    <strong>
                      {a.importante ? '⚠️ ' : '📢 '}
                      {a.titulo}
                    </strong>
                    <p>{a.mensagem}</p>
                  </div>

                  <button
                    className="danger small"
                    onClick={() => excluirAviso(a.id)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {pagina === 'estudos' && (
          <section className="card wide">
            <span className="tag">CONHECIMENTO</span>
            <h3>Estudos e Apostilas</h3>

            <form className="form-grid" onSubmit={criarEstudo}>
              <label>
                Título
                <input
                  value={novoEstudo.titulo || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      titulo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Categoria
                <input
                  value={novoEstudo.categoria || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      categoria: e.target.value
                    })
                  }
                />
              </label>

              <label className="full">
                Descrição
                <textarea
                  value={novoEstudo.descricao || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      descricao: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Link do arquivo
                <input
                  type="url"
                  value={novoEstudo.arquivo_url || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      arquivo_url: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Link externo
                <input
                  type="url"
                  value={novoEstudo.link_externo || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      link_externo: e.target.value
                    })
                  }
                />
              </label>

              <button type="submit">Publicar estudo</button>
            </form>

            <div className="list">
              {estudos.map(e => (
                <div className="list-item" key={e.id}>
                  <div>
                    <strong>📚 {e.titulo}</strong>
                    <p>{e.descricao}</p>
                    <small>{e.categoria}</small>
                  </div>

                  <button
                    className="danger small"
                    onClick={() => excluirEstudo(e.id)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {pagina === 'sugestoes' && (
          <section className="card wide">
            <span className="tag">FILHOS DA CASA</span>
            <h3>Sugestões Recebidas</h3>

            <div className="list">
              {sugestoes.length === 0 && (
                <p>Nenhuma sugestão recebida.</p>
              )}

              {sugestoes.map(s => {
                const filho = filhos.find(f => f.id === s.filho_id)

                return (
                  <div className="list-item" key={s.id}>
                    <div>
                      <strong>💡 {s.assunto}</strong>
                      <p>{s.mensagem}</p>
                      <small>
                        {s.anonima
                          ? 'Sugestão anônima'
                          : filho?.nome || 'Filho da casa'}
                        {' • '}
                        {s.status || 'nova'}
                      </small>

                      {s.resposta && (
                        <p className="answer">
                          <b>Resposta:</b> {s.resposta}
                        </p>
                      )}
                    </div>

                    <button
                      className="small"
                      onClick={() => responderSugestao(s)}
                    >
                      Responder
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    )
  }

  const proximaGira = giras[0]
  const mensalidadeAtual = mensalidades[0]
  const statusAtual = statusMensalidade(mensalidadeAtual)

  return (
    <main className="app">
      <header>
        <div>
          <p className="eyebrow">
            TEMPLO T.U CABOCLO TUPINAMBÁ ODE LEKE
          </p>

          <h2>
            Olá, {perfil.nome || 'Filho da Casa'} 👋
          </h2>

          <p>{perfil.cargo || 'Membro'}</p>
        </div>

        <button className="ghost" onClick={sair}>
          Sair
        </button>
      </header>

      <nav className="menu">
        <button onClick={() => setPagina('dashboard')}>
          🏠 Início
        </button>
        <button onClick={() => setPagina('historico')}>
          💰 Mensalidades
        </button>
        <button onClick={() => setPagina('calendario')}>
          📅 Giras
        </button>
        <button onClick={() => setPagina('avisos')}>
          📢 Avisos
        </button>
        <button onClick={() => setPagina('estudos')}>
          📚 Estudos
        </button>
        <button onClick={() => setPagina('sugestoes')}>
          💡 Sugestões
        </button>
      </nav>

      {pagina === 'dashboard' && (
        <>
          <section className="grid">
            <article className="card hero">
              <span className="tag">PRÓXIMA GIRA</span>

              <h3>
                {proximaGira?.titulo || 'Nenhuma gira cadastrada'}
              </h3>

              {proximaGira && (
                <>
                  <p className="big">
                    {dataBR(proximaGira.data_gira)} •{' '}
                    {String(proximaGira.horario || '').slice(0, 5)}
                  </p>

                  <p>{proximaGira.orientacoes}</p>

                  <button
                    className="small"
                    onClick={() => confirmarPresenca(proximaGira)}
                  >
                    Confirmar minha presença
                  </button>
                </>
              )}
            </article>

            <article className="card">
              <span className="tag">MENSALIDADE</span>

              <h3>
                {dinheiro(mensalidadeAtual?.valor || 0)}
              </h3>

              <p>
                Vencimento:{' '}
                {mensalidadeAtual
                  ? dataBR(mensalidadeAtual.vencimento)
                  : '—'}
              </p>

              <strong
                className={
                  'status ' +
                  statusAtual.toLowerCase().replaceAll(' ', '-')
                }
              >
                {statusAtual}
              </strong>
            </article>
          </section>

          <article className="card wide">
            <span className="tag">O QUE LEVAR</span>
            <h3>Materiais para esta gira</h3>

            <div className="items">
              {materiais.length ? (
                materiais.map(m => (
                  <div className="item" key={m.id}>
                    ✓ {m.item}
                    {m.observacoes && (
                      <small> — {m.observacoes}</small>
                    )}
                  </div>
                ))
              ) : (
                <p>Nenhum material específico cadastrado.</p>
              )}
            </div>
          </article>
        </>
      )}

      {pagina === 'historico' && (
        <section className="card wide">
          <span className="tag">FINANCEIRO</span>
          <h3>Minhas Mensalidades</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Pago</th>
                  <th>Situação</th>
                </tr>
              </thead>

              <tbody>
                {mensalidades.map(m => (
                  <tr key={m.id}>
                    <td>{mesBR(m.competencia)}</td>
                    <td>{dataBR(m.vencimento)}</td>
                    <td>{dinheiro(m.valor)}</td>
                    <td>{dinheiro(m.valor_pago)}</td>
                    <td>{statusMensalidade(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pagina === 'calendario' && (
        <section className="card wide">
          <span className="tag">AGENDA</span>
          <h3>Próximas Giras</h3>

          <div className="list">
            {giras.map(g => (
              <div className="list-item" key={g.id}>
                <div>
                  <strong>{g.titulo}</strong>
                  <p>
                    {dataBR(g.data_gira)} •{' '}
                    {String(g.horario || '').slice(0, 5)}
                  </p>
                  <small>{g.orientacoes}</small>
                </div>

                <button
                  className="small"
                  onClick={() => confirmarPresenca(g)}
                >
                  Confirmar presença
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {pagina === 'avisos' && (
        <section className="card wide">
          <span className="tag">COMUNICADOS</span>
          <h3>Avisos da Casa</h3>

          <div className="list">
            {avisos.length === 0 && <p>Nenhum aviso publicado.</p>}

            {avisos.map(a => (
              <div className="list-item" key={a.id}>
                <div>
                  <strong>
                    {a.importante ? '⚠️ ' : '📢 '}
                    {a.titulo}
                  </strong>
                  <p>{a.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pagina === 'estudos' && (
        <section className="card wide">
          <span className="tag">CONHECIMENTO</span>
          <h3>Estudos e Apostilas</h3>

          <div className="list">
            {estudos.length === 0 && (
              <p>Nenhum conteúdo publicado.</p>
            )}

            {estudos.map(e => (
              <div className="list-item" key={e.id}>
                <div>
                  <strong>📚 {e.titulo}</strong>
                  <p>{e.descricao}</p>
                  <small>{e.categoria}</small>
                </div>

                <div className="actions">
                  {e.arquivo_url && (
                    <a
                      className="button-link"
                      href={e.arquivo_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir apostila
                    </a>
                  )}

                  {e.link_externo && (
                    <a
                      className="button-link"
                      href={e.link_externo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Acessar conteúdo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pagina === 'sugestoes' && (
        <section className="card wide">
          <span className="tag">SUA VOZ</span>
          <h3>Sugestões para o Templo</h3>

          <form className="form-grid" onSubmit={enviarSugestao}>
            <label>
              Assunto
              <input
                value={novaSugestao.assunto}
                onChange={e =>
                  setNovaSugestao({
                    ...novaSugestao,
                    assunto: e.target.value
                  })
                }
                required
              />
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={novaSugestao.anonima}
                onChange={e =>
                  setNovaSugestao({
                    ...novaSugestao,
                    anonima: e.target.checked
                  })
                }
              />
              Enviar como anônima
            </label>

            <label className="full">
              Mensagem
              <textarea
                value={novaSugestao.mensagem}
                onChange={e =>
                  setNovaSugestao({
                    ...novaSugestao,
                    mensagem: e.target.value
                  })
                }
                required
              />
            </label>

            <button type="submit">Enviar sugestão</button>
          </form>

          <div className="list">
            {sugestoes.map(s => (
              <div className="list-item" key={s.id}>
                <div>
                  <strong>{s.assunto}</strong>
                  <p>{s.mensagem}</p>
                  <small>Status: {s.status || 'nova'}</small>

                  {s.resposta && (
                    <p className="answer">
                      <b>Resposta do Templo:</b> {s.resposta}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
