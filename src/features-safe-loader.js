// Carregador seguro das melhorias opcionais.
// Cada modulo e isolado: se uma melhoria falhar, o React principal continua funcionando.
// IMPORTANTE: imports relativos e estaticamente analisaveis permitem que o Vite inclua
// os addons no build de producao. Caminhos absolutos /src/... podem funcionar no dev,
// mas nao existem como arquivos fonte no deploy final.
import { supabase } from './supabase.js'

const modulos = [
  { nome: 'presencas', carregar: () => import('./admin-presencas-addon.js') },
  { nome: 'area-filho', carregar: () => import('./area-filho-addon.js') },
  { nome: 'central-gira', carregar: () => import('./gestao-dashboard-addon.js') }
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

  for (const modulo of modulos) {
    await carregarModuloSeguro(modulo)
  }
}

function reiniciarAposAutenticacao() {
  // Os addons podem ter sido carregados antes do login, quando as telas privadas ainda
  // nao existiam. Este evento pede que cada addon reinstale seus controles apos o login.
  window.dispatchEvent(new CustomEvent('templo:auth-ready'))
}

window.addEventListener('load', () => {
  setTimeout(() => iniciarMelhorias().catch(console.warn), 250)
})

// Reage ao login sem executar chamadas async do Supabase dentro do callback de auth.
supabase.auth.onAuthStateChange((event, session) => {
  if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
    setTimeout(() => {
      iniciarMelhorias()
        .then(() => reiniciarAposAutenticacao())
        .catch(console.warn)
    }, 350)
  }
})
