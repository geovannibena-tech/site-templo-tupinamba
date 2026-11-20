// Diagnóstico de leitura do Supabase para uso no painel administrativo.
// Não grava, altera nem exclui registros. Não registra dados pessoais.
const TABLES = ['perfis', 'mensalidades', 'giras', 'estudos', 'avisos']

export async function diagnosticarLeituras(supabase) {
  if (!supabase) return { ok: false, autenticado: false, verificacoes: [], erro: 'Cliente Supabase não configurado' }

  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError || !auth?.user) {
    return { ok: false, autenticado: false, verificacoes: [], erro: authError?.message || 'Sessão não autenticada' }
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfis').select('tipo_usuario').eq('id', auth.user.id).maybeSingle()

  if (perfilError || perfil?.tipo_usuario !== 'administrador') {
    return { ok: false, autenticado: true, administrador: false, verificacoes: [], erro: perfilError?.message || 'Acesso restrito ao administrador' }
  }

  const verificacoes = await Promise.all(TABLES.map(async (tabela) => {
    try {
      const { count, error } = await supabase.from(tabela).select('*', { count: 'exact', head: true })
      return { tabela, ok: !error, registrosVisiveis: error ? null : count, erro: error?.message || null }
    } catch (err) {
      return { tabela, ok: false, registrosVisiveis: null, erro: err?.message || 'Falha de comunicação' }
    }
  }))

  return {
    ok: verificacoes.every(v => v.ok),
    autenticado: true,
    administrador: true,
    verificacoes,
    // Uma contagem zero pode significar tabela vazia OU filtro de segurança (RLS).
    observacao: 'Contagens refletem apenas registros visíveis ao usuário autenticado.'
  }
}
