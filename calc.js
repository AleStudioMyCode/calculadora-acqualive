/* Conta galão x filtro. Sem dependências: roda no navegador e no Node (testes). */
(function (root) {
  'use strict';

  var SEMANAS_POR_MES = 4.33;
  var DIAS_POR_MES = 30.4;
  var VAZAO_GRAVIDADE_L_DIA = 24; // ~2 L/hora em 12 horas de uso

  /**
   * e = {
   *   compraAgua: bool,
   *   unidade: 'semana' | 'mes' | 'litrosDia',
   *   quantidade: número (galões por semana/mês ou litros por dia),
   *   litrosGalao, precoGalao, entregaGalao,
   *   precoFiltro, precoPix, formaPagamento: 'parcelado' | 'pix', parcelas,
   *   tipoFiltro: 'gravidade' | 'eletrico' | 'pia',
   *   precoRefil, mesesRefil, limiteLitros,
   *   fonte: 'rede' | 'poco'
   * }
   */
  function calcular(e) {
    var litrosGalao = pos(e.litrosGalao) || 20;
    var qtd = pos(e.quantidade);
    var galoesMes, litrosMes;

    if (!e.compraAgua) {
      litrosMes = qtd * DIAS_POR_MES; // aqui quantidade = litros por dia
      galoesMes = 0;
    } else if (e.unidade === 'mes') {
      galoesMes = qtd;
      litrosMes = galoesMes * litrosGalao;
    } else if (e.unidade === 'litrosDia') {
      litrosMes = qtd * DIAS_POR_MES;
      galoesMes = litrosMes / litrosGalao;
    } else {
      galoesMes = qtd * SEMANAS_POR_MES;
      litrosMes = galoesMes * litrosGalao;
    }

    var custoGalaoUn = pos(e.precoGalao) + pos(e.entregaGalao);
    var galaoMes = e.compraAgua ? galoesMes * custoGalaoUn : 0;

    var mesesRefil = pos(e.mesesRefil) || 6;
    var limite = pos(e.limiteLitros);
    var mesesAteLimite = (limite > 0 && litrosMes > 0) ? limite / litrosMes : Infinity;
    var mesesEfetivos = Math.min(mesesRefil, mesesAteLimite);
    var trocaPorLitros = mesesAteLimite < mesesRefil;
    var refilMes = pos(e.precoRefil) / mesesEfetivos;

    var precoFiltro = e.formaPagamento === 'pix' && pos(e.precoPix) > 0 ? pos(e.precoPix) : pos(e.precoFiltro);
    var parcelas = e.formaPagamento === 'pix' ? 1 : Math.max(1, Math.round(pos(e.parcelas) || 10));
    var valorParcela = precoFiltro / parcelas;

    var economiaMes = galaoMes - refilMes;
    var temEconomia = e.compraAgua && economiaMes > 0.005;
    var retornoMeses = temEconomia ? precoFiltro / economiaMes : null;

    // Custo novo (quando não há economia): diferença de todo mês, e o 1º ano contando o aparelho
    var custoNovoMes = temEconomia ? 0 : refilMes - galaoMes;
    var custoNovoDia = custoNovoMes / DIAS_POR_MES;
    // O aparelho já vem com a primeira vela: no 1º ano entram só as trocas.
    var trocasAte = function (mes) { return Math.max(0, Math.ceil(mes / mesesEfetivos - 1e-9) - 1); };
    var trocasPrimeiroAno = trocasAte(12);
    var custoPrimeiroAnoDia = (precoFiltro + trocasPrimeiroAno * pos(e.precoRefil) - 12 * galaoMes) / 365;

    // Gasto acumulado em 36 meses (fluxo de caixa)
    var serieGalao = [], serieFiltro = [];
    for (var m = 0; m <= 36; m++) {
      serieGalao.push(galaoMes * m);
      var pago = e.formaPagamento === 'pix' ? precoFiltro : valorParcela * Math.min(m, parcelas);
      // trocas feitas até o mês m (a vela que vem no aparelho não conta)
      var trocas = Math.floor(m / mesesEfetivos + 1e-9);
      serieFiltro.push(pago + trocas * pos(e.precoRefil));
    }

    var proximaTroca = new Date();
    proximaTroca.setDate(proximaTroca.getDate() + Math.round(mesesEfetivos * DIAS_POR_MES));

    return {
      galoesMes: galoesMes,
      litrosMes: litrosMes,
      litrosDia: litrosMes / DIAS_POR_MES,
      galaoMes: galaoMes,
      galaoAno: galaoMes * 12,
      refilMes: refilMes,
      refilDia: refilMes / DIAS_POR_MES,
      mesesEfetivos: mesesEfetivos,
      trocaPorLitros: trocaPorLitros,
      precoFiltro: precoFiltro,
      parcelas: parcelas,
      valorParcela: valorParcela,
      pixDesconto: pos(e.precoFiltro) - (pos(e.precoPix) || pos(e.precoFiltro)),
      temEconomia: temEconomia,
      economiaMes: temEconomia ? economiaMes : 0,
      economiaAno: temEconomia ? economiaMes * 12 : 0,
      retornoMeses: retornoMeses,
      custoNovoMes: custoNovoMes,
      custoNovoDia: custoNovoDia,
      custoPrimeiroAnoDia: custoPrimeiroAnoDia,
      trocasPrimeiroAno: trocasPrimeiroAno,
      duranteParcelasMes: (e.formaPagamento === 'pix' ? 0 : valorParcela) + refilMes,
      depoisParcelasMes: refilMes,
      serieGalao: serieGalao,
      serieFiltro: serieFiltro,
      avisoVazao: e.tipoFiltro === 'gravidade' && litrosMes / DIAS_POR_MES > VAZAO_GRAVIDADE_L_DIA,
      avisoPoco: e.fonte === 'poco',
      proximaTroca: proximaTroca
    };
  }

  function pos(v) {
    var n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return isFinite(n) && n > 0 ? n : 0;
  }

  var api = { calcular: calcular, numero: pos, SEMANAS_POR_MES: SEMANAS_POR_MES, DIAS_POR_MES: DIAS_POR_MES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Calc = api;
})(this);
