
export function validarValor(texto) {
  const entrada = typeof texto === 'string' ? texto.trim() : '';

  if (!entrada) {
    return { erro: 'Informe um valor para converter.' };
  }

  if (!/^\d+(?:[.,]\d{1,2})?$/.test(entrada)) {
    return {
      erro: 'Digite um número válido, como 100,50, sem separador de milhares.',
    };
  }

  const valor = Number(entrada.replace(',', '.'));

  if (!Number.isFinite(valor) || valor <= 0) {
    return { erro: 'O valor deve ser maior que zero.' };
  }

  return { valor };
}
