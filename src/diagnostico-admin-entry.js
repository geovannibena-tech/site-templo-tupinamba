import { supabase } from './supabase'
import { diagnosticarLeituras } from './diagnostico-leitura'

async function iniciarDiagnostico() {
  if (!supabase) return
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return
  const { data: perfil } = await supabase.from('perfis').select('tipo_usuario').eq('id', user.id).maybeSingle()
  if (perfil?.tipo_usuario !== 'administrador') return
  if (document.getElementById('diagnostico-templo-botao')) return
  const botao = document.createElement('button')
  botao.id = 'diagnostico-templo-botao'
  botao.type = 'button'
  botao.textContent = 'Verificar módulos'
  Object.assign(botao.style, { position:'fixed', right:'14px', bottom:'72px', zIndex:'9998', padding:'10px 14px', borderRadius:'12px', border:'1px solid #bda36b', background:'#14251e', color:'#f5dc9a', fontWeight:'600', cursor:'pointer' })
  botao.addEventListener('click', async () => {
    botao.disabled = true
    botao.textContent = 'Verificando...'
    try {
      const resultado = await diagnosticarLeituras(supabase)
      const linhas = resultado.verificacoes.map(v => v.ok ? v.tabela + ': ' + v.registrosVisiveis + ' registros visíveis' : v.tabela + ': ERRO - ' + v.erro)
      alert('Diagnóstico de leitura do templo\n\n' + (linhas.join('\n') || resultado.erro || 'Sem resultados') + '\n\nNenhum dado foi alterado.')
    } catch {
      alert('Não foi possível concluir a verificação. Tente novamente.')
    } finally {
      botao.disabled = false
      botao.textContent = 'Verificar módulos'
    }
  })
  document.body.appendChild(botao)
}

supabase?.auth.onAuthStateChange(() => { setTimeout(() => { iniciarDiagnostico().catch(() => {}) }, 1000) })
window.addEventListener('load', () => { iniciarDiagnostico().catch(() => {}) })
