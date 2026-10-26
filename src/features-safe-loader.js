// Carregador seguro das melhorias opcionais.
// Cada modulo e isolado: se uma melhoria falhar, o React principal continua funcionando.
import { supabase } from './supabase.js'

const modulos = [
  '/src/admin-presencas-addon.js',
  '/src/area-filho-addon.js',
  '/src/gestao-dashboard-addon.js'
]

const carregados = new Set()

async function carregarModuloSeguro(src) {
  if (carregados.has(src)) return
  try {
    await import(src)
    carregados.add(src)
  } catch (erro) {
    console.warn(`[Templo] melhoria opcional nao carregada: ${src}`, erro)
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
  // Os addons podem ter sido importados antes do login. Nesse caso o codigo do modulo
  // ja esta em cache, mas a tela administrativa ainda nao existia. Disparamos um evento
  // proprio para que os addons reinstalem seus controles quando o usuario entrar.
  window.dispatchEvent(new CustomEvent('templo:auth-ready'))
}

window.addEventListener('load', () => {
  setTimeout(() => iniciarMelhorias().catch(console.warn), 250)
})

// O Supabase recomenda onAuthStateChange para reagir ao login/logout.
// Nao fazemos chamadas async ao Supabase dentro do callback; apenas reagendamos o trabalho,
// evitando bloqueios no cliente de autenticacao.
supabase.auth.onAuthStateChange((event, session) => {
  if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
    setTimeout(() => {
      iniciarMelhorias()
        .then(() => reiniciarAposAutenticacao())
        .catch(console.warn)
    }, 350)
  }
})
