import { supabase } from './supabase.js'

export async function carregarPresencasAdmin() {
  const [filhos, giras, presencas] = await Promise.all([
    supabase.rpc('admin_listar_filhos'),
    supabase.rpc('admin_listar_giras'),
    supabase.rpc('admin_listar_presencas')
  ])
  return { filhos: filhos.data || [], giras: giras.data || [], presencas: presencas.data || [] }
}
