const TABLES = ['perfis', 'mensalidades', 'giras', 'estudos', 'avisos']
export async function diagnosticarLeituras(supabase) {
  if (!supabase) return { verificacoes: [], erro: 'Supabase não configurado' }
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { verificacoes: [], erro: 'Sessão não autenticada' }
  const { data: perfil, error: perfilError } = await supabase.from('perfis').select('tipo_usuario').eq('id', user.id).maybeSingle()
  if (perfilError || perfil?.tipo_usuario !== 'administrador') return { verificacoes: [], erro: 'Acesso restrito ao administrador' }
  const verificacoes = await Promise.all(TABLES.map(async tabela => {
    try {
      const { count, error } = await supabase.from(tabela).select('*', { count: 'exact', head: true })
      return { tabela, ok: !error, registrosVisiveis: error ? null : count, erro: error?.message || null }
    } catch (e) { return { tabela, ok: false, registrosVisiveis: null, erro: e?.message || 'Erro de conexão' } }
  }))
  return { verificacoes }
}