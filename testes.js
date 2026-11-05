// Testes da conta. Rode com: node app-calculadora/testes.js
const { calcular } = require('./calc.js');

const base = { compraAgua: true, unidade: 'semana', litrosGalao: 20, precoGalao: 12, entregaGalao: 0, fonte: 'rede', formaPagamento: 'parcelado', parcelas: 10 };
const vself = { precoFiltro: 2297, tipoFiltro: 'gravidade', precoRefil: 477, mesesRefil: 6, limiteLitros: 1500 };
const duoLite = { precoFiltro: 1097, tipoFiltro: 'pia', precoRefil: 887, mesesRefil: 12, limiteLitros: 5000 };

let falhas = 0;
function perto(rotulo, valor, esperado, tol) {
  const ok = Math.abs(valor - esperado) <= tol;
  if (!ok) falhas++;
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${rotulo}: ${valor.toFixed(1)} (esperado ~${esperado})`);
}

const casos = [
  { g: 2, galao: 104, vs: { eco: 24, ret: 94 }, dl: { eco: 30, ret: 36 } },
  { g: 3, galao: 156, vs: { refil: 83, eco: 73, ret: 31 }, dl: { eco: 82, ret: 13 } },
  { g: 10, galao: 520, vs: { eco: 244, ret: 9 }, dl: { eco: 366, ret: 3 } },
];

for (const c of casos) {
  const a = calcular({ ...base, ...vself, quantidade: c.g });
  const b = calcular({ ...base, ...duoLite, quantidade: c.g });
  perto(`${c.g} gal/sem galão/mês`, a.galaoMes, c.galao, 1);
  if (c.vs.refil) perto(`${c.g} gal/sem V Self refil/mês`, a.refilMes, c.vs.refil, 1);
  perto(`${c.g} gal/sem V Self economia`, a.economiaMes, c.vs.eco, 1);
  perto(`${c.g} gal/sem V Self retorno`, a.retornoMeses, c.vs.ret, 1);
  perto(`${c.g} gal/sem Duo Lite economia`, b.economiaMes, c.dl.eco, 1);
  perto(`${c.g} gal/sem Duo Lite retorno`, b.retornoMeses, c.dl.ret, 1);
}

const um = calcular({ ...base, ...vself, quantidade: 1 });
const okUm = !um.temEconomia && um.retornoMeses === null && um.custoNovoDia > 0;
if (!okUm) falhas++;
console.log(`${okUm ? 'OK  ' : 'FALHA'} 1 gal/sem mostra custo novo: R$ ${um.custoNovoDia.toFixed(2)}/dia`);

const nao = calcular({ ...base, ...vself, compraAgua: false, quantidade: 4 });
const okNao = !nao.temEconomia && nao.galaoMes === 0;
if (!okNao) falhas++;
console.log(`${okNao ? 'OK  ' : 'FALHA'} não compra água: 1º ano R$ ${nao.custoPrimeiroAnoDia.toFixed(2)}/dia (CLAUDE.md: ~R$ 7,60)`);

console.log(falhas ? `\n${falhas} falha(s)` : '\nTodos os casos batem.');
process.exit(falhas ? 1 : 0);
