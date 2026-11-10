# Conversor de Moedas

Aplicativo mobile simples de conversão de moedas feito em **React Native + JavaScript (Expo)**, seguindo o padrão **MVVM**. Usa a API Frankfurter para consultar as moedas disponíveis e taxas de referência, sem chave de API.

## Requisitos

- Node.js compatível com o Expo SDK 54 (recomendado Node.js 20.19+ ou 22).
- npm, internet e Expo Go no celular ou emulador Android/iOS compatível.

## Como executar

Abra a pasta `ConversorMoedas` no VS Code e execute no terminal:

```bash
npm install
npm start
```

Depois, escaneie o QR code com o **Expo Go** (celular e computador na mesma rede). Para um emulador Android aberto, pressione `a` no terminal do Expo. Em caso de problemas de rede, tente `npx expo start --tunnel` (pode exigir dependência adicional para o túnel).

## Como usar

1. Digite um valor positivo, por exemplo `100`, `100,50` ou `100.50`.
2. Toque nos campos **De** e **Para** para escolher moedas disponíveis na API.
3. Toque em **Converter**.
4. Veja o valor convertido, a taxa utilizada e a data de referência.

O campo admite até duas casas decimais. Não use separadores de milhar; digite `1000,50`, e não `1.000,50`. As moedas de origem e destino precisam ser diferentes.

A Frankfurter fornece **taxas de referência**, não cotações comerciais em tempo real. Os resultados dependem da API e da conexão com a internet.

## Observações para avaliação

A aplicação está preparada para os requisitos obrigatórios do roteiro: moedas dinâmicas, taxa da API, data de referência, validação de entradas, estados de carregamento/erro, nova tentativa, valores formatados e separação MVVM. A publicação no GitHub e as capturas reais da execução precisam ser feitas após rodar a aplicação em um dispositivo.

# Capturas de tela para a entrega


1. `capturas/01-tela-inicial.png` — Tela inicial com os seletores preenchidos pela API.
2. `capturas/02-conversao-concluida.png` — Resultado válido, mostrando valor original, convertido, taxa e data.
3. `capturas/03-validacao.png` — Mensagem ao tentar converter com valor igual a zero ou moedas iguais.
4. `capturas\04-selecao-moedas.png` — Lista de moedas aberta, exibindo opções retornadas pela API.
