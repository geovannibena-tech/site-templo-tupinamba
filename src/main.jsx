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


const CARGOS_PADRAO = [
  'Médium em Desenvolvimento',
  'Médium de Trabalho',
  'Cambone',
  'Ogã',
  'Curimbeiro',
  'Ekedi',
  'Mãe Pequena',
  'Responsável pela Tronqueira',
  'Responsável pelo Congá',
  'Responsável pela Cozinha',
  'Secretaria',
  'Tesouraria',
  'Organização das Giras',
  'Responsável por Eventos',
  'Responsável por Limpeza',
  'Responsável por Materiais',
  'Auxiliar'
]

const ESTUDOS_BASE = [
  {
    titulo: 'Material de Apoio 01',
    descricao: 'Princípios religiosos, preparação dos filhos da casa para as giras, uniforme, saudações e pontos cantados.',
    categoria: 'Formação na Umbanda',
    ordem: 1
  },
  {
    titulo: 'Material de Apoio 02',
    descricao: 'Orixás, saudações, ervas, cores de vela, datas festivas e linhas de entidades.',
    categoria: 'Orixás e Entidades',
    ordem: 2
  },
  {
    titulo: 'Material de Apoio 03',
    descricao: 'A Umbanda e Deus, Orixás e fundamentos de culto.',
    categoria: 'Fundamentos',
    ordem: 3
  },
  {
    titulo: 'Material de Apoio 04',
    descricao: 'Anjo da Guarda, preces e ritualísticas importantes.',
    categoria: 'Preces e Ritualísticas',
    ordem: 4
  },
  {
    titulo: 'Material de Apoio 05',
    descricao: 'Formação de cambonos: funções, procedimentos, atendimento e sigilo.',
    categoria: 'Formação de Cambonos',
    ordem: 5
  },
  {
    titulo: 'Material de Apoio 06',
    descricao: 'O que é a Umbanda e aspectos de sua história.',
    categoria: 'História da Umbanda',
    ordem: 6
  },
  {
    titulo: 'Material de Apoio 07',
    descricao: 'Guias, passe, pemba, alguidar, defumação e outros elementos de trabalho.',
    categoria: 'Elementos de Trabalho',
    ordem: 7
  },
  {
    titulo: 'Material de Apoio 08',
    descricao: 'A importância das ervas na Umbanda, classificações e formas de utilização.',
    categoria: 'Ervas',
    ordem: 8
  },
  {
    titulo: 'Material de Apoio 09',
    descricao: 'Fundamento, axé e o sagrado na Umbanda.',
    categoria: 'Fundamento e Axé',
    ordem: 9
  }
]

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
  const [fichaFilho, setFichaFilho] = useState(null)
  const [buscaFilho, setBuscaFilho] = useState('')
  const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos')
  const [pagamentoModal, setPagamentoModal] = useState(null)
  const [formPagamento, setFormPagamento] = useState({
    valor: '',
    data_pagamento: '',
    forma_pagamento: 'Pix',
    observacoes: ''
  })
  const [giraSelecionada, setGiraSelecionada] = useState('')
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

  const cargosDisponiveis = Array.from(
    new Set([
      ...CARGOS_PADRAO,
      ...filhos.map(f => f.cargo).filter(Boolean)
    ])
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'))


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

  function abrirPagamento(m) {
    const restante = Math.max(
      0,
      Number(m.valor || 0) - Number(m.valor_pago || 0)
    )

    setPagamentoModal(m)
    setFormPagamento({
      valor: restante.toFixed(2).replace('.', ','),
      data_pagamento: hojeISO(),
      forma_pagamento: 'Pix',
      observacoes: ''
    })
  }

  async function salvarPagamento(e) {
    e.preventDefault()
    if (!pagamentoModal) return

    const restante = Math.max(
      0,
      Number(pagamentoModal.valor || 0) -
        Number(pagamentoModal.valor_pago || 0)
    )

    const valorNovo = Number(
      String(formPagamento.valor || '').replace(',', '.')
    )

    if (!valorNovo || valorNovo <= 0) {
      alert('Informe um valor válido.')
      return
    }

    if (valorNovo > restante + 0.001) {
      alert(`O valor não pode ser maior que o saldo de ${dinheiro(restante)}.`)
      return
    }

    const totalPago =
      Number(pagamentoModal.valor_pago || 0) + valorNovo

    const { error: e1 } = await supabase
      .from('pagamentos')
      .insert({
        mensalidade_id: pagamentoModal.id,
        valor: valorNovo,
        data_pagamento: formPagamento.data_pagamento || hojeISO(),
        forma_pagamento: formPagamento.forma_pagamento || 'Pix',
        observacoes: formPagamento.observacoes || null
      })

    if (e1) return alert(e1.message)

    const quitada =
      totalPago >= Number(pagamentoModal.valor || 0) - 0.001

    const { error: e2 } = await supabase
      .from('mensalidades')
      .update({
        valor_pago: totalPago,
        data_pagamento: quitada
          ? (formPagamento.data_pagamento || hojeISO())
          : null,
        forma_pagamento: formPagamento.forma_pagamento || 'Pix'
      })
      .eq('id', pagamentoModal.id)

    if (e2) return alert(e2.message)

    setPagamentoModal(null)
    setMsg(
      quitada
        ? 'Pagamento registrado e mensalidade quitada.'
        : 'Pagamento parcial registrado com sucesso.'
    )
    await carregarAdmin()
  }

  async function gerarMensalidadesAgora() {
    const { data, error } = await supabase.rpc('gerar_mensalidades_mes', {
      p_competencia: `${hojeISO().slice(0, 7)}-01`
    })

    if (error) return alert(error.message)

    alert(
      Number(data || 0) > 0
        ? `${data} mensalidade(s) gerada(s) com sucesso.`
        : 'As mensalidades deste mês já estão em dia.'
    )

    await carregarAdmin()
  }

  async function editarGira(g) {
    const titulo = window.prompt('Título da gira:', g.titulo || '')
    if (titulo === null) return

    const orientacoes = window.prompt(
      'Orientações da gira:',
      g.orientacoes || ''
    )
    if (orientacoes === null) return

    const { error } = await supabase
      .from('giras')
      .update({ titulo, orientacoes })
      .eq('id', g.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function editarMaterial(m) {
    const item = window.prompt('Material:', m.item || '')
    if (item === null) return

    const observacoes = window.prompt(
      'Observações:',
      m.observacoes || ''
    )
    if (observacoes === null) return

    const { error } = await supabase
      .from('materiais_gira')
      .update({ item, observacoes })
      .eq('id', m.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function editarAviso(a) {
    const titulo = window.prompt('Título do aviso:', a.titulo || '')
    if (titulo === null) return

    const mensagem = window.prompt('Mensagem:', a.mensagem || '')
    if (mensagem === null) return

    const { error } = await supabase
      .from('avisos')
      .update({ titulo, mensagem })
      .eq('id', a.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function editarEstudo(estudo) {
    const titulo = window.prompt('Título:', estudo.titulo || '')
    if (titulo === null) return

    const descricao = window.prompt(
      'Descrição:',
      estudo.descricao || ''
    )
    if (descricao === null) return

    const { error } = await supabase
      .from('estudos')
      .update({ titulo, descricao })
      .eq('id', estudo.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function marcarPresencaAdmin(p, presente) {
    const { error } = await supabase
      .from('presencas_gira')
      .update({ presente })
      .eq('id', p.id)

    if (error) return alert(error.message)

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

    const itens = String(novoMaterial.itens || novoMaterial.item || '')
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean)

    if (!novoMaterial.gira_id) {
      return alert('Selecione a gira.')
    }

    if (!novoMaterial.cargo) {
      return alert('Selecione o cargo.')
    }

    if (itens.length === 0) {
      return alert('Digite pelo menos um material.')
    }

    const registros = itens.map(item => ({
      gira_id: Number(novoMaterial.gira_id),
      cargo: novoMaterial.cargo,
      item,
      obrigatorio: novoMaterial.obrigatorio !== false,
      observacoes: novoMaterial.observacoes || null
    }))

    const { error } = await supabase
      .from('materiais_gira')
      .insert(registros)

    if (error) return alert(error.message)

    // Mantém gira e cargo selecionados para facilitar novos cadastros.
    setNovoMaterial({
      gira_id: novoMaterial.gira_id,
      cargo: novoMaterial.cargo,
      obrigatorio: novoMaterial.obrigatorio !== false,
      itens: '',
      observacoes: ''
    })

    await carregarAdmin()
    alert(
      itens.length === 1
        ? 'Material cadastrado.'
        : `${itens.length} materiais cadastrados de uma vez.`
    )
  }

  async function carregarEstudosBase() {
    const existentes = new Set(
      estudos.map(e => String(e.titulo || '').trim().toLowerCase())
    )

    const faltantes = ESTUDOS_BASE
      .filter(
        e => !existentes.has(e.titulo.trim().toLowerCase())
      )
      .map(e => ({
        ...e,
        arquivo_url: null,
        link_externo: null,
        somente_filhos: true,
        publicado: true
      }))

    if (faltantes.length === 0) {
      return alert('Os 9 Materiais de Apoio já estão cadastrados.')
    }

    const { error } = await supabase
      .from('estudos')
      .insert(faltantes)

    if (error) return alert(error.message)

    await carregarAdmin()
    alert(
      `${faltantes.length} material(is) de estudo carregado(s) com sucesso.`
    )
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
            <section className="kpi-grid">
              <button className="kpi-card" onClick={() => setPagina('filhos')}>
                <span>FILHOS ATIVOS</span>
                <strong>{resumo.filhos}</strong>
                <small>Cadastros ativos</small>
              </button>

              <button className="kpi-card warning" onClick={() => setPagina('mensalidades')}>
                <span>PENDÊNCIAS</span>
                <strong>{resumo.pendencias}</strong>
                <small>Mensalidades atrasadas</small>
              </button>

              <button className="kpi-card" onClick={() => setPagina('mensalidades')}>
                <span>PREVISTO NO MÊS</span>
                <strong className="money-kpi">{dinheiro(resumo.previsto)}</strong>
                <small>Total previsto</small>
              </button>

              <button className="kpi-card success" onClick={() => setPagina('mensalidades')}>
                <span>RECEBIDO NO MÊS</span>
                <strong className="money-kpi">{dinheiro(resumo.recebido)}</strong>
                <small>Total recebido</small>
              </button>

              <article className="kpi-card">
                <span>SALDO A RECEBER</span>
                <strong className="money-kpi">
                  {dinheiro(Math.max(0, resumo.previsto - resumo.recebido))}
                </strong>
                <small>Em aberto no mês</small>
              </article>
            </section>

            <section className="card wide">
              <div className="section-heading">
                <div>
                  <span className="tag">DESEMPENHO FINANCEIRO</span>
                  <h3>Recebimento do mês</h3>
                </div>
                <strong>
                  {resumo.previsto > 0
                    ? Math.round((resumo.recebido / resumo.previsto) * 100)
                    : 0}%
                </strong>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      resumo.previsto > 0
                        ? (resumo.recebido / resumo.previsto) * 100
                        : 0
                    )}%`
                  }}
                />
              </div>
            </section>

            <section className="dashboard-detail-grid">
              <article className="card">
                <span className="tag">PRÓXIMA GIRA</span>
                {giras[0] ? (
                  <>
                    <h3>{giras[0].titulo}</h3>
                    <p className="big">
                      {dataBR(giras[0].data_gira)} • {String(giras[0].horario || '').slice(0, 5)}
                    </p>
                    <p>{giras[0].orientacoes || 'Sem orientações cadastradas.'}</p>
                    <button className="small" onClick={() => setPagina('giras')}>
                      Abrir central da gira
                    </button>
                  </>
                ) : (
                  <p>Nenhuma gira cadastrada.</p>
                )}
              </article>

              <article className="card">
                <span className="tag">ÚLTIMOS RECEBIMENTOS</span>
                <div className="mini-list">
                  {pagamentos.slice(0, 5).map(p => {
                    const mens = mensalidades.find(m => m.id === p.mensalidade_id)
                    return (
                      <div className="mini-row" key={p.id}>
                        <div>
                          <strong>{mens?.nome || 'Pagamento'}</strong>
                          <small>{dataBR(p.data_pagamento)} • {p.forma_pagamento || '—'}</small>
                        </div>
                        <strong>{dinheiro(p.valor)}</strong>
                      </div>
                    )
                  })}
                  {!pagamentos.length && <p>Nenhum pagamento registrado.</p>}
                </div>
              </article>
            </section>

            <section className="card wide">
              <span className="tag">PENDÊNCIAS DO MÊS</span>
              <h3>Quem precisa de atenção</h3>
              <div className="mini-list">
                {mensalidades
                  .filter(m => (m.situacao || statusMensalidade(m)) !== 'Pago')
                  .slice(0, 6)
                  .map(m => (
                    <div className="mini-row" key={m.id}>
                      <div>
                        <strong>{m.nome || 'Filho da casa'}</strong>
                        <small>Venceu em {dataBR(m.vencimento)}</small>
                      </div>
                      <div className="actions">
                        <strong>
                          {dinheiro(
                            Math.max(0, Number(m.valor || 0) - Number(m.valor_pago || 0))
                          )}
                        </strong>
                        <button className="small" onClick={() => abrirPagamento(m)}>
                          Receber
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section className="card wide">
              <span className="tag">GESTÃO DO TEMPLO</span>
              <h3>Ações rápidas</h3>
              <div className="admin-shortcuts">
                <button onClick={gerarMensalidadesAgora}>⚡ Gerar mensalidades</button>
                <button onClick={() => setPagina('filhos')}>👥 Filhos</button>
                <button onClick={() => setPagina('mensalidades')}>💰 Financeiro</button>
                <button onClick={() => setPagina('giras')}>📅 Giras</button>
                <button onClick={() => setPagina('materiais')}>🧳 Materiais</button>
                <button onClick={() => setPagina('avisos')}>📢 Avisos</button>
                <button onClick={() => setPagina('estudos')}>📚 Estudos</button>
                <button onClick={() => setPagina('sugestoes')}>💡 Sugestões</button>
              </div>
            </section>
          </>
        )}

        {pagina === 'filhos' && (
          <section className="card wide">
            <div className="section-heading">
              <div>
                <span className="tag">CADASTRO</span>
                <h3>Filhos da Casa</h3>
              </div>
              <input
                className="search-input"
                placeholder="Buscar filho pelo nome..."
                value={buscaFilho}
                onChange={e => setBuscaFilho(e.target.value)}
              />
            </div>

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
                  {filhos
                    .filter(f =>
                      String(f.nome || '')
                        .toLowerCase()
                        .includes(buscaFilho.toLowerCase())
                    )
                    .map(f => (
                    <tr key={f.id}>
                      <td>{f.nome}</td>
                      <td>{f.cargo || '—'}</td>
                      <td>Dia {f.dia_vencimento || '—'}</td>
                      <td>{dinheiro(f.valor_mensalidade)}</td>
                      <td>{f.ativo ? 'Ativo' : 'Inativo'}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="small"
                            onClick={() => {
                              setEditFilho(null)
                              setFichaFilho({ ...f })
                            }}
                          >
                            Ver ficha
                          </button>
                          <button
                            className="small ghost"
                            onClick={() => {
                              setFichaFilho(null)
                              setEditFilho({ ...f })
                            }}
                          >
                            Editar
                          </button>
                        </div>
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
                  Data de nascimento
                  <input
                    type="date"
                    value={editFilho.data_nascimento || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        data_nascimento: e.target.value
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

            {fichaFilho && (
              <div className="profile-sheet">
                <div className="section-heading">
                  <div>
                    <span className="tag">FICHA COMPLETA</span>
                    <h3>{fichaFilho.nome}</h3>
                    <p>{fichaFilho.cargo || 'Sem cargo informado'}</p>
                  </div>
                  <div className="actions">
                    {fichaFilho.telefone && (
                      <a
                        className="button-link small"
                        href={`https://wa.me/55${String(fichaFilho.telefone).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      className="ghost small"
                      onClick={() => setFichaFilho(null)}
                    >
                      Fechar ficha
                    </button>
                  </div>
                </div>

                <div className="profile-grid">
                  <div>
                    <small>Telefone</small>
                    <strong>{fichaFilho.telefone || '—'}</strong>
                  </div>
                  <div>
                    <small>Nascimento</small>
                    <strong>{dataBR(fichaFilho.data_nascimento)}</strong>
                  </div>
                  <div>
                    <small>Entrada na casa</small>
                    <strong>{dataBR(fichaFilho.data_entrada)}</strong>
                  </div>
                  <div>
                    <small>Mensalidade</small>
                    <strong>{dinheiro(fichaFilho.valor_mensalidade)}</strong>
                  </div>
                  <div>
                    <small>Vencimento</small>
                    <strong>Dia {fichaFilho.dia_vencimento || '—'}</strong>
                  </div>
                  <div>
                    <small>Status</small>
                    <strong>{fichaFilho.ativo ? 'Ativo' : 'Inativo'}</strong>
                  </div>
                </div>

                {fichaFilho.observacoes && (
                  <p className="answer">
                    <b>Observações:</b> {fichaFilho.observacoes}
                  </p>
                )}

                <h3>Histórico financeiro</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Competência</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Pago</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensalidades
                        .filter(m => m.filho_id === fichaFilho.id)
                        .map(m => (
                          <tr key={m.id}>
                            <td>{mesBR(m.competencia)}</td>
                            <td>{dataBR(m.vencimento)}</td>
                            <td>{dinheiro(m.valor)}</td>
                            <td>{dinheiro(m.valor_pago)}</td>
                            <td>{m.situacao || statusMensalidade(m)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <h3>Histórico de presença</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Gira</th>
                        <th>Confirmou</th>
                        <th>Presença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presencas
                        .filter(p => p.filho_id === fichaFilho.id)
                        .map(p => {
                          const gira = giras.find(g => g.id === p.gira_id)
                          return (
                            <tr key={p.id}>
                              <td>{gira?.titulo || `Gira #${p.gira_id}`}</td>
                              <td>{p.confirmado ? 'Sim' : 'Não'}</td>
                              <td>{p.presente ? 'Presente' : 'Não marcado'}</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}


        {pagina === 'mensalidades' && (
          <section className="card wide">
            <div className="section-heading">
              <div>
                <span className="tag">FINANCEIRO</span>
                <h3>Mensalidades e Pagamentos</h3>
              </div>
              <button onClick={gerarMensalidadesAgora}>
                Gerar mensalidades do mês
              </button>
            </div>

            <div className="filter-bar">
              {[
                ['todos', 'Todos'],
                ['pagos', 'Pagos'],
                ['pendentes', 'Pendentes'],
                ['atrasados', 'Atrasados'],
                ['parciais', 'Parciais']
              ].map(([valor, rotulo]) => (
                <button
                  key={valor}
                  className={filtroFinanceiro === valor ? 'active-filter' : 'ghost'}
                  onClick={() => setFiltroFinanceiro(valor)}
                >
                  {rotulo}
                </button>
              ))}
            </div>

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
                  {mensalidades
                    .filter(m => {
                      const st = m.situacao || statusMensalidade(m)
                      if (filtroFinanceiro === 'pagos') return st === 'Pago'
                      if (filtroFinanceiro === 'pendentes') return st === 'Pendente'
                      if (filtroFinanceiro === 'atrasados') return st.includes('Atrasado')
                      if (filtroFinanceiro === 'parciais') return st.includes('Parcial')
                      return true
                    })
                    .map(m => {
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
                              onClick={() => abrirPagamento(m)}
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

            <h3 className="subheading">Histórico de recebimentos</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Filho</th>
                    <th>Valor</th>
                    <th>Forma</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map(p => {
                    const mens = mensalidades.find(m => m.id === p.mensalidade_id)
                    return (
                      <tr key={p.id}>
                        <td>{dataBR(p.data_pagamento)}</td>
                        <td>{mens?.nome || '—'}</td>
                        <td>{dinheiro(p.valor)}</td>
                        <td>{p.forma_pagamento || '—'}</td>
                        <td>{p.observacoes || '—'}</td>
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

                  <div className="actions">
                    <button
                      className="small ghost"
                      onClick={() => editarGira(g)}
                    >
                      Editar
                    </button>
                    <button
                      className="danger small"
                      onClick={() => excluirGira(g.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="central-gira">
              <div className="section-heading">
                <div>
                  <span className="tag">CENTRAL DA GIRA</span>
                  <h3>Organização e presença</h3>
                </div>
                <select
                  className="gira-select"
                  value={giraSelecionada}
                  onChange={e => setGiraSelecionada(e.target.value)}
                >
                  <option value="">Todas as giras</option>
                  {giras.map(g => (
                    <option key={g.id} value={String(g.id)}>
                      {g.titulo} - {dataBR(g.data_gira)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gira-stats">
                <div>
                  <small>CONFIRMADOS</small>
                  <strong>
                    {presencas.filter(p =>
                      (!giraSelecionada || String(p.gira_id) === giraSelecionada) &&
                      p.confirmado
                    ).length}
                  </strong>
                </div>
                <div>
                  <small>PRESENTES</small>
                  <strong>
                    {presencas.filter(p =>
                      (!giraSelecionada || String(p.gira_id) === giraSelecionada) &&
                      p.presente
                    ).length}
                  </strong>
                </div>
                <div>
                  <small>REGISTROS</small>
                  <strong>
                    {presencas.filter(p =>
                      !giraSelecionada || String(p.gira_id) === giraSelecionada
                    ).length}
                  </strong>
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: 30 }}>Presenças e confirmações</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Filho</th>
                    <th>Gira</th>
                    <th>Confirmou</th>
                    <th>Presença</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {presencas
                    .filter(p =>
                      !giraSelecionada || String(p.gira_id) === giraSelecionada
                    )
                    .map(p => {
                    const filho = filhos.find(f => f.id === p.filho_id)
                    const gira = giras.find(g => g.id === p.gira_id)

                    return (
                      <tr key={p.id}>
                        <td>{filho?.nome || '—'}</td>
                        <td>{gira?.titulo || `Gira #${p.gira_id}`}</td>
                        <td>{p.confirmado ? 'Sim' : 'Não'}</td>
                        <td>{p.presente ? 'Presente' : 'Não marcado'}</td>
                        <td>
                          <div className="actions">
                            <button
                              className="small"
                              onClick={() => marcarPresencaAdmin(p, true)}
                            >
                              Presente
                            </button>
                            <button
                              className="small ghost"
                              onClick={() => marcarPresencaAdmin(p, false)}
                            >
                              Faltou
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {pagina === 'materiais' && (
          <section className="card wide">
            <span className="tag">ORGANIZAÇÃO</span>
            <h3>Materiais das Giras</h3>

            <p className="muted">
              Escolha a gira e o cargo uma vez. Para cadastrar vários itens,
              digite um material por linha.
            </p>

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
                  <option value="">Selecione a gira</option>
                  {giras.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.titulo} - {dataBR(g.data_gira)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Cargo / Função
                <select
                  value={novoMaterial.cargo || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      cargo: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Selecione o cargo</option>
                  {cargosDisponiveis.map(cargo => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full">
                Materiais
                <textarea
                  rows="7"
                  placeholder={'Digite um por linha. Ex.:\nPemba branca\nToalha\nGarrafinha de água\nIsqueiro\nCaderno\nCaneta'}
                  value={novoMaterial.itens || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      itens: e.target.value
                    })
                  }
                  required
                />
                <small>
                  Você pode cadastrar todos os materiais desse cargo de uma só vez.
                </small>
              </label>

              <label className="full">
                Observações para este grupo
                <textarea
                  placeholder="Ex.: Levar o kit completo e chegar com antecedência."
                  value={novoMaterial.observacoes || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      observacoes: e.target.value
                    })
                  }
                />
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={novoMaterial.obrigatorio !== false}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      obrigatorio: e.target.checked
                    })
                  }
                />
                Material obrigatório
              </label>

              <button type="submit">Adicionar materiais</button>
            </form>

            <div className="list">
              {materiais.length === 0 && (
                <p>Nenhum material cadastrado.</p>
              )}

              {materiais.map(m => {
                const gira = giras.find(g => Number(g.id) === Number(m.gira_id))

                return (
                  <div className="list-item" key={m.id}>
                    <div>
                      <strong>
                        {m.obrigatorio === false ? '○' : '✓'} {m.item}
                      </strong>
                      <p>
                        {gira
                          ? `${gira.titulo} • ${dataBR(gira.data_gira)}`
                          : 'Gira'}{' '}
                        • {m.cargo}
                      </p>
                      {m.observacoes && <small>{m.observacoes}</small>}
                    </div>

                    <div className="actions">
                      <button
                        className="small ghost"
                        onClick={() => editarMaterial(m)}
                      >
                        Editar
                      </button>
                      <button
                        className="danger small"
                        onClick={() => excluirMaterial(m.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )
              })}
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

                  <div className="actions">
                    <button
                      className="small ghost"
                      onClick={() => editarAviso(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="danger small"
                      onClick={() => excluirAviso(a.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {pagina === 'estudos' && (
          <section className="card wide">
            <span className="tag">CONHECIMENTO</span>
            <h3>Biblioteca de Formação</h3>

            <div className="list-item" style={{ marginBottom: 18 }}>
              <div>
                <strong>📚 Formação interna do Templo</strong>
                <p>
                  Carregue de uma vez os 9 Materiais de Apoio que já faziam
                  parte do sistema anterior. O botão não duplica materiais
                  que já estejam cadastrados.
                </p>
              </div>
              <div className="actions">
                <button type="button" onClick={carregarEstudosBase}>
                  Carregar 9 estudos
                </button>
              </div>
            </div>

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
                  placeholder="Ex.: Fundamentos"
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
                Link da apostila / arquivo
                <input
                  type="url"
                  placeholder="https://..."
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
                  placeholder="https://..."
                  value={novoEstudo.link_externo || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      link_externo: e.target.value
                    })
                  }
                />
              </label>

              <button type="submit">Publicar novo estudo</button>
            </form>

            <h3 style={{ marginTop: 30 }}>Conteúdos publicados</h3>

            <div className="list">
              {estudos.length === 0 && (
                <p>
                  Nenhum conteúdo publicado. Clique em “Carregar 9 estudos”
                  para trazer a formação inicial.
                </p>
              )}

              {[...estudos]
                .sort((a, b) =>
                  Number(a.ordem || 0) - Number(b.ordem || 0)
                )
                .map(e => (
                  <div className="list-item" key={e.id}>
                    <div>
                      <strong>📚 {e.titulo}</strong>
                      <p>{e.descricao}</p>
                      <small>{e.categoria || 'Geral'}</small>
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

                      <button
                        className="small ghost"
                        onClick={() => editarEstudo(e)}
                      >
                        Editar
                      </button>
                      <button
                        className="danger small"
                        onClick={() => excluirEstudo(e.id)}
                      >
                        Excluir
                      </button>
                    </div>
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
        {pagamentoModal && (
          <div className="modal-backdrop" onClick={() => setPagamentoModal(null)}>
            <section className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="section-heading">
                <div>
                  <span className="tag">REGISTRAR RECEBIMENTO</span>
                  <h3>{pagamentoModal.nome || 'Filho da casa'}</h3>
                </div>
                <button className="ghost small" onClick={() => setPagamentoModal(null)}>
                  Fechar
                </button>
              </div>

              <div className="payment-summary">
                <div>
                  <small>Mensalidade</small>
                  <strong>{dinheiro(pagamentoModal.valor)}</strong>
                </div>
                <div>
                  <small>Já pago</small>
                  <strong>{dinheiro(pagamentoModal.valor_pago)}</strong>
                </div>
                <div>
                  <small>Saldo</small>
                  <strong>
                    {dinheiro(
                      Math.max(
                        0,
                        Number(pagamentoModal.valor || 0) -
                          Number(pagamentoModal.valor_pago || 0)
                      )
                    )}
                  </strong>
                </div>
              </div>

              <form className="form-grid" onSubmit={salvarPagamento}>
                <label>
                  Valor recebido
                  <input
                    inputMode="decimal"
                    value={formPagamento.valor}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        valor: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Data do pagamento
                  <input
                    type="date"
                    value={formPagamento.data_pagamento}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        data_pagamento: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Forma de pagamento
                  <select
                    value={formPagamento.forma_pagamento}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        forma_pagamento: e.target.value
                      })
                    }
                  >
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão</option>
                    <option>Transferência</option>
                    <option>Outro</option>
                  </select>
                </label>

                <label className="full">
                  Observações
                  <textarea
                    placeholder="Opcional"
                    value={formPagamento.observacoes}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        observacoes: e.target.value
                      })
                    }
                  />
                </label>

                <div className="actions full">
                  <button type="submit">Confirmar pagamento</button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setPagamentoModal(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
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

          {avisos.filter(a => a.importante).slice(0, 1).map(a => (
            <article className="card wide important-card" key={a.id}>
              <span className="tag">AVISO IMPORTANTE</span>
              <h3>{a.titulo}</h3>
              <p>{a.mensagem}</p>
            </article>
          ))}

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
