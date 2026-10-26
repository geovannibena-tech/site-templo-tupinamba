import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import './style.css'

const dinheiro = (v) =>
  Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

const dataBR = (v) => {
  if (!v) return '—'
  const d = String(v).slice(0, 10).split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : v
}

const mesBR = (v) => {
  if (!v) return '—'
  const d = new Date(`${String(v).slice(0, 10)}T12:00:00`)
  return d.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  })
}

const hojeISO = () => {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10)
}

const statusMensalidade = (m) => {
  if (!m) return 'Sem lançamento'

  const valor = Number(m.valor || 0)
  const pago = Number(m.valor_pago || 0)

  if (pago >= valor && valor > 0) return 'Pago'
  if (pago > 0 && m.vencimento < hojeISO()) return 'Parcial / Atrasado'
  if (pago > 0) return 'Parcial'
  if (m.vencimento < hojeISO()) return 'Atrasado'
  return 'Pendente'
}


const CARGOS_PADRAO = [
  'Médium em Desenvolvimento',
  'Médium de Trabalho',
  'Cambone',
  'Ogã',
  'Curimbeiro',
  'Ekedi',
  'Mãe Pequena',
  'Responsável pela Tronqueira',
  'Responsável pelo Congá',
  'Responsável pela Cozinha',
  'Secretaria',
  'Tesouraria',
  'Organização das Giras',
  'Responsável por Eventos',
  'Responsável por Limpeza',
  'Responsável por Materiais',
  'Auxiliar'
]

const ESTUDOS_BASE = [
  {
    titulo: 'Material de Apoio 01',
    descricao: 'Princípios religiosos, preparação dos filhos da casa para as giras, uniforme, saudações e pontos cantados.',
    categoria: 'Formação na Umbanda',
    ordem: 1
  },
  {
    titulo: 'Material de Apoio 02',
    descricao: 'Orixás, saudações, ervas, cores de vela, datas festivas e linhas de entidades.',
    categoria: 'Orixás e Entidades',
    ordem: 2
  },
  {
    titulo: 'Material de Apoio 03',
    descricao: 'A Umbanda e Deus, Orixás e fundamentos de culto.',
    categoria: 'Fundamentos',
    ordem: 3
  },
  {
    titulo: 'Material de Apoio 04',
    descricao: 'Anjo da Guarda, preces e ritualísticas importantes.',
    categoria: 'Preces e Ritualísticas',
    ordem: 4
  },
  {
    titulo: 'Material de Apoio 05',
    descricao: 'Formação de cambonos: funções, procedimentos, atendimento e sigilo.',
    categoria: 'Formação de Cambonos',
    ordem: 5
  },
  {
    titulo: 'Material de Apoio 06',
    descricao: 'O que é a Umbanda e aspectos de sua história.',
    categoria: 'História da Umbanda',
    ordem: 6
  },
  {
    titulo: 'Material de Apoio 07',
    descricao: 'Guias, passe, pemba, alguidar, defumação e outros elementos de trabalho.',
    categoria: 'Elementos de Trabalho',
    ordem: 7
  },
  {
    titulo: 'Material de Apoio 08',
    descricao: 'A importância das ervas na Umbanda, classificações e formas de utilização.',
    categoria: 'Ervas',
    ordem: 8
  },
  {
    titulo: 'Material de Apoio 09',
    descricao: 'Fundamento, axé e o sagrado na Umbanda.',
    categoria: 'Fundamento e Axé',
    ordem: 9
  }
]


const ESTUDOS_CONTEUDO_COMPLETO = {
  "1": "T.U. Caboclo Tupinamba Ile Axe Ode Leke\nPRINCÍPIOS RELIGIOSOS\n- O T.U. Caboclo Tupinamba Ile Axe Ode Leke não cobra por passes e orientações de destino feitas pelas\nEntidades, não faz amarração e não separa casais, não realiza trabalhos que visem o mal de\nqualquer ser vivo nem trabalhos que possam trazer a felicidade de alguém causando a infelicidade\nde outra(s) pessoa(s), bem como preserva a natureza e os sítios energéticos onde se manifestam\nos Orixás da Umbanda.\n- À prática da religião, na Umbanda, se faz através da manifestação de espíritos dispostos a\ntrabalhar para o bem e para a evolução individual e coletiva do ser humano e o Templo procura,\natravés da prática da Umbanda, dar aos seus associados, corpo mediúnico, consulentes,\nsimpatizantes e frequentadores em geral, a oportunidade para o crescimento pessoal,\nharmonização e aprimoramento espiritual.\n- Para o desenvolvimento mediúnico dos integrantes da corrente e para a propaganda da Doutrina\nde Umbanda, poderá o T.U. Caboclo Tupinamba Ile Axe Ode Leke promover a realização de cursos, aulas,\nconferências, encontros de líderes umbandistas, ações sociais, culturais e filosóficas, sendo de\ntema exclusivamente doutrinários e culturais, com abstenção de ataques e ofensas a quaisquer\noutras crenças religiosas ou outros Templos.\nPREPARAÇÃO DOS FILHOS DA CASA PARA AS GIRAS:\n1 - Semanalmente todos os Filhos da Casa poderão acender uma vela branca de 7 dias para o\nseu Anjo de Guarda, fazendo sempre uma oração. Os associados batizados: deverão acender\numa vela branca para o seu Anjo de Guarda no dia de gira entre as 06:00h e as 18:00h (exceto se\na vela de 7 dias destinada a esse fim já estiver acesa) pedindo proteção, fortalecimento e luz para\na participação nos trabalhos espirituais, bem como, proceder com o encruzamento de pemba no\nOrf e beber três goles de água da quartinha, conforme orientado no dia do batizado.\n2 - Existe a necessidade de preparação da matéria dos associados para a Gira, sendo assim, no\ndia dos trabalhos mediúnicos os filhos da casa não deverão ingerir nenhum tipo de bebida alcoólica,\ncomer carne vermelha e tampouco manter relações sexuais.\n3 — A alimentação neste dia deve ser preferencialmente leve, ingerindo frutas, verduras, legumes e\nproteínas tais como, carne branca (frango e peixes), ovos, queijos, soja, leite e iogurtes. O filho da\ncasa deve fazer uma breve refeição antes das Giras, afim de evitar quedas de pressão e náuseas\ndurante os trabalhos. Sugestão: lanches naturais, pão com manteiga/requeijão, frutas, vitamina,\niogurte e omelete.\n4 - No dia da Gira, os filhos da casa deverão fazer seu banho de axé antes de irem para o Templo\ncom as ervas correspondentes ao seu Orixá (pai ou mãe de cabeça) ou correspondentes ao seu\nguia que trabalhará no dia, ou qualquer outro banho orientado pelo Sacerdote ou entidade, sempre\nem número impar (1, 3, 5 ou 7 ervas). No caso de filhos que vão direto do trabalho para o T.U. Caboclo Tupinamba Ile Axe Ode Leke, os mesmos deverão fazer o banho e levar em pequena garrafa ou recipiente\npróprio, para borrifar na nuca e pulsos antes de se posicionar para a gira.\n44 - O banho de axé é feito após a higiene pessoal, jogando-se o produto da infusão das ervas\n(colocar a água para ferver, após a fervura adicionar as ervas e abafar) sobre os ombros (sempre\ndos ombros para baixo — *** da cabeça para baixo somente com autorização do sacerdote ou\nquando orientado por entidade), para fazer a limpeza do campo magnético.\n5 - Para as Giras de desenvolvimento o(a)s filhos deverão proceder da mesma forma.\nCALÇADOS - GARRAFA DE ÁGUA - UNIFORME\n1-A área de Gira do Terreiro (Congá ou Gongá) é solo consagrado, assim, deverá ser evitado o\nuso de calçados com os quais se veio da rua, por isso, os médiuns deverão preferencialmente\nestar descalços ou com meias. Casos excepcionais deverão ser autorizados pelo Sacerdote.\n2 - É obrigatório o uso de GARRAFA DE ÁGUA por todos os integrantes da corrente mediúnica.\nPoderá o integrante utilizar-se de garrafa que já possui, desde que não seja de vidro. Assim o T.U. Caboclo Tupinamba Ile Axe Ode Leke evita o desperdício de copos descartáveis, evita o chão molhado (propício\na acidentes) e evita a queda energética frequente, a qual ocorre ao entrar e sair do congá para\nbuscar água no bebedouro.\n3 - O vestuário usado nos trabalhos mediúnicos deverá ser exclusivamente para esse fim.\n\nÉ obrigatório o uso de CAMISETA DE UNIFORME pelos integrantes do T.U. Caboclo Tupinamba Ile Axe Ode Leke, pois facilita o controle de vestimenta, evitando exageros (transparências, decotes etc);\npossibilita a identificação de membros da corrente (nas giras e também em trabalhos externos,\ncomo mata, praia etc), economia financeira (evitando o uso de roupas particulares de cada um),\nigualdade (evita consumismo, status/ego), transmite organização e harmonia aos integrantes da\ncasa e para a consulência. — O integrante da corrente deve obter informação quanto ao fornecedor\ndas camisetas de uniforme.\nAquisição de calças e saias ficarão a critério de cada integrante da corrente quanto da escolha de\ntecido, modelo, fornecedor, vendedor etc, contudo, deverão ser respeitadas as orientações e\ndisposições sobre o Uniforme abaixo descritas:\n- Uniforme FEMININO: Giras de Direita: camiseta branca do Templo e saia longa branca (com\ncalça legging por baixo da saia). Casos excepcionais (ex: entidades masculinas que já tem o ponto\nconfirmado ou médiuns de atendimento), será permitido calça branca em oxford, sarja, algodão,\njeans, sacaria etc, não sendo permitido o uso de calças agarradas e/ou transparentes, tais\ncomo legging, cotton, calça \"bailarina\" etc. Giras de esquerda: Médiuns de atendimento ou\ndesenvolvimento com ponto confirmado poderão utilizar a vestimenta solicitada pela entidade\ndesde que, autorizada pelo sacerdote. Demais integrantes da corrente: Camiseta preta e saia\npreta (ou outra adequada para gira de esquerda, ex: vermelha, preta com vermelho etc).\n- Uniforme MASCULINO: Giras de Direita: camiseta branca personalizada com o logo do Templo\ne calça branca em oxford, sarja, algodão, jeans, sacaria etc, não sendo permitido o uso de calças\nagarradas e/ou transparentes, ou \"caindo\", de modo a aparecer a roupa Íntima. Giras de esquerda:\nMédiuns de atendimento ou desenvolvimento com ponto confirmado poderão utilizar a vestimenta\nsolicitada pela entidade desde que, autorizada pelo sacerdote. Demais integrantes da corrente:\nCamiseta preta do Templo e calça preta.\nSAUDAÇÕES NO TERREIRO\n1 - Na chegada ao T.U. Caboclo Tupinamba Ile Axe Ode Leke, deverão ser saudados nesta ordem:\nassentamento de Exú Orixá (Orixá do Movimento e da Comunicação. Saudação: Laroyê Exu) e a\nCasa das Almas (onde emana a vibração dos Pretos Velhos. Saudação para as Almas: Adorei as\nAlmas, Saravá as Almas Benditas e as Santas Almas);\n2 - Ao entrar no Congá, com os dedos indicador, médio e anelar da mão direita, deve-se bater três\nvezes no chão, pedindo licença e permissão para entrar no solo sagrado (licença à tríplice — o\ntriângulo - da Umbanda: Caboclo, Preto Velho e Criança, ou, pedindo licença — a cruz - por\nOlodumare, Oxalá e Ifá - a cruz, que na Igreja católica é sincretizada por “em nome do pai, do filho\ne do espírito santo”) em seguida bater o dedo entre as sobrancelhas (fronte), depois acima da\norelha (lóbulo parietal) e por último no final da cabeça, início da nuca (lóbulo occipital), com o\nobjetivo de harmonizar os planos material, mental e espiritual.\n3 - Saudar a Tronqueira de Exú Girante e de toda a banda da Esquerda — Entidades Chefes, (que\nfazem a guarda e a proteção do nosso Templo, das Giras e de todos os frequentadores durante os\ntrabalhos. Saudação: Laroyê Exu; Exu é Mojubá, Salve sua banda e salve suas forças).\n4 — Saudar e pedir a benção ao Sacerdote - Sacerdote responsável.\n5 — Saudar a Curimba (atabaques).\n6 — Saudar o altar (imagens de Orixás e Guias).\n7 - Saudar e cumprimentar os irmãos de Axé. “Iniciados deverão proceder a saudação de Iniciação\naos irmãos iniciados no culto.\n8 - Ao término dos trabalhos, as saudações serão feitas na seguinte ordem: Saudar o sacerdote,\natabaques, congá, tronqueira de Exú Girante, casa das almas e Exú orixá.\n9 - Sempre ao sair da área do congá, devemos estar de frente e olhando para o “altar”, no caso,\nde costas para a porteira/rua.\nFONTOS CANTADOS\n\nobrigação de todos os integrantes da corrente aprenderem a cantar os pontos utilizados no T.U. Caboclo Tupinamba Ile Axe Ode Leke, bem como, auxiliarem a Curimba a cantar os mesmos durante os\ntrabalhos, principalmente no início de Gira (Louvação aos orixás e chegada das entidades). Os\npontos são rezas cantadas!!!\n\n2",
  "2": "NR pg A\n\nDIA DA COR DE\n| semana | VELA |  SNCRETSMO | DATAFESTIVA |\nSaudação: Epá Babá Oxalá\nERVAS: Boldo, arnica da horta, alecrim, folhas e ramos de palmeiras, folhas de laranjeira, hortelã,\nerva cidreira, louro, algodão, rama de leite, manacá, malva branca, saião branco, rosa branca,\nmanjerona, macaça, erva doce.\n\nDIA DA COR DE\nTRA | GEE] omeneremo | omaresma |\n|XANGÔ| Quarta-feira | Marrom | **S.Jerônimo | gos |]\nSaudação: Kaô Kabecilê\nERVAS: Manjericão, vence demanda, betis cheiroso, levante, folha de fogo, fedegoso, pau pereira,\ncerejeira, figueira branca, amoreira, mulungu, ameixeira, mutamba, cipó mil homens, folhas de café,\npessegueira, folha de manga, limoeiro, umbaúba, urucum, para raio, noz moscada, nega mina,\nmalva cheirosa, jaqueira, erva tostão, erva de são João, cavalinha.\n\nDIA DA COR DE\nTE [EE] omemensmo | omaresma |\n[IANSÃ | Quartafeira | Laranja | Sta Bárbara | O4idez |\nSaudação: Eparrey Oyá\nERVAS: Erva santa, umbaúba, bredo sem espinho, folhas de bambu, folha de fogo, capeba,\nperientária, jaborandi, malmequer branco, dracena, dormideira, espada de santa bárbara, malva\nrosa, flores de tonalidade coral/laranja, calêndula, papoula, gerânio, erva de passarinho, erva\ntostão, nega mina, peregum com pontas amarelas, pinhão roxo.\n\nDIA DA COR DE À\nRa | GER] Comenemeno | ommaresma |\n[OGUM | Terçateira | Vermelho\nSaudação: Patakori Ogum / Ogum Yê\nERVAS: Espada de São Jorge, comigo ninguém pode, crista de galo, Cipó chumbo, Palmeira de\ndendezeiro (Mariwo), abre caminho, alfavaquinha, arnica, aroeira, capim limão, carqueja, dandá da\ncosta, erva tostão, jaboticabeira, losna, pau rosa, peregum, porangaba, são gonçalinho, jatobá.\n\nDIA DA COR DE\nTEA TA] ommmmo | omaresma |\n| OXUM | Sábado\nSaudação: Ora ie iê ô\nERVAS: Folha de vintém, folha da fortuna, lírios de toda espécie, malva, dracena, flores amarelas,\nquioco, rama de leite, malva rosa, narciso, margaridas, folha da costa, flor de maio, amor perfeito,\nmadressilva, oriri, melissa, macaça, colônia, ipê amarelo, erva de santa Maria, erva de santa luzia,\ncamomila, assa peixe.\n\nDIA DA\n[| sEMANA [CORDEVELA] SINCRETISMO | DATAFESTNA |\nOBALUAÉ | Segunda-feira\n\nSaudação: Atotô\nERVAS: Zpínia, vassoura preta, arruda, folhas de laranja lima, carobinha do campo, folhas de\nmilho, musgo, barba de velho, velame, sete sangrias, sabugueiro, manjerona, espinheira santa,\nassa peixe.\n\nDIA DA\no] 88% [omoewea] snorememo | pararem |\n[NANÁ | Sábado\nSaudação: Saluba Nanã\nERVAS: Alfavaca roxa, assa peixe, avenca, cana do brejo, Maria preta, manacá, capeba, cedrinho,\ncipreste, erva de passarinho, jarrinha, mutamba, quaresmeira, rama de leite, flores roxas e lilás.\nDIA DA\n| 58h [concevea] emerememo | pavaresma |\nIEMANJÁ | Sábado | Azul Claro\nSaudação: Odoyá/ Odocyabá\nERVAS: Jarrinha, Rama de leite, cana do brejo, algas marinhas, flores brancas de qualquer\nespécie, betis cheiroso, alfavaquinha, aguapé, camélia, jasmim, lagrima de nossa senhora, macaça,\nmalva branca, taioba branca.\nDIA DA\nO SEmana |CORDEVELA | SINORETISO | | DATAFESTNA |\nOXÓSSI | Quinta-feira | Verde\nSaudação: Okê Arô / Okê Odé\nERVAS: Alfavaca do campo, jureminha, caiçara, abre caminho, malva rosa, capeba, taioba,\nsabugueiro, jurema, capim limão, acácia, cipó caboclo, goiabeira, erva de passarinho, guaco, guiné,\nmalva do campo, são gonçalinho, cabelo de milho, eucalipto, samambaia.\nDIA DA )\nO | semaNA [CORDEVELA | SINCRETISMO | | DATAFESTNA |\nIBEJI Domingo Azul e Rosa Cosme e Damião\nSaudação: Oni Ibeji / Salve Ibejada / Salve São Cosme e São Damião\nMel, guaraná, Bolo de Aniversário, doces em geral (balas, gomas, jujubas etc)\nPRETO VELHO: Segunda-feira. Saudação: Adorei as Almas! Gostam de Bolos Caseiros — Ex:\nFubá/ Milho/Coco, doces de tacho: doce de mamão, abobora, doce de leite, goiabada, cocada e\nbanana. Apreciam Café e Chás. Data festiva: 13 de maio.\nBAIANOS: Terça-feira. Saudação: Salve o povo da Bahia/ Salve o N.Sr. Do Bonfim! — Gostam de\nacarajé, caruru, vatapá, coco, cocada, farofa apimentada.\nCABOCLOS: Quinta-feira. Saudação: Okê Caboclo! Gostam de peixes, frutas e milho. Data festiva:\n20 de janeiro.\nBOIADEIROS: Terça-feira. Saudação: Jetruá Seu Boiadeiro/ Xetruá — Gostam de carne seca\ndesfiada, caldo de mocotó, arroz carreteiro, feijão tropeiro e costela de boi.\nMARINHEIROS: Sábado. Saudação: Salve o povo da barcaça azul/ Salve o povo do mar! Gostam\nde peixes e frutos do mar. Data festiva: 13 de dezembro.\nCANGACEIROS: Quarta-feira. Saudação: Salve os Cangaceiros! Gostam de caju, graviola, cajá,\nbanana, rapadura, mandioca, carne seca com farofa, abóbora e peixe de rio doce.\nMALANDROS: Sexta-feira. Saudação: Salve a Malandragem! Gostam de “comida de boteco”\n(ovos de codorna, azeitonas, amendoim, calabresa acebolada, salame, queijos etc). Apreciam\ntambém carne seca, farofas e cocada mole.\nEXU/POMBOGIRA: Segunda-feira. Saudação: Laroyê! Exu é Mojubá! Gostam de fígado, lombo,\npimenta, moela, coração de galinha, lingua de boi, “menga” e “padé/Xoxô”. Também apreciam\nfrutas.\n| ERÉ: Domingo. Salve os Erês! Salves as Crianças! Gostam de Guaraná e doces,\nVELAS: Se não souber a vela que sua entidade utiliza, acenda vela branca, que é neutra e\n| universal.\nRA",
  "3": "Ne\n\nA UMBANDA E DEUS\nA Umbanda é uma religião monoteísta, ou seja, acredita na existência de UM DEUS SUPREMO,\ncriador de tudo e de todos. Dele, provém todas as formas e manifestações de vida.\nFoi Deus quem criou os Orixás, os espíritos e todos os planetas e astros existentes no universo.\nDeus pode ser chamado de diversos nomes, tais como, Zambi, Olorum, Olodumaré, Tupã, etc.\nTais denominações são influências das nações africanas que chegaram ao Brasil durante o\nperíodo da escravidão ou indígenas (denominação Tupã, por exemplo).\nMuitos umbandistas têm certa reserva para conversar sobre a figura de Deus. Talvez, com o\nintuito de se afastar de outras formas de culto, as palavras e diálogos giram mais em torno dos\nguias e Orixás. E quando por algum motivo citam o criador, é utilizado de forma mais comum, a\ndenominação “Olorum\" ou “Zambi”.\nNa Umbanda também não há representações materiais para Ele, pois está acima de tudo. Se\nestamos encarnados, se temos a mediunidade, se temos a oportunidade de evoluir, é por que Ele,\nDeus Supremo, em sua infinita bondade e misericórdia, permitiu.\nContudo, é importante compreender que a noção de Deus é importante em nossos ritos.\nSomos uma religião, isto é, aspiramos pela RA oeeão ao divino. Sem essa característica,\nperdemos uma peça essencial na compreensãc “de nossos fundamentos.\nOs Orixás são, antes de tudo, desdobramentos da vibração original de Deus. Expressam\natributos divinos, energias sagradas e elevadas que emanam nas forças da natureza. Quando, por\nexemplo, louvamos a Ogum, estamos cultuando a Deus no seu aspecto de ordenador cósmico,\nexecutor da lei, realizador de sua Vontade.\nDeus é ilimitado, incompreensível à nossa razão limitada. Em seu imenso amor, apresenta-se\nsob muitas formas e nomes, facilitando nosso entendimento. Ele permite que cada povo o\nencontre à sua maneira, de acordo com seus usos e costumes. Desse ponto de vista, as lendas\ndos Orixás são representações simbólicas das características, leis e modos de atuação de cada\nvibração divina.\nReside no núcleo de nossa essência uma centelha divina, a qual chamamos de Ori. Trata-se de\num pequenino “pedaço” de Deus que nos torna Um perante o Criador. O Orixá Ori, é aquele que\nprotege e guia nossa essência absoluta. Por meio dos ritos de iniciação, fortalecemos e liberamos\na expressão dessa força ancestral.\nPrecisamos naturalizar os diálogos e ensinamentos sobre Deus. Não é só para outras religiões e\nculturas. Nós umbandistas temos nossa própria maneira de se conectar a Ele. Parte\nimportante do desenvolvimento espiritual é especificamente criar uma boa relação com o divino,\nencontrar sua vibração dentro de vossa alma.\nNossa religião está intrinsicamente emaranhada ao sagrado, ainda que identificamos o divino nas\nfiguras, elementos e simbolos mais diversos, tais como no álcool, no fumo, nos doces, nas frutas,\nna água, no fogo e nas folhas que consagramos em nossos ritos. Encontramos e louvamos o\nreflexo de Deus que há entre os povos indígenas, escravos e seus descendentes, ciganos,\nnordestinos, camponeses, marinheiros, entre tantas outras culturas marginalizadas. Este é o\npropósito da Umbanda: refletir a luz divina.\nPERGUNTAS E RESPOSTAS FREQUENTES\n1) OS ORIXÁS SÃO DEUSES? O QUE SÃO OS ORIXÁS?\n\nA Umbanda é monoteísta, isto é, acredita em único Deus. Os Orixás são desdobramentos deste\nmesmo Deus.\n\nOrixás são as forças da natureza, representadas pela energia do Elemento que os mesmos\ncomandam. Quando cultuamos nossos Orixás na Umbanda, estamos conectando com as Forças\nElementares, vindas da água, da terra, do are do fogo...São essas Forças em equilíbrio, que\nproduzem a energia revitalizante que chamamos de Axé e que alimenta nosso Planeta e todos nós,\nseres viventes.\n\nTudo no mundo, incluindo cada Orixá, foi criado por Deus - Zambi ou Olorum, como chamamos na\nUmbanda, que significa “Deus Supremo”.\n\nZambi representa o centro gerador do Universo, é Ele quem nos governa. E a\nvibração Oxalá gera a energia para todos os outros Orixás.\n\nOxalá é uma vibração dos tempos pretéritos da Criação, representando a fé, o amor, a paz e as\nrelações entre o Céu e a Terra. Por isso foi feito o sincretismo de Oxalá com Jesus, que passou\npelo nosso Planeta Terra a anos atrás pregando o amor pelo mundo.\n\nPortanto, explicando brevemente e resumidamente, os Orixás são forças cósmicas, irradiações\ndivinas, cujas forças alcançam todo universo. Na Terra, expressam-se através das forças da\nnatureza conforme explicado acima. Pense em Deus como uma energia única, indiferenciada,\n\nilimitada, pura. Não possui forma. No entanto, à medida em que esta energia se manifesta, ela\nassume formas únicas e definidas. Assim, em Xangô, encontramos a Justiça divina e o equilíbrio;\nem Ogum, a Lei; em Oxum, o amor universal; em Exu, o movimento, em Oxóssi a criatividade e\nfartura... e assim por diante.\n\nAs histórias, símbolos, mitos e “personalidadeshmatribuldas a cada um destes Orixás são uma\nmaneira de entendermos estas forças. E pa\n\n2) QUAL A DIFERENÇA ENTRE O CULTO AOS ORIXÁS NAÇÃO NAGÔ (IORUBA)\nPRATICADO POR NOSSA CASA, A UMBANDA E O CANDOMBLÉ?\n\nNo Candomblé, o culto aos Orixás está no centro de suas atividades. É realizado iniciações, com\nelementos animais, vegetais, rezas milenares, com o objetivo de preparar o médium para o transe\nmediúnico, Não há uma incorporação de fora para dentro, mas uma manifestação da força\nancestral presente no Ori (coroa) do praticante. Os orixás não falam, não dão passes e não dão\nconsultas. A comunicação com eles é mediada exclusivamente pelo jogo de búzios.\n\nNa Umbanda, o culto aos Orixás não está no centro, uma vez que a Umbanda possui seu foco no\nculto aos ancestrais (guias e protetores). Não há uma incorporação dos Orixás, apenas uma\nirradiação de suas energias, seja de forma direta ou seja através de seus falangeiros. Na\nUmbanda, o foco é atendimento aos consulentes e a caridade por meio dos guias espirituais, e\nestes guias trabalhando na irradiação do Orixá, conversando, dando consultas e passes.\n\nNo entanto, como a Umbanda é muito diversa, a nossa casa entende a importância da\nmanutenção das tradições africanas e acredita ser imprescindível para o nosso bem-estar e para a\nnossa vida de maneira geral, o entendimento das energias que nos regem e o Culto aos Orixás,\numa vez que trata de conhecimento milenar, o qual possui algumas similaridades com o\nCandomblé e por isso causa algumas confusões.\n\nA nossa casa é de Umbanda que cultua orixás na sua raiz. NÃO é Umbandomblé, Candomblé etc.\n\nO Candomblé é uma religião afro-brasileira, ou seja, religião brasileira com tradições africanas.\nCandomblé iniciou-se com a união de várias formas africanas de se cultuar os Orixás, até que se\nestabeleceu um denominador comum.\n\nJá a nossa casa cultua os orixás exatamente como se cultua na África, nos termos de nossa\nnação (Nagô), na raiz e sem adaptações com outras nações africanas. Temos iniciações para\nimplantação do axé do orixá no orí (cabeça) de cada um de nós, é o renascimento com o Orixá, e\nutilizamos elementos animais, vegetais, rezas milenares, assim como no Candomblé, porém o\nritual é diferente, a reza é diferente, a manifestação do Orixá é diferente, pois no Candomblé\nexiste a “dança ensaiada\" para a manifestação do Orixá; em nossa casa, a manifestação do orixá\n\n|\nvibra de maneiras diversas, cada um sentindo de uma forma e se manifestando conforme a\nenergia se apresenta; o período do “retiro espiritual\" para iniciações e rituais também é outro.\nTemos oferendas como Ebó, também utilizamos o jogo de búzios como comunicação e orientação,\nmas a tradição e a forma que o culto é conduzido é diferente do Candomblé.\n3) O QUE SIGNIFICA SER FILHO DE UM ORIXÁ?\nComo vimos, os Orixás são vibrações divinas, energias que se manifestam na Terra através das\nforças da natureza. Todos os Orixás atuam em nosso interior. No entanto, somos mais próximos\nde uns do que outros. Isto porque cada pessoa possui seu programa de vida, um certo roteiro de\nexperiências para a encarnação atual, sua missão pessoal. E para bem cumprir esta missão, ele\nprecisa mais de uma energia do que outra.\nOrixá significa = “senhor da cabeça”. Por isto, quando alguém diz “sou filho de tal Orixá com tal\nOrixá”, ele está dizendo que estes Orixás regem sua coroa, que estes Orixás indicam o caminho e\na força que ele carrega.\n4) O QUE SIGNIFICA A EXPRESSÃO \"ORIXÁ DE FRENTE\" E \"ORIXÁ ADJUNTO\"?\nO Orixá de frente é aquele deve guiar o filho de Santo na sua encarnação atual. É com ele que\ndevemos aprender e se inspirar em seus movimentos. Ele, de alguma maneira, molda seu\ncomportamento e coloca situações em sua vida para exercitar a radiação da sua energia, é o\nensinamento construtivista, por exemplo, Orixá não vai dar a paciência, vai colocar situações para\nvocê ser paciente. Entretanto, cada um tem seu livre arbítrio e vale ressaltar que ser filho de tal\norixá jamais deve justificar suas condutas. Ex: É origuento porque é filho de tal orixá.\nMas, costumamos ver certas similaridades dos il “para com seu Orixá, portanto, quando vemos\naqueles textos descrevendo as características do filho de algum Orixá, é principalmente sobre o\nOrixá de frente que ele está falando. a\nO Orixá Adjunto vem trazer equilíbrio a esta relação. Sua influência é menos evidente, requer mais\nautoconhecimento para notá-lo, mas está lá. Forma junto com o Orixá de frente os pais e mães de\nCabeça do filho de santo.\n5) COMO SE DESCOBRE QUAIS SÃO OS SEUS ORIXÁS?\nEste é um assunto bastante controverso. Varia muito de casa para casa, de doutrina para\ndoutrina.\nEm nossa casa a descoberta é feita pelo Jogo de Búzios, porém pode ocorrer exceções, ou seja, o\nguia chefe da casa pode em alguma situação específica ou até mesmo atípica, informar os pais de\ncabeça de terminado filho de santo.\n6) QUÃO IMPORTANTE É DESCOBRIR QUAIS SÃO OS SEUS ORIXÁS?\nA descoberta dos seus Orixás auxilia na compreensão de algumas situações ancestrais que\neventualmente você possa viver. Explica questões de personalidade e situações do seu dia a dia.\nAmpara os nossos conflitos internos e externos.\nFacilita o direcionamento das suas orações, obrigações em mudanças de ciclos etc.\n7) O QUE FAZER QUANDO DESCOBRIR QUEM SÃO OS SEUS ORIXÁS? O QUE MUDA NA\nSUA VIDA?\nUma vez que lhe é revelado os Orixás de frente e adjunto, primeiramente, você poderá se\nentender melhor. Compreender a energia que carrega, as forças que te acompanham, os valores\nque deve buscar.\nOrixá não é para justificar defeitos; você deve, antes de tudo, honrá-los com sua conduta. Por\nexemplo, um filho de Ogum precisa mostrar-se forte, determinado, disciplinado. De Xangô, justo,\nprudente, sábio. De Yemanjá, amoroso, acolhedor, harmonizador, e assim por diante.\n\nVocê pode também se voltar mais suas energias, com preces, banhos, firmezas. Mas para isso,\ndeixe que seu Pai/Mãe de Santo te oriente na hora certa. Ao se aproximar de suas forças, você se\nfortalecerá espiritualmente.\n8) E PARA QUEM AINDA NÃO SABE QUEM SÃO SEUS PAIS DE CABEÇA, COMO\nPROCEDER?\nTodos os Orixás nos abençoam, independente de quem são nossos pais de cabeça. Suas\ninfluências são sempre positivas. E você pode pedir as bênçãos de qualquer um deles. Por este\nmotivo, não se preocupe caso ainda tenha a informação do Orixá de frente e adjunto. Não será\nprejudicado de nada. Dos Orixás, o maior deles é Oxalá. Em sua vibração, está contida a energia\nde todos outros Orixás. Assim, você sempre pode se dirigir a ele caso esteja em dúvida de qual\nOrixá buscar auxílio. Porém, em nossa casa, a regra para O desenvolvimento na corrente é\nsaber seu Orixá por meio do jogo de búzios.\nCOMPARATIVO: UMBANDA x CULTO TRADICIONAL IORUBÁ NAGÔ\nif\nUmbanda - Culto aos Orixás\nEnergia Vital - Sangue Energia Vital — Ejé\n[O liZmos | Milene |\n“6”\nEspiritualidade - Trab. Espiritualidade -\n7 linhas Alimentar Ori - Bori\nObter energia vital: Obter energia vital.\na\nAmaci Ebó 2\nNé Ase Sangoyemi\nErvas/ Flores Ervas/ Flores\n[O Emidades | Orixás |\nBatismo - abertura para | Correção de Destino —\n|\nespintuais\nCorrige situações Correção de rd '\noriundas de conduta e Conduta/Trata o Mal “ y )\nrelações (gerais) desta | ancestral/Karma, alinha y 41 //)\nvida (demanda, vícios, | relações com sociedade j ad |\netc). Ameniza a atuação | espiritual — de hoje até 4 -— “\nde energia ancestral — | 7 encamações passadas a =\nXoxô e Padê para a Iniciação Orixá o | E\nEsquerda a PEN é E -\nMediúnico de Orixá” no Ori do UN . Sé s\niniciado Q VV” NT =\nIncorporação de Manifestação de DA FB, =\nEntidades fragmentos da energia\ndo Orixá",
  "4": "+.\nT.U. Caboclo Tupinamba Ile Axe Ode Leke\ne\nANJO DA GUARDA\nPara nós umbandistas, o Anjo da Guarda é um espírito provido de muita luz e com grau de\nevolução muito elevado.\nSua missão é de fazer companhia constante a nós encarnados, de nos proteger e nos ajudar a\nprogredir. Alguns associam o anjo da guarda à nossa intuição, acreditando que é através dela que\neles se comunicam com nós.\nNos trabalhos espirituais, quando uma entidade se acopla ou quando a energia do Orixá se\nmanifesta na matéria do médium, o anjo da guarda sempre está ao lado, de vigia e prontidão,\nprotegendo o equilíbrio físico e espiritual do médium-contra os ataques de energias negativas (de\nbaixa vibração), para que não ingressem na corrente mediúnica do seu protegido. Ao\ndesincorporar, é comum o sutil estado de ram. parecendo estar “aéreo”, às vezes\n“ofegante” ou com leve “tontura”, nesse momento, Os irmãos de axé que estão lado, auxiliando\naquele médium, colocam a mão em seu coração dizendo repetidamente: “Fulano (nome da\npessoa), seu anjo da guarda te chama!”. Esse chamamento pelo nome e essa invocação do anjo\nda guarda do médium auxilia no processo de desincorporação, para que tudo ocorra de forma\nsegura e tranquila, pois o anjo da guarda estará ali, atuando de forma a equilibrar a energia do seu\nprotegido, uma vez que durante os trabalhos, este emprestou sua matéria para uma energia de\nfaixa vibratória muito superior à sua.\nImportante manter sempre uma VELA BRANCA acesa para o seu anjo da guarda, elevar os\npensamentos ao sagrado, agradecer por toda a proteção e pedir para que a chama daquela vela o\nresguarde de todas as energias negativas!\nDeixar um copo de água ao lado da vela (palito) e pedir ao anjo que coloque nela remédios e boas\nenergias é muito eficaz. Após queimar a vela, é só beber a água.\nVELA + COPO COM ÁGUA: além das propriedades magnéticas da água, a magia acontece\natravés da união dos elementos fogo e água. Quando combinamos estes dois elementos, qualquer\nritual se torna mais potente. O fogo evoca a presença da Luz divina, enquanto a água facilita o\nprocesso espiritual, funcionando como uma condutora energética. Ela vai ajudar a fixar em você e\nno ambiente a energia espiritual que foi gerada pelo ritual.\nUm copo de água com vela acesa pode ser firmado não somente para Anjo da Guarda, mas para\nqualquer outro ritual (para Orixá/Entidade etc), porém, tradicionalmente e mais comum é essa\nfirmeza ser feita para Anjo da Guarda.\nAssim que acender a vela para Anjo da Guarda, sempre faça uma prece.\nOração ao Anjo da Guarda —\n“ Santo Anjo do Senhor,\nMeu zeloso guardador,\nJá que a ti me confiou a piedade divina,\nSempre me rege, me guarda,\nMe governa e me ilumina.\nAmém!”\nREZAS E RITUALISTICAS IMPORTANTES:\na) PRECE DE CARITAS faro\nDeus nosso Pai,\nque Sois todo poder e bondade,\ndai força àqueles que passam pela provação,\ndai luz àqueles que procuram a verdade,\n\n+\ne ponde no coração do homem a compaixão e a caridade.\nDeus,\ndai ao viajante a estrela Guia,\nao aflito a consolação,\nao doente o repouso.\nPai,\ndai ao culpado o arrependimento,\nao espírito, a verdade,\nà criança o guia,\nao órfão, o pai.\nQue a vossa bondade se estenda sobre tudo que criaste.\nPiedade, Senhor, para aqueles que não Vos conhecem, e\nesperança para aqueles que sofrem.\nQue a Vossa bondade permita aos espíritos consoladores,\nderramarem por toda à parte a paz, a esperança e a fé.\nDeus,\num raio, uma faísca do Vosso divino amor pode'abrasar a Terra,\ndeixai-nos beber na fonte dessa bondade fecunda e infinita, e\ntodas as lagrimas secarão, d\ntodas as dores acalmar-se-ão.\nUm só coração, um só pensamento subirá até Vós,\ncomo um grito de reconhecimento e de amor.\nComo Moisés sobre a montanha,\nnós Vos esperamos com os braços abertos.\nOh! Bondade. Oh! Poder. Oh! Beleza. Oh! Perfeição.\nQueremos de alguma sorte merecer Vossa misericórdia.\nDeus,\nDai-nos a força para ajudar o progresso, afim de subirmos até Vós,\nDai-nos a caridade pura,\nDai-nos a fé e a razão,\nDai-nos a simplicidade que fará de nossas almas\nO espelho onde refletirá a Vossa Divina e Santa imagem.\nb) ABERTURA DA PORTEIRA - LICENÇA DE JESUS\nAbre a porta oh gente, que aí vem Jesus,\nEle vem cansado com peso da cruz\nVem de porta em porta,\nVem de rua em rua\nPra salvar as almas,\nSem culpar nenhuma\nQuando a lua aparece\nA mata inteira clareou\nA passarada estremece\nFoi a coral quem piou, piou piou\nFoi a coral quem piou\nSalve o povo da Umbanda\nChegou nosso rei da Umbanda\n\n.\nSaravá nosso pai Oxalá — 2x\nc) ENCERRAMENTO DA GIRA\nQuando o Atabaque soar\nFilhos de Umbanda choram — bis\nAdeus, adeus meu pai\n(entidade chefe do dia) já foi embora\nOxalá meu pai,\nTem pena de nós, tem dó\nSe as voltas do mundo é grande\nSeus poderes são maior\nSalve São Miguel\nSalve São Rafael\nSalve São Gabriel das\nQuem trabalha para Deus.não cansa\nNão cansa, não cansa! .\nE quem pesa nossas almas?\nÉ São Miguel\nQuem pesa nossos pecados?\nÉ São Miguel\nFecha nossa Gira São Miguel!\nPelas horas que é\nO homem da balança, quem trabalha não cansa!\nSalve Oxalá\nSalve Xangô\nSalve lansã\nSalve todos os Orixás da Umbanda!!!\nA sineta do céu bateu, Oxalá já diz que é hora — bis\nEu vou, eu vou, eu vou\nFicar com Deus e Nossa Senhora — bis\nou\nOlha o meu Congá - bis\nSaudei meu Senhor, Saudei meus Orixás!\nAo encerrar os meu trabalhos eu peço a benção\nAos Orixás e aos Guias desse lugar\nE a todos os filhos que vieram nessa aldeia\nQue leve a paz e a proteção desse lugar!\nRA",
  "5": "“T.U. Caboclo Tupinamba Ile Axe Ode Leke\ne\nCAMBONOS\nOs Cambonos são auxiliares das Entidades e dos Médiuns quando incorporados. São os fiscais do\nTerreiro e ajudam a garantir a segurança dos trabalhos. Devem conscientizar-se da importância do\nseu papel na sustentação da vibração da casa. São os “olhos” do médium que está incorporado.\nSem o Cambono, não existe possibilidade das Entidades atenderem e trabalharem.\nA função dos Cambonos, auxiliando as Entidades é de uma importância muito grande para o\ndesenvolvimento e aprendizado do médium, por isso, a orientação do Sacerdote é de que todos os\nnovos integrantes da corrente exerçam essa função ao adentrar-se ao T.U. Caboclo Tupinamba Ile Axe Ode Leke (salvo as exceções que deverão ser avaliadas pelo próprio Sacerdote).\nOs Cambonos deverão colaborar com o Médium e com a Entidade incorporada, preparando,\norganizando, servindo e guardando os materiais de uso da Entidade antes, durante e após os\ntrabalhos.\nProcedimentos:\nA- ANTES DO TRABALHO:\n- Conversar com o médium de atendimento para saber o nome da entidade que vai cambonar, o\nque essa entidade utiliza no trabalho, onde encontrar o material necessário. Procure saber como a\nentidade trabalha e como pode ajudar.\n- Deverão deixar todo o material de uso da Entidade separado previamente (tábua para riscar\nponto, pembas, velas, bebidas, coités, copos, taças, cigarros, acessórios, etc.).\nB- AO TÉRMINO DO TRABALHO: os Cambonos deverão apagar as velas do ponto caso as\nmesmas tenham sido firmadas naquela gira (não assoprar — molhar a ponta do dedo e apagar\napertando o pavio) e fazer o descarte no lixo.\nCom relação ao material utilizado (bebida, flores, frutas, etc), proceder da seguinte forma:\nCom a Entidade incorporada:\nPedir licença à Entidade e solicitar orientação com relação ao que fazer com as sobras de material\nutilizado; limpar a tábua/taco.\nSem a Entidade incorporada:\nJogar o resto da bebida no tanque ou pia, retirar os utensílios, lavá-los e guardar, descarregar no\nlixo o material restante e por fim limpar a tábua/taco.\nATENDIMENTO\nAssim que o consulente for direcionado para atendimento, o cambono deverá:\n1) Perguntar o nome do Consulente - memorizar ou anotar, pois caso seja necessário chamar\no anjo dessa pessoa, é pelo nome que o mesmo será invocado.\nExemplo: Sr. José, seu anjo da guarda te chama!\n2) Informar ao consulente o nome da entidade que vai atende-lo.\nExemplo: Sra. Maria, esse é o Caboclo Pedra Branca, o qual vai atende-la hoje.\n3) Anotar quando solicitado, as orientações da entidade.\nEm caso de dúvida, quanto: “o quê?”, “como?”, “quando?” “por quanto tempo?” e/ou “onde\nfazer?”, o procedimento indicado pela Entidade, referida dúvida deverá ser esclarecida\ndiretamente com a própria entidade, pois essa imprecisão não poderá ser explicada por\noutras entidades. O consulente não pode sair com dúvida! Desta forma, após a\nentidade passar o procedimento, é obrigação do Cambono confirmar com o guia tudo o\nque foi orientado, e sequencialmente, repassar para o consulente.\n\nAs prescrições e anotações feitas aos consulentes devem ser de forma legível, para evitar\nconfusões. Evitar escrever termos usados pelas entidades incorporadas, faça a tradução\npara que o consulente não tenha dúvida nenhuma sobre as recomendações recebidas.\n\n4) Ficar atrás do consulente quando houver incorporação ou o menor indício de que haja\nincorporação (balanços etc), para que o consulente seja amparado e não ocorra acidentes.\n5) Os Cambonos NÃO DEVERÃO DEIXAR DE OUVIR, mesmo que por solicitação do\nconsulente as consultas feitas às Entidades e as respostas dadas. Em caso de\ndeterminação da Entidade para se afastar durante uma consulta, avisar imediatamente ao\nCambono-Chefe e/ou o Pai-de-Santo ou a Entidade que nele estiver incorporada.\n6) Os Cambonos deverão prestar atenção às consultas para que não seja infringida\nnenhuma norma ou regulamento da casa, comunicando imediatamente qualquer\nirregularidade ao Cambono-Chefe e ao Pai-de-Santo. Exemplo: Orientações estranhas,\nentidade pedindo para passar o telefone do “cavalo” para o consulente, amarrações etc.\n7) Deve intermediar a conversa entre o guia e o consulente, fazendo as devidas\n“traduções” e facilitando o atendimento.\n8) Os Cambonos deverão estar atentos para agilizar as consultas, prestando atenção no\ntempo de duração (máximo de 15 minutos) e não permitindo que se estenda\ndesnecessariamente, evitando também que o consulente se repita nas explicações e\npedidos ou queira consultar por outras pessoas que não estão presentes.\nPrecisam ter o discernimento para entender a diferença entre — por exemplo - uma mãe\nque vai ao Terreiro consultar uma Entidade sobre um problema que na realidade é de seu\nfilho, daquela pessoa que após falar exaustivamente de seus problemas pessoais, ainda\nquer que a Entidade resolva ou responda as perguntas encomendadas pelo vizinho, pela\namiga ou pela comadre.\n9) Os Cambonos NÃO PODEM OPINAR NAS CONSULTAS, a não ser que sejam\nsolicitados, buscando prestar atenção para poder repetir os ensinamentos das Entidades\npara esclarecimento do consulente, ou para relatar qualquer situação constrangedora ou\nequivocada para o Cambono-Chefe e ao Pai-de-Santo.\nATENÇÃO\nDeverão manter sintonia espiritual e concentração durante as consultas e trabalhos realizados pela\nEntidade.\nTODA A ATENÇÃO DO CAMBONO DEVE SER PARA O ATENDIMENTO DA ENTIDADE COM O\nCONSULENTE, evitando distrações com atendimentos vizinhos ou com eventuais situações que\npossam ocorrer no Congá durante a Gira.\nDurante os trabalhos, os Cambonos não deverão manter conversas paralelas com os filhos da\ncorrente, tampouco com consulentes.\nSIGILO\nNão se admite outra postura que não seja de honestidade e SIGILO ABSOLUT + guardando como\n“segredo confessional” tudo o que for dito e ouvido durante a consulta.\nDeverá ser reportado informações de atendimento ao Sacerdote: quando ele perguntar, quando\nhouver descumprimento com as regras da casa, quando houver qualquer tipo de ameaça à casa,\naos filhos de axé ou quaisquer outras situações estranhas, atípicas ou que demonstrem perigo.\nALGUMAS NOMENCLATURAS COMUNS DAS ENTIDADES\n\nt\nCavalo/ Burro: Médium\nLua Grande: ano\nLua média: mês\nLua pequena: dia ou semana — depende do contexto da frase.\nPelota: Coração\nCasuá: Casa\nTrabuco: Trabalho\nCalçudo: Homem/ Marido / Companheiro\nSaiuda: Mulher/ Esposa / Companheira\nFlor Branca: Pipoca\nCalunga Grande: Mar\nCalunga Pequena: Cemitério\nToco: Charuto ou Banco/Cadeira - — depende do contexto da frase.\nRodante/ Roda-Roda: Carro/ Veiculo\nMarafo: Pinga\n| Mijo de Égua: Cerveja\n| DEMAIS CONSIDERAÇÕES\n- Ao locomover-se pelo ambiente do ritual, não furar nem costurar a corrente, evitando trombar com\nos médiuns.\n— Após a Entidade riscar o ponto (nesse momento a Entidade deverá estar servida com todos os\nseus itens de trabalho), o Cambono deverá tomar passe vibratório, afim de firmar a cabeça para o\ninício dos trabalhos, podendo dar “passagem” para sua Entidade, (não é momento de orientação\nde destino); sequencialmente, deverá informar o(a) Chefe de Congá, para chamar as consultas da\nassistência (Cambono não decide qual consulente passará com a entidade. * ver item abaixo).\n- Os Cambonos não deverão em hipótese alguma selecionar consultas, aproveitando da sua\nfunção para encaixar atendimento para parentes e amigos, portanto, deverão seguir rigorosamente\na ordem de chamada formada pelos responsáveis por organizar as consultas daquela Gira.\n-É obrigatório os Cambonos terem material de apoio (kit Cambono) composto de papel branco\ne/ou caderno, caneta e fósforo ou isqueiro.\n- Quando o Guia Espiritual estiver desincorporando, o cambono deverá dar o amparo necessário\nao médium.\n— No final dos trabalhos transmita os recados para o médium que auxilia (se for o caso) e entregue\no material de trabalho organizado.\n— É errado: Manter a tábua com o ponto riscado, esquecendo de proceder a limpeza e manter\nvelas acesas (exceto quando solicitado pelo sacerdote).\nNão cometer equívoco: Cruzeiro é a Cruz das Almas nos cemitérios, não confundir com\nencruzilhada, que é o cruzamento de duas ruas, que pode ser em “+” (indicada para entregas para\nExus) e em “T” indicada para entregas para Pombogiras.\nOrientação: Sempre que o consulente for orientado pela Entidade a acender velas, explicar\ncorretamente onde e como isto deverá ser feito, prezando sempre pela segurança.\n- São considerados Cambonos-Chefes, aqueles que forem cambonos das Entidades Chefes/\nSacerdote do templo.\n8",
  "6": "T.U. Caboclo Tupinamba Ile Axe Ode Leke\nO QUE É A UMBANDA?\nTodo Umbandista deve saber explicar o que é a Umbanda para os que não conhecem\nnossa religião. Ainda presenciamos muitas informações incorretas, mas também muitos\ndespertando o desejo de conhecê-la. O que não podemos mais aceitar é que o\npreconceito persista, impedindo tantos de receberem suas graças devido ao medo\nincutido em seus corações.\nAs palavras do Caboclo das Sete Encruzilhadas são muito precisas: “A UMBANDA É A\nMANIFESTAÇÃO DO ESPÍRITO PARA A CARIDADE\". Apesar de toda diversidade\ninterna que encontramos em nossa querida religião, este sempre será o nosso norte maior.\nTudo o que é realizado em seus ritos e cerimônias objetivam auxiliar o próximo, e quando\nse afasta deste fundamento fundamental sua essência fica descaracterizada.\nSuas principais atividades centralizam-se no exercício da mediunidade, no intercâmbio\nenergético com as forças da natureza e no aconselhamento espiritual. E entre as diversas\nformas de comunicação com a astral, a mais largamente utilizada é a mecânica de\nincorporação.\nPor meio dela, torna-se possível o contato mais próximo com os que já foram, nossos\namados guias espirituais. São aqueles que alçaram grande adiantamento moral e\nespiritual, domínio dos processos magísticos e profundo conhecimento do psiquismo\nhumano. Na Umbanda, os Santos não ficam pendurados na parede, mas manifestam-se\nem Terra para diretamente nos orientar.\nSendo a Umbanda uma religião como qualquer outra, o terreiro não é um local apenas\nfazermos pedidos, mas participa intimamente de nossa caminhada evolutiva. A partir do\nculto às forças da natureza, os divinos Orixás, e do aprendizado com elevados mentores\nespirituais, A GIRA DE UMBANDA PERMITE-NOS APROXIMARMOS DE DEUS.\nSua origem deu-se em solo brasileiro, mas recebeu influências diversas, principalmente\ndos povos bantus e iorubás, e seus descendentes. Por esta razão, consideramos uma\nreligião afrobrasileira. Além disso, encontramos em seus ritos e práticas elementos do\ncatolicismo, do espiritismo, do xamanismo, entre outros. Mas a Umbanda não é uma\nsimples mistura de tudo isso: ela é um culto distinto e com fundamento próprio.\nÉ uma religião rítmica e musicalizada. O poder do som, dos cantos e das percussões\nfazem-se presente do início ao fim da gira, fazendo vibrar o axé dos guias e Orixás em\ntodo o terreiro. Da mesma forma, o ritual está presente em suas cerimônias. Com O\nobjetivo de disciplinar consciências e canalizar energias específicas, ritos e procedimentos,\npróprios de cada terreiro, produzem as condições necessárias para o bom trabalho do\nencontro mediúnico.\nA UMBANDA É, TAMBÉM, TERAPIA E TRATAMENTO ESPIRITUAL. Assentando a\nharmonia e o equilíbrio, ela realiza uma profunda e positiva transformação interior\ndaqueles buscam suas bandas. Ali, os vícios de pensamento e comportamento, os\ndesequilíbrios emocionais, as atitudes derrotistas, o autopiedismo, entre outras\nenfermidades do espirito, podem ser todos curados.\n\n+\nSua ação não se limita aos encarnados, mas também se estende àqueles que já deixaram\neste plano. Suas falanges atuam no resgate e encaminhamento das almas perdidas e\nsofredoras. Os que hoje são obsessores, amanhã poderão ser trabalhadores da luz, pois\na ninguém ela vira as costas. A UMBANDA É UMA EXPRESSÃO DA MISERICÓRDIA\nDIVINA.\nNela, nossos ilustres ancestrais têm voz, dispostos a compartilhar conosco a sabedoria\ndos séculos. Os saberes da mata e da senzala, a experiência do campo e da cidade, da\njuventude e velhice, das encruzilhadas e das estradas, seja da terra ou do mar, são\npostos em movimento para o auxílio de nosso planeta.\nA Umbanda é muito mais do que aparenta e as letras não suficientes para descrever sua\ngrandeza. Apenas agradeçamos o Pai por este maravilhoso presente à toda humanidade.\nMas se te perguntarem o que é a Umbanda, relembremos do antigo jesuíta, hoje Caboclo\ndas Sete Encruzilhadas:\n“A UMBANDA É A MANIFESTAÇÃO DO ESPÍRITO PARA A CARIDADE. COM OS QUE\nSABEM MAIS, APRENDEREMOS. AOS QUE SABEM MENOS, ENSINAREMOS. MAS, À\nNINGUÉM VIRAREMOS AS COSTAS, POIS ESTA É A VONTADE DO PAP”.\nNestas palavras estão sintetizadas todo o seu fundamento.\nUmbanda é Paz, é amor, é caridade, é simplicidade!\nSalve a Umbanda!\nHINO DA UMBANDA:\nRefletiu a Luz Divina\nCom todo seu esplendor\nVem do reino de Oxalá\nOnde há paz e Amor\nLuz que refletiu na terra\nLuz que refletiu no mar\nLuz que veio de Aruanda\nPara tudo iluminar\nA Umbanda é paz e amor\nÉ um mundo cheio de Luz\nÉ força que nos dá vida\nE a Grandeza nos conduz\nAvante filho de fé\nComo a nossa lei não há\nLevando ao mundo inteiro\nA bandeira de Oxalá!\nRA\n\nE NASCE A UMBANDA: A HISTÓRIA DE ZÉLIO FERDINANDO DE MORAES\nO carioca de São Gonçalo, Zélio Ferdinando de Moraes, nasceu em 10 de abril de 1891.\nO menino que sonhou se alistar para a marinha, aos 17 anos começou a sofrer de\n“ataques”, apresentando uma postura idosa, falando coisas desconexas como se vivesse\nem outra época. Em outras vezes, assumia um comportamento semelhante a um felino e\ndemonstrava conhecer muito sobre a natureza.\nApós ser examinado durante vários dias pelo médico da tradicional família carioca (que\nera seu tio), foi constatado que a loucura do rapaz não se enquadrava em nenhum caso\nconhecido, e que aquilo deveria “ser possessão do demônio”. O médico recomendou que\no jovem fosse levado a um padre para que fosse realizado um exorcismo, o que não surtiu\nefeito algum, pois as manifestações continuavam ocorrendo. A família, cansada com as\ninúmeras tentativas realizadas para curar Zélio, resolveu aceitar a sugestão de um\nconhecido e levá-lo até a Federação Espírita de Niterói, já que as crises só podiam “ser\ncoisa de espiritismo”.\nO encontro do jovem com a Federação ocorreu no dia 15 de novembro de 1908. Ao entrar\nno local, Zélio foi tomado por uma “força mística” e, contrariando as normas que impediam\no afastamento da mesa de reunião, levantou-se dizendo que ali faltava uma flor. Retirou-\nse até o jardim e retornou pouco tempo depois com a flor que colocou no centro da mesa.\nApós realizar tal ato, vários dos presentes começaram a apresentar os mesmos sinais dos\n“ataques” sofridos por Zélio.\nObservando tais acontecimentos, um membro da Federação que era médium vidente,\nJosé Souza, questionou o espírito que via com o rapaz.\nSr. José —- Quem é você que ocupa o corpo desse jovem?\nRE»\nEspírito - Eu? Eu sou apenas um caboclo brasileiro.\nSr. José — Você se identifica como caboclo, mas vejo em você restos de vestes clericais.\nEspírito - O que você vê em mim são restos de uma existência anterior. Fui padre, meu\nnome era Gabriel Malagrida e, acusado de bruxaria, fui sacrificado na fogueira da\nInquisição por haver previsto o terremoto que destruiu Lisboa em 1755. Mas, em minha\núltima existência física, Deus concedeu-me o privilégio de nascer um caboclo brasileiro.\nSr. José — E qual seu nome?\nEspírito - Se é preciso que eu tenha um nome, digam que sou o Caboclo das Sete\nEncruzilhadas, pois para mim não existirão caminhos fechados. Venho trazer a Umbanda,\numa religião que harmonizará as famílias e que há de perdurar até o final dos séculos.\nA conversa entre o caboclo e os membros da Federação foi marcada por inúmeros\nquestionamentos, após responder pacientemente a todas, o espírito comunicou a função\nda Umbanda:\n— Haverá uma mesa posta a toda e qualquer entidade que queira ou precise se manifestar,\nindependente daquilo que haja sido em vida, todos serão ouvidos e nós aprenderemos\ncom aqueles espíritos que souberem mais e ensinaremos áqueles que souberem menos e\na nenhum viraremos as costas e nem diremos não, pois esta é a vontade do Pai.\n\nO diretor dos trabalhos achou aquilo um absurdo, convidando o caboclo e a todos que se\nmanifestaram junto com ele a se retirar, citando com grande aspereza o “atraso espiritual\"\nque estes serem tinham. O diálogo permaneceu acalorado até uma nova manifestação do\nCaboclo das Sete Encruzilhadas: “Porque repelem a presença desses espíritos, se nem\nsequer se dignam a ouvir suas mensagens. Será por causa de suas origens sociais e de\ncor?”\nE ao fim de seu discurso anunciou a mensagem trazida do astral:\n- Se julgam atrasados espíritos de pretos e índios, devo dizer que amanhã (16 de\nnovembro) estarei na casa de meu aparelho, às 20 horas, para dar início a um culto em\nque estes irmãos poderão dar suas mensagens e, assim, cumprir missão que o Plano\nEspiritual lhes confiou. Será uma religião que falará aos humildes, simbolizando a\nigualdade que deve existir entre todos os irmãos, encarnados e desencarnados.\nNo dia seguinte, na casa da família de Moraes, ao se aproximar da hora marcada, já havia\nvários membros reunidos, inclusive da Federação Espírita, para comprovar a veracidade\ndo que havia sido dito. Às 20 horas, manifestou-se o Caboclo das Sete Encruzilhadas.\nDeclarou naquele momento que se iniciava um novo culto, onde a prática da caridade, no\nsentido do amor fraterno seria a característica principal, e que para isso teria como base o\nEvangelho de Jesus.\nO caboclo estabeleceu as normas em que aconteceria o culto. As sessões, assim\nchamadas trabalhos espirituais ocorreriam de forma diária das 20h às 22h, os\nparticipantes estariam uniformizados de branco e o atendimento seria gratuito. Seriam\nutilizadas guias de contas coloridas representando a entidade que se manifesta.\nA casa fundada pelo caboclo recebeu o nome de Nossa Senhora da Piedade. A partir daí,\ncomeçou-se um trabalho incessante para esclarecer e difundir a religião. Em 1918,\nrecebeu-se a orientação do astral para que fossem fundadas sete tendas para a\npropagação da Umbanda.\nApós 55 anos de trabalho à frente da tenda Nossa Senhora da Piedade, Zélio entregou a\ndireção dos trabalhos as suas filhas que dirigem a tenda até hoje. Zélio faleceu aos 84\nanos em 3 de outubro de 1975.\n(No texto acima, foi utilizada a transcrição da conversa entre os membros da Fundação Espírita de\nNiterói e o Caboclo das Sete Encruzilhadas retirada do livro “Os decanos: os fundadores, mestres\ne pioneiros da Umbanda”, de Rubens Saraceni - 2003) Fonte:\nhttps://agcomunique.wordpress.com/2019/1 0/23/e-nasce-a-umbanda-a-historia-de-zelio-\nferdinando-de-moraes/\n8\nT.U. Caboclo Tupinamba Ile Axe Ode Leke\né Be Song",
  "7": "“T.U. Caboclo Tupinamba Ile Axe Ode Leke\n: a\n\nPOR QUE USAMOS O BRANCO NA UMBANDA?\n\nDentre os princípios da Umbanda, um dos elementos de grande significado e fundamento,\né o uso da vestimenta branca.\n\nQuando o espírito Caboclo das Sete Encruzilhadas, entidade anunciadora da religião, ao\nfixar as bases e diretrizes do segmento religioso, expôs, dentre outras coisas, que os\nmédiuns utilizariam roupas brancas, certamente o fez com fundamento.\n\nNo decorrer de toda a história da Humanidade, a cor branca aparece como um dos\nmaiores símbolos de unidade e fraternidade já utilizados. Por exemplo, nas guerras,\nquando os adversários, oprimidos pelo cansaço e perdas humanas, manifestavam sincera\nintenção de encerrarem o conflito, astiavam bandeira na cor branca.\n\nO que falar então do vestuário dos profissionais das diversas áreas de saúde. Médicos,\nenfermeiros, dentistas etc,, a maioria desses profissionais se utilizando de roupas brancas\npara suas atividades. Por quê? Porque a roupa branca transmite a sensação de assepsia\n(limpeza), calma, paz espiritual, equilíbrio e serenidade.\n\nCientificamente, conforme pesquisas de Isaac Newton, provou-se que a cor branca é a\njunção de todas as cores. Sendo assim, o branco é capaz de refletir todos os raios\nluminosos. Assim é a Umbanda: a junção de muitas influências em uma só crença, um só\nDeus em muitas linhas de trabalho, todas em busca da caridade e do amor, e\nprincipalmente, refletindo a luz divina!\n\nA cor branca foi adotada pela Umbanda, assim como em outras religiões e filosofias,\ncomo a representação da simplicidade, da paz, da sacralidade e humildade.\n\nA Umbanda, então, carregando como um de seus pilares a caridade, \"enxerga\" essa cor\ncomo ponto fundamental para representá-la. Sendo assim, vestir roupa branca dentro do\nterreiro transmite a essência da religião. Além de que, nos mostra que somos todos\niguais, sem diferenças sociais ou econômicas.\n\n** Não confundir o traje de “gira” de esquerda. No T.U. Caboclo Tupinamba Ile Axe Ode Leke é\nexceção utilizar o preto, vermelho, roxo ou, preto com verde ou preto com amarelo. A\nlinha de esquerda, qual seja, o trabalho com entidades no polo negativo, utiliza-se dessas\ncores para intensificar sua linha de trabalho e indicar seu campo de atuação, qual seja,\ncemitérios, encruzilhada, linha das almas e matas. É potencializador da energia vibratória\npara um determinado fim, principalmente para quebra de demandas, descarrego, quebra\nde magias e feitiços etc. Trata-se de facilitador e ferramenta para o trabalho dos guias\nespirituais, porém, não é regra. Muitas casas utilizam vestimentas na cor branca durante\ntrabalhos com esquerda.\n\nPOR QUE USAMOS GUIAS (FIOS DE CONTA)? 8.\nAs Guias utilizadas nas giras de Umbanda têm fundamento, não são colares, enfeites ou\nacessórios de vaidade do médium\n\nSão a proteção contra cargas negativas, servindo como para-raios na defesa do médium.\nServem para conexão com os orixás, é meio de ligação entre o médium e Espírito, é\ninstrumento de tratamento e material de trabalho das entidades para atrair e emitir\nenergias.\n\nA Guia de 7 Linhas (guia menor que a de Orixás) deve ser confeccionada pelo sacerdote,\né utilizada para fortalecimento do Orí (cabeça) e amparo de todos os orixás durante o\ntrabalho. As demais guias devem ser confeccionadas pelo próprio médium, pelo T.U. Caboclo Tupinamba Ile Axe Ode Leke ou por quem o sacerdote indicar, pois devem ser montadas com\ncarinho, em meio a tranquilidade e muito axé. Devem ser feitas com material natural,\ncomo contas de cristal, pedras, sementes, conchas, porcelanas etc; as contas e\nmiçangas NUNCA devem ser de plástico.\n\nEM NOSSA CASA, as guias de orixás ou de esquerda devem conter 126 cristais\nintercalados com miçangas e devem conter uma FIRMA para o fechamento do fio. Essa\nfirma é importante para a circulação das energias, serve para proporcionar equilíbrio no\nfluxo ativo, funciona como catalizador, ou seja, aumentando a velocidade das boas\nenergias e vibrações bem como, também tem função desmagnetizadora, não permitindo\na absorção de energia advinda de outras pessoas, encarnadas ou desencarnadas.\nExistem alguns tipos de Guias: de Trabalho da Entidade, Guias de Orixás ou Esquerda e\nGuias de Proteção. As guias de proteção (por exemplo, de anjo da guarda), não\nnecessitam de Firmas, pois são apenas guias retentoras de energia circulante, ou sejam,\narmazenam a energia da pessoa que a utiliza juntamente com a energia depositada pela\nentidade no momento em que a mesma foi “cruzada” ou “benzida”, por isso,\nfrequentemente devem ser descarregadas para a “troca da energia”. São guias para serem\nusadas no dia a dia. Já as guias de trabalho de entidade e de orixás/esquerda, devem ser\nutilizadas apenas dentro do terreiro.\n\nCOMO USAR A GUIA DE TRABALHO?\n\nA posição da firma deve ficar no ponto mais alto, ou seja, na nuca do médium, pois é\nonde se encontra o ponto de equilíbrio do mesmo e onde o fluxo energético é mais\nintenso.\n\nO cumprimento da guia de Orixá/Esquerda deve chegar na proximidade do umbigo, para\nque desta forma, a guia proteja o médium das energias nocivas. Todas as guias de\nOrixás/Esquerda devem ser usadas desta forma.\n\nPOSSO USAR A GUIA DE TRABALHO CRUZADA NOS OMBROS? RA\n\nO sacerdote e médiuns coroados (mesmo desincorporados)\n\npossuem a orientação e autorização da entidade chefe para usarem guias ou brajás de\ntrabalho da sua entidade cruzada nos ombros. O MÉDIUM QUE NÃO FOR COROADO E\nQUE ESTIVER DESINCORPORADO NÃO DEVE USAR A GUIA CRUZADA NOS\nOMBROS. A exceção é em trabalhos fechados, quando a própria entidade ou sacerdote\norientam que os médiuns que estejam auxiliando usem a guia cruzada. O médium\ncoroado em Caboclo e/ou Exú, TEM AUTORIZAÇÃO PARA USAR AS GUIAS/BRAJÁS\nCRUZADAS NOS OMBROS EM TODAS AS LINHAS QUE A CASA TRABALHA (ex:\nBoiadeiros, baianos etc).\nAS ENTIDADES nos médiuns incorporados (médiuns de atendimento ou\ndesenvolvimento que já possuem ponto riscado) PODERÃO UTILIZAR A GUIA DE\nTRABALHO CRUZADA NOS OMBROS, mesmo que o médium não seja coroado, pois\n\nnesse caso, quem as utiliza é a entidade. Todavia, ao desincorporar, o médium deve\nretirar a guia de trabalho ou descruzá-la dos ombros, voltando a posição padrão.\nAlgumas entidades usam a guia cruzada para a proteção da matéria do seu cavalo, tanto\nda energia exterior, quanto para que o médium consiga administrar a própria energia\nemanada pela entidade.\n\nFilhos que vieram de outras casas e de segmentos diferentes, COM AUTORIZAÇÃO DO\nSACERDOTE, podem utilizar suas guias/brajás da forma que aprenderam e foram\ninstruídos. Trata-se de respeito com a história e desenvolvimento do médium.\n\npodendo ser diferente em outros templos de Umbanda, pois cada um tem seu ponto de\nvista, tem seu desenvolvimento mediúnico e sua própria orientação espiritual. Não se\ntrata de certo e errado, mas sim, das regras de cada casa e que devemos respeitar.\n\nO QUE É “PASSE”?\n\nÉ um veículo utilizado pelas entidades para atender aos necessitados, é uma\ntransfusão de energia psicofísicas e de amor, onde o companheiro do bem cede de\n\nsi mesmo, em benefício de outrem.\n\nMario B. Tamassia assim o define: “transfusão de energias da natureza física,\nbiológica, psíquica e espiritual, de uma pessoa para a outra, fazendo-se isto,\ngeralmente, estendendo as mãos (...)\".\n\nSIMBOLOGIA DA PEMBA RA\n\nA Pemba é um giz de formato cônico-arredondada feito de calcário que pode ter\ndiferentes cores, usado ritualisticamente em religiões afro-brasileiras como o Candomblé,\na Umbanda e a Quimbanda.\n\nÉ um dos elementos mais utilizados, pois praticamente todo e qualquer ritual faz uso da\nmesma: usada nos pontos riscados, cruzamentos/encruzamentos (formação de escudo\nprotetor), imantações, descarrego, energizações, utilizada para condensar energias,\nconsagrar objetos, elemento base de alguns pós magisticos e etc.\n\nRitualisticamente, a Pemba é um dos elementos que ligam o mundo espiritual ao mundo\nmaterial, no qual os Guias de luz se utilizam para realizar os seus trabalhos e firmarem\nsuas energias dentro do terreiro ou onde necessitarem.\n\nTem o poder de abrir e fechar trabalhos de magia e de purificar, quando em forma de pó\né lançada ao ar no ambiente em que se utiliza para limpeza do espaço.\n\nEla é tão importante que fazemos referências na Umbanda como “Lei de Pemba” que é a\nLei Divina, “filho de pemba” que é filho de Deus.\n\n\"Ô salve a pemba...!\"\n\nAdaptação do Texto de (Dcasadafe manaus\n\nSIMBOLOGIA DO ALGUIDAR\n\nAlguidar ou Agdá é uma vasilha circular feita de barro (Argila), utilizado nos rituais das\nreligiões afro-brasileiras para fazer assentamentos \"igba orixá\", oferendas aos Orixás,\noferendas aos guias espirituais (caboclos, Exús etc.), firmeza para quartinha de anjo da\nguarda etc.\n\nTambém chamado pelo povo de santo de oberó, servindo como um pequeno ofertório,\npara o que vai ser entregue a entidade ou orixá em questão. Podendo conter flores, padê,\npedras, adornos, ervas, etc.\n\nO ALGUIDAR ou OBERÓ simboliza a terra. Antigamente as oferendas eram feitas, ou\nseja, arriadas diretamente na terra, com a evolução dos tempos veio o crescimento e\nevolução das cidades e construções, portanto, raramente temos uma área ou quintal de\nterra. A grande parte dos terrenos e quintais estão urbanizados com calçadas\nacimentadas, com isso usamos o alguidar como simbolo da terra, ou seja, a ligação da\noferenda com a terra.\n\nUtensílio muito utilizado na culinária baiana e a grande produção de alguidares está nas\nolarias do Recôncavo da Bahia e a sua comercialização ocorre principalmente nas feiras\ne nos mercados. Na cidade do Salvador, destaque para a feira de São Joaquim.\n\nNa região Nordeste, é comum ele ser utilizado como objeto de decoração.\n\nExiste o alguidar cru e o vitrificado (que é com verniz), portanto, uma dica: Quando você\nfor trabalhar com um alguidar sem verniz e tiver que colocar alguma bebida: Primeiro\nmolhe ele com bastante água para que ele possa absorve-lá assim quando for fazer seu\ntrabalho o barro não irá consumir o liquido que estiver dentro, durando assim muito mais\ntempo.\n\nTexto adaptado - Fonte: Espaço Oriosê - Papo de Terreiro via\n(Qcasaespiritualestreladasalmas\n\nIMPORTANTE: No T.U. Caboclo Tupinamba Ile Axe Ode Leke, o alguidar nº 00, devido ao tamanho\npequeno, também é utilizado como “batedor de cinzas”. O mesmo é de USO INDIVIDUAL\ndo médium, portanto, CADA MÉDIUM EM DESENVOLVIMENTO (que já tenha ponto\nriscado) E CADA MÉDIUM DE ATENDIMENTO DEVE PROVIDENCIAR O SEU.\n\nDICA: Para facilitar a limpeza: pode-se cobrir o alguidar com papel alumínio no início das\ngiras. Ao final dos trabalhos, basta retirar o papel contendo as cinzas/bitucas e jogar no\nlixo. Passar pano úmido no alguidar e o mesmo já estará pronto para ser utilizado\nnovamente.\n\nO QUE É COITÉ?\n\nÉ um recipiente, feito a partir da casca de côco, que algumas entidades utilizam para\ncomer e beber.\n\nPrincipalmente solicitado por Caboclos e Baianos, mas também pode ser requisitado por\noutras falanges.\n\nUSO DE BEBIDAS PELAS ENTIDADES (BEBIDAS - CURIADOR])\n\nAs entidades e guias da Umbanda utilizam-se dos elementos que compões a bebida para\n\nrealizarem seus trabalhos de limpeza e purificação, tanto do consulente, como de\n\nambientes.\n\nO álcool, em sua essência, é liquido extremamente volátil, que facilmente transcende do\n\nplano material para o etéreo, sendo, portanto, excelente auxiliar para a limpeza de\n\nenergias negativas impregnadas no perispírito (o que une o espírito ao corpo).\n\nCada linha de trabalho possui seu próprio \"curiador\", ou seja, a bebida correta paara cada\n\numa delas, não sendo obrigatóriamente bebida alcoólica.\n\nUSO DE FUMO PELAS ENTIDADES\n\nO fumo é a erva mais tradicional da terapêutica psico-espiritual praticada em nossa\n\nreligião. É utilizado como componente para defumação, onde conjuga o fogo e a fumaça\n\npara a destruição dos campos magnéticos negativos.\n\nAssim, o que as entidades da Umbanda fazem é utilizarem ervas, juntamente com os\n\nelementos água, fogo e ar para realizarem suas magias e defumações, desestruturando\n\nlarvas astrais, miasmas e desagregando energias negativas e danosas à aura do\n\nconsulente e ou do ambiente. Podemos dizer que é uma “defumação” específica da\n\nentidade.\n\nDEFUMAÇÃO\n\nAto de purificar o ser, o objeto e o ambiente, através da fumaça, expulsando o negativo,\n\natravés de aromas e ervas, de acordo com a necessidade da utilização.\n\nO aroma, desperta alguns centros nervosos das pessoas, fazendo-os vibrar de acordo\n\ncom as irradiações fluídicas das entidades,\n\nA defumação é essencial para qualquer trabalho num terreiro de Umbanda\n\nÉ também uma das coisas que mais chamam a atenção de quem vai pela primeira vez\n\nassistir a um trabalho.\n\nEm geral a defumação na Umbanda é sempre acompanhada de pontos cantados\n\nespecíficos para defumação.\n\nDesde os tempos imemoriais, dos homens das cavernas, que a queima de ervas e resinas\n\né atribuída à possibilidade da modificação ambiental, através da defumação.\n\nNa Umbanda, como em outras religiões, seitas e dogmas, também nos usamos desse\n\nexpediente, que tem a função principal limpar e equilibrar o ambiente de trabalho de |\n\nacordo com a necessidade.\n\nAo queimarmos as ervas, liberamos em alguns minutos de defumação todo o poder |\n\nenergético aglutinado em meses ou anos absorvido do solo da Terra, da energia dos raios\n\nde sol, da lua, do ar, além dos próprios elementos constitutivos das ervas. Deste modo,\n| projeta-se uma força capaz de desagregar miasmas astrais que dominam a maioria dos\n\nambientes humanos, produto da baixa qualidade de pensamentos e desejos, como raiva,\n\nvingança, inveja, orgulho, mágoa, etc.\n\n|\nExistem, para cada objetivo que se tem ao fazer-se uma defumação, diferentes tipos de\nervas, que associadas, permitem energizar e harmonizar pessoas e ambientes, pois ao\nqueimá-las, produzem reações agradáveis ou desagradáveis no mundo invisível. Há |\nvegetais cujas auras são agressivas, repulsivas, picantes ou corrosivas, que põem em |\nfuga alguns desencarnados de vibração inferior.\nExistem dois tipos de defumação -\nA defumação de descarrego e defumação lustral,\nDEFUMAÇÃO DE DESCARREGO\nServe para afastar seres do baixo astral, e dissipar larvas astrais que impregnam um\nambiente, tornando-o pesado e de difícil convivência para as pessoas que nele habitam.\n| Pois bem, a defumação tem o poder de desagregar estas cargas, através dos elementos\nque a compõe, pois interpenetra os campos astral, mental e a aura, tornando-os\n| novamente \"libertos\" de tal peso para produzirem seu funcionamento normal.\nDEFUMAÇÃO LUSTRAL\nAlém de afastar alguns resquícios que por ventura tenham ficado depois da defumação de\ndescarrego, ela atrai para estes ambientes, correntes positivas dos Orixás, Caboclos, e\nPretos Velhos, que se encarregarão de abrir seus caminhos.\nNão esqueça que a defumação lustral deverá ser feita depois da defumação de\ndescarrego.\nCOMIDA — AMALÁ 8.\nMuita gente pensa que a finalidade de um amalá é dar de comer aos espíritos. Erro\ngrosseiro porque o espírito de luz não tem nenhuma necessidade de comidas humanas,\npor não terem mais o corpo físico.\nO amalá é um ritual que se faz com elementos que vibram na sintonia dos espíritos, que\neles usam para criar um campo de força.\nO amalá reúne a força do médium, do Orixá e dos espíritos que vêm aceitar e se\ncomprometer a executar o trabalho ou auxiliar em determinada questão.\nA IMPORTÂNCIA DA ÁGUA NA UMBANDA\nAMPORIANCIA DA AGUA NA UMBANDA\nPela sua natureza e procedência (mar, rio, chuva e poços), a água contém energia\nprópria. Essa energia é fruto do contato com a natureza (areia, pedra e solo), que resulta\nna capacidade de absorver, acumular ou descarregar energias.\nNas mãos das entidades, é utilizada como remédio, como elemento repositor de energias,\npara descarregar, para purificar, imantar (magnetizar) algo ou alguém ou propriamente ser\nimantada para eventuais rituais e trabalhos.\nPÓLVORA (TUIA, FUNDANGA,| 8\nUtilizada para o deslocamento do éter (ar) para desintegração de campos de forças muito\ndensos de pessoas e ambientes.\n\nSAL GROSSO\nO sal grosso é assim chamado por não ter passado pelo processo de refino industrial, é\num composto químico nominado de cloreto de sódio (cloro e sódio).\nO cloro é formado por moléculas de grande poder germicida e bactericida e o sódio é um\nmetal invisível a olho nu, tem função de agir como condutor térmico e eliminador de\ncorpos nocivos à saúde. Assim sendo, os etéreos do sal grosso é que fazem a limpeza\nfluídica.\nO sal é um cristal que emite ondas eletromagnéticas comparáveis a ondas violetas. Isso\nocorre porque apresenta o mesmo comprimento de onda da cor violeta, sendo, portanto,\ncapaz de neutralizar as energias eletromagnéticas negativas.\nO que não fazer com o sal grosso? Jamais se deve molhar a cabeça com ele, pois nosso\nespírito não deve ser 'neutralizado'\nDiferente do que ocorre com banhar-se no mar, onde frequentemente “molhamos a\ncabeça”, pois nesse caso, trata-se de “ebó natural”, radiação de energia de mãe lemanjá,\nsendo esta sempre benéfica ao ser humano.\nCaso o Sal Grosso tenha sido utilizado em banho, na sequência deve-se utilizar banho de\nervas mornas, para equilibrar a aurea da pessoa, pois o sal grosso retira tanto as energias\nruins quanto as boas.\n\n*\n\n*\n\nx\n\n*\n\n\"\n\n8.\nT.U. Caboclo Tupinamba Ile Axe Ode Leke\ne\nHE Ase Sangoyemi",
  "8": "T.U. Caboclo Tupinamba Ile Axe Ode Leke\nMATERIAL DE APOIONCO8 RG temo\nA IMPORTÂNCIA DAS ERVAS NA UMBANDA\n“Sem a folha não tem sonho. Sem a folha não tem vida, Sem a folha não tem nada...”\n(Salve as Folhas — Maria Bethânia)\nAs ervas são detentoras de “sangue vegetal, energia vital e elemento que ajuda no\nreequilíbrio energético do corpo astral, que transforma o magnetismo da nossa aura e\nauxilia na recuperação da saúde mental e espiritual, promove equilíbrio e limpeza da\nnossa matéria e proporciona meios de auxiliar a conexão com o sagrado.\nUtilizamos as ervas, flores e plantas em quase todos os rituais e por ser um tema muito\nabrangente, vamos passar as informações básicas e introdutórias e citar brevemente\napenas alguns exemplos de utilização e seus respectivos benefícios:\nNa DEFUMAÇÃO - para dissipação de larvas ancestrais, limpeza de energias negativas,\nafastamento de seres do baixo astral, descarrega o corpo mediúnico e torna as pessoas\nreceptivas às energias positivas, proporciona leveza ao ambiente.\nNos BANHOS, LAVAGEM DE CABEÇA e/ou ESCALDA-PÉS - proporciona a troca\nenergética, limpeza de energias negativas, fortalecimento da energia dos guias/mentores\nespirituais e orixás, reequilíbrio do corpo e espírito, relaxamento, auxilia na circulação\nsanguínea, alívio de determinadas dores e inchaços do corpo, desobstrução dos chacras,\ndescarrego, fixação e assentamento de energias positivas.\n| Nos CHÁS - tratamento terapêutico em geral, acalma a mente e espírito, melhora o sono,\nproporciona bem-estar e relaxamento físico e mental, desintoxica o organismo etc.\nTambém é utilizada em rituais internos e específicos, tais como Amaci, Magias e\nOferendas em geral.\nNo T.U. Caboclo Tupinamba Ile Axe Ode Leke, as utilizações, quantidades e a forma de preparo são\nrecomendadas e orientadas por entidades ou pelo sacerdote.\nLembrando que para cada situação é utilizada uma ou mais ervas, plantas ou flores\ndiferentes; cada uma com suas propriedades específicas.\nCLASSIFICAÇÃO DAS ERVAS - Quanto a sua atuação.\n| A classificação não tem a ver com temperatura física da erva, mas sim, em relação a sua\natuação e de acordo com a sua vibração etérea.,\nRecomenda-se o uso de determinas ervas apenas a partir da necessidade identificada\npor uma entidade de confiança, incorporada num médium também de confiança.\nEntende-se médium de confiança porque o médium não se exclui da responsabilidade do\nuso de uma erva recomendada pelo seu guia. POR ISSO É IMPORTANTE O MÉDIUM\nBUSCAR O CONHECIMENTO, PARA QUE O BOM SENSO PREVALEÇA.\nSão classificadas como:\nQUENTES (também chamadas de agressivas): são fortes cuja atuação energética é\nagressiva. Tem alto poder de limpeza, todavia, seu uso excessivo pode causar buracos\nou rompimentos em nossa áurea e campo energético, por isso devem ser usadas com\nmoderação; *** Os principais cuidados para o uso ritualístico com ervas quentes ou\nagressivas são em relação aos banhos. - Nessa categoria se encontram várias ervas com\ngrau de toxidade que devem ser avaliadas caso a caso. Na dúvida, se a pessoa já for\n\nalérgica a outros elementos, alimentação, perfumes, etc. pegue uma parte bem pequena\n\nda erva e esfregue na pele do braço o suficiente para que este contato, em caso de\n\nalergia, desencadeie uma reação cutânea. Havendo alergia, não utilizar a erva.\n\nAlgumas ervas quentes:\n\n— Fumo\n\n— Bagaço de cana\n\n— Casca de Jurema Preta\n\n— Guiné\n\n— Arruda\n\n— Casca de Alho\n\n- Buchinha do Norte\n\n— Angico\n\n— Dandá\n\n— Beladona\n\n— Aroeira\n\n— Peregum RM\n\n— Pimenta\n\n— Losna\n\n— Alpiste\n\n— Cipó Cruz\n\n- Orégano\n\n- Mamona\n\n- Urucum\n\n— Cânfora\n\n— Folha de Chorão\n\n- Espada de S. Jorge\n\n- Espada de Sta Bárbara\n\n— Pinhão Roxo\n\nMORNAS (também chamadas de equilibradoras): equilibradoras de energia, atenuam\nefeitos negativos de ervas quentes. Ajudam a reconstruir a nossa energia, o nosso\ncampo magnético, nossa áurea, etc; * O triângulo das grandes ervas equilibradoras é\nformado por Sálvia, Alfazema e Alecrim.\n\nAlgumas ervas mornas:\n\n— Folha de Manga\n\n— Alecrim\n\n— Sávia\n\n— Alfazema\n\n— Cipó Caboclo\n— Calêndula\n— Macaca\n— Samambaia\n— Hortelã\n— Pitanga\n— Levante\n— Manjericão\n— Camomila\n— Tapete de Oxalá/Boldo\n— Erva Doce\n\n- Manjerona\n\n- Chá Verde\n\n- Abacateiro\n\nFRIAS (também chamadas de específicas): atuam especificamente em um determinado\ncampo magnético, exemplo: calmante, relaxante. Não são agressivas como as ervas\nquentes e seus benefícios vão além de equilibrantes como as ervas mornas.\n\nAlgumas ervas frias:\n\nErvas frias \"Atratoras”\n\n— Rosa Vermelha\n\n— Rosa Laranja\n\n— Artemísia\n\n— Malva\n\n— Amora\n\n— Maçã\n\n— Canelinha\n\nErvas frias “Energéticas”\n\n— Girassol\n\n— Emburana 8\n\n— Folha de Café\n\n— Guaraná “$”\n\n— Jurubeba\n\n— Nó de Cachorro\n\nErvas frias “Calmantes”\n\n— Capim Cidreira\n\n— Maracujá (folhas)\n\n— Melissa\n\n— Valeriana\n\n— Pêssego\n\n— Beterraba (folhas)\n\nSUGESTÃO DE USO DAS ERVAS:\n\nQuando combinadas, considerar as recomendações abaixo:\n\n1 Quente + 1 Morna + 1 Fria - OK\n\n1 Quente + 2 Mornas — OK\n\n2 Quentes + 1 Morna — OK\n\n3 Quentes “CUIDADO — Somente sob recomendação de entidades ou sacerdote.\nOutras quantidades (5, 7 ervas ou mais - Somente sob recomendação de entidades ou\nsacerdote)\n\nERVAS - SECA OU FRESCA?\n\nUma dúvida comum entre os umbandistas no momento de desenvolver o trabalho com\nervas é sobre a qual a melhor forma de usa-la: SECA ou FRESCA.\n\nDe início já esclareceremos que tanto as ervas secas como as frescas, possuem o\nmesmo valor dentro do trabalho, o que as diferem são as especificidades que irão ser\nmanuseadas de acordo com qual trabalho você pretende realizar. Por exemplo, na\ndefumação usamos sempre as ervas secas, pois as ervas frescas vão carregar muita\nágua em sua composição e não é interessante colocar água sob o fogo (a brasa do\nturíbulo), sendo assim, a melhor erva a se usar é a seca.\nOutro exemplo simples e comum, é quando a entidade especifica a forma que a erva deve\nestar para a realização do ritual, ex: um chá de boldo com ervas frescas. Se essa\nindicação veio da entidade, então nesse caso você pode seguir o que foi descrito, porém,\nse restar alguma dúvida sobre isso é melhor procurar mais informações e agir sempre\ncom bom senso.\n“O Erveiro me ensinou que enquanto colhemos a erva temos que rezá-la”\nSim, se alguém passou esse conhecimento para você, está correto. Por isso no caso das\nervas secas, que não sabemos quem as colheu e nem como estava sua energia ou seu\nhumor nesse momento, teremos que acordá-la.\n“Acordar uma erva seca requer fé. É necessário acreditar que o elemento está vivo, ativo,\nvibrante e naquele momento está apenas em estado de dormência. ” - Adriano Camargo,\nO Erveiro da Jurema.\nAs ervas secas passam por um processo de transformação e nesse processo é retirado o\nseu elemento aquático. Ofato dela passar por esse processo já faz dela uma erva\ntransformadora e que possui em si o aspecto de transformar extremamente evidente.\nSua energia é muito concentrada e requer a quem for utiliza-la, muita fé para “despertar”\nna planta suas propriedades. Entendemos então que quando rezamos para erva e para a\nsua ativação, aumentamos e acionamos nela o seu poder curador, pois mesmo uma erva\nseca possui em si o espírito vegetal que continua animando-a.\nResumindo: para utilizar a erva seca, precisamos primeiramente rezar para ativá-la. 8\nSugestão de REZA PARA ACORDAR A ERVA:\nAmado Pai Criador de tudo e de todos nós, Amada Mãe Terra, força viva e geradora de\ntudo o que conhecemos e também do que desconhecemos. Sagradas forças vegetais,\npeço que tornem novamente essa erva força viva e ativa, capaz de responder aos meus\nestímulos e solicitações de cura e amparo energético e façam cada vez mais de mim,\ninstrumento de vossa vontade maior. Assim seja e assim será.\nE as ervas frescas? Como devo usar?\nNesse caso vale a máxima ao qual estamos acostumados no terreiro: fé, bom senso e\namor.\nO ritual começa quando você vai apanhar a planta da terra, nesse momento você já deve\nestar com mente e coração tranquilos, para que as energias emanadas sejam sempre as\nmelhores possíveis. Pedindo sempre licença à Deus e aos orixás para a realização da\ncolheita.\n\nA fé e o magnetismo que você deposita no momento de colher esses elementos vão\n\ninfluenciar fortemente no resultado do trabalho, por isso nunca realize esse processo com\n\npressa ou “com a cabeça em outro lugar”.\n\nQual a melhor erva para se trabalhar? A seca ou a fresca?\n\nA resposta é: “A QUE ESTIVER À SUA MÃO” RE”\n\nA que for mais fácil para você, exceto é claro, se for algo muito específico. Por exemplo, a\n\npessoa passou por uma consulta espiritual e foi pedido para fazer algo especificamente\n\ncom ervas frescas ou secas, conforme o exemplo com o Boldo, citado acima.\n\nCONSAGRAÇÃO DAS ERVAS - “ENCANTE A ERVA”\n\nToda erva deve ser consagrada quando for utilizada; essa consagração é muito simples:\n\nMacere as ervas secas/frescas com as mãos pedindo para que Deus Pai Nosso Criador,\n| as Forças da Natureza Vegetal, (e as forças que você quiser evocar e convidar para\n\nconsagrar esse preparo), irradiem nessa mistura tornando-a viva e ativa para o fim a que\n\nse destina.\n\nEssa consagração pode (e deve) ser feita para banhos, defumações, chás, etc.\n\n*** é importante para quem vai manipular as ervas ou ativá-las (quando secas), ou outro\n| elemento que exija uma reza evocatória, que a reza possa ser modificada de acordo com\n\nseu coração. Isso mesmo, a ordem das palavras não altera o conteúdo, ou seja, se você\n\npreferir evocar de outra forma, não há problema, desde que se preste atenção na força,\n\nou divindade evocada e no verbo atuante na própria prece.\n\nNão adianta adquirir a erva, preparar o banho etc se você \"NÃO DESPERTAR O PODER\n\nQUE A ERVA TEM\". É preciso consagrá-la, encantá-la.\n\nA folha é folha independente de religião ou do Orixá. Ela por si só já carrega seus\n\nencantos, mas para que esses poderes atuem em nosso corpo astral devemos ATIVÁ-\n\nLOS - E como fazemos isso?\n\nAtravés de reza, consagração e conjuros.\n\nEm resumo o que esses três têm em comum é a utilização do poder do verbo.\n\nAlguns VERBOS DE ATIVAÇÃO - ERVAS DE LIMPEZA - PROTEÇÃO: limpar,\n\ndesintegrar, descarregar, dissolver, purificar, proteger etc.\n\nAlguns VERBOS DE ATIVAÇÃO - ERVAS EQUILIBRIO - ENERGIZAÇÃO: equilibrar,\n\nmanter, fluir, restaurar e energizar; etc.\n\nEntão, a partir de agora antes de utilizar a erva, use os verbos de ativação para que ela\n\npossa atuar de maneira mágica no seu espírito.\n\nIMPORTANTE: APESAR DO AXÉ DE TODAS AS FOLHAS PERTENCER A OSSAIM\n\nTODOS OS ORIXÁS POSSUEM SUAS PRÓPRIAS FOLHAS - DESTA FORMA, O\n\nMEDIUM DEVE SEMPRE PERMANECER EM CONSTANTE ESTUDO, AFIM DE TER\n\nCONHECIMENTO DAS PROPRIEDADES TERAPÉUTICAS DE CADA ERVA E PARA\n\nQUAL ORIXÁ AQUELA ERVA SERÁ CONSAGRADA.",
  "9": "7 fe\na T.U. Caboclo Tupinamba Ile Axe Ode Leke\n\nFUNDAMENTO - “ A Umbanda tem fundamento, é preciso preparar (...)”\nA Umbanda é a religião que tem como um dos fundamentos a não existência de\npreconceitos, além da ajuda mútua. É composta por diversas misturas de crenças vindas\nde outras religiões. A Umbanda é uma religião 100% brasileira, com influências da cultura\nafricana, indígena tupiniquim, orientais, católicos, kardecistas e misticismo, um verdadeiro\nacolhimento de culturas.\nO principal fundamento da Umbanda é a caridade, ou seja, fazer o bem sem ver a quem.\nOutros mandamentos são: humildade, fraternidade, amor ao próximo e o\ndesenvolvimento espiritual e pessoal\n\n| Compreendendo que o fundamento é o conjunto de regras e ideais, que é o alicerce de\nnossa fé, é o embasamento da nossa religião, segue a seguir outros fundamentos\nteológicos da Umbanda:\n* Acredita-se em um Deus único, supremo e fundador de todas as coisas.\n* Os orixás são manifestações de Deus nas coisas e na natureza e comandam a sete\nlinhas de vibrações, ou seja, Deus está presente em tudo.\n* Acredita-se em vida após a morte, onde o espírito desencarnado poderá progredir para\nsua evolução e até ajudar os que precisam em vida.\n* Há possibilidade de comunicação com os espíritos através da mediunidade.\n* A mediunidade é um presente especial que Deus confia para um humano comunicar-se\ncom outros mundos e vibrações através do seu corpo.\n* Existe uma lei de causa e efeito, tudo o que se deseja, se tem de volta.\n* A caridade é a lei suprema. Através de atendimentos os guias espirituais ajudam as\npessoas que socorrem a Umbanda.\n* À única força que cura e possibilita milagre é a fé de cada indivíduo.\n* Não existe sorte ou coincidência, tudo ocorre por uma razão, para um aprendizado e\nexperiência.\n* O universo é composto de energias e um equilíbrio entre negativo e positivo, assim\ntambém é composta a Umbanda, sendo o positivo as forças acolhedoras, é o negativo as\nforças guardiás e protetoras.\nTudo é energia e a Umbanda sabe muito bem como manipulá-la. Para que a-gira ocorra,\né preciso se preparar para ela, tanto espiritual quanto materialmente: O fundamento é a\nciência que nos orienta como proceder, a fim de que o axé seja abundante-e circule\nlivremente no terreiro.\n\n| ; :\n\n| O fundamento apoia-se nos assentamentos, nas firmezas, nos pontos cantados e\nriscados, na formação da corrente, na preparação e desenvolvimento dos médiuns, na\nmissão e preparação do sacerdote, nas folhas, nas rezas, entre outros elementos e ritos.\nO que define o que será utilizado, por qual razão e como será utilizado é o fundamento.\n\n2\nNeste sentido, o fundamento é conjunto de saberes que foram nos deixados pelos\nnossos ancestrais e pela espiritualidade. Com a dedicação, a experiência e o\ndesenvolvimento do sacerdote, nenhum elemento será esquecido ou manipulado de\nforma equivocada. É ESTE CONHECIMENTO QUE NOS ASSEGURA QUE A CASA\nESTÁ BEM PROTEGIDA E APTA A LIDAR COM AS DIFERENTES FORMAS DE\nENERGIA.\nMuitas vezes escutamos as pessoas comentarem que um terreiro teve dificuldades de\nconter energias densas impregnadas na matéria de seus integrantes, por exemplo; “o\nterreiro caiu em carrego! *. E porque isso ocorre? Pela falta de conhecimento do dirigente\ne dos médiuns quanto aos fundamentos, não havendo o suporte para a sustentação da\nenergia, falta de conhecimento das firmezas espirituais e da própria falange de trabalho.\nPor isso, ao procurar um templo para frequentar, é preciso conhecer a sua forma de\ntrabalho. Saber se realmente a casa “tem firmeza”. É preciso confiar seu\ndesenvolvimento a um sacerdote preparado e que realmente tenha missão espiritual de\nconduzir um terreiro.\nA Umbanda é uma religião que apresenta uma enorme diversidade e também possui\nvariados fundamentos. Todo terreiro possui sua doutrina, sua tradição e suas raízes e\nisto indicará para ele quais são os elementos necessários para o bom funcionamento da\ngira. E por esta razão que observamos, entre as diferentes regiões do Brasil, grande\ndivergência entre suas práticas. Isto porque cada Pai ou Mãe de Santo aprendeu com\nseus mais velhos e com os seus guias o que consideram essencial ou dispensável dentro\ndo terreiro. São conhecimentos diferentes, fundamentos diversos, formas peculiares de\nutilizar as vibrações do astral.\nEnsinam as tradições religiosas que existesuma energia que permeia todo o universo, a\ngual é conhecida por muitos nomes: prana, fluído cósmico universal, mana, éter, ki, força\nuniversal, e, no nosso caso, axé, ESTA VIBRAÇÃO É PRODUZIDA, CANALIZADA E\nDIFERENCIADA POR MEIO DOS FUNDAMENTOS DO TERREIRO. Por isso escuta-se:\n“Esse terreiro tem axé”. “A energia daqui é diferente da energia de lá” etc. Trata-se de\nfundamentos.\nQuando, por exemplo, é realizada uma firmeza para o Orixá Oxóssi, utilizando-se de\nvelas, ervas, bebidas, frutas ou flores, ofertado num local da natureza compatível, em um\ndeterminado dia da natureza, seguido de rezas e cânticos adequados, é um\nconhecimento, um fundamento que orienta todas estas práticas. Este pequeno rito\npermite movimentar uma parcela do fluído universal, manifestado através da vibração do\nOrixá Oxóssi, e direcionar esta mesma energia para um objetivo previamente\nestabelecido.\nEntretanto, não é somente com energias e vibrações que a Umbanda lida, e sim com\ntoda sorte de espíritos, desde os mais necessitados de luz quanto os mais adiantados\nguias espirituais. O fundamento, mais uma vez, vem dar-nos as bases para bem se\nrelacionar com eles.\nHá, além disso, os segredos, fundamentos que não podem ser ensinados a qualquer\npessoa, sem que este mostre-se maduro e compromissado com o axé. À medida que\nvocê avança na senda da espiritualidade, cresce a sua compreensão do mundo espiritual,\nassim como a confiança do astral em você para passar certos conhecimentos. Por esta\nrazão, POR MAIS QUE A CADA DIA SURJAM NOVOS CURSOS PARA FORMAÇÃO DE\nMEDIUNS E SACERDOTES, NADA SUBSTITUI A VIVÊNCIA PESSOAL NO TERREIRO.\n\n2\nO respeito e conhecimento ao fundamento é necessário, A Umbanda, mais do que\napenas doutrinar e aconselhar, lida e combate as mais densas energias que habitam o\nbaixo astral. E para isso, é preciso estar preparado.\nO QUE É AXÉ?\n“O termo \"axé\" (de àse, termo iorubá que significa \"energia\", \"poder\", \"força\") pode se\nreferir tanto aos assentamentos de orixás quanto à força mágica que sustenta os terreiros”.\nFonte: Wikipédia.\nEntendendo-se que há uma energia que permeia todo o universo, em nossa religião a\nchamamos de “Axé”. É por meio dessa energia, dessa vibração primordial que o terreiro\nrealiza suas graças: curas, descarregos, desobsessões, aberturas de caminhos, entre\ntantas outras bênçãos.\nA Umbanda, apoiando-se no seu saber ancestral, seu fundamento, organiza-se material e\nespiritualmente para que o axé possa ser produzido, canalizado e distribuido por todo o\nseu espaço físico. Este é um dos motivos pela qual o terreiro possui suas firmezas,\nassentamentos, trongueira, congá e outros.\nO axé se expressa na vibração dos Orixás. Isto é, uma força que a princípio é universal e\nindiferenciada, manifesta-se, no plano das vibrações, de uma forma específica e\ndeterminada. Dessa maneira, somos agraciados por uma energia que abre os caminhos,\noutra que promove a harmonia, uma que cura e assim por diante.\nO médium umbandista é um receptor do axé em suas diferentes expressões, sendo capaz\nde transmitir, durante o transe mediúnico, sob direção do guia incorporado, as salutares\n(medicinais) energias de acordo com a necessidade de cada um. Isto é uma das\ncaracterísticas que distinguem o mediunato (missão mediúnica) de terreiro das\nmodalidades presentes em outros cultos espirituais. Seu aparelho mediúnico foi\npreparado para suportar as diversas cargas e vibrações.\nNa natureza, o axé está presente em abundância e a sua ação sobre nossos corpos é\nessencial e benéfica. Por esta razão, a visita aos sítios naturais, como os rios, mares,\nmatas, cachoeiras, age como um maravilhoso revigorante de nossas forças vitais. Não\nsomente isso: esses locais sagrados facilitam nossa conexão com as vibrações\nsuperiores.\nEsta é a razão porque alguns elementos são escolhidos para compor firmezas,\nobrigações e oferendas. As folhas, as flores, os frutos, entre outros materiais de rito,\ncarregam/liberam energias específicas que se afinizam com o axé dos Orixás e\nrespectivamente dos guias espirituais, os quais sempre trabalham na radiação de um ou\nmais orixás. Após serem bem manipuladas pelos espíritos capacitados, são redistribuídas\nnovamente em nosso benefício.\nO axé é saúde, é vida, é vitalidade. Onde ele se encontra, o sagrado se manifesta. É uma\nemanação pura do próprio Deus, o sopro da vida, o princípio divino em essência, pela\nqual todo o Universo foi criado. E na Umbanda, nós louvamos e reverenciamos esta força.\nQuando esta energia elevada é posta em movimento, as coisas boas fluem para nós em\ntodas as direções.\n\n+\nO QUE É O SAGRADO? RA\n\nO sagrado é tudo aquilo que é relativo ou inerente a Deus, a uma divindade, à religião, ao\nculto ou aos ritos.\nNa Umbanda, o sagrado se faz presente. Todas as suas atividades, ritos, elementos,\ncerimônias e equipamentos são revestidos de um caráter especial que nos coloca em\nposição de reverência. O terreiro não é um simples espaço físico, mas um local\ndistintamente preparado para nos conectarmos com os planos superiores.\nO sagrado é o que se opõe ao profano, ao banal. Ele se destaca em meio a todo nosso\ncotidiano preenchido de individualidades e interesses. É aquilo que se afasta do mundo\nfísico e das preocupações materiais e nos sinaliza o que há de eterno na criação.\nEle exige reverência. Não pode ser tocado nem manuseado de qualquer maneira. Por\nesta razão, existem alguns procedimentos e regras específicas para entrar no terreiro,\npara mexer nas imagens, manusear igbas e assentamentos, firmar tronqueira e casa das\nalmas, saudar a tronqueira, saudar atabaques, entre outros. Eles são sagrados.\nEste respeito ao sagrado e este conjunto de regras e procedimentos formam disposições\n\n| mentais em nossas consciências que auxiliam a energizar e manter as vibrações já fixas\nnaquilo que consideramos sagrado. Quando ali estamos, nosso comportamento já é\ndiferente, o que disciplina, ou deveria disciplinar, os pensamentos e sentimentos\nproduzidos no local.\nO sagrado age no coração. A sua simples proximidade transforma as vibrações de nossa\nalma. Aquele que já se ajoelhou diante do congá sabe do que estamos falando. Aquele já\nse emocionou diante de um guia ou ao cantar um ponto, sabe do que estamos falando.\nNão importa como tenha sido nosso dia ou as dificuldades enfrentadas no momento, pois\nquando estamos diante de um espaço dedicado a Deus tudo de negativo fica para trás. E\n\n| nossa fé e esperança de dias melhores renova-se.\nMuitas vezes, em nosso dia-a-dia é preciso treinar o nosso olhar para perceber onde o\nsagrado é existente: Nos perfumes das flores, nos formatos das nuvens, na intensidade\ndo vento, no calor do sol, nas cores do entardecer etc.\nNosso mundo é interconectado com as diferentes camadas do plano espiritual. Embora\nnossos limitados sentidos não a captam, em tudo há uma expressão de uma causa mais\nprofunda. É na natureza que encontramos o maior e mais belo templo divino.\nÉ nossa tarefa, enquanto caminhantes da jornada espiritual, cultivar esta essência divina\nde nos conectar com o Pai Maior. Quando descobrimos que somos filhos de um Orixá,\nmais do que apontarmos traços de personalidade como se fossem signos da astrologia,\ndevemos reconhecer e reverenciar este pedaço de Deus que há em nós.\nÉ sagrado também o nosso propósito como médiuns e a nossa missão aqui na Terra. O\nvazio no coração nos chama para cumpri-los. Somente na realização daquilo pelo qual\nencarnamos é que podemos vivenciar o verdadeiro sentido na vida. Quando nossos dias\nsão preenchidos de finalidade, de boas intenções, eles se destacam da banalidade do\nmundo e tornam-se sagrados. E então, começamos a compreender um pouco dos\nmistérios divinos."
}

const ESTUDOS_TITULOS_COMPLETOS = {
  "1": "Princípios Religiosos e Preparação para as Giras",
  "2": "Orixás — Saudações, Ervas, Cores e Linhas",
  "3": "A Umbanda e Deus",
  "4": "Anjo da Guarda, Preces e Ritualística",
  "5": "Cambonos — Formação e Procedimentos",
  "6": "O que é a Umbanda? História e Fundamentos",
  "7": "Elementos de Trabalho na Umbanda",
  "8": "A Importância das Ervas na Umbanda",
  "9": "Fundamento, Axé e o Sagrado na Umbanda"
}

function EstudoLeitor({ estudo, onClose }) {
  if (!estudo) return null
  const ordem = Number(estudo.ordem || 0)
  const conteudo = ESTUDOS_CONTEUDO_COMPLETO[String(ordem)]
  const titulo = ESTUDOS_TITULOS_COMPLETOS[String(ordem)] || estudo.titulo
  if (!conteudo) return null

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,12,8,.96)', overflowY:'auto', padding:24 }}>
      <article style={{ maxWidth:900, margin:'0 auto', background:'#f6f0df', color:'#211b12', borderRadius:18, padding:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <small style={{ fontWeight:800, letterSpacing:1.2 }}>MATERIAL DE APOIO {String(ordem).padStart(2,'0')}</small>
            <h2 style={{ marginTop:8 }}>{titulo}</h2>
          </div>
          <button type="button" onClick={onClose}>Fechar</button>
        </div>
        <div style={{ whiteSpace:'pre-wrap', lineHeight:1.75, fontSize:17 }}>{conteudo}</div>
        <div style={{ marginTop:30 }}><button type="button" onClick={onClose}>Fechar apostila</button></div>
      </article>
    </div>
  )
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const [perfil, setPerfil] = useState(null)
  const [pagina, setPagina] = useState('dashboard')

  const [filhos, setFilhos] = useState([])
  const [giras, setGiras] = useState([])
  const [materiais, setMateriais] = useState([])
  const [mensalidades, setMensalidades] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [avisos, setAvisos] = useState([])
  const [estudos, setEstudos] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [presencas, setPresencas] = useState([])
  const [funcoesGira, setFuncoesGira] = useState([])
  const [arquivosNuvem, setArquivosNuvem] = useState([])
  const [uploadNuvem, setUploadNuvem] = useState({
    arquivo: null,
    categoria: 'documento',
    filho_id: '',
    mensalidade_id: '',
    descricao: ''
  })
  const [enviandoArquivo, setEnviandoArquivo] = useState(false)
  const [solicitacoesCadastro, setSolicitacoesCadastro] = useState([])
  const [solicitacaoPublica, setSolicitacaoPublica] = useState({
    nome: '', email: '', telefone: '', data_nascimento: ''
  })
  const [criacaoAcesso, setCriacaoAcesso] = useState({ email: '', senha: '' })
  const [enviandoSolicitacao, setEnviandoSolicitacao] = useState(false)
  const arquivoInputRef = useRef(null)
  const [novaFuncaoGira, setNovaFuncaoGira] = useState({ gira_id: '', filho_id: '', funcao: '' })

  const [editFilho, setEditFilho] = useState(null)
  const [fichaFilho, setFichaFilho] = useState(null)
  const [buscaFilho, setBuscaFilho] = useState('')
  const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos')
  const [pagamentoModal, setPagamentoModal] = useState(null)
  const [formPagamento, setFormPagamento] = useState({
    valor: '',
    data_pagamento: '',
    forma_pagamento: 'Pix',
    observacoes: ''
  })
  const [giraSelecionada, setGiraSelecionada] = useState('')
  const [novaGira, setNovaGira] = useState({})
  const [novoMaterial, setNovoMaterial] = useState({})
  const [novoAviso, setNovoAviso] = useState({})
  const [novoEstudo, setNovoEstudo] = useState({})
  const [estudoAberto, setEstudoAberto] = useState(null)
  const [publicSecao, setPublicSecao] = useState('inicio')
  const [novaSugestao, setNovaSugestao] = useState({
    assunto: '',
    mensagem: '',
    anonima: false
  })

  const admin = perfil?.tipo_usuario === 'administrador'

  const cargosDisponiveis = Array.from(
    new Set([
      ...CARGOS_PADRAO,
      ...filhos.map(f => f.cargo).filter(Boolean)
    ])
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'))


  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s)
        if (!s) {
          setPerfil(null)
          setLoading(false)
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    carregarTudo()
  }, [session])

  useEffect(() => {
    if (!supabase || session) return

    async function carregarSitePublico() {
      const hoje = hojeISO()

      const [rg, ra] = await Promise.all([
        supabase
          .from('giras')
          .select('*')
          .eq('aberta_publico', true)
          .gte('data_gira', hoje)
          .order('data_gira', { ascending: true })
          .limit(12),

        supabase
          .from('avisos')
          .select('*')
          .eq('publicado', true)
          .order('data_publicacao', { ascending: false })
          .limit(6)
      ])

      if (!rg.error) setGiras(rg.data || [])
      if (!ra.error) setAvisos(ra.data || [])
    }

    carregarSitePublico()
  }, [session])


  async function enviarSolicitacaoCadastro(e) {
    e.preventDefault()
    setErro('')
    setEnviandoSolicitacao(true)

    try {
      const payload = {
        nome: solicitacaoPublica.nome.trim(),
        email: solicitacaoPublica.email.trim().toLowerCase(),
        telefone: solicitacaoPublica.telefone.trim() || null,
        data_nascimento: solicitacaoPublica.data_nascimento || null
      }

      const { error } = await supabase
        .from('solicitacoes_cadastro')
        .insert(payload)

      if (error) throw error

      setSolicitacaoPublica({ nome: '', email: '', telefone: '', data_nascimento: '' })
      alert('Solicitação enviada. Aguarde a aprovação do administrador. Depois, volte à Área do Filho para criar sua senha.')
      setPublicSecao('login')
    } catch (e) {
      setErro(e.message || 'Não foi possível enviar a solicitação.')
    } finally {
      setEnviandoSolicitacao(false)
    }
  }

  async function criarAcessoAprovado(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: criacaoAcesso.email.trim().toLowerCase(),
        password: criacaoAcesso.senha
      })
      if (error) throw error

      alert('Acesso criado. Se o Supabase pedir confirmação por e-mail, confirme o endereço e depois entre normalmente.')
      setCriacaoAcesso({ email: '', senha: '' })
      setPublicSecao('login')
    } catch (e) {
      setErro(e.message || 'Não foi possível criar o acesso. Confirme se seu cadastro já foi aprovado.')
    } finally {
      setLoading(false)
    }
  }

  async function aprovarSolicitacao(item) {
    const cargo = window.prompt('Cargo/função do filho:', item.cargo || 'Médium em Desenvolvimento')
    if (cargo === null) return
    const dia = window.prompt('Dia do vencimento da mensalidade:', item.dia_vencimento || '10')
    if (dia === null) return
    const valor = window.prompt('Valor da mensalidade:', item.valor_mensalidade || '0')
    if (valor === null) return

    const { error } = await supabase
      .from('solicitacoes_cadastro')
      .update({
        status: 'aprovado',
        cargo: cargo || null,
        dia_vencimento: Number(dia) || null,
        valor_mensalidade: Number(String(valor).replace(',', '.')) || 0,
        data_entrada: hojeISO(),
        aprovado_em: new Date().toISOString(),
        aprovado_por: session.user.id
      })
      .eq('id', item.id)

    if (error) return alert(error.message)
    await carregarAdmin()
    alert('Cadastro aprovado. Agora o filho pode usar o e-mail aprovado para criar a senha na Área do Filho.')
  }

  async function recusarSolicitacao(item) {
    if (!window.confirm(`Recusar a solicitação de ${item.nome}?`)) return
    const { error } = await supabase
      .from('solicitacoes_cadastro')
      .update({ status: 'recusado' })
      .eq('id', item.id)
    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setErro(error.message)
      setLoading(false)
    }
  }

  async function sair() {
    await supabase.auth.signOut()
    setPagina('dashboard')
  }

  async function carregarTudo() {
    setLoading(true)
    setErro('')

    try {
      const uid = session.user.id

      const { data: p, error: ep } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', uid)
        .single()

      if (ep) throw ep

      setPerfil(p)

      if (p.tipo_usuario === 'administrador') {
        await carregarAdmin()
      } else {
        await carregarFilho(p)
      }
    } catch (e) {
      console.error(e)
      setErro(e.message || 'Erro ao carregar o sistema.')
    }

    setLoading(false)
  }

  async function carregarAdmin() {
    const [
      rf,
      rg,
      rm,
      rmen,
      rp,
      ra,
      re,
      rs,
      rpre,
      rfun,
      rarq
    ] = await Promise.all([
      supabase.rpc('admin_listar_filhos'),
      supabase.rpc('admin_listar_giras'),
      supabase.rpc('admin_listar_materiais'),
      supabase.rpc('admin_listar_mensalidades'),
      supabase.rpc('admin_listar_pagamentos'),
      supabase.rpc('admin_listar_avisos'),
      supabase.rpc('admin_listar_estudos'),
      supabase.rpc('admin_listar_sugestoes'),
      supabase.rpc('admin_listar_presencas'),
      supabase.rpc('admin_listar_funcoes_gira'),
      supabase.from('arquivos_templo').select('*').order('criado_em', { ascending: false })
    ])

    const respostas = [rf, rg, rm, rmen, rp, ra, re, rs, rpre, rfun, rarq]
    const falha = respostas.find(x => x.error)

    if (falha?.error) throw falha.error

    setFilhos(rf.data || [])
    setGiras(rg.data || [])
    setMateriais(rm.data || [])
    setMensalidades(rmen.data || [])
    setPagamentos(rp.data || [])
    setAvisos(ra.data || [])
    setEstudos(re.data || [])
    setSugestoes(rs.data || [])
    setPresencas(rpre.data || [])
    setFuncoesGira(rfun.data || [])
    setArquivosNuvem(rarq.data || [])
    const { data: solicitacoes, error: erroSolicitacoes } = await supabase
      .from('solicitacoes_cadastro')
      .select('*')
      .order('criado_em', { ascending: false })
    if (erroSolicitacoes) throw erroSolicitacoes
    setSolicitacoesCadastro(solicitacoes || [])
  }

  async function enviarArquivoNuvem(e) {
    e.preventDefault()
    if (!uploadNuvem.arquivo) return alert('Escolha um arquivo.')

    setEnviandoArquivo(true)
    try {
      const arquivo = uploadNuvem.arquivo
      const seguro = String(arquivo.name || 'arquivo')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
      const caminho = `${Date.now()}_${seguro}`

      const { error: storageError } = await supabase.storage
        .from('templo-privado')
        .upload(caminho, arquivo, { upsert: false })

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('arquivos_templo')
        .insert({
          nome: arquivo.name,
          caminho,
          categoria: uploadNuvem.categoria || 'documento',
          filho_id: uploadNuvem.filho_id || null,
          mensalidade_id: uploadNuvem.mensalidade_id
            ? Number(uploadNuvem.mensalidade_id)
            : null,
          descricao: uploadNuvem.descricao || null,
          criado_por: session.user.id
        })

      if (dbError) {
        await supabase.storage.from('templo-privado').remove([caminho])
        throw dbError
      }

      setUploadNuvem({
        arquivo: null,
        categoria: 'documento',
        filho_id: '',
        mensalidade_id: '',
        descricao: ''
      })
      if (arquivoInputRef.current) arquivoInputRef.current.value = ''
      setMsg('Arquivo enviado para a nuvem privada.')
      await carregarAdmin()
    } catch (e) {
      alert(e.message || 'Não foi possível enviar o arquivo.')
    } finally {
      setEnviandoArquivo(false)
    }
  }

  async function abrirArquivoNuvem(item) {
    const { data, error } = await supabase.storage
      .from('templo-privado')
      .createSignedUrl(item.caminho, 120)

    if (error) return alert(error.message)
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function excluirArquivoNuvem(item) {
    if (!window.confirm(`Excluir "${item.nome}" da nuvem?`)) return

    const { error: storageError } = await supabase.storage
      .from('templo-privado')
      .remove([item.caminho])

    if (storageError) return alert(storageError.message)

    const { error: dbError } = await supabase
      .from('arquivos_templo')
      .delete()
      .eq('id', item.id)

    if (dbError) return alert(dbError.message)

    setMsg('Arquivo excluído.')
    await carregarAdmin()
  }

  function exportarCSV(nome, linhas) {
    if (!linhas?.length) return alert('Não há dados para exportar.')

    const colunas = Array.from(
      linhas.reduce((set, linha) => {
        Object.keys(linha || {}).forEach(k => set.add(k))
        return set
      }, new Set())
    )

    const esc = valor => {
      const texto = valor == null ? '' : String(valor)
      return `"${texto.replace(/"/g, '""')}"`
    }

    const csv = [
      colunas.map(esc).join(';'),
      ...linhas.map(linha => colunas.map(c => esc(linha[c])).join(';'))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nome}_${hojeISO()}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function carregarFilho(p) {
    const hoje = hojeISO()

    const [
      rg,
      rmen,
      ra,
      re,
      rs
    ] = await Promise.all([
      supabase
        .from('giras')
        .select('*')
        .gte('data_gira', hoje)
        .order('data_gira')
        .limit(20),

      supabase.rpc('minhas_mensalidades'),

      supabase
        .from('avisos')
        .select('*')
        .eq('publicado', true)
        .order('data_publicacao', { ascending: false }),

      supabase
        .from('estudos')
        .select('*')
        .eq('publicado', true)
        .order('ordem'),

      supabase
        .from('sugestoes')
        .select('*')
        .eq('filho_id', session.user.id)
        .order('id', { ascending: false })
    ])

    setGiras(rg.data || [])
    setMensalidades(rmen.data || [])
    setAvisos(ra.data || [])
    setEstudos(re.data || [])
    setSugestoes(rs.data || [])

    const { data: funcoesFilho } = await supabase
      .from('funcoes_gira')
      .select('*')
      .eq('filho_id', session.user.id)
      .order('gira_id')

    setFuncoesGira(funcoesFilho || [])

    const primeiraGira = (rg.data || [])[0]

    if (primeiraGira && p?.cargo) {
      const { data: mat } = await supabase
        .from('materiais_gira')
        .select('*')
        .eq('gira_id', primeiraGira.id)
        .eq('cargo', p.cargo)
        .order('id')

      setMateriais(mat || [])
    } else {
      setMateriais([])
    }
  }

  const resumo = useMemo(() => {
    const mesAtual = hojeISO().slice(0, 7)

    const mes = mensalidades.filter(
      m => String(m.competencia || '').slice(0, 7) === mesAtual
    )

    return {
      filhos: filhos.filter(f => f.ativo).length,
      pendencias: mes.filter(m =>
        ['Atrasado', 'Parcial / Atrasado'].includes(
          m.situacao || statusMensalidade(m)
        )
      ).length,
      previsto: mes.reduce((s, m) => s + Number(m.valor || 0), 0),
      recebido: mes.reduce((s, m) => s + Number(m.valor_pago || 0), 0)
    }
  }, [filhos, mensalidades])

  const aniversariantesMes = useMemo(() => {
    const mesAtual = Number(hojeISO().slice(5, 7))
    return filhos
      .filter(f => f.ativo && f.data_nascimento)
      .filter(f => Number(String(f.data_nascimento).slice(5, 7)) === mesAtual)
      .sort((a, b) =>
        Number(String(a.data_nascimento).slice(8, 10)) -
        Number(String(b.data_nascimento).slice(8, 10))
      )
  }, [filhos])

  const girasFuturas = useMemo(() => {
    const hoje = hojeISO()
    return [...giras]
      .filter(g => String(g.data_gira || '') >= hoje)
      .sort((a, b) => String(a.data_gira || '').localeCompare(String(b.data_gira || '')))
  }, [giras])

  const girasHistorico = useMemo(() => {
    const hoje = hojeISO()
    return [...giras]
      .filter(g => String(g.data_gira || '') < hoje)
      .sort((a, b) => String(b.data_gira || '').localeCompare(String(a.data_gira || '')))
  }, [giras])

  const proximaGiraSistema = girasFuturas[0] || null

  const pendenciasConfirmacao = useMemo(() => {
    const proxima = proximaGiraSistema
    if (!proxima) return []
    return filhos
      .filter(f => f.ativo)
      .filter(f => !presencas.some(p =>
        String(p.gira_id) === String(proxima.id) &&
        p.filho_id === f.id &&
        p.confirmado
      ))
  }, [filhos, proximaGiraSistema, presencas])

  const resumoFrequencia = useMemo(() => {
    const marcados = presencas.filter(p => p.presente === true || p.presente === false)
    const presentes = marcados.filter(p => p.presente === true).length
    const faltas = marcados.filter(p => p.presente === false).length
    const percentual = marcados.length ? Math.round((presentes / marcados.length) * 100) : 0
    return { presentes, faltas, percentual, total: marcados.length }
  }, [presencas])

  const mensalidadesPendentes = useMemo(() => {
    return mensalidades.filter(m => Number(m.valor_pago || 0) < Number(m.valor || 0))
  }, [mensalidades])

  function frequenciaFilho(filhoId) {
    const registros = presencas.filter(p => p.filho_id === filhoId)
    const marcados = registros.filter(p => p.presente === true || p.presente === false)
    const presentes = marcados.filter(p => p.presente === true).length
    const faltas = marcados.filter(p => p.presente === false).length
    const percentual = marcados.length
      ? Math.round((presentes / marcados.length) * 100)
      : 0
    return { presentes, faltas, percentual, total: marcados.length }
  }

  function whatsappHref(telefone, mensagem = '') {
    let numero = String(telefone || '').replace(/\D/g, '')
    if (!numero) return '#'
    if (!numero.startsWith('55')) numero = `55${numero}`
    return `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}`
  }

  async function salvarFuncaoGira(e) {
    e.preventDefault()
    if (!novaFuncaoGira.gira_id || !novaFuncaoGira.filho_id || !novaFuncaoGira.funcao) {
      return alert('Selecione a gira, o filho e informe a função.')
    }

    const { error } = await supabase
      .from('funcoes_gira')
      .upsert({
        gira_id: Number(novaFuncaoGira.gira_id),
        filho_id: novaFuncaoGira.filho_id,
        funcao: novaFuncaoGira.funcao,
        observacoes: novaFuncaoGira.observacoes || null
      }, { onConflict: 'gira_id,filho_id' })

    if (error) return alert(error.message)

    setNovaFuncaoGira({
      gira_id: novaFuncaoGira.gira_id,
      filho_id: '',
      funcao: '',
      observacoes: ''
    })
    await carregarAdmin()
    alert('Função da gira salva.')
  }

  async function excluirFuncaoGira(id) {
    if (!window.confirm('Excluir esta função da gira?')) return
    const { error } = await supabase.from('funcoes_gira').delete().eq('id', id)
    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function salvarFilho(e) {
    e.preventDefault()
    if (!editFilho?.id) return

    setMsg('')

    const payload = {
      nome: editFilho.nome,
      telefone: editFilho.telefone || null,
      data_nascimento: editFilho.data_nascimento || null,
      cargo: editFilho.cargo || null,
      ativo: editFilho.ativo,
      dia_vencimento: Number(editFilho.dia_vencimento) || null,
      valor_mensalidade: Number(editFilho.valor_mensalidade) || 0,
      data_entrada: editFilho.data_entrada || null,
      observacoes: editFilho.observacoes || null
    }

    const { error } = await supabase
      .from('perfis')
      .update(payload)
      .eq('id', editFilho.id)

    if (error) return setMsg(`Erro: ${error.message}`)

    setMsg('Cadastro atualizado com sucesso.')
    setEditFilho(null)
    await carregarAdmin()
  }

  function abrirPagamento(m) {
    const restante = Math.max(
      0,
      Number(m.valor || 0) - Number(m.valor_pago || 0)
    )

    setPagamentoModal(m)
    setFormPagamento({
      valor: restante.toFixed(2).replace('.', ','),
      data_pagamento: hojeISO(),
      forma_pagamento: 'Pix',
      observacoes: ''
    })
  }

  async function salvarPagamento(e) {
    e.preventDefault()
    if (!pagamentoModal) return

    const restante = Math.max(
      0,
      Number(pagamentoModal.valor || 0) -
        Number(pagamentoModal.valor_pago || 0)
    )

    const valorNovo = Number(
      String(formPagamento.valor || '').replace(',', '.')
    )

    if (!valorNovo || valorNovo <= 0) {
      alert('Informe um valor válido.')
      return
    }

    if (valorNovo > restante + 0.001) {
      alert(`O valor não pode ser maior que o saldo de ${dinheiro(restante)}.`)
      return
    }

    const totalPago =
      Number(pagamentoModal.valor_pago || 0) + valorNovo

    const { error: e1 } = await supabase
      .from('pagamentos')
      .insert({
        mensalidade_id: pagamentoModal.id,
        valor: valorNovo,
        data_pagamento: formPagamento.data_pagamento || hojeISO(),
        forma_pagamento: formPagamento.forma_pagamento || 'Pix',
        observacoes: formPagamento.observacoes || null
      })

    if (e1) return alert(e1.message)

    const quitada =
      totalPago >= Number(pagamentoModal.valor || 0) - 0.001

    const { error: e2 } = await supabase
      .from('mensalidades')
      .update({
        valor_pago: totalPago,
        data_pagamento: quitada
          ? (formPagamento.data_pagamento || hojeISO())
          : null,
        forma_pagamento: formPagamento.forma_pagamento || 'Pix'
      })
      .eq('id', pagamentoModal.id)

    if (e2) return alert(e2.message)

    setPagamentoModal(null)
    setMsg(
      quitada
        ? 'Pagamento registrado e mensalidade quitada.'
        : 'Pagamento parcial registrado com sucesso.'
    )
    await carregarAdmin()
  }

  async function gerarMensalidadesAgora() {
    const { data, error } = await supabase.rpc('gerar_mensalidades_mes', {
      p_competencia: `${hojeISO().slice(0, 7)}-01`
    })

    if (error) return alert(error.message)

    alert(
      Number(data || 0) > 0
        ? `${data} mensalidade(s) gerada(s) com sucesso.`
        : 'As mensalidades deste mês já estão em dia.'
    )

    await carregarAdmin()
  }

  async function editarGira(g) {
    const titulo = window.prompt('Título da gira:', g.titulo || '')
    if (titulo === null) return

    const orientacoes = window.prompt(
      'Orientações da gira:',
      g.orientacoes || ''
    )
    if (orientacoes === null) return

    const { error } = await supabase
      .from('giras')
      .update({ titulo, orientacoes })
      .eq('id', g.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function editarMaterial(m) {
    const item = window.prompt('Material:', m.item || '')
    if (item === null) return

    const observacoes = window.prompt(
      'Observações:',
      m.observacoes || ''
    )
    if (observacoes === null) return

    const { error } = await supabase
      .from('materiais_gira')
      .update({ item, observacoes })
      .eq('id', m.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function editarAviso(a) {
    const titulo = window.prompt('Título do aviso:', a.titulo || '')
    if (titulo === null) return

    const mensagem = window.prompt('Mensagem:', a.mensagem || '')
    if (mensagem === null) return

    const { error } = await supabase
      .from('avisos')
      .update({ titulo, mensagem })
      .eq('id', a.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function editarEstudo(estudo) {
    const titulo = window.prompt('Título:', estudo.titulo || '')
    if (titulo === null) return

    const descricao = window.prompt(
      'Descrição:',
      estudo.descricao || ''
    )
    if (descricao === null) return

    const { error } = await supabase
      .from('estudos')
      .update({ titulo, descricao })
      .eq('id', estudo.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function marcarPresencaAdmin(p, presente) {
    const { error } = await supabase
      .from('presencas_gira')
      .update({ presente })
      .eq('id', p.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function criarGira(e) {
    e.preventDefault()

    const { error } = await supabase.from('giras').insert({
      titulo: novaGira.titulo,
      linha: novaGira.linha || null,
      descricao: novaGira.descricao || null,
      data_gira: novaGira.data_gira,
      horario: novaGira.horario,
      local: novaGira.local || null,
      aberta_publico: !!novaGira.aberta_publico,
      destaque: !!novaGira.destaque,
      orientacoes: novaGira.orientacoes || null
    })

    if (error) return alert(error.message)

    setNovaGira({})
    await carregarAdmin()
    alert('Gira cadastrada.')
  }

  async function excluirGira(id) {
    if (!window.confirm('Deseja realmente excluir esta gira?')) return

    const { error } = await supabase
      .from('giras')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function criarMaterial(e) {
    e.preventDefault()

    const itens = String(novoMaterial.itens || novoMaterial.item || '')
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean)

    if (!novoMaterial.gira_id) {
      return alert('Selecione a gira.')
    }

    if (!novoMaterial.cargo) {
      return alert('Selecione o cargo.')
    }

    if (itens.length === 0) {
      return alert('Digite pelo menos um material.')
    }

    const registros = itens.map(item => ({
      gira_id: Number(novoMaterial.gira_id),
      cargo: novoMaterial.cargo,
      item,
      obrigatorio: novoMaterial.obrigatorio !== false,
      observacoes: novoMaterial.observacoes || null
    }))

    const { error } = await supabase
      .from('materiais_gira')
      .insert(registros)

    if (error) return alert(error.message)

    // Mantém gira e cargo selecionados para facilitar novos cadastros.
    setNovoMaterial({
      gira_id: novoMaterial.gira_id,
      cargo: novoMaterial.cargo,
      obrigatorio: novoMaterial.obrigatorio !== false,
      itens: '',
      observacoes: ''
    })

    await carregarAdmin()
    alert(
      itens.length === 1
        ? 'Material cadastrado.'
        : `${itens.length} materiais cadastrados de uma vez.`
    )
  }

  async function carregarEstudosBase() {
    const existentes = new Set(
      estudos.map(e => String(e.titulo || '').trim().toLowerCase())
    )

    const faltantes = ESTUDOS_BASE
      .filter(
        e => !existentes.has(e.titulo.trim().toLowerCase())
      )
      .map(e => ({
        ...e,
        arquivo_url: null,
        link_externo: null,
        somente_filhos: true,
        publicado: true
      }))

    if (faltantes.length === 0) {
      return alert('Os 9 Materiais de Apoio já estão cadastrados.')
    }

    const { error } = await supabase
      .from('estudos')
      .insert(faltantes)

    if (error) return alert(error.message)

    await carregarAdmin()
    alert(
      `${faltantes.length} material(is) de estudo carregado(s) com sucesso.`
    )
  }

  async function excluirMaterial(id) {
    if (!window.confirm('Excluir este material?')) return

    const { error } = await supabase
      .from('materiais_gira')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function criarAviso(e) {
    e.preventDefault()

    const { error } = await supabase.from('avisos').insert({
      titulo: novoAviso.titulo,
      mensagem: novoAviso.mensagem,
      publico: novoAviso.publico || 'filhos',
      importante: !!novoAviso.importante,
      publicado: true,
      data_publicacao: new Date().toISOString()
    })

    if (error) return alert(error.message)

    setNovoAviso({})
    await carregarAdmin()
    alert('Aviso publicado.')
  }

  async function excluirAviso(id) {
    if (!window.confirm('Excluir este aviso?')) return

    const { error } = await supabase
      .from('avisos')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function criarEstudo(e) {
    e.preventDefault()

    const { error } = await supabase.from('estudos').insert({
      titulo: novoEstudo.titulo,
      descricao: novoEstudo.descricao || null,
      categoria: novoEstudo.categoria || 'Geral',
      arquivo_url: novoEstudo.arquivo_url || null,
      link_externo: novoEstudo.link_externo || null,
      somente_filhos: true,
      publicado: true,
      ordem: Number(novoEstudo.ordem) || 0
    })

    if (error) return alert(error.message)

    setNovoEstudo({})
    await carregarAdmin()
    alert('Estudo publicado.')
  }

  async function excluirEstudo(id) {
    if (!window.confirm('Excluir este estudo?')) return

    const { error } = await supabase
      .from('estudos')
      .delete()
      .eq('id', id)

    if (error) return alert(error.message)
    await carregarAdmin()
  }

  async function responderSugestao(s) {
    const resposta = window.prompt(
      `Resposta para: ${s.assunto}`,
      s.resposta || ''
    )

    if (resposta === null) return

    const { error } = await supabase
      .from('sugestoes')
      .update({
        resposta,
        status: 'respondida'
      })
      .eq('id', s.id)

    if (error) return alert(error.message)

    await carregarAdmin()
  }

  async function enviarSugestao(e) {
    e.preventDefault()

    const { error } = await supabase.from('sugestoes').insert({
      filho_id: session.user.id,
      assunto: novaSugestao.assunto,
      mensagem: novaSugestao.mensagem,
      anonima: !!novaSugestao.anonima,
      status: 'nova'
    })

    if (error) return alert(error.message)

    setNovaSugestao({
      assunto: '',
      mensagem: '',
      anonima: false
    })

    await carregarFilho(perfil)
    alert('Sugestão enviada.')
  }

  async function confirmarPresenca(gira) {
    const { data: existente } = await supabase
      .from('presencas_gira')
      .select('*')
      .eq('gira_id', gira.id)
      .eq('filho_id', session.user.id)
      .maybeSingle()

    if (existente) {
      const { error } = await supabase
        .from('presencas_gira')
        .update({ confirmado: true })
        .eq('id', existente.id)

      if (error) return alert(error.message)
    } else {
      const { error } = await supabase
        .from('presencas_gira')
        .insert({
          gira_id: gira.id,
          filho_id: session.user.id,
          confirmado: true,
          presente: null
        })

      if (error) return alert(error.message)
    }

    await carregarFilho(perfil)
    alert('Presença confirmada. A presença real será registrada pelo administrador após a gira.')
  }

  if (!session) {
    const proximaPublica = giras[0]
    const girasPublicas = giras.slice(0, 8)
    const avisosPublicos = avisos.slice(0, 4)

    return (
      <main className="app public-app">
        <a
          href="https://wa.me/5519988760784?text=Ol%C3%A1%21%20Vim%20pelo%20site%20do%20T.U%20Caboclo%20Tupinamb%C3%A1%20Ode%20Leke%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es."
          target="_blank"
          rel="noreferrer"
          aria-label="Falar com o Templo pelo WhatsApp"
          title="Fale conosco pelo WhatsApp"
          style={{
            position: 'fixed',
            right: 22,
            bottom: 22,
            width: 58,
            height: 58,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#25D366',
            color: '#fff',
            fontSize: 30,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,.32)',
            zIndex: 9999
          }}
        >
          <svg
            viewBox="0 0 32 32"
            width="32"
            height="32"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M16.04 3C9.43 3 4.06 8.28 4.06 14.78c0 2.29.68 4.53 1.96 6.44L4 28.5l7.5-1.95a12.1 12.1 0 0 0 4.54.88h.01c6.6 0 11.98-5.28 11.98-11.78C28.03 9.28 22.65 3 16.04 3Zm0 22.43h-.01a10.08 10.08 0 0 1-4.28-.95l-.31-.14-4.45 1.16 1.19-4.27-.2-.33a9.7 9.7 0 0 1-1.53-5.22C6.45 10.25 10.75 6 16.04 6c5.3 0 9.6 4.25 9.6 9.65 0 5.53-4.3 9.78-9.6 9.78Zm5.27-7.31c-.29-.14-1.71-.83-1.98-.92-.26-.1-.46-.14-.65.14-.19.28-.75.92-.91 1.11-.17.19-.34.21-.63.07-.29-.14-1.22-.44-2.32-1.4-.86-.75-1.44-1.68-1.61-1.96-.17-.28-.02-.43.13-.57.13-.13.29-.33.43-.5.14-.16.19-.28.29-.47.1-.19.05-.35-.02-.5-.08-.14-.65-1.54-.89-2.11-.23-.56-.47-.48-.65-.49h-.55c-.19 0-.5.07-.77.35-.26.28-1 1-1 2.44s1.03 2.83 1.18 3.02c.14.19 2.04 3.06 4.94 4.29.69.29 1.23.47 1.65.6.69.22 1.32.19 1.82.12.55-.08 1.71-.69 1.95-1.35.24-.66.24-1.23.17-1.35-.08-.12-.27-.19-.56-.33Z"/>
          </svg>
        </a>
        <header className="public-header">
          <button className="brand-button" onClick={() => setPublicSecao('inicio')}>
            <span className="public-mark">TU</span>
            <span className="brand-copy">
              <small>TEMPLO DE UMBANDA</small>
              <strong>Caboclo Tupinambá Ode Leke</strong>
            </span>
          </button>

          <button className="ghost public-login" onClick={() => setPublicSecao('login')}>
            Área do Filho
          </button>
        </header>

        <nav className="public-nav" aria-label="Navegação principal">
          <button className={publicSecao === 'inicio' ? 'active' : ''} onClick={() => setPublicSecao('inicio')}>Início</button>
          <button className={publicSecao === 'agenda' ? 'active' : ''} onClick={() => setPublicSecao('agenda')}>Agenda</button>
          <button className={publicSecao === 'templo' ? 'active' : ''} onClick={() => setPublicSecao('templo')}>O Templo</button>
          <button className={publicSecao === 'buzios' ? 'active' : ''} onClick={() => setPublicSecao('buzios')}>Jogo de Búzios</button>
          <button className={publicSecao === 'contato' ? 'active' : ''} onClick={() => setPublicSecao('contato')}>Contato</button>
        </nav>

        {publicSecao === 'inicio' && (
          <>
            <section className="public-hero">
              <div className="public-hero-copy">
                <span className="eyebrow">FÉ • CARIDADE • RESPEITO • TRADIÇÃO</span>
                <h1>Umbanda vivida com fundamento, responsabilidade e acolhimento.</h1>
                <p>
                  O Templo T.U Caboclo Tupinambá Ode Leke é uma casa dedicada à
                  espiritualidade, ao desenvolvimento mediúnico, à orientação e à caridade.
                </p>
                <div className="actions">
                  <button onClick={() => setPublicSecao('agenda')}>Conhecer a agenda</button>
                  <button className="ghost" onClick={() => setPublicSecao('templo')}>Conheça nossa casa</button>
                </div>
              </div>

              <div className="public-symbol" aria-hidden="true">
                <div className="symbol-ring">
                  <span>TU</span>
                  <small>CABOCLO TUPINAMBÁ</small>
                </div>
              </div>
            </section>

            <section className="public-feature-grid">
              <article className="card public-next">
                <span className="tag">PRÓXIMA GIRA</span>
                {proximaPublica ? (
                  <>
                    <h2>{proximaPublica.titulo}</h2>
                    <p className="public-date">{dataBR(proximaPublica.data_gira)} • {horaBR(proximaPublica.horario)}</p>
                    {proximaPublica.linha && <p><strong>Linha:</strong> {proximaPublica.linha}</p>}
                    {proximaPublica.local && <p><strong>Local:</strong> {proximaPublica.local}</p>}
                    {proximaPublica.orientacoes && <p>{proximaPublica.orientacoes}</p>}
                    <button onClick={() => setPublicSecao('agenda')}>Ver programação</button>
                  </>
                ) : (
                  <>
                    <h2>Programação em atualização</h2>
                    <p>A próxima gira pública será divulgada aqui assim que for cadastrada.</p>
                    <button className="ghost" onClick={() => setPublicSecao('agenda')}>Abrir agenda</button>
                  </>
                )}
              </article>

              <article className="card public-buzios">
                <span className="tag">ORIENTAÇÃO</span>
                <h2>Jogo de Búzios</h2>
                <p>
                  Uma consulta para compreender caminhos, decisões e situações que
                  precisam de maior clareza e direcionamento.
                </p>
                <button onClick={() => setPublicSecao('buzios')}>Informações e agendamento</button>
              </article>
            </section>

            <section className="public-values">
              <div><strong>Fé</strong><span>Vivência espiritual com respeito ao sagrado.</span></div>
              <div><strong>Caridade</strong><span>Acolhimento e serviço como compromisso da casa.</span></div>
              <div><strong>Disciplina</strong><span>Desenvolvimento com responsabilidade e fundamento.</span></div>
              <div><strong>Ancestralidade</strong><span>Respeito às raízes, aos guias e à tradição.</span></div>
            </section>

            {avisosPublicos.length > 0 && (
              <section className="card wide public-notices">
                <div className="section-heading">
                  <div>
                    <span className="tag">COMUNICADOS</span>
                    <h2>Avisos do Templo</h2>
                  </div>
                </div>
                <div className="public-notice-grid">
                  {avisosPublicos.map(a => (
                    <article className="public-notice" key={a.id}>
                      <strong>{a.importante ? '⚠️ ' : ''}{a.titulo}</strong>
                      <p>{a.mensagem}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="public-cta">
              <div>
                <span className="eyebrow">ÁREA RESERVADA</span>
                <h2>Filhos da casa</h2>
                <p>Consulte giras, função, materiais, mensalidades, avisos e estudos.</p>
              </div>
              <button onClick={() => setPublicSecao('login')}>Entrar na Área do Filho</button>
            </section>
          </>
        )}

        {publicSecao === 'agenda' && (
          <section className="public-page">
            <div className="section-heading">
              <div>
                <span className="tag">AGENDA DO TEMPLO</span>
                <h1>Próximas giras públicas</h1>
                <p>Confira datas, horários e orientações divulgadas pela casa.</p>
              </div>
            </div>

            <div className="public-agenda-grid">
              {girasPublicas.length ? girasPublicas.map(g => (
                <article className="card public-agenda-card" key={g.id}>
                  <span className="tag">{g.linha || 'GIRA'}</span>
                  <h2>{g.titulo}</h2>
                  <p className="public-date">{dataBR(g.data_gira)} • {horaBR(g.horario)}</p>
                  {g.local && <p><strong>Local:</strong> {g.local}</p>}
                  {g.orientacoes && <p>{g.orientacoes}</p>}
                </article>
              )) : (
                <article className="card wide">
                  <h2>Agenda em atualização</h2>
                  <p>Nenhuma próxima gira pública foi cadastrada ainda.</p>
                </article>
              )}
            </div>
          </section>
        )}

        {publicSecao === 'templo' && (
          <section className="public-page">
            <div className="section-heading">
              <div>
                <span className="tag">NOSSA CASA</span>
                <h1>Templo T.U Caboclo Tupinambá Ode Leke</h1>
                <p>Uma casa de Umbanda voltada à fé, à caridade e ao desenvolvimento espiritual responsável.</p>
              </div>
            </div>

            <div className="public-feature-grid">
              <article className="card">
                <h2>Nossa vivência</h2>
                <p>
                  As atividades da casa são conduzidas com respeito aos fundamentos,
                  aos guias, à espiritualidade e às responsabilidades de cada filho.
                </p>
              </article>
              <article className="card">
                <h2>Desenvolvimento</h2>
                <p>
                  Giras, estudos e orientações fazem parte do processo de aprendizado,
                  disciplina e amadurecimento dentro da Umbanda.
                </p>
              </article>
            </div>

            <section className="public-values">
              <div><strong>Respeito</strong><span>Ao sagrado, aos guias e a cada pessoa.</span></div>
              <div><strong>Compromisso</strong><span>Com a casa e com o desenvolvimento.</span></div>
              <div><strong>Caridade</strong><span>Como princípio essencial da vivência religiosa.</span></div>
              <div><strong>Fundamento</strong><span>Estudo, tradição e responsabilidade.</span></div>
            </section>
          </section>
        )}

        {publicSecao === 'buzios' && (
          <section className="public-page">
            <div className="public-consult">
              <span className="tag">CONSULTAS</span>
              <h1>Jogo de Búzios</h1>
              <p className="lead">
                Uma consulta de orientação para compreender caminhos, decisões,
                possibilidades e situações que precisam de clareza.
              </p>
              <div className="public-consult-points">
                <span>Orientação</span>
                <span>Decisões</span>
                <span>Caminhos</span>
                <span>Clareza</span>
              </div>
              <p>
                A agenda é organizada diretamente pelo atendimento do Templo.
                Informações sobre valores e horários são passadas no privado.
              </p>
              <button onClick={() => setPublicSecao('contato')}>Solicitar informações</button>
            </div>
          </section>
        )}

        {publicSecao === 'contato' && (
          <section className="public-page">
            <div className="section-heading">
              <div>
                <span className="tag">CONTATO</span>
                <h1>Fale com o Templo</h1>
                <p>Informações sobre giras, consultas, orientações e atividades da casa.</p>
              </div>
            </div>

            <div className="public-feature-grid">
              <article className="card">
                <h2>Atendimento</h2>
                <p>Entre em contato pelos canais oficiais do Templo.</p>
                <div className="actions" style={{ marginTop: 18 }}>
                  <a
                    className="button"
                    href="https://wa.me/5519988760784"
                    target="_blank"
                    rel="noreferrer"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    className="button ghost"
                    href="https://www.instagram.com/t.ucaboclotupinambaodeleke/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    📸 Instagram
                  </a>
                </div>
                <p style={{ marginTop: 16 }}>
                  WhatsApp: (19) 98876-0784<br />
                  Instagram: @t.ucaboclotupinambaodeleke
                </p>
              </article>
              <article className="card">
                <h2>Jogo de Búzios</h2>
                <p>Para valores e disponibilidade da agenda, solicite informações pelo atendimento do Templo.</p>
                <button onClick={() => setPublicSecao('buzios')}>Sobre a consulta</button>
              </article>
            </div>
          </section>
        )}

        {publicSecao === 'solicitar-cadastro' && (
          <section className="public-page">
            <div className="login-card public-login-card">
              <div className="mark">TU</div>
              <p className="eyebrow">CADASTRO COM APROVAÇÃO</p>
              <h1>Solicitar cadastro</h1>
              <p className="muted">
                Preencha seus dados. O acesso à Área do Filho só será liberado após aprovação do administrador.
              </p>
              <form onSubmit={enviarSolicitacaoCadastro}>
                <label>Nome completo
                  <input value={solicitacaoPublica.nome} onChange={e => setSolicitacaoPublica({...solicitacaoPublica, nome:e.target.value})} required />
                </label>
                <label>E-mail
                  <input type="email" value={solicitacaoPublica.email} onChange={e => setSolicitacaoPublica({...solicitacaoPublica, email:e.target.value})} required />
                </label>
                <label>WhatsApp
                  <input value={solicitacaoPublica.telefone} onChange={e => setSolicitacaoPublica({...solicitacaoPublica, telefone:e.target.value})} required />
                </label>
                <label>Data de nascimento
                  <input type="date" value={solicitacaoPublica.data_nascimento} onChange={e => setSolicitacaoPublica({...solicitacaoPublica, data_nascimento:e.target.value})} required />
                </label>
                {erro && <p className="error">{erro}</p>}
                <button disabled={enviandoSolicitacao}>{enviandoSolicitacao ? 'Enviando...' : 'Enviar solicitação'}</button>
              </form>
              <button className="ghost" onClick={() => setPublicSecao('login')}>Voltar</button>
            </div>
          </section>
        )}

        {publicSecao === 'criar-acesso' && (
          <section className="public-page">
            <div className="login-card public-login-card">
              <div className="mark">TU</div>
              <p className="eyebrow">CADASTRO APROVADO</p>
              <h1>Criar minha senha</h1>
              <p className="muted">
                Use exatamente o mesmo e-mail que foi aprovado pelo administrador.
              </p>
              <form onSubmit={criarAcessoAprovado}>
                <label>E-mail aprovado
                  <input type="email" value={criacaoAcesso.email} onChange={e => setCriacaoAcesso({...criacaoAcesso, email:e.target.value})} required />
                </label>
                <label>Crie uma senha
                  <input type="password" minLength="6" value={criacaoAcesso.senha} onChange={e => setCriacaoAcesso({...criacaoAcesso, senha:e.target.value})} required />
                </label>
                {erro && <p className="error">{erro}</p>}
                <button disabled={loading}>{loading ? 'Criando...' : 'Criar meu acesso'}</button>
              </form>
              <button className="ghost" onClick={() => setPublicSecao('login')}>Voltar</button>
            </div>
          </section>
        )}

        {publicSecao === 'login' && (
          <section className="public-page">
            <div className="login-card public-login-card">
              <div className="mark">TU</div>
              <p className="eyebrow">ACESSO RESTRITO</p>
              <h1>Área do Filho</h1>
              <p className="muted">Entre com seu e-mail e senha cadastrados no Templo.</p>

              <form onSubmit={entrar}>
                <label>
                  E-mail
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </label>
                <label>
                  Senha
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </label>

                {erro && <p className="error">{erro}</p>}

                <button disabled={loading}>{loading ? 'Entrando...' : 'Entrar na Área do Filho'}</button>
              </form>

              <div className="actions" style={{ marginTop: 14 }}>
                <button className="ghost" onClick={() => setPublicSecao('solicitar-cadastro')}>
                  Sou filho da casa / Solicitar cadastro
                </button>
                <button className="ghost" onClick={() => setPublicSecao('criar-acesso')}>
                  Cadastro aprovado? Criar minha senha
                </button>
              </div>
              <button className="ghost" onClick={() => setPublicSecao('inicio')}>Voltar ao site</button>
            </div>
          </section>
        )}

        <footer className="public-footer">
          <div className="footer-brand">
            <span className="public-mark small-mark">TU</span>
            <div>
              <strong>Templo T.U Caboclo Tupinambá Ode Leke</strong>
              <p>Fé • Disciplina • Caridade • Ancestralidade</p>
            </div>
          </div>
          <button className="ghost" onClick={() => setPublicSecao('login')}>Área do Filho</button>
        </footer>
      </main>
    )
  }

  if (loading || !perfil) {
    return (
      <main className="app">
        <div className="loading-box">
          Carregando sistema...
        </div>
      </main>
    )
  }

  if (admin) {
    return (
      <main className="app">
        <header>
          <div>
            <p className="eyebrow">
              TEMPLO T.U CABOCLO TUPINAMBÁ ODE LEKE
            </p>
            <h2>Olá, {perfil.nome || 'Geovanni'} 👋</h2>
            <p>Painel Administrativo</p>
          </div>

          <button className="ghost" onClick={sair}>
            Sair
          </button>
        </header>

        <nav className="menu">
          <button onClick={() => setPagina('dashboard')}>
            🏠 Dashboard
          </button>
          <button onClick={() => setPagina('filhos')}>
            👥 Filhos
          </button>
          <button onClick={() => setPagina('solicitacoes')}>
            🔔 Solicitações {solicitacoesCadastro.filter(x => x.status === 'pendente').length ? `(${solicitacoesCadastro.filter(x => x.status === 'pendente').length})` : ''}
          </button>
          <button onClick={() => setPagina('mensalidades')}>
            💰 Mensalidades
          </button>
          <button onClick={() => setPagina('giras')}>
            📅 Giras
          </button>
          <button onClick={() => setPagina('materiais')}>
            🧳 Materiais
          </button>
          <button onClick={() => setPagina('avisos')}>
            📢 Avisos
          </button>
          <button onClick={() => setPagina('estudos')}>
            📚 Estudos
          </button>
          <button onClick={() => setPagina('sugestoes')}>
            💡 Sugestões
          </button>
          <button onClick={() => setPagina('arquivos')}>
            ☁️ Arquivos
          </button>
          <button onClick={() => setPagina('backup')}>
            💾 Backup
          </button>
        </nav>

        {erro && <div className="alert error">{erro}</div>}
        {msg && <div className="alert">{msg}</div>}

        {pagina === 'dashboard' && (
          <>
            <section className="kpi-grid">
              <button className="kpi-card" onClick={() => setPagina('filhos')}>
                <span>FILHOS ATIVOS</span>
                <strong>{resumo.filhos}</strong>
                <small>Cadastros ativos</small>
              </button>

              <button className="kpi-card warning" onClick={() => setPagina('mensalidades')}>
                <span>PENDÊNCIAS</span>
                <strong>{resumo.pendencias}</strong>
                <small>Mensalidades atrasadas</small>
              </button>

              <button className="kpi-card" onClick={() => setPagina('mensalidades')}>
                <span>PREVISTO NO MÊS</span>
                <strong className="money-kpi">{dinheiro(resumo.previsto)}</strong>
                <small>Total previsto</small>
              </button>

              <button className="kpi-card success" onClick={() => setPagina('mensalidades')}>
                <span>RECEBIDO NO MÊS</span>
                <strong className="money-kpi">{dinheiro(resumo.recebido)}</strong>
                <small>Total recebido</small>
              </button>

              <article className="kpi-card">
                <span>SALDO A RECEBER</span>
                <strong className="money-kpi">
                  {dinheiro(Math.max(0, resumo.previsto - resumo.recebido))}
                </strong>
                <small>Em aberto no mês</small>
              </article>
            </section>

            <section className="card wide">
              <div className="section-heading">
                <div>
                  <span className="tag">DESEMPENHO FINANCEIRO</span>
                  <h3>Recebimento do mês</h3>
                </div>
                <strong>
                  {resumo.previsto > 0
                    ? Math.round((resumo.recebido / resumo.previsto) * 100)
                    : 0}%
                </strong>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      resumo.previsto > 0
                        ? (resumo.recebido / resumo.previsto) * 100
                        : 0
                    )}%`
                  }}
                />
              </div>
            </section>

            <section className="dashboard-detail-grid">
              <article className="card">
                <span className="tag">PRÓXIMA GIRA</span>
                {proximaGiraSistema ? (
                  <>
                    <h3>{giras[0].titulo}</h3>
                    <p className="big">
                      {dataBR(giras[0].data_gira)} • {String(giras[0].horario || '').slice(0, 5)}
                    </p>
                    <p>{giras[0].orientacoes || 'Sem orientações cadastradas.'}</p>
                    <button className="small" onClick={() => setPagina('giras')}>
                      Abrir central da gira
                    </button>
                  </>
                ) : (
                  <p>Nenhuma gira cadastrada.</p>
                )}
              </article>

              <article className="card">
                <span className="tag">ÚLTIMOS RECEBIMENTOS</span>
                <div className="mini-list">
                  {pagamentos.slice(0, 5).map(p => {
                    const mens = mensalidades.find(m => m.id === p.mensalidade_id)
                    return (
                      <div className="mini-row" key={p.id}>
                        <div>
                          <strong>{mens?.nome || 'Pagamento'}</strong>
                          <small>{dataBR(p.data_pagamento)} • {p.forma_pagamento || '—'}</small>
                        </div>
                        <strong>{dinheiro(p.valor)}</strong>
                      </div>
                    )
                  })}
                  {!pagamentos.length && <p>Nenhum pagamento registrado.</p>}
                </div>
              </article>
            </section>

            <section className="card wide">
              <span className="tag">PENDÊNCIAS DO MÊS</span>
              <h3>Quem precisa de atenção</h3>
              <div className="mini-list">
                {mensalidades
                  .filter(m => (m.situacao || statusMensalidade(m)) !== 'Pago')
                  .slice(0, 6)
                  .map(m => (
                    <div className="mini-row" key={m.id}>
                      <div>
                        <strong>{m.nome || 'Filho da casa'}</strong>
                        <small>Venceu em {dataBR(m.vencimento)}</small>
                      </div>
                      <div className="actions">
                        <strong>
                          {dinheiro(
                            Math.max(0, Number(m.valor || 0) - Number(m.valor_pago || 0))
                          )}
                        </strong>
                        <button className="small" onClick={() => abrirPagamento(m)}>
                          Receber
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section className="dashboard-detail-grid">
              <article className="card">
                <span className="tag">📊 FREQUÊNCIA GERAL</span>
                <h3>{resumoFrequencia.percentual}% de presença</h3>
                <div className="gira-stats">
                  <div><small>PRESENTES</small><strong>{resumoFrequencia.presentes}</strong></div>
                  <div><small>FALTAS</small><strong>{resumoFrequencia.faltas}</strong></div>
                  <div><small>REGISTROS</small><strong>{resumoFrequencia.total}</strong></div>
                </div>
              </article>

              <article className="card">
                <span className="tag">💰 PENDÊNCIAS FINANCEIRAS</span>
                <h3>{mensalidadesPendentes.length} mensalidade(s) com saldo</h3>
                <div className="mini-list">
                  {mensalidadesPendentes.slice(0, 5).map(m => {
                    const f = filhos.find(x => x.id === m.filho_id)
                    const saldo = Number(m.valor || 0) - Number(m.valor_pago || 0)
                    return (
                      <div className="mini-row" key={m.id}>
                        <div>
                          <strong>{f?.nome || 'Filho da casa'}</strong>
                          <small>Saldo: {moeda(saldo)}</small>
                        </div>
                        {f?.telefone && (
                          <a
                            className="button-link small"
                            href={whatsappHref(
                              f.telefone,
                              `Olá, ${f.nome}! Passando para lembrar que existe um saldo de ${moeda(saldo)} referente à mensalidade do templo.`
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    )
                  })}
                  {!mensalidadesPendentes.length && <p>Nenhuma pendência financeira.</p>}
                </div>
              </article>
            </section>

            <section className="dashboard-detail-grid">
              <article className="card">
                <span className="tag">🎂 ANIVERSARIANTES DO MÊS</span>
                <h3>Datas especiais</h3>
                <div className="mini-list">
                  {aniversariantesMes.length ? aniversariantesMes.map(f => (
                    <div className="mini-row" key={f.id}>
                      <div>
                        <strong>{f.nome}</strong>
                        <small>Dia {String(f.data_nascimento).slice(8, 10)}</small>
                      </div>
                      {f.telefone && (
                        <a
                          className="button-link small"
                          href={whatsappHref(f.telefone, `Feliz aniversário, ${f.nome}! Que seu novo ciclo seja de muito axé, saúde e caminhos abertos. 🎉`)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Parabenizar
                        </a>
                      )}
                    </div>
                  )) : <p>Nenhum aniversariante neste mês.</p>}
                </div>
              </article>

              <article className="card">
                <span className="tag">🔔 CENTRAL DE PENDÊNCIAS</span>
                <h3>Próxima gira</h3>
                {giras[0] ? (
                  <>
                    <p><b>{giras[0].titulo}</b> — {dataBR(giras[0].data_gira)}</p>
                    <p>{pendenciasConfirmacao.length} filho(s) ainda sem confirmação.</p>
                    <div className="mini-list">
                      {pendenciasConfirmacao.slice(0, 5).map(f => (
                        <div className="mini-row" key={f.id}>
                          <strong>{f.nome}</strong>
                          {f.telefone && (
                            <a
                              className="button-link small"
                              href={whatsappHref(
                                f.telefone,
                                `Olá, ${f.nome}! Lembrando da ${giras[0].titulo} no dia ${dataBR(giras[0].data_gira)}. Por favor, confirme sua presença na Área do Filho.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Lembrar
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p>Nenhuma próxima gira cadastrada.</p>}
              </article>
            </section>

            <section className="card wide">
              <span className="tag">GESTÃO DO TEMPLO</span>
              <h3>Ações rápidas</h3>
              <div className="admin-shortcuts">
                <button onClick={gerarMensalidadesAgora}>⚡ Gerar mensalidades</button>
                <button onClick={() => setPagina('filhos')}>👥 Filhos</button>
                <button onClick={() => setPagina('mensalidades')}>💰 Financeiro</button>
                <button onClick={() => setPagina('giras')}>📅 Giras</button>
                <button onClick={() => setPagina('materiais')}>🧳 Materiais</button>
                <button onClick={() => setPagina('avisos')}>📢 Avisos</button>
                <button onClick={() => setPagina('estudos')}>📚 Estudos</button>
                <button onClick={() => setPagina('sugestoes')}>💡 Sugestões</button>
              </div>
            </section>
          </>
        )}

        {pagina === 'solicitacoes' && (
          <section className="card wide">
            <span className="tag">🔔 CADASTROS</span>
            <h3>Solicitações de Cadastro</h3>
            <p className="muted">
              O filho envia os próprios dados. Você confere e define cargo, vencimento e mensalidade antes de liberar o acesso.
            </p>
            <div className="list" style={{ marginTop: 18 }}>
              {solicitacoesCadastro.map(item => (
                <div className="list-item" key={item.id}>
                  <div>
                    <strong>{item.nome}</strong>
                    <p>{item.email} • {item.telefone || 'Sem telefone'}</p>
                    <small>
                      Nascimento: {dataBR(item.data_nascimento)} • Status: {item.status}
                      {item.status === 'aprovado' && ` • ${item.cargo || 'Sem cargo'} • ${dinheiro(item.valor_mensalidade || 0)}`}
                    </small>
                  </div>
                  <div className="actions">
                    {item.status === 'pendente' && (
                      <>
                        <button className="small" onClick={() => aprovarSolicitacao(item)}>Aprovar</button>
                        <button className="danger small" onClick={() => recusarSolicitacao(item)}>Recusar</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!solicitacoesCadastro.length && <p>Nenhuma solicitação recebida.</p>}
            </div>
          </section>
        )}

        {pagina === 'filhos' && (
          <section className="card wide">
            <div className="section-heading">
              <div>
                <span className="tag">CADASTRO</span>
                <h3>Filhos da Casa</h3>
              </div>
              <input
                className="search-input"
                placeholder="Buscar filho pelo nome..."
                value={buscaFilho}
                onChange={e => setBuscaFilho(e.target.value)}
              />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Venc.</th>
                    <th>Mensalidade</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filhos
                    .filter(f =>
                      String(f.nome || '')
                        .toLowerCase()
                        .includes(buscaFilho.toLowerCase())
                    )
                    .map(f => (
                    <tr key={f.id}>
                      <td>{f.nome}</td>
                      <td>{f.cargo || '—'}</td>
                      <td>Dia {f.dia_vencimento || '—'}</td>
                      <td>{dinheiro(f.valor_mensalidade)}</td>
                      <td>{f.ativo ? 'Ativo' : 'Inativo'}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="small"
                            onClick={() => {
                              setEditFilho(null)
                              setFichaFilho({ ...f })
                            }}
                          >
                            Ver ficha
                          </button>
                          <button
                            className="small ghost"
                            onClick={() => {
                              setFichaFilho(null)
                              setEditFilho({ ...f })
                            }}
                          >
                            Editar
                          </button>
                          {f.telefone && (
                            <a
                              className="button-link small ghost"
                              href={whatsappHref(
                                f.telefone,
                                `Olá, ${f.nome}! Passando um aviso do Templo T.U Caboclo Tupinambá Ode Leke.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editFilho && (
              <form className="form-grid" onSubmit={salvarFilho}>
                <h3 className="form-title">
                  Editar {editFilho.nome}
                </h3>

                <label>
                  Nome
                  <input
                    value={editFilho.nome || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        nome: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Telefone
                  <input
                    value={editFilho.telefone || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        telefone: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Data de nascimento
                  <input
                    type="date"
                    value={editFilho.data_nascimento || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        data_nascimento: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Cargo
                  <input
                    value={editFilho.cargo || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        cargo: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Dia do vencimento
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editFilho.dia_vencimento || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        dia_vencimento: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Valor mensalidade
                  <input
                    type="number"
                    step="0.01"
                    value={editFilho.valor_mensalidade || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        valor_mensalidade: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Data de entrada
                  <input
                    type="date"
                    value={editFilho.data_entrada || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        data_entrada: e.target.value
                      })
                    }
                  />
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!editFilho.ativo}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        ativo: e.target.checked
                      })
                    }
                  />
                  Filho ativo
                </label>

                <label className="full">
                  Observações
                  <textarea
                    value={editFilho.observacoes || ''}
                    onChange={e =>
                      setEditFilho({
                        ...editFilho,
                        observacoes: e.target.value
                      })
                    }
                  />
                </label>

                <div className="actions full">
                  <button type="submit">Salvar alterações</button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setEditFilho(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {fichaFilho && (
              <div className="profile-sheet">
                <div className="section-heading">
                  <div>
                    <span className="tag">FICHA COMPLETA</span>
                    <h3>{fichaFilho.nome}</h3>
                    <p>{fichaFilho.cargo || 'Sem cargo informado'}</p>
                  </div>
                  <div className="actions">
                    {fichaFilho.telefone && (
                      <a
                        className="button-link small"
                        href={whatsappHref(fichaFilho.telefone)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      className="ghost small"
                      onClick={() => setFichaFilho(null)}
                    >
                      Fechar ficha
                    </button>
                  </div>
                </div>

                <div className="profile-grid">
                  <div>
                    <small>Telefone</small>
                    <strong>{fichaFilho.telefone || '—'}</strong>
                  </div>
                  <div>
                    <small>Nascimento</small>
                    <strong>{dataBR(fichaFilho.data_nascimento)}</strong>
                  </div>
                  <div>
                    <small>Entrada na casa</small>
                    <strong>{dataBR(fichaFilho.data_entrada)}</strong>
                  </div>
                  <div>
                    <small>Mensalidade</small>
                    <strong>{dinheiro(fichaFilho.valor_mensalidade)}</strong>
                  </div>
                  <div>
                    <small>Vencimento</small>
                    <strong>Dia {fichaFilho.dia_vencimento || '—'}</strong>
                  </div>
                  <div>
                    <small>Status</small>
                    <strong>{fichaFilho.ativo ? 'Ativo' : 'Inativo'}</strong>
                  </div>
                </div>

                {(() => {
                  const freq = frequenciaFilho(fichaFilho.id)
                  return (
                    <div className="gira-stats" style={{ marginTop: 18, marginBottom: 22 }}>
                      <div>
                        <small>PRESENÇAS</small>
                        <strong>{freq.presentes}</strong>
                      </div>
                      <div>
                        <small>FALTAS</small>
                        <strong>{freq.faltas}</strong>
                      </div>
                      <div>
                        <small>FREQUÊNCIA</small>
                        <strong>{freq.percentual}%</strong>
                      </div>
                    </div>
                  )
                })()}

                <p className="answer">
                  <b>🔒 Observação interna:</b>{' '}
                  {fichaFilho.observacoes || 'Nenhuma observação interna cadastrada.'}
                </p>

                <h3>Histórico financeiro</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Competência</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Pago</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensalidades
                        .filter(m => m.filho_id === fichaFilho.id)
                        .map(m => (
                          <tr key={m.id}>
                            <td>{mesBR(m.competencia)}</td>
                            <td>{dataBR(m.vencimento)}</td>
                            <td>{dinheiro(m.valor)}</td>
                            <td>{dinheiro(m.valor_pago)}</td>
                            <td>{m.situacao || statusMensalidade(m)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <h3>Histórico de presença</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Gira</th>
                        <th>Confirmou</th>
                        <th>Presença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presencas
                        .filter(p => p.filho_id === fichaFilho.id)
                        .map(p => {
                          const gira = giras.find(g => g.id === p.gira_id)
                          return (
                            <tr key={p.id}>
                              <td>{gira?.titulo || `Gira #${p.gira_id}`}</td>
                              <td>{p.confirmado ? 'Sim' : 'Não'}</td>
                              <td>{p.presente ? 'Presente' : 'Não marcado'}</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {pagina === 'mensalidades' && (
          <section className="card wide">
            <div className="section-heading">
              <div>
                <span className="tag">FINANCEIRO</span>
                <h3>Mensalidades e Pagamentos</h3>
              </div>
              <button onClick={gerarMensalidadesAgora}>
                Gerar mensalidades do mês
              </button>
            </div>

            <div className="filter-bar">
              {[
                ['todos', 'Todos'],
                ['pagos', 'Pagos'],
                ['pendentes', 'Pendentes'],
                ['atrasados', 'Atrasados'],
                ['parciais', 'Parciais']
              ].map(([valor, rotulo]) => (
                <button
                  key={valor}
                  className={filtroFinanceiro === valor ? 'active-filter' : 'ghost'}
                  onClick={() => setFiltroFinanceiro(valor)}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Filho</th>
                    <th>Competência</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Pago</th>
                    <th>Situação</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {mensalidades
                    .filter(m => {
                      const st = m.situacao || statusMensalidade(m)
                      if (filtroFinanceiro === 'pagos') return st === 'Pago'
                      if (filtroFinanceiro === 'pendentes') return st === 'Pendente'
                      if (filtroFinanceiro === 'atrasados') return st.includes('Atrasado')
                      if (filtroFinanceiro === 'parciais') return st.includes('Parcial')
                      return true
                    })
                    .map(m => {
                    const st = m.situacao || statusMensalidade(m)

                    return (
                      <tr key={m.id}>
                        <td>{m.nome || '—'}</td>
                        <td>{mesBR(m.competencia)}</td>
                        <td>{dataBR(m.vencimento)}</td>
                        <td>{dinheiro(m.valor)}</td>
                        <td>{dinheiro(m.valor_pago)}</td>
                        <td>
                          <strong
                            className={
                              'status ' +
                              st.toLowerCase().replaceAll(' ', '-')
                            }
                          >
                            {st}
                          </strong>
                        </td>
                        <td>
                          {Number(m.valor_pago || 0) <
                            Number(m.valor || 0) && (
                            <button
                              className="small"
                              onClick={() => abrirPagamento(m)}
                            >
                              Receber
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <h3 className="subheading">Histórico de recebimentos</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Filho</th>
                    <th>Valor</th>
                    <th>Forma</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map(p => {
                    const mens = mensalidades.find(m => m.id === p.mensalidade_id)
                    return (
                      <tr key={p.id}>
                        <td>{dataBR(p.data_pagamento)}</td>
                        <td>{mens?.nome || '—'}</td>
                        <td>{dinheiro(p.valor)}</td>
                        <td>{p.forma_pagamento || '—'}</td>
                        <td>{p.observacoes || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {pagina === 'giras' && (
          <section className="card wide">
            <span className="tag">CALENDÁRIO</span>
            <h3>Giras</h3>

            <form className="form-grid" onSubmit={criarGira}>
              <label>
                Título
                <input
                  value={novaGira.titulo || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      titulo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Linha
                <input
                  value={novaGira.linha || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      linha: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Data
                <input
                  type="date"
                  value={novaGira.data_gira || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      data_gira: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Horário
                <input
                  type="time"
                  value={novaGira.horario || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      horario: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Local
                <input
                  value={novaGira.local || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      local: e.target.value
                    })
                  }
                />
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={!!novaGira.aberta_publico}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      aberta_publico: e.target.checked
                    })
                  }
                />
                Aberta ao público
              </label>

              <label className="full">
                Orientações
                <textarea
                  value={novaGira.orientacoes || ''}
                  onChange={e =>
                    setNovaGira({
                      ...novaGira,
                      orientacoes: e.target.value
                    })
                  }
                />
              </label>

              <button type="submit">Cadastrar gira</button>
            </form>

            <div className="list">
              {giras.map(g => (
                <div className="list-item" key={g.id}>
                  <div>
                    <strong>{g.titulo}</strong>
                    <p>
                      {dataBR(g.data_gira)} •{' '}
                      {String(g.horario || '').slice(0, 5)}
                    </p>
                    <small>{g.orientacoes}</small>
                  </div>

                  <div className="actions">
                    <button
                      className="small ghost"
                      onClick={() => editarGira(g)}
                    >
                      Editar
                    </button>
                    <button
                      className="danger small"
                      onClick={() => excluirGira(g.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="central-gira">
              <div className="section-heading">
                <div>
                  <span className="tag">CENTRAL DA GIRA</span>
                  <h3>Organização e presença</h3>
                </div>
                <select
                  className="gira-select"
                  value={giraSelecionada}
                  onChange={e => setGiraSelecionada(e.target.value)}
                >
                  <option value="">Todas as giras</option>
                  {giras.map(g => (
                    <option key={g.id} value={String(g.id)}>
                      {g.titulo} - {dataBR(g.data_gira)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gira-stats">
                <div>
                  <small>CONFIRMADOS</small>
                  <strong>
                    {presencas.filter(p =>
                      (!giraSelecionada || String(p.gira_id) === giraSelecionada) &&
                      p.confirmado
                    ).length}
                  </strong>
                </div>
                <div>
                  <small>PRESENTES</small>
                  <strong>
                    {presencas.filter(p =>
                      (!giraSelecionada || String(p.gira_id) === giraSelecionada) &&
                      p.presente
                    ).length}
                  </strong>
                </div>
                <div>
                  <small>REGISTROS</small>
                  <strong>
                    {presencas.filter(p =>
                      !giraSelecionada || String(p.gira_id) === giraSelecionada
                    ).length}
                  </strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 24 }}>
              <span className="tag">👥 FUNÇÕES DA GIRA</span>
              <h3>Escala e responsabilidades</h3>
              <form className="form-grid" onSubmit={salvarFuncaoGira}>
                <label>
                  Gira
                  <select
                    value={novaFuncaoGira.gira_id || ''}
                    onChange={e => setNovaFuncaoGira({ ...novaFuncaoGira, gira_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {giras.map(g => (
                      <option key={g.id} value={g.id}>{g.titulo} - {dataBR(g.data_gira)}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Filho
                  <select
                    value={novaFuncaoGira.filho_id || ''}
                    onChange={e => setNovaFuncaoGira({ ...novaFuncaoGira, filho_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {filhos.filter(f => f.ativo).map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Função
                  <input
                    placeholder="Ex.: Cambono, Tronqueira, Cozinha..."
                    value={novaFuncaoGira.funcao || ''}
                    onChange={e => setNovaFuncaoGira({ ...novaFuncaoGira, funcao: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Observação
                  <input
                    placeholder="Opcional"
                    value={novaFuncaoGira.observacoes || ''}
                    onChange={e => setNovaFuncaoGira({ ...novaFuncaoGira, observacoes: e.target.value })}
                  />
                </label>

                <button type="submit">Salvar função</button>
              </form>

              <div className="list">
                {funcoesGira
                  .filter(x => !giraSelecionada || String(x.gira_id) === giraSelecionada)
                  .map(x => {
                    const f = filhos.find(y => y.id === x.filho_id)
                    const g = giras.find(y => String(y.id) === String(x.gira_id))
                    return (
                      <div className="list-item" key={x.id}>
                        <div>
                          <strong>{f?.nome || x.nome || 'Filho da casa'} — {x.funcao}</strong>
                          <p>{g?.titulo || x.gira_titulo || `Gira #${x.gira_id}`}</p>
                          {x.observacoes && <small>{x.observacoes}</small>}
                        </div>
                        <button className="danger small" onClick={() => excluirFuncaoGira(x.id)}>
                          Excluir
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>

            <h3 style={{ marginTop: 30 }}>Presenças e confirmações</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Filho</th>
                    <th>Gira</th>
                    <th>Confirmou</th>
                    <th>Presença</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {presencas
                    .filter(p =>
                      !giraSelecionada || String(p.gira_id) === giraSelecionada
                    )
                    .map(p => {
                    const filho = filhos.find(f => f.id === p.filho_id)
                    const gira = giras.find(g => g.id === p.gira_id)

                    return (
                      <tr key={p.id}>
                        <td>{filho?.nome || '—'}</td>
                        <td>{gira?.titulo || `Gira #${p.gira_id}`}</td>
                        <td>{p.confirmado ? 'Sim' : 'Não'}</td>
                        <td>{p.presente ? 'Presente' : 'Não marcado'}</td>
                        <td>
                          <div className="actions">
                            <button
                              className="small"
                              onClick={() => marcarPresencaAdmin(p, true)}
                            >
                              Presente
                            </button>
                            <button
                              className="small ghost"
                              onClick={() => marcarPresencaAdmin(p, false)}
                            >
                              Faltou
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {pagina === 'materiais' && (
          <section className="card wide">
            <span className="tag">ORGANIZAÇÃO</span>
            <h3>Materiais das Giras</h3>

            <p className="muted">
              Escolha a gira e o cargo uma vez. Para cadastrar vários itens,
              digite um material por linha.
            </p>

            <form className="form-grid" onSubmit={criarMaterial}>
              <label>
                Gira
                <select
                  value={novoMaterial.gira_id || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      gira_id: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Selecione a gira</option>
                  {giras.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.titulo} - {dataBR(g.data_gira)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Cargo / Função
                <select
                  value={novoMaterial.cargo || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      cargo: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Selecione o cargo</option>
                  {cargosDisponiveis.map(cargo => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full">
                Materiais
                <textarea
                  rows="7"
                  placeholder={'Digite um por linha. Ex.:\nPemba branca\nToalha\nGarrafinha de água\nIsqueiro\nCaderno\nCaneta'}
                  value={novoMaterial.itens || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      itens: e.target.value
                    })
                  }
                  required
                />
                <small>
                  Você pode cadastrar todos os materiais desse cargo de uma só vez.
                </small>
              </label>

              <label className="full">
                Observações para este grupo
                <textarea
                  placeholder="Ex.: Levar o kit completo e chegar com antecedência."
                  value={novoMaterial.observacoes || ''}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      observacoes: e.target.value
                    })
                  }
                />
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={novoMaterial.obrigatorio !== false}
                  onChange={e =>
                    setNovoMaterial({
                      ...novoMaterial,
                      obrigatorio: e.target.checked
                    })
                  }
                />
                Material obrigatório
              </label>

              <button type="submit">Adicionar materiais</button>
            </form>

            <div className="list">
              {materiais.length === 0 && (
                <p>Nenhum material cadastrado.</p>
              )}

              {materiais.map(m => {
                const gira = giras.find(g => Number(g.id) === Number(m.gira_id))

                return (
                  <div className="list-item" key={m.id}>
                    <div>
                      <strong>
                        {m.obrigatorio === false ? '○' : '✓'} {m.item}
                      </strong>
                      <p>
                        {gira
                          ? `${gira.titulo} • ${dataBR(gira.data_gira)}`
                          : 'Gira'}{' '}
                        • {m.cargo}
                      </p>
                      {m.observacoes && <small>{m.observacoes}</small>}
                    </div>

                    <div className="actions">
                      <button
                        className="small ghost"
                        onClick={() => editarMaterial(m)}
                      >
                        Editar
                      </button>
                      <button
                        className="danger small"
                        onClick={() => excluirMaterial(m.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {pagina === 'avisos' && (
          <section className="card wide">
            <span className="tag">COMUNICAÇÃO</span>
            <h3>Avisos</h3>

            <form className="form-grid" onSubmit={criarAviso}>
              <label>
                Título
                <input
                  value={novoAviso.titulo || ''}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      titulo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Público
                <select
                  value={novoAviso.publico || 'filhos'}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      publico: e.target.value
                    })
                  }
                >
                  <option value="filhos">Filhos da casa</option>
                  <option value="todos">Todos</option>
                </select>
              </label>

              <label className="full">
                Mensagem
                <textarea
                  value={novoAviso.mensagem || ''}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      mensagem: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={!!novoAviso.importante}
                  onChange={e =>
                    setNovoAviso({
                      ...novoAviso,
                      importante: e.target.checked
                    })
                  }
                />
                Aviso importante
              </label>

              <button type="submit">Publicar aviso</button>
            </form>

            <div className="list">
              {avisos.map(a => (
                <div className="list-item" key={a.id}>
                  <div>
                    <strong>
                      {a.importante ? '⚠️ ' : '📢 '}
                      {a.titulo}
                    </strong>
                    <p>{a.mensagem}</p>
                  </div>

                  <div className="actions">
                    <button
                      className="small ghost"
                      onClick={() => editarAviso(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="danger small"
                      onClick={() => excluirAviso(a.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {pagina === 'arquivos' && (
          <section className="card wide">
            <span className="tag">☁️ NUVEM PRIVADA</span>
            <h3>Arquivos do Templo</h3>
            <p className="muted">
              Guarde comprovantes, documentos internos e novos materiais sem depender do computador.
            </p>

            <form className="form-grid" onSubmit={enviarArquivoNuvem}>
              <label className="full">
                Arquivo
                <input
                  ref={arquivoInputRef}
                  type="file"
                  onChange={e => setUploadNuvem({
                    ...uploadNuvem,
                    arquivo: e.target.files?.[0] || null
                  })}
                  required
                />
              </label>

              <label>
                Categoria
                <select
                  value={uploadNuvem.categoria}
                  onChange={e => setUploadNuvem({...uploadNuvem, categoria: e.target.value})}
                >
                  <option value="documento">Documento interno</option>
                  <option value="comprovante">Comprovante</option>
                  <option value="apostila">Apostila / material</option>
                  <option value="outro">Outro</option>
                </select>
              </label>

              <label>
                Vincular a um filho (opcional)
                <select
                  value={uploadNuvem.filho_id}
                  onChange={e => setUploadNuvem({...uploadNuvem, filho_id: e.target.value})}
                >
                  <option value="">Sem vínculo</option>
                  {filhos.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </label>

              <label>
                Vincular a uma mensalidade (opcional)
                <select
                  value={uploadNuvem.mensalidade_id}
                  onChange={e => setUploadNuvem({...uploadNuvem, mensalidade_id: e.target.value})}
                >
                  <option value="">Sem vínculo</option>
                  {mensalidades.slice(0, 100).map(m => {
                    const f = filhos.find(x => x.id === m.filho_id)
                    return (
                      <option key={m.id} value={m.id}>
                        {f?.nome || 'Filho'} — {String(m.competencia || '').slice(0, 7)}
                      </option>
                    )
                  })}
                </select>
              </label>

              <label className="full">
                Descrição
                <textarea
                  value={uploadNuvem.descricao}
                  onChange={e => setUploadNuvem({...uploadNuvem, descricao: e.target.value})}
                  placeholder="Ex.: comprovante da mensalidade de outubro"
                />
              </label>

              <button disabled={enviandoArquivo}>
                {enviandoArquivo ? 'Enviando...' : 'Enviar para a nuvem'}
              </button>
            </form>

            <div className="list" style={{ marginTop: 22 }}>
              {arquivosNuvem.map(item => {
                const f = filhos.find(x => x.id === item.filho_id)
                return (
                  <div className="list-item" key={item.id}>
                    <div>
                      <strong>{item.nome}</strong>
                      <p>{item.categoria}{f ? ` • ${f.nome}` : ''}</p>
                      {item.descricao && <small>{item.descricao}</small>}
                    </div>
                    <div className="actions">
                      <button className="small" onClick={() => abrirArquivoNuvem(item)}>Abrir</button>
                      <button className="danger small" onClick={() => excluirArquivoNuvem(item)}>Excluir</button>
                    </div>
                  </div>
                )
              })}
              {!arquivosNuvem.length && <p>Nenhum arquivo enviado ainda.</p>}
            </div>
          </section>
        )}

        {pagina === 'backup' && (
          <section className="card wide">
            <span className="tag">💾 BACKUP / EXPORTAÇÃO</span>
            <h3>Exportar dados do sistema</h3>
            <p className="muted">
              Baixe cópias em CSV para guardar fora do sistema ou abrir no Excel.
            </p>

            <div className="actions" style={{ marginTop: 18 }}>
              <button onClick={() => exportarCSV('filhos', filhos)}>Exportar filhos</button>
              <button onClick={() => exportarCSV('mensalidades', mensalidades)}>Exportar mensalidades</button>
              <button onClick={() => exportarCSV('pagamentos', pagamentos)}>Exportar pagamentos</button>
              <button onClick={() => exportarCSV('giras', giras)}>Exportar giras</button>
              <button onClick={() => exportarCSV('presencas', presencas)}>Exportar presenças</button>
              <button onClick={() => exportarCSV('funcoes_gira', funcoesGira)}>Exportar funções</button>
            </div>

            <div className="answer" style={{ marginTop: 22 }}>
              <strong>Importante:</strong> esta tela cria cópias dos dados para você.
              Os dados principais continuam armazenados no Supabase.
            </div>
          </section>
        )}

        {pagina === 'estudos' && (
          <section className="card wide">
            <span className="tag">CONHECIMENTO</span>
            <h3>Biblioteca de Formação</h3>

            <div className="list-item" style={{ marginBottom: 18 }}>
              <div>
                <strong>📚 Formação interna do Templo</strong>
                <p>
                  Carregue de uma vez os 9 Materiais de Apoio que já faziam
                  parte do sistema anterior. O botão não duplica materiais
                  que já estejam cadastrados.
                </p>
              </div>
              <div className="actions">
                <button type="button" onClick={carregarEstudosBase}>
                  Carregar 9 estudos
                </button>
              </div>
            </div>

            <form className="form-grid" onSubmit={criarEstudo}>
              <label>
                Título
                <input
                  value={novoEstudo.titulo || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      titulo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Categoria
                <input
                  placeholder="Ex.: Fundamentos"
                  value={novoEstudo.categoria || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      categoria: e.target.value
                    })
                  }
                />
              </label>

              <label className="full">
                Descrição
                <textarea
                  value={novoEstudo.descricao || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      descricao: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Link da apostila / arquivo
                <input
                  type="url"
                  placeholder="https://..."
                  value={novoEstudo.arquivo_url || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      arquivo_url: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Link externo
                <input
                  type="url"
                  placeholder="https://..."
                  value={novoEstudo.link_externo || ''}
                  onChange={e =>
                    setNovoEstudo({
                      ...novoEstudo,
                      link_externo: e.target.value
                    })
                  }
                />
              </label>

              <button type="submit">Publicar novo estudo</button>
            </form>

            <h3 style={{ marginTop: 30 }}>Conteúdos publicados</h3>

            <div className="list">
              {estudos.length === 0 && (
                <p>
                  Nenhum conteúdo publicado. Clique em “Carregar 9 estudos”
                  para trazer a formação inicial.
                </p>
              )}

              {[...estudos]
                .sort((a, b) =>
                  Number(a.ordem || 0) - Number(b.ordem || 0)
                )
                .map(e => (
                  <div className="list-item" key={e.id}>
                    <div>
                      <strong>📚 {e.titulo}</strong>
                      <p>{e.descricao}</p>
                      <small>{e.categoria || 'Geral'}</small>
                    </div>

                    <div className="actions">
                      {ESTUDOS_CONTEUDO_COMPLETO[String(Number(e.ordem || 0))] && (
                        <button className="small" type="button" onClick={() => setEstudoAberto(e)}>
                          Ler apostila
                        </button>
                      )}

                      {e.arquivo_url && (
                        <a
                          className="button-link"
                          href={e.arquivo_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir apostila
                        </a>
                      )}

                      {e.link_externo && (
                        <a
                          className="button-link"
                          href={e.link_externo}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Acessar conteúdo
                        </a>
                      )}

                      <button
                        className="small ghost"
                        onClick={() => editarEstudo(e)}
                      >
                        Editar
                      </button>
                      <button
                        className="danger small"
                        onClick={() => excluirEstudo(e.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {pagina === 'sugestoes' && (
          <section className="card wide">
            <span className="tag">FILHOS DA CASA</span>
            <h3>Sugestões Recebidas</h3>

            <div className="list">
              {sugestoes.length === 0 && (
                <p>Nenhuma sugestão recebida.</p>
              )}

              {sugestoes.map(s => {
                const filho = filhos.find(f => f.id === s.filho_id)

                return (
                  <div className="list-item" key={s.id}>
                    <div>
                      <strong>💡 {s.assunto}</strong>
                      <p>{s.mensagem}</p>
                      <small>
                        {s.anonima
                          ? 'Sugestão anônima'
                          : filho?.nome || 'Filho da casa'}
                        {' • '}
                        {s.status || 'nova'}
                      </small>

                      {s.resposta && (
                        <p className="answer">
                          <b>Resposta:</b> {s.resposta}
                        </p>
                      )}
                    </div>

                    <button
                      className="small"
                      onClick={() => responderSugestao(s)}
                    >
                      Responder
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}
        <EstudoLeitor estudo={estudoAberto} onClose={() => setEstudoAberto(null)} />

        {pagamentoModal && (
          <div className="modal-backdrop" onClick={() => setPagamentoModal(null)}>
            <section className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="section-heading">
                <div>
                  <span className="tag">REGISTRAR RECEBIMENTO</span>
                  <h3>{pagamentoModal.nome || 'Filho da casa'}</h3>
                </div>
                <button className="ghost small" onClick={() => setPagamentoModal(null)}>
                  Fechar
                </button>
              </div>

              <div className="payment-summary">
                <div>
                  <small>Mensalidade</small>
                  <strong>{dinheiro(pagamentoModal.valor)}</strong>
                </div>
                <div>
                  <small>Já pago</small>
                  <strong>{dinheiro(pagamentoModal.valor_pago)}</strong>
                </div>
                <div>
                  <small>Saldo</small>
                  <strong>
                    {dinheiro(
                      Math.max(
                        0,
                        Number(pagamentoModal.valor || 0) -
                          Number(pagamentoModal.valor_pago || 0)
                      )
                    )}
                  </strong>
                </div>
              </div>

              <form className="form-grid" onSubmit={salvarPagamento}>
                <label>
                  Valor recebido
                  <input
                    inputMode="decimal"
                    value={formPagamento.valor}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        valor: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Data do pagamento
                  <input
                    type="date"
                    value={formPagamento.data_pagamento}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        data_pagamento: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Forma de pagamento
                  <select
                    value={formPagamento.forma_pagamento}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        forma_pagamento: e.target.value
                      })
                    }
                  >
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão</option>
                    <option>Transferência</option>
                    <option>Outro</option>
                  </select>
                </label>

                <label className="full">
                  Observações
                  <textarea
                    placeholder="Opcional"
                    value={formPagamento.observacoes}
                    onChange={e =>
                      setFormPagamento({
                        ...formPagamento,
                        observacoes: e.target.value
                      })
                    }
                  />
                </label>

                <div className="actions full">
                  <button type="submit">Confirmar pagamento</button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setPagamentoModal(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

      </main>
    )
  }

  const proximaGira = proximaGiraSistema
  const mensalidadeAtual = mensalidades[0]
  const statusAtual = statusMensalidade(mensalidadeAtual)

  return (
    <main className="app">
      <header>
        <div>
          <p className="eyebrow">
            TEMPLO T.U CABOCLO TUPINAMBÁ ODE LEKE
          </p>

          <h2>
            Olá, {perfil.nome || 'Filho da Casa'} 👋
          </h2>

          <p>{perfil.cargo || 'Membro'}</p>
        </div>

        <button className="ghost" onClick={sair}>
          Sair
        </button>
      </header>

      <nav className="menu">
        <button onClick={() => setPagina('dashboard')}>
          🏠 Início
        </button>
        <button onClick={() => setPagina('historico')}>
          💰 Mensalidades
        </button>
        <button onClick={() => setPagina('calendario')}>
          📅 Giras
        </button>
        <button onClick={() => setPagina('avisos')}>
          📢 Avisos
        </button>
        <button onClick={() => setPagina('estudos')}>
          📚 Estudos
        </button>
        <button onClick={() => setPagina('sugestoes')}>
          💡 Sugestões
        </button>
      </nav>

      {pagina === 'dashboard' && (
        <>
          <section className="grid">
            <article className="card hero">
              <span className="tag">PRÓXIMA GIRA</span>

              <h3>
                {proximaGira?.titulo || 'Nenhuma gira cadastrada'}
              </h3>

              {proximaGira && (
                <>
                  <p className="big">
                    {dataBR(proximaGira.data_gira)} •{' '}
                    {String(proximaGira.horario || '').slice(0, 5)}
                  </p>

                  <p>{proximaGira.orientacoes}</p>

                  {(() => {
                    const minhaFuncao = funcoesGira.find(
                      x => String(x.gira_id) === String(proximaGira.id)
                    )

                    return minhaFuncao ? (
                      <div
                        style={{
                          margin: '18px 0',
                          padding: '16px',
                          border: '1px solid rgba(238, 190, 75, .35)',
                          borderRadius: 14,
                          background: 'rgba(238, 190, 75, .06)'
                        }}
                      >
                        <span className="tag">👥 SUA FUNÇÃO NESTA GIRA</span>
                        <h3 style={{ marginTop: 8, marginBottom: 6 }}>
                          {minhaFuncao.funcao}
                        </h3>
                        {minhaFuncao.observacoes && (
                          <p style={{ margin: 0 }}>{minhaFuncao.observacoes}</p>
                        )}
                      </div>
                    ) : null
                  })()}

                  <button
                    className="small"
                    onClick={() => confirmarPresenca(proximaGira)}
                  >
                    Confirmar minha presença
                  </button>
                </>
              )}
            </article>

            <article className="card">
              <span className="tag">MENSALIDADE</span>

              <h3>
                {dinheiro(mensalidadeAtual?.valor || 0)}
              </h3>

              <p>
                Vencimento:{' '}
                {mensalidadeAtual
                  ? dataBR(mensalidadeAtual.vencimento)
                  : '—'}
              </p>

              <strong
                className={
                  'status ' +
                  statusAtual.toLowerCase().replaceAll(' ', '-')
                }
              >
                {statusAtual}
              </strong>
            </article>
          </section>

          {avisos.filter(a => a.importante).slice(0, 1).map(a => (
            <article className="card wide important-card" key={a.id}>
              <span className="tag">AVISO IMPORTANTE</span>
              <h3>{a.titulo}</h3>
              <p>{a.mensagem}</p>
            </article>
          ))}

          <article className="card wide">
            <span className="tag">O QUE LEVAR</span>
            <h3>Materiais para esta gira</h3>

            <div className="items">
              {materiais.length ? (
                materiais.map(m => (
                  <div className="item" key={m.id}>
                    ✓ {m.item}
                    {m.observacoes && (
                      <small> — {m.observacoes}</small>
                    )}
                  </div>
                ))
              ) : (
                <p>Nenhum material específico cadastrado.</p>
              )}
            </div>
          </article>
        </>
      )}

      {pagina === 'historico' && (
        <section className="card wide">
          <span className="tag">FINANCEIRO</span>
          <h3>Minhas Mensalidades</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Pago</th>
                  <th>Situação</th>
                </tr>
              </thead>

              <tbody>
                {mensalidades.map(m => (
                  <tr key={m.id}>
                    <td>{mesBR(m.competencia)}</td>
                    <td>{dataBR(m.vencimento)}</td>
                    <td>{dinheiro(m.valor)}</td>
                    <td>{dinheiro(m.valor_pago)}</td>
                    <td>{statusMensalidade(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pagina === 'calendario' && (
        <section className="card wide">
          <span className="tag">AGENDA</span>
          <h3>Próximas Giras</h3>

          <div className="list">
            {giras.map(g => (
              <div className="list-item" key={g.id}>
                <div>
                  <strong>{g.titulo}</strong>
                  <p>
                    {dataBR(g.data_gira)} •{' '}
                    {String(g.horario || '').slice(0, 5)}
                  </p>
                  <small>{g.orientacoes}</small>
                </div>

                <button
                  className="small"
                  onClick={() => confirmarPresenca(g)}
                >
                  Confirmar presença
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {pagina === 'avisos' && (
        <section className="card wide">
          <span className="tag">COMUNICADOS</span>
          <h3>Avisos da Casa</h3>

          <div className="list">
            {avisos.length === 0 && <p>Nenhum aviso publicado.</p>}

            {avisos.map(a => (
              <div className="list-item" key={a.id}>
                <div>
                  <strong>
                    {a.importante ? '⚠️ ' : '📢 '}
                    {a.titulo}
                  </strong>
                  <p>{a.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pagina === 'estudos' && (
        <section className="card wide">
          <span className="tag">CONHECIMENTO</span>
          <h3>Estudos e Apostilas</h3>

          <div className="list">
            {estudos.length === 0 && (
              <p>Nenhum conteúdo publicado.</p>
            )}

            {estudos.map(e => (
              <div className="list-item" key={e.id}>
                <div>
                  <strong>📚 {e.titulo}</strong>
                  <p>{e.descricao}</p>
                  <small>{e.categoria}</small>
                </div>

                <div className="actions">
                  {ESTUDOS_CONTEUDO_COMPLETO[String(Number(e.ordem || 0))] && (
                    <button className="small" type="button" onClick={() => setEstudoAberto(e)}>
                      Abrir apostila
                    </button>
                  )}

                  {e.arquivo_url && (
                    <a
                      className="button-link"
                      href={e.arquivo_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir apostila
                    </a>
                  )}

                  {e.link_externo && (
                    <a
                      className="button-link"
                      href={e.link_externo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Acessar conteúdo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pagina === 'sugestoes' && (
        <section className="card wide">
          <span className="tag">SUA VOZ</span>
          <h3>Sugestões para o Templo</h3>

          <form className="form-grid" onSubmit={enviarSugestao}>
            <label>
              Assunto
              <input
                value={novaSugestao.assunto}
                onChange={e =>
                  setNovaSugestao({
                    ...novaSugestao,
                    assunto: e.target.value
                  })
                }
                required
              />
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={novaSugestao.anonima}
                onChange={e =>
                  setNovaSugestao({
                    ...novaSugestao,
                    anonima: e.target.checked
                  })
                }
              />
              Enviar como anônima
            </label>

            <label className="full">
              Mensagem
              <textarea
                value={novaSugestao.mensagem}
                onChange={e =>
                  setNovaSugestao({
                    ...novaSugestao,
                    mensagem: e.target.value
                  })
                }
                required
              />
            </label>

            <button type="submit">Enviar sugestão</button>
          </form>

          <div className="list">
            {sugestoes.map(s => (
              <div className="list-item" key={s.id}>
                <div>
                  <strong>{s.assunto}</strong>
                  <p>{s.mensagem}</p>
                  <small>Status: {s.status || 'nova'}</small>

                  {s.resposta && (
                    <p className="answer">
                      <b>Resposta do Templo:</b> {s.resposta}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <EstudoLeitor estudo={estudoAberto} onClose={() => setEstudoAberto(null)} />

    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
