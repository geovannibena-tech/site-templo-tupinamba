import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import './style.css'

function App(){
  const [session,setSession]=useState(null)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [erro,setErro]=useState('')
  const [perfil,setPerfil]=useState(null)
  const [gira,setGira]=useState(null)
  const [materiais,setMateriais]=useState([])
  const [mensalidades,setMensalidades]=useState([])

  useEffect(()=>{
    if(!supabase) return
    supabase.auth.getSession().then(({data})=>setSession(data.session))
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s))
    return ()=>subscription.unsubscribe()
  },[])

  useEffect(()=>{
    if(!session || !supabase) return
    ;(async()=>{
      const uid=session.user.id
      const {data:p}=await supabase.from('perfis').select('*').eq('id',uid).single()
      setPerfil(p)
      const hoje=new Date().toISOString().slice(0,10)
      const {data:g}=await supabase.from('giras').select('*').gte('data_gira',hoje).order('data_gira').limit(1).maybeSingle()
      setGira(g)
      if(g && p){
        const {data:m}=await supabase.from('materiais_gira').select('*').eq('gira_id',g.id).eq('cargo',p.cargo).order('id')
        setMateriais(m||[])
      }
      const {data:ms}=await supabase.from('mensalidades').select('*').eq('filho_id',uid).order('competencia',{ascending:false}).limit(6)
      setMensalidades(ms||[])
    })()
  },[session])

  async function entrar(e){
    e.preventDefault(); setErro('')
    if(!supabase){setErro('A conexão com o Supabase ainda precisa ser configurada.'); return}
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error) setErro('E-mail ou senha inválidos.')
  }

  if(!session) return <main className="login-wrap">
    <section className="login-card">
      <div className="mark">TU</div>
      <p className="eyebrow">TEMPLO DE UMBANDA</p>
      <h1>Caboclo Tupinamba<br/>Ode Leke</h1>
      <p className="muted">Área reservada aos filhos da casa</p>
      <form onSubmit={entrar}>
        <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
        <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
        {erro && <p className="error">{erro}</p>}
        <button>Entrar na Área do Filho</button>
      </form>
      <p className="footer-note">Fé • Disciplina • Caridade • Ancestralidade</p>
    </section>
  </main>

  const statusMensalidade = mensalidades[0] ? 
    (Number(mensalidades[0].valor_pago) >= Number(mensalidades[0].valor) ? 'Pago' :
      (new Date(mensalidades[0].vencimento+'T23:59:59') < new Date() ? 'Atrasado' : 'Pendente'))
    : 'Sem lançamento'

  return <main className="app">
    <header>
      <div><p className="eyebrow">TEMPLO T.U CABOCLO TUPINAMBA ODE LEKE</p><h2>Olá, {perfil?.nome || 'Filho da casa'} 👋</h2><p>{perfil?.cargo || 'Membro'}</p></div>
      <button className="ghost" onClick={()=>supabase.auth.signOut()}>Sair</button>
    </header>
    <section className="grid">
      <article className="card hero">
        <span className="tag">PRÓXIMA GIRA</span>
        <h3>{gira?.titulo || 'Nenhuma gira cadastrada'}</h3>
        {gira && <><p className="big">{new Date(gira.data_gira+'T12:00:00').toLocaleDateString('pt-BR')} • {String(gira.horario||'').slice(0,5)}</p><p>{gira.orientacoes}</p></>}
      </article>
      <article className="card">
        <span className="tag">MENSALIDADE</span>
        <h3>R$ {Number(perfil?.valor_mensalidade||0).toFixed(2).replace('.',',')}</h3>
        <p>Vencimento: dia {perfil?.dia_vencimento || '—'}</p>
        <strong className={"status "+statusMensalidade.toLowerCase()}>{statusMensalidade}</strong>
      </article>
      <article className="card wide">
        <span className="tag">O QUE LEVAR</span>
        <h3>Materiais para esta gira</h3>
        <div className="items">{materiais.length ? materiais.map(m=><div className="item" key={m.id}>✓ {m.item}</div>) : <p>Nenhum material específico cadastrado.</p>}</div>
      </article>
      <article className="card shortcut"><b>📚 Estudos e Apostilas</b><p>Conteúdos reservados da casa.</p></article>
      <article className="card shortcut"><b>📢 Avisos</b><p>Orientações e comunicados.</p></article>
      <article className="card shortcut"><b>📅 Calendário</b><p>Próximas giras e atividades.</p></article>
      <article className="card shortcut"><b>💡 Sugestões</b><p>Envie uma ideia ao administrador.</p></article>
    </section>
  </main>
}
createRoot(document.getElementById('root')).render(<App />)
