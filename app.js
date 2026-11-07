(function () {
  'use strict';

  // ---------- Padrões (preços de 05/11/2026; mudam: edite em Ajustes) ----------
  var PADRAO = {
    modelos: [
      { id: 'vself6', nome: 'V Self 6L', preco: 2297, pix: 2182.15, tipo: 'gravidade', refil: 'laranja' },
      { id: 'vself10', nome: 'V Self 10L', preco: 2397, pix: 2277.15, tipo: 'gravidade', refil: 'laranja' },
      { id: 'vself6p', nome: 'V Self 6L Premium', preco: 2847, pix: 2704.65, tipo: 'gravidade', refil: 'laranja' },
      { id: 'vself10p', nome: 'V Self 10L Premium', preco: 2947, pix: 2799.65, tipo: 'gravidade', refil: 'laranja' },
      { id: 'terracota', nome: 'Terracota', preco: 3297, pix: 3132.15, tipo: 'gravidade', refil: 'laranja' },
      { id: 'duolite', nome: 'Duo Lite (sob a pia)', preco: 1097, pix: 1042.15, tipo: 'pia', refil: 'duolite' },
      { id: 'duo', nome: 'DUO (natural e gelada)', preco: 4397, pix: 4177.15, tipo: 'eletrico', refil: 'laranja' }
    ],
    refis: [
      { id: 'laranja', nome: 'Vela laranja (menos magnésio)', preco: 477, mesesRede: 6, mesesPoco: 8, litros: 1500, nota: 'Limite de 1.500 L vem do site: confirme com a franquia.' },
      { id: 'azul', nome: 'Vela azul (mais magnésio)', preco: 577, mesesRede: 6, mesesPoco: 8, litros: 1500, nota: 'Limite de 1.500 L vem do site: confirme com a franquia.' },
      { id: 'duolite', nome: 'Refil Duo Lite', preco: 887, mesesRede: 12, mesesPoco: 12, litros: 5000, nota: 'R$ 887 é o preço do site, ainda não confirmado com a franquia.' }
    ],
    entrada: {
      compraAgua: true, unidade: 'semana', quantidade: 2, tamanhoGalao: '20', litrosOutro: 20,
      precoGalao: 12, entregaGalao: 0, modelo: 'vself6', formaPagamento: 'parcelado', parcelas: 10,
      refil: 'laranja', fonte: 'rede', clienteNome: '', clienteFone: ''
    },
    vendedor: { nome: '', fone: '' }
  };
  var CHAVE = 'contaDaAgua.v1'; // mantém os ajustes já salvos no celular
  var TIPOS = { gravidade: 'Bancada, por gravidade', pia: 'Sob a pia', eletrico: 'Elétrico' };

  var estado = carregar();
  var $ = function (id) { return document.getElementById(id); };
  var C = window.Calc;

  // ---------- Armazenamento ----------
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function carregar() {
    var s = copia(PADRAO);
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (salvo) {
        if (Array.isArray(salvo.modelos) && salvo.modelos.length) s.modelos = salvo.modelos;
        if (Array.isArray(salvo.refis) && salvo.refis.length) s.refis = salvo.refis;
        if (salvo.entrada) Object.assign(s.entrada, salvo.entrada);
        if (salvo.vendedor) Object.assign(s.vendedor, salvo.vendedor);
      }
    } catch (e) { /* sem armazenamento: segue com padrões */ }
    return s;
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* ignora */ }
  }

  function modeloAtual() { return achar(estado.modelos, estado.entrada.modelo) || estado.modelos[0]; }
  function refilAtual() { return achar(estado.refis, estado.entrada.refil) || estado.refis[0]; }
  function achar(lista, id) { for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i]; return null; }
  function hojeISO() { var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  function promoDe(m) { return m.promo || (m.promo = { ativa: false, nome: 'Black Friday', refis: 0, desconto: 0, ate: '' }); }
  function promoVencida(m) { var p = promoDe(m); return !!p.ate && p.ate < hojeISO(); }
  function promoValendo(m) { var p = promoDe(m); return p.ativa && !promoVencida(m) && (p.refis > 0 || p.desconto > 0); }
  function dataBR(iso) { var a = iso.split('-'); return a[2] + '/' + a[1] + '/' + a[0]; }
  function novoId(p) { return p + Date.now().toString(36); }

  // ---------- Formatação ----------
  var fmt0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var fmt2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var num1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  function r0(v) { return fmt0.format(Math.round(v)); }
  function r2(v) { return fmt2.format(v); }
  function meses(v) {
    if (v < 1) return 'menos de 1 mês';
    var m = Math.round(v);
    var t = 'cerca de ' + m + (m === 1 ? ' mês' : ' meses');
    if (v >= 18) t += ' (' + num1.format(v / 12) + ' anos)';
    return t;
  }
  function mesAno(d) { return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); }
  function litrosTxt(v) { return num1.format(v).replace(/,0$/, '') + ' L'; }

  // ---------- Montagem inicial ----------
  function preencherSelects() {
    $('modelo').innerHTML = estado.modelos.map(function (m) {
      return '<option value="' + esc(m.id) + '">' + esc(m.nome) + '</option>';
    }).join('');
    $('refil').innerHTML = estado.refis.map(function (r) {
      return '<option value="' + esc(r.id) + '">' + esc(r.nome) + ' · ' + r0(r.preco) + '</option>';
    }).join('');
    if (!achar(estado.modelos, estado.entrada.modelo)) estado.entrada.modelo = estado.modelos[0].id;
    if (!achar(estado.refis, estado.entrada.refil)) estado.entrada.refil = estado.refis[0].id;
    $('modelo').value = estado.entrada.modelo;
    $('refil').value = estado.entrada.refil;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function preencherCampos() {
    var e = estado.entrada, m = modeloAtual(), r = refilAtual();
    $('clienteNome').value = e.clienteNome;
    $('clienteFone').value = e.clienteFone;
    $('quantidade').value = e.quantidade;
    $('tamanhoGalao').value = e.tamanhoGalao;
    $('litrosOutro').value = e.litrosOutro;
    $('precoGalao').value = e.precoGalao;
    $('entregaGalao').value = e.entregaGalao || '';
    $('precoFiltro').value = m.preco;
    $('precoPix').value = m.pix || '';
    $('parcelas').value = e.parcelas;
    var p = promoDe(m);
    $('promoAtiva').checked = p.ativa && !promoVencida(m);
    $('promoNome').value = p.nome || '';
    $('promoRefis').value = p.refis || '';
    $('promoDesconto').value = p.desconto || '';
    $('promoAte').value = p.ate || '';
    $('precoRefil').value = r.preco;
    $('mesesRefil').value = e.fonte === 'poco' ? r.mesesPoco : r.mesesRede;
    $('limiteLitros').value = r.litros || '';
    $('vendedorNome').value = estado.vendedor.nome;
    $('vendedorFone').value = estado.vendedor.fone;
  }

  // ---------- Eventos ----------
  document.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      var campo = seg.dataset.campo, v = b.dataset.valor;
      if (campo === 'compraAgua') {
        var antes = estado.entrada.compraAgua;
        estado.entrada.compraAgua = v === 'sim';
        if (antes !== estado.entrada.compraAgua) {
          // troca a unidade com sentido: quem não compra informa litros por dia
          estado.entrada.quantidade = estado.entrada.compraAgua ? 2 : 4;
          $('quantidade').value = estado.entrada.quantidade;
        }
      } else if (campo === 'unidade') {
        converterUnidade(estado.entrada.unidade, v);
        estado.entrada.unidade = v;
      } else {
        estado.entrada[campo] = v;
        if (campo === 'fonte') $('mesesRefil').value = v === 'poco' ? refilAtual().mesesPoco : refilAtual().mesesRede;
      }
      atualizar();
    });
  });

  // Ao trocar a unidade, converte o número para o cliente não ter que refazer a conta
  function converterUnidade(de, para) {
    if (de === para) return;
    var q = C.numero($('quantidade').value), L = litrosGalao();
    var litrosDia = de === 'semana' ? q * C.SEMANAS_POR_MES * L / C.DIAS_POR_MES
      : de === 'mes' ? q * L / C.DIAS_POR_MES : q;
    var novo = para === 'semana' ? litrosDia * C.DIAS_POR_MES / C.SEMANAS_POR_MES / L
      : para === 'mes' ? litrosDia * C.DIAS_POR_MES / L : litrosDia;
    novo = Math.round(novo * 10) / 10;
    $('quantidade').value = novo;
    estado.entrada.quantidade = novo;
  }

  document.querySelector('.stepper').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-passo]'); if (!b) return;
    var passo = Number(b.dataset.passo);
    var v = Math.max(0, Math.round((C.numero($('quantidade').value) + passo) * 10) / 10);
    $('quantidade').value = v;
    atualizar();
  });

  $('modelo').addEventListener('change', function () {
    estado.entrada.modelo = this.value;
    var m = modeloAtual();
    if (m.refil && achar(estado.refis, m.refil)) {
      estado.entrada.refil = m.refil;
      $('refil').value = m.refil;
    }
    preencherCampos();
    atualizar();
  });
  $('refil').addEventListener('change', function () {
    estado.entrada.refil = this.value;
    preencherCampos();
    atualizar();
  });

  // Campos do modelo e do refil gravam no cadastro (ficam salvos)
  $('precoFiltro').addEventListener('input', function () { modeloAtual().preco = C.numero(this.value); atualizar(); });
  $('precoPix').addEventListener('input', function () { modeloAtual().pix = C.numero(this.value); atualizar(); });
  $('promoAtiva').addEventListener('change', function () {
    var p = promoDe(modeloAtual());
    p.ativa = this.checked;
    if (p.ativa && promoVencida(modeloAtual())) { p.ate = ''; $('promoAte').value = ''; }
    atualizar();
  });
  $('promoNome').addEventListener('input', function () { promoDe(modeloAtual()).nome = this.value.trim(); atualizar(); });
  $('promoRefis').addEventListener('input', function () { promoDe(modeloAtual()).refis = Math.floor(C.numero(this.value)); atualizar(); });
  $('promoDesconto').addEventListener('input', function () { promoDe(modeloAtual()).desconto = C.numero(this.value); atualizar(); });
  $('promoAte').addEventListener('change', function () { promoDe(modeloAtual()).ate = this.value; preencherCampos(); atualizar(); });
  $('precoRefil').addEventListener('input', function () { refilAtual().preco = C.numero(this.value); atualizar(); });
  $('precoRefil').addEventListener('change', function () { preencherSelects(); });
  document.querySelector('.ajustes').addEventListener('toggle', function () { if (this.open) renderAjustes(); });
  $('limiteLitros').addEventListener('input', function () { refilAtual().litros = C.numero(this.value); atualizar(); });
  $('mesesRefil').addEventListener('input', function () {
    refilAtual()[estado.entrada.fonte === 'poco' ? 'mesesPoco' : 'mesesRede'] = C.numero(this.value);
    atualizar();
  });

  ['clienteNome', 'clienteFone', 'quantidade', 'tamanhoGalao', 'litrosOutro', 'precoGalao', 'entregaGalao', 'parcelas']
    .forEach(function (id) { $(id).addEventListener('input', atualizar); $(id).addEventListener('change', atualizar); });
  $('vendedorNome').addEventListener('input', function () { estado.vendedor.nome = this.value; atualizar(); });
  $('vendedorFone').addEventListener('input', function () { estado.vendedor.fone = this.value; atualizar(); });

  $('novoCliente').addEventListener('click', function () {
    estado.entrada.clienteNome = '';
    estado.entrada.clienteFone = '';
    estado.entrada.compraAgua = true;
    estado.entrada.unidade = 'semana';
    estado.entrada.quantidade = 2;
    preencherCampos();
    atualizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Pronto para o próximo cliente');
  });

  // ---------- Leitura e cálculo ----------
  function litrosGalao() {
    var t = $('tamanhoGalao').value;
    return t === 'outro' ? (C.numero($('litrosOutro').value) || 20) : Number(t);
  }

  function lerEntrada() {
    var e = estado.entrada;
    e.clienteNome = $('clienteNome').value.trim();
    e.clienteFone = $('clienteFone').value.trim();
    e.quantidade = C.numero($('quantidade').value);
    e.tamanhoGalao = $('tamanhoGalao').value;
    e.litrosOutro = C.numero($('litrosOutro').value) || 20;
    e.precoGalao = C.numero($('precoGalao').value);
    e.entregaGalao = C.numero($('entregaGalao').value);
    e.parcelas = Math.max(1, Math.round(C.numero($('parcelas').value) || 10));
    var m = modeloAtual(), r = refilAtual();
    return {
      compraAgua: e.compraAgua,
      unidade: e.unidade,
      quantidade: e.quantidade,
      litrosGalao: litrosGalao(),
      precoGalao: e.precoGalao,
      entregaGalao: e.entregaGalao,
      precoFiltro: m.preco,
      precoPix: m.pix,
      formaPagamento: e.formaPagamento,
      parcelas: e.parcelas,
      tipoFiltro: m.tipo,
      precoRefil: r.preco,
      mesesRefil: C.numero($('mesesRefil').value),
      limiteLitros: r.litros,
      fonte: e.fonte,
      promoRefis: promoValendo(m) ? promoDe(m).refis : 0,
      promoDesconto: promoValendo(m) ? promoDe(m).desconto : 0
    };
  }

  var ultimo = null;
  function atualizar() {
    var ent = lerEntrada();
    var res = C.calcular(ent);
    ultimo = { ent: ent, res: res };
    renderControles();
    renderResultado(ent, res);
    renderFluxo(ent, res);
    renderGrafico(ent, res);
    $('textoResumo').value = textoResumo(ent, res);
    salvar();
  }

  // ---------- Render ----------
  function renderControles() {
    var e = estado.entrada;
    document.querySelectorAll('.seg').forEach(function (seg) {
      var atual = seg.dataset.campo === 'compraAgua' ? (e.compraAgua ? 'sim' : 'nao') : e[seg.dataset.campo];
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.valor === atual)); });
    });
    $('blocoCompra').hidden = !e.compraAgua;
    $('blocoGalao').hidden = !e.compraAgua;
    $('campoLitrosOutro').hidden = $('tamanhoGalao').value !== 'outro';
    $('campoParcelas').hidden = e.formaPagamento === 'pix';

    var rot, dica;
    if (!e.compraAgua) { rot = 'Litros de água por dia na casa'; dica = 'Serve para calcular quando trocar a vela. Referência geral: 2 a 3 L por pessoa.'; }
    else if (e.unidade === 'mes') { rot = 'Galões por mês'; dica = ''; }
    else if (e.unidade === 'litrosDia') { rot = 'Litros por dia'; dica = ''; }
    else { rot = 'Galões por semana'; dica = ''; }
    $('rotuloQtd').textContent = rot;
    if (e.compraAgua && ultimo) {
      var r = ultimo.res;
      dica = 'Dá ' + num1.format(r.galoesMes) + ' unidades e ' + litrosTxt(r.litrosMes) + ' por mês (' + litrosTxt(r.litrosDia) + ' por dia).';
    }
    $('dicaQtd').textContent = dica;

    var m = modeloAtual();
    $('dicaPix').textContent = m.pix && m.pix < m.preco ? 'Pix com ' + r0(m.preco - m.pix) + ' de desconto. Confira o valor na hora.' : '';

    var p = promoDe(m);
    $('campoPromo').hidden = !$('promoAtiva').checked && !(p.ativa && promoVencida(m));
    $('dicaPromo').textContent = promoVencida(m) ? 'A promoção acabou em ' + dataBR(p.ate) + '. Marque de novo para reativar.'
      : p.ate ? 'Vale até ' + dataBR(p.ate) + '. Depois, desliga sozinha.'
      : 'Fica guardada só neste modelo. Desligue quando a promoção acabar.';

    var nota = refilAtual().nota;
    $('avisoRefil').hidden = !nota;
    $('avisoRefil').textContent = nota || '';
  }

  function item(rot, valor, sub) {
    return '<div><dt>' + rot + '</dt><dd>' + valor + (sub ? '<small>' + sub + '</small>' : '') + '</dd></div>';
  }

  function renderResultado(ent, r) {
    var d = $('destaque'), barra = $('barra');
    if (r.temEconomia) {
      d.className = 'destaque bom';
      d.innerHTML = seloPromo() + '<div class="grande">Economia de ' + r0(r.economiaMes) + ' por mês</div>' +
        '<div class="sub">' + r0(r.economiaAno) + ' por ano · retorno do aparelho em ' + meses(r.retornoMeses) + '</div>';
      barra.className = 'barra bom';
      barra.textContent = 'Economia de ' + r0(r.economiaMes) + '/mês · retorno em ' + meses(r.retornoMeses).replace('cerca de ', '~');
    } else {
      d.className = 'destaque neutro';
      var linha = ent.compraAgua
        ? 'Comparado ao galão, custa ' + r0(r.custoNovoMes) + ' a mais por mês.'
        : 'Hoje não há gasto com água comprada para comparar.';
      d.innerHTML = seloPromo() + '<div class="grande">Custo novo de ' + r2(Math.max(r.custoNovoDia, 0)) + ' por dia</div>' +
        '<div class="sub">' + linha + ' No 1º ano, contando o aparelho: ' + r2(r.custoPrimeiroAnoDia) + ' por dia.</div>';
      barra.className = 'barra neutro';
      barra.textContent = 'Custo novo de ' + r2(Math.max(r.custoNovoDia, 0)) + ' por dia';
    }

    var troca = 'troca a cada ' + num1.format(r.mesesEfetivos) + ' meses' + (r.trocaPorLitros ? ' (pelo limite de litros)' : '');
    var h = '';
    if (ent.compraAgua) h += item('Galão por mês', r0(r.galaoMes), r0(r.galaoAno) + ' por ano');
    h += item('Refil por mês', r0(r.refilMes), r2(r.refilDia) + ' por dia · ' + troca);
    if (r.temEconomia) {
      h += item('Economia', r0(r.economiaMes) + ' /mês', r0(r.economiaAno) + ' por ano');
      h += item('Retorno', meses(r.retornoMeses).replace('cerca de ', '~').replace(/ \(.*\)/, ''), (r.retornoMeses >= 18 ? num1.format(r.retornoMeses / 12) + ' anos · ' : '') + 'preço ' + (ent.formaPagamento === 'pix' ? 'no Pix ' : '') + r0(r.precoFiltro) + (r.valorBrinde ? ' − brinde ' + r0(r.valorBrinde) : ''));
    } else {
      h += item('Aparelho', r0(r.precoFiltro), ent.formaPagamento === 'pix' ? 'no Pix' : r.parcelas + 'x de ' + r2(r.valorParcela));
    }
    if (r.refisGratis || r.promoDesconto) h += item('Promoção', textoPromoCurto(r), r.refisGratis ? (r.refisGratis > 1 ? 'as ' + r.refisGratis + ' primeiras trocas saem' : 'a primeira troca sai') + ' sem custo' : 'já descontado no preço');
    h += item('Próxima troca de refil', mesAno(r.proximaTroca), 'a primeira vela já vem no aparelho');
    $('grade').innerHTML = h;

    var av = [];
    if (r.avisoPoco) av.push(textoPoco());
    if (r.avisoVazao) av.push('Consumo de ' + litrosTxt(r.litrosDia) + ' por dia. O modelo por gravidade filtra cerca de 2 L por hora e pode não dar conta. Veja o Duo Lite ou o DUO.');
    if (r.temEconomia && r.retornoMeses > 36) av.push('Retorno longo. Para esta casa, a conversa forte é praticidade: não carregar galão e não ficar sem água.');
    if (!r.temEconomia && ent.compraAgua) av.push('Com este consumo o refil sai mais caro que o galão. Mostre a praticidade, não a conta.');
    $('avisos').innerHTML = av.map(function (t) { return '<p class="aviso">' + esc(t) + '</p>'; }).join('');
  }

  function seloPromo() {
    var m = modeloAtual();
    return promoValendo(m) ? '<span class="selo">🎁 ' + esc(promoDe(m).nome || 'Promoção') + '</span>' : '';
  }
  function textoPromoCurto(r) {
    var t = [];
    if (r.refisGratis) t.push(r.refisGratis + (r.refisGratis > 1 ? ' refis' : ' refil') + ' de brinde (' + r0(r.valorBrinde) + ')');
    if (r.promoDesconto) t.push(r0(r.promoDesconto) + ' de desconto');
    return t.join(' + ');
  }

  function renderFluxo(ent, r) {
    var h = '';
    if (ent.compraAgua) h += linhaFluxo('Hoje, com galão', r0(r.galaoMes) + '/mês');
    if (ent.formaPagamento === 'pix') {
      h += linhaFluxo('Filtro no Pix', r0(r.precoFiltro) + ' uma vez');
      h += linhaFluxo('Depois, só o refil', '≈ ' + r0(r.depoisParcelasMes) + '/mês');
    } else {
      h += linhaFluxo('Nas ' + r.parcelas + ' parcelas (parcela + refil)', '≈ ' + r0(r.duranteParcelasMes) + '/mês');
      h += linhaFluxo('Depois das parcelas (só refil)', '≈ ' + r0(r.depoisParcelasMes) + '/mês');
    }
    if (ent.compraAgua && ent.formaPagamento !== 'pix') {
      var dif = r.duranteParcelasMes - r.galaoMes;
      h += '<p class="dica" style="margin:8px 0 0">' + (dif > 0
        ? 'Durante as parcelas, sai ' + r0(dif) + ' a mais por mês do que o galão.'
        : 'Durante as parcelas, já sai ' + r0(-dif) + ' a menos por mês do que o galão.') + '</p>';
    }
    $('fluxo').innerHTML = h;
  }
  function textoPoco() {
    var rf = refilAtual();
    var prazo = rf.mesesPoco > rf.mesesRede ? 'o refil pode ir até ' + num1.format(rf.mesesPoco) + ' meses, mas ' : '';
    return 'Com água de poço ou mina, ' + prazo + 'alcalinidade, magnésio, potássio e cálcio podem começar a cair no fim do prazo.';
  }
  function linhaFluxo(a, b) { return '<div class="fluxo-linha"><span>' + a + '</span><strong>' + b + '</strong></div>'; }

  function renderGrafico(ent, r) {
    var W = 340, H = 200, pl = 50, pr = 12, pt = 12, pb = 28;
    var g = r.serieGalao, f = r.serieFiltro;
    var max = Math.max.apply(null, f.concat(ent.compraAgua ? g : [])) || 1;
    var passo = escala(max);
    max = Math.ceil(max / passo) * passo;
    var x = function (m) { return pl + (W - pl - pr) * m / 36; };
    var y = function (v) { return pt + (H - pt - pb) * (1 - v / max); };
    var cs = getComputedStyle(document.documentElement);
    var cG = cs.getPropertyValue('--linha-galao').trim(), cF = cs.getPropertyValue('--linha-filtro').trim();
    var cB = cs.getPropertyValue('--borda').trim(), cS = cs.getPropertyValue('--suave').trim();

    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gasto acumulado em 36 meses">';
    for (var v = 0; v <= max; v += passo) {
      s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="' + cB + '" stroke-width="1"/>';
      s += '<text x="' + (pl - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="' + cS + '">' + curto(v) + '</text>';
    }
    [[0, 'hoje'], [12, '1 ano'], [24, '2 anos'], [36, '3 anos']].forEach(function (t) {
      s += '<text x="' + x(t[0]) + '" y="' + (H - 8) + '" text-anchor="' + (t[0] === 0 ? 'start' : t[0] === 36 ? 'end' : 'middle') + '" font-size="11" fill="' + cS + '">' + t[1] + '</text>';
    });
    var caminho = function (serie, degrau) {
      var p = 'M' + x(0) + ' ' + y(serie[0]);
      for (var m = 1; m < serie.length; m++) {
        if (degrau) p += ' L' + x(m) + ' ' + y(serie[m - 1]);
        p += ' L' + x(m) + ' ' + y(serie[m]);
      }
      return p;
    };
    if (ent.compraAgua) s += '<path d="' + caminho(g, false) + '" fill="none" stroke="' + cG + '" stroke-width="3" stroke-linejoin="round"/>';
    s += '<path d="' + caminho(f, true) + '" fill="none" stroke="' + cF + '" stroke-width="3" stroke-linejoin="round"/>';
    s += '</svg>';

    var leg = '<div class="legenda">' +
      (ent.compraAgua ? '<span style="color:' + cG + '">Galão: ' + r0(g[36]) + '</span>' : '') +
      '<span style="color:' + cF + '">Filtro + refis: ' + r0(f[36]) + '</span></div>';
    $('grafico').className = 'grafico';
    $('grafico').innerHTML = leg + s;
  }
  function escala(max) {
    var bruto = max / 4, p = Math.pow(10, Math.floor(Math.log10(bruto))), n = bruto / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }
  function curto(v) { return v >= 1000 ? 'R$ ' + num1.format(v / 1000) + ' mil' : 'R$ ' + Math.round(v); }

  // ---------- Resumo para WhatsApp ----------
  function textoResumo(ent, r) {
    var e = estado.entrada, m = modeloAtual(), rf = refilAtual();
    var L = [];
    L.push('Olá' + (e.clienteNome ? ', ' + e.clienteNome : '') + '! Segue a conta que fizemos da água:');
    L.push('');
    if (ent.compraAgua) {
      var nomeUn = ent.litrosGalao < 5 ? ['garrafa', 'garrafas'] : ['galão', 'galões'];
      var un = ent.unidade === 'litrosDia' ? litrosTxt(ent.quantidade) + ' por dia, em ' + nomeUn[1]
        : num1.format(ent.quantidade) + ' ' + nomeUn[ent.quantidade === 1 ? 0 : 1] + (ent.unidade === 'mes' ? ' por mês' : ' por semana');
      L.push('💧 Hoje: ' + un + ' de ' + litrosTxt(ent.litrosGalao) + ' a ' + r2(ent.precoGalao + ent.entregaGalao) + ' cada = ' + r0(r.galaoMes) + ' por mês (' + r0(r.galaoAno) + ' por ano).');
    } else {
      L.push('💧 Consumo considerado: ' + litrosTxt(ent.quantidade) + ' por dia.');
    }
    var de = r.promoDesconto ? 'de ' + r0(r.precoBase) + ' por ' : '';
    var pixPromo = m.pix && m.pix < m.preco ? Math.max(0, m.pix - r.promoDesconto) : 0;
    var pg = ent.formaPagamento === 'pix'
      ? de + r0(r.precoFiltro) + ' no Pix'
      : de + r0(r.precoFiltro) + ' em ' + r.parcelas + 'x de ' + r2(r.valorParcela) + (pixPromo ? ' (ou ' + r2(pixPromo) + ' no Pix)' : '');
    L.push('🔹 Filtro ' + m.nome + ': ' + pg + '.');
    if (promoValendo(m)) {
      var pr = promoDe(m), brinde = [];
      if (r.refisGratis) brinde.push('ganha ' + r.refisGratis + (r.refisGratis > 1 ? ' refis' : ' refil') + ' de brinde (equivale a ' + r0(r.valorBrinde) + ')');
      if (r.promoDesconto) brinde.push(r0(r.promoDesconto) + ' de desconto no aparelho');
      L.push('🎁 Promoção ' + (pr.nome || '') + ': ' + brinde.join(' e ') + (pr.ate ? ', válida até ' + dataBR(pr.ate) : '') + '.');
    }
    L.push('🔹 Refil: ' + rf.nome + ', ' + r0(rf.preco) + ', troca a cada ' + num1.format(r.mesesEfetivos) + ' meses. Dá cerca de ' + r0(r.refilMes) + ' por mês (' + r2(r.refilDia) + ' por dia).');
    L.push('');
    if (r.temEconomia) {
      L.push('✅ Economia estimada: ' + r0(r.economiaMes) + ' por mês, ' + r0(r.economiaAno) + ' por ano.');
      L.push('⏱️ Retorno do aparelho em ' + meses(r.retornoMeses) + (r.valorBrinde ? ', já contando o refil de brinde' : '') + '.');
    } else if (ent.compraAgua) {
      L.push('Comparando com o galão, o filtro é um custo novo de cerca de ' + r2(Math.max(r.custoNovoDia, 0)) + ' por dia (no 1º ano, contando o aparelho, ' + r2(r.custoPrimeiroAnoDia) + ' por dia).');
    } else {
      L.push('O filtro é um custo novo: no 1º ano, contando o aparelho, cerca de ' + r2(r.custoPrimeiroAnoDia) + ' por dia. Nos anos seguintes, só o refil: ' + r2(r.refilDia) + ' por dia.');
    }
    if (ent.formaPagamento !== 'pix' && ent.compraAgua) {
      L.push('📆 Nas parcelas: parcela + refil ≈ ' + r0(r.duranteParcelasMes) + ' por mês. Depois, só o refil ≈ ' + r0(r.depoisParcelasMes) + ' por mês.');
    }
    L.push('');
    L.push('Além da conta: não precisa carregar galão, não fica sem água e não guarda plástico em casa.');
    L.push('📅 Primeira troca de refil prevista: ' + mesAno(r.proximaTroca) + '. Eu te aviso antes.');
    if (r.avisoPoco) L.push('ℹ️ ' + textoPoco());
    L.push('');
    L.push('Valores estimados com os números que você me passou. Preços podem mudar: confirmo tudo na hora de fechar.');
    var v = estado.vendedor;
    if (v.nome || v.fone) L.push((v.nome || '') + (v.nome && v.fone ? ' · ' : '') + (v.fone || ''));
    return L.join('\n');
  }

  $('btnZap').addEventListener('click', function () {
    var txt = $('textoResumo').value;
    var fone = estado.entrada.clienteFone.replace(/\D/g, '');
    if (fone && fone.length <= 11) fone = '55' + fone;
    var url = 'https://wa.me/' + (fone || '') + '?text=' + encodeURIComponent(txt);
    window.open(url, '_blank');
  });
  $('btnCopiar').addEventListener('click', function () {
    var txt = $('textoResumo').value;
    var ok = function () { toast('Texto copiado'); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, copiarAntigo);
    else copiarAntigo();
    function copiarAntigo() { var t = $('textoResumo'); t.removeAttribute('readonly'); t.select(); try { document.execCommand('copy'); ok(); } catch (e) {} t.setAttribute('readonly', ''); }
  });

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1800);
  }

  // ---------- Ajustes ----------
  function renderAjustes() {
    $('listaModelos').innerHTML = estado.modelos.map(function (m, i) {
      return '<div class="item-ajuste" data-i="' + i + '">' +
        '<label>Nome<input data-k="nome" value="' + esc(m.nome) + '"></label>' +
        '<div class="linha2"><label>Preço (R$)<input data-k="preco" type="number" inputmode="decimal" step="any" value="' + m.preco + '"></label>' +
        '<label>Pix (R$)<input data-k="pix" type="number" inputmode="decimal" step="any" value="' + (m.pix || '') + '"></label></div>' +
        '<div class="linha2"><label>Tipo<select data-k="tipo">' + Object.keys(TIPOS).map(function (k) {
          return '<option value="' + k + '"' + (m.tipo === k ? ' selected' : '') + '>' + TIPOS[k] + '</option>';
        }).join('') + '</select></label>' +
        '<label>Refil padrão<select data-k="refil">' + estado.refis.map(function (r) {
          return '<option value="' + esc(r.id) + '"' + (m.refil === r.id ? ' selected' : '') + '>' + esc(r.nome) + '</option>';
        }).join('') + '</select></label></div>' +
        (estado.modelos.length > 1 ? '<button type="button" class="remover" data-remover="modelos">Remover modelo</button>' : '') +
        '</div>';
    }).join('');
    $('listaRefis').innerHTML = estado.refis.map(function (r, i) {
      return '<div class="item-ajuste" data-i="' + i + '">' +
        '<label>Nome<input data-k="nome" value="' + esc(r.nome) + '"></label>' +
        '<div class="linha2"><label>Preço (R$)<input data-k="preco" type="number" inputmode="decimal" step="any" value="' + r.preco + '"></label>' +
        '<label>Limite (litros)<input data-k="litros" type="number" inputmode="decimal" step="any" value="' + (r.litros || '') + '"></label></div>' +
        '<div class="linha2"><label>Meses na rede<input data-k="mesesRede" type="number" inputmode="decimal" step="any" value="' + r.mesesRede + '"></label>' +
        '<label>Meses no poço<input data-k="mesesPoco" type="number" inputmode="decimal" step="any" value="' + r.mesesPoco + '"></label></div>' +
        (estado.refis.length > 1 ? '<button type="button" class="remover" data-remover="refis">Remover refil</button>' : '') +
        '</div>';
    }).join('');
  }
  function ligarLista(id, lista) {
    $(id).addEventListener('change', function (ev) {
      var el = ev.target, box = el.closest('.item-ajuste'); if (!box || !el.dataset.k) return;
      var obj = estado[lista][Number(box.dataset.i)];
      obj[el.dataset.k] = el.type === 'number' ? C.numero(el.value) : el.value;
      if (lista === 'refis') delete obj.nota;
      recarregarTudo(false);
    });
    $(id).addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-remover]'); if (!b) return;
      var box = b.closest('.item-ajuste');
      estado[lista].splice(Number(box.dataset.i), 1);
      recarregarTudo(true);
    });
  }
  ligarLista('listaModelos', 'modelos');
  ligarLista('listaRefis', 'refis');
  $('addModelo').addEventListener('click', function () {
    estado.modelos.push({ id: novoId('m'), nome: 'Novo modelo', preco: 0, pix: 0, tipo: 'gravidade', refil: estado.refis[0].id });
    recarregarTudo(true);
  });
  $('addRefil').addEventListener('click', function () {
    estado.refis.push({ id: novoId('r'), nome: 'Novo refil', preco: 0, mesesRede: 6, mesesPoco: 8, litros: 1500 });
    recarregarTudo(true);
  });
  $('restaurar').addEventListener('click', function () {
    if (!confirm('Voltar modelos, refis e preços aos valores padrão?')) return;
    estado.modelos = copia(PADRAO.modelos);
    estado.refis = copia(PADRAO.refis);
    estado.entrada.precoGalao = PADRAO.entrada.precoGalao;
    recarregarTudo(true);
    toast('Preços padrão restaurados');
  });
  function recarregarTudo(reAjustes) {
    preencherSelects();
    preencherCampos();
    if (reAjustes) renderAjustes();
    atualizar();
  }

  // ---------- Início ----------
  preencherSelects();
  preencherCampos();
  renderAjustes();
  atualizar();
  atualizar(); // 2ª vez para a dica de consumo usar o resultado

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
