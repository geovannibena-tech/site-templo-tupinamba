// Carregador seguro das melhorias opcionais.
// Cada modulo e isolado: se uma melhoria falhar, o React principal continua funcionando.
const modulos = [
  '/src/admin-presencas-addon.js',
  '/src/area-filho-addon.js',
  '/src/gestao-dashboard-addon.js'
]

async function carregarModuloSeguro(src) {
  try {
    await import(src)
  } catch (erro) {
    console.warn(`[Templo] melhoria opcional nao carregada: ${src}`, erro)
  }
}

async function iniciarMelhorias() {
  // O app principal tem prioridade absoluta.
  // Esperamos o #root receber conteudo antes de iniciar qualquer complemento.
  let tentativas = 0
  while (tentativas < 40) {
    const root = document.getElementById('root')
    if (root && root.childElementCount > 0) break
    await new Promise(resolve => setTimeout(resolve, 150))
    tentativas += 1
  }

  const root = document.getElementById('root')
  if (!root || root.childElementCount === 0) {
    console.warn('[Templo] app principal nao montou; melhorias opcionais foram ignoradas por seguranca.')
    return
  }

  for (const modulo of modulos) {
    await carregarModuloSeguro(modulo)
  }
}

window.addEventListener('load', () => {
  setTimeout(() => iniciarMelhorias().catch(console.warn), 250)
})
