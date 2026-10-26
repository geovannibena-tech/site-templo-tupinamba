// Compatibilidade global para funcoes usadas pelo bundle principal.
// Mantido em script classico para que identificadores globais sejam resolvidos
// mesmo quando o app principal e empacotado como ES module.
(function () {
  window.horaBR = function horaBR(valor) {
    if (!valor) return '—';
    var texto = String(valor).trim();
    var match = texto.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return texto;
    return match[1].padStart(2, '0') + ':' + match[2];
  };
})();
