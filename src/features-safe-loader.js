// Carregador seguro das melhorias opcionais.
// Cada modulo e isolado: se uma melhoria falhar, o React principal continua funcionando.
import { supabase } from './supabase.js'

const modulos = [
  { nome: 'presencas', carregar: () => import('./admin-presencas-addon.js') },
  { nome: 'area-filho', carregar: () => import('./area-filho-addon.js') },
  { nome: 'area-filho-v2', carregar: () => import('./area-filho-v2.js') },
  { nome: 'app-filho-mobile', carregar: () => import('./app-filho-mobile.js') },
  { nome: 'central-gira', carregar: () => import('./gestao-dashboard-addon.js') },
  { nome: 'mensalidades', carregar: () => import('./mensalidades-whatsapp-addon.js') }
]

const carregados = new Set()

async function carregarModuloSeguro(modulo) {
  if (carregados.has(modulo.nome)) return
  try {
    await modulo.carregar()
    carregados.add(modulo.nome)
  } catch (erro) {
    console.warn(`[Templo] melhoria opcional nao carregada: ${modulo.nome}`, erro)
  }
}

async function esperarAppPrincipal() {
  let tentativas = 0
  while (tentativas < 40) {
    const root = document.getElementById('root')
    if (root && root.childElementCount > 0) return true
    await new Promise(resolve => setTimeout(resolve, 150))
    tentativas += 1
  }
  return false
}

async function iniciarMelhorias() {
  if (!(await esperarAppPrincipal())) {
    console.warn('[Templo] app principal nao montou; melhorias opcionais foram ignoradas por seguranca.')
    return
  }
  for (const modulo of modulos) await carregarModuloSeguro(modulo)
}

function reiniciarAposAutenticacao() {
  window.dispatchEvent(new CustomEvent('templo:auth-ready'))
}

window.addEventListener('load', () => {
  setTimeout(() => iniciarMelhorias().catch(console.warn), 250)
})

supabase.auth.onAuthStateChange((event, session) => {
  if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
    setTimeout(() => {
      iniciarMelhorias().then(() => reiniciarAposAutenticacao()).catch(console.warn)
    }, 350)
  }
})
