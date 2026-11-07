# Calculadora de Consumo Acqualive

Este app compara o gasto com galão e o custo de ter um filtro. Funciona no celular, sem internet, depois de aberto uma vez.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html`, `styles.css`, `app.js` | A tela do app |
| `calc.js` | A conta, separada para poder testar |
| `sw.js`, `manifest.webmanifest`, `icones/` | O que transforma a página em app instalável e offline |
| `testes.js` | Confere os casos de referência. Rode com `node app-calculadora/testes.js` |
| `vercel.json` | Cabeçalhos de segurança do site (bloqueia scripts de fora e o app dentro de outros sites) |

## Para instalar no celular

Para virar app instalável, a página precisa estar num endereço `https`. Opções gratuitas:
- **Netlify Drop** (app.netlify.com/drop): arraste a pasta `app-calculadora` e o site gera um link.
- **GitHub Pages:** publique a pasta num repositório.

No celular, abra o link no Chrome e toque em **⋮ → Adicionar à tela inicial** (ou **Instalar app**). Depois disso, o app abre sem internet.

## Trocar cores

Mude só as variáveis no topo de `styles.css` (`--primaria`, `--agua` etc.). Quando a franquia mandar o manual da marca, a troca é ali.

## Publicar uma versão nova

Depois de alterar qualquer arquivo, mude `VERSAO` em `sw.js` (por exemplo, `calculadora-al-v3`). Assim os celulares recebem a versão nova.

## Dados que ainda dependem da franquia

- O limite de 1.500 L por vela vem do site.
- O refil do Duo Lite a R$ 887 é preço do site.
- O desconto no Pix é escolhido na tela (5%, 10% ou 15%). O padrão é 5%, como no site.

Todos esses valores são editáveis na tela ou em **Ajustes**.
