/* ============================================================
 * FAROL: Dados fictícios do protótipo (projeto acadêmico FIAP)
 * ------------------------------------------------------------
 * - Todas as ruas, bairros, números e pessoas são INVENTADOS.
 * - As coordenadas ficam próximas entre si (área de ~2 km de
 *   raio) para o mapa abrir com tudo visível.
 * - Para usar outra cidade: edite as coordenadas e os nomes
 *   abaixo. Nenhum outro arquivo precisa mudar.
 * - Fotos: placeholders do picsum.photos (seed fixa por id).
 *   Troque o campo `foto` de cada item pela foto real.
 *   Veja o README para instruções.
 * ============================================================ */

/* Categorias de ocorrência: cor usada em todo o app */
const CATEGORIAS = {
  buraco:      { label: 'Buraco',      cor: '#F59E0B' },
  iluminacao:  { label: 'Iluminação',  cor: '#8B5CF6' },
  semaforo:    { label: 'Semáforo',    cor: '#E11D48' },
  calcada:     { label: 'Calçada',     cor: '#EA580C' },
  ciclovia:    { label: 'Ciclovia',    cor: '#06B6D4' },
  lixo:        { label: 'Lixo',        cor: '#92400E' },
  sinalizacao: { label: 'Sinalização', cor: '#3B82F6' },
};

const ORDEM_CATEGORIAS = ['buraco', 'iluminacao', 'semaforo', 'calcada', 'ciclovia', 'lixo', 'sinalizacao'];

/* Ponto de referência do bairro fictício (usado no cálculo de raio dos alertas) */
const REFERENCIA_BAIRRO = { lat: -23.561, lng: -46.65, nome: 'Jardim das Flores' };

/* Converte "quero que este item tenha acontecido às 21h15" em um
 * deslocamento de minutos a partir de agora. Garante que o filtro
 * "Só depois das 19h" sempre tenha resultados, em qualquer horário
 * em que o protótipo seja aberto. */
function minsAtrasParaHora(hora, jitter) {
  const agora = new Date();
  const minAgora = agora.getHours() * 60 + agora.getMinutes();
  const alvo = hora * 60 + (jitter || 0);
  let diff = (minAgora - alvo) % 1440;
  if (diff < 0) diff += 1440;
  return diff;
}

function isoAtras(minutos) {
  return new Date(Date.now() - minutos * 60000).toISOString();
}

/* ------------------------------------------------------------
 * OCORRÊNCIAS (12 a 15 itens)
 * status: aberta | em-analise | encaminhada | resolvida
 * foto:  placeholder do picsum.photos. Troque aqui pela real
 * ------------------------------------------------------------ */
const OCORRENCIAS = [
  {
    id: 'o1',
    categoria: 'buraco',
    titulo: 'Buraco grande na Av. das Palmeiras',
    descricao: 'Buraco com cerca de 40 cm no meio da faixa da direita, próximo ao nº 320. Os carros desviam em cima da hora e quase causaram uma colisão hoje cedo.',
    lat: -23.5585, lng: -46.6481,
    enderecoAproximado: 'Av. das Palmeiras, próximo ao nº 320',
    dataHora: isoAtras(35),
    status: 'aberta',
    confirmacoes: 12,
    indiceRisco: 78,
    foto: 'https://picsum.photos/seed/farol-1/720/480',
  },
  {
    id: 'o2',
    categoria: 'iluminacao',
    titulo: 'Poste apagado na Rua do Comércio',
    descricao: 'Poste sem luz há três dias em frente ao nº 118. A calçada fica totalmente escura depois das 19h e o ponto de ônibus fica invisível para os motoristas.',
    lat: -23.5637, lng: -46.6518,
    enderecoAproximado: 'Rua do Comércio, em frente ao nº 118',
    dataHora: isoAtras(minsAtrasParaHora(20, 35)),
    status: 'em-analise',
    confirmacoes: 5,
    indiceRisco: 45,
    foto: 'assets/rua-noite.jpg',
  },
  {
    id: 'o3',
    categoria: 'semaforo',
    titulo: 'Semáforo piscando na Av. Central',
    descricao: 'Semáforo do cruzamento com a Rua dos Ipês está no amarelo piscante desde ontem. Movimento intenso o dia todo e risco real de colisão.',
    lat: -23.5609, lng: -46.6463,
    enderecoAproximado: 'Av. Central x Rua dos Ipês',
    dataHora: isoAtras(70),
    status: 'aberta',
    confirmacoes: 21,
    indiceRisco: 82,
    foto: 'https://picsum.photos/seed/farol-3/720/480',
  },
  {
    id: 'o4',
    categoria: 'calcada',
    titulo: 'Calçada sem rampa de acesso',
    descricao: 'Trecho sem rampa e com piso irregular em frente à Rua das Acácias, 45. Pessoas em cadeira de rodas precisam descer para a rua e dividir espaço com os carros.',
    lat: -23.5652, lng: -46.653,
    enderecoAproximado: 'Rua das Acácias, 45',
    dataHora: isoAtras(3 * 1440),
    status: 'resolvida',
    confirmacoes: 8,
    indiceRisco: 35,
    foto: 'https://picsum.photos/seed/farol-4/720/480',
  },
  {
    id: 'o5',
    categoria: 'ciclovia',
    titulo: 'Ciclovia obstruída por galhos',
    descricao: 'Queda de galhos bloqueia metade da ciclovia da Av. das Palmeiras, na altura do nº 780. Ciclistas invadem a pista dos carros para desviar.',
    lat: -23.5516, lng: -46.6505,
    enderecoAproximado: 'Av. das Palmeiras, ciclovia do nº 780',
    dataHora: isoAtras(26 * 60),
    status: 'encaminhada',
    confirmacoes: 15,
    indiceRisco: 52,
    foto: 'https://picsum.photos/seed/farol-5/720/480',
  },
  {
    id: 'o6',
    categoria: 'lixo',
    titulo: 'Entulho na calçada da Rua do Comércio',
    descricao: 'Sofá velho e entulho descartados irregularmente no nº 230. Atrai insetos, bloqueia a passagem de pedestres e dificulta a drenagem da calçada.',
    lat: -23.5618, lng: -46.6521,
    enderecoAproximado: 'Rua do Comércio, 230',
    dataHora: isoAtras(6 * 60),
    status: 'aberta',
    confirmacoes: 3,
    indiceRisco: 22,
    foto: 'https://picsum.photos/seed/farol-6/720/480',
  },
  {
    id: 'o7',
    categoria: 'sinalizacao',
    titulo: 'Placa de pare caída na Rua dos Ipês',
    descricao: 'A placa de PARE da Rua dos Ipês, 90, caiu com o vento. Os motoristas não sabem quem tem a preferencial no cruzamento.',
    lat: -23.5593, lng: -46.6467,
    enderecoAproximado: 'Rua dos Ipês, 90',
    dataHora: isoAtras(4 * 60),
    status: 'encaminhada',
    confirmacoes: 9,
    indiceRisco: 41,
    foto: 'https://picsum.photos/seed/farol-7/720/480',
  },
  {
    id: 'o8',
    categoria: 'buraco',
    titulo: 'Buraco na saída da Praça das Flores',
    descricao: 'Buraco profundo na saída da praça, sentido Av. Central. Motoqueiros estão em risco: dois já relataram sustos essa semana.',
    lat: -23.5633, lng: -46.6484,
    enderecoAproximado: 'Praça das Flores, saída para a Av. Central',
    dataHora: isoAtras(20),
    status: 'aberta',
    confirmacoes: 18,
    indiceRisco: 66,
    foto: 'https://picsum.photos/seed/farol-8/720/480',
  },
  {
    id: 'o9',
    categoria: 'iluminacao',
    titulo: 'Trecho escuro na Av. Central',
    descricao: 'Quatro postes apagados em sequência entre os nº 500 e 560. A área tem ponto de ônibus e fica deserta à noite.',
    lat: -23.5645, lng: -46.6472,
    enderecoAproximado: 'Av. Central, entre os nº 500 e 560',
    dataHora: isoAtras(minsAtrasParaHora(21, 50)),
    status: 'aberta',
    confirmacoes: 27,
    indiceRisco: 88,
    foto: 'https://picsum.photos/seed/farol-9/720/480',
  },
  {
    id: 'o10',
    categoria: 'calcada',
    titulo: 'Piso tátil danificado',
    descricao: 'Faixa de piso tátil arrancada na Rua das Acácias, 210. Dificulta a orientação de pessoas com deficiência visual.',
    lat: -23.5683, lng: -46.6563,
    enderecoAproximado: 'Rua das Acácias, 210',
    dataHora: isoAtras(5 * 1440),
    status: 'resolvida',
    confirmacoes: 6,
    indiceRisco: 29,
    foto: 'https://picsum.photos/seed/farol-10/720/480',
  },
  {
    id: 'o11',
    categoria: 'ciclovia',
    titulo: 'Rachaduras na ciclovia da Av. Central',
    descricao: 'Trincas e rachaduras na ciclovia da Av. Central, altura do nº 300. Risco de queda, principalmente para patinetes e bicicletas de pneu fino.',
    lat: -23.5613, lng: -46.654,
    enderecoAproximado: 'Av. Central, ciclovia do nº 300',
    dataHora: isoAtras(8 * 60),
    status: 'em-analise',
    confirmacoes: 11,
    indiceRisco: 47,
    foto: 'https://picsum.photos/seed/farol-11/720/480',
  },
  {
    id: 'o12',
    categoria: 'lixo',
    titulo: 'Lixo acumulado na esquina',
    descricao: 'Sacos de lixo rasgados acumulados há dias na esquina da Rua do Comércio com a Rua das Acácias. Cheiro forte e presença de ratos.',
    lat: -23.5657, lng: -46.6504,
    enderecoAproximado: 'Rua do Comércio x Rua das Acácias',
    dataHora: isoAtras(minsAtrasParaHora(19, 25)),
    status: 'aberta',
    confirmacoes: 4,
    indiceRisco: 38,
    foto: 'https://picsum.photos/seed/farol-12/720/480',
  },
  {
    id: 'o13',
    categoria: 'semaforo',
    titulo: 'Semáforo de pedestres apagado',
    descricao: 'Semáforo de pedestres apagado em frente ao nº 150 da Av. das Palmeiras. A travessia de manhã, com o fluxo da escola, é perigosa.',
    lat: -23.557, lng: -46.6508,
    enderecoAproximado: 'Av. das Palmeiras, 150',
    dataHora: isoAtras(minsAtrasParaHora(22, 5)),
    status: 'em-analise',
    confirmacoes: 16,
    indiceRisco: 74,
    foto: 'https://picsum.photos/seed/farol-13/720/480',
  },
  {
    id: 'o14',
    categoria: 'buraco',
    titulo: 'Buraco coberto por poça na Rua dos Ipês',
    descricao: 'Buraco na faixa central da Rua dos Ipês, 310, escondido por uma poça d\u2019água. Impossível de ver à noite; pedras soltas na borda.',
    lat: -23.5624, lng: -46.6458,
    enderecoAproximado: 'Rua dos Ipês, 310',
    dataHora: isoAtras(minsAtrasParaHora(23, 10)),
    status: 'aberta',
    confirmacoes: 10,
    indiceRisco: 58,
    foto: 'https://picsum.photos/seed/farol-14/720/480',
  },
];

/* ------------------------------------------------------------
 * TRECHOS (6 a 8): índice de risco por período do dia
 * horarioPico: quando o trecho é mais perigoso
 * status: mapeado | encaminhado (muda pelo painel do gestor)
 * ------------------------------------------------------------ */
const TRECHOS = [
  {
    id: 't1',
    nome: 'Av. das Palmeiras (nº 100 a 400)',
    lat: -23.5603, lng: -46.6493,
    raio: 130,
    risco: { agora: 74, noite: 82, madrugada: 88 },
    horarioPico: 'Madrugada',
    status: 'mapeado',
  },
  {
    id: 't2',
    nome: 'Av. Central (nº 480 a 560)',
    lat: -23.563, lng: -46.6509,
    raio: 120,
    risco: { agora: 71, noite: 90, madrugada: 79 },
    horarioPico: 'Noite',
    status: 'mapeado',
  },
  {
    id: 't3',
    nome: 'Rua do Comércio (nº 100 a 250)',
    lat: -23.5598, lng: -46.651,
    raio: 110,
    risco: { agora: 41, noite: 58, madrugada: 63 },
    horarioPico: 'Madrugada',
    status: 'mapeado',
  },
  {
    id: 't4',
    nome: 'Praça das Flores',
    lat: -23.5599, lng: -46.6522,
    raio: 100,
    risco: { agora: 38, noite: 66, madrugada: 71 },
    horarioPico: 'Madrugada',
    status: 'mapeado',
  },
  {
    id: 't5',
    nome: 'Av. das Palmeiras (nº 700 a 900)',
    lat: -23.5587, lng: -46.6502,
    raio: 100,
    risco: { agora: 45, noite: 55, madrugada: 60 },
    horarioPico: 'Madrugada',
    status: 'mapeado',
  },
  {
    id: 't6',
    nome: 'Rua dos Ipês (nº 280 a 330)',
    lat: -23.5619, lng: -46.651,
    raio: 100,
    risco: { agora: 52, noite: 64, madrugada: 69 },
    horarioPico: 'Madrugada',
    status: 'mapeado',
  },
  {
    id: 't7',
    nome: 'Rua das Acácias (nº 40 a 220)',
    lat: -23.5612, lng: -46.6487,
    raio: 100,
    risco: { agora: 30, noite: 44, madrugada: 50 },
    horarioPico: 'Noite',
    status: 'mapeado',
  },
  {
    id: 't8',
    nome: 'Av. Central (nº 280 a 320)',
    lat: -23.5626, lng: -46.6498,
    raio: 110,
    risco: { agora: 70, noite: 76, madrugada: 81 },
    horarioPico: 'Madrugada',
    status: 'mapeado',
  },
];

/* ------------------------------------------------------------
 * ROTAS SIMULADAS: polilinhas com pontos fixos (sem serviço
 * de roteamento real). A rota segura desvia dos trechos
 * críticos; a rápida passa por dentro deles.
 * ------------------------------------------------------------ */
const ROTAS = {
  rapida: {
    pontos: [
      [-23.5572, -46.6470],
      [-23.5588, -46.6486],
      [-23.5601, -46.6494],
      [-23.5612, -46.6502],
      [-23.5624, -46.6508],
      [-23.5636, -46.6519],
      [-23.5650, -46.6538],
    ],
    distanciaKm: 4.2,
    tempoMin: 12,
    risco: { agora: 58, noite: 74, madrugada: 88 },
  },
  segura: {
    pontos: [
      [-23.5572, -46.6470],
      [-23.5579, -46.6489],
      [-23.5593, -46.6503],
      [-23.5606, -46.6517],
      [-23.5619, -46.6524],
      [-23.5634, -46.6530],
      [-23.5650, -46.6538],
    ],
    distanciaKm: 5.1,
    tempoMin: 17,
    risco: { agora: 21, noite: 27, madrugada: 33 },
  },
};

const INICIO_ROTA = { lat: -23.5572, lng: -46.647, label: 'Rua do Comércio, 120' };
const FIM_ROTA = { lat: -23.565, lng: -46.6538, label: 'Av. Central, 520' };

/* ------------------------------------------------------------
 * ANÁLISE DA IA (simulada): resultado determinístico por
 * categoria. Nenhuma IA real roda no protótipo.
 * ------------------------------------------------------------ */
const ANALISE_IA = {
  buraco:      { resumo: 'Buraco na via',        confianca: 94, risco: 62 },
  iluminacao:  { resumo: 'Ponto sem iluminação', confianca: 89, risco: 47 },
  semaforo:    { resumo: 'Semáforo inoperante',  confianca: 96, risco: 84 },
  calcada:     { resumo: 'Obstáculo na calçada', confianca: 82, risco: 31 },
  ciclovia:    { resumo: 'Ciclovia obstruída',   confianca: 87, risco: 44 },
  lixo:        { resumo: 'Acúmulo de lixo',      confianca: 93, risco: 18 },
  sinalizacao: { resumo: 'Sinalização danificada', confianca: 90, risco: 36 },
};

/* ------------------------------------------------------------
 * MOCKS DO PAINEL DO GESTOR
 * ------------------------------------------------------------ */
const MOCK_KPI = {
  tempoMedioReparoDias: 4.2,
  deltaTempoReparo: '-0,8 d vs. mês anterior',
  deltaAbertas: '+3 nas últimas 24h',
  deltaCriticos: '+1 nesta semana',
  deltaResolucao: '+5 p.p. vs. mês anterior',
};

const MOCK_SEMANAS = [
  { rotulo: '15/09', registros: 34 },
  { rotulo: '22/09', registros: 41 },
  { rotulo: '29/09', registros: 38 },
  { rotulo: '06/10', registros: 52 },
  { rotulo: '13/10', registros: 47 },
  { rotulo: '20/10', registros: 63 },
  { rotulo: '27/10', registros: 58 },
  { rotulo: '03/11', registros: 71 },
];
