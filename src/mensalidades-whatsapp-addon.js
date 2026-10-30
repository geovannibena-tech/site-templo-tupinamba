import { supabase } from './supabase'

async function montar(){
  const titulo=[...document.querySelectorAll('.section-heading h3')].find(x=>x.textContent.includes('Mensalidades e Pagamentos'))
  if(!titulo || document.querySelector('#financeiro-rapido')) return
  const {data}=await supabase.rpc('admin_listar_mensalidades')
  const box=document.createElement('div')
  box.id='financeiro-rapido'
  box.className='financeiro-rapido'
  box.innerHTML=`<strong>Central rápida de mensalidades</strong><p>${(data||[]).length} lançamentos encontrados. Use as ações da mensalidade para cobrar, registrar pagamento ou editar.</p>`
  titulo.closest('section').prepend(box)
}
const css=document.createElement('style')
css.textContent='.financeiro-rapido{margin:14px 0;padding:14px;border:1px solid rgba(212,175,55,.35);border-radius:16px}'
document.head.appendChild(css)
new MutationObserver(montar).observe(document.body,{childList:true,subtree:true})
montar()
